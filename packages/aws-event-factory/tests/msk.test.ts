import { faker } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';

import { mskEventFactory } from '../src/index.js';

describe('mskEventFactory', () => {
  it('should allow custom partition counts', () => {
    const topic = faker.string.alpha();

    expect(mskEventFactory.build(undefined, { transient: { topic, partitions: 2 } })).toMatchObject(
      {
        records: expect.objectContaining({
          [`${topic}-0`]: expect.any(Array),
          [`${topic}-1`]: expect.any(Array),
        }),
      },
    );
  });
});
