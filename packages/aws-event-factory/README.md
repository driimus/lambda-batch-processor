# @driimus/aws-event-factory

Test data factories for different AWS Lambda event sources. Built using [fishery](https://github.com/thoughtbot/fishery).

## Supported Lambda event sources

- [Amazon DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.html)
- [Amazon EventBridge](https://aws.amazon.com/eventbridge/)
- [Amazon Kinesis Data Streams](https://aws.amazon.com/kinesis/data-streams/)
- [Amazon S3](https://aws.amazon.com/s3/)
- [Amazon SQS](https://aws.amazon.com/sqs/)

## Installation

```sh
pnpm add --save-dev fishery @driimus/aws-event-factory
```

## Usage

Make sure to check out fishery's [documentation](https://github.com/thoughtbot/fishery#documentation) for a more detailed API Reference of the exposed factories.

```ts
import {
  dynamodbEventFactory,
  dynamodbRecordFactory,
  sqsEventFactory,
} from '@driimus/aws-event-factory';

const sqsEvent = sqsEventFactory.build(); // { Records: [...] }

const ddbEvent = dynamodbEventFactory.build({
  Records: [
    dynamodbRecordFactory.insert().build(), // { eventName: 'INSERT', ...}
    dynamodbRecordFactory.modify().build(), // { eventName: 'MODIFY', ...}
    dynamodbRecordFactory.remove().build(), // { eventName: 'REMOVE', ...}
  ],
}); // { Records: [...] }
```

More examples:

- [test SQS events](../sqs-permanent-failure-dlq/tests/index.test.ts)
- [test DynamoDB Streams events](../lambda-batch-processor/tests/dynamodb.test.ts)

## Similar projects

- [@serverless/event-mocks](https://github.com/serverless/event-mocks)
