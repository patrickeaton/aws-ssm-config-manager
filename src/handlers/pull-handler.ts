import { SSM } from '@aws-sdk/client-ssm';
import { stringify } from 'envfile';
import { promises } from 'fs';
import {
  generateParams,
  info,
  loadConfigFromAws,
  loadConfigFromFile,
  success,
  warn,
} from '../helpers';
import { ConfigSet, Parameters } from '../models';
import {
  COMPARE_OUTCOMES,
  compareConfigSets,
} from '../helpers/compare-config-sets';
import { MISSING_LOCAL_ACTION } from '../constants';

export const pullConfigHandler = async (cliParams: Parameters) => {
  const { env, region, prefix, verbose, missingLocalAction, keys } =
    await generateParams(cliParams);
  const existingConfig = await loadConfigFromFile(env);
  const awsConfig = await loadConfigFromAws(region, prefix);

  const compareResults = compareConfigSets(awsConfig, existingConfig, {
    verbose,
    keys,
  });

  if (compareResults.skipped.length)
    info(`Found ${compareResults.skipped.length} key(s) to skip.`);

  if (compareResults.added.length)
    success(`Found ${compareResults.added.length} new key(s) from aws.`);

  if (compareResults.updated.length)
    success(`Found ${compareResults.updated.length} updated key(s) from aws.`);

  if (compareResults.same.length)
    info(`Found ${compareResults.same.length} key(s) with matching values.`);

  if (compareResults.missing.length)
    warn(
      `Found ${
        compareResults.missing.length
      } key(s) missing from aws that exist in ${env}. These key(s) will be ${
        missingLocalAction === MISSING_LOCAL_ACTION.keep ? 'kept' : 'removed'
      }.`
    );

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
  
  info(`Saving ${Object.keys(configToSave).length} key(s) to ${env}`);
  await promises.writeFile(`${process.cwd()}/${env}`, stringify(configToSave));
};
