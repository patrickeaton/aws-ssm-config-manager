import { SSM } from '@aws-sdk/client-ssm';
import { ConfigSet } from '../models';
import { getAwsCredentials } from './get-aws-credentials';


export const loadConfigFromAws = async (
  region: string,
  profile: string,
  prefix: string,
  emptyKeyPlaceholder: string
): Promise<ConfigSet> => {
  const ssm = new SSM({ region, credentials: getAwsCredentials(profile) });

  let results: any[] = [];
  let token: string | undefined;

  while (true) {
    const res = await ssm.getParametersByPath({
      Path: prefix,
      NextToken: token,
    });

    results = [...results, ...(res.Parameters ?? [])];

    if (!res.NextToken) break;
    token = res.NextToken;
  }

  const envMap: { [key: string]: string | string[] } = {};

  for (const { Name, Value, Type } of results) {
    const key = Name.substring(prefix.length); // Remove the prefix from the key
    // If the value is the empty key placeholder, set it to an empty string
    if (emptyKeyPlaceholder && Value === emptyKeyPlaceholder) {
      envMap[key] = '';
      continue;
    }
    envMap[key] = Type === 'String' ? Value : Value.split(',');
  }

  return envMap;
};
