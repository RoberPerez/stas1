import type { CommandParams } from '../../../typings/Command';
import { Economia } from '../../../struct/Economia';

export default async function ({ int }: CommandParams) {
  const trabajos = ['programador', 'streamer', 'diseñador', 'arquitecto', 'cocinero'];
  const randomPlata = Math.floor(Math.random() * 190) + 10;

  const bal = await Economia.addMoney(int.user.id, int.guildId, 'cash', randomPlata);

  return int.reply({
    content: `Trabajaste de ${
      trabajos[Math.floor(Math.random() * trabajos.length)]
    } y ganaste S/${randomPlata}!\nTu dinero actual es S/${bal}`
  });
}
