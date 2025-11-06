# Supabase Integration Guide for WM

> ⚠️ **CRITICAL**: Never commit `.env` files to git. Store all secrets locally only.

---

## 📋 Complete Checklist: What You Need

| Variable | Source | Purpose | Sensitive? |
|----------|--------|---------|------------|
| `DATABASE_URL` | Supabase Console | PostgreSQL connection string | 🔒 YES |
| `OPENAI_API_KEY` | OpenAI API Keys | LLM insights generation | 🔒 YES |
| `NODE_ENV` | Your config | Environment (development/production) | ❌ NO |

---

## 🚀 Step 1: Create Supabase Project

### 1.1 Go to Supabase Console
- **URL**: https://app.supabase.com
- **Action**: Click **"New Project"**

### 1.2 Project Details
- **Name**: `wm` (or your preference)
- **Database Password**: Generate strong password (save this temporarily)
- **Region**: Choose closest to your users (e.g., us-east-1)
- **Pricing**: Free tier OK for development
- **Click**: "Create new project"

⏳ **Wait 2-3 minutes** for project to spin up.

---

## 🔌 Step 2: Get DATABASE_URL

### 2.1 Access Connection String

1. **In Supabase Console**, go to **Settings → Database**
2. Scroll down to **"Connection string"**
3. Select **PostgreSQL** tab
4. **Copy** the connection string (URI format)

### 2.2 The URL Format

```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

**Example** (DO NOT USE - for format reference only):
```
postgresql://postgres:abc123xyz@db.abcdef.supabase.co:5432/postgres
```

### 2.3 Parse It Out

Your Supabase connection string contains:
- `[PASSWORD]` — Database password you generated (step 1.2)
- `[HOST]` — Your unique subdomain (e.g., `abcdef.supabase.co`)
- `[PORT]` — Always `5432` for Supabase PostgreSQL

---

## 🛠️ Step 3: Configure `.env` File

### 3.1 Create `.env` in Project Root

```bash
cd /Users/tommybutcher/wm
touch .env
```

### 3.2 Populate `.env`

```bash
# Database (from Supabase Console → Settings → Database → Connection String)
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"

# OpenAI API Key (from https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-proj-[YOUR_KEY]"

# Environment
NODE_ENV="development"

# Optional: Supabase Anon Key (for client-side, if needed later)
# NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
# NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
```

### 3.3 Verify `.env` is in `.gitignore`

```bash
cat .gitignore | grep "\.env"
```

**Expected output** (should see `.env` or `*.env`):
```
.env
.env.local
.env.*.local
```

If missing, **add it**:
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

---

## 🗄️ Step 4: Update Prisma Schema for PostgreSQL

### 4.1 Edit `prisma/schema.prisma`

**Change the datasource from SQLite to PostgreSQL:**

**BEFORE** (SQLite):
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**AFTER** (PostgreSQL):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4.2 Save and Verify

```bash
# Type check Prisma schema
npm run prisma:generate
```

**Expected**: No errors.

---

## 🚀 Step 5: Run Migrations

### 5.1 Push Schema to Supabase

```bash
npm run prisma:migrate
```

**Choose a migration name** (e.g., `init`):
```
✔ Enter a name for the new migration: › init
```

### 5.2 What Happens

Prisma will:
1. ✅ Connect to Supabase PostgreSQL via `DATABASE_URL`
2. ✅ Create all tables (User, Entry, Bet, DailyAgg, InsightsLlm, WalletLink, etc.)
3. ✅ Set up indexes and unique constraints
4. ✅ Generate new `@prisma/client`

**Expected output**:
```
✔ Your database is now in sync with your schema.

✔ Generated Prisma Client (5.7.1) in 245ms
```

---

## 🌱 Step 6: Seed Initial Data (Optional)

```bash
npm run prisma:seed
```

This inserts:
- 1 demo user (`demo@example.com`)
- 25 sample entries
- 20 sample bets

**Perfect for testing the dashboard.**

---

## ✅ Step 7: Verify Connection

### 7.1 Open Prisma Studio

```bash
npx prisma studio
```

**Expected**: Prisma Studio opens at `http://localhost:5555` with all tables visible and populated (if seeded).

### 7.2 Query via psql (Optional)

If you have `psql` installed:

```bash
# Connect to your Supabase database
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Check tables
\dt

# Count users
SELECT COUNT(*) FROM "User";
```

---

## 🏃 Step 8: Test Workers

### 8.1 Run Analytics Worker

```bash
npm run analyze
```

**Expected**:
- Processes yesterday's entries
- Generates daily_agg records
- Logs summary to console

### 8.2 Run AI Insight Worker

```bash
npm run insight
```

