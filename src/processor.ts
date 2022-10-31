import {
  Context,
  DynamoDBRecord,
  DynamoDBStreamEvent,
  KinesisStreamEvent,
  KinesisStreamRecord,
  SQSBatchItemFailure,
  SQSBatchResponse,
  SQSEvent,
  SQSRecord,
} from 'aws-lambda';
import {
  DefaultPermanentFailureHandler,
  PermanentFailure,
  PermanentFailureHandler,
} from './PermanentFailureHandler';

type Config<TEvent extends ProcessableEvent> = {
  /**
   * Handler for processing each batch entry
   */
  handler: RecordProcessor<TEvent>;
  suppressErrors?: boolean;
  nonRetryableErrors?: Iterable<new (...args: any[]) => any>;
  /**
   * @see DefaultPermanentFailureHandler for default behaviour
   */
  nonRetryableErrorHandler?: PermanentFailureHandler;
};

// enum EventType {
//   SQS = 'SQS',
//   Kinesis = 'Kinesis',
//   DynamoDB = 'DynamoDB',
// }

export type RecordProcessor<TEvent extends ProcessableEvent = ProcessableEvent> = (
  record: EntryType<TEvent['Records']>,
  context: Context
) => Promise<void>;

export type EntryType<T> = T extends Array<infer U> ? U : never;

export type ProcessableEvent = SQSEvent | DynamoDBStreamEvent | KinesisStreamEvent;
export type ProcessableRecord<TEvent extends ProcessableEvent = ProcessableEvent> = EntryType<
  TEvent['Records']
>;

export abstract class BatchProcessor<TEvent extends ProcessableEvent> {
  protected suppressErrors: boolean;
  protected nonRetryableErrors: Array<new (...args: any[]) => any>;
  protected handler: RecordProcessor;
  protected permanentFailureHandler: PermanentFailureHandler;

  constructor({
    handler,
    suppressErrors = false,
    nonRetryableErrors = [],
    nonRetryableErrorHandler = new DefaultPermanentFailureHandler(),
  }: Config<TEvent>) {
    this.suppressErrors = suppressErrors;
    this.nonRetryableErrors = [...nonRetryableErrors];
    this.handler = handler;
    this.permanentFailureHandler = nonRetryableErrorHandler;
  }

  async process({ Records }: TEvent, context: Context): Promise<SQSBatchResponse> {
    const res = await Promise.allSettled(Records.map((record) => this.handler(record, context)));

    const batchItemFailures: SQSBatchItemFailure[] = [];
    const permanentFailures: PermanentFailure[] = [];

    for (const [i, result] of res.entries()) {
      if (result.status === 'fulfilled') continue;

      if (this.isNonRetryableError(result.reason)) {
        permanentFailures.push({ record: Records[i], reason: result.reason });
      } else {
        batchItemFailures.push({ itemIdentifier: this.getFailureIdentifier(Records[i]) });
      }
    }

    await this.permanentFailureHandler.handleRejections(permanentFailures, context).catch((err) => {
      /**
       * TODO: the java powetools fail everything to re-process the entire batch
       * in this case.
       *
       * Which one is better?
       */
      batchItemFailures.push(
        ...permanentFailures.map(({ record }) => ({
          itemIdentifier: this.getFailureIdentifier(record),
        }))
      );
    });

    return { batchItemFailures };
  }

  private isNonRetryableError(err: unknown) {
    return this.nonRetryableErrors.some((NonRetryableError) => err instanceof NonRetryableError);
  }

  protected abstract getFailureIdentifier(record: ProcessableRecord): string;
}

export class SQSBatchProcessor extends BatchProcessor<SQSEvent> {
  protected getFailureIdentifier(record: SQSRecord): string {
    return record.messageId;
  }
}

export class KinesisBatchProcessor extends BatchProcessor<KinesisStreamEvent> {
  protected getFailureIdentifier(record: KinesisStreamRecord): string {
    return record.kinesis.sequenceNumber;
  }
}

export class DynamoDBBatchProcessor extends BatchProcessor<DynamoDBStreamEvent> {
  protected getFailureIdentifier(record: DynamoDBRecord): string {
    // TODO: why is the identifier optional for these?
    return record.dynamodb?.SequenceNumber ?? '';
  }
}
