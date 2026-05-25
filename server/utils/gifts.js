import { Day } from '../models/Day.js';
import { COIN_DAY5_REDEEM, DAY5_SURPRISE_GIFT, getWallet } from './coins.js';
import { getUserIdForRole, PLAYER_ROLE } from './roles.js';

export async function buildGiftsList(role = PLAYER_ROLE) {
  const wallet = await getWallet(role);
  const gifts = [];

  if (wallet.day5CoinGiftClaimed) {
    const day5 = await Day.findOne({ dayNumber: COIN_DAY5_REDEEM }).lean();
    if (day5?.gift) {
      gifts.push({
        dayNumber: COIN_DAY5_REDEEM,
        gift: DAY5_SURPRISE_GIFT,
        isBonus: !!day5.isBonus,
        isFinale: !!day5.isFinale,
        seen: wallet.day5CoinGiftSeen,
        unlockedViaCoins: true,
      });
    }
  }

  return { gifts, wallet };
}
