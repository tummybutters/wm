#!/usr/bin/env node
/**
 * Analytics Worker - Daily aggregation job
 * Computes word frequency, bet stats, and Brier scores for all users
 */

import { PrismaClient } from '@prisma/client';
import { computeAllUserStats, writeStats, getYesterdayRange } from './lib/analyze';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Analytics Worker Starting...\n');
    
    const { start, end } = getYesterdayRange();
    console.log(`📅 Processing date range: ${start.toISOString().split('T')[0]}`);
    console.log(`   Start: ${start.toISOString()}`);
    console.log(`   End:   ${end.toISOString()}\n`);
    
    // Compute stats for all users
    console.log('⚙️  Computing user statistics...');
    const stats = await computeAllUserStats(prisma);
    
    console.log(`✅ Computed stats for ${stats.length} user(s)\n`);
    
    // Write to database
    console.log('💾 Writing to daily_agg table...');
    await writeStats(prisma, stats);
    
    console.log('✅ Successfully wrote all records\n');
    
    // Print summary
    console.log('📊 Summary:');
    console.log('─────────────────────────────────────');
    
    for (const stat of stats) {
      console.log(`\nUser: ${stat.userId}`);
      console.log(`  Top words: ${stat.wordFreq.length} unique`);
      if (stat.wordFreq.length > 0) {
        const top3 = stat.wordFreq.slice(0, 3).map(w => `${w.word}(${w.count})`).join(', ');
        console.log(`    ${top3}${stat.wordFreq.length > 3 ? '...' : ''}`);
      }
      console.log(`  Bets: ${stat.betCounts.open} open, ${stat.betCounts.resolved} resolved`);
      console.log(`  Brier score: ${stat.brier.toFixed(4)}`);
    }
    
    console.log('\n✨ Analytics worker completed successfully!');
  } catch (error) {
    console.error('❌ Error running analytics:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


