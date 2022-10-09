import type Discord from 'discord.js';
import type { ExtendedClient } from './Cliente';

export class Command {
  constructor(opciones: {
    data: {
      name: string;
      description: string;
      type: Discord.ApplicationCommandType;
      options: Discord.ApplicationCommandOptionData[];
    };
    run: ({ client, int }: { client: ExtendedClient; int: Discord.CommandInteraction<'cached'> }) => any;
  }) {
    this.data = opciones.data;
    this.run = opciones.run;
  }

  data: {
    name: string;
    description: string;
    type: Discord.ApplicationCommandType;
    options: Discord.ApplicationCommandOptionData[];
  };
  run: ({ client, int }: { client: ExtendedClient; int: Discord.CommandInteraction<'cached'> }) => any;
}
