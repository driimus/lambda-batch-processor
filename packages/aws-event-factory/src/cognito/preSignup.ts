import { randomUUID } from 'node:crypto';

import type { PreSignUpTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const preSignupEventFactory = Factory.define<PreSignUpTriggerEvent>(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'PreSignUp_SignUp',
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      userAttributes: userAttributeFactory.build({ sub: userName }),
      validationData: {},
    },
    response: {
      autoConfirmUser: true,
      autoVerifyEmail: true,
      autoVerifyPhone: true,
    },
  };
});
