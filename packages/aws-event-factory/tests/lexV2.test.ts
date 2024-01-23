import { describe, expect, it } from 'vitest';

import { lexV2EventFactory } from '../src/index.js';

describe('lexV2EventFactory', () => {
  it('should be buildable', () => {
    expect(lexV2EventFactory.build()).toMatchObject({
      sessionId: expect.any(String),
    });
  });
});
