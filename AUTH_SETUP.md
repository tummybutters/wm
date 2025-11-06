# 🔐 Supabase Auth Setup Guide

Complete guide to setting up authentication for your WM application.

## 📋 Prerequisites

- Supabase project created
- Database already configured with `DATABASE_URL`

---

## 🚀 Step 1: Enable Authentication in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Authentication** in the left sidebar
4. Authentication is enabled by default ✅

---

## 🔑 Step 2: Get Your API Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these two values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Starts with `eyJhbG...`

---

## 🌐 Step 3: Set Up Google OAuth (Optional but Recommended)

### Enable Google Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**

### Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Add Authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
8. Click **Create** and copy:
   - **Client ID**
   - **Client Secret**

### Add to Supabase

1. Back in Supabase **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

---

## 💻 Step 4: Configure Local Environment

Create/update your `.env.local` file:

```bash
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Supabase Auth (Required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
```

---

## 📤 Step 5: Push Schema Changes

The User model has been updated to work with Supabase Auth (uses UUID for user ID):

```bash
# Push updated schema
npx prisma db push

# Regenerate Prisma Client
npm run prisma:generate
```

---

## 🎯 Step 6: Configure Replit (For Deployment)

1. In Replit, click **🔒 Secrets** (lock icon in left sidebar)
2. Add these three secrets:

   ```
   DATABASE_URL = postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
   NEXT_PUBLIC_SUPABASE_URL = https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...your-anon-key
   ```

3. In the Shell, run:
   ```bash
   npx prisma db push
   npm run prisma:generate
   ```

---

## ✅ Step 7: Test Authentication

### Local Testing

```bash
npm run dev
```

Visit `http://localhost:3000` and:

1. Click **Get Started**
2. Sign up with email/password
3. Check your email for confirmation link
4. Click link to verify
5. Sign in and access dashboard

### Test Google OAuth

1. Click **Continue with Google**
2. Select your Google account
3. Should redirect to dashboard

---

## 🗂 What Was Added

### New Files

```
src/
├── lib/supabase/
│   ├── client.ts          # Client-side Supabase
│   └── server.ts          # Server-side Supabase
├── middleware.ts          # Auth middleware
├── components/
│   ├── nav.tsx           # Navigation with sign out
│   └── sign-out-button.tsx
└── app/
    ├── auth/
    │   ├── signin/page.tsx
    │   ├── signup/page.tsx
    │   └── callback/route.ts
    └── (routes)/settings/
        ├── page.tsx
        ├── settings-form.tsx
        └── actions.ts
```

### Updated Files

- `prisma/schema.prisma` - User model uses Supabase Auth UUID
- `src/app/(routes)/dashboard/page.tsx` - Uses authenticated user
- `src/app/(routes)/entries/page.tsx` - Uses authenticated user
- `src/app/(routes)/bets/page.tsx` - Uses authenticated user
- `src/app/layout.tsx` - Added navigation
- `src/app/page.tsx` - Landing page with auth CTAs

---

## 🧹 Step 8: Clean Up Old Demo Data (Optional)

The old `demo@example.com` user won't work anymore since we're using Supabase Auth UUIDs:

```bash
# In Prisma Studio or SQL
DELETE FROM "User" WHERE email = 'demo@example.com';
```

Or just leave it - new users will have their own data!

---

## 🎨 Features Now Available

✅ **Email/Password Sign Up** - Users create accounts  
✅ **Email/Password Sign In** - Users log in  
✅ **Google OAuth** - One-click Google sign-in  
✅ **Protected Routes** - Dashboard, Entries, Bets require auth  
✅ **Settings Page** - Users can add name & Polymarket wallet  
✅ **Sign Out** - Users can log out  
✅ **Middleware** - Auto-redirects based on auth state

---

## 🔒 Security Notes

- **Never commit `.env` or `.env.local`** - Already in `.gitignore`
- **ANON key is safe to expose** - It's meant to be public
- **Service role key** - NEVER use this in frontend code
- **Row Level Security** - Consider enabling in Supabase for production

---

## 🐛 Troubleshooting

### "Invalid API key"

- Double-check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure they're in `.env.local` (local) or Secrets (Replit)
- Restart dev server after adding env vars

### "User not found" after sign-in

- Check `src/app/auth/callback/route.ts` is creating user in Prisma
- User should be created automatically on first sign-in

### Google OAuth not working

- Check redirect URI in Google Console matches your Supabase project
- Format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### Email confirmation not received

- Check spam folder
- In Supabase Dashboard → Authentication → Settings
- Can disable email confirmation for testing (not recommended for production)

---

## 🎉 You're Done!

Your WM app now has full authentication! Users can:

1. Sign up with email or Google
2. Access their own dashboard
3. Create entries and bets
4. Optionally add their Polymarket wallet
5. Sign out when done

Next steps: Deploy to Replit and share with friends! 🚀

