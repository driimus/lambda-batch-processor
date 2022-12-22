import type { SecretsManagerRotationEvent } from 'aws-lambda';
import { Factory } from 'fishery';

export const secretsManagerEventFactory = Factory.define<SecretsManagerRotationEvent>(() => {
  return {
    Step: 'createSecret',
    SecretId: 'arn:aws:secretsmanager:us-west-2:123456789012:secret:foo/bar/baz',
    ClientRequestToken: '',
  };
});
