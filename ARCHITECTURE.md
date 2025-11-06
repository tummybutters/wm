# Worldview Monitor - System Architecture

## Overview

Worldview Monitor is a three-component system for tracking personal predictions, analyzing writing patterns, and generating AI-powered insights.

## System Components

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   Web App       │     │  Analytics       │     │  AI Insight        │
│   (Next.js)     │────▶│  Worker          │────▶│  Generator         │
│                 │     │  (worker/)       │     │  (worker-llm/)     │
└─────────────────┘     └──────────────────┘     └────────────────────┘
        │                       │                         │
        │                       │                         │
        ▼                       ▼                         ▼
    ┌────────────────────────────────────────────────────────┐
    │                    Database (SQLite)                    │
    │  • users          • daily_agg                           │
    │  • entries        • insights_llm                        │
    │  • bets                                                 │
    └────────────────────────────────────────────────────────┘
```

## Component 1: Web App (Next.js)

**Location**: `src/`

### Purpose
User-facing web application for:
- Journal entries (daily thoughts, beliefs, notes)
- Prediction bets (personal or imported from Polymarket)
- Viewing analytics and insights

### Key Files
```
src/
├── components/ui/        # Shadcn UI components
├── lib/
│   ├── db.ts            # Prisma client singleton
│   ├── text.ts          # Text processing utilities
│   └── utils.ts         # General utilities
```

### Database Tables Used
- **Write**: `users`, `entries`, `bets`
- **Read**: `daily_agg`, `insights_llm` (for dashboard)

### Commands
```bash
npm run dev           # Development server
npm run build         # Production build
npm start            # Production server
```

---

## Component 2: Analytics Worker

**Location**: `worker/`

### Purpose
Daily batch job that computes:
- Word frequency analysis (top 20 words, filtered by stopwords)
- Bet statistics (open/resolved counts)
- Brier scores (prediction calibration quality)

### Architecture
```
worker/
├── index.ts           # Entry point
├── lib/
│   ├── analyze.ts     # Main analytics logic
│   ├── brier.ts       # Brier score computation
│   └── text.ts        # Text tokenization & stopwords
└── tsconfig.json
```

### Flow
1. Get yesterday's date range (UTC midnight to midnight)
2. For each user:
   - Fetch entries in date range → extract text
   - Tokenize, filter stopwords, count word frequency
   - Fetch all bets → compute Brier score
   - Count open/resolved bets
3. Upsert to `daily_agg` table

### Database Tables Used
- **Read**: `users`, `entries`, `bets`
- **Write**: `daily_agg`

### Commands
```bash
npm run analyze       # From root
tsx worker/index.ts   # Direct
```

### Output Schema
```sql
model DailyAgg {
  id        String   @id
  userId    String
  day       DateTime
  wordFreq  String   -- JSON: [{word, count}, ...]
  betCounts String   -- JSON: {open: N, resolved: M}
  brier     Float
  createdAt DateTime
  
  @@unique([userId, day])
}
```

---

## Component 3: AI Insight Generator

**Location**: `worker-llm/`

### Purpose
LLM-powered cognitive analysis that generates:
- Main themes and topics
- Worldview assumptions
- Mood/sentiment
- Cognitive biases
- Executive summary

### Architecture
```
worker-llm/
├── index.ts              # Entry point
├── lib/
│   ├── openai.ts         # OpenAI API client
│   └── composePrompt.ts  # Prompt engineering
├── package.json          # Isolated deps (openai, dayjs, dotenv)
└── tsconfig.json
```

### Flow
1. Get yesterday's date (UTC)
2. Fetch all users with `daily_agg` for yesterday
3. For each user:
   - Fetch `daily_agg` (top words, bet stats, Brier)
   - Fetch recent entries (up to 5)
   - Compose system + user prompt
   - Call OpenAI GPT-4 (structured JSON output)
   - Validate response
   - Upsert to `insights_llm` table

### Database Tables Used
- **Read**: `daily_agg`, `entries`
- **Write**: `insights_llm`

### Commands
```bash
npm run insight           # From root
tsx worker-llm/index.ts   # Direct
cd worker-llm && npm start # From worker-llm dir
```

### Output Schema
```sql
model InsightsLlm {
  id        String   @id
  userId    String
  day       DateTime
  payload   String   -- JSON: {themes, assumptions, mood, biases, summary}
  createdAt DateTime
  
  @@unique([userId, day])
}
```

### Example Payload
```json
{
  "themes": ["AI safety", "forecasting", "rationality"],
  "assumptions": [
    "Markets efficiently aggregate information",
    "Technology progress is accelerating"
  ],
  "mood": "analytical and optimistic",
  "biases": ["confirmation bias", "optimism bias"],
  "summary": "User focuses on AI risk and prediction markets, showing strong analytical thinking with slight overconfidence in technology solutions."
}
```

---

## Data Flow

### Daily Workflow
```
1. User Activity (continuous)
   ↓
   [entries, bets] → Database
   
2. Analytics Worker (daily, e.g., 2 AM)
   ↓
   [daily_agg] → Database
   
