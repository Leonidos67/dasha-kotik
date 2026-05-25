import { config } from '../config.js';
import { Day } from '../models/Day.js';
import { Submission } from '../models/Submission.js';
import { Wallet } from '../models/Wallet.js';

export const COIN_DAYS_FROM = 1;
export const COIN_DAYS_TO = 5;
export const COIN_MAX_EARN = 10;
export const COIN_DAY5_REDEEM_COST = 10;
export const COIN_DAY5_REDEEM = 5;
export async function getWallet() {
  return Wallet.findOneAndUpdate({ userId: config.walletUserId }, {}, { upsert: true, new: true });
}

export async function getApprovedSubmissions1to5() {
  return Submission.find({
    status: 'approved',
    dayNumber: { $gte: COIN_DAYS_FROM, $lte: COIN_DAYS_TO },
  }).lean();
}

/** Заработано монет (макс. 10) за одобренные задания дней 1–5 */
export async function getCoinsEarned() {
  const approved = await getApprovedSubmissions1to5();
  return Math.min(approved.length, COIN_MAX_EARN);
}

export async function getCoinBalance() {
  const wallet = await getWallet();
  const earned = await getCoinsEarned();
  return Math.max(0, earned - wallet.coinsSpent);
}

export async function getCoinsBreakdown() {
  const days = await Day.find({
    dayNumber: { $gte: COIN_DAYS_FROM, $lte: COIN_DAYS_TO },
  })
    .sort({ dayNumber: 1 })
    .lean();

  const submissions = await Submission.find({
    dayNumber: { $gte: COIN_DAYS_FROM, $lte: COIN_DAYS_TO },
  }).lean();

  return days.map((day) => {
    const taskIds = day.tasks.map((t) => t._id.toString());
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

export async function getCoinState() {
  const wallet = await getWallet();
  const earned = await getCoinsEarned();
  const balance = Math.max(0, earned - wallet.coinsSpent);
  const breakdown = await getCoinsBreakdown();

  const day5 = await Day.findOne({ dayNumber: COIN_DAY5_REDEEM }).lean();

  const day5CoinGift = {
    dayNumber: COIN_DAY5_REDEEM,
    cost: COIN_DAY5_REDEEM_COST,
    canRedeem: balance >= COIN_DAY5_REDEEM_COST && !wallet.day5CoinGiftClaimed,
    redeemed: wallet.day5CoinGiftClaimed,
    seen: wallet.day5CoinGiftSeen,
    gift: day5?.gift || null,
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
