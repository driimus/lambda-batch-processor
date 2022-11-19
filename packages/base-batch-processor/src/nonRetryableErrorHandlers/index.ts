import type { Context } from 'aws-lambda';

import type { BatchEvent, ProcessableRecord } from '../processors/processor';

export type PermanentFailure<T extends ProcessableRecord = ProcessableRecord> = {
  record: T;
  reason: unknown;
};

export interface PermanentFailureHandler<T extends BatchEvent = BatchEvent> {
  handleRejections: (
    failures: PermanentFailure<ProcessableRecord<T>>[],
    context?: Context
  ) => Promise<void>;
}

/**
 * Deletes entries from the source SQS queue by marking them as successfully processed.
 *
 * TODO: does it need logging?
 */
export class DefaultPermanentFailureHandler implements PermanentFailureHandler<BatchEvent> {
  async handleRejections(): Promise<void> {}
}
