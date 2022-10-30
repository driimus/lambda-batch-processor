import { Context, SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda';
import { DefaultPermanentFailureHandler, PermanentFailure } from './PermanentFailureHandler';

type Config = {
  suppressErrors?: boolean;
  nonRetryableErrors?: Iterable<new (...args: any[]) => any>;
  handler: RecordProcessor;
};

type RecordProcessor = (record: SQSRecord) => Promise<void>;

export class SQSBatchProcessor {
  protected suppressErrors: boolean;
  protected nonRetryableErrors: Array<new (...args: any[]) => any>;
  protected handler: RecordProcessor;
  protected permanentFailureHandler = new DefaultPermanentFailureHandler();

  constructor({ suppressErrors = false, nonRetryableErrors = [], handler }: Config) {
    this.suppressErrors = suppressErrors;
    this.nonRetryableErrors = [...nonRetryableErrors];
    this.handler = handler;
  }

  async process({ Records }: SQSEvent, context: Context): Promise<SQSBatchResponse> {
    const res = await Promise.allSettled(Records.map(this.handler));

    const batchItemFailures: SQSBatchItemFailure[] = [];
    const permanentFailures: PermanentFailure[] = [];

    for (const [i, result] of res.entries()) {
      if (result.status === 'fulfilled') continue;

      if (this.isNonRetryableError(result.reason)) {
        permanentFailures.push({ record: Records[i], reason: result.reason });
      } else {
        batchItemFailures.push({ itemIdentifier: Records[i].messageId });
      }
    }

    await this.permanentFailureHandler.handleRejections(permanentFailures, context).catch((err) => {
      batchItemFailures.push(
        ...permanentFailures.map(({ record }) => ({
          itemIdentifier: record.messageId,
        }))
      );
    });

    return { batchItemFailures };
  }

  private isNonRetryableError(err: unknown) {
    return this.nonRetryableErrors.some((errorConstructor) => err instanceof errorConstructor);
  }
}
