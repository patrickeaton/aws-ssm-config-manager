import {
  MISSING_AWS_ACTION,
  MISSING_LOCAL_ACTION,
} from './constants';

export type MissingLocalAction =
  (typeof MISSING_LOCAL_ACTION)[keyof typeof MISSING_LOCAL_ACTION];

export type MissingAwsAction =
  (typeof MISSING_AWS_ACTION)[keyof typeof MISSING_AWS_ACTION];

export type Parameters = {
  config?: string;
  env?: string;
  prefix?: string;
  keys?: string[];
  verbose?: number;
  region?: string;
  missingAwsAction?: MissingAwsAction;
  missingLocalAction?: MissingLocalAction;
};

export type ConfigSet = {
  [key: string]: string | string[];
};
