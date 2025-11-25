# Supabase Setup: Step-by-Step Guide

Complete guide to set up Supabase for your Carbon Calculator.

---

## Table of Contents

1. [Step 1: Create Supabase Account](#step-1-create-supabase-account)
2. [Step 2: Create Supabase Project](#step-2-create-supabase-project)
3. [Step 3: Get Your API Keys](#step-3-get-your-api-keys)
4. [Step 4: Create Database Tables](#step-4-create-database-tables)
5. [Step 5: Create .env.local File](#step-5-create-envlocal-file)
6. [Step 6: Test Connection](#step-6-test-connection)

---

## Step 1: Create Supabase Account

### 1.1 Go to Supabase Website

1. Open your web browser
2. Go to **https://supabase.com**
3. Click **Sign Up** (top right)

### 1.2 Choose Sign-Up Method

You have 2 options:

**Option A: Sign up with GitHub (Easiest)**
- Click **Continue with GitHub**
- Select your GitHub account (Azhnfikry)
- Click **Authorize supabase**
- Done! ✓

**Option B: Sign up with Email**
- Enter your email: `azhanfikri48@gmail.com`
- Create password
- Verify email when prompted

### 1.3 Complete Setup

After signing up:
- Verify your email if needed
- You're now on Supabase dashboard
- Ready for Step 2!

---

## Step 2: Create Supabase Project

### 2.1 Create New Project

1. On Supabase dashboard, look for **New Project** button (or **Create New Project**)
2. Click it

### 2.2 Fill in Project Details

You'll see a form. Fill it out:

**Field 1: Project Name**
```
carbon-calculator
```
(Can also be: carbon-calc, carbcalc, etc.)

**Field 2: Database Password**
```
Create a STRONG password
Example: Azh@2024Carbon123!
```

⚠️ **IMPORTANT:**
- Use uppercase, lowercase, numbers, special characters
- Make it at least 12 characters
- **SAVE THIS PASSWORD** - you'll need it!
- Write it down somewhere safe

**Field 3: Region**
```
Choose one:
- Singapore (closest to Asia/Asia-Pacific)
- Tokyo (closest to Japan/East Asia)
- Frankfurt (if in Europe)
- us-east-1 (if in North America)

Recommendation: Singapore for speed in Asia
```

**Field 4: Pricing Plan**
```
Select: Free
(Unlimited for development, perfect for MVP)
```

### 2.3 Create the Project

1. Review all settings
2. Click **Create new project**
3. Wait 2-3 minutes while Supabase sets up
   - You'll see: "Setting up your database..."
   - Green checkmarks appear as each step completes
4. When done, dashboard loads automatically

You're now ready for Step 3! ✓

---

## Step 3: Get Your API Keys

### 3.1 Navigate to API Settings

1. In Supabase dashboard, click **Settings** (bottom left of sidebar)
2. Click **API** (in the left submenu)

### 3.2 Find Your Credentials

You'll see several sections. Find:

**Section 1: Project URL**
- Label: "Project URL"
- Value starts with: `https://xxxxx.supabase.co`
- Click **Copy** icon

### 3.3 Copy Project URL

**To copy:**
1. Find "Project URL" box
2. Click the **copy icon** (small clipboard icon on right)
3. Paste into a text file temporarily

**It looks like:**
```
https://abcdefghijklmnop.supabase.co
```

### 3.4 Copy API Keys

Scroll down to **Project API keys** section.

You'll see two keys:

**Key 1: anon (public)**
```
Label: "anon (public)"
Purpose: Safe to use in frontend
Click copy icon next to it
```

**Key 2: service_role (secret)**
```
Label: "service_role (secret)"
Purpose: NEVER share this - for server only!
Click copy icon next to it
```

### 3.5 Save Your Credentials

Create a **temporary text file** and save all three:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **KEEP THIS FILE SAFE!**
- Don't commit to GitHub
- Don't share publicly
- Delete after pasting into `.env.local`

---

## Step 4: Create Database Tables

Your project has SQL scripts that create the database structure.

### 4.1 Locate SQL Scripts

In your project folder:
```
c:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs\scripts\
```

You need these files (in order):
```
001_create_profiles.sql
002_create_emissions.sql
004_create_emission_factors.sql
005_seed_emission_factors.sql
```

### 4.2 Open SQL Editor in Supabase

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query** (top right)
3. You see a blank editor

### 4.3 Run Script 001: Create Profiles

1. Open file: `001_create_profiles.sql` in VS Code
2. Select all content: **Ctrl + A**
3. Copy: **Ctrl + C**
4. Go to Supabase SQL Editor
5. Clear any existing text: **Ctrl + A** → **Delete**
6. Paste: **Ctrl + V**
7. Click **Run** button or press **Cmd + Enter**

**Expected output:**
```
Success
Query returned 0 rows
```

### 4.4 Run Script 002: Create Emissions

1. Open file: `002_create_emissions.sql` in VS Code
2. Select all: **Ctrl + A**
3. Copy: **Ctrl + C**
4. In Supabase, click **New Query**
5. Paste: **Ctrl + V**
6. Click **Run**

**Expected output:**
```
Success
Query returned 0 rows
```

### 4.5 Run Script 004: Create Emission Factors

1. Open file: `004_create_emission_factors.sql` in VS Code
2. Select all: **Ctrl + A**
3. Copy: **Ctrl + C**
4. In Supabase, click **New Query**
5. Paste: **Ctrl + V**
6. Click **Run**

**Expected output:**
```
Success
Query returned 0 rows
```

### 4.6 Run Script 005: Seed Emission Factors (Important!)

This script populates the database with default emission factors.

1. Open file: `005_seed_emission_factors.sql` in VS Code
2. Select all: **Ctrl + A**
3. Copy: **Ctrl + C**
4. In Supabase, click **New Query**
5. Paste: **Ctrl + V**
6. Click **Run**

**Expected output:**
```
Success
Query returned 0 rows (or: rows affected)
```

### 4.7 Verify Tables Were Created

1. In Supabase, click **Table Editor** (left sidebar)
2. You should see tables listed:
   - ✓ `profiles`
   - ✓ `emissions`
   - ✓ `emission_factors` (with data populated)

If you see all three tables ✓, your database is ready!

---

## Step 5: Create .env.local File

This file stores your Supabase credentials for local development.

### 5.1 Create File in VS Code

1. Open VS Code with your project
2. Right-click in Explorer (left panel)
3. Click **New File**
4. Name it: `.env.local`
5. Press **Enter**

### 5.2 Paste Your Credentials

1. Open the `.env.local` file
2. Paste your credentials (from Step 3):

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace with YOUR actual values!**

### 5.3 Save the File

1. Press **Ctrl + S**
2. File is saved ✓

### 5.4 Verify .gitignore

1. Open `.gitignore` file
2. Verify it contains:
   ```
   .env.local
   .env
   ```
3. This prevents uploading secrets to GitHub ✓

---

## Step 6: Test Connection

### 6.1 Install Dependencies (First Time Only)

Open terminal in VS Code (Ctrl + `):

```powershell
npm install
```

Wait for installation to complete.

### 6.2 Start Development Server

```powershell
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

### 6.3 Test in Browser

1. Open browser
2. Go to: **http://localhost:3000**

You should see your Carbon Calculator home page! ✓

### 6.4 Test Sign Up

1. Click **Sign Up** or go to `/auth/sign-up`
2. Enter:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Confirm password: `TestPassword123!`
3. Click **Sign Up**

**Expected:**
- ✓ Account created
- ✓ Redirected to dashboard
- ✓ No errors in console (F12)

### 6.5 Test Adding Emissions

1. In dashboard, look for "Add Emission" button
2. Fill in emission details:
   - Type: Transportation
   - Amount: 10
   - Unit: km
3. Click **Add**

**Expected:**
- ✓ Emission saved
- ✓ Appears in emissions list
- ✓ Database stores the data

### 6.6 Check for Errors

If anything doesn't work:

1. Open browser console: **F12**
2. Check **Console** tab for red errors
3. Screenshot the error
4. Check **Network** tab for API calls

---

## Verification Checklist

✅ **Account & Project**
- [ ] Supabase account created
- [ ] Project created named "carbon-calculator"
- [ ] Project running (green status)

✅ **API Keys**
- [ ] Project URL copied
- [ ] Anon public key copied
- [ ] Service role secret copied
- [ ] Saved in temporary file

✅ **Database**
- [ ] Script 001 ran successfully
- [ ] Script 002 ran successfully
- [ ] Script 004 ran successfully
- [ ] Script 005 ran successfully
- [ ] 3 tables visible in Table Editor

✅ **Local Setup**
- [ ] `.env.local` created with all 3 credentials
- [ ] `.env.local` in `.gitignore`
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)

✅ **Testing**
- [ ] App loads at http://localhost:3000
- [ ] Sign up works
- [ ] Can add emissions
- [ ] Data appears in database
- [ ] No console errors

---

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```powershell
npm install
npm run dev
```

---

### Issue: "NEXT_PUBLIC_SUPABASE_URL is undefined"

**Cause:** `.env.local` file not created or not named correctly

**Solution:**
1. Verify file is named exactly: `.env.local`
2. Verify all 3 values are present
3. Restart dev server: Stop (Ctrl + C) and `npm run dev` again

---

### Issue: "Error: Failed to fetch schema"

**Cause:** Supabase URL or keys are wrong

**Solution:**
1. Double-check all 3 values in `.env.local`
2. Make sure there are no extra spaces
3. Verify values match Supabase dashboard exactly

---

### Issue: Sign up page appears but not working

**Cause:** Database not set up correctly

**Solution:**
1. Go to Supabase → Table Editor
2. Verify all 3 tables exist:
   - `profiles`
   - `emissions`
   - `emission_factors`
3. If missing, re-run the SQL scripts

---

### Issue: "Error: Invalid API Key"

**Cause:** Anon key is wrong or incomplete

**Solution:**
1. Go to Supabase → Settings → API
2. Copy anon (public) key again completely
3. Paste into `.env.local`
4. Restart dev server

---

## Next Steps

Once Supabase is working locally ✓:

1. Test everything thoroughly
2. Make sure sign up works
3. Make sure data saves to database
4. Then proceed to **Vercel Deployment**

---

## Your Supabase URLs

**Dashboard:** `https://app.supabase.com`  
**Project ID:** Check in Settings → API → Project URL  
**Database Name:** `postgres`  
**Database User:** `postgres`  
**Password:** The one you created in Step 2

---

## Security Reminders

⚠️ **DO:**
- ✅ Keep `.env.local` private
- ✅ Keep service_role_key secret
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use strong password for database

⚠️ **DON'T:**
- ❌ Share `.env.local` with anyone
- ❌ Commit `.env.local` to GitHub
- ❌ Publish service_role_key online
- ❌ Use weak passwords

---

## Helpful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [SQL Editor Guide](https://supabase.com/docs/guides/sql-editor)
- [Authentication Setup](https://supabase.com/docs/guides/auth)

---

**Congratulations! Your Supabase is ready! 🎉**

Once you verify everything works locally, you're ready for **Vercel Deployment**.

Let me know when this is complete!
