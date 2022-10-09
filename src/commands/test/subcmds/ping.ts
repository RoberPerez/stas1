import type { CommandParams } from '../../../typings/Command';

export default function ({ client, int }: CommandParams) {
  int.reply('pong ' + client.ws.ping);
}
