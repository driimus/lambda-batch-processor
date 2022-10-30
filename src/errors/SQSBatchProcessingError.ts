export class SQSBatchProcessingError extends AggregateError {
  constructor(errors: Iterable<any>) {
    super(errors, "Failed processing some SQS records");
  }
}
