import { Command } from '../../struct/Command';
import Servidores from '../../models/Servidores';

export default class counter extends Command {
  constructor() {
    super({
      data: {
        name: 'counter',
        description: '123',
        options: [
          {
            name: 'toggle',
            description: 'activa/desactiva el sistema para contar',
            type: 'SUB_COMMAND'
          },
          {
            name: 'channel',
            description: 'configura el canal para contar',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'target',
                description: 'selecciona el canal',
                type: 'CHANNEL',
                channelTypes: ['GUILD_TEXT'],
                required: true
              }
            ]
          },
          {
            name: 'config',
            description: 'Configura las opciones del contador',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'action',
                description: 'selecciona la opcion que quieres modificar',
                type: 'STRING',
                required: true,
                choices: [
                  {
                    name: 'Permitir Spam',
                    value: 'allowSpam'
                  },
                  {
                    name: 'Permitir Comentarios',
                    value: 'allowComments'
                  }
                ]
              },
              {
                name: 'value',
                description: 'selecciona el valor para la opción elegida',
                type: 'BOOLEAN',
                required: true
              }
            ]
          },
          {
            name: 'current',
            description: 'mira el numero actual',
            type: 'SUB_COMMAND'
          }
        ],
        type: 'CHAT_INPUT'
      },
      async run({ client, int }) {
        let data = (await Servidores.findById(int.guildId)) ?? new Servidores({ _id: int.guildId });

        const cmd = int.options.getSubcommand(true) as 'toggle' | 'channel' | 'config' | 'current';

        if (cmd != 'current' && !int.memberPermissions.has('ADMINISTRATOR'))
          return int.reply({
            content: 'no eres admin <:risa_png:959621091297460234>'
          });

        const commands = {
          toggle: async () => {
            data.counter.enabled = !data.counter.enabled;
            await data.save();

            return int.reply({
              content: `se ${data.counter.enabled ? '' : 'des'}activó el contador`
            });
          },
          channel: async () => {
            const channel = int.options.getChannel('target', true);

            if (!channel.permissionsFor(int.guild.me!).has(['ADD_REACTIONS', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']))
              return int.reply('no tengo permiso para enviar mensajes, reaccionar y/o ver el historial de mensajes');

            if (data.counter.channel == channel.id)
              return int.reply('ya escogiste este canal <:risa_png:959621091297460234>');

            data.counter.channel = channel.id;
            await data.save();
            return int.reply({
              content: `el canal para contar sera ${channel}`
            });
          },
          config: async () => {
            if (!data.counter.enabled) return int.reply('activa primero el sistema para contar xd');

            const option = int.options.getString('action', true) as 'allowSpam' | 'allowComments';
            const value = int.options.getBoolean('value', true);

            data.counter[option] = value;
            await data.save();

            return int.reply(`El módulo ${option} ha sido ${value ? '' : 'des'}activado.`);
          },
          current: async () => {
            if (!data.counter.enabled) return int.reply('activa primero el sistema para contar xd');
            return int.reply(`Actualmente el contador está en: \`${data.counter.lastNumber}\``);
          }
        };

        await commands[cmd]();
      }
    });
  }
}
