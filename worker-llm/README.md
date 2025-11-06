# AI Insight Generator (worker-llm)

LLM-powered cognitive and thematic analysis worker for Worldview Monitor.

## Purpose

This worker is a **read-only consumer** of the database that:
- Pulls daily aggregates, entries, and bet statistics
- Uses OpenAI GPT-4 to generate high-level cognitive insights
- Stores structured JSON insights in the `insights_llm` table
- Never touches the web app or analytics worker code

## Architecture

```
worker-llm/
├── index.ts              # Main entry point
├── lib/
│   ├── openai.ts         # OpenAI API wrapper
│   └── composePrompt.ts  # Prompt construction
├── package.json          # Isolated dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Dependencies

- `openai` - OpenAI API client
- `dayjs` - Date manipulation
- `dotenv` - Environment variables
- `@prisma/client` - Database access

## Setup

1. **Install dependencies** (from root):
   ```bash
   cd worker-llm
   npm install
   ```

2. **Set OpenAI API key** in root `.env`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. **Run database migration** (if not done):
   ```bash
   npm run prisma:migrate
   ```

## Usage

### Run from root directory:
```bash
npm run insight
```

### Or directly:
```bash
cd worker-llm
npm start
```

### Or with tsx:
```bash
tsx worker-llm/index.ts
```

## Workflow

1. Fetches yesterday's `daily_agg` rows for all users
2. For each user:
   - Retrieves top words, bet stats, Brier score
   - Fetches recent journal entries
   - Composes compact analysis prompt
3. Calls OpenAI GPT-4 with structured JSON output
4. Upserts results into `insights_llm` table

## Output Schema

The worker generates and stores:

```json
{
  "themes": ["AI", "risk", "innovation"],
  "assumptions": ["technology solves regulation", "markets are rational"],
  "mood": "analytical",
  "biases": ["optimistic", "status-quo"],
  "summary": "User focuses on prediction accuracy and technology trends."
}
```

## Database Schema

```sql
create table insights_llm (
  id varchar primary key,
  user_id varchar references users(id),
  day date not null,
  payload text not null,  -- JSON
  created_at datetime default now(),
  unique (user_id, day)
);
```

## Scheduling

This worker can be run:
- **Manually** - `npm run insight`
- **Daily cron** - Schedule after analytics worker completes
- **On-demand** - Via admin interface or script

## Example Output

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
     Themes: forecasting, AI regulation, market dynamics
     Mood: analytical
     Biases: optimism bias, confirmation bias
  ✅ Saved to insights_llm table

═══════════════════════════════════════════════

📊 Summary:
   ✅ Successful: 2
   ❌ Failed: 0
   📈 Total: 2

✨ AI Insight Generator completed!
```

## Error Handling

- Gracefully skips users with no data
- Logs errors without crashing entire job
- Validates OpenAI response structure
- Reports success/failure counts

## Cost Considerations

- Uses GPT-4-turbo (cheaper than GPT-4)
- Processes ~500-1000 tokens per user
- Cost: ~$0.01-0.02 per user per day
- Monthly cost for 100 users: ~$30-60

## Development

### Type checking:
```bash
npm run typecheck
```

### Testing locally:
```bash
OPENAI_API_KEY=sk-... tsx index.ts
```

## Notes

- Worker requires `daily_agg` data from analytics worker
- Run analytics worker first: `npm run analyze`
- Insights are idempotent (safe to re-run)
- Each run overwrites previous day's insights for each user


