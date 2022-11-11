import type { SendMessageBatchRequestEntry, SendMessageCommandInput } from '@aws-sdk/client-sqs';
import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SQSEvent, SQSRecord } from 'aws-lambda';
import type { PermanentFailure, PermanentFailureHandler } from 'base-batch-processor';

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
    const Entries: SendMessageBatchRequestEntry[] = failures.map(({ record }) => {
      return {
        Id: record.messageId,
        MessageBody: record.body,
        MessageAttributes: this.getMessageAttributes(record),
      };
    });

    // TODO: #15 batch request needs to be split into chunks of 10
    await this.client.send(new SendMessageBatchCommand({ QueueUrl: this.queueUrl, Entries }));
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
