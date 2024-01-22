import { faker } from '@faker-js/faker';
import type { MSKEvent, MSKRecord } from 'aws-lambda';
import { Factory } from 'fishery';

export const mskRecordFactory = Factory.define<MSKRecord>(() => {
  return {
    topic: 'mytopic',
    partition: 0,
    offset: 15,
    timestamp: Date.now(),
    timestampType: 'CREATE_TIME',
    key: Buffer.from(faker.lorem.word()).toString('base64'),
    value: Buffer.from(faker.lorem.sentence()).toString('base64'),
    headers: [
      {
        headerKey: [104, 101, 97, 100, 101, 114, 86, 97, 108, 117, 101],
      },
    ],
  };
});

export const mskEventFactory = Factory.define<MSKEvent, { topic: string; partitions: number }>(
  ({ transientParams: { topic = 'mytopic', partitions = 1 } }) => {
    return {
      eventSource: 'aws:kafka',
      eventSourceArn:
        'arn:aws:kafka:sa-east-1:123456789012:cluster/vpc-2priv-2pub/751d2973-a626-431c-9d4e-d7975eb44dd7-2',
      bootstrapServers:
        'b-2.demo-cluster-1.a1bcde.c1.kafka.us-east-1.amazonaws.com:9092,b-1.demo-cluster-1.a1bcde.c1.kafka.us-east-1.amazonaws.com:9092',
      records: Object.fromEntries(
        Array.from({ length: partitions }, (_v, partition) => [
          `${topic}-${partition}`,
          mskRecordFactory.buildList(1, { topic, partition }),
        ]),
      ),
    };
  },
);
