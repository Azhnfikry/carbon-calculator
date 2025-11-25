# Supabase & Vercel Deployment Guide

Complete step-by-step guide to deploy your Carbon Calculator with Supabase (database) and Vercel (hosting).

---

## Table of Contents

1. [Phase 1: Supabase Setup](#phase-1-supabase-setup)
2. [Phase 2: Vercel Deployment](#phase-2-vercel-deployment)
3. [Phase 3: Connect Everything](#phase-3-connect-everything)
4. [Phase 4: Test Your Live App](#phase-4-test-your-live-app)

---

# Phase 1: Supabase Setup

Supabase is your **database and backend**. It stores user data, emissions, and all application data.

## Step 1.1: Create Supabase Account

1. Go to **https://supabase.com**
2. Click **Sign Up**
3. Sign up using:
   - GitHub account (easiest) OR
   - Email address

4. Complete email verification

---

## Step 1.2: Create Supabase Project

1. On Supabase dashboard, click **New Project**
2. Fill in the form:

   **Project Name:**
   ```
   carbon-calculator
   ```

   **Database Password:**
   ```
   Create a STRONG password
   (e.g., Azh@2024Carbon123!)
   SAVE THIS PASSWORD - you'll need it!
   ```

   **Region:**
   ```
   Select: Singapore (closest to Asia)
   Or: Your preferred region
   ```

   **Pricing Plan:**
   ```
   Free (unlimited for development)
   ```

3. Click **Create new project**
4. Wait 2-3 minutes for Supabase to set up your database

---

## Step 1.3: Get Your API Keys

Once the project is created:

1. Go to **Settings** (bottom left) → **API**

2. Copy these values to a **temporary text file** (you'll need them):

   **Value 1: Project URL**
   ```
   Label: "Project URL"
   Starts with: https://xxxxx.supabase.co
   Copy this!
   ```

   **Value 2: anon public key**
   ```
   Label: "Project API keys"
   Under "anon (public)"
   Copy this!
   ```

   **Value 3: service_role secret**
   ```
   Label: "Project API keys"
   Under "service_role (secret)"
   Copy this! (Keep it SECRET)
   ```

**Example of what you're copying:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 1.4: Create Database Tables

Your project has SQL scripts to create tables.

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Find the SQL scripts in your project:
   - `scripts/001_create_profiles.sql`
   - `scripts/002_create_emissions.sql`
   - `scripts/004_create_emission_factors.sql`
   - `scripts/005_seed_emission_factors.sql`

4. Open each file from your project:
   ```
   c:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs\scripts\
   ```

5. **Run them in ORDER:**
   - Copy all SQL from script 001
   - Paste into Supabase SQL Editor
   - Click **Run** or **Cmd + Enter**
   - Wait for success message
   - Repeat for scripts 002, 004, 005

**Expected result after running all:**
- ✓ `profiles` table created
- ✓ `emissions` table created
- ✓ `emission_factors` table created and seeded
- ✓ Data populated successfully

---

## Step 1.5: Create `.env.local` File

This file stores your Supabase credentials for local development.

1. Go to your project folder in VS Code
2. Create new file: `.env.local`
3. Paste your credentials:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace with your actual values from Step 1.3.

**⚠️ IMPORTANT:**
- ✅ `.env.local` is in `.gitignore`
- ✅ Git will NOT upload this file
- ✅ Your secrets are safe!

---

## Step 1.6: Test Supabase Connection Locally

1. Open terminal in VS Code (Ctrl + `)
2. Run:

```powershell
npm run dev
```

3. Open your app at: **http://localhost:3000**
4. Try to:
   - Sign up with email/password
   - Log in
   - Add an emission entry
   - Verify data saves to database

If it works locally ✅, you're ready for Vercel!

---

# Phase 2: Vercel Deployment

Vercel is your **hosting platform**. It hosts your Next.js app and makes it live on the internet.

## Step 2.1: Create Vercel Account

1. Go to **https://vercel.com**
2. Click **Sign Up**
3. Sign up with **GitHub account** (recommended)
   - This connects your GitHub repository automatically
4. Authorize Vercel to access your GitHub

---

## Step 2.2: Import GitHub Repository

1. On Vercel dashboard, click **Add New...**
2. Click **Project**
3. Click **Import Git Repository**
4. Paste your repository URL:

```
https://github.com/Azhnfikry/carbon-calculator
```

5. Click **Continue**

---

## Step 2.3: Configure Project

You'll see a configuration page:

**Project Name:**
```
carbon-calculator
```

**Framework:**
```
Should auto-detect: Next.js ✓
```

**Root Directory:**
```
Leave blank (unless in subdirectory)
```

**Build & Development Settings:**
```
Leave as default
```

Click **Deploy** (will fail first - that's OK!)

---

## Step 2.4: Add Environment Variables

The deployment will fail because Supabase credentials are missing.

1. Go to your Vercel project settings
2. Click **Settings** (top tab)
3. Click **Environment Variables** (left sidebar)
4. Add each variable:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
```
Click **Add**

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your_anon_key
```
Click **Add**

**Variable 3:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: your_service_role_key
```
Click **Add**

**For each variable, select:**
- ✓ Production
- ✓ Preview
- ✓ Development

---

## Step 2.5: Redeploy After Adding Variables

1. Go to **Deployments** tab
2. Find your failed deployment
3. Click the **...** menu
4. Click **Redeploy**
5. Wait for deployment to complete

Expected: ✅ Green checkmark = Success!

---

## Step 2.6: Configure CORS in Supabase

For your Vercel app to connect to Supabase database:

1. Go to **Supabase Dashboard**
2. Click **Settings** → **API**
3. Scroll to **CORS** section
4. Click **Add a new URL** (or edit existing)
5. Add your Vercel domain:

```
https://carbon-calculator-azhnfikry.vercel.app
```

(Your actual domain will be shown on Vercel)

6. Also add for local testing:
```
http://localhost:3000
```

7. Click **Save**

---

# Phase 3: Connect Everything

## Step 3.1: Update GitHub (Optional but Recommended)

Push your `.env.local` to a notes file (but NOT to GitHub):

```powershell
# Verify .env.local is NOT tracked
git status
```

Should NOT show `.env.local` (it's in .gitignore ✓)

---

## Step 3.2: Test Vercel App

1. Go to your Vercel deployment URL:
```
https://carbon-calculator-azhnfikry.vercel.app
```

2. Try these features:
   - ✓ Page loads
   - ✓ Sign up works
   - ✓ Login works
   - ✓ Dashboard displays
   - ✓ Can add emissions
   - ✓ Data saves to database
   - ✓ Charts show correctly

---

## Step 3.3: Check Logs for Errors

**Vercel Logs:**
1. Go to Vercel project
2. Click **Logs** (top)
3. Monitor for errors in real-time

**Supabase Logs:**
1. Go to Supabase dashboard
2. Click **Logs** (left sidebar)
3. Check for database errors

---

# Phase 4: Test Your Live App

## Test Checklist

- [ ] App loads at Vercel URL
- [ ] Home page displays correctly
- [ ] Styling looks good
- [ ] Authentication works
  - [ ] Sign up creates new user
  - [ ] Login works with correct credentials
  - [ ] Login fails with wrong password
- [ ] Dashboard loads after login
- [ ] Can add new emissions
- [ ] Emissions data saves to database
- [ ] Can view emissions list
- [ ] Charts display data correctly
- [ ] Logout works
- [ ] No console errors (F12 to check)

---

## Ongoing Development Workflow

After deployment, use this workflow for updates:

### To update your app:

1. **Make changes locally:**
   ```
   Edit files in VS Code
   Test at http://localhost:3000
   ```

2. **Commit & push to GitHub:**
   ```powershell
   git add .
   git commit -m "Feature description"
   git push origin main
   ```

3. **Vercel auto-deploys:**
   - Vercel detects push to GitHub
   - Automatically rebuilds your app
   - Deploys new version in ~2-3 minutes
   - Check Vercel dashboard for status

4. **Live app updates:**
   - Your Vercel URL now has latest code

---

## Troubleshooting

### Issue: "Build failed" in Vercel

**Check:**
1. Go to Vercel → Deployments → Failed build
2. Click to see build logs
3. Look for error messages

**Common causes:**
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solution:**
1. Fix error locally: `npm run build`
2. Commit and push: `git push origin main`
3. Vercel will auto-redeploy

---

### Issue: "Cannot connect to Supabase"

**Error message:** `connection refused` or `ECONNREFUSED`

**Solution:**
1. Verify Supabase URL in `.env.local` is correct
2. Verify API keys are copied completely
3. Add Vercel domain to Supabase CORS:
   - Supabase → Settings → API → CORS
   - Add: `https://your-vercel-domain.vercel.app`
4. Redeploy in Vercel

---

### Issue: "Authentication failed"

**Error:** Can't sign up or login

**Solution:**
1. Check Supabase project is running
2. Verify `profiles` table exists
3. Check Row Level Security (RLS) policies:
   - Supabase → Authentication → Policies
   - For public app, enable registration
4. Check browser console (F12) for details

---

### Issue: "502 Bad Gateway" or "500 Error"

**Cause:** Server error

**Solution:**
1. Check Vercel logs: Vercel → Logs
2. Check Supabase logs: Supabase → Logs
3. Restart Vercel deployment:
   - Go to Deployments
   - Click failed deployment
   - Click Redeploy
4. Clear browser cache: Ctrl + Shift + Delete

---

## Security Best Practices

1. **Never commit `.env.local`** to GitHub
2. **Keep service_role_key secret** - don't share publicly
3. **Use environment variables** in Vercel for all secrets
4. **Enable Supabase Auth** with email verification
5. **Set up Row Level Security (RLS)** in Supabase
6. **Enable HTTPS** (Vercel does this automatically)
7. **Regular backups** in Supabase settings

---

## Your URLs After Deployment

**Live App:** 
```
https://carbon-calculator-azhnfikry.vercel.app
```

**GitHub Repository:**
```
https://github.com/Azhnfikry/carbon-calculator
```

**Supabase Dashboard:**
```
https://app.supabase.com/projects/your-project-id
```

**Vercel Dashboard:**
```
https://vercel.com/dashboard
```

---

## Success Checklist

✅ **Supabase:**
- [ ] Project created
- [ ] Database tables created
- [ ] API keys copied
- [ ] `.env.local` created with credentials
- [ ] Local app connects and works

✅ **Vercel:**
- [ ] Account created
- [ ] GitHub repository imported
- [ ] Environment variables added
- [ ] Deployment successful (green checkmark)
- [ ] CORS configured in Supabase

✅ **Live App:**
- [ ] Vercel URL accessible
- [ ] All features working
- [ ] Database saving data
- [ ] No errors in logs

---

## Next Steps

1. **Monitor your app** in the first few hours
2. **Check logs** regularly for errors
3. **Plan updates** using the development workflow
4. **Scale as needed** (upgrade Supabase/Vercel if needed)

---

## Helpful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Vercel Deployment Guide](https://vercel.com/docs/concepts/deployments/overview)

---

**Congratulations! Your Carbon Calculator is now live! 🚀**

Your app is deployed, backed up, and ready for use. You can now:
- Share your app URL with users
- Monitor performance
- Update features regularly
- Scale as your user base grows

**Questions? Check troubleshooting section above or contact support.**
