import { Command } from '../../struct/Command';
import { Message, MessageActionRow, TextChannel } from 'discord.js';

// importamos nuestros models
import Servidores from '../../models/Servidores';
import Sugerencias from '../../models/Sugerencias';

export default class ping extends Command {
  constructor() {
    super({
      data: {
        name: 'responder',
        description: 'responde una sugerencia',
        options: [
          {
            name: 'id',
            description: 'la id de la sugerencia',
            type: 'STRING',
            required: true
          },
          {
            name: 'action',
            description: 'elige una accion',
            type: 'STRING',
            required: true,
            choices: [
              {
                name: 'aceptar',
                value: 'aceptar'
              },
              {
                name: 'rechazar',
                value: 'rechazar'
              }
            ]
          },
          {
            name: 'razon',
            description: 'escribe una razon',
            type: 'STRING',
            required: true
          }
        ],
        type: 'CHAT_INPUT'
      },
      async run({ client, int }) {
        // comprobamos los permisos del usuario
        if (!int.member.permissions.has('MANAGE_MESSAGES'))
          return int.reply({
            content: 'no tienes permiso',
            ephemeral: true
          });

        const id = int.options.getString('id');
        const action = int.options.getString('action') as 'aceptar' | 'rechazar';
        const reason = int.options.getString('razon', true);

        // obtener datos de la db
        const data = await Servidores.findById(int.guildId);
        if (!data || !data.canales.sugerencias)
          return int.reply({
            content: 'no se configuro el canal de sugerencias',
            ephemeral: true
          });

        const channel = (await int.guild.channels.fetch(data.canales.sugerencias).catch(() => null)) as TextChannel;

        if (!channel)
          return int.reply({
            content: 'no se encontro el canal de sugerencias',
            ephemeral: true
          });

        // esto para editar el mensaje
        if (!channel.permissionsFor(int.guild.me!).has(['SEND_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']))
          return int.reply({
            content: 'necesito permiso para enviar mensajes, embeds y/o leer el historial de mensajes'
          });

        const sugerencia = await Sugerencias.findById(id);
        if (!sugerencia)
          return int.reply({
            content: 'sugerencia desconocida',
            ephemeral: true
          });

        const message = (await channel.messages.fetch(sugerencia.messageId).catch(() => null)) as Message;

        // comprobamos si el mensaje existe y si se puede editar
        if (!message)
          return int.reply({
            content: 'no encontre la sugerencia en el canal. probablemente la han eliminado'
          });

        if (!message.editable)
          return int.reply({
            content: 'no puedo editar la sugerencia'
          });

        // a me olvide de comprobar si la sugerencia ha sido respondida
        if (sugerencia.status.tipo != 'Pendiente')
          return int.reply({
            content: 'la sugerencia ya ha sido respondida',
            ephemeral: true
          });

        // desactivamos los botones para que nadie mas vote
        const components = message.components[0]!.components.map(b => b.setDisabled(true));
        const row = new MessageActionRow({ components });

        message.edit({
          components: [row],
          embeds: [
            message.embeds[0]!.setColor(action == 'aceptar' ? 'GREEN' : 'RED').setFields([
              {
                name: `Estado: ${action == 'aceptar' ? 'Aceptado' : 'Rechazado'} por ${int.user.tag}`,
                value: reason.substring(0, 1000)
              }
            ])
          ]
        });

        sugerencia.status.tipo = action == 'aceptar' ? 'Aceptado' : 'Rechazado';
        sugerencia.status.razon = reason;

        await sugerencia.save();
        return int.reply('sugerencia editada');
      }
    });
  }
}
