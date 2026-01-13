# Login System - Documentation

## 🔐 Overview

Added a complete login system that allows users to log back in with their **username + group code** combination. No more losing progress after logout!

---

## 🎯 How It Works

### Authentication Method
- **Username** + **Group Code** = Your login credentials
- No passwords needed
- Simple and memorable
- Group-specific (your username is unique within your group)

### Flow:
1. User logs out
2. Returns to **landing page** (not profile creation)
3. Clicks "Log In"
4. Enters username and group code
5. Instantly logged back in with all data intact

---

## 📱 Updated Landing Page

### New Layout (3 Options):

```
┌─────────────────────────────────┐
│         2026 Pushup Challenge   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   🔑 Log In             │   │ ← Primary action (existing users)
│  └─────────────────────────┘   │
│                                 │
│       Or create new             │ ← Divider
│                                 │
│  ┌─────────────────────────┐   │
│  │   ➕ Create a Group     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   👥 Join a Group       │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Changes:
- **"Log In"** is now the **primary button** (top, full color)
- Divider text: "Or create new"
- Create/Join buttons now glassmorphism style
- Clear visual hierarchy for returning users

---

## 🔑 Login Screen

### Fields:
1. **Username**
   - The name you created during signup
   - Case-sensitive
   - Max 30 characters

2. **Group Code**
   - 6-character alphanumeric code
   - Auto-uppercased
   - Shows character count (e.g., "3/6 characters")

### Validation:
- Username required
- Group code must be exactly 6 characters
- Real-time error messages:
  - "Invalid group code" - Code doesn't exist
  - "Username not found in this group" - Wrong username for that group
  - "Login failed" - Network/database error

### Visual Design:
- Clean card layout with glassmorphism
- Large input fields for easy mobile typing
- Group code displayed in monospace font (like a code)
- "Back" button returns to landing
- "Don't have an account?" link at bottom

---

## 👤 Profile Creation Updates

### Important Notice Added:
When creating a profile, users now see:
```
Your Name
[Input field]
💡 Remember this! You'll use your name + group code to log back in.
```

This ensures users:
- Know their username is their login
- Understand they need to remember it
- Are aware of the login method upfront

---

## 🔄 Logout Behavior

### Old Flow:
```
Logout → Landing → Create/Join (lose all data)
```

### New Flow:
```
Logout → Landing → Log In → Dashboard (with all data)
```

### What Happens on Logout:
1. User clicks logout in Settings
2. Local storage cleared (profile + group removed)
3. Returns to **Landing Page** with "Log In" option
4. Can immediately log back in with credentials

---

## 🗄️ Database Lookup

### How Login Works:

1. **User enters**: Username = "John", Code = "ABC123"

2. **Step 1**: Find group by code
   ```sql
   SELECT * FROM groups WHERE code = 'ABC123'
   ```

3. **Step 2**: Find profile by username + group_id
   ```sql
   SELECT * FROM profiles
   WHERE username = 'John'
   AND group_id = 'uuid-from-step-1'
   ```

4. **Result**: If both found, user logged in with full profile + group data

### Why This Works:
- Usernames are **unique per group** (not globally unique)
- Same username can exist in different groups
- Group code ensures you're logging into the right group
- No need for email verification or password complexity

---

## 🎨 User Experience

### For First-Time Users:
1. Land on app
2. See "Log In" (but they don't have an account yet)
3. Click "Create a Group" or "Join a Group"
4. See notice: "Remember this! You'll use your name + group code to log back in"
5. Complete setup

### For Returning Users:
1. Land on app
2. Click "Log In" (primary button)
3. Enter username + group code
4. Instantly back in their dashboard

### Error Scenarios:

**Wrong Group Code:**
```
❌ Invalid group code
```

**Wrong Username:**
```
❌ Username not found in this group.
   Check your username or create a new profile.
```

**Typo in Username:**
```
You entered: "Jhon"
Error: Username not found
Solution: Try "John"
```

---

## 📊 Credentials to Remember

Users need to remember **2 things**:

1. **Username** (what they entered during signup)
2. **Group Code** (6 characters, shown in Settings)

### Easy to Find Again:
- Group code always visible in **Settings tab**
- Can share code with friends who are in same group
- If you know someone in your group, ask them for the code

---

## 🔒 Security Considerations

### Current Model:
- **Simplified authentication** for ease of use
- No passwords = No password breaches
- Group code acts as shared "secret"
- Username + Group Code = Access

### Limitations:
- Anyone with your username + group code can log in as you
- No email recovery
- No password reset flows
- Intended for **friendly competitions**, not sensitive data

### For Production Security:
If you need enhanced security, consider:
- Add Supabase Auth (email/password)
- Add email verification
- Implement password requirements
- Add 2FA option
- Session management with tokens

---

## 🎯 Use Cases

### Scenario 1: Daily Use
```
Morning:
- Open app (auto-logged in from localStorage)
- Log pushups
- Check leaderboard

