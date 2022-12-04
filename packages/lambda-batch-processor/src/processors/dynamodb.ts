import type { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';

import { BatchProcessor } from './processor.js';

export class DynamoDBBatchProcessor extends BatchProcessor<DynamoDBStreamEvent> {
  protected getFailureIdentifier(record: DynamoDBRecord): string {
    /**
     * @remarks `SequenceNumber` shouldn't be absent.
     * If it might be missing, an empty string will be equivalent to `undefined`,
     * as Lambda fails the entire batch for falsy `itemIdentifier` entries.
     *
     */
    return record.dynamodb?.SequenceNumber ?? '';
  }
}
