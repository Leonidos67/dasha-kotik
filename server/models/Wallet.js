import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'dasha', unique: true },
    coinsSpent: { type: Number, default: 0 },
    day5CoinGiftClaimed: { type: Boolean, default: false },
    day5CoinGiftSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model('Wallet', walletSchema);
