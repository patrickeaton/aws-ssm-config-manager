import { ConfigSet, EmptyKeyAction } from '../models';
import { EasyCLITheme, DisplayOptions } from 'easy-cli-framework/themes';

type CompareOptions = {
  emptyKeyAction: EmptyKeyAction;
  verbose: number;
  keys: string[];
  sourceName?: string;
  destinationName?: string;
  loggers?: {
    [key: CompareOutcome]: DisplayOptions;
  };
};

type CompareTableData = {
  key: string;
  outcome: string;
  source: string;
  destination: string;
};

export const COMPARE_OUTCOMES = {
  SAME: 'same',
  ADDED: 'added',
  MISSING: 'missing',
  UPDATED: 'updated',
  SKIPPED: 'skipped',
};

type CompareOutcome = (typeof COMPARE_OUTCOMES)[keyof typeof COMPARE_OUTCOMES];

type CompareResults = {
  [key: CompareOutcome]: string[];
  total: string[];
} & {
  actions: { key: string; action: CompareOutcome }[];
};

const compareRecord = (
  source: string | string[],
  destination: string | string[],
  skip: boolean = false
): CompareOutcome => {
  // if this record is skipped, return skipped
  if (skip) return COMPARE_OUTCOMES.SKIPPED;

  // If it's in the destination but not the source, it's missing.
  if (source === undefined) return COMPARE_OUTCOMES.MISSING;

  // If it's in the source but not the destination, it's added.
  if (destination === undefined) return COMPARE_OUTCOMES.ADDED;

  // If it's in both, compare to determind if it's the same or updated
  return JSON.stringify(source) === JSON.stringify(destination)
    ? COMPARE_OUTCOMES.SAME
    : COMPARE_OUTCOMES.UPDATED;
};

/**
 * @param key The key to check
 * @param keys The keys provided by the user, skip all others
 * @returns Whether to skip
 */
const isKeyInList = (key: string, keys: string[]) => {
  if (!keys.length) return false;

  return !keys.includes(key);
};

/**
 * @param sourceValue The value of the source
 * @param emptyKeyAction The action to take for empty keys.
 */
const skipEmptyKey = (
  sourceValue: string | string[],
  emptyKeyAction: EmptyKeyAction
) => {
  if (sourceValue?.length) return false;

  return emptyKeyAction === 'skip';
};

export const compareConfigSets = (
  source: ConfigSet,
  destination: ConfigSet,
  theme: EasyCLITheme,
  {
    emptyKeyAction,
    verbose,
    keys,
    sourceName = 'source',
    destinationName = 'destination',
    loggers = {
      [COMPARE_OUTCOMES.SAME]: 'info',
      [COMPARE_OUTCOMES.UPDATED]: 'warn',
      [COMPARE_OUTCOMES.MISSING]: 'error',
      [COMPARE_OUTCOMES.ADDED]: 'success',
      [COMPARE_OUTCOMES.SKIPPED]: 'info',
    },
  }: CompareOptions
) => {
  const sourceKeys = Object.keys(source);
  const destinationKeys = Object.keys(destination);

  const allKeys = Array.from(
    new Set([...sourceKeys, ...destinationKeys])
  ).sort();

  const outcomes: CompareResults = {
    same: [],
    added: [],
    missing: [],
    updated: [],
    total: allKeys,
    skipped: [],
    actions: [],
  };

  const keyWidth = Math.max(...allKeys.map(key => key.length));

  const dataWidth = Math.floor((110 - keyWidth) / 2);

  const table = theme.getTable<CompareTableData>([
    {
      name: 'Key',
      data: item => item.key,
      width: keyWidth,
      align: 'right',
    },
    {
      name: 'Outcome',
      data: item => item.outcome,
      style: item => loggers[item.outcome],
      width: 10,
    },
    {
      name: sourceName,
      data: item => item.source,
      width: dataWidth,
    },
    {
      name: destinationName,
      data: item => item.destination,
      width: dataWidth,
    },
  ]);

  /** Make the value Loggable */
  const convertToLoggable = (value: string | string[]) => {
    if (value === undefined) return '-';
    if (!value) return '';

    const valueToUse = Array.isArray(value) ? value.join(',') : value;

    return valueToUse.length > dataWidth ? valueToUse.slice(0, dataWidth - 2) + '…' : valueToUse;
  };

  const data = allKeys.reduce((acc: CompareTableData[], key: string) => {
    const sourceValue = source[key];
    const destinationValue = destination[key];
    const outcome = compareRecord(
      sourceValue,
      destinationValue,
      // Does this key need to be skipped?
      !isKeyInList(key, keys) && skipEmptyKey(sourceValue, emptyKeyAction)
    );

    outcomes[outcome as CompareOutcome].push(key);
    outcomes.actions.push({ key, action: outcome as CompareOutcome });

    if (!verbose) return acc;

    // If verbose is only set to 1, only log the differing records
    if (outcome === COMPARE_OUTCOMES.SAME && verbose < 2) return acc;
    if (outcome === COMPARE_OUTCOMES.SKIPPED && verbose < 3) return acc;

    const sourceValueString = convertToLoggable(sourceValue);
    const destinationValueString = convertToLoggable(destinationValue);

    return [
      ...acc,
      {
        key,
        outcome,
        source: sourceValueString,
        destination: destinationValueString,
      },
    ];
  }, [] as CompareTableData[]);

  // Output the table if verbose is true
  if (verbose) table.render(data);

  return outcomes;
};
