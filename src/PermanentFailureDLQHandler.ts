import {
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
  SendMessageCommandInput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Context, SQSRecord } from 'aws-lambda';
import { PermanentFailure, PermanentFailureHandler } from './PermanentFailureHandler';

export class PermanentFailureDLQHandler implements PermanentFailureHandler {
  constructor(public readonly queueUrl: string, protected client = new SQSClient({})) {}

  async handleRejections(failures: PermanentFailure[], context: Context): Promise<void> {
    const Entries: SendMessageBatchRequestEntry[] = failures.map(({ record }) => {
      return {
        Id: record.messageId,
        MessageBody: record.body,
        MessageAttributes: this.getMessageAttributes(record),
      };
    });

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
