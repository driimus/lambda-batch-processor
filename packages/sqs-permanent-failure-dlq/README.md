# @driimus/sqs-permanent-failure-dlq

[![npm](https://img.shields.io/npm/v/@driimus/sqs-permanent-failure-dlq.svg?style=flat)](https://www.npmjs.com/package/@driimus/sqs-permanent-failure-dlq)

Non-retryable error handler for [`@driimus/lambda-batch-processor`](../lambda-batch-processor/README.md)
that sends corresponding SQS messages to a dead-letter SQS queue.

## Installation

> **Warning**\
> This is an ES only package. Before installing, make sure that your project's configuration supports ECMAScript modules.

```sh
pnpm add @driimus/lambda-batch-processor @driimus/sqs-permanent-failure-dlq @aws-sdk/client-sqs
```

## Usage

```ts
import { SQSBatchProcessor } from '@driimus/lambda-batch-processor';
import { PermanentFailureDLQHandler } from '@driimus/sqs-permanent-failure-dlq';

const queueUrl = 'https://queue.amazonaws.com/80398EXAMPLE/MyQueue'; // your queue url

const processor = new SQSBatchProcessor(
  async (record) => {
    /** do stuff */
  },
  {
    nonRetryableErrorHandler: new PermanentFailureDLQHandler(queueUrl),
  }
);

export const handler = processor.process;
```

### Custom SQS Client

By default, every instance of the handler will instantiate a new SQS client.
It is possible to provide a custom client,
which is especially helpful in scenarios where additional instrumentation is required,
or you need to reuse the client elsewhere.

```ts
import { SQSClient } from '@aws-sdk/client-sqs';
import { PermanentFailureDLQHandler } from '@driimus/sqs-permanent-failure-dlq';

const sqs = new SQSClient({
  /** custom config */
});

const queueUrl = 'https://queue.amazonaws.com/80398EXAMPLE/MyQueue'; // your queue url

const nonRetryableErrorHandler = new PermanentFailureDLQHandler(queueUrl, sqs);
```
