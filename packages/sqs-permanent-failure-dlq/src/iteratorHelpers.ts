export function* take<T>(iterator: IterableIterator<T>, n: number) {
  while (n-- > 0) {
    const element = iterator.next();
    if (element.done) return;
    yield element.value;
  }
}

export function* map<T, V>(iterable: Iterable<T>, mapper: (element: T) => V): IterableIterator<V> {
  for (const value of iterable) {
    yield mapper(value);
  }
}
