import { model, Schema } from 'mongoose';
import type { TwitchModel } from '../typings/Twitch';

export const TwitchDB = model(
  'twitch',
  new Schema<TwitchModel>({
    _id: String,
    channelId: String,
    streamers: [String],
    lastStreams: [
      {
        id: String,
        user: String
      }
    ],
    message: { type: String, default: '{user} esta en vivo en {url}' }
  })
);
