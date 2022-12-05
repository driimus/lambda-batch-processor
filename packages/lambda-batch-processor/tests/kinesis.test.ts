import { kinesisRecordFactory } from 'mock-events';
import { describe, expect, it } from 'vitest';

import { KinesisBatchProcessor } from '../src/index.js';

describe('KinesisBatchProcessor', () => {
  const processor = new KinesisBatchProcessor(async (record) => {
    if (record.kinesis.data === 'retryable event') throw new Error('something went wrong');
    await Promise.resolve();
  });

  it('collects failed kinesis stream record identifiers', async () => {
    const failingRecords = kinesisRecordFactory.buildList(1, {
      kinesis: { data: 'retryable event' },
    });
    const Records = [...failingRecords, ...kinesisRecordFactory.buildList(2)];

    await expect(
      processor.process({
        Records,
      })
    ).resolves.toStrictEqual({
      batchItemFailures: failingRecords.map(({ kinesis: { sequenceNumber } }) => ({
        itemIdentifier: sequenceNumber,
      })),
    });
  });
});
