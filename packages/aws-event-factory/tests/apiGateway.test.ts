import { describe, expect, it } from 'vitest';

import { apiGatewayEventFactory } from '../src/index.js';

describe('apiGatewayEventFactory', () => {
  it('should allow stringified bodies', () => {
    const body = JSON.stringify({ foo: 'bar' });

    expect(apiGatewayEventFactory.build({ body })).toMatchObject({ body });
  });
});
