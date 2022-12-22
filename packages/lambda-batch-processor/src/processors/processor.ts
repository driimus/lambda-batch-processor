import type { Context } from 'aws-lambda';

import { BatchProcessingError } from '../errors/index.js';
import type {
  PermanentFailure,
  PermanentFailureHandler,
} from '../permanentFailureHandler/index.js';
import { DefaultPermanentFailureHandler } from '../permanentFailureHandler/index.js';
import type {
  BatchEvent,
  BatchItemFailures,
  BatchResponse,
  ProcessableRecord,
  RecordProcessor,
} from '../types/index.js';

interface LogFunction {
  (object: object | unknown, message?: string): void;
  (message: string): void;
}

export interface Logger {
  info: LogFunction;
  error: LogFunction;
}

export type BatchProcessorOptions<TEvent extends BatchEvent> = {
  logger?: Logger;
  suppressErrors?: boolean;
  nonRetryableErrors?: Iterable<new (...arguments_: any[]) => any>;
  /**
   * @see DefaultPermanentFailureHandler for default behaviour
   */
  nonRetryableErrorHandler?: PermanentFailureHandler<TEvent>;
};

export abstract class BatchProcessor<TEvent extends BatchEvent> {
  protected handler: RecordProcessor;
  protected suppressErrors: boolean;
  protected nonRetryableErrors: Array<new (...arguments_: any[]) => any>;
  protected nonRetryableErrorHandler: PermanentFailureHandler;
  protected logger: Logger | undefined;

  constructor(
    handler: RecordProcessor<TEvent>,
    {
      suppressErrors = false,
      nonRetryableErrors = [],
      nonRetryableErrorHandler = new DefaultPermanentFailureHandler(),
      logger,
    }: BatchProcessorOptions<TEvent> = {}
  ) {
    this.handler = handler;
    this.suppressErrors = suppressErrors;
    this.nonRetryableErrors = [...nonRetryableErrors];
    this.nonRetryableErrorHandler = nonRetryableErrorHandler;
    this.logger = logger;
  }

  async process({ Records }: TEvent, context?: Context): Promise<BatchResponse> {
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

    await this.nonRetryableErrorHandler
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
