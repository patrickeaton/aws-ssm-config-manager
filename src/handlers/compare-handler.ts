import {
  loadConfigFromAws,
  loadConfigFromFile,
} from '../helpers';
import {
  COMPARE_OUTCOMES,
  compareConfigSets,
} from '../helpers/compare-config-sets';
import { Parameters } from '../models';
import { EasyCLITheme } from 'easy-cli-framework/themes';

// Without updating compare the records in the parameter store with the records in the config file
export const compareConfigHandler = async (
  cliParams: Parameters,
  theme: EasyCLITheme
) => {
  const {
    env,
    region,
    prefix,
    verbose,
    keys,
    emptyKeyPlaceholder,
    emptyKeyAction,
  } = cliParams;

  const logger = theme.getLogger();
  const existingConfig = await loadConfigFromFile(env);
  const awsConfig = await loadConfigFromAws(
    region,
    prefix,
    emptyKeyPlaceholder
  );

  const compareResults = compareConfigSets(awsConfig, existingConfig, theme, {
    verbose,
    keys,
    emptyKeyAction,
    sourceName: 'aws',
    destinationName: env,
    loggers: {
      [COMPARE_OUTCOMES.SAME]: 'success',
      [COMPARE_OUTCOMES.UPDATED]: 'warn',
      [COMPARE_OUTCOMES.MISSING]: 'error',
      [COMPARE_OUTCOMES.ADDED]: 'error',
      [COMPARE_OUTCOMES.SKIPPED]: 'info',
    },
  });

  logger
    .log(
      `Results - ${
        compareResults.total.length - compareResults.skipped.length
      }/${compareResults.total.length} key(s) compared:`
    )
    .force();
  logger
    .success(`  - ${compareResults.same.length} key(s) with matching values`)
    .force();
  logger
    .warn(`  - ${compareResults.updated.length} key(s) with updated values`)
    .force();
  logger
    .error(`  - ${compareResults.missing.length} key(s) missing from aws`)
    .force();
  logger
    .error(`  - ${compareResults.added.length} key(s) missing from ${env}`)
    .force();
};
