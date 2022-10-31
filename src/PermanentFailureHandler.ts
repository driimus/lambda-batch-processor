import { Context, SQSRecord } from 'aws-lambda';
import { ProcessableRecord } from './processor';

export type PermanentFailure<T extends ProcessableRecord = ProcessableRecord> = {
  record: T;
  reason: unknown;
};

export interface PermanentFailureHandler {
  handleRejections: (failures: PermanentFailure[], context: Context) => Promise<void>;
}

/**
 * Deletes entries from the source SQS queue by marking them as successfully processed.
 *
 * TODO: does it need logging?
 */
export class DefaultPermanentFailureHandler implements PermanentFailureHandler {
  async handleRejections(failures: PermanentFailure[], context: Context): Promise<void> {}
}
