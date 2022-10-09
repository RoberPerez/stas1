import { Command } from '../../struct/Command';
import { MessageActionRow, MessageButton, TextChannel } from 'discord.js';
import { v4 as uuid } from 'uuid';

// importamos nuestros models
import Servidores from '../../models/Servidores';
import Sugerencias from '../../models/Sugerencias';

export default class ping extends Command {
  constructor() {
    super({
      data: {
        name: 'sugerir',
        description: 'sugiere algo para el server',
        options: [
          {
            name: 'content',
            description: 'el contenido de tu sugerencia',
            type: 'STRING',
            required: true
          }
        ],
        type: 'CHAT_INPUT'
      },
      async run({ int }) {
        // vamos a buscar en la db la informacion de nuestro server
        let data = await Servidores.findById(int.guildId);

        // si la info no existe dara error
        if (!data || !data.canales.sugerencias)
          return int.reply({
            content: 'las sugerencias no han sido configuradas',
            ephemeral: true
          });

        const channelId = data.canales.sugerencias;
        const channel = (await int.guild.channels.fetch(channelId).catch(() => null)) as TextChannel;

        // si el canal no existe
        if (!channel)
          return int.reply({
            content: 'el canal no existe o ha sido eliminado',
            ephemeral: true
          });

        // el bot necesita permiso para enviar mensajes, embeds y leer los mensajes para que funcione este tutorial
        if (!channel.permissionsFor(int.guild.me!).has(['SEND_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']))
          return int.reply({
            content: 'no tengo permiso para enviar mensajes, insertar embeds y/o leer el historial de mensajes',
            ephemeral: true
          });

        const content = int.options.getString('content', true);
        let id = generarId();

        // usaremos un bucle while para detectar IDs repetidas en la base de datos
        while (await Sugerencias.findById(id)) {
          id = generarId();
        }

        // a me olvide los botones xd
        const upBtn = new MessageButton({
          // esto lo ponen tal cual esta aqui
          customId: `sug-${id}-yes`,
          label: '0',
          // esto ya lo personalizan ustedes
          style: 'SECONDARY',
          emoji: '👍' // el emoji es recomendable tenerlo para que sea un indicador xd
        });

        const downBtn = new MessageButton({
          // esto lo ponen tal cual esta aqui
          customId: `sug-${id}-no`,
          label: '0',
          // esto ya lo personalizan ustedes
          style: 'SECONDARY',
          emoji: '👎' // el emoji es recomendable tenerlo para que sea un indicador xd
        });

        // creamos un action row
        const row = new MessageActionRow({ components: [upBtn, downBtn] });

        const message = await channel.send({
          // aca enviamos la sugerencia
          embeds: [
            {
              color: 'DARK_BUT_NOT_BLACK',
              description: content,
              fields: [
                {
                  name: 'Estado: Pendiente',
                  value: 'Esperando respuesta...'
                }
              ],
              author: {
                name: `Nueva sugerencia de ${int.user.tag}`,
                iconURL: int.member.displayAvatarURL({ dynamic: true })
              },
              footer: {
                text: `ID: ${id}`
              },
              timestamp: Date.now(),
              thumbnail: {
                url: int.member.displayAvatarURL({ dynamic: true })
              }
            }
          ],
          // y aqui los botones
          components: [row]
        });

        // guardaremos los datos de la sugerencia en la db
        await new Sugerencias({
          _id: id,
          messageId: message.id
        }).save();

        // hay que responder a la interaccion
        int.reply({
          content: `sugerencia enviada al canal ${channel}`
        });

        // creamos una funcion para generar IDs
        function generarId() {
          const id = uuid();
          return id.substring(0, 8);
        }
      }
    });
  }
}
