import { ButtonInteraction, Message, MessageActionRow, MessageButton, TextChannel } from 'discord.js';
import type { ExtendedClient } from '../struct/Cliente';
import { Event } from '../struct/Event';

// importamos nuestros models
import Servidores from '../models/Servidores';
import Sugerencias from '../models/Sugerencias';

export default class Int extends Event {
  constructor(client: ExtendedClient) {
    super(client, 'interactionCreate');
  }

  async run(int: ButtonInteraction<'cached'>) {
    if (!int.isButton() || !int.customId.startsWith('sug-')) return;

    let data = await Servidores.findById(int.guildId);
    if (!data || !data.canales.sugerencias)
      return int.reply({
        content: 'las sugerencias estan desactivadas en este servidor',
        ephemeral: true
      });

    const id = int.customId.replace('sug-', '').substring(0, 8);

    const sugerencia = await Sugerencias.findById(id);
    if (!sugerencia)
      return int.reply({
        content: 'la sugerencia ha sido eliminada de la base de datos',
        ephemeral: true
      });

    // definimos el canal de sugerencias buscandolo en el servidor
    const channel = (await int.guild.channels.fetch(data.canales.sugerencias).catch(() => null)) as TextChannel;

    if (!channel)
      return int.reply({
        content: 'el canal de sugerencias ha sido eliminado o nunca existio :o',
        ephemeral: true
      });

    // hacemos un fetch a los mensajes del canal buscando por la id del mensaje guardado en la db
    const message = (await channel.messages.fetch(sugerencia.messageId).catch(() => null)) as Message<true>;
    // le pondre a esta variable un tipo message

    if (!message)
      return int.reply({
        content: 'no se encontro el mensaje. probablemente ha sido eliminado o se subio a otro canal',
        ephemeral: true
      });

    // definimos la accion que hara el usuario xd
    const action = int.customId.replace(`sug-${id}-`, '') == 'yes' ? 'favor' : 'contra';

    // buscamos si el usuario ya respondio la sugerencia
    const find = sugerencia.respuestas.find(x => x.id == int.user.id);

    if (find) {
      if (action == find.type)
        return int.reply({
          content: 'ya votaste en esta sugerencia',
          ephemeral: true
        });

      sugerencia.respuestas = sugerencia.respuestas.map(item => {
        if (item.id == int.user.id) return { ...item, type: action };
        else return item;
      });

      // si se rechaza/acepta la sugerencia, el contador de votos positivos/negativos se reduce en 1
      if (action == 'contra') sugerencia.votos.up -= 1;
      else sugerencia.votos.down -= 1;

      // solo si el usuario ya voto antes
    } else
      sugerencia.respuestas.push({
        id: int.user.id,
        type: action
      });

    if (action == 'contra') sugerencia.votos.down += 1;
    else sugerencia.votos.up += 1;

    const btnUp = message.components[0]!.components[0] as MessageButton;
    const btnDown = message.components[0]!.components[1] as MessageButton;

    btnUp.setLabel(`${sugerencia.votos.up}`);
    btnDown.setLabel(`${sugerencia.votos.down}`);

    // guardamos los votos en la base de datos
    await sugerencia.save();
    message.edit({ components: [new MessageActionRow({ components: [btnUp, btnDown] })] });

    return int.reply({
      content: 'tu voto ha sido contabilizado',
      ephemeral: true
    });
  }
}
