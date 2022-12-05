import { dynamodbRecordFactory } from 'mock-events';
import { describe, expect, it } from 'vitest';

import { DynamoDBBatchProcessor } from '../src/index.js';

describe('DynamoDBBatchProcessor', () => {
  const processor = new DynamoDBBatchProcessor(async (record) => {
    if (record.eventName === 'MODIFY') throw new Error('something went wrong');
    await Promise.resolve();
  });

  it('collects failed sqs record identifiers', async () => {
    const failingRecords = dynamodbRecordFactory.buildList(1, { eventName: 'MODIFY' });
    const Records = [
      ...failingRecords,
      ...dynamodbRecordFactory.buildList(2, { eventName: 'INSERT' }),
    ];

    await expect(
      processor.process({
        Records,
      })
    ).resolves.toStrictEqual({
      batchItemFailures: failingRecords.map(({ dynamodb: { SequenceNumber } = {} }) => ({
        itemIdentifier: SequenceNumber,
      })),
    });
  });
});
