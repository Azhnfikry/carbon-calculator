# Deployment Guide: Carbon Calculator to Vercel + Supabase

This guide will walk you through deploying your Carbon Calculator web application using Vercel for hosting and Supabase for your database.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare Your Project](#step-1-prepare-your-project)
3. [Step 2: Set Up Supabase](#step-2-set-up-supabase)
4. [Step 3: Deploy to Vercel](#step-3-deploy-to-vercel)
5. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
6. [Step 5: Verify & Test](#step-5-verify--test)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

You'll need:
- A **GitHub account** (required for Vercel deployment)
- A **Supabase account** (free tier available)
- A **Vercel account** (free tier available)
- **Git** installed on your computer
- **Node.js** (v18+) installed

## Step 1: Prepare Your Project

### 1.1 Initialize Git Repository (if not already done)

```bash
cd "c:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs"
git init
git add .
git commit -m "Initial commit: Carbon Calculator MVP"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **New Repository**
3. Name it: `carbon-calculator` (or your preferred name)
4. Choose **Private** or **Public**
5. Click **Create Repository**

### 1.3 Push Your Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/carbon-calculator.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 1.4 Verify Build Locally

```bash
npm run build
npm run start
```

This ensures your app builds successfully before deploying.

---

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [Supabase.com](https://supabase.com)
2. Click **Sign In** and create an account (or log in)
3. Click **New Project**
4. Configure:
   - **Project Name**: `carbon-calculator`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click **Create New Project** (wait 2-3 minutes for setup)

### 2.2 Get Your Supabase API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Configuration")
   - **anon public** (under "Project API keys")
   - **service_role secret** (under "Project API keys")

### 2.3 Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the SQL from your project's `scripts/` folder:
   - `001_create_profiles.sql`
   - `002_create_emissions.sql`
   - `004_create_emission_factors.sql`
   - `005_seed_emission_factors.sql`

3. Run each SQL script one at a time:
   - Paste the SQL content
   - Click **Run**
   - Wait for confirmation

**Order is important** - Run them in numerical order.

### 2.4 Create a .env.local File

Create a new file named `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Google & DeepSeek API Keys (if using AI features)
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here
```

⚠️ **Important**: Never commit `.env.local` to GitHub! Check your `.gitignore`:

```bash
# Should already contain:
.env.local
.env
```

---

## Step 3: Deploy to Vercel

### 3.1 Connect Vercel to GitHub

1. Go to [Vercel.com](https://vercel.com)
2. Click **Sign Up** and choose **Continue with GitHub**
3. Authorize Vercel to access your GitHub account

### 3.2 Import Your Project

1. Click **Add New...** → **Project**
2. Click **Import Git Repository**
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/carbon-calculator`
4. Click **Continue**
5. Configure:
   - **Project Name**: `carbon-calculator`
   - **Framework**: Should auto-detect as **Next.js** ✓
   - **Root Directory**: Leave blank (unless in subdirectory)
6. Click **Deploy**

### 3.3 Add Environment Variables

**Before deploying**, add your environment variables:

1. In the Vercel project settings, go to **Settings** → **Environment Variables**
2. Add each variable:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your_anon_public_key
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: your_service_role_key
```

3. Add any other API keys (Google, DeepSeek, etc.)
4. Click **Save**

### 3.4 Trigger Deployment

1. Make a small commit to your GitHub repository:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Vercel will automatically detect the push and deploy
3. Wait for the deployment to complete (usually 2-5 minutes)

---

## Step 4: Configure Environment Variables

### 4.1 Vercel Environment Variables (Production)

In Vercel dashboard → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = anon_public_key
SUPABASE_SERVICE_ROLE_KEY = service_role_key
```

Mark as:
- ✓ Production
- ✓ Preview
- ✓ Development

### 4.2 Supabase CORS Configuration

1. Go to Supabase → **Settings** → **API**
2. Under "CORS settings", add your Vercel domain:
   ```
   https://your-project-name.vercel.app
   https://your-custom-domain.com (if using custom domain)
   localhost:3000 (for local development)
   ```

---

## Step 5: Verify & Test

### 5.1 Check Deployment Status

1. Go to your Vercel project dashboard
2. Look for a ✓ **Production** deployment with a green checkmark
3. Click the deployment URL to visit your live site

### 5.2 Test Key Features

- [ ] Homepage loads correctly
- [ ] Authentication works (login/sign-up)
- [ ] Dashboard displays
- [ ] Can add emissions/data
- [ ] Database saves data
- [ ] Charts render properly

### 5.3 Monitor for Errors

1. In Vercel → **Monitoring** → **Logs** (real-time)
2. In Supabase → **Logs** → Check for database errors
3. Open browser DevTools (F12) and check console for errors

---

## Troubleshooting

### Issue: "Supabase connection failed"

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is copied completely
- Ensure your Vercel app URL is added to Supabase CORS settings

### Issue: "Build failed" in Vercel

**Solution:**
- Check Vercel build logs for error details
- Try building locally: `npm run build`
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run lint`

### Issue: Database queries return 401 Unauthorized

**Solution:**
- Check Row Level Security (RLS) policies in Supabase
- For public access, disable RLS or create proper policies
- Use service role key for admin operations

### Issue: Environment variables not loading

**Solution:**
- Redeploy after adding environment variables: Make a commit and push to GitHub
- Vercel doesn't apply env vars until next deployment
- Verify variable names match exactly (case-sensitive)

### Issue: CORS errors in browser console

**Solution:**
- Add your Vercel domain to Supabase CORS settings
- Restart Supabase (sometimes needed after updating CORS)
- Clear browser cache (Ctrl+Shift+Delete)

---

## Security Best Practices

1. **Never commit secrets** to GitHub
2. **Use `.env.local`** for local development only
3. **Rotate API keys** if accidentally exposed
4. **Enable Supabase Auth** for user protection
5. **Use Row Level Security** in Supabase for data isolation
6. **Enable HTTPS** (Vercel does this automatically)
7. **Regular backups** in Supabase (Settings → Backups)

---

## Helpful Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Getting Started](https://supabase.com/docs/getting-started/quickstarts/nextjs)
- [Next.js + Supabase Template](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)

---

## Quick Reference Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database tables created (SQL scripts run)
- [ ] Supabase API keys copied
- [ ] `.env.local` created locally
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Deployment successful (green checkmark)
- [ ] Live site tested and working
- [ ] CORS configured in Supabase
- [ ] Monitoring set up

---

**Congratulations! Your Carbon Calculator is now live! 🎉**

Visit: `https://your-project-name.vercel.app`
