import type { Interaction } from 'discord.js';
import type { ExtendedClient } from '../struct/Cliente';
import { Event } from '../struct/Event';

export default class Int extends Event {
  constructor(client: ExtendedClient) {
    super(client, 'interactionCreate');
  }

  run(int: Interaction<'cached'>) {
    if (int.isCommand() || int.isContextMenu()) {
      const nombre = int.commandName;
      const comando = this.client.commands.get(nombre);

      comando.run({ client: this.client, int });
      return;
    }

    if (int.isModalSubmit()) {
      const channelName = int.fields.getTextInputValue('nombre-canal');
      const channelDescription = int.fields.getTextInputValue('desc-canal');

      return int.reply({
        embeds: [
          {
            fields: [
              {
                name: 'nombre del canal',
                value: channelName
              },
              {
                name: 'descripcion del canal',
                value: channelDescription || 'ninguna'
              }
            ]
          }
        ]
      });
    }

    return;
  }
}
