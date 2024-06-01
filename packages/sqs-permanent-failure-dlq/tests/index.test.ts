import { Console } from 'node:console';
import { Stream } from 'node:stream';

import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import {
  sqsEventFactory,
  sqsMessageAttributeFactory,
  sqsRecordFactory,
} from '@driimus/aws-event-factory';
import { FailureAccumulator, SQSBatchProcessor } from '@driimus/lambda-batch-processor';
import { faker } from '@faker-js/faker';
import type { SQSRecord } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import mockJestMatchers from 'aws-sdk-client-mock-jest';
import { Factory } from 'fishery';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PermanentFailureDLQHandler } from '../src/index.js';

expect.extend(mockJestMatchers);

const mockSQS = mockClient(SQSClient);

beforeEach(() => {
  mockSQS.reset();
});

const accumulatorFactory = Factory.define<FailureAccumulator<SQSRecord>>(
  () => new FailureAccumulator<SQSRecord>((record) => record.messageId),
);

describe('PermanentFailureDLQHandler', () => {
  const queueUrl = faker.internet.url();
  const toDLQHandler = new PermanentFailureDLQHandler(queueUrl, {
    logger: new Console({ stdout: new Stream.PassThrough(), stderr: new Stream.PassThrough() }),
  });

  let failures: FailureAccumulator<SQSRecord>;
  const permanentFailures = sqsRecordFactory
    .buildList(2, {
      messageAttributes: {
        attributeOne: sqsMessageAttributeFactory.string().build(),
        attributeTwo: sqsMessageAttributeFactory.number().build(),
        attributeThree: sqsMessageAttributeFactory.binary().build(),
        attributeFour: sqsMessageAttributeFactory.binary().build({ binaryValue: undefined }),
      },
    })
    .map((record) => {
      return { record, reason: faker.lorem.sentence() };
    });

  beforeEach(() => {
    failures = accumulatorFactory.build({ permanentFailures });
  });

  it('should send provided records to the configured queue', async () => {
    mockSQS.resolves({});

    await expect(toDLQHandler.handleRejections(failures)).resolves.toBeUndefined();
    expect(mockSQS).toHaveReceivedCommandTimes(SendMessageBatchCommand, 1);
    expect(mockSQS).toHaveReceivedCommandWith(SendMessageBatchCommand, {
      QueueUrl: queueUrl,
      Entries: expect.objectContaining({ length: failures.permanentFailures.length }),
    });
  });

  it('should surface rejections', async () => {
    mockSQS.rejectsOnce({});

    const surfacePermanentFailures = vi.spyOn(failures, 'surfacePermanentFailures');

    await expect(toDLQHandler.handleRejections(failures)).resolves.toBeUndefined();
    expect(mockSQS).toHaveReceivedCommandTimes(SendMessageBatchCommand, 1);
    expect(surfacePermanentFailures).toHaveBeenCalled();
  });

  it('should not publish for empty failure lists', async () => {
    mockSQS.rejectsOnce({});

    await expect(
      toDLQHandler.handleRejections(accumulatorFactory.build({ permanentFailures: [] })),
    ).resolves.toBeUndefined();
    expect(mockSQS).not.toHaveReceivedCommand(SendMessageBatchCommand);
  });

  it('should move messages in batches of 10', async () => {
    mockSQS.resolves({});

    const permanentFailures = sqsRecordFactory.buildList(12).map((record) => {
      return { record, reason: faker.lorem.sentence() };
    });

    await expect(
      toDLQHandler.handleRejections(accumulatorFactory.build({ permanentFailures })),
    ).resolves.toBeUndefined();
    expect(mockSQS).toHaveReceivedCommandTimes(
      SendMessageBatchCommand,
      Math.ceil(permanentFailures.length / 10),
    );
  });

  it('should be injectable into batch processors', async () => {
    mockSQS.resolves({});
    const failureHandlerSpy = vi.spyOn(toDLQHandler, 'handleRejections');

    class ValidationError extends Error {
      override message = 'Validation error';
    }

    const processor = new SQSBatchProcessor(
      // eslint-disable-next-line @typescript-eslint/require-await
      async (record) => {
        if (record.body === 'invalid body') throw new ValidationError();
      },
      {
        nonRetryableErrorHandler: toDLQHandler,
        nonRetryableErrors: [ValidationError],
      },
    );

    const invalidRecord = sqsRecordFactory.build({ body: 'invalid body' });

    await expect(
      processor.process(
        sqsEventFactory.build({ Records: [invalidRecord, ...sqsRecordFactory.buildList(2)] }),
      ),
    ).resolves.toStrictEqual({
      batchItemFailures: [],
    });
    expect(failureHandlerSpy).toHaveBeenCalledTimes(1);
    expect(failureHandlerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        permanentFailures: [
          expect.objectContaining({
            record: invalidRecord,
            reason: expect.any(ValidationError),
          }),
        ],
      }),
      undefined,
    );
  });
});
