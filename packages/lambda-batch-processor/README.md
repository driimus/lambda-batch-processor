# @driimus/lambda-batch-processor

[![npm](https://img.shields.io/npm/v/@driimus/lambda-batch-processor.svg?style=flat)](https://www.npmjs.com/package/@driimus/lambda-batch-processor)

Concurrently process batch records with partial failure support.

## Installation

> [!WARNING]
> This is an ES only package. Before installing, make sure that your project's configuration supports ECMAScript modules.

```sh
pnpm add @driimus/lambda-batch-processor
```

### Type hints

For types to work as expected, `@types/aws-lambda` must be installed:

```sh
pnpm add --save-dev @types/aws-lambda

```

## Usage

<!-- prettier-ignore-start -->
> [!WARNING]
> [`ReportBatchItemFailures`](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting) must be enabled to allow retrying failed messages.
<!-- prettier-ignore-end -->

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

> [!NOTE]
> The provided logger should support serialising [AggregateError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) objects.
