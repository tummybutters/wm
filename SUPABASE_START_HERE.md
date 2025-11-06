# 🚀 Supabase Connection — START HERE

> **You're 15 minutes away from a fully connected WM app.**

---

## 📋 What You Need to Know

### ✅ Already Done for You

- [x] Prisma schema updated to use PostgreSQL
- [x] All database models defined and ready
- [x] Migrations prepared
- [x] `.env` protection configured (in `.gitignore`)
- [x] Worker scripts ready to use

### ⏳ What You Need to Do (3 Steps)

1. **Get 2 secrets** from Supabase and OpenAI
2. **Create `.env` file** with those secrets  
3. **Run migration** to set up database

**Total time**: ~15 minutes  
**Difficulty**: Easy

---

## 🎯 The 2 Secrets You Need

### 1️⃣ `DATABASE_URL`

**Where**: Supabase Console → Settings → Database → PostgreSQL  
**Format**: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`  
**Paste into**: `.env` file

### 2️⃣ `OPENAI_API_KEY`

**Where**: https://platform.openai.com → API keys  
**Format**: `sk-proj-[alphanumeric]`  
**Paste into**: `.env` file

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Supabase Project (5 min)

```bash
# 1. Go to https://app.supabase.com
# 2. Click "New Project"
# 3. Name it: "wm"
# 4. Generate password and click Create
# 5. Wait 2-3 minutes for project to spin up
```

### Step 2: Get Your Secrets (5 min)

```bash
# A. DATABASE_URL
#    - In Supabase: Settings → Database → PostgreSQL tab
#    - Copy the full connection string

# B. OPENAI_API_KEY
#    - Go to https://platform.openai.com
#    - API keys → Create new secret key
#    - Copy it (only shown once!)
```

### Step 3: Create `.env` & Migrate (5 min)

```bash
cd /Users/tommybutcher/wm

# Create .env file with your secrets
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_HOST.supabase.co:5432/postgres"
OPENAI_API_KEY="sk-proj-YOUR_KEY"
NODE_ENV="development"
EOF

# Run migration (creates all tables in Supabase)
npm run prisma:migrate

# When prompted for migration name, type: init
```

✅ **Done.** Your WM app is now connected to Supabase.

---

## 📖 Documentation (Choose Your Path)

### 🏃 "Just Tell Me What to Do"
→ Read: **`SUPABASE_CHECKLIST.md`**  
→ Phase-by-phase steps with verification

### 📚 "I Want All the Details"
→ Read: **`SUPABASE_SETUP.md`**  
→ Complete walkthrough with explanations

### 🔍 "Where Does Each Secret Come From?"
→ Read: **`SUPABASE_ENV_REFERENCE.md`**  
→ Exact URLs and how to obtain each secret

### 💡 "Give Me the TL;DR"
→ Read: **`SUPABASE_TLDR.md`**  
→ One-page quick reference

### 📋 "Show Me Everything"
→ Read: **`SUPABASE_INTEGRATION_SUMMARY.txt`**  
→ Complete overview with all info

---

## ✅ Verify Everything Works

After you've run the migration:

```bash
# 1. Open Prisma Studio (shows all database tables)
npx prisma studio

# 2. Test analytics worker
npm run analyze

# 3. Test AI insights worker (if API key set)
npm run insight

# 4. Start the web app
npm run dev
# → Open http://localhost:3000
```

---

## 🔒 Keep `.env` Secure

```bash
# Verify .env is protected
grep "\.env" .gitignore

# Before committing to git, ensure .env is NOT tracked
git status | grep ".env"  # Should show nothing
```

---

## 🚨 Common Issues

| Problem | Fix |
|---------|-----|
| "DATABASE_URL is not set" | Check `.env` exists: `cat .env` |
| "Cannot connect to database" | Re-copy connection string from Supabase exactly |
| "no such table: User" | Run: `npm run prisma:migrate` |
| "OPENAI_API_KEY not found" | Add to `.env`: `OPENAI_API_KEY="sk-proj-..."` |

---

## 📱 What's in Your `.env` File

```bash
# PostgreSQL connection to Supabase
DATABASE_URL="postgresql://postgres:YourPasswordHere@db.yourhost.supabase.co:5432/postgres"

# OpenAI API for AI insights
OPENAI_API_KEY="sk-proj-YourKeyHere"

# Environment mode
NODE_ENV="development"
```

---

## 🎓 What You Get

✅ PostgreSQL database hosted on Supabase  
✅ All tables ready (User, Entry, Bet, DailyAgg, InsightsLlm, WalletLink, etc.)  
✅ Full-featured web app  
✅ All workers operational  
✅ Production-ready  

---

## 🔗 URLs You'll Need

| Service | URL |
|---------|-----|
| **Supabase Console** | https://app.supabase.com |
| **OpenAI API Keys** | https://platform.openai.com/account/api-keys |
| **Prisma Studio** (local) | http://localhost:5555 |
| **WM Web App** (local) | http://localhost:3000 |

---

## 📝 Next Steps

1. ✅ Read this page (you're here)
2. ✅ Create Supabase project
3. ✅ Get your 2 secrets
4. ✅ Create `.env` file
5. ✅ Run `npm run prisma:migrate`
6. ✅ Verify with `npx prisma studio`
7. ✅ Start web app with `npm run dev`
8. 🔜 Add wallet links for Polymarket
9. 🔜 Set up cron scheduling

---

## 💬 Need Help?

| Question | Answer |
|----------|--------|
| "How do I get DATABASE_URL?" | See `SUPABASE_ENV_REFERENCE.md` |
| "What exact steps should I follow?" | See `SUPABASE_CHECKLIST.md` |
| "I want the full technical walkthrough" | See `SUPABASE_SETUP.md` |
| "Quick reference only" | See `SUPABASE_TLDR.md` |
| "Show me everything" | See `SUPABASE_INTEGRATION_SUMMARY.txt` |

---

## ✨ Quick Commands After Setup

```bash
# View all database tables
npx prisma studio

# Run analytics worker
npm run analyze

# Run AI insights
npm run insight

# Start web app
npm run dev

# Seed test data (optional)
npm run prisma:seed

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 🎉 You're Ready

Everything is prepared. You just need to:

1. Get 2 secrets
2. Add them to `.env`
3. Run the migration

**That's it.** 🚀

---

**Time to Complete**: 15 minutes  
**Status**: ✅ Ready  
**Version**: 1.0 | **Date**: Nov 5, 2025

---

## 📚 Full Documentation Index

```
📦 /Users/tommybutcher/wm/
├── 🌟 SUPABASE_START_HERE.md          ← You are here
├── 🏃 SUPABASE_CHECKLIST.md           ← Step-by-step phases
├── 📖 SUPABASE_SETUP.md               ← Complete guide
├── 🔍 SUPABASE_ENV_REFERENCE.md       ← Where to get secrets
├── 💡 SUPABASE_TLDR.md                ← One-page reference
├── 📋 SUPABASE_INTEGRATION_SUMMARY.txt ← Everything in plain text
└── 📚 ARCHITECTURE.md                 ← System design
```

---

**Next**: Pick a guide above and follow it. You've got this! 💪

