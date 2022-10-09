import type { TwitchUser, TwitchStream } from '../typings/Twitch';
import axios from 'axios';

export class Twitch {
  private clientId = process.env.TWITCH_CLIENT_ID;
  private clientSecret = process.env.TWITCH_CLIENT_SECRET;
  private authKey = '';

  public async getAuthKey(): Promise<string> {
    if (this.authKey) {
      return this.authKey;
    }

    const response = await axios.post('https://id.twitch.tv/oauth2/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials'
    });

    this.authKey = response.data.access_token;
    return this.authKey;
  }

  public async getUser(user: string): Promise<TwitchUser | undefined> {
    const authKey = await this.getAuthKey();

    const response = await axios.get(
      `https://api.twitch.tv/helix/users?login=${user}`,
      {
        headers: {
          'Client-Id': this.clientId,
          Authorization: `Bearer ${authKey}`
        }
      }
    );

    response.data.data[0].created_at = Date.parse(response.data.data[0].created_at);
    return response.data.data[0];
  }

  public async getStream(
    user: TwitchUser | string
  ): Promise<TwitchStream | undefined> {
    const login = typeof user == 'string' ? user : user.login;
    const authKey = await this.getAuthKey();

    const response = await axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${login}`,
      {
        headers: {
          'Client-Id': this.clientId,
          Authorization: `Bearer ${authKey}`
        }
      }
    );

    response.data.data[0].thumbnail_url =
      response.data.data[0].thumbnail_url.replace('{width}x{height}', '1920x1080');

    response.data.data[0].started_at = Date.parse(response.data.data[0].started_at);

    return response.data.data[0];
  }

  public replacePlaceholders(
    base: string,
    context: { [key: string]: string | number }
  ) {
    return base.replace(/{([^}]+)}/g, (_, key) => `${context[key]!}`);
  }
}
