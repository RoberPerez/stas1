import type { CommandParams } from '../../../typings/Command';
import { Economia } from '../../../struct/Economia';

export default async function ({ int }: CommandParams) {
  const amount = int.options.getInteger('amount');
  const balance = await Economia.getBalance(int.user.id, int.guildId);

  if (amount && balance.cash < amount) return int.reply('no tienes esa cantidad para depositar');

  await Economia.deposit(int.user.id, int.guildId, amount || 'all').then(exito => {
    if (!exito) return int.reply('no tienes dinero suficiente para depositar');
    return int.reply('depositaste S/' + (amount || balance.cash));
  });
}
