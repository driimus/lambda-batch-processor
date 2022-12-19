import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import type { EventBridgeEvent } from 'aws-lambda';
import { Factory } from 'fishery';

export const eventBridgeEventFactory = Factory.define<
  EventBridgeEvent<string, Record<string, unknown>>
>(() => {
  const time = faker.date.recent().toISOString();
  return {
    version: '0',
    id: randomUUID(),
    'detail-type': 'RDS DB Instance Event',
    source: 'aws.rds',
    account: '123456789012',
    time,
    region: 'us-east-2',
    resources: ['arn:aws:rds:us-east-2:123456789012:db:rdz6xmpliljlb1'],
    detail: {
      EventCategories: ['backup'],
      SourceType: 'DB_INSTANCE',
      SourceArn: 'arn:aws:rds:us-east-2:123456789012:db:rdz6xmpliljlb1',
      Date: time,
      Message: 'Finished DB Instance backup',
      SourceIdentifier: 'rdz6xmpliljlb1',
    },
  };
});
