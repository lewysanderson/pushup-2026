# Quick Start Guide

Get Pushup 2026 running in 5 minutes!

## Step 1: Supabase Setup (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign in → **New Project**
2. Name it "pushup-2026" → Choose a password → Select region → **Create**
3. Wait for project to finish setting up (~2 minutes)

## Step 2: Get API Keys (30 seconds)

1. In Supabase dashboard, go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 3: Configure Environment (30 seconds)

Create a file named `.env` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

Replace with your actual values from Step 2.

## Step 4: Run Database Schema (1 minute)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `supabase/schema.sql` from this project
4. Copy everything and paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 5: Create Icons (1 minute)

**Quick & Easy Method**:

1. Go to [favicon.io/emoji-favicons/flexed-biceps](https://favicon.io/emoji-favicons/flexed-biceps/)
2. Download the ZIP file
3. Extract it
4. Copy `android-chrome-192x192.png` → Rename to `icon-192x192.png`
5. Copy `android-chrome-512x512.png` → Rename to `icon-512x512.png`
6. Place both files in the `public/` folder

**Alternative**: Use any 💪, 🔥, or ⚡ emoji PNG generator.

## Step 6: Run the App (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the landing page! 🎉

## Test the App

1. Click **"Create a Group"**
2. Enter a group name (e.g., "Test Squad")
3. Set a target (e.g., 10000)
4. Choose an avatar and name
5. Set daily target (e.g., 50)
6. You're in! Try logging some pushups with the + button

## Deploy to Vercel (Optional, 2 minutes)

```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main

# Then deploy via Vercel UI
```

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

Add the same environment variables from `.env` when prompted.

---

## Troubleshooting

**"Missing Supabase environment variables"**
- Double-check your `.env` file exists and has the correct keys
- Restart dev server after creating `.env`

**"Failed to create group"**
- Make sure you ran the SQL schema (Step 4)
- Check Supabase project isn't paused

**PWA not installing**
- PWA only works in production mode
- Run `npm run build && npm start` to test locally
- Or deploy to Vercel first

**Need help?**
- Check the full [README.md](README.md) for detailed docs
- Review Supabase dashboard → Logs for error messages

---

**That's it!** You're ready to track pushups and compete with friends. 💪🔥
