import type {
  Context,
  DynamoDBBatchResponse,
  DynamoDBStreamEvent,
  KinesisStreamBatchResponse,
  KinesisStreamEvent,
  SQSBatchResponse,
  SQSEvent,
} from 'aws-lambda';

export type EntryType<T> = T extends Array<infer U> ? U : never;

export interface RecordProcessor<TEvent extends BatchEvent = BatchEvent> {
  (record: ProcessableRecord<TEvent>, context?: Context): Promise<void>;
}

export type BatchEvent = SQSEvent | DynamoDBStreamEvent | KinesisStreamEvent;
export type ProcessableRecord<TEvent extends BatchEvent = BatchEvent> = EntryType<
  TEvent['Records']
>;
export type BatchResponse = SQSBatchResponse | KinesisStreamBatchResponse | DynamoDBBatchResponse;
export type BatchItemFailures = BatchResponse['batchItemFailures'];
export interface FailureIdProvider<T extends ProcessableRecord = ProcessableRecord> {
  (this: void, record: T): string;
}
