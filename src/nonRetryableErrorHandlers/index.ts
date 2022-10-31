import { Context } from 'aws-lambda';
import { ProcessableEvent, ProcessableRecord } from '../processors/processor';

export type PermanentFailure<T extends ProcessableRecord = ProcessableRecord> = {
  record: T;
  reason: unknown;
};

export interface PermanentFailureHandler<T extends ProcessableEvent = ProcessableEvent> {
  handleRejections: (
    failures: PermanentFailure<ProcessableRecord<T>>[],
    context: Context
  ) => Promise<void>;
}

/**
 * Deletes entries from the source SQS queue by marking them as successfully processed.
 *
 * TODO: does it need logging?
 */
export class DefaultPermanentFailureHandler implements PermanentFailureHandler<ProcessableEvent> {
  async handleRejections(failures: PermanentFailure[], context: Context): Promise<void> {}
}
