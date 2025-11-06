/**
 * Analytics computation for daily aggregates
 */

import { PrismaClient } from '@prisma/client';
import { getTopWords, WordCount } from './text';
import { brierScore } from './brier';

export interface BetCounts {
  open: number;
  resolved: number;
}

export interface UserDayStats {
  userId: string;
  day: Date;
  wordFreq: WordCount[];
  betCounts: BetCounts;
  brier: number;
}

/**
 * Get start and end of yesterday (UTC)
 */
export function getYesterdayRange(): { start: Date; end: Date } {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  
  const start = new Date(Date.UTC(
    yesterday.getUTCFullYear(),
    yesterday.getUTCMonth(),
    yesterday.getUTCDate(),
    0, 0, 0, 0
  ));
  
  const end = new Date(Date.UTC(
    yesterday.getUTCFullYear(),
    yesterday.getUTCMonth(),
    yesterday.getUTCDate(),
    23, 59, 59, 999
  ));
  
  return { start, end };
}

/**
 * Compute analytics for a specific user and day
 */
export async function computeUserDayStats(
  prisma: PrismaClient,
  userId: string,
  start: Date,
  end: Date
): Promise<UserDayStats> {
  // Fetch all entries in date range
  const entries = await prisma.entry.findMany({
    where: {
      userId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      text: true,
    },
  });
  
  // Compute word frequency
  const texts = entries.map(e => e.text);
  const wordFreq = getTopWords(texts, 20);
  
  // Fetch all bets for user (not filtered by date - we want all bets for brier)
  const bets = await prisma.bet.findMany({
    where: { userId },
    select: {
      status: true,
      probability: true,
      outcome: true,
    },
  });
  
  // Compute bet counts
  const betCounts: BetCounts = {
    open: bets.filter(b => b.status === 'open').length,
    resolved: bets.filter(b => b.status === 'resolved').length,
  };
  
  // Compute Brier score
  const brier = brierScore(
    bets.map(b => ({
      probability: b.probability,
      outcome: b.outcome,
    }))
  );
  
  // Use start date as the "day" (normalized to midnight UTC)
  return {
    userId,
    day: start,
    wordFreq,
    betCounts,
    brier,
  };
}

/**
 * Compute stats for all users for yesterday
 */
export async function computeAllUserStats(
  prisma: PrismaClient
): Promise<UserDayStats[]> {
  const { start, end } = getYesterdayRange();
  
  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true },
  });
  
  // Compute stats for each user
  const results: UserDayStats[] = [];
  
  for (const user of users) {
    const stats = await computeUserDayStats(prisma, user.id, start, end);
    results.push(stats);
  }
  
  return results;
}

/**
 * Write stats to daily_agg table
 */
export async function writeStats(
  prisma: PrismaClient,
  stats: UserDayStats[]
): Promise<void> {
  for (const stat of stats) {
    await prisma.dailyAgg.upsert({
      where: {
        userId_day: {
          userId: stat.userId,
          day: stat.day,
        },
      },
      update: {
        wordFreq: JSON.stringify(stat.wordFreq),
        betCounts: JSON.stringify(stat.betCounts),
        brier: stat.brier,
      },
      create: {
        userId: stat.userId,
        day: stat.day,
        wordFreq: JSON.stringify(stat.wordFreq),
        betCounts: JSON.stringify(stat.betCounts),
        brier: stat.brier,
      },
    });
  }
}


