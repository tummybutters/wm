#!/usr/bin/env node
/**
 * Integrations Worker - Polymarket data ingestion pipeline
 * 
 * Fetches user prediction data from Polymarket public APIs,
 * normalizes it, and stores both raw and structured copies in Postgres.
 * 
 * Flow:
 * 1. Read wallet addresses from wallet_links table
 * 2. For each wallet: fetch positions and value from Polymarket
 * 3. Save full JSON to external_positions_raw
 * 4. Join marketId with Gamma metadata
 * 5. Normalize + upsert to external_markets
 * 6. Wrap writes in transaction
 * 7. Skip duplicate runs (same user_id, source, day)
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PrismaClient } from '@prisma/client';
import { prisma } from './lib/db';
import { syncWalletPositions, NormalizedMarket } from './lib/polymarket';
import { createLogger } from './lib/log';

dayjs.extend(utc);

const logger = createLogger('IntegrationsWorker');

const SOURCE = 'polymarket';

/**
 * Get today's date normalized to midnight UTC
 */
function getTodayDate(): Date {
  const now = dayjs.utc();
  return new Date(Date.UTC(
    now.year(),
    now.month(),
    now.date(),
    0, 0, 0, 0
  ));
}

/**
 * Check if we already synced this user today
 */
async function hasAlreadySynced(userId: string, day: Date): Promise<boolean> {
  const existing = await prisma.externalPositionsRaw.findFirst({
    where: {
      userId,
      source: SOURCE,
      fetchedAt: {
        gte: dayjs(day).startOf('day').toDate(),
        lt: dayjs(day).endOf('day').toDate(),
      },
    },
    select: { id: true },
  });

  return !!existing;
}

/**
 * Fetch all wallet links grouped by user
 */
async function fetchWalletsByUser(): Promise<Map<string, string[]>> {
  const links = await prisma.walletLink.findMany({
    orderBy: [{ userId: 'asc' }, { chain: 'asc' }],
  });

  const byUser = new Map<string, string[]>();

  for (const link of links) {
    const wallets = byUser.get(link.userId) || [];
    wallets.push(link.address);
    byUser.set(link.userId, wallets);
  }

  logger.info(`Found ${links.length} wallet links for ${byUser.size} user(s)`);
  return byUser;
}

/**
 * Process a single user's wallets
 */
async function processUser(
  userId: string,
  wallets: string[],
  day: Date,
): Promise<{ marketsProcessed: number; duration: number }> {
  const userStartTime = Date.now();

  logger.subsection(`Processing user: ${userId}`);
  logger.info(`Found ${wallets.length} wallet(s)`);

  // Check if already synced today
  if (await hasAlreadySynced(userId, day)) {
    logger.warn('Already synced today, skipping');
    return { marketsProcessed: 0, duration: Date.now() - userStartTime };
  }

  let totalMarketsProcessed = 0;
  const rawPayloads: unknown[] = [];
  const normalizedMarkets: NormalizedMarket[] = [];

  // Sync each wallet
  for (const wallet of wallets) {
    logger.info(`Syncing wallet: ${wallet}`);

    const { raw, normalized } = await syncWalletPositions(wallet);

    if (raw) {
      rawPayloads.push(raw);
      totalMarketsProcessed += normalized.length;
      normalizedMarkets.push(...normalized);
    }
  }

  // Save to database in transaction
  try {
    await prisma.$transaction(async (tx: PrismaClient) => {
      // Save raw positions
      if (rawPayloads.length > 0) {
        await tx.externalPositionsRaw.create({
          data: {
            userId,
            source: SOURCE,
            payload: JSON.stringify(rawPayloads),
            fetchedAt: new Date(),
          },
        });

        logger.success(`Saved raw positions payload (${rawPayloads.length} wallet(s))`);
      }

      // Upsert normalized markets
      for (const market of normalizedMarkets) {
        await tx.externalMarkets.upsert({
          where: {
            userId_source_marketId_asOf: {
              userId,
              source: SOURCE,
              marketId: market.marketId,
              asOf: market.asOf,
            },
          },
          create: {
            userId,
            source: SOURCE,
            marketId: market.marketId,
            title: market.title,
            category: market.category,
            tags: JSON.stringify(market.tags),
            outcome: market.outcome,
            size: market.size,
            avgPrice: market.avgPrice,
            currentValue: market.currentValue,
            pnl: market.pnl,
            resolved: market.resolved,
            asOf: market.asOf,
          },
          update: {
            title: market.title,
            category: market.category,
            tags: JSON.stringify(market.tags),
            outcome: market.outcome,
            size: market.size,
            avgPrice: market.avgPrice,
            currentValue: market.currentValue,
            pnl: market.pnl,
            resolved: market.resolved,
            updatedAt: new Date(),
          },
        });
      }

      if (normalizedMarkets.length > 0) {
        logger.success(`Upserted ${normalizedMarkets.length} normalized market(s)`);
      }
    });
  } catch (error) {
    logger.error(`Failed to save user ${userId} data`, error);
    throw error;
  }

  const duration = Date.now() - userStartTime;

  // Log summary
  logger.success(
    `User sync complete: ${wallets.length} wallet(s), ${totalMarketsProcessed} market(s), ${duration}ms`,
  );

  return {
    marketsProcessed: totalMarketsProcessed,
    duration,
  };
}

/**
 * Main entry point
 */
async function main() {
  const startTime = Date.now();
  const today = getTodayDate();

  logger.section('Polymarket Integrations Worker');
  logger.info(`Starting sync for: ${dayjs(today).format('YYYY-MM-DD')}`);

  try {
    // Fetch wallet links
    const walletsByUser = await fetchWalletsByUser();

    if (walletsByUser.size === 0) {
      logger.warn('No wallet links found. Add wallet_links to get started.');
      return;
    }

    logger.section(`Processing ${walletsByUser.size} user(s)`);

    let totalMarketsProcessed = 0;
    let successCount = 0;
    let failCount = 0;

    // Process each user
    for (const [userId, wallets] of walletsByUser) {
      try {
        const result = await processUser(userId, wallets, today);
        totalMarketsProcessed += result.marketsProcessed;
        successCount++;
      } catch (error) {
        logger.error(`Failed to process user ${userId}`, error);
        failCount++;
      }
    }

    const totalDuration = Date.now() - startTime;

    logger.section('Sync Summary');
    console.log(`  👥 Users: ${successCount} succeeded, ${failCount} failed`);
    console.log(`  📊 Markets: ${totalMarketsProcessed} total processed`);
    console.log(`  ⏱️  Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);

    if (failCount === 0) {
      logger.success('All users synced successfully!');
    } else {
      logger.warn(`Completed with ${failCount} error(s)`);
    }
  } catch (error) {
    logger.error('Fatal error in integrations worker', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

