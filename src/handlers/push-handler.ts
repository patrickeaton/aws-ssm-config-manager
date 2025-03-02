import { SSM } from '@aws-sdk/client-ssm';
import {
  COMPARE_OUTCOMES,
  compareConfigSets,
  getAwsCredentials,
  loadConfigFromAws,
  loadConfigFromFile,
} from '../helpers';
import { Parameters } from '../models';
import { MISSING_AWS_ACTION } from '../constants';
import { EasyCLITheme } from 'easy-cli-framework/themes';

// Convert the value to a string or string array. If the value is empty, return the empty key placeholder
const getValue = (value: string | string[], emptyKeyPlaceholder: string) => {
  if (!value?.length) return emptyKeyPlaceholder;

  return Array.isArray(value)
    ? (value as String[]).join(',')
    : (value as string);
};

export const pushConfigHandler = async (
  cliParams: Parameters,
  theme: EasyCLITheme
) => {
  const {
    env,
    profile,
    region,
    prefix,
    verbose,
    missingAwsAction,
    keys,
    emptyKeyAction,
    emptyKeyPlaceholder,
  } = cliParams;
  const logger = theme.getLogger();
  const localConfig = await loadConfigFromFile(env);
  const awsConfig = await loadConfigFromAws(
    region,
    profile,
    prefix,
    emptyKeyPlaceholder
  );

  const ssm = new SSM({ region, credentials: getAwsCredentials(profile) });

  const compareResults = compareConfigSets(localConfig, awsConfig, theme, {
    verbose,
    keys,
    emptyKeyAction,
  });

  if (compareResults.skipped.length)
    logger
      .info(`Found ${compareResults.skipped.length} key(s) to skip.`)
      .force();

  if (compareResults.added.length)
    logger.success(
      `Found ${compareResults.added.length} new key(s) from ${env}.`
    ).force;

  if (compareResults.updated.length)
    logger
      .success(
        `Found ${compareResults.updated.length} updated key(s) from ${env}.`
      )
      .force();

  if (compareResults.same.length)
    logger
      .info(`Found ${compareResults.same.length} key(s) with matching values.`)
      .force();

  if (compareResults.missing.length)
    logger
      .warn(
        `Found ${
          compareResults.missing.length
        } key(s) missing from ${env} that exist in aws. These key(s) will be ${
          missingAwsAction === MISSING_AWS_ACTION.keep ? 'kept' : 'removed'
        }.`
      )
      .force();

  // Go through the compare results and build a config set to save
  for (const { key, action } of compareResults.actions) {
    switch (action) {
      // If the key was added or updated, use the local value
      case COMPARE_OUTCOMES.ADDED:
      case COMPARE_OUTCOMES.UPDATED:
        await ssm.putParameter({
          Name: `${prefix}${key}`,
          Value: getValue(localConfig[key], emptyKeyPlaceholder),
          Type: Array.isArray(localConfig[key]) ? 'StringList' : 'String',
          Overwrite: true,
        });
        break;
      // If the key was removed, remove it from aws if the missingAwsAction is remove
      case COMPARE_OUTCOMES.MISSING:
        if (missingAwsAction === MISSING_AWS_ACTION.remove) {
          await ssm.deleteParameter({
            Name: `${prefix}${key}`,
          });
        }
        break;
    }
  }
};
