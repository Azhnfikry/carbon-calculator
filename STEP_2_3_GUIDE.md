# Step 2 & 3: Link GitHub to VS Code & Initialize Git

This guide covers:
1. **Step 2:** Linking your GitHub account to VS Code
2. **Step 3:** Initializing Git in your project (NO CODE CHANGES NEEDED!)

---

## Step 2: Link GitHub Account to VS Code

### 2.1 Open VS Code

1. Launch **Visual Studio Code**
2. You should see your Carbon Calculator project files on the left

### 2.2 Access Source Control

In VS Code, click the **Source Control** icon on the left sidebar:
- Icon looks like a **branch symbol** (3 connected dots)
- Or press **Ctrl + Shift + G**

You'll see:
```
SOURCE CONTROL
Initialize Repository
```

### 2.3 Authenticate with GitHub

There are two ways to authenticate:

#### **Method 1: Through VS Code's GitHub Integration** (Easiest)

1. In Source Control panel, look for **"Sign in with GitHub"** or similar prompt
2. Click it
3. A browser window will open asking to authorize VS Code
4. Click **Authorize github** 
5. You'll be redirected back to VS Code
6. VS Code now has access to your GitHub account ✓

#### **Method 2: Manual Authentication**

1. Open VS Code **Settings** (Ctrl + ,)
2. Search for: `github.auth`
3. Select **"Github"** from dropdown
4. VS Code will prompt you to authorize
5. Confirm in browser

### 2.4 Verify Authentication

You'll know it worked when:
- ✓ Your GitHub username appears in Source Control panel
- ✓ No more "Sign in with GitHub" prompt
- ✓ You see your profile icon

**That's it for Step 2!** Your GitHub account is now linked to VS Code.

---

## Step 3: Initialize Git in Your Project

### ⚠️ IMPORTANT: NO CODE CHANGES NEEDED!

This step only creates a hidden `.git` folder. It does NOT modify any of your project files.

### 3.1 Open Terminal in VS Code

In VS Code:
1. Press **Ctrl + `** (backtick key)
2. Or go to **View** → **Terminal**

A terminal window opens at the bottom.

### 3.2 Verify You're in the Right Folder

In the terminal, check where you are:

```powershell
pwd
```

Should show: `C:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs`

If it shows a different path:

```powershell
cd "C:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs"
```

### 3.3 Initialize Git Repository

Run this command:

```powershell
git init
```

**What happens:**
- Git creates a hidden `.git` folder in your project
- This tracks all your files
- No files are modified or changed

**Expected output:**
```
Initialized empty Git repository in C:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs\.git
```

### 3.4 Check Git Status

Run:

```powershell
git status
```

**Expected output:**
```
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        DEPLOYMENT_GUIDE.md
        GITHUB_SETUP_GUIDE.md
        README.md
        app/
        components/
        lib/
        middleware.ts
        next.config.mjs
        package.json
        postcss.config.mjs
        tailwind.config.ts
        tsconfig.json
        types/

nothing added to commit but untracked files present (track with git)
```

### 3.5 VS Code Updates Automatically

You'll notice VS Code changes:

**Before (Step 3):**
- Source Control shows "Initialize Repository"
- No Git icon on files

**After (Step 3):**
- Source Control now shows your files
- Files are marked with **U** (Untracked)
- Files appear in a list ready to commit

This is normal! ✓

---

## Visual Guide: What's Happening

### Before Git Init:
```
VS Code
├─ Explorer (file browser)
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  └─ package.json
│
└─ Source Control
   └─ "Initialize Repository" button
```

### After Git Init:
```
VS Code
├─ Explorer (file browser)
│  ├─ app/
│  ├─ components/
│  ├─ lib/ 
│  └─ package.json
│
└─ Source Control
   ├─ Changes (0)
   ├─ Untracked Files (14)
   │  ├─ U DEPLOYMENT_GUIDE.md
   │  ├─ U README.md
   │  ├─ U app/
   │  ├─ U components/
   │  ├─ U lib/
   │  └─ ... (more files)
   │
   └─ Message box (for commit message)
```

---

## Quick Checklist for Steps 2 & 3

### Step 2: Link GitHub to VS Code ✓
- [ ] GitHub account created
- [ ] VS Code opened
- [ ] Clicked Source Control icon (Ctrl + Shift + G)
- [ ] Authorized VS Code with GitHub
- [ ] GitHub username appears in VS Code

### Step 3: Initialize Git ✓
- [ ] Terminal opened (Ctrl + `)
- [ ] Confirmed correct folder: `pwd`
- [ ] Ran: `git init`
- [ ] Ran: `git status`
- [ ] See "Untracked files" list in terminal
- [ ] Source Control panel shows files

---

## What NOT to Do

❌ **Don't modify any code files**
❌ **Don't rename any folders**
❌ **Don't delete any files**
❌ **Don't close the terminal during git init**

---

## Next: Step 4 - Create Repository on GitHub

After completing Steps 2 & 3:

1. Go to **GitHub.com**
2. Click **+** → **New repository**
3. Name it: `carbon-calculator`
4. Click **Create repository**
5. Copy the repository URL (you'll use it in Step 5)

---

## Troubleshooting

### Issue: "git: command not found"

**Solution:**
1. Close VS Code completely
2. Restart your computer
3. Open VS Code again
4. Try again

Or download Git from: https://git-scm.com

---

### Issue: VS Code shows error about Git

**Solution:**
1. Open VS Code **Settings** (Ctrl + ,)
2. Search: `git.path`
3. Leave it blank (automatic detection)
4. Restart VS Code

---

### Issue: Terminal shows different path

**Solution:**
Run this command:
```powershell
cd "C:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs"
```

Then run: `git init`

---

### Issue: .git folder not visible

This is normal! It's a hidden folder.

To see it:
1. Open File Explorer
2. Go to your project folder
3. Press **View** → **Hidden items** (or Ctrl + H)
4. You'll see `.git` folder (small folder icon with dot)

---

## After Step 3 - What Happened?

Your project now has:

```
Carbon-Calculator-Main Programs/
├─ .git/                          ← NEW! (hidden folder)
│  ├─ objects/
│  ├─ refs/
│  ├─ HEAD
│  └─ config
│
├─ app/
├─ components/
├─ lib/
├─ package.json
└─ (all other files unchanged)
```

**The `.git` folder:**
- ✓ Is hidden (doesn't show by default)
- ✓ Is very small (doesn't use much space)
- ✓ Never needs to be modified
- ✓ Tracks all changes automatically

---

## Ready for Step 4?

Once you've completed Steps 2 & 3:

**Next Steps (from GITHUB_SETUP_GUIDE.md):**
1. Create repository on GitHub.com
2. Add remote repository URL to local Git
3. Commit your files
4. Push to GitHub
5. Verify on GitHub website

---

## Quick Command Reference

```powershell
# Check current folder
pwd

# Change to your project folder
cd "C:\Users\N O\Desktop\Aethera\Carbon C MVP\Carbon-Calculator-Main Programs"

# Initialize Git (Step 3)
git init

# Check Git status
git status

# Configure your Git profile (one-time setup)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Stage all files (prepares them for commit)
git add .

# Commit files (saves them with a message)
git commit -m "Initial commit: Carbon Calculator MVP"

# Connect to GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/carbon-calculator.git

# Push to GitHub (uploads your code)
git push -u origin main
```

---

**Congratulations! Steps 2 & 3 Complete! 🎉**

Your project is now ready for GitHub. Move to Step 4: Create Repository on GitHub.
