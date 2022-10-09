import { Command } from '../../struct/Command';
import { Aki } from 'aki-api';
import type { guess } from 'aki-api/typings/src/functions';
import { MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';

var partidas = new Set();

export default class ping extends Command {
  constructor() {
    super({
      data: {
        name: 'akinator',
        description: 'juega al akinator',
        options: [],
        type: 'CHAT_INPUT'
      },
      async run({ int }) {
        if (partidas.has(int.guildId))
          return int.reply({
            content: 'Alguien ya está jugando en el servidor',
            ephemeral: true
          });

        const aki = new Aki({ region: 'es', childMode: true });

        const message = await int.reply({
          content: 'Iniciando partida...',
          fetchReply: true
        });

        partidas.add(int.guildId);

        const akistart = await aki
          .start()
          .then(() => 1)
          .catch(err => {
            partidas.delete(int.guildId);

            message
              .edit({
                content: 'Ha ocurrido un error\n`' + err + '`'
              })
              .catch(() => null);

            return null;
          });

        if (!akistart || !message || !message.editable) return;

        const primerembed = new MessageEmbed({
          author: {
            name: 'Akinator',
            icon_url:
              'https://play-lh.googleusercontent.com/rjX8LZCV-MaY3o927R59GkEwDOIRLGCXFphaOTeFFzNiYY6SQ4a-B_5t7eUPlGANrcw'
          },
          title: `Pregunta ${aki.currentStep + 1}`,
          fields: [
            {
              name: 'Pregunta',
              value: aki.question || 'No hay pregunta xd'
            },
            {
              name: 'Progreso',
              value: `${Math.round(aki.progress)}%`
            }
          ],
          color: 'YELLOW'
        });

        const detenerembed = new MessageEmbed({
          author: {
            name: 'Akinator',
            iconURL:
              'https://play-lh.googleusercontent.com/rjX8LZCV-MaY3o927R59GkEwDOIRLGCXFphaOTeFFzNiYY6SQ4a-B_5t7eUPlGANrcw'
          },
          color: 'RED'
        });

        const row1 = new MessageActionRow({
          components: [
            new MessageButton({
              customId: 'akinator-yes',
              label: 'Si',
              style: 'SECONDARY'
            }),
            new MessageButton({
              customId: 'akinator-no',
              label: 'No',
              style: 'SECONDARY'
            }),
            new MessageButton({
              customId: 'akinator-idk',
              label: 'No sé',
              style: 'SECONDARY'
            }),
            new MessageButton({
              customId: 'akinator-stop',
              label: 'Detener',
              style: 'SECONDARY'
            })
          ]
        });

        const row2 = new MessageActionRow({
          components: [
            new MessageButton({
              customId: 'akinator-pr',
              label: 'Probablemente',
              style: 'SECONDARY'
            }),
            new MessageButton({
              customId: 'akinator-pn',
              label: 'Probablemente no',
              style: 'SECONDARY'
            })
          ]
        });

        await message.edit({
          embeds: [primerembed],
          components: [row1, row2],
          content: null
        });

        if (!message || !message.editable) return;

        const collector = message.createMessageComponentCollector({
          time: 5 * 60 * 1000,
          componentType: 'BUTTON'
        });

        collector.on('collect', async btn => {
          if (btn.user.id != int.user.id)
            return btn.reply({
              content: 'no puedes usar esto',
              ephemeral: true
            });

          const action = btn.customId.replace('akinator-', '');

          switch (action) {
            case 'yes':
              await aki.step(0);
              break;

            case 'no':
              await aki.step(1);
              break;

            case 'idk':
              await aki.step(2);
              break;

            case 'pr':
              await aki.step(3);
              break;

            case 'pn':
              await aki.step(4);
              break;

            case 'stop': {
              row1.components.forEach(b => b.setDisabled(true));
              row2.components.forEach(b => b.setDisabled(true));

              await btn.update({
                embeds: [detenerembed.setDescription('El jugador paró la partida')],
                components: [row1, row2]
              });

              partidas.delete(int.guildId);
              collector.stop('manual');
              break;
            }
          }

          if (aki.progress >= 90 || aki.currentStep >= 48) {
            await aki.win();
            collector.stop('akiwin');

            const answer = aki.answers[0] as guess;
            const nsfw = answer.nsfw && !(int.channel as TextChannel).nsfw;

            const row3 = new MessageActionRow({
              components: [
                new MessageButton({
                  customId: 'akinator-yes',
                  label: 'Si',
                  style: 'SUCCESS'
                }),
                new MessageButton({
                  customId: 'akinator-no',
                  label: 'No',
                  style: 'DANGER'
                })
              ]
            });

            const guessembed = new MessageEmbed({
              author: {
                name: '¿Éste es tu personaje?',
                iconURL:
                  'https://play-lh.googleusercontent.com/rjX8LZCV-MaY3o927R59GkEwDOIRLGCXFphaOTeFFzNiYY6SQ4a-B_5t7eUPlGANrcw'
              },
              image: {
                url: nsfw ? 'https://i.ytimg.com/vi/8jh2KGu8jWE/maxresdefault.jpg' : answer.absolute_picture_path
              },
              description: `> ${answer.description}`,
              title: answer.name,
              color: 'YELLOW'
            });

            await btn.update({ embeds: [guessembed], components: [row3] });

            const collector2 = message.createMessageComponentCollector({ time: 60 * 1000 });

            collector2.on('collect', b => {
              if (b.user.id != int.user.id)
                return b.reply({
                  content: 'no puedes usar esto',
                  ephemeral: true
                });

              row3.components.forEach(x => x.setDisabled(true));
              partidas.delete(int.user.id);

              if (b.customId == 'akinator-yes')
                b.update({
                  embeds: [
                    {
                      color: 'GREEN',
                      description: `¡Genial! Acierto de nuevo`,
                      author: {
                        name: 'Akinator',
                        iconURL:
                          'https://play-lh.googleusercontent.com/rjX8LZCV-MaY3o927R59GkEwDOIRLGCXFphaOTeFFzNiYY6SQ4a-B_5t7eUPlGANrcw'
                      },
                      thumbnail: {
                        url: 'https://static.wikia.nocookie.net/video-game-character-database/images/9/9f/Akinator.png'
                      }
                    }
                  ],
                  components: [row3]
                }).catch(() => null);
              else
                b.update({
                  embeds: [
                    {
                      color: 'GREEN',
                      description: '¡Bravo, me lo ha puesto difícil!',
                      author: {
                        name: 'Akinator',
                        iconURL:
                          'https://play-lh.googleusercontent.com/rjX8LZCV-MaY3o927R59GkEwDOIRLGCXFphaOTeFFzNiYY6SQ4a-B_5t7eUPlGANrcw'
                      },
                      thumbnail: {
                        url: 'https://static.wikia.nocookie.net/video-game-character-database/images/9/9f/Akinator.png'
                      }
                    }
                  ],
                  components: [row3]
                }).catch(() => null);

              return collector2.stop('boton_presionado');
            });

            collector2.on('end', (_, reason) => {
              if (reason && reason == 'boton_presionado') return;

              row3.components.forEach(x => x.setDisabled(true));
              partidas.delete(int.user.id);

              btn.update({
                embeds: [detenerembed.setDescription('Se acabo el tiempo para escoger')],
                components: [row3]
              });
            });
          } else {
            const nextEmbed = new MessageEmbed({
              author: {
                name: 'Akinator',
                icon_url:
                  'https://play-lh.googleusercontent.com/rjX8LZCV-MaY3o927R59GkEwDOIRLGCXFphaOTeFFzNiYY6SQ4a-B_5t7eUPlGANrcw'
              },
              title: `Pregunta ${aki.currentStep + 1}`,
              fields: [
                {
                  name: 'Pregunta',
                  value: aki.question || 'No hay pregunta xd'
                },
                {
                  name: 'Progreso',
                  value: `${Math.round(aki.progress)}%`
                }
              ],
              color: 'YELLOW'
            });

            btn.update({
              embeds: [nextEmbed],
              components: [row1, row2]
            });
          }
        });

        collector.on('end', (_, reason) => {
          if (reason != 'time') return;

          row1.components.forEach(c => c.setDisabled(true));
          row2.components.forEach(c => c.setDisabled(true));

          message.edit({
            components: [row1, row2],
            embeds: [detenerembed.setDescription('Se acabó el tiempo de 5 minutos')]
          });

          return void partidas.delete(int.guildId);
        });
      }
    });
  }
}
