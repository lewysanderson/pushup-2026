# Deployment Checklist

Use this checklist to ensure everything is set up correctly before deploying.

## Pre-Deployment Setup

### 1. Supabase Configuration ✓

- [ ] Created Supabase project
- [ ] Ran `supabase/schema.sql` in SQL Editor
- [ ] Verified tables created: `groups`, `profiles`, `logs`
- [ ] Confirmed RLS policies are enabled (check Table Editor → each table)
- [ ] Tested Realtime is enabled (Settings → API → Realtime toggle)
- [ ] Copied Project URL and anon key

### 2. Environment Variables ✓

- [ ] Created `.env` file in project root
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Tested connection by running `npm run dev`

### 3. PWA Icons ✓

- [ ] Created or downloaded `icon-192x192.png`
- [ ] Created or downloaded `icon-512x512.png`
- [ ] Placed both icons in `public/` folder
- [ ] Icons are PNG format (not JPG or SVG)
- [ ] Icons have transparent or black backgrounds

### 4. Local Testing ✓

- [ ] Ran `npm run dev` successfully
- [ ] Created a test group
- [ ] Noted the 6-character group code
- [ ] Opened an incognito window
- [ ] Joined the same group using the code
- [ ] Logged pushups from both accounts
- [ ] Verified leaderboard shows both users
- [ ] Checked real-time updates work
- [ ] Tested analytics charts display
- [ ] Verified streak counter works

## Deployment to Vercel

### Option A: GitHub + Vercel (Recommended)

- [ ] Initialized git repository: `git init`
- [ ] Added files: `git add .`
- [ ] Created initial commit: `git commit -m "Initial commit - Pushup 2026"`
- [ ] Created GitHub repository
- [ ] Pushed to GitHub: `git push -u origin main`
- [ ] Logged into Vercel.com
- [ ] Clicked "New Project"
- [ ] Imported GitHub repository
- [ ] Added environment variables in Vercel settings
- [ ] Clicked "Deploy"
- [ ] Waited for deployment to complete (~2 minutes)

### Option B: Vercel CLI

- [ ] Installed Vercel CLI: `npm i -g vercel`
- [ ] Ran `vercel` in project directory
- [ ] Selected or created Vercel project
- [ ] Added environment variables when prompted
- [ ] Confirmed deployment settings
- [ ] Waited for deployment

## Post-Deployment Verification

### 1. Production Build Test ✓

- [ ] Opened Vercel deployment URL
- [ ] Verified landing page loads
- [ ] No console errors in DevTools
- [ ] Created a new group (different from test)
- [ ] Completed profile setup
- [ ] Logged pushups successfully
- [ ] Checked all three tabs work (Home, Stats, Leaderboard)

### 2. PWA Installation Test ✓

**iOS (Safari)**:
- [ ] Opened Vercel URL in Safari on iPhone
- [ ] Tapped Share button (box with arrow)
- [ ] Tapped "Add to Home Screen"
- [ ] Verified app icon appears on home screen
- [ ] Opened app from home screen (no Safari UI visible)
- [ ] App works as expected

**Android (Chrome)**:
- [ ] Opened Vercel URL in Chrome on Android
- [ ] Saw "Install app" prompt at bottom
- [ ] Tapped "Install"
- [ ] Verified app icon appears on home screen
- [ ] Opened app from home screen
- [ ] App works as expected

### 3. Multi-Device Real-Time Test ✓

- [ ] Have group code ready
- [ ] Opened app on Device A (logged in)
- [ ] Opened app on Device B (joined same group)
- [ ] Logged pushups on Device A
- [ ] Verified leaderboard updated on Device B
- [ ] Logged pushups on Device B
- [ ] Verified leaderboard updated on Device A
- [ ] Real-time sync working (updates within 1-2 seconds)

### 4. Performance Check ✓

- [ ] Opened Chrome DevTools → Lighthouse
- [ ] Ran audit on deployed URL
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 80
- [ ] PWA badge present

## Production Monitoring

### Vercel Dashboard

- [ ] Checked deployment logs for errors
- [ ] Verified build completed successfully
- [ ] Noted production URL
- [ ] Set up custom domain (optional)

### Supabase Dashboard

- [ ] Checked Table Editor → `groups` has entries
- [ ] Checked Table Editor → `profiles` has entries
- [ ] Checked Table Editor → `logs` has entries
- [ ] Reviewed Logs for any errors
- [ ] Monitored API usage (Dashboard → Usage)

## Share with Team

- [ ] Shared Vercel production URL
- [ ] Created initial group
- [ ] Shared group code with team
- [ ] Provided installation instructions:
  - iOS: Open in Safari → Share → Add to Home Screen
  - Android: Open in Chrome → Install app prompt
- [ ] Demonstrated how to log pushups
- [ ] Showed leaderboard and stats tabs

## Troubleshooting

If something isn't working:

**Build Fails**:
- Check Vercel logs for error messages
- Verify all dependencies are in `package.json`
- Ensure TypeScript has no errors: `npm run build` locally

**PWA Not Installing**:
- Must be HTTPS (Vercel provides this automatically)
- Check icons exist in `/public`
- Clear browser cache and try again
- Verify manifest.json is served correctly

**Database Connection Fails**:
- Double-check environment variables in Vercel
- Verify Supabase project is not paused
- Test connection locally with same credentials

**Real-Time Not Working**:
- Check Supabase Realtime is enabled (Settings → API)
- Verify RLS policies allow reads
- Check browser console for WebSocket errors

## Optional Enhancements

After successful deployment:

- [ ] Set up custom domain in Vercel
- [ ] Add Vercel Analytics for usage tracking
- [ ] Enable Supabase database backups (paid plan)
- [ ] Set up monitoring/alerts for downtime
- [ ] Create additional test groups for different teams
- [ ] Document any custom modifications

## Maintenance Schedule

**Weekly**:
- Check Supabase dashboard for errors
- Monitor database usage (free tier: 500MB)
- Review Vercel analytics

**Monthly**:
- Update dependencies: `npm update`
- Test app on latest iOS and Android versions
- Review and respond to user feedback

**Quarterly**:
- Evaluate Supabase storage usage
- Consider upgrading to paid tier if needed
- Review and implement feature requests

---

## Success Criteria

Your deployment is successful when:

✅ App loads on both desktop and mobile
✅ PWA installs correctly on iOS and Android
✅ Multiple users can join the same group
✅ Pushup logging works and updates leaderboard
✅ Real-time updates work across devices
✅ Analytics charts display correctly
✅ No errors in browser console or Vercel logs
✅ Lighthouse PWA audit passes

**Congratulations! Your Pushup 2026 app is live!** 🎉💪

Share the URL with your team and start crushing those pushup goals!
