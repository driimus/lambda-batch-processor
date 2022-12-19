import { randomUUID } from 'node:crypto';

import type { CustomMessageTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const customMessageEventFactory = Factory.define<CustomMessageTriggerEvent>(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'CustomMessage_SignUp',
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      userAttributes: userAttributeFactory.build({ sub: userName }),
      codeParameter: '',
      linkParameter: '',
      usernameParameter: null,
    },
    response: {
      smsMessage: null,
      emailMessage: null,
      emailSubject: null,
    },
  };
});
