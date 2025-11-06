# Quick Setup Guide

## Prerequisites

1. **OpenAI API Key** - Get one from [platform.openai.com](https://platform.openai.com/api-keys)
2. **Analytics data** - Run the analytics worker first

## Installation

### 1. Install worker dependencies

```bash
cd worker-llm
npm install
```

### 2. Configure environment variables

Add to root `.env` file:

```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

### 3. Update database schema

From project root:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Running

### Option 1: From project root (recommended)

```bash
npm run insight
```

### Option 2: From worker-llm directory

```bash
cd worker-llm
npm start
```

### Option 3: Direct with tsx

```bash
tsx worker-llm/index.ts
```

## First Run Checklist

- [ ] OpenAI API key is set in `.env`
- [ ] Analytics worker has been run first (`npm run analyze`)
- [ ] Database has yesterday's `daily_agg` data
- [ ] Worker-llm dependencies are installed

## Typical Workflow

```bash
# 1. Run analytics worker (processes entries/bets)
npm run analyze

# 2. Run insight generator (processes analytics)
npm run insight
```

## Expected Output

```
🧠 AI Insight Generator Starting...

📅 Processing insights for: 2025-11-04

👥 Found 2 user(s) with data

═══════════════════════════════════════════════

📊 Processing user: clxyz123abc

  📝 Found 18 top words, 3 entries
  🎯 Brier score: 0.156
  🤖 Calling OpenAI...
  ✨ Generated insights:
     Themes: AI, forecasting, markets
     Mood: analytical
     Biases: optimism bias
  ✅ Saved to insights_llm table

═══════════════════════════════════════════════

📊 Summary:
   ✅ Successful: 2
   ❌ Failed: 0
   📈 Total: 2

✨ AI Insight Generator completed!
```

## Troubleshooting

### "No users to process"
→ Run analytics worker first: `npm run analyze`

### "OPENAI_API_KEY environment variable is not set"
→ Add `OPENAI_API_KEY=sk-...` to root `.env` file

### "No daily aggregate found"
→ Ensure analytics worker ran successfully and created yesterday's data

### OpenAI rate limit errors
→ Add delay between requests or upgrade API plan

### Module not found errors
→ Run `npm install` in worker-llm directory

## Testing with Custom Date

To test with older data, modify the `getYesterday()` function in `index.ts`:

```typescript
// Example: Process data from 3 days ago
function getYesterday(): Date {
  const now = new Date();
  const targetDay = new Date(now);
  targetDay.setUTCDate(targetDay.getUTCDate() - 3); // Change this
  
  return new Date(Date.UTC(
    targetDay.getUTCFullYear(),
    targetDay.getUTCMonth(),
    targetDay.getUTCDate(),
    0, 0, 0, 0
  ));
}
```

## Monitoring

View generated insights in database:

```bash
npx prisma studio
# Navigate to InsightsLlm table
```

Or query directly:

```sql
SELECT * FROM insights_llm 
ORDER BY created_at DESC 
LIMIT 5;
```

## Cost Monitoring

Each user costs approximately **$0.01-0.02 per day**.

Track usage at: [platform.openai.com/usage](https://platform.openai.com/usage)

## Production Deployment

### Environment
```bash
export OPENAI_API_KEY=sk-prod-key
export DATABASE_URL=postgresql://...
```

### Cron Schedule
```cron
# Run at 3 AM daily (after analytics at 2 AM)
0 3 * * * cd /app && npm run insight >> /var/log/insights.log 2>&1
```

### Monitoring
- Set up alerts for failures
- Monitor OpenAI costs
- Track success/failure rates
- Log errors to external service

## Support

For issues or questions:
1. Check [README.md](./README.md) for full documentation
2. See [ARCHITECTURE.md](../ARCHITECTURE.md) for system overview
3. Review OpenAI API documentation


