import type { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import Event from '../events/dynamodb.json' assert { type: 'json' };

export const dynamodbRecordFactory = Factory.define<DynamoDBRecord>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone(Event.Records[0]);
});

export const dynamodbEventFactory = Factory.define<DynamoDBStreamEvent>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone({ Records: Event.Records });
});
