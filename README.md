# AWS Env Config Manager

## Description
A small tool for storing your .env files in AWS parameter store. Can be used by the team OR your CI/CD pipeline to pull the latest config files

## Prerequisites
This tool uses the configuration from the [AWS CLI](https://aws.amazon.com/cli/). You can also [configure profiles or command line environment variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)

## Installation

```
Yarn:
yarn add patrickaton/aws-ssm-config-manager

NPM: 
npm install patrickaton/aws-ssm-config-manager
```

## Usage

There are three included functions in this package: push, pull and verify

### Push

Push config from a local .env file to AWS SSM Parameter Store

`ssm-config push`

### Pull

Pull config from AWS SSM Parameter Store and save to a local .env file.

`ssm-config pull`

### Compare

Compare values between a local .env file and AWS SSM Parameter Store.

`ssm-config compare`




### Using AWS Profiles

If you're using profiles with the AWS CLI you can provide the profile to use via the `AWS_PROFILE` environment variable. [See More](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)


### Options

`--help`
Display usage information about the tool or command.

`--env, -e [string] [default .env]`
The path to the env file to use. 

`--prefix, -pf [string] [default /]`
The path prefix to use when storing the keys in the parameter store. 

`--keys, -k [array] [default []]` 
An array of keys (separated by spaces) to filter down to. When keys are provided any keys that are not included will be skipped. 

`-r, --region  [string] [default: "us-east-1"]`
The default AWS Region to use
                                                
`--missingAwsAction  [string] [choices: "keep", "remove"] [default: "keep"]`
When a key already exists in AWS but not in the local .env file. When pushing, should the key be kept or removed from AWS.
                          
`--missingLocalAction  [string] [choices: "keep", "remove"] [default: "keep"]`
When a key exists locally, but is missing in AWS. When pulling, should the key be kept or removed locally.

`--config, -c [default none]`
A path to a pre-configured config file to use instead of command-line flags. See below.

`--verbose, -v[vv] [count] [default 0]`
The level of logging that the script should output, publishing different values at different levels

0. Only display summary information at the conclusion of the script.
1. Display keys that have changed
2. Display all non-skipped keys
3. Display all keys

### The config file

All of the options above can also be configured in a standalone json (or js file with a default export). This can be useful if you're storing the configuration for multiple environments or packages in a single AWS SSM instance OR if you want your CI/CD tools to only pull the configuration that is required by them.

When using both a config file and command line instructions, the command-line values will override the values from the config file.

[Example config.json](./example.config.json)
```
{
 "env": ".dev.env",
 "region": "us-east-1",
 "prefix": "/dev/config/"
}
```

[Example config.js](./example.config.js)
```
const env = process.env.NODE_ENV || 'local';

/**
 * A smart config loader for AWS Parameter Store.
 * Depending on the NODE_ENV passed to the script it will load the appropriate configuation.
 */
export default {
    region: 'us-east-1',
    env: `.env.${env}`,
    prefix: `/config/${env}/`
}
```
