import { Console } from 'node:console';

import type { SQSEvent, SQSRecord } from 'aws-lambda';
import { sqsRecordFactory } from 'mock-events';

import { DefaultPermanentFailureHandler } from '../src/permanentFailureHandler';
import { BatchProcessor } from '../src/processors/processor';

describe('BatchProcessor', () => {
  class TestProcessor extends BatchProcessor<SQSEvent> {
    protected getFailureIdentifier(record: SQSRecord): string {
      return record.messageId;
    }
  }

  class ProcessingError extends Error {
    message = 'Processing error';
  }

  class ValidationError extends Error {
    message = 'Validation error';
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
        })
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

    it('allows suppressing processing errors', async () => {
      const p = new TestProcessor(handler, {
        suppressErrors: true,
      });
      await expect(
        p.process({
          Records: [
            sqsRecordFactory.build(),
            sqsRecordFactory.build({ body: 'retryable body' }),
            sqsRecordFactory.build(),
            sqsRecordFactory.build({ body: 'retryable body' }),
            sqsRecordFactory.build(),
          ],
        })
      ).resolves.toStrictEqual({
        batchItemFailures: expect.any(Array),
      });
    });

    it('defaults to deleting messages with non-retryable errors', async () => {
      await expect(
        processor.process({
          Records: [sqsRecordFactory.build(), sqsRecordFactory.build({ body: 'invalid body' })],
        })
      ).resolves.toStrictEqual({
        batchItemFailures: [],
      });
    });

    it('surfaces failures with the non-retryable errors handler', async () => {
      const nonRetryableErrorHandler = new DefaultPermanentFailureHandler();
      const spy = jest.spyOn(nonRetryableErrorHandler, 'handleRejections');
      const p = new TestProcessor(handler, {
        nonRetryableErrors: [ValidationError],
        nonRetryableErrorHandler,
      });

      spy.mockRejectedValueOnce(new Error('something went wrong'));
      await expect(
        p.process({
          Records: [sqsRecordFactory.build(), sqsRecordFactory.build({ body: 'invalid body' })],
        })
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
        })
      ).rejects.toThrow(AggregateError);
    });

    it('should allow providing a logger', async () => {
      const p = new TestProcessor(handler, {
        nonRetryableErrors: [ValidationError],
        // TODO: custom logger
        logger: new Console({ stdout: process.stdout }),
      });

      await expect(
        p.process({
          Records: [
            sqsRecordFactory.build(),
            sqsRecordFactory.build({ body: 'invalid body' }),
            sqsRecordFactory.build({ body: 'retryable body' }),
          ],
        })
      ).resolves.toStrictEqual({
        batchItemFailures: expect.any(Array),
      });
    });
  });
});
