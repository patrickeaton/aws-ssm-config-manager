import { parse } from 'envfile';
import { promises } from 'fs';
import { ConfigSet } from '../models';

export const loadConfigFromFile = async (path: string): Promise<ConfigSet> => {
  try {
    if (!path) {
      return {};
    }

    const file = await promises.readFile(`${process.cwd()}/${path}`);
    return parse(file.toString());
  } catch (error) {
    // File not found or invalid
    return {};
  }
};
