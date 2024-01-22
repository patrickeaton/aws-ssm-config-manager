import chalk from 'chalk';
import { ConfigSet } from '../models';
import Table from 'cli-table';

type CompareOptions = {
  verbose?: number;
  keys?: string[];
  sourceName?: string;
  destinationName?: string;
  loggers?: {
    [key: CompareOutcome]: (key: string) => string;
  };
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

  // If it's in the source but not the destination, it's missing
  if (!source) return COMPARE_OUTCOMES.MISSING;

  // If it's in the destination but not the source, it's added
  if (!destination) return COMPARE_OUTCOMES.ADDED;

  // If it's in both, compare to determind if it's the same or updated
  return JSON.stringify(source) === JSON.stringify(destination)
    ? COMPARE_OUTCOMES.SAME
    : COMPARE_OUTCOMES.UPDATED;
};

const shouldSkipRecord = (key: string, keys: string[]) => {
  if (!keys.length) return false;

  return !keys.includes(key);
};

export const compareConfigSets = (
  source: ConfigSet,
  destination: ConfigSet,
  {
    verbose = 0,
    sourceName = 'source',
    destinationName = 'destination',
    keys = [],
    loggers = {
      [COMPARE_OUTCOMES.SAME]: chalk.blue,
      [COMPARE_OUTCOMES.UPDATED]: chalk.yellow,
      [COMPARE_OUTCOMES.MISSING]: chalk.red,
      [COMPARE_OUTCOMES.ADDED]: chalk.green,
      [COMPARE_OUTCOMES.SKIPPED]: chalk.gray,
    },
  }: CompareOptions = {}
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

  const table = new Table({
    head: ['Key', 'Outcome', sourceName, destinationName],
    truncate: '…',
    colAligns: ['right', 'middle', 'left', 'left'],
    colors: false,
  });

  for (const key of allKeys) {
    const sourceValue = source[key];
    const destinationValue = destination[key];
    const outcome = compareRecord(
      sourceValue,
      destinationValue,
      shouldSkipRecord(key, keys)
    );

    outcomes[outcome as CompareOutcome].push(key);
    outcomes.actions.push({ key, action: outcome as CompareOutcome });

    if (!verbose) continue;

    // If verbose is only set to 1, only log the differing records
    if (outcome === COMPARE_OUTCOMES.SAME && verbose < 2) continue;
    if (outcome === COMPARE_OUTCOMES.SKIPPED && verbose < 3) continue;

    const convertToLoggable = (value: string | string[]) => {
      if (!value) return '';

      const valueToUse = Array.isArray(value) ? value.join(',') : value;

      return valueToUse.length > 32
        ? valueToUse.slice(0, 32) + '…'
        : valueToUse;
    };

    const sourceValueString = convertToLoggable(sourceValue);
    const destinationValueString = convertToLoggable(destinationValue);

    table.push([
      loggers[outcome](key),
      loggers[outcome](outcome),
      loggers[outcome](sourceValueString),
      loggers[outcome](destinationValueString),
    ]);
  }

  // Output the table if verbose is true
  if (verbose) console.log(`\n\n${table.toString()}\n\n`);

  return outcomes;
};
