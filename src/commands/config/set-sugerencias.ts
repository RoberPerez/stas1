import { Command } from '../../struct/Command';
import type { TextChannel } from 'discord.js';

// importamos nuestros models
import Servidores from '../../models/Servidores'; // solo servidores

export default class ping extends Command {
  constructor() {
    super({
      data: {
        name: 'set-sugerencias',
        description: 'establece el canal de sugerencias',
        options: [
          {
            name: 'channel',
            description: 'elige un canal o deja vacio para desactivar',
            type: 'CHANNEL',
            channelTypes: ['GUILD_NEWS', 'GUILD_TEXT'],
            required: false
          }
        ],
        type: 'CHAT_INPUT'
      },
      // antes del run le ponemos un async xd
      async run({ int }) {
        if (!int.member.permissions.has('ADMINISTRATOR'))
          // para que el comando sea exclusivo de admins
          return int.reply({
            content: 'no tienes permiso',
            ephemeral: true
          });

        // vamos a buscar en la db la informacion de nuestro server
        let data = (await Servidores.findById(int.guildId)) ?? new Servidores({ _id: int.guildId });

        // definimos nuestro canal
        // le asignaremos un tipo a esta variable
        const channel = int.options.getChannel('channel') as TextChannel;

        // si no se elige un canal, o sea que se quiere desactivar el modulo
        if (!channel) {
          if (!data.canales.sugerencias)
            return int.reply({
              content: 'cambios no detectados',
              ephemeral: true
            });

          data.canales.sugerencias = null;
          await data.save();

          return int.reply('sugerencias desactivadas');
        }

        // si el canal seleccionado ya esta guardado en la db
        if (channel.id == data.canales.sugerencias)
          return int.reply({
            content: 'cambios no detectados',
            ephemeral: true
          });

        // el bot necesita permiso para enviar mensajes, embeds y leer los mensajes para que funcione este tutorial
        if (!channel.permissionsFor(int.guild.me!).has(['SEND_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']))
          return int.reply({
            content: 'no tengo permiso para enviar mensajes, insertar embeds y/o leer el historial de mensajes',
            ephemeral: true
          });

        // establecemos el canal y guardamos los datos
        data.canales.sugerencias = channel.id;
        await data.save();

        return int.reply(`canal seleccionado: ${channel}`);
      }
    });
  }
}
