import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { PostAuthenticationTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const postAuthenticationEventFactory = Factory.define<PostAuthenticationTriggerEvent>(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'PostAuthentication_Authentication',
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      userAttributes: userAttributeFactory.build({ sub: userName }),
      newDeviceUsed: faker.datatype.boolean(),
    },
    response: {},
  };
});
