# GitHub Setup Guide - Detailed Steps

This guide provides detailed instructions for setting up and connecting your Carbon Calculator to GitHub.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Create GitHub Account](#step-1-create-github-account)
3. [Step 2: Install & Configure Git](#step-2-install--configure-git)
4. [Step 3: Initialize Git in Your Project](#step-3-initialize-git-in-your-project)
5. [Step 4: Create Repository on GitHub](#step-4-create-repository-on-github)
6. [Step 5: Connect Local Project to GitHub](#step-5-connect-local-project-to-github)
7. [Step 6: Push Code to GitHub](#step-6-push-code-to-github)
8. [Step 7: Verify Your Repository](#step-7-verify-your-repository)
9. [Important Files & .gitignore](#important-files--gitignore)
10. [Ongoing GitHub Workflow](#ongoing-github-workflow)

---

## Prerequisites

Before starting, you need:
- ✓ Your Carbon Calculator project ready (you have this!)
- ✓ Administrative access to your computer
- ✓ Internet connection
- ✓ A text editor (VS Code, Notepad, etc.)

---

## Step 1: Create GitHub Account

### 1.1 Go to GitHub Website

1. Open your web browser
2. Navigate to **[GitHub.com](https://github.com)**

### 1.2 Sign Up for GitHub

1. Click the **Sign up** button (top right)
2. Enter your email address
3. Create a password (strong password recommended)
4. Enter a username:
   - Examples: `carbon-calc-dev`, `aethera-dev`, `yourname-dev`
   - Username rules: letters, numbers, hyphens, underscores only
   - No spaces or special characters
5. Click **Create account**

### 1.3 Verify Your Email

1. GitHub will send a verification email
2. Open your email inbox
3. Find the email from GitHub
4. Click the verification link
5. Return to GitHub - your account is ready!

### 1.4 Complete Your Profile (Optional but Recommended)

1. Click your profile icon (top right corner)
2. Click **Settings**
3. Add your details:
   - Profile name
   - Bio
   - Profile picture
   - Location
4. Click **Save**

---

## Step 2: Install & Configure Git

### 2.1 Check if Git is Installed

Open **PowerShell** on your computer:

1. Press **Windows Key + R**
2. Type: `powershell`
3. Press **Enter**

In PowerShell, run:
```powershell
git --version
```

**If you see a version number** (like `git version 2.42.0`), skip to section 2.3.

**If you see "git is not recognized"**, go to section 2.2.

### 2.2 Install Git (if not already installed)

1. Go to **[git-scm.com](https://git-scm.com)**
2. Click **Downloads** → **Windows**
3. Download the installer
4. Run the installer:
   - Click **Next** through all defaults
   - When asked "Choosing the default editor", select **Visual Studio Code** (if available)
   - Click **Install**
5. Click **Finish**

### 2.3 Configure Git with Your Information

Open **PowerShell** and run these commands:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Replace:
- `"Your Name"` → Your actual name (e.g., "John Smith")
- `"your-email@example.com"` → The email you used for GitHub

**Verify your configuration:**

```powershell
git config --global user.name
git config --global user.email
```

You should see your name and email displayed.

---

## Step 3: Initialize Git in Your Project

### 3.1 Navigate to Your Project

Open **PowerShell** and navigate to your project folder:

```powershell
cd "c:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs"
```

**Verify you're in the right location:**

```powershell
ls
```

You should see: `app/`, `components/`, `lib/`, `package.json`, etc.

### 3.2 Initialize Git Repository

Run this command:

```powershell
git init
```

**Expected output:**
```
Initialized empty Git repository in c:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs\.git
```

### 3.3 Create or Update .gitignore

The `.gitignore` file tells Git which files to ignore (not upload).

**Check if `.gitignore` exists:**

```powershell
ls -Force -Name | Select-String ".gitignore"
```

**If it exists, verify it contains these important items:**

```powershell
cat .gitignore
```

Should include:
```
node_modules/
.env
.env.local
.env.*.local
.next/
out/
dist/
*.log
```

**If `.gitignore` doesn't exist, create it:**

```powershell
"node_modules/
.env
.env.local
.env.*.local
.next/
out/
dist/
*.log
.DS_Store
Thumbs.db" | Out-File -FilePath .gitignore -Encoding utf8
```

### 3.4 Stage Your Files

Now tell Git to track all your project files:

```powershell
git add .
```

**Verify files were staged:**

```powershell
git status
```

You should see a long list of files in green (ready to commit).

### 3.5 Create Your First Commit

A commit is like a "save point" for your code:

```powershell
git commit -m "Initial commit: Carbon Calculator MVP"
```

**Expected output:**
```
[main (root-commit) abc1234] Initial commit: Carbon Calculator MVP
 45 files changed, 1234 insertions(+)
 create mode 100644 package.json
 ...
```

**Check your commit:**

```powershell
git log --oneline
```

Should show your commit message.

---

## Step 4: Create Repository on GitHub

### 4.1 Go to GitHub New Repository Page

1. Log in to **GitHub.com**
2. Click the **+** icon (top right corner)
3. Click **New repository**

Or directly visit: **https://github.com/new**

### 4.2 Configure Repository Settings

Fill in the form:

**Repository name:**
- Enter: `carbon-calculator`
- (Can also use: `carbon-calc-mvp`, `aethera-calculator`, etc.)

**Description** (optional):
- Enter: `Carbon emissions calculator web application`

**Visibility:**
- Choose **Public** (anyone can see your code)
- Or **Private** (only you can see it)
- Recommendation: **Public** for portfolio, **Private** for confidential projects

**Initialize repository:**
- ❌ DO NOT check "Add a README file"
- ❌ DO NOT check "Add .gitignore"
- ❌ DO NOT add a license (yet)

(We're not initializing because you already have code locally)

### 4.3 Create Repository

Click **Create repository** button.

You'll see a page with instructions titled: "Quick setup — if you've done this kind of thing before"

**Keep this page open!** You'll need the commands on this page.

---

## Step 5: Connect Local Project to GitHub

### 5.1 Copy Your Repository URL

On the GitHub page from Step 4.3:

1. Look for the green **< > Code** button
2. Click it
3. Make sure **HTTPS** tab is selected (recommended for beginners)
4. Click the **copy** icon (clipboard icon)
   - This copies: `https://github.com/YOUR_USERNAME/carbon-calculator.git`

### 5.2 Add Remote Repository

Go back to **PowerShell** in your project folder and run:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/carbon-calculator.git
```

⚠️ **Replace `YOUR_USERNAME`** with your actual GitHub username!

**Example:**
```powershell
git remote add origin https://github.com/john-smith/carbon-calculator.git
```

**Verify the remote was added:**

```powershell
git remote -v
```

Should show:
```
origin  https://github.com/YOUR_USERNAME/carbon-calculator.git (fetch)
origin  https://github.com/YOUR_USERNAME/carbon-calculator.git (push)
```

### 5.3 Rename Branch to "main" (if needed)

Check your current branch:

```powershell
git branch
```

If it says `master`, rename it:

```powershell
git branch -M main
```

Verify:

```powershell
git branch
```

Should now show: `* main`

---

## Step 6: Push Code to GitHub

### 6.1 Push Your Code

Run this command:

```powershell
git push -u origin main
```

**First time setup:**
- You may be prompted to log in to GitHub
- Click **Authorize** and authenticate in the browser that opens

**Expected output:**
```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
Delta compression using up to 8 threads
Compressing objects: 100% done.
Writing objects: 100% done.
Sending 2,500 bytes, done.
remote: Resolving deltas: 100% done.
To https://github.com/YOUR_USERNAME/carbon-calculator.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

🎉 **Your code is now on GitHub!**

---

## Step 7: Verify Your Repository

### 7.1 View Your Repository Online

1. Go to **GitHub.com**
2. Click your profile icon (top right)
3. Click **Your repositories**
4. Click **carbon-calculator**

You should see:
- ✓ All your project files listed
- ✓ Your commit message
- ✓ File count and size
- ✓ "main" branch showing

### 7.2 Check Repository Contents

Look for:
- ✓ `app/` folder
- ✓ `components/` folder
- ✓ `lib/` folder
- ✓ `package.json`
- ✓ `README.md`

❌ Should NOT see:
- ❌ `node_modules/` (should be in .gitignore)
- ❌ `.env.local` (should be in .gitignore)
- ❌ `.next/` (should be in .gitignore)

### 7.3 View Your Commit

1. On your repository page
2. Look for commits count (e.g., "1 commit")
3. Click it to see commit details
4. Should show your files and changes

---

## Important Files & .gitignore

### What Gets Uploaded to GitHub

✅ **Should be on GitHub:**
- Source code (`.tsx`, `.ts`, `.css`, `.json` files)
- Configuration files (`package.json`, `tsconfig.json`, `next.config.mjs`)
- Scripts (`scripts/` folder with SQL files)
- Documentation (`README.md`, guides)
- `.gitignore` itself

### What Should NOT Be on GitHub

❌ **Should be IGNORED (in .gitignore):**
- `node_modules/` - dependencies (can be reinstalled from package.json)
- `.env.local` - local secrets and API keys
- `.env` - production secrets
- `.next/` - build output
- `dist/` - compiled files
- `.DS_Store` - Mac system files
- `Thumbs.db` - Windows system files
- `*.log` - log files

**Your current .gitignore should contain:**

```
node_modules/
.env
.env.local
.env.*.local
.next/
out/
dist/
*.log
.DS_Store
Thumbs.db
```

---

## Ongoing GitHub Workflow

After your initial setup, use this workflow for future updates:

### Workflow: Updating Your Code

**Step 1: Check what changed**
```powershell
git status
```

**Step 2: Stage your changes**
```powershell
git add .
```

**Step 3: Create a commit with a message**
```powershell
git commit -m "Description of what you changed"
```

**Examples of good commit messages:**
- `"Add user authentication"`
- `"Fix carbon calculation formula"`
- `"Update dashboard styling"`
- `"Add emission factors to database"`

**Step 4: Push to GitHub**
```powershell
git push origin main
```

**That's it!** Your changes are now on GitHub.

### Useful Git Commands

**See your commit history:**
```powershell
git log --oneline
```

**See what files changed:**
```powershell
git status
```

**See detailed changes:**
```powershell
git diff
```

**Undo a recent change (not yet committed):**
```powershell
git checkout -- filename.tsx
```

**Undo last commit (keep changes):**
```powershell
git reset --soft HEAD~1
```

---

## Troubleshooting

### Issue: "fatal: not a git repository"

**Cause:** You're not in your project folder or git wasn't initialized

**Solution:**
```powershell
cd "c:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs"
git init
```

---

### Issue: "Permission denied (publickey)"

**Cause:** Git authentication failed

**Solution:**
1. Open PowerShell
2. Run: `git push origin main`
3. A browser window will open
4. Log in to GitHub and authorize
5. Return to PowerShell - it should work now

---

### Issue: "fatal: 'origin' does not appear to be a 'git' repository"

**Cause:** Remote wasn't configured correctly

**Solution:**
```powershell
git remote add origin https://github.com/YOUR_USERNAME/carbon-calculator.git
git push -u origin main
```

---

### Issue: Files showing in GitHub that should be ignored

**Cause:** `.gitignore` wasn't created before first commit

**Solution:**
```powershell
git rm --cached node_modules
git rm --cached .env.local
git add .gitignore
git commit -m "Remove sensitive files from git tracking"
git push origin main
```

---

### Issue: "Please tell me who you are" error

**Cause:** Git user not configured

**Solution:**
```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
git commit -m "Initial commit: Carbon Calculator MVP"
```

---

## Common Mistakes to Avoid

❌ **Committing `.env.local` with API keys** → Anyone can see your secrets!
- Solution: Make sure `.gitignore` includes `.env.local`

❌ **Not using meaningful commit messages** → Hard to track changes later
- Good: `"Add database connection"`
- Bad: `"update"` or `"fix"`

❌ **Uploading `node_modules/` folder** → Makes repo huge (100+ MB)
- Solution: Keep it in `.gitignore`

❌ **Mixing multiple features in one commit** → Hard to revert individual changes
- Solution: Commit each feature separately

---

## Next Steps After GitHub Setup

✅ Now that your code is on GitHub:

1. **Proceed to Supabase Setup** (see DEPLOYMENT_GUIDE.md)
2. **Connect to Vercel** (uses GitHub automatically)
3. **Set up automatic deployments** (every push to main deploys automatically)

---

## Helpful Resources

- [GitHub Docs - Getting Started](https://docs.github.com/en/get-started)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Guides](https://guides.github.com/)
- [Connecting with SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Congratulations! Your Carbon Calculator is now backed up on GitHub! 🎉**

Your code is safe and ready for Vercel deployment!
