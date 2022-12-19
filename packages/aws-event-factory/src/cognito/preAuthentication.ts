import { randomUUID } from 'node:crypto';

import type { PreAuthenticationTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const preAuthenticationEventFactory = Factory.define<PreAuthenticationTriggerEvent>(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'PreAuthentication_Authentication',
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      userAttributes: userAttributeFactory.build({ sub: userName }),
      userNotFound: false,
      validationData: {},
    },
    response: {},
  };
});
