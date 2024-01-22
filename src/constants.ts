import { Parameters } from './models';

export const MISSING_LOCAL_ACTION = {
  keep: 'keep',
  remove: 'remove',
};

export const MISSING_AWS_ACTION = {
  keep: 'keep',
  remove: 'remove',
};

export const DEFAULT_PARAMETERS: Parameters = {
  env: '.env',
  prefix: '/',
  keys: [],
  verbose: 0,
  region: 'us-east-1',
  missingLocalAction: MISSING_LOCAL_ACTION.keep,
  missingAwsAction: MISSING_AWS_ACTION.keep,
};
