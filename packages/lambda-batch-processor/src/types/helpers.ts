export type EntryType<T> = T extends Array<infer U> ? U : never;
