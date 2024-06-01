import type { Context } from 'aws-lambda';

import { BatchProcessingError } from '../errors/index.js';
import {
  DefaultPermanentFailureHandler,
  type PermanentFailureHandler,
} from '../permanentFailureHandler/index.js';
import type {
  BatchEvent,
  BatchResponse,
  ProcessableRecord,
  RecordProcessor,
} from '../types/index.js';
import { FailureAccumulator } from './failureAccumulator.js';

interface LogFunction {
  <T extends object>(object: T, message?: string): void;
  (object: unknown, message?: string): void;
  (message: string): void;
}

export interface Logger {
  info: LogFunction;
  error: LogFunction;
}

export type BatchProcessorOptions<TEvent extends BatchEvent> = {
  logger?: Logger;
  nonRetryableErrors?: Iterable<new (...arguments_: any[]) => any>;
  /**
   * @see {@link DefaultPermanentFailureHandler} for default behaviour
   */
  nonRetryableErrorHandler?: PermanentFailureHandler<TEvent>;
};

export abstract class BatchProcessor<TEvent extends BatchEvent> {
  protected nonRetryableErrors: BatchProcessorOptions<TEvent>['nonRetryableErrors'];
  protected nonRetryableErrorHandler: PermanentFailureHandler<TEvent>;
  protected logger: Logger | undefined;

  constructor(
    protected handler: RecordProcessor<TEvent>,
    {
      nonRetryableErrors,
      nonRetryableErrorHandler = new DefaultPermanentFailureHandler(),
      logger,
    }: BatchProcessorOptions<TEvent> = {},
  ) {
    this.nonRetryableErrors = nonRetryableErrors;
    this.nonRetryableErrorHandler = nonRetryableErrorHandler;
    this.logger = logger;
  }

  async process(
    { Records }: { Records: ProcessableRecord<TEvent>[] },
    context?: Context,
  ): Promise<BatchResponse> {
    const results = await Promise.allSettled(
      Records.map((record) => this.handler(record, context)),
    );

    const failureAccumulator = new FailureAccumulator(
      this.getFailureIdentifier,
      this.nonRetryableErrors,
    ).addResults(Records, results);

    await this.nonRetryableErrorHandler.handleRejections(failureAccumulator, context);

    if (failureAccumulator.batchItemFailures.length === 0) {
      this.logger?.info(`All ${Records.length} records successfully processed`);
    } else {
      const processingError = new BatchProcessingError(failureAccumulator.batchItemFailures);

      this.logger?.error(processingError, 'Some records failed processing');

      if (failureAccumulator.batchItemFailures.length === Records.length) {
        throw processingError;
      }
    }

    return failureAccumulator.toResponse();
  }

  protected abstract getFailureIdentifier(this: void, record: ProcessableRecord<TEvent>): string;
}
