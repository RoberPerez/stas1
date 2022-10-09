import { Command } from '../../struct/Command';
import { TwitchDB } from '../../models/Twitch';

export default class ping extends Command {
  constructor() {
    super({
      data: {
        name: 'twitch',
        description: 'oa',
        options: [
          {
            name: 'set-channel',
            description: 'configura el canal',
            type: 'SUB_COMMAND',
            options: [
              {
                type: 'CHANNEL',
                channelTypes: ['GUILD_TEXT', 'GUILD_NEWS'],
                name: 'channel',
                description: 'canal a configurar'
              }
            ]
          },
          {
            name: 'set-message',
            description: 'configura el mensaje',
            type: 'SUB_COMMAND',
            options: [
              {
                type: 'STRING',
                name: 'message',
                description: 'mensaje a configurar',
                required: true
              }
            ]
          },
          {
            name: 'subscribe',
            description: 'suscribete a un streamer',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'streamer',
                type: 'STRING',
                description: 'streamer a suscribirse',
                required: true
              }
            ]
          },
          {
            name: 'unsubscribe',
            description: 'desuscribete a un streamer',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'streamer',
                type: 'STRING',
                description: 'streamer a desuscribirse',
                required: true
              }
            ]
          },
          {
            name: 'list-subscriptions',
            description: 'lista las suscripciones',
            type: 'SUB_COMMAND'
          }
        ],
        type: 'CHAT_INPUT'
      },
      async run({ client, int }) {
        if (!int.memberPermissions.has(['ADMINISTRATOR']))
          return int.reply('no eres admin >:v');

        const data =
          (await TwitchDB.findById(int.guildId)) ??
          new TwitchDB({ _id: int.guildId });

        const subcommand = int.options.getSubcommand(true) as
          | 'set-channel'
          | 'set-message'
          | 'subscribe'
          | 'unsubscribe'
          | 'list-subscriptions';

        switch (subcommand) {
          case 'set-channel': {
            const channel = int.options.getChannel('channel');

            if (!channel) {
              if (!data.channelId) {
                return int.reply(
                  'no tienes canal configurado, asi que no puedo desactivarlo'
                );
              } else {
                data.channelId = undefined;
                await data.save();
                return int.reply('sistema desactivado');
              }
            } else {
              if (data.channelId == channel.id)
                return int.reply('el canal ya esta configurado');

              if (
                !channel
                  .permissionsFor(client.user.id)
                  ?.has(['SEND_MESSAGES', 'EMBED_LINKS'])
              )
                return int.reply(
                  'no tengo permisos para enviar mensajes y/o embeds'
                );

              data.channelId = channel.id;
              await data.save();
              return int.reply(`canal configurado a ${channel.name}`);
            }
          }
          case 'subscribe': {
            const streamer = int.options.getString('streamer', true);

            if (data.streamers.length >= 5)
              return int.reply('no puedes suscribirte a mas de 5 streamers');

            if (data.streamers.some(s => s == streamer))
              return int.reply('ya estas suscrito a ese streamer');

            const fetchStreamer = await client.twitch
              .getUser(streamer)
              .catch(() => undefined);
            if (!fetchStreamer) return int.reply('no se pudo encontrar el streamer');

            data.streamers.push(streamer);
            await data.save();
            return int.reply(`suscrito a ${fetchStreamer.display_name}`);
          }
          case 'unsubscribe': {
            const streamer = int.options.getString('streamer', true);

            if (!data.streamers.some(s => s == streamer))
              return int.reply('no estas suscrito a ese streamer');

            data.streamers = data.streamers.filter(s => s != streamer);
            await data.save();
            return int.reply(`desuscrito a ${streamer}`);
          }
          case 'list-subscriptions': {
            if (!data.streamers.length)
              return int.reply('no tienes ninguna suscripcion');

            return int.reply(
              `tienes ${data.streamers.length} suscripciones:\n${data.streamers
                .map(s => `- ${s}`)
                .join('\n')}`
            );
          }
          case 'set-message': {
            const message = int.options.getString('message', true);

            if (message.length > 1000)
              return int.reply('el mensaje no puede tener mas de 1000 caracteres');

            data.message = message;
            await data.save();

            return int.reply(
              `mensaje configurado a ${message}\n\n**Vista previa:**:\n${client.twitch.replacePlaceholders(
                message,
                {
                  user: 'hastad',
                  title: '[ESP] hastad - RADIANTE HOY?',
                  game: 'VALORANT',
                  viewers: 395,
                  url: 'https://www.twitch.tv/hastad'
                }
              )}`
            );
          }
          default:
            return int.reply('no se reconoce el comando');
        }
      }
    });
  }
}
