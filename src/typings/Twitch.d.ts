export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: 'staff' | 'admin' | 'global_mod' | '';
  broadcaster_type: 'partner' | 'affiliate' | '';
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: Date;
}

export interface TwitchStream {
  id: `${number}`;
  user_id: `${number}`;
  user_login: string;
  user_name: string;
  game_id: `${number}`;
  game_name: string;
  type: 'live' | '';
  title: string;
  viewer_count: number;
  started_at: Date;
  language: string;
  thumbnail_url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${string}-1920x1080.jpg`;
  tag_ids: string[];
  is_mature: boolean;
}

export interface TwitchModel {
  _id: string;
  channelId?: string;
  streamers: string[];
  lastStreams: { id: string; user: string }[];
  message: string;
}
