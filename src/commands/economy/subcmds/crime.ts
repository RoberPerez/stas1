import type { CommandParams } from '../../../typings/Command';
import { Economia } from '../../../struct/Economia';

export default async function ({ int }: CommandParams) {
  const randomPlata = Math.floor(Math.random() * 190) + 10;
  const suerte = Math.floor(Math.random() * 2) + 2 > 2;

  if (suerte) await Economia.addMoney(int.user.id, int.guildId, 'cash', randomPlata);
  else await Economia.removeMoney(int.user.id, int.guildId, 'cash', randomPlata);

  return int.reply({
    content: `Cometiste un crimen y ${suerte ? 'ganaste' : 'perdiste'} S/${randomPlata}!`
  });
}
