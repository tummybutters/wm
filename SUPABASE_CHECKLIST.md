# Supabase Connection Checklist

> **Timeline**: ~15 minutes from start to verified connection.

---

## 🎯 Phase 1: Supabase Project Setup (5 min)

- [ ] **1.1** Go to https://app.supabase.com
- [ ] **1.2** Click "New Project"
- [ ] **1.3** Enter project name: `wm`
- [ ] **1.4** Set database password (save it temporarily)
- [ ] **1.5** Choose region (closest to you)
- [ ] **1.6** Click "Create new project"
- [ ] **1.7** Wait 2-3 minutes for project to initialize

---

## 📋 Phase 2: Extract Connection Secrets (5 min)

### Supabase Section

- [ ] **2.1** In Supabase Console, go to **Settings** (⚙️ bottom-left)
- [ ] **2.2** Click **Database**
- [ ] **2.3** Scroll to **"Connection string"**
- [ ] **2.4** Select tab **PostgreSQL**
- [ ] **2.5** Copy the full connection string (starts with `postgresql://`)
- [ ] **2.6** **PASTE SOMEWHERE TEMPORARY** (notepad, browser tabs, etc.)

**Format should be**:
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### OpenAI Section

- [ ] **2.7** Go to https://platform.openai.com
- [ ] **2.8** Sign in with your account
- [ ] **2.9** Click your profile icon (top-right)
- [ ] **2.10** Select **"API keys"**
- [ ] **2.11** Click **"Create new secret key"**
- [ ] **2.12** Copy the key (only shown once!)
- [ ] **2.13** **PASTE SOMEWHERE TEMPORARY**

**Format should be**:
```
sk-proj-[alphanumeric]
```

---

## 🛠️ Phase 3: Update Project Configuration (3 min)

### Update Prisma for PostgreSQL

- [ ] **3.1** Open `prisma/schema.prisma`
- [ ] **3.2** Find the `datasource db` block (around line 8-11)
- [ ] **3.3** Change `provider` from `"sqlite"` to `"postgresql"`
- [ ] **3.4** Change `url` from `"file:./dev.db"` to `env("DATABASE_URL")`
- [ ] **3.5** Save the file

**Should look like**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Create `.env` File

- [ ] **3.6** Open terminal in project root: `/Users/tommybutcher/wm`
- [ ] **3.7** Create `.env` file:
  ```bash
  touch .env
  ```
- [ ] **3.8** Open `.env` in your editor
- [ ] **3.9** Add these three lines:
  ```bash
  DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
  OPENAI_API_KEY="sk-proj-[YOUR_KEY]"
  NODE_ENV="development"
  ```
- [ ] **3.10** Replace `[PASSWORD]` with the database password from step 2.6
- [ ] **3.11** Replace `[HOST]` with your Supabase host (e.g., `db.xyz.supabase.co`)
- [ ] **3.12** Replace `[YOUR_KEY]` with your OpenAI API key from step 2.13
- [ ] **3.13** Save `.env`

### Verify `.env` is Protected

- [ ] **3.14** Check `.env` is in `.gitignore`:
  ```bash
  grep "\.env" .gitignore
  ```
- [ ] **3.15** If not found, add it:
  ```bash
  echo ".env" >> .gitignore
  ```

---

## ✅ Phase 4: Database Migration (2 min)

### Generate Prisma Client

- [ ] **4.1** Run:
  ```bash
  npm run prisma:generate
  ```
- [ ] **4.2** Verify: No errors shown

### Apply Schema to PostgreSQL

- [ ] **4.3** Run:
  ```bash
  npm run prisma:migrate
  ```
- [ ] **4.4** When prompted for migration name, type: `init`
- [ ] **4.5** Verify: Schema synced message shown

**Expected output**:
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client (5.7.1)
```

---

## 🌱 Phase 5: Seed Data (1 min, Optional)

- [ ] **5.1** Run:
  ```bash
  npm run prisma:seed
  ```
- [ ] **5.2** Verify: Demo user and sample data created

**Expected**: No errors, summary of seeded records shown.

---

## 🔍 Phase 6: Verification (2 min)

### Test Database Connection

- [ ] **6.1** Run:
  ```bash
  npx prisma studio
  ```
- [ ] **6.2** Browser opens to http://localhost:5555
- [ ] **6.3** You can see all database tables
- [ ] **6.4** Tables contain data (if seeded)

### Test Worker Scripts

- [ ] **6.5** In a new terminal, run:
  ```bash
  npm run analyze
  ```
- [ ] **6.6** Analytics completes successfully

- [ ] **6.7** Run:
  ```bash
  npm run insight
  ```
- [ ] **6.8** AI insights complete successfully (if OPENAI_API_KEY set)

### Test Web App

- [ ] **6.9** Run:
  ```bash
  npm run dev
  ```
- [ ] **6.10** Browser opens to http://localhost:3000
- [ ] **6.11** Dashboard displays data from Supabase

---

## 📊 Environment Variables Reference

### What's in Your `.env` File Now

```bash
DATABASE_URL="postgresql://postgres:[YOUR_DB_PASSWORD]@[YOUR_HOST]:5432/postgres"
OPENAI_API_KEY="sk-proj-[YOUR_OPENAI_KEY]"
NODE_ENV="development"
```

### Where Each Came From

| Variable | Source | Needed By |
|----------|--------|-----------|
| `DATABASE_URL` | Supabase Console → Settings → Database | All workers, web app, Prisma |
| `OPENAI_API_KEY` | OpenAI Platform → API keys | AI Insight worker only |
| `NODE_ENV` | Your choice | Web app (optional) |

---

## 🚨 Troubleshooting Quick Fixes

### Problem: "DATABASE_URL is not set"
```bash
# Check .env exists and has content
cat .env | grep DATABASE_URL

