import { Day } from '../models/Day.js';
import { COIN_DAY5_REDEEM, getWallet } from './coins.js';

/** Только подарки, купленные за монетки (не за выполнение всех заданий дня). */
export async function buildGiftsList() {
  const wallet = await getWallet();
  const gifts = [];

  if (wallet.day5CoinGiftClaimed) {
    const day5 = await Day.findOne({ dayNumber: COIN_DAY5_REDEEM }).lean();
    if (day5?.gift) {
      gifts.push({
        dayNumber: COIN_DAY5_REDEEM,
        gift: day5.gift,
        isBonus: !!day5.isBonus,
        isFinale: !!day5.isFinale,
        seen: wallet.day5CoinGiftSeen,
        unlockedViaCoins: true,
      });
    }
  }

  return { gifts, wallet };
}
