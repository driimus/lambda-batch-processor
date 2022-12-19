import { faker } from '@faker-js/faker';
import type { S3Event, S3EventRecord } from 'aws-lambda';
import { Factory } from 'fishery';

export const s3RecordFactory = Factory.define<S3EventRecord>(() => {
  return {
    eventVersion: '2.1',
    eventSource: 'aws:s3',
    awsRegion: 'us-east-2',
    eventTime: faker.date.recent().toString(),
    eventName: 'ObjectCreated:Put',
    userIdentity: {
      principalId: 'AWS:AIDAINPONIXQXHT3IKHL2',
    },
    requestParameters: {
      sourceIPAddress: '205.255.255.255',
    },
    responseElements: {
      'x-amz-request-id': 'D82B88E5F771F645',
      'x-amz-id-2': 'vlR7PnpV2Ce81l0PRw6jlUpck7Jo5ZsQjryTjKlc5aLWGVHPZLj5NeC6qMa0emYBDXOo6QBU0Wo=',
    },
    s3: {
      s3SchemaVersion: '1.0',
      configurationId: '828aa6fc-f7b5-4305-8584-487c791949c1',
      bucket: {
        name: 'DOC-EXAMPLE-BUCKET',
        ownerIdentity: {
          principalId: 'A3I5XTEXAMAI3E',
        },
        arn: 'arn:aws:s3:::lambda-artifacts-deafc19498e3f2df',
      },
      object: {
        key: 'b21b84d653bb07b05b1e6b33684dc11b',
        size: faker.datatype.number(),
        eTag: 'b21b84d653bb07b05b1e6b33684dc11b',
        sequencer: '0C0F6F405D6ED209E1',
      },
    },
  };
});

export const s3EventFactory = Factory.define<S3Event>(() => {
  return { Records: s3RecordFactory.buildList(1) };
});
