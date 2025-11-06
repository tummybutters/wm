# WM - Worldview Monitor

A modular, agent-based SaaS application for tracking worldview entries, predictions/bets, and analyzing patterns over time.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp ENV_TEMPLATE.txt .env
# Edit .env with your Supabase connection string

# Set up database
npm run prisma:generate
npx prisma db push
npm run prisma:seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000/dashboard`

### Deploy to Replit

See [REPLIT_SETUP.md](./REPLIT_SETUP.md) for complete deployment guide.

## 📊 Features

- **Dashboard** - View Brier scores, bet statistics, and word frequency analysis
- **Entries** - Track journal entries, beliefs, and notes
- **Bets** - Make predictions and track calibration
- **Analytics Worker** - Daily batch processing of word frequencies and statistics
- **AI Insights Worker** - LLM-powered analysis of patterns and themes
- **Polymarket Integration** - Sync external prediction market positions

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **UI**: React, TailwindCSS, Radix UI
- **Charts**: Recharts
- **Language**: TypeScript (strict mode)

## 🏗 Architecture

### Core Components
- **Web App** (`/src/app`) - Next.js dashboard and pages
- **Database** (`/prisma`) - Schema, migrations, and seed data
- **Workers**:
  - `worker/` - Analytics agent (word frequencies, Brier scores)
  - `worker-llm/` - AI insights agent (themes, assumptions, mood)
  - `worker-integrations/` - Polymarket sync agent

### Database Schema

```
User
├── Entry (journal, belief, note)
├── Bet (personal, polymarket)
└── WalletLink (for external integrations)

Analytics (read-only outputs):
├── DailyAgg (aggregated statistics)
└── InsightsLlm (AI-generated insights)

Integrations:
├── ExternalPositionsRaw (API responses)
└── ExternalMarkets (parsed positions)
```

## 📝 NPM Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create new migration
npm run prisma:seed      # Seed demo data

# Workers
npm run analyze          # Run analytics worker
npm run insight          # Run AI insights worker
npm run integrations:run # Run Polymarket sync

# Code Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript check
```

## 🔐 Environment Variables

Required:
```
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

Optional:
```
OPENAI_API_KEY=sk-...           # For AI insights
POLYMARKET_API_KEY=...          # For Polymarket integration
```

## 🗄 Database Setup

### With Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string: Settings → Database → Connection String → URI
3. Add to `.env` as `DATABASE_URL`
4. Run migrations:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

## 🤖 Worker Agents

### Analytics Worker (`npm run analyze`)
- Runs daily at 2 AM (recommended)
- Calculates word frequencies from entries
- Computes Brier scores from resolved bets
- Stores results in `DailyAgg` table

### AI Insights Worker (`npm run insight`)
- Runs daily at 3 AM (after analytics)
- Uses OpenAI to analyze patterns
- Generates themes, assumptions, mood analysis
- Stores results in `InsightsLlm` table

### Polymarket Integration (`npm run integrations:run`)
- Syncs wallet positions daily
- Fetches open market data
- Stores raw data + parsed positions
- Idempotent and safe to re-run

## 🏃‍♂️ Running on Replit

1. Import from GitHub to Replit
2. Add `DATABASE_URL` to Secrets
3. Run database setup commands
4. Click Run!

See [REPLIT_SETUP.md](./REPLIT_SETUP.md) for detailed instructions.

## 📦 Project Structure

```
wm/
├── src/
│   ├── app/               # Next.js pages and routes
│   ├── components/        # React components
│   └── lib/               # Utilities (db, text processing)
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Migration files
│   └── seed.ts            # Demo data
├── worker/                # Analytics agent
├── worker-llm/            # AI insights agent
└── worker-integrations/   # Polymarket agent
```

## 🎯 Roadmap

- [ ] Authentication (Supabase Auth)
- [ ] User profile management
- [ ] Export data (CSV, JSON)
- [ ] Additional chart types
- [ ] Mobile app
- [ ] More integration sources

## 📄 License

MIT

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

---

Built with ❤️ using Next.js, Prisma, and Supabase
