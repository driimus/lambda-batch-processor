import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { CustomSMSSenderTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const customSMSSenderEventFactory = Factory.define<CustomSMSSenderTriggerEvent>(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'CustomSMSSender_SignUp',
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      type: 'customSMSSenderRequestV1',
      code: faker.string.alphanumeric(),
      userAttributes: userAttributeFactory.build({ sub: userName }),
    },
    response: {},
  };
});
