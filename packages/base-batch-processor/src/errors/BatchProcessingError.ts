export class BatchProcessingError extends AggregateError {
  constructor(errors: Iterable<any>) {
    super(errors, 'Failed processing some records');
  }
}
