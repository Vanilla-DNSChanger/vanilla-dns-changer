import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BUILTIN_DNS_SERVERS, DNS_CATEGORIES } from '@vanilla-dns/shared';

export default class List extends Command {
  static description = 'List available DNS servers';

  static examples = [
    '<%= config.bin %> list',
    '<%= config.bin %> list --category iran',
    '<%= config.bin %> list -c popular',
  ];

  static flags = {
    category: Flags.string({
      char: 'c',
      description: 'Filter by category',
      options: DNS_CATEGORIES.map((c) => c.key),
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(List);

    let servers = BUILTIN_DNS_SERVERS;

    // Filter by category
    if (flags.category && flags.category !== 'all') {
      servers = servers.filter((s) => s.tags.includes(flags.category!));
    }

    console.log();
    console.log(chalk.bold.white('  Vanilla DNS Changer - Server List'));
    console.log(chalk.gray('  ──────────────────────────────────'));
    console.log();

    if (servers.length === 0) {
      console.log(chalk.yellow('  No servers found for this category'));
      return;
    }

    // Categories legend
    console.log(chalk.gray('  Categories:'));
    console.log(
      chalk.gray('  ') +
        DNS_CATEGORIES.map((c) => `${c.icon} ${c.name}`).join(chalk.gray(' • '))
    );
    console.log();

    // Group by first letter for better display
    const grouped: { [key: string]: typeof servers } = {};
    servers.forEach((s) => {
      const letter = s.name[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(s);
    });

    Object.keys(grouped)
      .sort()
      .forEach((letter) => {
        console.log(chalk.gray(`  [${letter}]`));
        grouped[letter].forEach((server) => {
          const tags = server.tags
            .slice(0, 2)
            .map((t) => {
              const cat = DNS_CATEGORIES.find((c) => c.key === t);
              return cat ? cat.icon : '';
            })
            .filter(Boolean)
            .join('');

          console.log(
            chalk.green(`    ${server.key.padEnd(20)}`) +
              chalk.white(server.name.padEnd(25)) +
              chalk.gray(server.servers.filter(Boolean).join(', ').padEnd(30)) +
              tags
          );
        });
        console.log();
      });

    console.log(chalk.gray(`  Total: ${servers.length} servers`));
    console.log();
    console.log(
      chalk.gray('  Use ') +
        chalk.cyan('vdns connect -n <name>') +
        chalk.gray(' to connect')
    );
    console.log();
  }
}
