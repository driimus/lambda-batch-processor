# AWS Lambda Batch Processor

[![tests](https://github.com/driimus/lambda-batch-processor/actions/workflows/test.yml/badge.svg)](https://github.com/driimus/lambda-batch-processor/actions/workflows/test.yml)

Like AWS' [Powertools for Python](https://awslabs.github.io/aws-lambda-powertools-python/2.0.0/utilities/batch/)
and [Powertools for Java](https://awslabs.github.io/aws-lambda-powertools-java/utilities/batch/)
components for batch event processing, but for TypeScript.

## Constituent packages

- [@driimus/aws-event-factory](./packages/aws-event-factory/)
- [@driimus/lambda-batch-processor](./packages/lambda-batch-processor/)
- [@driimus/sqs-permanent-failure-dlq](./packages/sqs-permanent-failure-dlq/)
