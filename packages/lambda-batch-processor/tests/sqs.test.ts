import { sqsRecordFactory } from '@driimus/aws-event-factory';
import { describe, expect, it } from 'vitest';

import { SQSBatchProcessor } from '../src/index.js';

describe('SQSBatchProcessor', () => {
  const processor = new SQSBatchProcessor(async (record) => {
    if (record.body === 'retryable body') throw new Error('something went wrong');
    await Promise.resolve();
  });

  it('collects failed sqs record identifiers', async () => {
    const failingRecords = sqsRecordFactory.buildList(1, { body: 'retryable body' });
    const Records = [...failingRecords, ...sqsRecordFactory.buildList(2)];

    await expect(
      processor.process({
        Records,
      }),
    ).resolves.toStrictEqual({
      batchItemFailures: failingRecords.map(({ messageId }) => ({ itemIdentifier: messageId })),
    });
  });
});
