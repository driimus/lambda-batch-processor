import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type {
  CustomEmailSenderAccountTakeOverNotificationTriggerEvent,
  CustomEmailSenderTriggerEvent,
} from 'aws-lambda';
import { Factory } from 'fishery';

import { userAttributeFactory } from './userAttributeFactory.js';

// TODO: add other trigger sources
export class CustomEmailSenderEventFactory extends Factory<CustomEmailSenderTriggerEvent> {
  accountTakeOverNotification(): Factory<CustomEmailSenderAccountTakeOverNotificationTriggerEvent> {
    return this.params({
      triggerSource: 'CustomEmailSender_AccountTakeOverNotification',
      request: {
        userAttributes: {
          // TODO: populate all fields?
          ACCOUNT_TAKE_OVER_ACTION: 'NO_ACTION',
          IP_ADDRESS: faker.internet.ipv4(),
          CITY: faker.address.city(),
          COUNTRY: faker.address.country(),
        },
      },
    }) as Factory<CustomEmailSenderAccountTakeOverNotificationTriggerEvent>;
  }
}

export const customEmailSenderEventFactory = CustomEmailSenderEventFactory.define(() => {
  const userName = randomUUID();

  return {
    version: '1',
    triggerSource: 'CustomEmailSender_ForgotPassword' as any,
    region: 'us-east-1',
    userPoolId: 'us-east-1_example',
    userName,
    callerContext: {
      awsSdkVersion: 'aws-sdk-unknown-unknown',
      clientId: 'CLIENT_ID',
    },
    request: {
      type: 'customEmailSenderRequestV1',
      code: faker.random.alphaNumeric(),
      userAttributes: userAttributeFactory.build({ sub: userName }),
    },
    response: {},
  };
});
