import { Command, Args } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getPlatform } from '../platforms';
import { BUILTIN_DNS_SERVERS, isValidDnsAddress } from '@vanilla-dns/shared';

export default class Ping extends Command {
  static description = 'Ping a DNS server to test latency';

  static examples = [
    '<%= config.bin %> ping cloudflare',
    '<%= config.bin %> ping 8.8.8.8',
  ];

  static args = {
    target: Args.string({
      description: 'Server name or IP address to ping',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Ping);
    const platform = getPlatform();

    let server: string;
    let serverName: string;

    // Check if it's an IP address or server name
    if (isValidDnsAddress(args.target)) {
      server = args.target;
      serverName = args.target;
    } else {
      // Find server by name
      const found = BUILTIN_DNS_SERVERS.find(
        (s) =>
          s.name.toLowerCase().includes(args.target.toLowerCase()) ||
          s.key.toLowerCase() === args.target.toLowerCase()
      );
      if (!found) {
        this.error(
          `Server "${args.target}" not found. Use an IP address or a valid server name.`
        );
      }
      server = found.servers[0];
      serverName = found.name;
    }

    const spinner = ora({
      text: `Pinging ${chalk.cyan(serverName)}...`,
      color: 'cyan',
    }).start();

    try {
      const result = await platform.pingServer(server);

      if (result.success) {
        const color =
          result.latency < 100
            ? chalk.green
            : result.latency < 200
            ? chalk.yellow
            : chalk.red;

        spinner.succeed(
          `${chalk.cyan(serverName)} ${chalk.gray('(')}${server}${chalk.gray(')')} - ${color(
            `${result.latency}ms`
          )}`
        );
      } else {
        spinner.fail(chalk.red(`Failed to ping ${serverName}: ${result.error}`));
        this.exit(1);
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      this.exit(1);
    }
  }
}
