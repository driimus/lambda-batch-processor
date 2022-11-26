import type { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';
import { Factory } from 'fishery';

import Event from '../events/kinesis.json' assert { type: 'json' };

export const kinesisRecordFactory = Factory.define<KinesisStreamRecord>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone(Event.Records[0]);
});

export const kinesisEventFactory = Factory.define<KinesisStreamEvent>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return structuredClone({ Records: Event.Records });
});
