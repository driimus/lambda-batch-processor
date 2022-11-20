import type { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { Records } from '../events/dynamodb.json';

export const dynamodbRecordFactory = Factory.define<DynamoDBRecord>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone(Records[0]);
});

export const dynamodbEventFactory = Factory.define<DynamoDBStreamEvent>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone(Records);
});
