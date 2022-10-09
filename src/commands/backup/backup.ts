import { Command } from '../../struct/Command';
import { create, fetch, load, remove } from 'discord-backup';
import { MessageButton, MessageActionRow, Message } from 'discord.js';
import { v4 as uuid } from 'uuid';

export default class extends Command {
  constructor() {
    super({
      data: {
        name: 'backup',
        description: 'gestiona copias de seguridad',
        options: [
          {
            name: 'create',
            description: 'crea una copia de seguridad',
            type: 'SUB_COMMAND'
          },
          {
            name: 'restore',
            description: 'restaura una copia de seguridad',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'id',
                description: 'id de la copia de seguridad',
                type: 'STRING',
                required: true
              }
            ]
          },
          {
            name: 'delete',
            description: 'elimina una copia de seguridad',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'id',
                description: 'id de la copia de seguridad',
                type: 'STRING',
                required: true
              }
            ]
          }
        ],
        type: 'CHAT_INPUT'
      },
      async run({ client, int }) {
        const subcmd = int.options.getSubcommand(true) as 'create' | 'restore' | 'delete';
        if (int.user.id != int.guild.ownerId) return int.reply({ content: 'no tienes permisos para hacer esto' });
        if (!int.guild.me!.permissions.has('ADMINISTRATOR'))
          return int.reply({ content: 'no tengo permisos para gestionar backups' });

        const handlers = {
          create: async () => {
            const buttonyes = new MessageButton({
              label: 'Crear',
              customId: 'backup-create',
              style: 'PRIMARY'
            });

            const buttonno = new MessageButton({
              label: 'Cancelar',
              customId: 'backup-cancel',
              style: 'SECONDARY'
            });

            const row = new MessageActionRow({ components: [buttonyes, buttonno] });

            const msg: Message<true> | null = await int
              .reply({
                content: '¿Estás seguro de que quieres crear una copia de seguridad?',
                components: [row],
                fetchReply: true
              })
              .catch(() => null);

            if (!msg) return;

            const collector = msg.createMessageComponentCollector({
              time: 30000,
              filter: btn => {
                if (btn.user.id == int.user.id) return true;
                else return false;
              },
              max: 1
            });

            collector.on('collect', async btn => {
              if (btn.customId == 'backup-create') {
                btn.deferReply({ ephemeral: true });
                let id = generarId();

                while (await fetch(id).catch(() => null)) id = generarId();
                await create(int.guild, {
                  backupID: id
                })
                  .then(backupData => {
                    btn.editReply({
                      content: `Copia de seguridad creada con éxito. ID: \`${backupData.id}\`. No compartas esta información con nadie.`
                    });
                    btn.user
                      .send({
                        content: `Copia de seguridad creada del servidor \`${int.guild.name}\` con éxito. ID: \`${backupData.id}\`. No compartas esta información con nadie.`
                      })
                      .catch(() => null);

                    btn.message.edit({ components: [], content: 'Copia de seguridad creada' });
                  })
                  .catch(er => console.log(er));
              } else if (btn.customId == 'backup-cancel') {
                btn.update({ components: [], content: 'operación cancelada' });
              }
            });
          },
          restore: async () => {
            const id = int.options.getString('id', true);
            const backup = await fetch(id).catch(() => null);
            if (!backup) return int.reply({ content: 'no se encontró la copia de seguridad' });

            const buttonyes = new MessageButton({
              label: 'Cargar',
              customId: 'backup-load',
              style: 'PRIMARY'
            });

            const buttonno = new MessageButton({
              label: 'Cancelar',
              customId: 'backupload-cancel',
              style: 'SECONDARY'
            });

            const row = new MessageActionRow({ components: [buttonyes, buttonno] });

            const msg: Message<true> | null = await int
              .reply({
                content: `¿Estás seguro de que quieres restaurar la copia de seguridad?`,
                components: [row],
                fetchReply: true,
                ephemeral: true
              })
              .catch(() => null);

            if (!msg) return;

            const collector = msg.createMessageComponentCollector({
              time: 30000,
              filter: btn => {
                if (btn.user.id == int.user.id) return true;
                else return false;
              }
            });

            collector.on('collect', async btn => {
              if (btn.customId == 'backup-load') {
                btn.deferReply({ ephemeral: true });
                await load(id, int.guild, {
                  clearGuildBeforeRestore: true,
                  maxMessagesPerChannel: 5,
                  allowedMentions: { parse: [] }
                })
                  .then(() => {
                    btn.update({ components: [] }).catch(() => null);
                    btn.user
                      .send({
                        content: `Su servidor \`${int.guild.name}\` ha sido restaurado con éxito.`
                      })
                      .catch(er => console.error(er));
                  })
                  .catch(er => {
                    console.log(er);
                    btn.user
                      .send({
                        content: `No ha sido posible restaurar su servidor \`${int.guild.name}\`. Error: ${er}`
                      })
                      .catch(() => null);
                    btn.update({ components: [], content: 'operación cancelada' }).catch(() => null);
                  });
              } else if (btn.customId == 'backupload-cancel') {
                btn.update({ components: [], content: 'operación cancelada' });
              }
            });
          },
          delete: async () => {
            const id = int.options.getString('id', true);
            const backup = await fetch(id).catch(() => null);
            if (!backup) return int.reply({ content: 'no se encontró la copia de seguridad' });

            const buttonyes = new MessageButton({
              label: 'Eliminar',
              customId: 'backup-delete',
              style: 'PRIMARY'
            });

            const buttonno = new MessageButton({
              label: 'Cancelar',
              customId: 'backup-cancel',
              style: 'SECONDARY'
            });

            const row = new MessageActionRow({ components: [buttonyes, buttonno] });

            const msg: Message<true> | null = await int
              .reply({
                content: `¿Estás seguro de que quieres eliminar la copia de seguridad?`,
                components: [row],
                fetchReply: true,
                ephemeral: true
              })
              .catch(() => null);

            if (!msg) return;

            const collector = msg.createMessageComponentCollector({
              time: 30000,
              filter: btn => {
                if (btn.user.id == int.user.id) return true;
                else return false;
              }
            });

            collector.on('collect', async btn => {
              if (btn.customId == 'backup-delete') {
                await remove(id)
                  .then(() => {
                    btn
                      .update({
                        components: [],
                        content: `La copia de seguridad \`${id}\` ha sido eliminada con éxito.`
                      })
                      .catch(() => null);
                  })
                  .catch(er => {
                    console.log(er);
                    btn
                      .update({ components: [], content: `ha ocurrido un error al eliminar la copia de seguridad` })
                      .catch(() => null);
                  });
              } else if (btn.customId == 'backup-cancel') {
                btn.update({ components: [], content: 'operación cancelada' });
              }
            });
          }
        };

        await handlers[subcmd]();
      }
    });
  }
}

function generarId() {
  const id = uuid();
  return id.substring(0, 8);
}
