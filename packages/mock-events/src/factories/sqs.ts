import { randomBytes } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { SQSEvent, SQSMessageAttribute, SQSRecord } from 'aws-lambda';
import { Factory } from 'fishery';

import Event from '../events/sqs.json' assert { type: 'json' };

export const sqsRecordFactory = Factory.define<SQSRecord>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone(Event.Records[0]);
});

export const sqsEventFactory = Factory.define<SQSEvent>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone({ Records: Event.Records });
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
