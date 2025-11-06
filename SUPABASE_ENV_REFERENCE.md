# Supabase Connection: Environment Variables Reference

> **Quick Reference**: All URLs, codes, and secrets needed to connect WM to Supabase.

---

## 📋 Required Secrets (Obtained from External Services)

### 1️⃣ `DATABASE_URL` — PostgreSQL Connection String

**WHERE TO GET IT:**
```
1. Go to: https://app.supabase.com
2. Select your project
3. Bottom-left: Settings (⚙️)
4. Navigate to: Database
5. Look for: "Connection string" section
6. Tab: PostgreSQL
7. Copy the full URI
```

**FORMAT:**
```
postgresql://postgres:[DB_PASSWORD]@[DB_HOST]:[DB_PORT]/postgres
```

**EXAMPLE** (DO NOT USE):
```
postgresql://postgres:AbCdEfGhIjKlMnOp@db.xyzabc123.supabase.co:5432/postgres
```

**BREAKDOWN:**
- `postgres` — Username (always "postgres" for Supabase)
- `AbCdEfGhIjKlMnOp` — Your database password (from Supabase project creation)
- `db.xyzabc123.supabase.co` — Your unique Supabase host
- `5432` — PostgreSQL port (always 5432)
- `postgres` — Database name (always "postgres" for Supabase)

**WHERE TO PASTE IT:**
```bash
# File: .env (in project root)
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"
```

---

### 2️⃣ `OPENAI_API_KEY` — LLM API Token

**WHERE TO GET IT:**
```
1. Go to: https://platform.openai.com
2. Sign in with your account
3. Top-right: Click your profile
4. Navigate to: "API keys"
5. Click: "Create new secret key"
6. Copy the key (only shows once)
```

**FORMAT:**
```
sk-proj-[alphanumeric string]
```

**EXAMPLE** (DO NOT USE):
```
sk-proj-aBcDeFgHiJkLmNoPqRsT1234567890aBcDeFg
```

**WHERE TO PASTE IT:**
```bash
# File: .env (in project root)
OPENAI_API_KEY="sk-proj-[YOUR_KEY]"
```

---

## 🛠️ Implementation Steps

### Step 1: Create `.env` File

```bash
cd /Users/tommybutcher/wm
cat > .env << 'EOF'
# PostgreSQL via Supabase
DATABASE_URL="postgresql://postgres:[PASTE_YOUR_PASSWORD]@[PASTE_YOUR_HOST]:5432/postgres"

# OpenAI API
OPENAI_API_KEY="sk-proj-[PASTE_YOUR_KEY]"

# Environment
NODE_ENV="development"
EOF
```

### Step 2: Fill in Your Values

**Open** `.env` and replace:
- `[PASTE_YOUR_PASSWORD]` → Database password from Supabase
- `[PASTE_YOUR_HOST]` → Host from Supabase (e.g., `db.xyz.supabase.co`)
- `[PASTE_YOUR_KEY]` → API key from OpenAI

### Step 3: Verify `.env` is Safe

```bash
# Ensure .env is in .gitignore
grep -q "\.env" .gitignore && echo "✅ .env is protected" || echo "❌ Add .env to .gitignore"

# Check file permissions (optional, but good practice)
ls -la .env
```

---

## 📊 `.env` Configuration Summary

### Complete `.env` Template

```bash
################################
# REQUIRED - Database Connection
################################
DATABASE_URL="postgresql://postgres:YourDatabasePasswordHere@db.yoursubdomain.supabase.co:5432/postgres"

################################
# REQUIRED - AI Insights
################################
OPENAI_API_KEY="sk-proj-YourOpenAIKeyHere"

################################
# OPTIONAL - App Configuration
################################
NODE_ENV="development"
# NODE_ENV="production"  # Use this for deployed app

################################
# OPTIONAL - Supabase Client (for future)
################################
# NEXT_PUBLIC_SUPABASE_URL="https://yoursubdomain.supabase.co"
# NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ✅ Verification Checklist

### Check 1: `.env` File Exists and is Populated

```bash
cat /Users/tommybutcher/wm/.env
```

**Expected output**:
```
DATABASE_URL=postgresql://postgres:...
OPENAI_API_KEY=sk-proj-...
NODE_ENV=development
```

### Check 2: Prisma Can Connect

```bash
npm run prisma:generate
```

**Expected**: No errors, Prisma client regenerated.

### Check 3: Database is Accessible

```bash
npx prisma db push
```

**Expected**: Schema pushed to Supabase successfully.

### Check 4: Can Access Supabase

```bash
npx prisma studio
```

**Expected**: Prisma Studio opens at http://localhost:5555 and shows all tables.

---

## 🚨 Common Issues & Fixes

### ❌ "Error: DATABASE_URL is not set"

**Cause**: `.env` file is not being loaded.

**Fix**:
```bash
# Verify .env exists
ls -la .env

# Verify it's not empty
cat .env | grep DATABASE_URL

# Reinstall dependencies to pick up new .env
npm install
```

---

### ❌ "Error: connect ECONNREFUSED"

**Cause**: Cannot connect to Supabase PostgreSQL.

**Possible reasons**:
1. Wrong host/password in DATABASE_URL
2. Supabase project not ready yet
3. Firewall blocking port 5432

**Fix**:
```bash
# 1. Re-copy DATABASE_URL from Supabase Console (exact copy)
# 2. Verify host is reachable
ping db.xyz.supabase.co

# 3. Wait 5 minutes for Supabase project to fully initialize
# 4. Update .env and try again
```

---

### ❌ "Error: no such table: User"

**Cause**: Tables haven't been created yet.

**Fix**:
```bash
npm run prisma:migrate
```

---

### ❌ "OPENAI_API_KEY is not set" (when running `npm run insight`)

**Cause**: `.env` not loaded or key is missing.

**Fix**:
```bash
# Verify key is in .env
grep OPENAI_API_KEY .env

# If missing, add it
echo 'OPENAI_API_KEY="sk-proj-YOUR_KEY"' >> .env

# Restart your terminal/app
```

---

## 🔐 Security Reminders

✅ **DO**:
- Keep `.env` locally only
- Add `.env` to `.gitignore` (already done)
- Regenerate keys if ever exposed
- Use strong passwords (Supabase auto-generates them)

❌ **DON'T**:
- Commit `.env` to GitHub/GitLab
- Share `.env` via Slack, email, or chat
- Hardcode secrets in code
- Use default/weak passwords

---

## 📞 Quick Reference: Where Each Secret Comes From

| Secret | Source URL | Step |
|--------|-----------|------|
| `DATABASE_URL` | https://app.supabase.com → Settings → Database → Connection string | Copy PostgreSQL URI |
| `OPENAI_API_KEY` | https://platform.openai.com → API keys → Create new secret key | Copy key (only shown once) |

---

## 🎯 Next Steps After Setup

```bash
# 1. Add wallet links for Polymarket integration
npm run prisma:studio
# → Open https://localhost:5555
# → Add rows to WalletLink table

# 2. Run analytics worker
npm run analyze

# 3. Run AI insights worker
npm run insight

# 4. Start web app
npm run dev
```

---

**Setup Time**: ~10 minutes | **Difficulty**: Easy | **Status**: ✅ Ready

