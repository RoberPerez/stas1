import { CommandInteraction } from 'discord.js';
import { ExtendedClient } from '../struct/Cliente';

export interface CommandParams {
  client: ExtendedClient;
  int: CommandInteraction<'cached'>;
}
