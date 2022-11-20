# Lambda Batch Processor

Largely inspired by the Python and Java Powertools.

## Installation

```sh
pnpm add @driimus/lambda-batch-processor
```

## Usage

```ts
import { SQSBatchProcessor } from '@driimus/lambda-batch-processor';

const processor = new SQSBatchProcessor({
  /** ... */
});
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
By default, messages that trigger permanent failures will be deleted from the queue.
To send the messages to a dead-letter queue, you can use [@driimus/permanent-failure-dlq](../permanent-failure-dlq/README.md)

### Logging

You can enable logging by providing a logger compatible with the `Logger` interface,
which is modelled after [pino](https://github.com/pinojs/pino)'s function signatures.

> **Note**
> The provided logger should support serialising [AggregateError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) objects.
