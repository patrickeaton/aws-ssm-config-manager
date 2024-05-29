import chalk from 'chalk';
import {
  error,
  generateParams,
  loadConfigFromAws,
  loadConfigFromFile,
  log,
  success,
  warn,
} from '../helpers';
import {
  COMPARE_OUTCOMES,
  compareConfigSets,
} from '../helpers/compare-config-sets';
import { Parameters } from '../models';

// Without updating compare the records in the parameter store with the records in the config file
export const compareConfigHandler = async (cliParams: Parameters) => {
  const { env, region, prefix, verbose, keys, emptyKeyPlaceholder, emptyKeyAction } = await generateParams(
    cliParams
  );
  const existingConfig = await loadConfigFromFile(env);
  const awsConfig = await loadConfigFromAws(region, prefix, emptyKeyPlaceholder);

  const compareResults = compareConfigSets(awsConfig, existingConfig, {
    verbose,
    keys,
    emptyKeyAction,
    sourceName: 'aws',
    destinationName: env,
    loggers: {
      [COMPARE_OUTCOMES.SAME]: chalk.green,
      [COMPARE_OUTCOMES.UPDATED]: chalk.yellow,
      [COMPARE_OUTCOMES.MISSING]: chalk.red,
      [COMPARE_OUTCOMES.ADDED]: chalk.red,
      [COMPARE_OUTCOMES.SKIPPED]: chalk.gray,
    },
  });

  log(
    `Results - ${compareResults.total.length - compareResults.skipped.length}/${
      compareResults.total.length
    } key(s) compared:`
  );
  success(`  - ${compareResults.same.length} key(s) with matching values`);
  warn(`  - ${compareResults.updated.length} key(s) with updated values`);
  error(`  - ${compareResults.missing.length} key(s) missing from aws`);
  error(`  - ${compareResults.added.length} key(s) missing from ${env}`);
};
