import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { UserMigrationTriggerEvent } from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

export const userMigrationEventFactory = Factory.define<UserMigrationTriggerEvent>(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'UserMigration_Authentication',
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      password: faker.internet.password(),
    },
    response: {
      userAttributes: userAttributeFactory.build({ sub: userName }),
      desiredDeliveryMediums: ['EMAIL'],
      messageAction: 'RESEND',
      forceAliasCreation: true,
    },
  };
});
