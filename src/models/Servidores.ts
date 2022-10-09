import { model, Schema } from 'mongoose';

export default model(
  'servidores',
  new Schema<servidores>({
    _id: String,

    counter: {
      channel: { type: String, default: null },
      enabled: { type: Boolean, default: false },
      lastNumber: { type: Number, default: 0 },
      lastUser: { type: String, default: null },
      allowComments: { type: Boolean, default: false },
      allowSpam: { type: Boolean, default: false }
    },

    canales: {
      sugerencias: { type: String, default: null }
    },

    welcomer: {
      channel: { type: String, default: null },
      message: { type: String, default: 'Bienvenido {{user}} a {{server.name}}' },
      embed: {
        enabled: { type: Boolean, default: false },
        color: { type: String, default: '#eb4034' },
        thumbnail: { type: Boolean, default: false }
      },
      image: {
        enabled: { type: Boolean, default: false },
        bg: { type: String, default: 'https://static.canalapps.com/uploads/2020/08/fondos-de-pantalla-canalapps.jpg' }
      }
    }
  })
);

interface servidores {
  _id: string;

  counter: {
    channel: string;
    enabled: boolean;
    lastNumber: number;
    lastUser: string;
    allowComments: boolean;
    allowSpam: boolean;
  };

  canales: {
    sugerencias: string | null;
  };

  welcomer: {
    channel: string | null;
    message: string;
    embed: {
      enabled: boolean;
      color: `#${string}`;
      thumbnail: boolean;
    };
    image: {
      enabled: boolean;
      bg: string;
    };
  };
}
