import {
  EMPTY_KEY_ACTION,
  MISSING_AWS_ACTION,
  MISSING_LOCAL_ACTION,
} from './constants';

export type MissingLocalAction =
  (typeof MISSING_LOCAL_ACTION)[keyof typeof MISSING_LOCAL_ACTION];

export type MissingAwsAction =
  (typeof MISSING_AWS_ACTION)[keyof typeof MISSING_AWS_ACTION];

export type EmptyKeyAction =
  (typeof EMPTY_KEY_ACTION)[keyof typeof EMPTY_KEY_ACTION];

export type Parameters = {
  config?: string;
  env: string;
  profile: string;
  prefix: string;
  keys: string[];
  verbose: number;
  region: string;
  missingAwsAction: MissingAwsAction;
  missingLocalAction: MissingLocalAction;
  emptyKeyAction: EmptyKeyAction;
  emptyKeyPlaceholder: string;
};

export type ConfigSet = {
  [key: string]: string | string[];
};
