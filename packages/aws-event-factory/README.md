# @driimus/aws-event-factory

[![npm](https://img.shields.io/npm/v/@driimus/aws-event-factory.svg?style=flat)](https://www.npmjs.com/package/@driimus/aws-event-factory)

Test data factories for different AWS Lambda event sources. Built using [fishery](https://github.com/thoughtbot/fishery).

## Supported Lambda event sources

- [Amazon API Gateway](https://aws.amazon.com/api-gateway/)
- [Amazon CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html)
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)
- [Amazon DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.html)
- [Amazon EventBridge](https://aws.amazon.com/eventbridge/)
- [Amazon Kinesis Data Streams](https://aws.amazon.com/kinesis/data-streams/)
- [Amazon Lex v2](https://docs.aws.amazon.com/lexv2/latest/dg/lambda.html)
- [Amazon MSK](https://docs.aws.amazon.com/lambda/latest/dg/with-msk.html)
- [Amazon S3](https://aws.amazon.com/s3/)
- [Amazon SNS](https://aws.amazon.com/sqs/)
- [Amazon SQS](https://aws.amazon.com/sqs/)
- [Amazon SecretsManager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets-lambda-function-overview.html)

## Installation

> **Warning**\
> This is an ES only package. Before installing, make sure that your project's configuration supports ECMAScript modules.

```sh
pnpm add --save-dev @faker-js/faker fishery @driimus/aws-event-factory
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
