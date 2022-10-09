import type { ExtendedClient } from '../struct/Cliente';
import { Event } from '../struct/Event';
import type { Message } from 'discord.js';
import Servidores from '../models/Servidores';

export default class Ready extends Event {
  constructor(client: ExtendedClient) {
    super(client, 'messageCreate');
  }

  async run(msg: Message) {
    if (msg.author.bot || msg.system || msg.author.system || msg.webhookId || !msg.guild) return;

    const data = await Servidores.findById(msg.guildId);
    if (!data || !data.counter.enabled || data.counter.channel != msg.channelId) return;

    const msgNumber = data.counter.allowComments ? msg.content.split(' ')[0] : msg.content;
    const toNumber = Number(msgNumber);

    if (toNumber != data.counter.lastNumber + 1) return msg.delete();
    if (!data.counter.allowSpam) if (msg.author.id == data.counter.lastUser) return msg.delete();

    data.counter.lastNumber = toNumber;
    data.counter.lastUser = msg.author.id;
    await data.save();
    return;
  }
}