# If empty, add it manually
echo 'DATABASE_URL="postgresql://..."' >> .env
```

### Problem: "Cannot connect to database"
```bash
# 1. Verify exact connection string
grep DATABASE_URL .env

# 2. Check Supabase project is ready (wait if brand new)
# 3. Re-copy connection string from Supabase Console
# 4. Update .env and try again
```

### Problem: "OPENAI_API_KEY not found"
```bash
# Check if key is set
grep OPENAI_API_KEY .env

# If missing, add it
echo 'OPENAI_API_KEY="sk-proj-..."' >> .env
```

### Problem: "no such table: User"
```bash
# Run migrations to create tables
npm run prisma:migrate
```

---

## ✨ Success Criteria

All of these should be TRUE when fully connected:

- [ ] ✅ `.env` file exists with DATABASE_URL and OPENAI_API_KEY
- [ ] ✅ `prisma/schema.prisma` uses PostgreSQL provider
- [ ] ✅ `npm run prisma:migrate` completes without errors
- [ ] ✅ Prisma Studio opens and shows all tables
- [ ] ✅ `npm run analyze` completes successfully
- [ ] ✅ `npm run insight` completes successfully
- [ ] ✅ `npm run dev` starts web app without errors
- [ ] ✅ Dashboard at http://localhost:3000 displays data
- [ ] ✅ `.env` is in `.gitignore`
- [ ] ✅ No secrets are committed to git

---

## 📝 Post-Setup Steps

Once fully connected:

1. **Add wallet links** for Polymarket integration:
   ```bash
   npx prisma studio
   # → Navigate to WalletLink table
   # → Add your Polymarket wallet addresses
   ```

2. **Set up cron scheduling** (for production):
   - Analytics: 2 AM UTC daily
   - Insights: 3 AM UTC daily (after analytics)
   - Integrations: 2 AM UTC daily

3. **Configure CI/CD** (GitHub Actions, etc.):
   - Run migrations on deploy
   - Run workers on schedule
   - Monitor for errors

4. **Monitor database** (optional):
   - Set up Supabase alerts
   - Track query performance
   - Monitor connection usage

---

## 🎓 Key Concepts

### Why PostgreSQL (Supabase)?
- ✅ Production-ready
- ✅ Scalable to millions of rows
- ✅ Built-in authentication (future)
- ✅ Real-time capabilities (future)
- ✅ Easy backup/restore

### Why `.env` File?
- ✅ Keeps secrets out of git
- ✅ Easy to configure per environment
- ✅ Works in dev and production
- ✅ Standard in Node.js ecosystem

### Why Prisma Migrations?
- ✅ Version control for database schema
- ✅ Safe rollback capabilities
- ✅ Team collaboration support
- ✅ Reproducible deployments

---

## 🔒 Security Reminders

**BEFORE YOU COMMIT TO GIT:**

```bash
# 1. Verify .env is NOT tracked
git status | grep "\.env"

# 2. If it is tracked, remove it
git rm --cached .env
git commit -m "Remove .env from tracking"

# 3. Verify it's protected
grep "\.env" .gitignore
```

**NEVER**:
- ❌ Commit `.env` to git
- ❌ Share `.env` via Slack/email
- ❌ Paste `.env` in chat
- ❌ Store in plaintext in shared docs

---

## 📞 Support

| Problem | Resource |
|---------|----------|
| Supabase connection | https://supabase.com/docs/guides/database/connecting-to-postgres |
| Prisma migration | https://www.prisma.io/docs/orm/prisma-migrate |
| OpenAI API | https://platform.openai.com/docs/api-reference |
| WM architecture | See ARCHITECTURE.md |

---

## ✅ Final Checklist

- [ ] All 6 phases completed
- [ ] All environment variables set in `.env`
- [ ] `.env` is in `.gitignore`
- [ ] Database connected and migrated
- [ ] All workers run successfully
- [ ] Web app starts and displays data
- [ ] Ready for production deployment

---

**Time to Complete**: ~15 minutes  
**Difficulty**: Easy  
**Status**: ✅ Ready for Setup  
**Version**: 1.0 | **Date**: Nov 5, 2025

