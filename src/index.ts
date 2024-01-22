#!/usr/bin/env node

import yargs, { showHelp } from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  pullConfigHandler,
  pushConfigHandler,
  compareConfigHandler,
} from './handlers';
import { Parameters } from './models';
import {
  DEFAULT_PARAMETERS,
  MISSING_AWS_ACTION,
  MISSING_LOCAL_ACTION,
} from './constants';

yargs(hideBin(process.argv))
  .showHelpOnFail(true)
  .help('help', 'Show usage instructions.')
  .demandCommand()
  .command<Parameters>({
    command: 'push',
    describe: 'Push the .env file to AWS',
    handler: pushConfigHandler,
  })
  .command<Parameters>({
    command: 'pull',
    describe: 'Pull the AWS config into the .env file',
    handler: pullConfigHandler,
  })
  .command<Parameters>({
    command: 'compare',
    describe:
      'Compare the records stored in AWS againt the records in the .env file',
    handler: compareConfigHandler,
  })
  .option('env', {
    alias: 'e',
    type: 'string',
    default: DEFAULT_PARAMETERS.env,
    description: 'A path to the .env file to use.',
  })
  .option('prefix', {
    alias: 'pf',
    type: 'string',
    default: DEFAULT_PARAMETERS.prefix,
    description:
      'A path prefix to use when storing the config in AWS. Useful for multi-environment configs.',
  })
  .option('keys', {
    alias: 'k',
    type: 'array',
    default: DEFAULT_PARAMETERS.keys,
    description: 'A comma separated list of keys to filter to.',
  })
  .option('region', {
    alias: 'r',
    type: 'string',
    default: DEFAULT_PARAMETERS.region,
    description: 'The default AWS Region to use',
  })
  .option('missingAwsAction', {
    type: 'string',
    choices: [MISSING_AWS_ACTION.keep, MISSING_AWS_ACTION.remove],
    default: DEFAULT_PARAMETERS.missingAwsAction,
    description:
      'When a key already exists in AWS but not in the .env file. When pushing, should the key be added or removed from AWS.',
  })
  .option('missingLocalAction', {
    type: 'string',
    choices: [MISSING_LOCAL_ACTION.keep, MISSING_LOCAL_ACTION.remove],
    default: DEFAULT_PARAMETERS.missingLocalAction,
    description:
      'When a key exists locally, but is missing in AWS. When pulling, should the key be kept or removed locally. ',
  })
  .option('config', {
    alias: 'c',
    type: 'string',
    default: DEFAULT_PARAMETERS.config,
    description:
      'A path to the config file. This can manage all of the rest of these options for managing multiple environments.',
  })
  .option('verbose', {
    alias: 'v',
    type: 'count',
    default: DEFAULT_PARAMETERS.verbose,
    description: 'Run with verbose logging.',
  })
  .parse();
