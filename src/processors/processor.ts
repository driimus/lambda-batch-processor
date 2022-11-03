import {
  Context,
  DynamoDBStreamEvent,
  KinesisStreamEvent,
  SQSBatchItemFailure,
  KinesisStreamBatchResponse,
  DynamoDBBatchResponse,
  SQSBatchResponse,
  SQSEvent,
  SQSHandler,
  DynamoDBStreamHandler,
  KinesisStreamHandler,
} from 'aws-lambda';
import { BatchProcessingError } from '../errors';
import {
  DefaultPermanentFailureHandler,
  PermanentFailure,
  PermanentFailureHandler,
} from '../nonRetryableErrorHandlers';
import { EntryType } from '../types';

interface LogFn {
  (obj: object | unknown, msg?: string): void;
  (msg: string): void;
}

interface Logger {
  info: LogFn;
  error: LogFn;
}

type Config<TEvent extends BatchEvent> = {
  /**
   * Handler for processing each batch entry
   */
  handler: RecordProcessor<TEvent>;
  logger?: Logger;
  suppressErrors?: boolean;
  nonRetryableErrors?: Iterable<new (...args: any[]) => any>;
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
  protected nonRetryableErrors: Array<new (...args: any[]) => any>;
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

  // TODO: the return type can be extracted from union of handler types
  async process({ Records }: TEvent, context: Context): Promise<BatchResponse> {
    const res = await Promise.allSettled(Records.map((record) => this.handler(record, context)));

    const permanentFailures: PermanentFailure[] = [];

    const batchItemFailures: BatchItemFailures = [];
    const errors: unknown[] = [];

    for (const [i, result] of res.entries()) {
      if (result.status === 'fulfilled') continue;

      if (this.isNonRetryableError(result.reason)) {
        permanentFailures.push({ record: Records[i], reason: result.reason });
      } else {
        batchItemFailures.push({ itemIdentifier: this.getFailureIdentifier(Records[i]) });
        errors.push(result.reason);
      }
    }

    await this.permanentFailureHandler.handleRejections(permanentFailures, context).catch((err) => {
      this.logger?.error(err, 'Failed handling permanent failures');
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

    if (!batchItemFailures.length) {
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

  private isNonRetryableError(err: unknown) {
    return this.nonRetryableErrors.some((NonRetryableError) => err instanceof NonRetryableError);
  }

  protected abstract getFailureIdentifier(record: ProcessableRecord): string;
}
