import { stringify } from 'envfile';
import { promises } from 'fs';
import {
  loadConfigFromAws,
  loadConfigFromFile,
} from '../helpers';
import { ConfigSet, Parameters } from '../models';
import {
  COMPARE_OUTCOMES,
  compareConfigSets,
} from '../helpers/compare-config-sets';
import { MISSING_LOCAL_ACTION } from '../constants';
import { EasyCLITheme } from 'easy-cli-framework';

export const pullConfigHandler = async (
  cliParams: Parameters,
  theme: EasyCLITheme
) => {
  const {
    env,
    region,
    prefix,
    verbose,
    missingLocalAction,
    keys,
    emptyKeyAction,
    emptyKeyPlaceholder,
  } = await cliParams;
  const existingConfig = await loadConfigFromFile(env);
  const awsConfig = await loadConfigFromAws(
    region,
    prefix,
    emptyKeyPlaceholder
  );

  const logger = theme.getLogger();

  const compareResults = compareConfigSets(awsConfig, existingConfig, theme, {
    emptyKeyAction,
    verbose,
    keys,
  });

  if (compareResults.skipped.length)
    logger
      .info(`Found ${compareResults.skipped.length} key(s) to skip.`)
      .force();

  if (compareResults.added.length)
    logger
      .success(`Found ${compareResults.added.length} new key(s) from aws.`)
      .force();

  if (compareResults.updated.length)
    logger
      .success(
        `Found ${compareResults.updated.length} updated key(s) from aws.`
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
        } key(s) missing from aws that exist in ${env}. These key(s) will be ${
          missingLocalAction === MISSING_LOCAL_ACTION.keep ? 'kept' : 'removed'
        }.`
      )
      .force();

  // Go through the compare results and build a config set to save
  const configToSave: ConfigSet = compareResults.actions.reduce(
    (acc: ConfigSet, { key, action }) => {
      switch (action) {
        // If the key was added or updated, use the aws value
        case COMPARE_OUTCOMES.ADDED:
        case COMPARE_OUTCOMES.UPDATED:
        case COMPARE_OUTCOMES.SAME:
          acc[key] = awsConfig[key];
          break;
        // If the key was missing, use the existing value if the missing local action is to keep
        case COMPARE_OUTCOMES.MISSING:
          if (missingLocalAction !== MISSING_LOCAL_ACTION.keep) break;
        // If the key was skipped, use the existing value
        case COMPARE_OUTCOMES.SKIPPED:
          if (existingConfig[key]) acc[key] = existingConfig[key];
      }
      return acc;
    },
    {}
  );

  logger
    .info(`Saving ${Object.keys(configToSave).length} key(s) to ${env}`)
    .force();
  await promises.writeFile(`${process.cwd()}/${env}`, stringify(configToSave));
};
