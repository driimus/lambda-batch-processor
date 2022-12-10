import type { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';
import { Factory } from 'fishery';

export const kinesisRecordFactory = Factory.define<KinesisStreamRecord>(({ sequence }) => {
  return {
    kinesis: {
      kinesisSchemaVersion: '1.0',
      partitionKey: '1',
      sequenceNumber: sequence.toString(),
      data: 'SGVsbG8sIHRoaXMgaXMgYSB0ZXN0Lg==',
      approximateArrivalTimestamp: 1_545_084_650.987,
    },
    eventSource: 'aws:kinesis',
    eventVersion: '1.0',
    eventID: `shardId-000000000006:${sequence}`,
    eventName: 'aws:kinesis:record',
    invokeIdentityArn: 'arn:aws:iam::123456789012:role/lambda-role',
    awsRegion: 'us-east-2',
    eventSourceARN: 'arn:aws:kinesis:us-east-2:123456789012:stream/lambda-stream',
  };
});

export const kinesisEventFactory = Factory.define<KinesisStreamEvent>(() => {
  return { Records: kinesisRecordFactory.buildList(1) };
});
