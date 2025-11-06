# Analytics Worker

Standalone TypeScript worker for computing daily analytics aggregates.

## Purpose

This worker runs independently of the main web app, connecting read-only to the shared SQLite database (`./prisma/dev.db`). It computes daily snapshots of:

- **Word frequency**: Top 20 words from journal entries (tokenized, stopwords removed)
- **Bet statistics**: Count of open vs resolved bets
- **Brier score**: Calibration metric for probability predictions

Results are written to the `daily_agg` table for historical tracking and visualization.

## Architecture

```
worker/
├── index.ts           # Entry point - orchestrates the daily run
├── lib/
│   ├── analyze.ts     # Core analytics logic
│   ├── text.ts        # Tokenization & word frequency
│   └── brier.ts       # Brier score calculation
└── tsconfig.json      # TypeScript config (strict mode)
```

## Usage

### Run manually

```bash
pnpm run analyze
```

### Run via cron (example)

```bash
# Run daily at 1 AM UTC
0 1 * * * cd /path/to/wm && pnpm run analyze >> /var/log/wm-analytics.log 2>&1
```

## Algorithm

1. **Determine date range**: Yesterday 00:00 - 23:59 UTC
2. **For each user**:
   - Fetch all entries in date range
   - Tokenize text → lowercase, letters only, filter stopwords, count frequency
   - Store top 20 words as `[{word, count}, ...]`
   - Fetch all bets (not date-filtered)
   - Count open/resolved status
   - Compute Brier score over resolved bets: `mean((probability - outcome)²)`
3. **Upsert** into `daily_agg` (unique on `userId + day`)

## Database Schema

The worker writes to:

```prisma
model DailyAgg {
  id        String   @id @default(cuid())
  userId    String
  day       DateTime
  wordFreq  String   // JSON: [{word: string, count: number}]
  betCounts String   // JSON: {open: number, resolved: number}
  brier     Float    @default(0)
  notes     String?
  createdAt DateTime @default(now())

  @@unique([userId, day])
}
```

## Output Example

```
🔍 Analytics Worker Starting...

📅 Processing date range: 2025-11-04
   Start: 2025-11-04T00:00:00.000Z
   End:   2025-11-04T23:59:59.999Z

⚙️  Computing user statistics...
✅ Computed stats for 2 user(s)

💾 Writing to daily_agg table...
✅ Successfully wrote all records

📊 Summary:
─────────────────────────────────────

User: clu123abc
  Top words: 15 unique
    meeting(4), project(3), team(2)...
  Bets: 3 open, 7 resolved
  Brier score: 0.0891

✨ Analytics worker completed successfully!
```

## Dependencies

- **Prisma Client**: Auto-generated from schema (no manual install needed)
- **tsx**: Already in devDependencies, used to run TypeScript directly
- **Node 20+**: Required for modern features

## Notes

- **Read-only**: Worker never modifies users, entries, or bets
- **Deterministic**: No AI, no external APIs, no network calls
- **Idempotent**: Safe to re-run for same day (upserts existing records)
- **Separate from web app**: Can run while app is live with no conflicts


