import { SSM } from '@aws-sdk/client-ssm';
import {
  COMPARE_OUTCOMES,
  compareConfigSets,
  generateParams,
  info,
  loadConfigFromAws,
  loadConfigFromFile,
  success,
  warn,
} from '../helpers';
import { Parameters } from '../models';
import { MISSING_AWS_ACTION } from '../constants';

export const pushConfigHandler = async (cliParams: Parameters) => {
  const { env, region, prefix, verbose, missingAwsAction, keys } =
    await generateParams(cliParams);
  const localConfig = await loadConfigFromFile(env);
  const awsConfig = await loadConfigFromAws(region, prefix);

  const ssm = new SSM({ region });

  const compareResults = compareConfigSets(localConfig, awsConfig, {
    verbose,
    keys,
  });

  if (compareResults.skipped.length)
    info(`Found ${compareResults.skipped.length} key(s) to skip.`);

  if (compareResults.added.length)
    success(`Found ${compareResults.added.length} new key(s) from ${env}.`);

  if (compareResults.updated.length)
    success(
      `Found ${compareResults.updated.length} updated key(s) from ${env}.`
    );

  if (compareResults.same.length)
    info(`Found ${compareResults.same.length} key(s) with matching values.`);

  if (compareResults.missing.length)
    warn(
      `Found ${
        compareResults.missing.length
      } key(s) missing from ${env} that exist in aws. These key(s) will be ${
        missingAwsAction === MISSING_AWS_ACTION.keep ? 'kept' : 'removed'
      }.`
    );

  // Go through the compare results and build a config set to save
  for (const { key, action } of compareResults.actions) {
    switch (action) {
      // If the key was added or updated, use the local value
      case COMPARE_OUTCOMES.ADDED:
      case COMPARE_OUTCOMES.UPDATED:
        await ssm.putParameter({
          Name: `${prefix}${key}`,
          Value: Array.isArray(localConfig[key])
            ? (localConfig[key] as String[]).join(',')
            : (localConfig[key] as string),
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
