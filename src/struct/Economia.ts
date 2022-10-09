import { Money } from '../models/Cash';

export class Economia {
  public static async getBalance(userId: string, guildId: string) {
    const money = await Money.findOne({ userId, guildId });
    if (!money) {
      new Money({ userId, guildId }).save();
      return { cash: 0, bank: 0 };
    }

    return { cash: money.cash, bank: money.bank };
  }

  public static async addMoney(
    userId: string,
    guildId: string,
    target: 'cash' | 'bank',
    amount: number
  ): Promise<number> {
    const money = await Money.findOne({ userId, guildId });
    if (!money) {
      new Money({ userId, guildId, [target]: amount }).save();
      return amount;
    }

    money[target] += amount;
    await money.save();

    return money[target];
  }

  public static async removeMoney(userId: string, guildId: string, target: 'cash' | 'bank', amount: number) {
    const money = await Money.findOne({ userId, guildId });
    if (!money) {
      new Money({ userId, guildId, [target]: -amount }).save();
      return -amount;
    }

    money[target] -= amount;
    await money.save();

    return money[target];
  }

  public static async deposit(userId: string, guildId: string, amount: number | 'all') {
    const money = await Money.findOne({ userId, guildId });
    if (!money) return false;
    if (amount == 'all') amount = money.cash;

    if (!money.cash || money.cash < amount) return false;

    money.cash -= amount;
    money.bank += amount;

    await money.save();
    return true;
  }

  public static async withdraw(userId: string, guildId: string, amount: number | 'all') {
    const money = await Money.findOne({ userId, guildId });
    if (!money) return false;
    if (amount == 'all') amount = money.bank;

    if (!money.bank || money.bank < amount) return false;

    money.cash += amount;
    money.bank -= amount;

    await money.save();
    return true;
  }
}
