import type { SendMessageBatchRequestEntry, SendMessageCommandInput } from '@aws-sdk/client-sqs';
import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { PermanentFailure, PermanentFailureHandler } from '@driimus/lambda-batch-processor';
import type { SQSEvent, SQSRecord } from 'aws-lambda';

/**
 * SQS batch actions can only manipulate up to 10 messages.
 *
 * @see https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-batch-api-actions.html
 */
const MAX_BATCH_SIZE = 10;

/**
 * @example
 * ```ts
 * const processor = new BatchSQSProcessor({
 *
 * })
 * ```
 */
export class PermanentFailureDLQHandler implements PermanentFailureHandler<SQSEvent> {
  constructor(public readonly queueUrl: string, protected client = new SQSClient({})) {}

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
        })
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
      };
    }

    return attributes;
  }
}