**Expected** (if OPENAI_API_KEY is set):
- Fetches daily_agg from previous day
- Calls OpenAI GPT-4
- Saves insights_llm records

### 8.3 Run Web App

```bash
npm run dev
```

**Visit**: http://localhost:3000
- **Dashboard** should display data from Supabase
- **Entries** and **Bets** CRUD should work

---

## 🔐 Environment Variables Summary

### **Production Checklist**

| Variable | Required? | Sensitive? | Example |
|----------|-----------|-----------|---------|
| `DATABASE_URL` | ✅ YES | 🔒 YES | `postgresql://postgres:...` |
| `OPENAI_API_KEY` | ✅ YES (if using AI) | 🔒 YES | `sk-proj-...` |
| `NODE_ENV` | ❌ Optional | ❌ NO | `production` |
| `NEXT_PUBLIC_APP_URL` | ❌ Optional | ❌ NO | `https://app.mysite.com` |

---

## 📍 Where to Find Each Secret

### **DATABASE_URL**

```
Supabase Console
  → Select Your Project
    → Settings (⚙️ icon, bottom-left)
      → Database
        → Connection Pooling (or direct)
          → PostgreSQL tab
            → Copy URI
```

**Format**: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

---

### **OPENAI_API_KEY**

```
https://platform.openai.com
  → Settings
    → API Keys
      → Create new secret key
        → Copy the key
```

**Format**: `sk-proj-...` (starts with `sk-proj-`)

---

### **NODE_ENV** (Optional)

Set to:
- `development` — Local testing
- `production` — Deployed app

---

## 🚨 Troubleshooting

### ❌ "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
npm install
```

---

### ❌ "DATABASE_URL is not set"

**Check**:
```bash
cat .env | grep DATABASE_URL
```

**Must output**:
```
DATABASE_URL=postgresql://...
```

**If empty**, add it to `.env` (step 3.2).

---

### ❌ "Connection refused" or "Connection timed out"

**Possible causes**:
1. Supabase project still spinning up (wait 3-5 min)
2. Wrong HOST in DATABASE_URL
3. Wrong PASSWORD
4. Firewall blocking port 5432

**Solution**:
```bash
# Re-copy the exact connection string from Supabase Console
# Paste into DATABASE_URL in .env
```

---

### ❌ "Error: no such table: User"

**This is OK** if migrating from SQLite to PostgreSQL for the first time.

**Solution**:
```bash
npm run prisma:migrate
```

---

### ❌ "OPENAI_API_KEY not set" (when running `npm run insight`)

**Solution**:
```bash
# Add to .env
echo 'OPENAI_API_KEY="sk-proj-YOUR_KEY"' >> .env
```

---

## 📝 Environment File Template

Save this as `.env.template` (commit this, not `.env`):

```bash
# PostgreSQL via Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# OpenAI (for AI Insight Worker)
OPENAI_API_KEY="sk-proj-..."

# Environment
NODE_ENV="development"

# Optional: For client-side Supabase (future)
# NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
# NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

**Tell your team**:
> "Copy `.env.template` to `.env` and fill in your Supabase and OpenAI credentials."

---

## 🔒 Security Best Practices

✅ **DO**:
- Store `.env` only locally
- Regenerate API keys if exposed
- Use strong database passwords (Supabase generates them)
- Rotate secrets quarterly

❌ **DON'T**:
- Commit `.env` to git
- Share API keys in Slack/email
- Use default passwords
- Hardcode secrets in code

---

## 📊 Quick Reference: Commands After Setup

```bash
# Verify connection
npx prisma studio

# Seed data
npm run prisma:seed

# Run analytics worker
npm run analyze

# Run AI insights worker
npm run insight

# Start web app
npm run dev
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] `DATABASE_URL` obtained and added to `.env`
- [ ] `OPENAI_API_KEY` obtained and added to `.env`
- [ ] `prisma/schema.prisma` updated to use PostgreSQL
- [ ] `npm run prisma:migrate` completed successfully
- [ ] `npm run prisma:seed` completed (optional)
- [ ] `npx prisma studio` shows all tables
- [ ] `npm run dev` starts without errors
- [ ] Dashboard displays data at http://localhost:3000
- [ ] `.env` is in `.gitignore`

---

## 📞 Getting Help

### Supabase Docs
- Database: https://supabase.com/docs/guides/database
- Connection Strings: https://supabase.com/docs/guides/database/connecting-to-postgres

### Prisma Docs
- PostgreSQL: https://www.prisma.io/docs/orm/overview/databases/postgresql
- Migrations: https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate

### OpenAI Docs
- API Keys: https://platform.openai.com/account/api-keys
- Models: https://platform.openai.com/docs/models

---

**Status**: ✅ Ready for Supabase | **Version**: 1.0 | **Last Updated**: Nov 5, 2025

