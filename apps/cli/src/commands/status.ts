import { Command } from '@oclif/core';
import chalk from 'chalk';
import { getPlatform } from '../platforms';
import { BUILTIN_DNS_SERVERS } from '@vanilla-dns/shared';

export default class Status extends Command {
  static description = 'Check current DNS connection status';

  static examples = ['<%= config.bin %> status'];

  async run(): Promise<void> {
    const platform = getPlatform();

    console.log();
    console.log(chalk.bold.white('  Vanilla DNS Changer - Status'));
    console.log(chalk.gray('  ─────────────────────────────'));
    console.log();

    try {
      const status = await platform.getStatus();
      const activeDns = status.activeDns;

      // Connection status
      if (status.isConnected && activeDns.length > 0) {
        console.log(chalk.green('  ● Connected'));

        // Try to find the server name
        let serverName = 'Custom DNS';
        const matchedServer = BUILTIN_DNS_SERVERS.find(
          (s) => s.servers[0] === activeDns[0]
        );
        if (matchedServer) {
          serverName = matchedServer.name;
        }

        console.log(chalk.gray('  Server: ') + chalk.white(serverName));
      } else {
        console.log(chalk.gray('  ○ Disconnected'));
      }

      // DNS addresses
      console.log();
      console.log(chalk.gray('  Current DNS:'));
      if (activeDns.length > 0) {
        activeDns.forEach((dns, i) => {
          console.log(chalk.green(`    ${i + 1}. `) + chalk.white(dns));
        });
      } else {
        console.log(chalk.gray('    Using DHCP (automatic)'));
      }

      // Platform info
      console.log();
      console.log(chalk.gray('  Platform: ') + chalk.white(platform.type));

      console.log();
    } catch (error: any) {
      console.log(chalk.red(`  Error: ${error.message}`));
      this.exit(1);
    }
  }
}
