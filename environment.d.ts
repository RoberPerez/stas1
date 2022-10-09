declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DISCORD_TOKEN: string;
      readonly MONGODB: string;
      readonly TWITCH_CLIENT_ID: string;
      readonly TWITCH_CLIENT_SECRET: string;
    }
  }
}

export {};
