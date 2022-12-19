import { randomUUID } from 'node:crypto';

import type { DefineAuthChallengeTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const defineAuthChallengeEventFactory = Factory.define<DefineAuthChallengeTriggerEvent>(
  () => {
    const userName = randomUUID();

    return {
      version: '1',
      triggerSource: 'DefineAuthChallenge_Authentication',
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
        session: [
          {
            challengeName: 'PASSWORD_VERIFIER',
            challengeResult: true,
          },
        ],
      },
      response: {
        challengeName: 'CUSTOM_CHALLENGE',
        failAuthentication: false,
        issueTokens: false,
      },
    };
  }
);
