import type { GuildMember } from 'discord.js';

export function genMessage(template: string, member: GuildMember) {
  return template
    .replaceAll('{{user}}', member.user.toString())
    .replaceAll('{{user.name}}', member.user.username)
    .replaceAll('{{user.tag}}', member.user.tag)
    .replaceAll('{{server.name}}', member.guild.name)
    .replaceAll('{{server.count}}', member.guild.memberCount.toString());
}
