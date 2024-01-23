import { describe, expect, it } from 'vitest';

import { eventBridgeEventFactory } from '../src/index.js';

describe('eventBridgeEventFactory', () => {
  it('should be buildable', () => {
    expect(eventBridgeEventFactory.build()).toMatchObject({
      id: expect.any(String),
    });
  });
});
