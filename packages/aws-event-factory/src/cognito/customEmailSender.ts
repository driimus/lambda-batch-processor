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
          CITY: faker.location.city(),
          COUNTRY: faker.location.country(),
        },
      },
    }) as Factory<CustomEmailSenderAccountTakeOverNotificationTriggerEvent>;
  }
}

export const customEmailSenderEventFactory = CustomEmailSenderEventFactory.define(() => {
  const userName = randomUUID();

  return {
    version: '1',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      code: faker.string.alphanumeric(),
      userAttributes: userAttributeFactory.build({ sub: userName }),
    },
    response: {},
  };
});
