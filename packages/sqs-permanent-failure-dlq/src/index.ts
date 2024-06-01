import type {
  MessageAttributeValue,
  SendMessageBatchRequestEntry,
  SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type {
  FailureAccumulator,
  Logger,
  PermanentFailure,
  PermanentFailureHandler,
} from '@driimus/lambda-batch-processor';
import type { SQSEvent, SQSRecord } from 'aws-lambda';

import type { ProcessableRecord } from '../../lambda-batch-processor/dist/types/index.js';
import { map, take } from './iteratorHelpers.js';

/**
 * SQS batch actions can only manipulate up to 10 messages.
 *
 * @see https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-batch-api-actions.html
 */
const MAX_BATCH_SIZE = 10;

export class PermanentFailureDLQHandler implements PermanentFailureHandler<SQSEvent> {
  protected logger: Logger | undefined;

  #client: SQSClient | undefined;

  constructor(
    public readonly queueUrl: string,
    {
      client,
      logger,
    }: {
      client?: SQSClient;
      logger?: Logger;
    } = {},
  ) {
    this.#client = client;
    this.logger = logger;
  }

  protected get client() {
    if (!this.#client) this.#client = new SQSClient({});
    return this.#client;
  }

  async handleRejections(
    accumulator: FailureAccumulator<ProcessableRecord<SQSEvent>>,
  ): Promise<void> {
    const messageBatches = Failure.toMessageBatch(accumulator.permanentFailures[Symbol.iterator]());

    try {
      for (const Entries of messageBatches) {
        await this.client.send(
          new SendMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries,
          }),
        );
      }
    } catch (error) {
      this.logger?.error(error, 'Failed handling permanent failures');
      /**
       * TODO: the java powertools fail everything to re-process the entire batch
       * in this case.
       *
       * Which approach is better?
       */
      accumulator.surfacePermanentFailures();
    }
  }
}

const Failure = {
  *toMessageBatch(iterator: IterableIterator<PermanentFailure<SQSRecord>>) {
    let chunk: ReturnType<typeof Failure.toEntry>[];
    while (true) {
      chunk = [...map(take(iterator, MAX_BATCH_SIZE), Failure.toEntry)];
      if (chunk.length === 0) return;
      yield chunk;
    }
  },
  toEntry(this: void, { record }: PermanentFailure<SQSRecord>): SendMessageBatchRequestEntry {
    return {
      Id: record.messageId,
      MessageBody: record.body,
      MessageAttributes: Failure.getMessageAttributes(record),
    };
  },
  getMessageAttributes({ messageAttributes }: SQSRecord) {
    const attributes: SendMessageCommandInput['MessageAttributes'] = {};

    for (const [name, attribute] of Object.entries(messageAttributes)) {
      attributes[name] = {
        DataType: attribute.dataType,
        StringValue: attribute.stringValue,
        BinaryValue: attribute.binaryValue ? Buffer.from(attribute.binaryValue) : undefined,
        // TODO: these types are not implemented yet
        // StringListValues: attribute.stringListValues,
        // BinaryListValues: attribute.binaryListValues,
      } as MessageAttributeValue;
    }

    return attributes;
  },
};
