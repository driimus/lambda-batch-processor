import type {
  Context,
  DynamoDBBatchResponse,
  DynamoDBStreamEvent,
  KinesisStreamBatchResponse,
  KinesisStreamEvent,
  SQSBatchResponse,
  SQSEvent,
} from 'aws-lambda';

import { BatchProcessingError } from '../errors';
import type { PermanentFailure, PermanentFailureHandler } from '../nonRetryableErrorHandlers';
import { DefaultPermanentFailureHandler } from '../nonRetryableErrorHandlers';
import type { EntryType } from '../types';

interface LogFunction {
  (object: object | unknown, message?: string): void;
  (message: string): void;
}

interface Logger {
  info: LogFunction;
  error: LogFunction;
}

type Config<TEvent extends BatchEvent> = {
  /**
   * Handler for processing each batch entry
   */
  handler: RecordProcessor<TEvent>;
  logger?: Logger;
  suppressErrors?: boolean;
  nonRetryableErrors?: Iterable<new (...arguments_: any[]) => any>;
  /**
   * @see DefaultPermanentFailureHandler for default behaviour
   */
  nonRetryableErrorHandler?: PermanentFailureHandler<TEvent>;
};

export type RecordProcessor<TEvent extends BatchEvent = BatchEvent> = (
  record: EntryType<TEvent['Records']>,
  context: Context
) => Promise<void>;

export type BatchEvent = SQSEvent | DynamoDBStreamEvent | KinesisStreamEvent;
export type ProcessableRecord<TEvent extends BatchEvent = BatchEvent> = EntryType<
  TEvent['Records']
>;

type BatchResponse = SQSBatchResponse | KinesisStreamBatchResponse | DynamoDBBatchResponse;
type BatchItemFailures = BatchResponse['batchItemFailures'];

export abstract class BatchProcessor<TEvent extends BatchEvent> {
  protected suppressErrors: boolean;
  protected nonRetryableErrors: Array<new (...arguments_: any[]) => any>;
  protected handler: RecordProcessor;
  protected logger?: Logger;
  protected permanentFailureHandler: PermanentFailureHandler;

  constructor({
    handler,
    suppressErrors = false,
    nonRetryableErrors = [],
    nonRetryableErrorHandler = new DefaultPermanentFailureHandler(),
    logger,
  }: Config<TEvent>) {
    this.suppressErrors = suppressErrors;
    this.nonRetryableErrors = [...nonRetryableErrors];
    this.handler = handler;
    this.permanentFailureHandler = nonRetryableErrorHandler;
    this.logger = logger;
  }

  async process({ Records }: TEvent, context: Context): Promise<BatchResponse> {
    const results = await Promise.allSettled(
      Records.map((record) => this.handler(record, context))
    );

    const permanentFailures: PermanentFailure[] = [];

    const batchItemFailures: BatchItemFailures = [];
    const errors: unknown[] = [];

    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') continue;

      if (this.isNonRetryableError(result.reason)) {
        permanentFailures.push({ record: Records[index], reason: result.reason });
      } else {
        batchItemFailures.push({ itemIdentifier: this.getFailureIdentifier(Records[index]) });
        errors.push(result.reason);
      }
    }

    await this.permanentFailureHandler
      .handleRejections(permanentFailures, context)
      .catch((error) => {
        this.logger?.error(error, 'Failed handling permanent failures');
        /**
         * TODO: the java powetools fail everything to re-process the entire batch
         * in this case.
         *
         * Which approach is better?
         */
        for (const { record, reason } of permanentFailures) {
          batchItemFailures.push({ itemIdentifier: this.getFailureIdentifier(record) });
          errors.push(reason);
        }
      });

    if (batchItemFailures.length === 0) {
      this.logger?.info(`All ${Records.length} records successfully processed`);
    } else {
      const processingError = new BatchProcessingError(errors);

      this.logger?.error(processingError, 'Some records failed processing');

      if (batchItemFailures.length === Records.length) {
        throw processingError;
      }
    }

    return { batchItemFailures };
  }

  private isNonRetryableError(error: unknown) {
    return this.nonRetryableErrors.some((NonRetryableError) => error instanceof NonRetryableError);
  }

  protected abstract getFailureIdentifier(record: ProcessableRecord): string;
}
