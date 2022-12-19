import { randomUUID } from 'node:crypto';

import type { PostConfirmationTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const postConfirmationEventFactory = Factory.define<PostConfirmationTriggerEvent>(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'PostConfirmation_ConfirmSignUp',
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      userAttributes: userAttributeFactory.build({ sub: userName }),
    },
    response: {},
  };
});
