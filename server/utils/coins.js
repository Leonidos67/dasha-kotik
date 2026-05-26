import { config } from '../config.js';
import { Day } from '../models/Day.js';
import { Submission } from '../models/Submission.js';
import { Wallet } from '../models/Wallet.js';
import { getUserIdForRole, normalizeRole, PLAYER_ROLE } from './roles.js';
import { visibleTasks } from './tasks.js';

export const COIN_DAYS_FROM = 1;
export const COIN_DAYS_TO = 5;
export const COIN_MAX_EARN = 10;
export const COIN_DAY5_REDEEM_COST = 10;
export const COIN_DAY5_REDEEM = 5;

/** Shown to player instead of DB gift text (keeps day-5 surprise secret). */
export const DAY5_SURPRISE_GIFT = {
  title: 'Сюрприз от Лёни 🎁',
  description:
    'Зай, ты заслужила! Лёня свяжется с тобой и всё устроит — это твой секретный подарок за монетки.',
};

export async function getWallet(role = PLAYER_ROLE) {
  const userId = getUserIdForRole(role);
  return Wallet.findOneAndUpdate({ userId }, {}, { upsert: true, new: true });
}

export async function getApprovedSubmissions1to5(role = PLAYER_ROLE) {
  const userId = getUserIdForRole(role);
  return Submission.find({
    userId,
    status: 'approved',
    dayNumber: { $gte: COIN_DAYS_FROM, $lte: COIN_DAYS_TO },
  }).lean();
}

export async function getCoinsEarned(role = PLAYER_ROLE) {
  const approved = await getApprovedSubmissions1to5(role);
  return Math.min(approved.length, COIN_MAX_EARN);
}

export async function getCoinBalance(role = PLAYER_ROLE) {
  const wallet = await getWallet(role);
  const earned = await getCoinsEarned(role);
  return Math.max(0, earned - wallet.coinsSpent);
}

export async function getCoinsBreakdown(role = PLAYER_ROLE) {
  const userId = getUserIdForRole(role);
  const days = await Day.find({
    dayNumber: { $gte: COIN_DAYS_FROM, $lte: COIN_DAYS_TO },
  })
    .sort({ dayNumber: 1 })
    .lean();

  const submissions = await Submission.find({
    userId,
    dayNumber: { $gte: COIN_DAYS_FROM, $lte: COIN_DAYS_TO },
  }).lean();

  return days.map((day) => {
    const taskIds = visibleTasks(day.tasks).map((t) => t._id.toString());
    const daySubs = submissions.filter((s) => s.dayNumber === day.dayNumber);
    const approved = taskIds.filter((id) =>
      daySubs.some((s) => s.taskId.toString() === id && s.status === 'approved')
    ).length;

    return {
      dayNumber: day.dayNumber,
      taskCount: taskIds.length,
      approvedCount: approved,
      coins: approved,
    };
  });
}

export async function getCoinState(role = PLAYER_ROLE) {
  const wallet = await getWallet(role);
  const earned = await getCoinsEarned(role);
  const balance = Math.max(0, earned - wallet.coinsSpent);
  const breakdown = await getCoinsBreakdown(role);

  const day5 = await Day.findOne({ dayNumber: COIN_DAY5_REDEEM }).lean();

  const day5CoinGift = {
    dayNumber: COIN_DAY5_REDEEM,
    cost: COIN_DAY5_REDEEM_COST,
    canRedeem: balance >= COIN_DAY5_REDEEM_COST && !wallet.day5CoinGiftClaimed,
    redeemed: wallet.day5CoinGiftClaimed,
    seen: wallet.day5CoinGiftSeen,
    gift: wallet.day5CoinGiftClaimed ? DAY5_SURPRISE_GIFT : null,
    title: `Получить подарок за ${COIN_DAY5_REDEEM_COST} монет (5 день)`,
  };

  return {
    earned,
    spent: wallet.coinsSpent,
    balance,
    maxEarn: COIN_MAX_EARN,
    breakdown,
    day5CoinGift,
  };
}