3. AI Insight Generator (daily, e.g., 3 AM)
   ↓
   [insights_llm] → Database
   
4. Web App (continuous)
   ↓
   Displays analytics + insights to user
```

### Execution Order
```bash
# Must run in this order:
npm run analyze    # First: compute aggregates
npm run insight    # Second: generate AI insights
```

---

## Database Schema Summary

### Core Data (written by web app)
- `users` - User accounts
- `entries` - Journal entries, beliefs, notes
- `bets` - Predictions with probabilities

### Analytics (written by worker)
- `daily_agg` - Word frequency, bet stats, Brier scores

### Insights (written by worker-llm)
- `insights_llm` - AI-generated cognitive analysis

### Relationships
```
User 1──▶ * Entry
User 1──▶ * Bet
User 1──▶ * DailyAgg (via userId, day)
User 1──▶ * InsightsLlm (via userId, day)
```

---

## Environment Variables

### Required for Web App
```env
DATABASE_URL=file:./prisma/dev.db
```

### Required for AI Insight Generator
```env
OPENAI_API_KEY=sk-proj-...
```

### Optional
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Scheduling

### Development
```bash
npm run analyze     # Manual
npm run insight     # Manual
```

### Production (cron example)
```cron
# Daily at 2 AM - Analytics
0 2 * * * cd /app && npm run analyze

# Daily at 3 AM - Insights (after analytics)
0 3 * * * cd /app && npm run insight
```

---

## Technology Stack

| Component | Technologies |
|-----------|-------------|
| Web App | Next.js 14, React 18, TypeScript, Tailwind CSS, Prisma |
| Analytics Worker | Node.js, TypeScript, Prisma |
| AI Insight Generator | Node.js, TypeScript, OpenAI API, Prisma |
| Database | SQLite (dev), PostgreSQL (prod compatible) |
| UI Components | Radix UI, Shadcn/ui |

---

## Key Design Principles

### 1. Separation of Concerns
- Web app: user interaction only
- Analytics worker: data crunching only
- AI worker: LLM insights only

### 2. Idempotency
- All workers can be safely re-run for the same day
- Upsert operations prevent duplicates

### 3. Read-Only Workers
- Analytics worker: reads entries/bets, writes to daily_agg only
- AI worker: reads daily_agg/entries, writes to insights_llm only
- No cross-contamination of concerns

### 4. Isolated Dependencies
- Each worker has its own `package.json` and `tsconfig.json`
- Web app and workers can be deployed separately

### 5. Graceful Degradation
- Workers skip users with no data
- Errors don't crash entire batch
- Comprehensive logging and summaries

---

## Development Setup

### 1. Install dependencies
```bash
npm install
cd worker-llm && npm install && cd ..
```

### 2. Set up database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed      # Optional: seed test data
```

### 3. Configure environment
Create `.env` in root:
```env
DATABASE_URL="file:./prisma/dev.db"
OPENAI_API_KEY="sk-proj-..."
```

### 4. Run everything
```bash
# Terminal 1: Web app
npm run dev

# Terminal 2: Analytics (manually or scheduled)
npm run analyze

# Terminal 3: Insights (after analytics)
npm run insight
```

---

## Testing

### Type checking
```bash
npm run typecheck           # Web app
cd worker && npx tsc --noEmit
cd worker-llm && npm run typecheck
```

### Linting
```bash
npm run lint
```

---

## Future Enhancements

### Possible Extensions
1. **Real-time insights** - WebSocket updates when insights are generated
2. **Historical trends** - Multi-day/week/month trend analysis
3. **Comparative analysis** - Compare user patterns to aggregated anonymized data
4. **Insight notifications** - Email/push when significant patterns detected
5. **Custom prompts** - User-configurable insight dimensions
6. **Multi-LLM support** - Claude, Gemini, etc.
7. **Visualization** - Word clouds, bias radars, mood timelines

### Scaling Considerations
- Move to PostgreSQL for production
- Queue system (Bull/BullMQ) for worker jobs
- Separate microservices for workers
- Caching layer (Redis) for insights
- Rate limiting for OpenAI calls

---

## Troubleshooting

### Workers not finding data
- Ensure analytics worker ran first
- Check date range (workers process yesterday's data)
- Verify users have entries/bets in the time period

### OpenAI errors
- Check API key is valid: `echo $OPENAI_API_KEY`
- Verify account has credits
- Check rate limits (especially on free tier)

### Database issues
- Regenerate Prisma client: `npm run prisma:generate`
- Reset database: `rm prisma/dev.db && npm run prisma:migrate`

---

## Cost Estimates

### AI Insight Generator
- Model: GPT-4-turbo-preview
- Cost: ~$0.01-0.02 per user per day
- Monthly cost (100 users): ~$30-60
- Monthly cost (1000 users): ~$300-600

### Optimization Strategies
- Use GPT-3.5-turbo for non-critical insights
- Batch API calls where possible
- Cache insights for repeated views
- Run only for active users

---

## License & Credits

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [OpenAI](https://openai.com/) - LLM API
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Primitive components
- [Tailwind CSS](https://tailwindcss.com/) - Styling


