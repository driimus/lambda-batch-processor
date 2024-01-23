import { describe, expect, it } from 'vitest';

import { s3EventFactory } from '../src/index.js';

describe('s3EventFactory', () => {
  it('should produce a non-empty record list', () => {
    expect(s3EventFactory.build().Records.length).toBeGreaterThanOrEqual(1);
  });
});
