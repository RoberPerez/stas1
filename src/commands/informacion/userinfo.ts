import { Command } from '../../struct/Command';
import Discord from 'discord.js';

export default class userinfo extends Command {
  constructor() {
    super({
      data: {
        name: 'userinfo',
        description: 'mira la info de un usuario',
        options: [
          {
            name: 'target',
            description: 'menciona a alguien',
            type: 'USER',
            required: false
          }
        ],
        type: 'CHAT_INPUT'
      },
      async run({ client, int }) {
        const target = int.options.getUser('target') || int.user;
        const member = target.id == int.user.id ? int.member : (int.options.getMember('target') as Discord.GuildMember);

        const fetch = await client.users.fetch(target.id, { force: true });

        const insignias = {
          // empleado de discord
          DISCORD_EMPLOYEE: '<:staff:916032486675480618>',

          // propietario de servidor socio
          PARTNERED_SERVER_OWNER: '<:partner:916037507160870932>',

          // eventos del hypesquad
          HYPESQUAD_EVENTS: '<:hypesquad:916034407528280086>',

          // bughunter 1 (verde)
          BUGHUNTER_LEVEL_1: '<:bughunter:916032486956482603>',

          // bravery
          HOUSE_BRAVERY: '<:bravery:916033606898548858>',

          // brilliance
          HOUSE_BRILLIANCE: '<:brilliance:916033607544500304>',

          // balance
          HOUSE_BALANCE: '<:balance:916033606898548857>',

          // partidario inicial
          EARLY_SUPPORTER: '<:earlysupporter:916035551767969823>',

          // team user
          TEAM_USER: '',

          // bughunter 2 (dorado)
          BUGHUNTER_LEVEL_2: '<:bughunter2:916032486713196566>',

          // bot verificado
          VERIFIED_BOT: '',

          // desarrollador inicial de bots verificado
          EARLY_VERIFIED_BOT_DEVELOPER: '<:botdev:916034885095936031>',

          // moderador de discord certificado
          DISCORD_CERTIFIED_MODERATOR: '<:moderator:916032486847430706>',

          // xd
          BOT_HTTP_INTERACTIONS: ''
        };

        const flags = target.flags!.toArray().map(f => insignias[f]);

        if (
          target.avatar?.startsWith('a_') ||
          fetch.banner ||
          target.flags!.toArray().filter(f => f == 'PARTNERED_SERVER_OWNER' || f == 'DISCORD_EMPLOYEE') ||
          (member && member.avatar)
        )
          flags.push('<:nitro:916036740110753812>');

        if (member && member.premiumSince) flags.push('<:booster:916037507014070303> ');

        const banner = fetch.bannerURL({ dynamic: true, size: 4096 });

        const embed_usuario = new Discord.MessageEmbed({
          color: fetch.accentColor || undefined,
          image: banner ? { url: banner } : undefined,
          author: {
            name: target.tag,
            iconURL: target.displayAvatarURL({ dynamic: true })
          },
          thumbnail: {
            url: target.displayAvatarURL({ dynamic: true })
          },
          description: [
            `Nombre: ${target.username}`,
            `Discriminador: #${target.discriminator}`,
            `Fecha de unión: ${Discord.Formatters.time(target.createdAt, 'R')}`,
            `Insignias: ${flags.join(' ')}`
          ].join('\n')
        });

        const btn_user = new Discord.MessageButton({
          customId: 'userinfo-user',
          style: 'SECONDARY',
          label: 'Usuario'
        });

        const btn_member = new Discord.MessageButton({
          customId: 'userinfo-member',
          style: 'SECONDARY',
          label: 'Miembro'
        });

        const msg = (await int.reply({
          embeds: [embed_usuario],
          fetchReply: true,
          components: member
            ? [
                new Discord.MessageActionRow({
                  components: [btn_user.setDisabled(true), btn_member.setDisabled(false)]
                })
              ]
            : []
        })) as Discord.Message;

        if (!member) return;

        const collector = msg.createMessageComponentCollector({ time: 60 * 1000 });

        const embed_miembro = new Discord.MessageEmbed({
          color: member.displayColor,
          image: banner ? { url: banner } : undefined,
          author: {
            name: member.displayName,
            iconURL: member.displayAvatarURL({ dynamic: true })
          },
          thumbnail: {
            url: member.displayAvatarURL({ dynamic: true })
          },
          description: [
            `Nombre: ${member.nickname || 'Ninguno'}`,
            `Fecha de unión: ${Discord.Formatters.time(member.joinedAt!, 'R')}`,
            `Roles: ${member.roles.cache.size}`,
            `Rol más alto: ${member.roles.highest}`,
            `Rol izado: ${member.roles.hoist || 'Ninguno'}`
          ].join('\n')
        });

        collector.on('collect', btn => {
          if (btn.user.id != int.user.id)
            return int.reply({
              content: 'No puedes usar esto >:|',
              ephemeral: true
            });

          btn.deferUpdate();

          switch (btn.customId) {
            case 'userinfo-user':
              msg
                .edit({
                  embeds: [embed_usuario],
                  components: [
                    new Discord.MessageActionRow({
                      components: [btn_user.setDisabled(true), btn_member.setDisabled(false)]
                    })
                  ]
                })
                .catch(() => null);
              break;

            default:
              msg
                .edit({
                  embeds: [embed_miembro],
                  components: [
                    new Discord.MessageActionRow({
                      components: [btn_user.setDisabled(false), btn_member.setDisabled(true)]
                    })
                  ]
                })
                .catch(() => null);
              break;
          }
          return;
        });

        collector.on('end', () => {
          msg.edit({
            components: [
              new Discord.MessageActionRow({
                components: [
                  new Discord.MessageButton({
                    label: 'Mensaje Expirado',
                    customId: 'userinfo-disabled',
                    style: 'SECONDARY',
                    disabled: true
                  })
                ]
              })
            ]
          });
        });
      }
    });
  }
}
