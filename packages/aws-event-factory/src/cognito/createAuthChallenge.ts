import { randomUUID } from 'node:crypto';

import type { CreateAuthChallengeTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const createAuthChallengeEventFactory = Factory.define<CreateAuthChallengeTriggerEvent>(
  () => {
    const userName = randomUUID();

    return {
      version: '1',
      triggerSource: 'CreateAuthChallenge_Authentication',
      region: 'us-east-1',
      userPoolId: 'us-east-1_example',
      userName,
      callerContext: {
        awsSdkVersion: 'aws-sdk-unknown-unknown',
        clientId: 'CLIENT_ID',
      },
      request: {
        userAttributes: userAttributeFactory.build({ sub: userName }),
        challengeName: 'CUSTOM_CHALLENGE',
        session: [],
      },
      response: {
        publicChallengeParameters: {},
        privateChallengeParameters: {},
        challengeMetadata: '',
      },
    };
  },
);
