#!/usr/bin/env node

import {
  pullConfigHandler,
  pushConfigHandler,
  compareConfigHandler,
} from './handlers';
import { Parameters } from './models';
import {
  DEFAULT_EMPTY_KEY_STRING,
  DEFAULT_PARAMETERS,
  EMPTY_KEY_ACTION,
  MISSING_AWS_ACTION,
  MISSING_LOCAL_ACTION,
} from './constants';
import {
  EasyCLI,
  EasyCLIConfigFile,
  EasyCLITheme,
  EasyCLICommand,
  EasyCLIInitCommand,
  EasyCLIConfigureCommand,
} from 'easy-cli-framework';

const theme = new EasyCLITheme();
const config = new EasyCLIConfigFile({
  filename: 'aws-ssm.config',
  extensions: ['json', 'js', 'ts'],
  recursion: 'merge_lowest_first',
});

const push = new EasyCLICommand<{}, Parameters>('push', pushConfigHandler, {
  description: 'Push the .env file to AWS',
});
const pull = new EasyCLICommand<{}, Parameters>('pull', pullConfigHandler, {
  description: 'Pull the AWS config into the .env file',
});
const compare = new EasyCLICommand<{}, Parameters>(
  'compare',
  compareConfigHandler,
  {
    description:
      'Compare the records stored in AWS againt the records in the .env file',
  }
);

const configure = new EasyCLIConfigureCommand<{}, Parameters>(
  config,
  'configure',
  {
    description: 'Manage your configuration file',
    globalKeysToUse: [
      'env',
      'prefix',
      'region',
      'missingAwsAction',
      'missingLocalAction',
      'emptyKeyAction',
      'emptyKeyPlaceholder',
    ],
    promptGlobalKeys: [
      'env',
      'prefix',
      'region',
      'missingAwsAction',
      'missingLocalAction',
      'emptyKeyAction',
      'emptyKeyPlaceholder',
    ],
    aliases: ['config'],
  }
);

new EasyCLI<Parameters>({
  executionName: 'ssm-config',
  defaultCommand: 'compare',
  // Set the global flags for the CLI
  globalFlags: {
    env: {
      alias: 'e',
      type: 'string',
      default: DEFAULT_PARAMETERS.env,
      description: 'A path to the .env file to use.',
    },
    prefix: {
      alias: 'pf',
      type: 'string',
      default: DEFAULT_PARAMETERS.prefix,
      description:
        'A path prefix to use when storing the config in AWS. Useful for multi-environment configs.',
    },
    keys: {
      alias: 'k',
      type: 'array',
      default: DEFAULT_PARAMETERS.keys,
      description: 'A comma separated list of keys to filter to.',
    },
    region: {
      alias: 'r',
      type: 'string',
      default: DEFAULT_PARAMETERS.region,
      description: 'The default AWS Region to use',
    },
    missingAwsAction: {
      type: 'string',
      choices: [MISSING_AWS_ACTION.keep, MISSING_AWS_ACTION.remove],
      default: DEFAULT_PARAMETERS.missingAwsAction,
      description:
        'When a key already exists in AWS but not in the .env file. When pushing, should the key be added or removed from AWS.',
    },
    missingLocalAction: {
      type: 'string',
      choices: [MISSING_LOCAL_ACTION.keep, MISSING_LOCAL_ACTION.remove],
      default: DEFAULT_PARAMETERS.missingLocalAction,
      description:
        'When a key exists locally, but is missing in AWS. When pulling, should the key be kept or removed locally.',
    },
    emptyKeyAction: {
      type: 'string',
      choices: [EMPTY_KEY_ACTION.skip, EMPTY_KEY_ACTION.replace],
      default: DEFAULT_PARAMETERS.emptyKeyAction,
      description:
        'AWS SSM does not support empty strings. This will determine what to do with empty keys. They can either be skipped or replaced with a placeholder value.',
    },
    emptyKeyPlaceholder: {
      type: 'string',
      default: DEFAULT_EMPTY_KEY_STRING,
      description:
        'AWS SSM does not support empty strings. When the emptyKeyAction is replace, this will be the value used to replace the empty string.',
    },
  },
})
  .setConfigFile(config)
  .setTheme(theme)
  .handleConfigFileFlag()
  .handleVerboseFlag()
  .setCommands([configure, compare, push, pull])
  .execute();
