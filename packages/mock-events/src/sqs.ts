import { randomBytes, randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { SQSEvent, SQSMessageAttribute, SQSRecord } from 'aws-lambda';
import { Factory } from 'fishery';

export const sqsRecordFactory = Factory.define<SQSRecord>(() => {
  return {
    messageId: randomUUID(),
    receiptHandle: 'AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...',
    body: 'Test message.',
    attributes: {
      ApproximateReceiveCount: '1',
      SentTimestamp: '1545082649183',
      SenderId: 'AIDAIENQZJOLO23YVJ4VO',
      ApproximateFirstReceiveTimestamp: '1545082649185',
    },
    messageAttributes: {},
    md5OfBody: 'e4e68fb7bd0e697a0ae8f1bb342846b3',
    eventSource: 'aws:sqs',
    eventSourceARN: 'arn:aws:sqs:us-east-2:123456789012:my-queue',
    awsRegion: 'us-east-2',
  };
});

export const sqsEventFactory = Factory.define<SQSEvent>(() => {
  return { Records: sqsRecordFactory.buildList(1) };
});

class SQSMessageAttributeFactory extends Factory<SQSMessageAttribute> {
  string() {
    return this.params({ dataType: 'String', stringValue: faker.datatype.string() });
  }

  number() {
    return this.params({ dataType: 'Number', stringValue: faker.datatype.number().toString() });
  }

  binary() {
    return this.params({ dataType: 'Binary', binaryValue: randomBytes(256).toString() });
  }
}

export const sqsMessageAttributeFactory = SQSMessageAttributeFactory.define(() => {
  return { dataType: 'String', stringValue: faker.datatype.string() };
});
