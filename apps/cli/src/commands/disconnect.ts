import { Command } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getPlatform } from '../platforms';

export default class Disconnect extends Command {
  static description = 'Disconnect from DNS and reset to default (DHCP)';

  static aliases = ['dis', 'd8t'];

  static examples = ['<%= config.bin %> disconnect'];

  async run(): Promise<void> {
    const platform = getPlatform();

    const spinner = ora({
      text: 'Disconnecting...',
      color: 'yellow',
    }).start();

    try {
      const result = await platform.clearDns();

      if (result.success) {
        spinner.succeed(chalk.green('Disconnected from custom DNS'));
        console.log(chalk.gray('  DNS has been reset to DHCP (automatic)'));
      } else {
        spinner.fail(chalk.red(`Failed to disconnect: ${result.error}`));
        this.exit(1);
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      this.exit(1);
    }
  }
}
