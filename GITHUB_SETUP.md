# GitHub Setup Guide - Fix 403 Error

## Problem
You're getting a 403 error when trying to push to GitHub. This is because GitHub no longer accepts passwords for HTTPS authentication.

## Solution: Use SSH Authentication (Easiest)

### Step 1: Check if you already have SSH keys

Open Terminal and run:
```bash
ls -al ~/.ssh
```

Look for files named:
- `id_rsa.pub`
- `id_ed25519.pub`
- `id_ecdsa.pub`

**If you see any of these**, skip to Step 3.

### Step 2: Generate a new SSH key (if you don't have one)

Run this command (replace with your GitHub email):
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

When prompted:
- "Enter file in which to save the key": Press **Enter** (uses default location)
- "Enter passphrase": Press **Enter** (no passphrase, easier)
- "Enter same passphrase again": Press **Enter**

You should see:
```
Your identification has been saved in /Users/yourname/.ssh/id_ed25519
Your public key has been saved in /Users/yourname/.ssh/id_ed25519.pub
```

### Step 3: Add your SSH key to the ssh-agent

Run these commands:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

If you see "Could not open a connection to your authentication agent", run:
```bash
eval `ssh-agent -s`
ssh-add ~/.ssh/id_ed25519
```

### Step 4: Copy your SSH public key

Run this command to copy your public key:
```bash
pbcopy < ~/.ssh/id_ed25519.pub
```

Your SSH key is now copied to clipboard!

### Step 5: Add SSH key to GitHub

1. Go to GitHub.com and sign in
2. Click your profile picture (top right) → **Settings**
3. In the left sidebar, click **SSH and GPG keys**
4. Click **New SSH key** (green button)
5. Fill in:
   - **Title**: "My Mac" (or whatever you want to call it)
   - **Key**: Paste (Cmd+V) the key you copied
6. Click **Add SSH key**
7. Confirm with your GitHub password if prompted

### Step 6: Test your SSH connection

```bash
ssh -T git@github.com
```

You should see:
```
Hi YOUR-USERNAME! You've successfully authenticated, but GitHub does not provide shell access.
```

If you see a message about "authenticity of host", type `yes` and press Enter.

### Step 7: Update your Git remote to use SSH

In your project folder, run:
```bash
cd /Users/lewysanderson/Desktop/Projects/press-ups-project
git remote set-url origin git@github.com:lewysanderson/pushup-2026.git
```

### Step 8: Try pushing again

```bash
git push -u origin main
```

It should work now! ✅

---

## Alternative Option 2: Use Personal Access Token (PAT)

If you prefer HTTPS over SSH:

### Step 1: Create a Personal Access Token

1. Go to GitHub.com and sign in
2. Click your profile picture → **Settings**
3. Scroll down and click **Developer settings** (bottom left)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**
6. Fill in:
   - **Note**: "Pushup 2026 deployment"
   - **Expiration**: 90 days (or longer)
   - **Scopes**: Check **repo** (this selects all repo permissions)
7. Scroll down and click **Generate token**
8. **IMPORTANT**: Copy the token immediately (starts with `ghp_`)
   - You won't be able to see it again!
   - Save it somewhere safe (password manager, notes app)

### Step 2: Push using the token

When you run `git push`, instead of your password, use the token:

```bash
git push -u origin main
```

When prompted:
- **Username**: lewysanderson
- **Password**: Paste your token (ghp_xxxxx...)

### Step 3: Save credentials (optional)

To avoid entering the token every time:
```bash
git config --global credential.helper osxkeychain
```

Next time you push and enter your token, macOS will save it in Keychain.

---

## Quick Commands Summary

**For SSH (recommended):**
```bash
# Generate key (if needed)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
pbcopy < ~/.ssh/id_ed25519.pub

# (Add key to GitHub in browser)

# Test connection
ssh -T git@github.com

# Update remote
git remote set-url origin git@github.com:lewysanderson/pushup-2026.git

# Push
git push -u origin main
```

**For HTTPS with PAT:**
```bash
# (Create token in GitHub settings)

# Push (will prompt for username and token)
git push -u origin main

# Save credentials
git config --global credential.helper osxkeychain
```

---

## Troubleshooting

### "Permission denied (publickey)"
- Make sure you added the SSH key to GitHub
- Make sure you copied the PUBLIC key (ends in .pub)
- Try running: `ssh-add -l` to see if your key is loaded

### "Could not read from remote repository"
- Check that the repository exists: https://github.com/lewysanderson/pushup-2026
- Make sure you created the repo on GitHub first
- Verify you're using the correct username

### "Repository not found"
- The repo might not exist yet on GitHub
- Go to https://github.com/new and create it first
- Make sure it's named exactly: `pushup-2026`

### "fatal: The current branch main has no upstream branch"
Just run:
```bash
git push -u origin main
```

---

## After Successful Push

Once you've successfully pushed to GitHub:

1. ✅ Your code is now backed up on GitHub
2. ✅ You can see it at: https://github.com/lewysanderson/pushup-2026
3. ✅ Ready to deploy to Vercel
4. ✅ Go to https://vercel.com and import your project

---

## Next: Deploy to Vercel

After your code is on GitHub:

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import `pushup-2026`
5. Add your Supabase environment variables
6. Deploy!

You'll get a URL like: `https://pushup-2026.vercel.app`

---

**SSH is recommended because it's more secure and you don't need to manage tokens!**