Evening:
- Open app again (still logged in)
- Log more pushups
```

### Scenario 2: New Phone
```
- Install PWA on new device
- Click "Log In"
- Enter: "John" + "ABC123"
- All data appears (synced from database)
```

### Scenario 3: Shared Device
```
User A:
- Logs out
- User B logs in with their credentials
- Each sees their own data

User B logs out:
- User A logs back in
- Back to User A's dashboard
```

### Scenario 4: Lost Password... Wait, No Passwords!
```
User: "I forgot my password!"
You: "There are no passwords! Just use your name + group code."
User: "Oh! That's easy!"
```

---

## 🚀 Testing Checklist

Test these scenarios:

### Happy Path:
- [ ] Create profile with username "TestUser"
- [ ] Note the group code (e.g., "ABC123")
- [ ] Log out from Settings
- [ ] See landing page with "Log In" button
- [ ] Click "Log In"
- [ ] Enter "TestUser" + "ABC123"
- [ ] Successfully logged back in
- [ ] All data (logs, stats) still present

### Error Handling:
- [ ] Try logging in with wrong group code
- [ ] Try logging in with wrong username
- [ ] Try logging in with partial group code (< 6 chars)
- [ ] Verify error messages are clear

### Flow Testing:
- [ ] Create new profile, immediately logout, login again
- [ ] Multiple logout/login cycles
- [ ] Different devices (phone, tablet, desktop)

### Edge Cases:
- [ ] Username with spaces
- [ ] Group code lowercase (should auto-uppercase)
- [ ] Very long username (30 char limit)
- [ ] Special characters in username

---

## 📝 User Documentation

### For Your Users:

**How to Log In:**
1. Open the app
2. Click "Log In"
3. Enter your name (the one you chose when you signed up)
4. Enter your group code (6 characters, found in Settings)
5. Tap "Log In"

**Forgot Your Group Code?**
- Ask someone in your group
- They can find it in Settings tab
- It's the same code everyone uses to join

**Forgot Your Username?**
- Unfortunately, we can't recover it without your username
- You may need to create a new profile
- Tip: Use your real name for easy recall!

---

## 🎉 Benefits

### For Users:
✅ No passwords to remember
✅ Simple 2-field login
✅ Fast authentication
✅ Works across devices
✅ No email verification required

### For You (Developer):
✅ No password hashing needed
✅ No "forgot password" flows
✅ No email service integration
✅ Simple database queries
✅ Easy to implement and maintain

### For Groups:
✅ Easy to share access (just the code)
✅ Everyone in group has same code
✅ New members join quickly
✅ No complex invite systems

---

## 🔮 Future Enhancements

Potential improvements:

1. **Remember Last Username**: Auto-fill last used username
2. **Multiple Groups**: Allow user to be in multiple groups
3. **Profile Pictures**: Visual identifier on login
4. **Quick Switch**: Switch between groups without logging out
5. **Biometric Login**: Use fingerprint/FaceID on mobile
6. **Session Persistence**: Stay logged in longer
7. **"Forgot Code" Helper**: Show hint based on username

---

## 📋 Implementation Summary

### New Files Created:
- `src/components/onboarding/Login.tsx` - Login component

### Modified Files:
- `src/app/page.tsx` - Added login step and handler
- `src/components/onboarding/Landing.tsx` - Added login button
- `src/components/onboarding/ProfileSetup.tsx` - Added reminder notice

### Database Queries:
- Login requires 2 queries (group lookup + profile lookup)
- No new tables needed (uses existing `groups` and `profiles`)
- Username + group_id combination is the "primary key" for lookup

---

## ✅ Complete Feature Set

Your app now has:
- ✅ **Login System** (username + group code)
- ✅ **Logout Functionality** (returns to landing)
- ✅ **Profile Creation** (with login reminder)
- ✅ **Group Management** (create/join)
- ✅ **Data Persistence** (across login sessions)
- ✅ **Cross-Device Sync** (via database)

**Perfect for friendly competition without the complexity of traditional auth!** 🎉
