import { randomUUID } from 'node:crypto';

import type { PreTokenGenerationTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const preTokenGenerationEventFactory = Factory.define<PreTokenGenerationTriggerEvent>(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'TokenGeneration_HostedAuth',
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      userAttributes: userAttributeFactory.build({ sub: userName }),
      groupConfiguration: {
        groupsToOverride: [],
        iamRolesToOverride: [],
      },
    },
    response: {
      claimsOverrideDetails: {},
    },
  };
});
