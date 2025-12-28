import { Command } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getPlatform } from '../platforms';

export default class Flush extends Command {
  static description = 'Flush the DNS cache';

  static examples = ['<%= config.bin %> flush'];

  async run(): Promise<void> {
    const platform = getPlatform();

    const spinner = ora({
      text: 'Flushing DNS cache...',
      color: 'cyan',
    }).start();

    try {
      const result = await platform.flushDnsCache();

      if (result.success) {
        spinner.succeed(chalk.green('DNS cache flushed successfully'));
      } else {
        spinner.fail(chalk.red(`Failed to flush DNS cache: ${result.error}`));
        this.exit(1);
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      this.exit(1);
    }
  }
}
