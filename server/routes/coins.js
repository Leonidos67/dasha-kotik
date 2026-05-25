import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import {
  COIN_DAY5_REDEEM,
  COIN_DAY5_REDEEM_COST,
  getCoinBalance,
  getCoinState,
  getWallet,
} from '../utils/coins.js';
import { ADMIN_ROLE, PLAYER_ROLE } from '../utils/roles.js';

const router = Router();

router.get('/', authRequired([PLAYER_ROLE, ADMIN_ROLE]), async (_req, res) => {
  const state = await getCoinState();
  res.json(state);
});

router.post('/redeem-day5-gift', authRequired([PLAYER_ROLE]), async (_req, res) => {
  const wallet = await getWallet();
  const balance = await getCoinBalance();

  if (wallet.day5CoinGiftClaimed) {
    return res.status(400).json({ error: 'Подарок за монетки уже получен' });
  }

  if (balance < COIN_DAY5_REDEEM_COST) {
    return res.status(400).json({
      error: `Нужно ${COIN_DAY5_REDEEM_COST} монет. Сейчас: ${balance}`,
    });
  }

  wallet.coinsSpent += COIN_DAY5_REDEEM_COST;
  wallet.day5CoinGiftClaimed = true;
  wallet.day5CoinGiftSeen = false;
  await wallet.save();

  const state = await getCoinState();
  res.json({
    ok: true,
    dayNumber: COIN_DAY5_REDEEM,
    ...state,
  });
});

export default router;
