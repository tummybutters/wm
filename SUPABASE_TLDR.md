# Supabase Connection — TL;DR

> Everything you need to connect WM to Supabase in one page.

---

## 🚀 3-Step Quick Start

### Step 1: Get Secrets (10 min)

```bash
# 1. Go to https://app.supabase.com → New Project → Create

# 2. Go to Settings → Database → PostgreSQL tab
#    Copy the connection string (looks like):
#    postgresql://postgres:PASSWORD@db.HOST.supabase.co:5432/postgres

# 3. Go to https://platform.openai.com → API keys → Create
#    Copy the key (looks like):
#    sk-proj-...
```

### Step 2: Create `.env` File (2 min)

```bash
cd /Users/tommybutcher/wm

cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_HOST.supabase.co:5432/postgres"
OPENAI_API_KEY="sk-proj-YOUR_KEY"
NODE_ENV="development"
EOF
```

### Step 3: Connect & Migrate (3 min)

```bash
# Update Prisma schema to use PostgreSQL
# (Already done in this version)

# Migrate schema to Supabase
npm run prisma:migrate

# Verify connection
npx prisma studio
```

✅ **Done.** Your WM app is now connected to Supabase.

---

## 📋 What You Need

| Item | Where to Get | Paste in `.env` as |
|------|-------------|-------------------|
| **Database URL** | Supabase Console → Settings → Database → PostgreSQL | `DATABASE_URL="..."` |
| **OpenAI Key** | https://platform.openai.com → API keys | `OPENAI_API_KEY="..."` |

---

## 🔗 Complete `.env` Example

```bash
# Your actual values will look different
DATABASE_URL="postgresql://postgres:AbCdEfGhIjKlMnOp@db.xyzabc123.supabase.co:5432/postgres"
OPENAI_API_KEY="sk-proj-aBcDeFgHiJkLmNoPqRsT1234567890aBcDeFg"
NODE_ENV="development"
```

---

## ✅ Verify It Works

```bash
# Should show all tables
npx prisma studio

# Should complete without error
npm run analyze

# Should generate insights (if OPENAI_API_KEY set)
npm run insight

# Should start web app
npm run dev
```

---

## 🛡️ Keep `.env` Safe

```bash
# Make sure it's protected
grep "\.env" .gitignore

# Never commit it
git status | grep ".env"  # Should be empty
```

---

## 🚨 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "DATABASE_URL is not set" | Check `.env` exists and has value: `grep DATABASE_URL .env` |
| "Cannot connect to database" | Copy exact connection string from Supabase again |
| "no such table: User" | Run: `npm run prisma:migrate` |
| "OPENAI_API_KEY not found" | Add to `.env`: `OPENAI_API_KEY="sk-proj-..."` |

---

## 📖 Detailed Guides

| Need | Read |
|------|------|
| Step-by-step setup | `SUPABASE_SETUP.md` |
| Environment variables reference | `SUPABASE_ENV_REFERENCE.md` |
| Full checklist | `SUPABASE_CHECKLIST.md` |
| This TL;DR | `SUPABASE_TLDR.md` |

---

## 🎯 Summary

You need **2 secrets**:

1. **DATABASE_URL** from Supabase
2. **OPENAI_API_KEY** from OpenAI

Put them in `.env` and run `npm run prisma:migrate`.

That's it. ✅

---

**Time**: ~15 minutes | **Difficulty**: Easy | **Status**: Ready

