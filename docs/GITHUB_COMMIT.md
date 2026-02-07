# Steps to Commit to GitHub

## Prerequisites
- [Git](https://git-scm.com/downloads) installed
- A [GitHub](https://github.com) account

---

## Step 1: Initialize Git (if not already)

Open a terminal in the project folder and run:

```bash
cd "c:\Users\HP\OneDrive\Desktop\LONARA\task"
git init
```

*(Skip this if you already ran `git init` or cloned the repo.)*

---

## Step 2: Check What Will Be Committed

Your `.gitignore` already excludes:
- `node_modules/`
- `.env` (so your API key is **not** committed)
- `.next/`, build artifacts, logs

See status:
```bash
git status
```

---

## Step 3: Add and Commit

**If you get "src refspec main does not match any" on push:**  
It means there are no commits yet. You must commit first:

```bash
# Add all files (respecting .gitignore)
git add .

# Create your first commit (required before push)
git commit -m "Initial commit: AI Video Interview Platform"
```

**If you get "Unable to create .git/index.lock":**
1. Close any other terminals or apps using this folder.
2. Delete the lock file (in project root):  
   Remove `.git/index.lock` if it exists (e.g. in File Explorer show hidden files, or run: `del .git\index.lock` in Command Prompt).
3. Run `git add .` and `git commit -m "..."` again.

---

## Step 4: Create a Repository on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click **“+”** (top right) → **“New repository”**.
3. Set:
   - **Repository name:** e.g. `ai-video-interview`
   - **Description:** (optional) e.g. `AI-powered video interview platform`
   - **Public** or **Private**
   - **Do not** add a README, .gitignore, or license (you already have them).
4. Click **“Create repository”**.

---

## Step 5: Connect and Push

GitHub will show commands; use these (replace `YOUR_USERNAME` and `REPO_NAME` with yours):

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/ai-video-interview.git
git branch -M main
git push -u origin main
```

You may be asked to sign in (browser or credential manager).

---

## Later: More Commits

After making changes:

```bash
git add .
git commit -m "Describe your changes here"
git push
```

---

## Using SSH Instead of HTTPS

If you use SSH keys with GitHub:

```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Important

- **Never** commit `.env` (it’s in `.gitignore`). It contains secrets like `OPENAI_API_KEY`.
- Commit `.env.example` (no real keys) so others know which variables to set.
