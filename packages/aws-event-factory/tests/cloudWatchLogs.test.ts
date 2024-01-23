import { describe, expect, it } from 'vitest';

import { cloudWatchLogsEventFactory } from '../src/index.js';

describe('cloudWatchLogsEventFactory', () => {
  it('should generate b64 encoded json data', () => {
    const event = cloudWatchLogsEventFactory.build();

    expect(() => {
      JSON.parse(Buffer.from(event.awslogs.data, 'base64').toString());
    }).not.toThrow();
  });
});
