import type {
  MessageAttributeValue,
  SendMessageBatchRequestEntry,
  SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { PermanentFailure, PermanentFailureHandler } from '@driimus/lambda-batch-processor';
import type { SQSEvent, SQSRecord } from 'aws-lambda';

/**
 * SQS batch actions can only manipulate up to 10 messages.
 *
 * @see https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-batch-api-actions.html
 */
const MAX_BATCH_SIZE = 10;

export class PermanentFailureDLQHandler implements PermanentFailureHandler<SQSEvent> {
  #client: SQSClient | undefined;

  constructor(
    public readonly queueUrl: string,
    client?: SQSClient,
  ) {
    this.#client = client;
  }

  protected get client() {
    if (!this.#client) this.#client = new SQSClient({});
    return this.#client;
  }

  async handleRejections(failures: PermanentFailure<SQSRecord>[]): Promise<void> {
    const messages: SendMessageBatchRequestEntry[] = failures.map(({ record }) => {
      return {
        Id: record.messageId,
        MessageBody: record.body,
        MessageAttributes: this.getMessageAttributes(record),
      };
    });

    for (let index = 0; index < messages.length; index += MAX_BATCH_SIZE) {
      await this.client.send(
        new SendMessageBatchCommand({
          QueueUrl: this.queueUrl,
          Entries: messages.slice(index, index + MAX_BATCH_SIZE),
        }),
      );
    }
  }

  private getMessageAttributes({ messageAttributes }: SQSRecord) {
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
  }
}
