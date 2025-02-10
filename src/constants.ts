import { Parameters } from './models';

export const MISSING_LOCAL_ACTION = {
  keep: 'keep',
  remove: 'remove',
};

export const MISSING_AWS_ACTION = {
  keep: 'keep',
  remove: 'remove',
};

/**
 * @description SSM can't be provided with an empty string, which can be problematic if you have an optional param. This will explain what to do with any empty keys.
 */
export const EMPTY_KEY_ACTION = {
  skip: 'skip', // Remove the key from the config
  replace: 'replace', // Replace the key with a placeholder value
};

export const DEFAULT_EMPTY_KEY_STRING = '[EMPTY]';

export const DEFAULT_PARAMETERS: Parameters = {
  env: '.env',
  prefix: '/',
  keys: [],
  verbose: 0,
  region: 'us-east-1',
  profile: 'default',
  missingLocalAction: MISSING_LOCAL_ACTION.keep,
  missingAwsAction: MISSING_AWS_ACTION.keep,
  emptyKeyAction: EMPTY_KEY_ACTION.skip,
  emptyKeyPlaceholder: DEFAULT_EMPTY_KEY_STRING,
};
