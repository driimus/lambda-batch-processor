import type { Context } from 'aws-lambda';

import type { FailureAccumulator } from '../processors/failureAccumulator.js';
import type { BatchEvent, ProcessableRecord } from '../types/index.js';

export interface PermanentFailureHandler<T extends BatchEvent = BatchEvent> {
  handleRejections: (
    failures: FailureAccumulator<ProcessableRecord<T>>,
    context?: Context,
  ) => Promise<void>;
}

/**
 * Deletes entries from the source SQS queue by marking them as successfully processed.
 */
export class DefaultPermanentFailureHandler implements PermanentFailureHandler<BatchEvent> {
  async handleRejections(): Promise<void> {}
}
