import type { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';

import { BatchProcessor } from './processor';

export class DynamoDBBatchProcessor extends BatchProcessor<DynamoDBStreamEvent> {
  protected getFailureIdentifier(record: DynamoDBRecord): string {
    // TODO: why do the python powertools consider this required
    return record.dynamodb?.SequenceNumber ?? '';
  }
}
