# 🚀 WM - Replit Deployment Guide

This guide will help you deploy your Worldview Monitor (WM) application to Replit with Supabase.

## Why Replit?

- ✅ Always-on server (24/7)
- ✅ No local setup needed
- ✅ Shareable URL
- ✅ Free hosting for personal projects
- ✅ Built-in code editor

---

## 🎯 Step-by-Step Setup

### 1. Create a Replit Account

1. Go to [replit.com](https://replit.com)
2. Sign up (it's free!)

### 2. Import Your Project

**Option A: From GitHub** (Recommended)
1. Push your code to GitHub (if not already there)
2. In Replit, click **Create Repl**
3. Select **Import from GitHub**
4. Paste your repository URL
5. Click **Import from GitHub**

**Option B: Upload Directly**
1. Create a new Node.js Repl
2. Upload your entire project folder
3. Replit will detect it's a Next.js app

### 3. Set Up Environment Variables

In Replit:
1. Click the **🔒 Secrets** tab (left sidebar, looks like a lock)
2. Add your environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Supabase connection string

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**Important**: Get this from your Supabase dashboard:
- Go to Settings → Database → Connection String → URI

### 4. Install Dependencies & Set Up Database

Replit will auto-install dependencies, but run these commands in the Shell:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to Supabase (creates tables)
npx prisma db push

# Seed with demo data
npm run prisma:seed
```

### 5. Run the App

Click the big green **▶ Run** button!

Replit will:
1. Install all npm packages
2. Start the Next.js dev server
3. Give you a public URL (like `https://wm-yourname.repl.co`)

### 6. Access Your Dashboard

Your WM dashboard will be live at:
```
https://your-repl-name.repl.co/dashboard
```

---

## 🔧 Configuration Files Explained

### `.replit`
- Tells Replit how to run your app
- Sets up port forwarding (3000 → 80)
- Configures deployment settings

### `replit.nix`
- Specifies system packages (Node.js 20)
- Development tools (TypeScript, Prettier)

---

## 🚨 Troubleshooting

### "Cannot connect to database"
- Check your `DATABASE_URL` in Secrets
- Make sure your Supabase project is active
- Verify the password in the connection string

### "Module not found" errors
Run in the Shell:
```bash
npm install
npm run prisma:generate
```

### Port already in use
Replit handles this automatically. Just hit **Stop** then **Run** again.

### Build fails
Make sure you have these scripts in `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🎨 Always-On Deployment (Replit Deployments)

For production (always running, even when you close the tab):

1. Click **Deploy** in the top right
2. Choose **Autoscale deployments**
3. Configure:
   - Build command: `npm run build`
   - Run command: `npm run start`
4. Click **Deploy**

**Cost**: Free tier available, paid plans for always-on + custom domains

---

## 📊 What's Already Configured

✅ Next.js 14 with App Router
✅ Prisma ORM with PostgreSQL
✅ Supabase connection ready
✅ Dashboard with charts (recharts)
✅ Demo data seeding script
✅ TypeScript strict mode
✅ All 4 agents ready to run

---

## 🔐 Security Notes

- **Never commit `.env`** - it's already in `.gitignore`
- Use Replit **Secrets** for all sensitive data
- Your Supabase connection string contains your password
- Consider enabling Row Level Security (RLS) in Supabase for production

---

## 🚀 Running Workers on Replit

To run your analytics/AI workers on a schedule:

1. Use Replit's **Deployments** with cron jobs
2. Or use external services like:
   - **GitHub Actions** (free cron jobs)
   - **Uptime Robot** (ping endpoints)
   - **Supabase Edge Functions** (serverless)

Example cron setup in Replit:
```bash
# Add to a separate scheduled Repl
0 2 * * * npm run analyze    # 2 AM daily
0 3 * * * npm run insight    # 3 AM daily
```

---

## 📝 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npx prisma db push       # Sync schema to database
npm run prisma:seed      # Seed demo data
npx prisma studio        # Open database GUI

# Workers
npm run analyze          # Run analytics worker
npm run insight          # Run AI insights worker
npm run integrations:run # Run Polymarket sync

# Type checking & Linting
npm run typecheck        # Check TypeScript
npm run lint             # Run ESLint
```

---

## 🎉 You're Done!

Your WM dashboard is now live on Replit! Share the URL with anyone, and they can access your worldview monitor 24/7.

**Next Steps:**
- Add authentication (Supabase Auth)
- Set up scheduled workers
- Customize the dashboard
- Add more integrations

Need help? Check the main README or reach out!

