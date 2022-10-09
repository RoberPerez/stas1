import { Command } from '../../struct/Command';

export default class ping extends Command {
  constructor() {
    super({
      data: {
        name: 'subcmd',
        description: 'kjasoidhaoid',
        options: [
          {
            name: 'ping',
            description: 'pong',
            type: 'SUB_COMMAND'
          },
          {
            name: 'pong',
            description: 'ping',
            type: 'SUB_COMMAND'
          }
        ],
        type: 'CHAT_INPUT'
      },
      async run({ client, int }) {
        const subcommand = int.options.getSubcommand(false);
        if (subcommand) {
          const cmd = require(`./subcmds/${subcommand}`).default;
          // const cmd = await import(`./subcmds/${subcommand}`).then(m => m.default);

          await cmd({ client, int });
        }
      }
    });
  }
}
