# Deployment Guide - Pushup 2026 PWA

This guide will help you deploy your app so you can access it on your phone as a Progressive Web App (PWA).

## 📋 Prerequisites

Before deploying, you need to complete these setup steps:

### 1. Set Up Supabase (Required)

**Create a Supabase Project:**
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Pushup 2026
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose closest to you
5. Click "Create new project" (takes ~2 minutes)

**Set Up Database:**
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from your project
4. Paste into the SQL Editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned"

**Get Your API Keys:**
1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the left menu
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

**Add Keys to Your Project:**
1. In your project folder, find `.env` file
2. Replace the placeholder values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Create PWA Icons (Required)

Your app needs icons to be installable. Create two icon files:

**Option A: Use a simple emoji icon (Quick & Easy)**
1. Go to [https://favicon.io/emoji-favicons/](https://favicon.io/emoji-favicons/)
2. Search for "💪" (flexed bicep emoji)
3. Download the favicon
4. Extract the zip file
5. Rename the largest PNG files to:
   - `icon-192x192.png`
   - `icon-512x512.png`
6. Copy both files to your `public/` folder

**Option B: Use a custom design tool**
1. Use [Canva](https://www.canva.com) or [Figma](https://www.figma.com)
2. Create a square design (512x512px)
3. Export as PNG at two sizes:
   - 192x192px → save as `icon-192x192.png`
   - 512x512px → save as `icon-512x512.png`
4. Copy both to your `public/` folder

---

## 🚀 Deployment Options

You have 3 main options for deployment. **Vercel is recommended** for beginners.

---

## Option 1: Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the best integration.

### Step 1: Push Your Code to GitHub

1. **Create a GitHub account** if you don't have one: [https://github.com/signup](https://github.com/signup)

2. **Create a new repository:**
   - Go to [https://github.com/new](https://github.com/new)
   - Repository name: `pushup-2026`
   - Set to **Private** (recommended)
   - Don't initialize with README (we already have code)
   - Click "Create repository"

3. **Push your code to GitHub:**

   Open Terminal in your project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Pushup 2026 PWA"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/pushup-2026.git
   git push -u origin main
   ```

   Replace `YOUR-USERNAME` with your GitHub username.

### Step 2: Deploy to Vercel

1. **Create Vercel account:**
   - Go to [https://vercel.com/signup](https://vercel.com/signup)
   - Sign up with GitHub (click "Continue with GitHub")
   - Authorize Vercel to access your repositories

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Find `pushup-2026` in the list
   - Click "Import"

3. **Configure the project:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

4. **Add Environment Variables:**
   - Click "Environment Variables" section
   - Add both variables:
     ```
     Name: NEXT_PUBLIC_SUPABASE_URL
     Value: https://xxxxx.supabase.co

     Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
     Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Click "Add" for each

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://pushup-2026.vercel.app`

### Step 3: Test on Your Phone

1. **Open Safari (iOS) or Chrome (Android)** on your phone
2. Go to your Vercel URL: `https://pushup-2026.vercel.app`
3. Test the app - create a group, log some pushups

### Step 4: Install as PWA

**On iPhone (iOS):**
1. Open the app in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Pushup 2026"
5. Tap "Add"
6. Find the app icon on your home screen
7. Tap to open - it now runs like a native app!

**On Android:**
1. Open the app in **Chrome**
2. Tap the **three dots** menu (top right)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Confirm by tapping "Add" or "Install"
5. Find the app icon on your home screen
6. Tap to open - it now runs like a native app!

### Updating Your App

Whenever you make changes:
```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel automatically rebuilds and deploys! Your phone app updates next time you open it.

---

## Option 2: Netlify (Alternative)

Similar to Vercel, also very easy to use.

### Steps:

1. **Push code to GitHub** (same as Vercel Step 1 above)

2. **Create Netlify account:**
   - Go to [https://app.netlify.com/signup](https://app.netlify.com/signup)
   - Sign up with GitHub

3. **Import project:**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select `pushup-2026` repository

4. **Configure build:**
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - Click "Show advanced" → "New variable"
   - Add your Supabase env variables (same as Vercel)

5. **Deploy:**
   - Click "Deploy site"
   - Get your URL: `https://pushup-2026.netlify.app`

6. **Install on phone** (same steps as Vercel)

---

## Option 3: Railway (Database + Hosting Together)

Railway can host both your app and database in one place.

### Steps:

1. **Create Railway account:**
   - Go to [https://railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `pushup-2026`

3. **Add PostgreSQL:**
   - In your project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Wait for it to provision

4. **Configure environment:**
   - Click on your web service
   - Go to "Variables" tab
   - Add Supabase variables OR connect to Railway Postgres
   - Railway auto-detects Next.js settings

5. **Deploy and access** (similar to above)

---

## 🔧 Troubleshooting

### "Can't connect to database"
- Check your `.env` values match Supabase exactly
- Make sure you added env variables in Vercel/Netlify
- Verify you ran the `schema.sql` in Supabase SQL Editor

### "Icons not showing" or "Can't install PWA"
- Make sure `icon-192x192.png` and `icon-512x512.png` exist in `public/` folder
- Icons must be PNG format
- Icons must be square (same width and height)
- Redeploy after adding icons

### "App not updating on phone"
- Close the app completely (swipe away)
- Clear browser cache in Safari/Chrome settings
- Reopen the app
- Or uninstall and reinstall the PWA

### "Build failed on Vercel"
- Check the build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Verify no TypeScript errors locally: `npm run build`

---

## 📱 PWA Features You'll Get

Once deployed and installed:

✅ **Home screen icon** - Looks like a native app
✅ **Offline support** - Works without internet (after first load)
✅ **No browser UI** - Fullscreen experience
✅ **Fast loading** - Cached for instant startup
✅ **Push notifications** - (Can be added later if needed)
✅ **Automatic updates** - Updates when you redeploy

---

## 🎯 Recommended Flow for First Deployment

1. ✅ Set up Supabase (10 mins)
2. ✅ Create PWA icons (5 mins)
3. ✅ Test locally: `npm run dev` (verify everything works)
4. ✅ Push to GitHub (5 mins)
5. ✅ Deploy to Vercel (5 mins)
6. ✅ Test on phone browser (2 mins)
7. ✅ Install as PWA (1 min)

**Total time: ~30 minutes** ⚡

---

## 🔐 Security Notes

- Your Supabase `anon` key is safe to expose in client code (it's public)
- Row Level Security (RLS) in your database protects your data
- Don't commit `.env` file to GitHub (it's already in `.gitignore`)
- Environment variables in Vercel/Netlify are secure and encrypted

---

## 🌟 Next Steps After Deployment

1. **Share with friends:**
   - Send them your Vercel URL
   - They create accounts with your group code
   - Everyone can track together!

2. **Custom domain (Optional):**
   - Buy a domain (e.g., `pushup2026.com`)
   - Add it in Vercel: Settings → Domains
   - Follow Vercel's DNS instructions

3. **Analytics (Optional):**
   - Add Vercel Analytics for free
   - See how many people use your app

4. **Monitoring:**
   - Vercel shows deployment status
   - Supabase shows database usage
   - Both have free tiers that are generous

---

## 💡 Tips

- **iPhone users**: Must use Safari to install PWA (Chrome doesn't support it on iOS)
- **Android users**: Chrome works perfectly for PWA installation
- **Sharing**: Send your Vercel URL to anyone - they can use it immediately
- **Group codes**: Visible in Settings tab - easy to share with team
- **Data sync**: All data is in Supabase, so it syncs across all devices automatically

---

## 🆘 Need Help?

If you run into issues:

1. Check Vercel deployment logs (click on deployment → "View Function Logs")
2. Check Supabase logs (Logs section in dashboard)
3. Test locally first: `npm run dev`
4. Verify environment variables are set correctly
5. Make sure database schema was run successfully

---

**You're ready to deploy! Start with Vercel - it's the easiest path.** 🚀

Good luck with your 2026 pushup challenge! 💪
