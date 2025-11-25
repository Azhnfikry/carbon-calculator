# Step 4 & 5: Create GitHub Repository & Push Your Code

This guide covers:
1. **Step 4:** Create a repository on GitHub.com
2. **Step 5:** Connect local Git to GitHub and push your code

---

## Step 4: Create Repository on GitHub

### 4.1 Go to GitHub Website

1. Open your web browser
2. Go to **https://github.com**
3. Log in with your account (Azhnfikry)

### 4.2 Create New Repository

1. Click the **+** icon in the top-right corner
2. Click **New repository**

Or go directly to: **https://github.com/new**

### 4.3 Configure Repository Settings

You'll see a form to fill out:

**Repository name:**
```
carbon-calculator
```

**Description** (optional):
```
Carbon emissions calculator web application built with Next.js and Supabase
```

**Visibility:**
- Choose **Public** (recommended for portfolio/open source)
- Or **Private** (if confidential)
- For this guide, we'll use **Public**

**Initialize repository:**
- ❌ DO NOT check "Add a README file"
- ❌ DO NOT check "Add .gitignore"
- ❌ DO NOT check "Choose a license"

**Why?** You already have these files locally, and you don't want conflicts.

### 4.4 Create Repository

1. Click the **Create repository** button
2. GitHub will create the repository
3. You'll see a page with quick setup instructions

**Keep this page open!** You'll need the commands.

---

## Step 5: Connect Local Git to GitHub & Push Code

### 5.1 Copy Your Repository URL

On the GitHub page from Step 4.4:

1. Look for the green **< > Code** button
2. Click it
3. Make sure **HTTPS** tab is selected (easier for beginners)
4. Click the **copy** icon (clipboard)

You've copied: `https://github.com/Azhnfikry/carbon-calculator.git`

### 5.2 Add Remote Repository

Go to **PowerShell** in your project folder and run:

```powershell
git remote add origin https://github.com/Azhnfikry/carbon-calculator.git
```

**Verify the remote was added:**

```powershell
git remote -v
```

Should show:
```
origin  https://github.com/Azhnfikry/carbon-calculator.git (fetch)
origin  https://github.com/Azhnfikry/carbon-calculator.git (push)
```

### 5.3 Verify Your Branch

Check your current branch:

```powershell
git branch
```

Should show: `* main`

(If it shows `master`, rename it first: `git branch -M main`)

### 5.4 Push Your Code to GitHub

Run this command:

```powershell
git push -u origin main
```

**First Time Setup:**
- You may be prompted to authenticate
- A browser window might open
- Click **Authorize** to authenticate
- Return to PowerShell when done

**Expected output:**
```
Enumerating objects: 65, done.
Counting objects: 100% (65/65), done.
Delta compression using up to 8 threads
Compressing objects: 100% done.
Writing objects: 100% (65/65), done.
Sending 2,500 bytes, done.
remote: Resolving deltas: 100% done.
To https://github.com/Azhnfikry/carbon-calculator.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

🎉 **Your code is now on GitHub!**

---

## Verify Your Repository on GitHub

### Check 1: Visit Your Repository

1. Go to **https://github.com/Azhnfikry/carbon-calculator**
2. You should see your project files listed:
   - ✓ `app/`
   - ✓ `components/`
   - ✓ `lib/`
   - ✓ `package.json`
   - ✓ All other files

### Check 2: Verify Files Are There

Look for:
- ✓ `DEPLOYMENT_GUIDE.md`
- ✓ `GITHUB_SETUP_GUIDE.md`
- ✓ `STEP_2_3_GUIDE.md`
- ✓ All your source code files

❌ Should NOT see:
- ❌ `node_modules/` folder
- ❌ `.env.local` file
- ❌ `.next/` build folder

### Check 3: View Your Commit

1. On your repository page
2. Look for "X commits" (should say "1 commit")
3. Click it
4. You should see your commit:
   ```
   f5f0efa Initial commit: Carbon Calculator MVP with Supabase integration
   ```

---

## Troubleshooting

### Issue: "fatal: remote origin already exists"

**Cause:** Remote was already configured

**Solution:**
```powershell
git remote remove origin
git remote add origin https://github.com/Azhnfikry/carbon-calculator.git
```

---

### Issue: "Permission denied" or "Authentication failed"

**Cause:** GitHub authentication issue

**Solution:**
1. Close PowerShell
2. Run: `git push -u origin main` again
3. A browser window will open to authenticate
4. Log in to GitHub
5. Click **Authorize**

---

### Issue: "branch 'main' does not have a tracking branch"

**Cause:** Branch not set up correctly

**Solution:**
```powershell
git branch -u origin/main main
git push
```

---

### Issue: 404 error - "Repository not found"

**Cause:** Wrong repository URL or GitHub account issue

**Solution:**
1. Verify repository name on GitHub matches exactly
2. Check you copied the correct HTTPS URL
3. Verify you're logged into correct GitHub account

---

## Commands Summary

```powershell
# Verify you're in correct folder
cd "C:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs"

# Add GitHub remote
git remote add origin https://github.com/Azhnfikry/carbon-calculator.git

# Verify remote added
git remote -v

# Check branch
git branch

# Push to GitHub
git push -u origin main

# Check commit history
git log --oneline

# View what's staged
git status
```

---

## What Happens Next

After pushing to GitHub:

1. ✅ Your code is safely backed up on GitHub
2. ✅ Vercel can access your GitHub repository
3. ✅ Any push to `main` can trigger automatic deployments
4. ✅ Your team can collaborate on the project

---

## Next Steps After GitHub Setup

Once your code is on GitHub:

1. **Set up Supabase** (create database)
2. **Deploy to Vercel** (connect GitHub to Vercel)
3. **Configure environment variables** (API keys)
4. **Test your live application**

See **DEPLOYMENT_GUIDE.md** for the complete process.

---

## Ongoing Workflow (for future updates)

After the initial setup, use this workflow:

```powershell
# 1. Make changes to your files
# (edit code in VS Code)

# 2. Check what changed
git status

# 3. Stage your changes
git add .

# 4. Commit with a message
git commit -m "Description of changes"

# 5. Push to GitHub
git push origin main
```

---

## Verification Checklist

- [ ] Created GitHub repository named `carbon-calculator`
- [ ] Repository is set to **Public** (or **Private** if preferred)
- [ ] Copied HTTPS URL from GitHub
- [ ] Added remote: `git remote add origin ...`
- [ ] Verified with: `git remote -v`
- [ ] Pushed code: `git push -u origin main`
- [ ] Verified code appears on GitHub.com
- [ ] Commit message visible on GitHub
- [ ] All project files visible on GitHub
- [ ] `.env.local` NOT visible (protected by .gitignore)
- [ ] `node_modules/` NOT visible (protected by .gitignore)

---

**Congratulations! Your code is now on GitHub! 🎉**

Your repository is ready for:
- ✅ Vercel deployment
- ✅ Team collaboration
- ✅ Backup and version control
- ✅ Continuous integration/deployment

Next step: **Set up Supabase & Deploy to Vercel!**
