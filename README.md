# Pushup 2026 - Premium PWA Pushup Tracker

A mobile-first Progressive Web App for tracking daily pushups with group competitions, real-time leaderboards, and analytics. Built with Next.js 15, Supabase, and designed to feel like a native premium iOS/Android app.

## Features

- **Mobile-First Design**: Optimized for smartphones with PWA support (installable on home screen)
- **Group Competitions**: Create or join groups with unique invite codes
- **Real-Time Leaderboards**: Live updates with total reps and streak rankings
- **Progress Analytics**: Line charts, stats cards, and year-end projections
- **Circular Progress Tracker**: Premium UI with satisfying animations
- **Streak Tracking**: Monitor consecutive days of hitting your target
- **Optimistic UI**: Instant feedback without waiting for database responses
- **Dark Mode**: OLED black backgrounds for battery efficiency and style
- **Glassmorphism**: Modern UI with subtle transparency effects

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **PWA**: next-pwa
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (free tier works great)

### 1. Clone and Install

```bash
# Navigate to project directory
cd press-ups-project

# Install dependencies (already done)
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

3. Create a `.env` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the database schema:
   - Go to the **SQL Editor** in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql`
   - Paste and run it

This will create:
- `groups` table (group info and codes)
- `profiles` table (user profiles)
- `logs` table (daily pushup logs)
- Views for leaderboards and group stats
- A `calculate_streak` function

### 3. Create PWA Icons

You need two icon files in the `public/` directory:

- `icon-192x192.png` (192×192 pixels)
- `icon-512x512.png` (512×512 pixels)

**Quick options**:
1. Use an emoji tool to generate PNG files (💪, 🔥, etc.)
2. Use [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Design your own with Figma/Canva

See `public/ICON_INSTRUCTIONS.md` for details.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: PWA features are disabled in development mode. They only work in production builds.

## Deploying to Vercel

### Option 1: Via GitHub (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Pushup 2026 PWA"
git remote add origin your-github-repo-url
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click **New Project** → Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

### Post-Deployment

Once deployed, your PWA is ready to install:

**iOS (Safari)**:
1. Open the Vercel URL in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app icon will appear on your home screen

**Android (Chrome)**:
1. Open the Vercel URL in Chrome
2. Chrome will prompt to "Install app"
3. Tap Install

## Project Structure

```
press-ups-project/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with PWA metadata
│   │   ├── page.tsx         # Main app with onboarding flow
│   │   └── globals.css      # Global styles and theme
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── onboarding/      # Landing, CreateGroup, JoinGroup, ProfileSetup
│   │   └── dashboard/       # Logger, Analytics, Leaderboard
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── utils.ts         # Helper functions
│   │   └── context/         # React context (UserContext)
│   └── types/
│       ├── database.ts      # Supabase types
│       └── index.ts         # App types
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icon-*.png           # App icons (you need to add these)
├── supabase/
│   └── schema.sql           # Database schema
└── next.config.ts           # Next.js config with PWA
```

## Usage Guide

### For Group Admins

1. **Create a Group**:
   - Tap "Create a Group"
   - Enter a group name (e.g., "2026 Beast Mode")
   - Optionally set a group target (e.g., 100,000 total pushups)
   - You'll receive a 6-character code

2. **Share the Code**:
   - Share the code with friends/teammates
   - They use it to join your group

3. **Set Your Profile**:
   - Choose an avatar emoji
   - Enter your name
   - Set your daily target (default: 50)

### For Group Members

1. **Join a Group**:
   - Tap "Join a Group"
   - Enter the 6-character code from your admin
   - Complete your profile

### Logging Pushups

1. **Quick Add**:
   - Tap the big + button
   - Enter total reps
   - Tap "Log Pushups"

2. **Advanced Mode**:
   - Tap "Advanced (Sets & Reps)"
   - Enter sets and reps per set
   - Auto-calculates total

### Viewing Stats

- **Home Tab**: Today's progress and streak
- **Stats Tab**: Year-to-date analytics, charts, projections, and AI tips
- **Leaderboard Tab**: Group rankings by total reps or streak

## Database Schema

### Groups Table
- `id`: UUID (primary key)
- `code`: 6-character alphanumeric code (unique)
- `name`: Group name
- `group_target`: Optional year-end target
- `created_at`: Timestamp

### Profiles Table
- `id`: UUID (primary key)
- `username`: Display name
- `avatar_url`: Emoji or image URL
- `daily_target`: Personal daily goal (default: 50)
- `group_id`: Foreign key to groups
- `created_at`: Timestamp

### Logs Table
- `id`: UUID (primary key)
- `user_id`: Foreign key to profiles
- `date`: Date (YYYY-MM-DD)
- `count`: Total reps for that day
- `sets_breakdown`: Optional JSON (e.g., `{"sets": 3, "reps": 20}`)
- `created_at`: Timestamp
- **Unique constraint**: `(user_id, date)`

## Customization

### Change Theme Colors

Edit [src/app/globals.css](src/app/globals.css):

```css
:root {
  --primary: 142 76% 56%; /* Change this for accent color */
  --background: 0 0% 0%;  /* OLED black */
  /* ... */
}
```

### Adjust Daily Target Range

Edit [src/components/onboarding/ProfileSetup.tsx](src/components/onboarding/ProfileSetup.tsx):

```tsx
// Change min/max values
<Input
  type="number"
  min="1"
  max="1000"  // Adjust this
  // ...
/>
```

### Add More Avatar Options

Edit [src/components/onboarding/ProfileSetup.tsx](src/components/onboarding/ProfileSetup.tsx):

```tsx
const AVATAR_OPTIONS = ["💪", "🔥", "⚡", "🦾", "🚀", "👑", "🎯", "💯"];
// Add more emojis here
```

## Troubleshooting

### PWA Not Installing

- Ensure you're using HTTPS (Vercel provides this automatically)
- Check that `icon-192x192.png` and `icon-512x512.png` exist in `/public`
- Clear browser cache and try again

### Supabase Connection Issues

- Verify environment variables are set correctly
- Check Supabase project is not paused (free tier pauses after inactivity)
- Ensure RLS policies are enabled (schema.sql includes these)

### Real-Time Updates Not Working

- Check Supabase Realtime is enabled (Project Settings → API → Realtime)
- Verify the logs table has proper permissions

## Performance

- **Optimistic UI**: Updates show instantly before database confirmation
- **PWA Caching**: Static assets cached for offline support
- **Supabase Connection Pooling**: Efficient database queries
- **Code Splitting**: Next.js automatically splits code per route

## Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Environment Variables**: Sensitive keys stored in `.env` (never committed)
- **Client-Side Only**: This app uses Supabase's anon key (safe for client-side)
- **No Authentication**: Simplified for ease of use (uses local storage)

**Note**: This is designed for friendly competitions. For production apps with sensitive data, implement Supabase Auth.

## Future Enhancements

- [ ] Calendar heatmap visualization
- [ ] Push notifications for streak reminders
- [ ] Profile photos via Supabase Storage
- [ ] Exercise variations (diamond, decline, etc.)
- [ ] Export data to CSV
- [ ] Social sharing of achievements
- [ ] Admin dashboard for group management

## License

MIT License - feel free to use this for your own projects!

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)

---

**Ready to crush 2026?** Deploy this app and start tracking! 💪
