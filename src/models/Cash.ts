import { model, Schema } from 'mongoose';

export const Money = model<MoneyInterface>(
  'Money',
  new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    cash: { type: Number, default: 0 },
    bank: { type: Number, default: 0 }
  })
);

interface MoneyInterface {
  userId: string;
  guildId: string;
  cash: number;
  bank: number;
}
