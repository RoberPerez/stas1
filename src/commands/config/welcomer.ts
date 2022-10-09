import { Command } from '../../struct/Command';
import Servidores from '../../models/Servidores';
import { genMessage } from '../../util/genMessage';
import validator from 'image-url-validator';
import { loadImage } from 'canvas';

export default class ping extends Command {
  constructor() {
    super({
      data: {
        name: 'welcomer',
        description: 'asdasd',
        options: [
          {
            name: 'channel',
            description: 'configura el canal de bienvenidas',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'target',
                description: 'selecciona el canal de bienvenidas, deja vacio para desactivar',
                type: 'CHANNEL',
                channelTypes: ['GUILD_TEXT', 'GUILD_NEWS']
              }
            ]
          },
          {
            name: 'msg-variables',
            description: 'mira las variables que puedes usar en el mensaje de bienvenida',
            type: 'SUB_COMMAND'
          },
          {
            name: 'message',
            description: 'configura el mensaje',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'content',
                description: 'el contenido del mensaje. usa /welcomer msg-variables para ver las variables',
                type: 'STRING'
              }
            ]
          },
          {
            name: 'embed',
            description: 'uoahsd',
            type: 'SUB_COMMAND_GROUP',
            options: [
              {
                name: 'enable',
                description: 'activa/desactiva el mensaje embed',
                type: 'SUB_COMMAND',
                options: [
                  {
                    name: 'switch',
                    description: 'true: activar | false: desactivar',
                    type: 'BOOLEAN',
                    required: true
                  }
                ]
              },
              {
                name: 'thumbnail',
                description: 'activa/desactiva la miniatura del mensaje embed',
                type: 'SUB_COMMAND',
                options: [
                  {
                    name: 'switch',
                    description: 'true: activar | false: desactivar',
                    type: 'BOOLEAN',
                    required: true
                  }
                ]
              },
              {
                name: 'color',
                description: 'cambia el color del embed',
                type: 'SUB_COMMAND',
                options: [
                  {
                    name: 'hex',
                    description: 'introduce un color hexadecimal',
                    type: 'STRING',
                    required: false
                  }
                ]
              }
            ]
          },
          {
            name: 'card',
            description: 'asdasd',
            type: 'SUB_COMMAND_GROUP',
            options: [
              {
                name: 'enable',
                description: 'activa/desactiva la tarjeta de bienvenida',
                type: 'SUB_COMMAND',
                options: [
                  {
                    name: 'switch',
                    description: 'true: activar | false: desactivar',
                    type: 'BOOLEAN',
                    required: true
                  }
                ]
              },
              {
                name: 'bg',
                description: 'cambia el fondo de la tarjeta',
                type: 'SUB_COMMAND',
                options: [
                  {
                    name: 'url',
                    description: 'la url de una imagen png/jpg',
                    type: 'STRING',
                    required: false
                  }
                ]
              }
            ]
          }
        ],
        type: 'CHAT_INPUT'
      },
      async run({ int }) {
        const subcmd = int.options.getSubcommandGroup(false) || int.options.getSubcommand(false);

        let data = (await Servidores.findById(int.guildId)) ?? new Servidores({ _id: int.guildId });

        switch (subcmd) {
          case 'channel': {
            const target = int.options.getChannel('target');
            if (!target) {
              if (!data.welcomer.channel)
                return int.reply({
                  content: 'el sistema de bienvenidas ya estaba desactivado',
                  ephemeral: true
                });

              data.welcomer.channel = null;
              await data.save();

              return int.reply({
                content: 'el sistema de bienvenidas está desactivado',
                ephemeral: true
              });
            }

            if (data.welcomer.channel == target.id)
              return int.reply({
                content: `${target} ya habia sido configurado`,
                ephemeral: true
              });

            if (!target.permissionsFor(int.guild.me!).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES']))
              return int.reply({
                content: `no tengo permiso para enviar mensajes, embeds y/o archivos en ${target}`,
                ephemeral: true
              });

            data.welcomer.channel = target.id;
            await data.save();

            return int.reply({
              content: `se ha establecido el canal de bienvenidas a ${target}`,
              ephemeral: true
            });
          }

          case 'msg-variables': {
            const variables = [
              // var, desc
              ['{{user}}', 'Menciona al usuario'],
              ['{{user.name}}', 'Nombre de usuario'],
              ['{{user.tag}}', 'Nombre de usuario + discriminador'],
              ['{{server.name}}', 'Nombre del servidor'],
              ['{{server.count}}', 'Cantidad de miembros del servidor']
            ];

            return int.reply({
              embeds: [
                {
                  color: 'RANDOM',
                  fields: variables.map(variable => ({
                    name: variable[0]!,
                    value: variable[1]!,
                    inline: true
                  })),
                  title: 'Lista de variables'
                }
              ]
            });
          }

          case 'message': {
            const content = int.options.getString('content');

            if (!content)
              return int.reply({
                embeds: [
                  {
                    description: genMessage(data.welcomer.message, int.member),
                    title: 'Mensaje actual'
                  }
                ],
                ephemeral: true
              });

            if (content.length >= 2000)
              return int.reply({
                content: 'no puedes enviar más de 2000 caracteres',
                ephemeral: true
              });

            data.welcomer.message = content;
            await data.save();

            return int.reply({
              embeds: [
                {
                  title: 'Se guardó el mensaje. Vista previa:',
                  description: genMessage(content, int.member)
                }
              ]
            });
          }

          case 'embed': {
            const subsub = int.options.getSubcommand(false);

            switch (subsub) {
              case 'enable': {
                const boolean = int.options.getBoolean('switch', true);

                data.welcomer.embed.enabled = boolean;
                await data.save();

                return int.reply({
                  content: 'el mensaje embed ha sido ' + (boolean ? '' : 'des') + 'activado'
                });
              }

              case 'color': {
                const hex = int.options.getString('hex') as `#${string}`;

                if (!data.welcomer.embed.enabled)
                  return int.reply({
                    content: 'el mensaje embed está desactivado. activalo para modificar esta opcion',
                    ephemeral: true
                  });

                if (!hex)
                  return int.reply({
                    embeds: [
                      {
                        color: data.welcomer.embed.color,
                        description: `Color actual: ${data.welcomer.embed.color}`
                      }
                    ]
                  });

                if (!/^#[0-9a-f]{6}/i.test(hex))
                  return int.reply({
                    content: 'el color hex que introduciste no es valido',
                    ephemeral: true
                  });

                data.welcomer.embed.color = hex;
                await data.save();

                return int.reply({
                  embeds: [
                    {
                      color: hex,
                      description: `Se guardó el color`
                    }
                  ]
                });
              }

              case 'thumbnail': {
                const boolean = int.options.getBoolean('switch', true);

                if (!data.welcomer.embed.enabled)
                  return int.reply({
                    content: 'el mensaje embed está desactivado. activalo para modificar esta opcion',
                    ephemeral: true
                  });

                data.welcomer.embed.thumbnail = boolean;
                await data.save();

                return int.reply({
                  content: 'la miniatura del mensaje embed ha sido ' + (boolean ? '' : 'des') + 'activado'
                });
              }
            }
            return;
          }

          case 'card': {
            const subsub = int.options.getSubcommand(false);

            switch (subsub) {
              case 'enable': {
                const boolean = int.options.getBoolean('switch', true);

                data.welcomer.image.enabled = boolean;
                await data.save();

                return int.reply({
                  content: 'la tarjeta ha sido ' + (boolean ? '' : 'des') + 'activado'
                });
              }

              case 'bg': {
                if (!data.welcomer.image.enabled)
                  return int.reply({
                    content: 'la tarjeta de bienvenida está desactivada. activala para modificar esta opcion',
                    ephemeral: true
                  });

                const imgValidator = validator as any;

                const url = int.options.getString('url');

                if (!url)
                  return int.reply({
                    embeds: [
                      {
                        image: { url: data.welcomer.image.bg },
                        title: 'Imagen actual'
                      }
                    ]
                  });

                const validate = await imgValidator.default(url);
                const canvasValidate = await loadImage(url).catch(() => null);

                if (!validate || !canvasValidate)
                  return int.reply({
                    content: 'la imagen no es válida, selecciona otra',
                    ephemeral: true
                  });

                data.welcomer.image.bg = url;
                await data.save();

                return int.reply({
                  embeds: [
                    {
                      image: { url },
                      title: 'Imagen guardada, vista previa:'
                    }
                  ]
                });
              }
            }
          }
        }
      }
    });
  }
}
