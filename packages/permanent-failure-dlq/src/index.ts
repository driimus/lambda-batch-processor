import {
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
  SendMessageCommandInput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import { PermanentFailure, PermanentFailureHandler } from 'base-batch-processor';

// TODO: separate package for this
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

  async handleRejections(failures: PermanentFailure<SQSRecord>[], context: Context): Promise<void> {
    const Entries: SendMessageBatchRequestEntry[] = failures.map(({ record }) => {
      return {
        Id: record.messageId,
        MessageBody: record.body,
        MessageAttributes: this.getMessageAttributes(record),
      };
    });

    // TODO: batch request needs to be split into chunks of 10
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
