import { randomBytes, randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { SNSEvent, SNSEventRecord, SNSMessage, SNSMessageAttribute } from 'aws-lambda';
import { Factory } from 'fishery';

class SNSMessageAttributeFactory extends Factory<SNSMessageAttribute> {
  string() {
    return this.params({ Type: 'String', Value: faker.string.sample() });
  }

  number() {
    return this.params({ Type: 'Number', Value: faker.number.int().toString() });
  }

  binary() {
    return this.params({ Type: 'Binary', Value: randomBytes(256).toString() });
  }
}

export const snsMessageAttributeFactory = SNSMessageAttributeFactory.define(() => {
  return { Type: 'String', Value: faker.string.sample() };
});

export const snsMessageFactory = Factory.define<SNSMessage>(() => {
  return {
    MessageId: randomUUID(),
    Message: faker.lorem.sentence(),
    MessageAttributes: {
      Test: snsMessageAttributeFactory.string().build(),
      TestBinary: snsMessageAttributeFactory.binary().build(),
    },
    Subject: 'TestInvoke',
    Timestamp: new Date().toISOString(),
    TopicArn: 'arn:aws:sns:us-east-2:123456789012:sns-lambda',
    Type: 'Notification',
    SignatureVersion: '1',
    Signature: 'tcc6faL2yUC6dgZdmrwh1Y4cGa/ebXEkAi6RibDsvpi+tE/1+82j...65r==',
    SigningCertUrl:
      'https://sns.us-east-2.amazonaws.com/SimpleNotificationService-ac565b8b1a6c5d002d285f9598aa1d9b.pem',
    UnsubscribeUrl:
      'https://sns.us-east-2.amazonaws.com/?Action=Unsubscribe&amp;SubscriptionArn=arn:aws:sns:us-east-2:123456789012:test-lambda:21be56ed-a058-49f5-8c98-aedd2564c486',
  };
});

export const snsRecordFactory = Factory.define<SNSEventRecord>(() => {
  return {
    EventVersion: '1.0',
    EventSubscriptionArn:
      'arn:aws:sns:us-east-2:123456789012:sns-lambda:21be56ed-a058-49f5-8c98-aedd2564c486',
    EventSource: 'aws:sns',
    Sns: snsMessageFactory.build(),
  };
});

export const snsEventFactory = Factory.define<SNSEvent>(() => {
  return { Records: snsRecordFactory.buildList(1) };
});
