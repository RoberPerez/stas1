import { Command } from '../../struct/Command';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';

export default class ModalCommand extends Command {
  constructor() {
    super({
      data: {
        name: 'modal',
        description: 'uwu',
        options: [],
        type: 'CHAT_INPUT'
      },
      async run({ int }) {
        const modal = new Modal()
          .setCustomId('modal-example')
          .setTitle('Modal 😺')
          .setComponents(
            new MessageActionRow<TextInputComponent>().setComponents(
              new TextInputComponent()
                .setCustomId('nombre-canal')
                .setLabel('Escribe el nombre de tu canal')
                .setMaxLength(50)
                .setMinLength(2)
                .setPlaceholder('drgato')
                .setRequired(true)
                .setStyle('SHORT')
                .setValue('canal random de youtube')
            ),
            new MessageActionRow<TextInputComponent>().setComponents(
              new TextInputComponent()
                .setCustomId('desc-canal')
                .setLabel('Describe tu canal')
                .setMaxLength(500)
                .setMinLength(10)
                .setPlaceholder('mi canal es el mejor xd')
                .setRequired(false)
                .setStyle('PARAGRAPH')
            )
          );

        int.showModal(modal);

        // const submit = await int.awaitModalSubmit({ time: 60000 }).catch(() => null);
        // if (!submit) return;

        // const channelName = submit.fields.getTextInputValue('nombre-canal');
        // const channelDescription = submit.fields.getTextInputValue('desc-canal');

        // return submit.reply({
        //   embeds: [
        //     {
        //       fields: [
        //         {
        //           name: 'nombre del canal',
        //           value: channelName
        //         },
        //         {
        //           name: 'descripcion del canal',
        //           value: channelDescription || 'ninguna'
        //         }
        //       ]
        //     }
        //   ]
        // });
      }
    });
  }
}
