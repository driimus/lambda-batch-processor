import type { SQSEvent, SQSRecord } from 'aws-lambda';

import { BatchProcessor } from './processor.js';

export class SQSBatchProcessor extends BatchProcessor<SQSEvent> {
  protected getFailureIdentifier(record: SQSRecord): string {
    return record.messageId;
  }
}
