import type { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';
import { Factory } from 'fishery';

import { Records } from '../events/kinesis.json';

export const kinesisRecordFactory = Factory.define<KinesisStreamRecord>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone(Records[0]);
});

export const kinesisEventFactory = Factory.define<KinesisStreamEvent>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone(Records);
});
