#!/usr/bin/env node
/**
 * AI Insight Generator - LLM-powered user analysis worker
 * 
 * Reads daily aggregates and user entries, generates psychological/cognitive insights
 * using OpenAI, and stores results in insights_llm table.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { generateInsights } from './lib/openai';
import { composePrompts, UserData, WordCount, BetCounts } from './lib/composePrompt';

/**
 * Get yesterday's date (normalized to midnight UTC)
 */
function getYesterday(): Date {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  
  return new Date(Date.UTC(
    yesterday.getUTCFullYear(),
    yesterday.getUTCMonth(),
    yesterday.getUTCDate(),
    0, 0, 0, 0
  ));
}

/**
 * Fetch user data for insight generation
 */
async function fetchUserData(
  prisma: PrismaClient,
  userId: string,
  day: Date
): Promise<UserData | null> {
  // Fetch daily aggregate for the day
  const dailyAgg = await prisma.dailyAgg.findUnique({
    where: {
      userId_day: {
        userId,
        day,
      },
    },
  });

  if (!dailyAgg) {
    console.log(`  ⚠️  No daily aggregate found for user ${userId} on ${dayjs(day).format('YYYY-MM-DD')}`);
    return null;
  }

  // Parse stored JSON data
  const topWords: WordCount[] = JSON.parse(dailyAgg.wordFreq);
  const betCounts: BetCounts = JSON.parse(dailyAgg.betCounts);

  // Fetch recent entries (last 5 from that day or nearby)
  const dayStart = dayjs(day).startOf('day').toDate();
  const dayEnd = dayjs(day).endOf('day').toDate();

  const entries = await prisma.entry.findMany({
    where: {
      userId,
      createdAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    select: {
      text: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  const recentEntries = entries.map(e => e.text);

  return {
    userId,
    day,
    topWords,
    betCounts,
    brierScore: dailyAgg.brier,
    recentEntries,
  };
}

/**
 * Generate and store insights for a user
 */
async function generateUserInsights(
  prisma: PrismaClient,
  userId: string,
  day: Date
): Promise<boolean> {
  try {
    console.log(`\n📊 Processing user: ${userId}`);
    
    // Fetch user data
    const userData = await fetchUserData(prisma, userId, day);
    
    if (!userData) {
      console.log('  ⏭️  Skipping (no data available)');
      return false;
    }

    console.log(`  📝 Found ${userData.topWords.length} top words, ${userData.recentEntries.length} entries`);
    console.log(`  🎯 Brier score: ${userData.brierScore.toFixed(3)}`);

    // Compose prompts
    const { system, user } = composePrompts(userData);

    // Generate insights using OpenAI
    console.log('  🤖 Calling OpenAI...');
    const insights = await generateInsights(system, user);

    console.log(`  ✨ Generated insights:`);
    console.log(`     Themes: ${insights.themes.join(', ')}`);
    console.log(`     Mood: ${insights.mood}`);
    console.log(`     Biases: ${insights.biases.join(', ')}`);

    // Store in database
    await prisma.insightsLlm.upsert({
      where: {
        userId_day: {
          userId,
          day,
        },
      },
      update: {
        payload: JSON.stringify(insights),
      },
      create: {
        userId,
        day,
        payload: JSON.stringify(insights),
      },
    });

    console.log('  ✅ Saved to insights_llm table');
    return true;
  } catch (error) {
    console.error(`  ❌ Error processing user ${userId}:`, error);
    return false;
  }
}

/**
 * Main entry point
 */
async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🧠 AI Insight Generator Starting...\n');

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
      console.error('   Please add OPENAI_API_KEY to your .env file');
      process.exit(1);
    }

    const yesterday = getYesterday();
    console.log(`📅 Processing insights for: ${dayjs(yesterday).format('YYYY-MM-DD')}\n`);

    // Fetch all users who have daily_agg data for yesterday
    const dailyAggs = await prisma.dailyAgg.findMany({
      where: {
        day: yesterday,
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    console.log(`👥 Found ${dailyAggs.length} user(s) with data\n`);
    console.log('═══════════════════════════════════════════════');

    if (dailyAggs.length === 0) {
      console.log('\n⚠️  No users to process. Run the analytics worker first.');
      return;
    }

    // Process each user
    let successCount = 0;
    let failCount = 0;

    for (const agg of dailyAggs) {
      const success = await generateUserInsights(prisma, agg.userId, yesterday);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📈 Total: ${dailyAggs.length}`);
    console.log('\n✨ AI Insight Generator completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

