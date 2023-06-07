# @driimus/lambda-batch-processor

[![npm](https://img.shields.io/npm/v/@driimus/lambda-batch-processor.svg?style=flat)](https://www.npmjs.com/package/@driimus/lambda-batch-processor)

Concurrently process batch records with partial failure support.

## Installation

```sh
pnpm add @driimus/lambda-batch-processor
```

## Usage

> **Warning** [`ReportBatchItemFailures`](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting) must be enabled to allow retrying failed messages.

```ts
import { SQSBatchProcessor } from '@driimus/lambda-batch-processor';

const processor = new SQSBatchProcessor(async (record) => {
  /** do stuff */
});

export const handler = processor.process;
```

Supported event sources:

- DynamoDB Streams

  ```ts
  import { DynamoDBBatchProcessor } from '@driimus/lambda-batch-processor';
  ```

- Kinesis Data Streams

  ```ts
  import { KinesisBatchProcessor } from '@driimus/lambda-batch-processor';
  ```

- SQS

  ```ts
  import { SQSBatchProcessor } from '@driimus/lambda-batch-processor';
  ```

### Non-retryable errors

Exceptions that occur during batch processing can be treated as permanent failures.

This feature is inspired from the [AWS Lambda Powertools for Java](https://awslabs.github.io/aws-lambda-powertools-java/utilities/batch/#move-non-retryable-messages-to-a-dead-letter-queue), with one key difference:
By default, messages that trigger permanent failures will not be reported.
In the case of SQS messages, the result will be their deletion from the queue.
To send SQS messages to a dead-letter queue, you can use [`@driimus/sqs-permanent-failure-dlq`](../sqs-permanent-failure-dlq/README.md).

### Logging

You can enable logging by providing a logger compatible with the `Logger` interface,
which is modelled after [pino](https://github.com/pinojs/pino)'s function signatures.

> **Note**
> The provided logger should support serialising [AggregateError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) objects.

If using pino, it might be worth adding [pino-lambda](https://github.com/formidablelabs/pino-lambda),
to preserve Lambda's standard log message format.

```ts
import { SQSBatchProcessor } from '@driimus/lambda-batch-processor';
import pino from 'pino';
import { lambdaRequestTracker, pinoLambdaDestination } from 'pino-lambda';

const destination = pinoLambdaDestination();
const withRequest = lambdaRequestTracker();

const logger = pino({}, destination);

const processor = new SQSBatchProcessor(
  async (record) => {
    /** do stuff */
  },
  {
    logger,
  }
);

export const handler = async (event, context) => {
  withRequest(event, context);

  return await processor.process(event, context);
};
```
