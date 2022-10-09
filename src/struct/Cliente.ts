import { ApplicationCommandDataResolvable, Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import config from '../config';
import { connect } from 'mongoose';
import { Twitch } from './Twitch';

export class ExtendedClient extends Client<true> {
  constructor() {
    super({
      intents: 3839,
      allowedMentions: { repliedUser: false },
      failIfNotExists: false,
      presence: {
        status: 'idle'
      }
    });

    connect(process.env.MONGODB)
      .then(() => console.info('conectado a mongodb'))
      .catch(e => console.error(e));
  }

  commands: Collection<string, any> = new Collection();
  twitch = new Twitch();

  init() {
    this.twitch.getAuthKey().then(authKey => console.log(authKey));
    this.login();
    this.loadcomandos();
    this.loadeventos();
  }

  loadcomandos() {
    const cmds: ApplicationCommandDataResolvable[] = [];

    readdirSync('./src/commands/').forEach(dir => {
      readdirSync(`./src/commands/${dir}`)
        .filter(f => f.endsWith('.ts'))
        .forEach(async file => {
          const cmd = await import(`../commands/${dir}/${file}`);
          const comando = new cmd.default();

          cmds.push(comando.data);
          this.commands.set(comando.data.name, comando);
        });
    });

    this.on('ready', () => {
      if (config.comandos.testing)
        this.guilds.cache.get(config.comandos.servidor)!.commands?.set(cmds);
      else this.application!.commands.set(cmds);
    });
  }

  loadeventos() {
    readdirSync('./src/events/')
      .filter(f => f.endsWith('.ts'))
      .forEach(async file => {
        const clase = await import(`../events/${file}`);
        const evento = new clase.default(this);

        if (evento.once) this.once(evento.name, (...args) => evento.run(...args));
        else this.on(evento.name, (...args) => evento.run(...args));
      });
  }
}
