import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { StringMap } from 'aws-lambda/trigger/cognito-user-pool-trigger/_common.js';
import { Factory } from 'fishery';

export type MockUserAttributes = StringMap & {
  sub: string | undefined;
  email_verified: string | undefined;
  name: string | undefined;
  email: string | undefined;
};

export const userAttributeFactory = Factory.define<MockUserAttributes>(() => {
  return {
    sub: randomUUID(),
    email_verified: 'true',
    name: faker.person.fullName(),
    email: faker.internet.email(),
  };
});
