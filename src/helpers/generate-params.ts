import { Parameters } from '../models';
import { DEFAULT_PARAMETERS, DEFAULT_CONFIG_PATHS } from '../constants';
import path from 'path';

/**
 * Check the provided path and any default paths for a config file, if one is found, return the config file.
 * 
 * @param filePath The provided path to the config file.
 * @returns 
 */
const getFileConfig = (filePath?: string) => {
  // If a path is passed, then use it. Otherwise, check the default paths.
  if (filePath) {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    console.log('Loading config from:', filePath);
    return require(resolvedPath);
  }

  for (const defaultPath of DEFAULT_CONFIG_PATHS) {
    try {
      const resolvedPath = path.resolve(process.cwd(), defaultPath);
      const config = require(resolvedPath);
      console.log('Loading config from:', resolvedPath);
      return config;
    } catch (e) {
      continue;
    }
  }

  return {};
};

/**
 * A fucntion to generate a config file, it will combine the default parameters with the parameters provided to the CLI or loaded from a config file.
 *
 * @param params The parameters provided to the CLI
 * @returns A combination of the default parameters and the parameters provided to the CLI
 */
export const generateParams = async (params: Parameters): Promise<any> => {  
  const fileParams = getFileConfig(params?.config);

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
