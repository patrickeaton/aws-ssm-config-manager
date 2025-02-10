import { fromIni, fromEnv } from '@aws-sdk/credential-providers';

export const getAwsCredentials = (profile: string) => {
  if (process.env.AWS_PROFILE) {
    return fromEnv();
  }

  if (profile) {
    return fromIni({ profile });
  }
};
