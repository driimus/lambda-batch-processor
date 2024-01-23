import type { SecretsManagerRotationEvent } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import { secretsManagerEventFactory } from '../src/index.js';

describe('secretsManagerEventFactory', () => {
  it('should be buildable', () => {
    expect(secretsManagerEventFactory.build()).toMatchObject<Partial<SecretsManagerRotationEvent>>({
      Step: 'createSecret',
      SecretId: expect.any(String),
    });
  });
});
