import type { SQSEvent, SQSRecord } from 'aws-lambda';

import { BatchProcessor } from './processor';

export class SQSBatchProcessor extends BatchProcessor<SQSEvent> {
  protected getFailureIdentifier(record: SQSRecord): string {
    return record.messageId;
  }
}
