const env = process.env.NODE_ENV || 'local';

/**
 * A smart config loader for AWS Parameter Store.
 * Depending on the NODE_ENV passed to the script it will load the appropriate configuation.
 */
module.exports = {
  default: {
    region: 'us-east-1',
    env: `.${env}.env`,
    prefix: `/${env}/config/`,
  },
};
