import { Context, SQSRecord } from 'aws-lambda';

export type PermanentFailure = {
  record: SQSRecord;
  reason: unknown;
};

export interface PermanentFailureHandler {
  handleRejections: (failures: PermanentFailure[], context: Context) => Promise<void>;
}

export class DefaultPermanentFailureHandler implements PermanentFailureHandler {
  async handleRejections(failures: PermanentFailure[], context: Context): Promise<void> {}
}
