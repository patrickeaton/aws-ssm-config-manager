import { Parameters } from '../models';
import { DEFAULT_PARAMETERS } from '../constants';
import path from 'path';

/**
 * A fucntion to generate a config file, it will combine the default parameters with the parameters provided to the CLI or loaded from a config file.
 *
 * @param params The parameters provided to the CLI
 * @returns A combination of the default parameters and the parameters provided to the CLI
 */
export const generateParams = async (params: Parameters): Promise<any> => {
  if (!params.config) {
    return {
      ...params,
    };
  }

  const resolvedPath = path.resolve(process.cwd(), params.config);
  const fileParams = require(resolvedPath);

  /** Extract any params that have been provided by the command line that are different from the default */
  const overloadedParams: Partial<Parameters> = (
    Object.keys(params) as Array<keyof Parameters>
  ).reduce<Partial<Parameters>>(
    (acc: Partial<Parameters>, key: keyof Parameters) => {
      if (
        JSON.stringify(params[key]) !== JSON.stringify(DEFAULT_PARAMETERS[key])
      ) {
        acc[key] = params[key] as any;
      }

      return acc;
    },
    {}
  );

  return {
    ...DEFAULT_PARAMETERS,
    ...fileParams,
    ...overloadedParams,
  };
};
