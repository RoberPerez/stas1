import type { CommandParams } from '../../../typings/Command';
import { Economia } from '../../../struct/Economia';

export default async function ({ int }: CommandParams) {
  const user = int.options.getUser('user') ? int.options.getMember('user') : int.member;
  if (!user)
    return int.reply({
      content: 'Debes mencionar a un miembro del servidor'
    });

  const balance = await Economia.getBalance(user.id, int.guildId);

  return int.reply({
    embeds: [
      {
        fields: [
          {
            name: 'efectivo',
            value: balance.cash.toLocaleString('es-ES')
          },
          {
            name: 'banco',
            value: balance.bank.toLocaleString('es-ES')
          }
        ],
        color: 'RANDOM',
        author: {
          name: `Dinero de ${user.user.tag}`,
          icon_url: user.displayAvatarURL({ dynamic: true })
        }
      }
    ]
  });
}
