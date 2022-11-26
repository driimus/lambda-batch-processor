import type { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';

import { BatchProcessor } from './processor.js';

export class KinesisBatchProcessor extends BatchProcessor<KinesisStreamEvent> {
  protected getFailureIdentifier(record: KinesisStreamRecord): string {
    return record.kinesis.sequenceNumber;
  }
}
