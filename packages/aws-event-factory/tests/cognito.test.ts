import { expect, it } from 'vitest';

import * as cognitoHelpers from '../src/cognito/index.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { CustomEmailSenderEventFactory, ...factories } = cognitoHelpers;

it('cognito factories should work', () => {
  for (const factory of Object.values(factories)) {
    expect(factory.build()).toMatchObject({
      triggerSource: expect.any(String),
    });
  }
});
