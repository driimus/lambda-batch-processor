import { describe, expect, it } from 'vitest';

import { kinesisEventFactory } from '../src/index.js';

describe('kinesisEventFactory', () => {
  it('should produce a non-empty record list', () => {
    expect(kinesisEventFactory.build().Records.length).toBeGreaterThanOrEqual(1);
  });
});
