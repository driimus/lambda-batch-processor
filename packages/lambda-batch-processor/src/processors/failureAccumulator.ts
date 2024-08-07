import type { BatchItemFailures, FailureIdProvider, ProcessableRecord } from '../types/index.js';

export type PermanentFailure<T extends ProcessableRecord = ProcessableRecord> = {
  record: T;
  reason: unknown;
};

export class FailureAccumulator<TRecord extends ProcessableRecord> {
  permanentFailures: PermanentFailure<TRecord>[] = [];

  batchItemFailures: BatchItemFailures = [];

  constructor(
    protected getFailureIdentifier: FailureIdProvider<TRecord>,
    protected nonRetryableErrors: Iterable<new (...arguments_: any[]) => any> = [],
  ) {}

  addResults(records: TRecord[], results: PromiseSettledResult<void>[]) {
    for (const [index, result] of results.entries()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (result.status === 'rejected') this.addFailure(records[index]!, result.reason);
    }

    return this;
  }

  addFailure(record: TRecord, error: unknown) {
    if (this.#isNonRetryableError(error)) this.permanentFailures.push({ record, reason: error });
    else this.batchItemFailures.push({ itemIdentifier: this.getFailureIdentifier(record) });
  }

  surfacePermanentFailures() {
    for (const failure of this.permanentFailures) {
      this.batchItemFailures.push({
        itemIdentifier: this.getFailureIdentifier(failure.record),
      });
    }
  }

  toResponse() {
    return { batchItemFailures: this.batchItemFailures };
  }

  #isNonRetryableError(error: unknown) {
    for (const NonRetryableError of this.nonRetryableErrors) {
      if (error instanceof NonRetryableError) return true;
    }
    return false;
  }
}
