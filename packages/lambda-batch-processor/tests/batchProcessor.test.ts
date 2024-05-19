import { Console } from 'node:console';
import { Stream } from 'node:stream';

import { sqsRecordFactory } from '@driimus/aws-event-factory';
import type { SQSEvent, SQSRecord } from 'aws-lambda';
import { describe, expect, it, vi } from 'vitest';

import { DefaultPermanentFailureHandler } from '../src/permanentFailureHandler/index.js';
import { BatchProcessor } from '../src/processors/processor.js';

describe('BatchProcessor', () => {
  class TestProcessor extends BatchProcessor<SQSEvent> {
    protected getFailureIdentifier(record: SQSRecord): string {
      return record.messageId;
    }
  }

  class ProcessingError extends Error {
    override message = 'Processing error';
  }

  class ValidationError extends Error {
    override message = 'Validation error';
  }

  const handler = async (record: SQSRecord): Promise<void> => {
    if (record.body === 'retryable body') throw new ProcessingError();
    if (record.body === 'invalid body') throw new ValidationError();
    await Promise.resolve();
  };

  const processor = new TestProcessor(handler, {
    nonRetryableErrors: [ValidationError],
  });

  describe('#process', () => {
    it('reports partial failures', async () => {
      await expect(
        processor.process({
          Records: [
            sqsRecordFactory.build(),
            sqsRecordFactory.build({ body: 'retryable body' }),
            sqsRecordFactory.build(),
            sqsRecordFactory.build({ body: 'retryable body' }),
            sqsRecordFactory.build(),
          ],
        }),
      ).resolves.toStrictEqual({
        batchItemFailures: [
          {
            itemIdentifier: expect.any(String),
          },
          {
            itemIdentifier: expect.any(String),
          },
        ],
      });
    });

    it('defaults to deleting messages with non-retryable errors', async () => {
      await expect(
        processor.process({
          Records: [sqsRecordFactory.build(), sqsRecordFactory.build({ body: 'invalid body' })],
        }),
      ).resolves.toStrictEqual({
        batchItemFailures: [],
      });
    });

    it('surfaces failures with the non-retryable errors handler', async () => {
      const nonRetryableErrorHandler = new DefaultPermanentFailureHandler();
      const spy = vi.spyOn(nonRetryableErrorHandler, 'handleRejections');
      const p = new TestProcessor(handler, {
        nonRetryableErrors: [ValidationError],
        nonRetryableErrorHandler,
        logger: new Console({ stdout: new Stream.PassThrough(), stderr: new Stream.PassThrough() }),
      });

      spy.mockRejectedValueOnce(new Error('something went wrong'));
      await expect(
        p.process({
          Records: [sqsRecordFactory.build(), sqsRecordFactory.build({ body: 'invalid body' })],
        }),
      ).resolves.toStrictEqual({
        batchItemFailures: [
          {
            itemIdentifier: expect.any(String),
          },
        ],
      });
    });

    it('throws an error if the whole batch fails', async () => {
      await expect(
        processor.process({
          Records: [sqsRecordFactory.build({ body: 'retryable body' })],
        }),
      ).rejects.toThrow(AggregateError);
    });

    it('should allow providing a logger', async () => {
      const p = new TestProcessor(handler, {
        nonRetryableErrors: [ValidationError],
        // TODO: custom logger
        logger: new Console({ stdout: new Stream.PassThrough(), stderr: new Stream.PassThrough() }),
      });

      await expect(
        p.process({
          Records: sqsRecordFactory.buildList(1),
        }),
      ).resolves.toStrictEqual({
        batchItemFailures: expect.any(Array),
      });
    });
  });
});
