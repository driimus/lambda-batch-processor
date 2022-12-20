import type { CloudWatchLogsDecodedData, CloudWatchLogsEvent } from 'aws-lambda';
import { Factory } from 'fishery';

export const cloudWatchLogsDecodedDataFactory = Factory.define<CloudWatchLogsDecodedData>(() => {
  const timestamp = Date.now();
  return {
    messageType: 'DATA_MESSAGE',
    owner: '123456789012',
    logGroup: '/aws/lambda/echo-nodejs',
    logStream: '2019/03/13/[$LATEST]94fa867e5374431291a7fc14e2f56ae7',
    subscriptionFilters: ['LambdaStream_cloudwatchlogs-node'],
    logEvents: [
      {
        id: '34622316099697884706540976068822859012661220141643892546',
        timestamp,
        message:
          'REPORT RequestId: 6234bffe-149a-b642-81ff-2e8e376d8aff\tDuration: 46.84 ms\tBilled Duration: 47 ms \tMemory Size: 192 MB\tMax Memory Used: 72 MB\t\n',
      },
    ],
  };
});

const encode = (data: CloudWatchLogsDecodedData) =>
  Buffer.from(JSON.stringify(data)).toString('base64');

export const cloudWatchLogsEventFactory = Factory.define<CloudWatchLogsEvent>(() => {
  return {
    awslogs: {
      data: encode(cloudWatchLogsDecodedDataFactory.build()),
    },
  };
});
