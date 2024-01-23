import { describe, expect, it } from 'vitest';

import { snsEventFactory, snsMessageAttributeFactory } from '../src/index.js';

describe('snsEventFactory', () => {
  it('should produce a non-empty record list', () => {
    expect(snsEventFactory.build().Records.length).toBeGreaterThanOrEqual(1);
  });
});

describe('snsMessageAttributeFactory', () => {
  it('can produce %s attributes', () => {
    expect(snsMessageAttributeFactory.number().build()).toEqual({
      Type: 'Number',
      Value: expect.stringMatching(/\d*/),
    });
    expect(snsMessageAttributeFactory.string().build()).toEqual({
      Type: 'String',
      Value: expect.any(String),
    });
    expect(snsMessageAttributeFactory.binary().build()).toEqual({
      Type: 'Binary',
      Value: expect.any(String),
    });
  });
});
