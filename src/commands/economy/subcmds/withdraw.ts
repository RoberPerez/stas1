import type { CommandParams } from '../../../typings/Command';
import { Economia } from '../../../struct/Economia';

export default async function ({ int }: CommandParams) {
  const amount = int.options.getInteger('amount');
  const balance = await Economia.getBalance(int.user.id, int.guildId);

  if (amount && balance.bank < amount) return int.reply('no tienes esa cantidad para retirar');

  await Economia.withdraw(int.user.id, int.guildId, amount || 'all').then(exito => {
    if (!exito) return int.reply('no tienes dinero suficiente para retirar');
    return int.reply('retiraste S/' + (amount || balance.bank));
  });
}
