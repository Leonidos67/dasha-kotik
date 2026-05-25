import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import {
  COIN_DAY5_REDEEM,
  COIN_DAY5_REDEEM_COST,
  getCoinBalance,
  getCoinState,
  getWallet,
} from '../utils/coins.js';
import { ADMIN_ROLE, normalizeRole, PLAYER_ROLES } from '../utils/roles.js';

const router = Router();

function actorRole(req) {
  return normalizeRole(req.user.role);
}

router.get('/', authRequired([...PLAYER_ROLES, ADMIN_ROLE]), async (req, res) => {
  const role = req.user.role === ADMIN_ROLE ? 'dasha' : actorRole(req);
  const state = await getCoinState(role);
  res.json(state);
});

router.post('/redeem-day5-gift', authRequired(PLAYER_ROLES), async (req, res) => {
  const role = actorRole(req);
  const wallet = await getWallet(role);
  const balance = await getCoinBalance(role);

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

  const state = await getCoinState(role);
  res.json({
    ok: true,
    dayNumber: COIN_DAY5_REDEEM,
    ...state,
  });
});

export default router;
