import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { VerifyAuthChallengeResponseTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const verifyAuthChallengeResponseEventFactory =
  Factory.define<VerifyAuthChallengeResponseTriggerEvent>(() => {
    const userName = randomUUID();

    return {
      version: '1',
      triggerSource: 'VerifyAuthChallengeResponse_Authentication',
      region: 'us-east-1',
      userPoolId: 'us-east-1_example',
      userName,
      callerContext: {
        awsSdkVersion: 'aws-sdk-unknown-unknown',
        clientId: 'CLIENT_ID',
      },
      request: {
        userAttributes: userAttributeFactory.build({ sub: userName }),
        privateChallengeParameters: {},
        challengeAnswer: faker.lorem.slug(),
        userNotFound: false,
      },
      response: {
        answerCorrect: faker.datatype.boolean(),
      },
    };
  });
