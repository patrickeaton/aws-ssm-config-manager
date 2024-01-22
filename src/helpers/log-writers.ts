import chalk from 'chalk';

export const log = (message: string) => console.log(message);
export const info = (message: string) => console.log(chalk.blue(message));
export const warn = (message: string) => console.log(chalk.yellow(message));
export const success = (message: string) => console.log(chalk.green(message));
export const error = (message: string) => console.log(chalk.red(message));
