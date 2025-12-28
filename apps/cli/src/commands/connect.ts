import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { prompt } from 'enquirer';
import { BUILTIN_DNS_SERVERS, isValidDnsAddress, parseDnsInput } from '@vanilla-dns/shared';
import type { DnsServer } from '@vanilla-dns/shared';
import { getPlatform } from '../platforms';

export default class Connect extends Command {
  static description = 'Connect to a DNS server';

  static examples = [
    '<%= config.bin %> connect',
    '<%= config.bin %> connect -n cloudflare',
    '<%= config.bin %> connect -s 8.8.8.8,8.8.4.4',
    '<%= config.bin %> connect -r',
  ];

  static flags = {
    server: Flags.string({
      char: 's',
      description: 'DNS server addresses (comma-separated)',
    }),
    name: Flags.string({
      char: 'n',
      description: 'Server name to connect to',
    }),
    random: Flags.boolean({
      char: 'r',
      description: 'Connect to a random server',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Connect);
    const platform = getPlatform();

    let servers: string[] = [];
    let serverName = 'Custom DNS';

    // Random server
    if (flags.random) {
      const randomServer = BUILTIN_DNS_SERVERS[Math.floor(Math.random() * BUILTIN_DNS_SERVERS.length)];
      servers = randomServer.servers.filter(Boolean) as string[];
      serverName = randomServer.name;
      console.log(chalk.cyan(`🎲 Random server selected: ${chalk.bold(serverName)}`));
    }
    // Server by name
    else if (flags.name) {
      const found = BUILTIN_DNS_SERVERS.find(
        (s) => s.name.toLowerCase().includes(flags.name!.toLowerCase()) ||
               s.key.toLowerCase() === flags.name!.toLowerCase()
      );
      if (!found) {
        this.error(`Server "${flags.name}" not found. Use ${chalk.cyan('vdns list')} to see available servers.`);
      }
      servers = found.servers.filter(Boolean) as string[];
      serverName = found.name;
    }
    // Custom server addresses
    else if (flags.server) {
      const parsed = parseDnsInput(flags.server);
      if (parsed.length === 0) {
        this.error('No valid DNS addresses provided');
      }
      for (const addr of parsed) {
        if (!isValidDnsAddress(addr)) {
          this.error(`Invalid DNS address: ${addr}`);
        }
      }
      servers = parsed.slice(0, 2);
    }
    // Interactive selection
    else {
      const choices = BUILTIN_DNS_SERVERS.map((s) => ({
        name: s.key,
        message: `${s.name} ${chalk.gray(`(${s.servers.filter(Boolean).join(', ')})`)}`,
      }));

      const response = await prompt<{ server: string }>({
        type: 'select',
        name: 'server',
        message: 'Select a DNS server',
        choices,
      });

      const selected = BUILTIN_DNS_SERVERS.find((s) => s.key === response.server)!;
      servers = selected.servers.filter(Boolean) as string[];
      serverName = selected.name;
    }

    // Connect
    const spinner = ora({
      text: `Connecting to ${chalk.green(serverName)}...`,
      color: 'green',
    }).start();

    try {
      const result = await platform.setDns(servers);

      if (result.success) {
        spinner.succeed(chalk.green(`Connected to ${chalk.bold(serverName)}`));
        console.log();
        console.log(chalk.gray('  DNS Servers:'));
        servers.forEach((s, i) => {
          console.log(chalk.green(`    ${i === 0 ? 'Primary:' : 'Secondary:'}`) + ' ' + chalk.white(s));
        });
        console.log();
      } else {
        spinner.fail(chalk.red(`Failed to connect: ${result.error}`));
        this.exit(1);
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      this.exit(1);
    }
  }
}
