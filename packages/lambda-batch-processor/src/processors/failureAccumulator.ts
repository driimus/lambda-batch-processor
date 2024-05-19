import { type PermanentFailure } from '../permanentFailureHandler/index.js';
import type {
  BatchEvent,
  BatchItemFailures,
  EntryType,
  FailureIdProvider,
} from '../types/index.js';

export class FailureAccumulator<
  TEvent extends BatchEvent,
  TRecord extends EntryType<TEvent['Records']> = EntryType<TEvent['Records']>,
> {
  permanentFailures: PermanentFailure<TRecord>[] = [];

  batchItemFailures: BatchItemFailures = [];

  constructor(
    protected getFailureIdentifier: FailureIdProvider<TRecord>,
    protected nonRetryableErrors: Iterable<new (...arguments_: any[]) => any> = [],
  ) {}

  addResults(records: TRecord[], results: PromiseSettledResult<void>[]) {
    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') this.addFailure(records[index], result.reason);
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
