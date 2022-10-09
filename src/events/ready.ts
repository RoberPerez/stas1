import type { ExtendedClient } from '../struct/Cliente';
import { Event } from '../struct/Event';
import { TwitchDB } from '../models/Twitch';

export default class Ready extends Event {
  constructor(client: ExtendedClient) {
    super(client, 'ready');
  }

  run() {
    console.log(':3');

    setInterval(() => {
      TwitchDB.find({
        channelId: { $ne: undefined },
        streamers: { $ne: [] }
      }).then(twitches => {
        twitches.forEach(async twitch => {
          const guild = this.client.guilds.cache.get(twitch._id);
          if (!guild) {
            twitch.deleteOne();
            return;
          }

          const channel = guild.channels.cache.get(twitch.channelId!);
          if (!channel || !channel.isText()) {
            twitch.channelId = undefined;
            twitch.save();
            return;
          }

          for await (const username of twitch.streamers) {
            const streamer = await this.client.twitch.getUser(username);
            if (!streamer) {
              twitch.streamers = twitch.streamers.filter(u => u !== username);
              twitch.save();
              continue;
            }

            const currentStream = await this.client.twitch.getStream(streamer);
            if (!currentStream) continue;

            if (
              twitch.lastStreams.some(
                s => s.id == currentStream.id && s.user == username
              )
            )
              continue;

            twitch.lastStreams = twitch.lastStreams.filter(s => s.user != username);
            twitch.lastStreams.push({
              id: currentStream.id,
              user: username
            });
            await twitch.save();

            channel.send({
              content: this.client.twitch.replacePlaceholders(twitch.message, {
                user: streamer.display_name,
                title: currentStream.title,
                game: currentStream.game_name,
                viewers: currentStream.viewer_count,
                url: `https://twitch.tv/${streamer.login}`
              }),
              embeds: [
                {
                  color: 'PURPLE',
                  author: {
                    name: streamer.display_name,
                    icon_url: streamer.profile_image_url
                  },
                  title: currentStream.title,
                  url: `https://twitch.tv/${streamer.login}`,
                  image: {
                    url: currentStream.thumbnail_url
                  },
                  thumbnail: {
                    url: `https://static-cdn.jtvnw.net/ttv-boxart/${currentStream.game_id}-188x250.jpg`
                  },
                  timestamp: currentStream.started_at,
                  fields: [
                    {
                      name: 'espectadores',
                      value: currentStream.viewer_count.toLocaleString('en-US'),
                      inline: true
                    },
                    {
                      name: 'juego',
                      value: currentStream.game_name,
                      inline: true
                    }
                  ]
                }
              ]
            });
          }
        });
      });
    }, 30 * 1000);
  }
}
