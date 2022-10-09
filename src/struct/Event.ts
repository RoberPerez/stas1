import type { ExtendedClient } from './Cliente';

export abstract class Event {
  constructor(public client: ExtendedClient, public name: string, public once: boolean = false) {}

  public abstract run(...args: any[]): any;
}
