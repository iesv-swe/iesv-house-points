# IESV HOUSE POINTS SYSTEM - COMPLETE USER GUIDE

**Welcome! This guide will teach you everything you need to know to run and maintain the IESV House Points System.**

This assumes you have basic tech skills but are new to this specific project.

---

## 📚 WHAT IS THIS SYSTEM?

A gamified house points system for IESV school (like Harry Potter houses):
- 454 students + 82 staff sorted into 4 houses
- Teachers award points for good behavior (7 categories)
- Live leaderboard shows rankings
- All automated via Google Sheets + GitHub Pages
- Weekly and optional monthly tracking

**Think of it as:** 
- Frontend = HTML pages hosted on GitHub Pages
- Backend = Google Sheet + Apps Script (like Excel macros)
- Database = Google Sheet tabs

---

## 🎯 THE BASICS - 5 MINUTES

### The 4 Houses
- **Phoenix** 🔥 (Red) - Resilience, Courage, Rising Again
- **Dragon** 🐉 (Green) - Strength, Wisdom, Perseverance
- **Hydra** 🌊 (Blue) - Adaptability, Unity, Determination
- **Griffin** 🦅 (Orange) - Leadership, Excellence, Honor

### The 7 Categories (Behaviors Worth Points)
1. **Kindness/Helping Others** - Compassion, empathy, helping peers
2. **Academic Effort/Excellence** - Trying hard, improvement, achievement
3. **Teamwork/Collaboration** - Working together, cooperation
4. **Respect** - Following rules, politeness, listening
5. **Leadership** - Taking initiative, guiding others
6. **Creativity/Problem Solving** - Original thinking, innovation
7. **Responsibility** - Completing tasks, being reliable

### How Points Work
1. Teacher visits teacher-form.html (desktop) or teacher-mobile.html (phone)
2. Selects: House + Category + Submits
3. 1 point awarded to that house
4. Google Sheet updates automatically
5. Leaderboard updates within 30 seconds

### The Scoring Formula
**House Score = Total Points ÷ Number of Members**

This keeps it fair - a house with 200 students doesn't automatically beat one with 50 students. The house with the highest average wins.

---

## 🗂️ THE THREE MAIN COMPONENTS

### 1. GOOGLE SHEET (The Database)
**Location:** https://docs.google.com/spreadsheets/d/1rpiTKhNvHkA1suptamC4JSk_33YBLrW1qfLtiloVtL0/edit

**Main Tabs:**
- **Student Roster** - Who's in which house (First, Last, Email, House, Type, Timestamp)
- **Points Log** - Every point ever awarded (Timestamp, Teacher, Student="N/A", House, Category, Points)
- **House Totals** - Live calculations (House, Total Points, People Count, House Score, Rank)
  - **⚠️ MUST be published to web** for leaderboard to work
- **Weekly Winners** - Historical record (auto-updated every Thursday 23:59)
- **Admin Panel** - Instructions and guidelines for staff

**Optional Tabs (if monthly reset enabled):**
- **Settings** - Monthly reset toggle (TRUE/FALSE, Last Reset Date)
- **Season History** - Archived monthly results

**⚠️ Critical Rules:**
- Don't rename tabs - code looks for exact names
- Don't delete columns - formulas depend on positions
- House Totals tab MUST be published to web (File → Share → Publish to web → select "House Totals" tab)

**Key Formulas in House Totals (Row 2 example for Phoenix):**
- Total Points: `=SUMIF('Points Log'!D:D,A2,'Points Log'!F:F)`
- People Count: `=COUNTIF('Student Roster'!D:D,A2)`
- House Score: `=B2/C2` (Total ÷ People)
- Rank: `=RANK(D2,D:D,0)` (1=highest score)

---

### 2. GOOGLE APPS SCRIPT (The Backend/API)
**Location:** https://script.google.com/u/0/home/projects/1S-8pgLT4Q02NbT5M1nREJFHMtrkNyQbv1xpf_rCew92Vkcy7v5m3FQRY/edit

**Owner Account:** barryjshaw@gmail.com (personal Gmail, not school account)
- **Why personal?** School Google Workspace restricts Apps Script deployments
- **Collaborator Access:** house.points.vasteras@engelska.se has been shared access
  - If you need editing access and see "Access Denied", request access from HQ/admin
  - School account restrictions may block direct editing
  - The share invite has been sent - contact admin if blocked

**What Apps Script Does:**
- Receives form submissions from HTML pages
- Writes data to Sheet tabs
- Sends sorting certificate emails via Gmail
- Runs automated triggers (weekly winners, optional monthly reset)
- Provides API endpoints for reading data

**The Deployed Web App:**
- API URL: `https://script.google.com/macros/s/AKfycbyZkszKyoadMXT4fXahoNm3hqn6wj_pBscUjt0bt2gHOSnLaFyTJGEn9032liVRaqH3lQ/exec`
- This URL never changes (unless you create new deployment)
- All HTML pages call this URL to submit data

**Main Functions:**
- `doPost()` - Handles form submissions (sort, points, settings)
- `doGet()` - Provides data to pages (house totals, recent points, reset status)
- `logSorting()` - Adds student/staff to roster
- `sendCertificateEmail()` - Emails house assignment
- `logPoints()` - Records point awards
- `recordWeeklyWinner()` - Archives weekly results (Thursday 23:59)
- `checkMonthlyReset()` - Checks for monthly reset (if enabled, runs daily 23:59)

**When You Edit Apps Script:**
1. Click on the script file
2. Make changes
3. Save (Ctrl+S or File → Save)
4. Deploy → Manage Deployments
5. Click ✏️ edit icon next to active deployment
6. Version: **New Version** (important!)
7. Click Deploy
8. **Critical:** Must create new version and redeploy or changes won't take effect!

**Triggers (Automations):**
- View/manage: Click ⏰ Triggers icon (left sidebar)
- **Weekly trigger:** Runs `recordWeeklyWinner()` every Thursday 23:59
- **Monthly trigger:** Runs `checkMonthlyReset()` daily at 23:59 (only acts if reset enabled)
- If triggers break, run `setupWeeklyTrigger()` or `setupMonthlyResetTrigger()` manually

---

### 3. GITHUB PAGES (The Frontend/Website)
**Repository:** https://github.com/iesv-swe/iesv-house-points
**Organization:** iesv-swe (IESV school GitHub organization)

**What's Hosted:**
- All HTML pages (forms, leaderboards, house pages)
- Favicon files (.ico) - small icons in browser tabs
- House logos (.png) - phoenix.png, dragon.png, hydra.png, griffin.png
- Shield logos (.png) - phoenix2.png, dragon2.png, hydra2.png, griffin2.png
- PWA files (manifest.json, sw.js) - for mobile app installation

**How to Update Files:**
1. Go to https://github.com/iesv-swe/iesv-house-points
2. Click on the file you want to edit
3. Click pencil icon (✏️ Edit this file)
4. Make changes
5. Scroll down → Commit changes
6. Write a brief description (e.g., "Updated teacher form colors")
7. Click "Commit changes"
8. Wait 1-2 minutes for GitHub Pages to rebuild
9. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R) to see changes

**GitHub Pages URL:** https://iesv-swe.github.io/iesv-house-points/

**All Page URLs:**
- Sorting Ceremony: .../sorting-ceremony.html
- Teacher Form (Desktop): .../teacher-form.html
- Teacher Form (Mobile): .../teacher-mobile.html
- Leaderboard: .../leaderboard.html
- House Pages: .../house-page.html?house=phoenix (also dragon/hydra/griffin)
- Admin Bulk Entry: .../admin-bulk-entry.html (password: 135vasteras)
- Settings: .../settings.html (password: 135vasteras)
- Console: .../console.html (staff portal with links to everything)

---

## 🎮 THE PAGES EXPLAINED

### Public Pages (Anyone Can Access)

**1. Sorting Ceremony (sorting-ceremony.html)**
- Students/staff enter their school email (@engelska.se)
- Algorithm assigns them to a house (automatically balances numbers)
- Certificate email sent immediately with house assignment
- One-time only per person (duplicates blocked)
- Writes to: Student Roster tab

**2. Teacher Form - Desktop (teacher-form.html)**
- Teachers award points during class/hallway/events
- Button interface: Select house → Select category → Submit
- Always awards 1 point per submission
- No student names tracked (house-only system for privacy)
- Writes to: Points Log tab

**3. Teacher Form - Mobile (teacher-mobile.html)**
- Mobile-optimized with larger touch targets
- Can "install" as phone app (PWA)
- Remembers teacher name (localStorage)
- Install prompt shows on first visit
- Same functionality as desktop version

**4. Leaderboard (leaderboard.html)**
- Live rankings display (2x2 grid)
- Shows: Total Points, Rank (1st/2nd/3rd/4th), Rank badges (gold/silver/bronze)
- Auto-refreshes every 30 seconds
- Features: Animated confetti on 1st place, floating particles, creature animations
- Click any house card → goes to house page

**5. Individual House Pages (house-page.html?house=phoenix)**
- Dynamic page - one file serves all 4 houses
- Shows: Current rank, total points, category breakdown, recent 10 awards
- Accessed via leaderboard clicks or direct URL
- Uses URL parameter: ?house=phoenix (or dragon/hydra/griffin)
- Features: Animated creature logo, house-specific colors

### Admin Pages (Password Protected)

**6. Admin Bulk Entry (admin-bulk-entry.html)**
- Password: **135vasteras**
- Award 1-100 points at once
- Use for: Special events, house competitions, assemblies
- Requires justification text (logged with points)
- Example: "Won house sports day" + 50 points to Dragon
- Writes to: Points Log tab with [ADMIN] prefix

**7. System Settings (settings.html)**
- Password: **135vasteras**
- Toggle monthly reset ON/OFF
- Shows countdown to end of month (if enabled)
- Controls monthly season reset system
- See "Monthly Reset System" section below

**8. Console (console.html)**
- Staff portal - central hub for all links
- Sections: Public Pages, House Pages, Admin Pages, Backend Resources, House Logos
- No password needed - but not linked publicly (bookmark it)
- Quick reference for: Sheet, Apps Script, GitHub repo, all page URLs

---

## 🔄 AUTOMATED SYSTEMS

### Weekly Winners (Always Active)
**When:** Every Thursday at 23:59
**What:** Archives current week's results
**How:** Apps Script trigger runs `recordWeeklyWinner()`
**Where:** Saves to "Weekly Winners" tab
**Records:** Week dates, 1st-4th place houses with scores

**If it breaks:**
1. Check Apps Script → Triggers (⏰ icon)
2. Look for errors in Executions log
3. Manually run `setupWeeklyTrigger()` to recreate

### Monthly Reset System (Optional, OFF by Default)
**Status:** Currently DISABLED (safe default)
**Purpose:** Reset points to zero on 1st of each month for "fresh start"
**Control:** Via settings.html (password: 135vasteras)

**How it Works:**
1. Daily trigger runs at 23:59
2. Checks Settings tab: Is "Reset Enabled" = TRUE?
3. If NO: Does nothing
4. If YES + tomorrow is 1st of month: Archives season + resets points

**Enabling Monthly Reset:**
1. Go to settings.html
2. Enter password: 135vasteras
3. Toggle switch to ON
4. Confirm prompt
5. System will reset on last day of next month

**What Happens During Reset:**
1. Current standings archived to "Season History" tab
2. All entries in "Points Log" cleared (except headers)
3. House Totals reset to 0
4. New season starts on 1st with clean slate

**Disabling Monthly Reset:**
1. Go to settings.html
2. Toggle switch to OFF
3. Points continue accumulating indefinitely

**⚠️ Important:** Even when disabled, the daily trigger still runs - it just checks Settings tab and does nothing. Completely harmless.

---

## 🛠️ COMMON MAINTENANCE TASKS

### Task 1: Add New Student/Staff to a House
**Easiest:** Have them visit sorting-ceremony.html with their email
**Manual (if needed):**
1. Open Google Sheet → Student Roster tab
2. Add row: First Name | Last Name | Email | House | Type | Timestamp
3. Type = "Student" or "Staff"
4. House = Phoenix, Dragon, Hydra, or Griffin

### Task 2: Manually Award Points
**Option A:** Use teacher-form.html or teacher-mobile.html
**Option B:** Use admin-bulk-entry.html (for larger amounts)
**Option C:** Directly in Sheet (not recommended, breaks timestamp format)
1. Open Google Sheet → Points Log tab
2. Add row: Timestamp | Teacher | N/A | House | Category | Points
3. Timestamp format: ISO 8601 (e.g., 2024-12-06T14:30:00Z)

### Task 3: Manually Award Bulk Points
1. Go to admin-bulk-entry.html
2. Password: 135vasteras
3. Select house, enter points (1-100), category, justification
4. Submit

### Task 4: Change a Student's House
1. Open Google Sheet → Student Roster tab
2. Find student's row
3. Change house column (D) to: Phoenix, Dragon, Hydra, or Griffin
4. Save

### Task 5: View Weekly History
1. Open Google Sheet → Weekly Winners tab
2. Each row = one week's results
3. Columns: Week Start | Week End | 1st Place | 1st Score | 2nd-4th Places

### Task 6: View Season History (if monthly reset used)
1. Open Google Sheet → Season History tab
2. Each row = one month's archived results
3. Columns: Season # | Start Date | End Date | 1st-4th Places with Scores

### Task 7: Update Page Content (Colors, Text, Layout)
1. Go to GitHub: https://github.com/iesv-swe/iesv-house-points
2. Find the HTML file (e.g., teacher-form.html)
3. Click Edit (✏️ pencil icon)
4. Make changes to HTML/CSS/JavaScript
5. Commit changes
6. Wait 1-2 minutes
7. Hard refresh browser (Ctrl+Shift+R)

### Task 8: Update Apps Script Logic
1. Open Apps Script: https://script.google.com/u/0/home/projects/...
2. Edit code
3. Save (Ctrl+S)
4. Deploy → Manage Deployments → Edit → New Version → Deploy
5. Test the change

### Task 9: Fix Broken Leaderboard
**Symptom:** Leaderboard shows "Loading data..." forever
**Causes & Fixes:**
1. House Totals not published:
   - Open Sheet → File → Share → Publish to web
   - Select "House Totals" tab → Publish
2. Tab renamed:
   - Check tab name is exactly "House Totals" (no emojis, no extra spaces)
3. CSV URL changed:
   - Check leaderboard.html has correct SHEET_ID
4. Browser cache:
   - Hard refresh (Ctrl+Shift+R)

### Task 10: Re-enable Weekly Winners Trigger
**If weekly recording stops working:**
1. Open Apps Script
2. Click ⏰ Triggers (left sidebar)
3. Check if trigger exists for `recordWeeklyWinner`
4. If missing: Click + Add Trigger
   - Function: recordWeeklyWinner
   - Event: Time-driven, Week timer, Thursday, 23:00-24:00
5. Or run `setupWeeklyTrigger()` function manually

---

## 🔐 PASSWORDS & ACCESS

**Admin Passwords:**
- Admin Bulk Entry: **135vasteras**
- System Settings: **135vasteras**

**Account Access:**
- Google Sheet Owner: barryjshaw@gmail.com
- Apps Script Owner: barryjshaw@gmail.com (personal Gmail)
- Apps Script Collaborator: house.points.vasteras@engelska.se
  - If access denied, request from HQ/admin (school restrictions)
- GitHub Repo: iesv-swe organization
- GitHub Pages: Auto-updates from repo

**Security Notes:**
- Admin pages (bulk entry, settings) not linked publicly
- Only people with URL + password can access
- Teacher forms validate @engelska.se email domain
- Blocks .student.vasteras@engelska.se from teacher form (staff only)

---

## 🚨 TROUBLESHOOTING

### Problem: Sorting ceremony not sending emails
**Check:**
1. Apps Script → Executions log - any errors?
2. Gmail quota not exceeded? (500 emails/day limit)
3. Email in spam folder?
4. Apps Script has Gmail permissions?

**Fix:**
1. Open Apps Script
2. Run `sendCertificateEmail('test@engelska.se', 'Phoenix')` manually
3. Grant permissions if prompted
4. Check if test email arrives

### Problem: Points not recording
**Check:**
1. Apps Script → Executions log - any errors?
2. Points Log tab exists and spelled correctly?
3. Browser console (F12) - any errors?

**Fix:**
1. Test submission manually
2. Check Apps Script is deployed (not just saved)
3. Check APPS_SCRIPT_URL in HTML files matches deployed URL

### Problem: House Totals showing wrong numbers
**Check:**
1. Formulas in House Totals cells
2. Are tab names exact? ("Points Log", "Student Roster")
3. Any manual edits breaking formulas?

**Fix:**
1. Check formula in cell B2: `=SUMIF('Points Log'!D:D,A2,'Points Log'!F:F)`
2. Check formula in cell C2: `=COUNTIF('Student Roster'!D:D,A2)`
3. Copy formulas down to other houses if needed

### Problem: Leaderboard not updating
**Causes:**
1. House Totals not published to web
2. Browser cache showing old version
3. GitHub Pages hasn't rebuilt yet

**Fixes:**
1. Publish House Totals tab to web
2. Hard refresh (Ctrl+Shift+R)
3. Wait 2 minutes after GitHub commit

### Problem: Monthly reset not working
**Check:**
1. Settings tab exists?
2. Settings → B1 cell = TRUE?
3. Apps Script trigger exists for `checkMonthlyReset`?
4. Apps Script → Executions log - any errors?

**Fix:**
1. Go to settings.html, toggle OFF then ON
2. Check Apps Script → Triggers → checkMonthlyReset exists
3. Run `setupMonthlyResetTrigger()` manually if missing

### Problem: GitHub Pages not showing changes
**Cause:** GitHub Pages caching or rebuild delay

**Fix:**
1. Wait 2-3 minutes after commit
2. Hard refresh browser (Ctrl+Shift+R)
3. Check GitHub → Actions tab - build succeeded?
4. Try incognito/private window

### Problem: Can't edit Apps Script (Access Denied)
**Cause:** School Google Workspace restrictions

**Fix:**
1. Contact school IT admin/HQ
2. Request access for: house.points.vasteras@engelska.se
3. Explain it's for maintaining school house points system
4. May need admin approval to bypass workspace restrictions

---

## 📊 MONITORING & ANALYTICS

### What to Monitor Weekly
1. **Points Log tab** - Are points being awarded regularly?
2. **House Totals** - Are all 4 houses close in numbers? (scoring system ensures fairness)
3. **Weekly Winners tab** - Did Thursday's automation run?
4. **Apps Script Executions** - Any errors?

### What to Monitor Monthly (if reset enabled)
1. **Season History tab** - Did last month archive correctly?
2. **Points Log** - Did it clear on 1st of month?
3. **Settings tab** - Reset date updated?

### Red Flags
- ❌ House Totals showing #REF! or #ERROR! - formula broken
- ❌ Points Log empty for multiple days - teachers not using system
- ❌ One house has 2x members of others - sorting algorithm issue
- ❌ Apps Script executions showing repeated failures - needs investigation

### Health Check (Run Monthly)
1. Submit test point via teacher-form.html
2. Check it appears in Points Log within 10 seconds
3. Check House Totals updates within 30 seconds
4. Check Leaderboard reflects change within 30 seconds
5. Check Weekly Winners has recent entries
6. Check Apps Script execution log - no persistent errors

---

## 🎓 UNDERSTANDING THE CODE

### Key Concepts

**Apps Script = Backend**
- Written in JavaScript
- Runs on Google's servers
- Has access to Sheet, Gmail, Calendar, etc.
- Responds to HTTP requests from HTML pages

**HTML Pages = Frontend**
- Pure HTML + CSS + JavaScript
- Runs in user's browser
- Makes fetch() requests to Apps Script API
- Displays data, captures form input

**Google Sheet = Database**
- Stores all data
- Formulas calculate totals/scores/ranks
- Apps Script reads/writes to tabs

**GitHub Pages = Web Hosting**
- Hosts HTML/CSS/JS files
- Free, fast, reliable
- Auto-deploys when you commit to repo

### File Structure in GitHub
```
iesv-house-points/
├── sorting-ceremony.html       (Sorting form)
├── teacher-form.html           (Desktop teacher form)
├── teacher-mobile.html         (Mobile teacher form - PWA)
├── leaderboard.html            (Live rankings display)
├── house-page.html             (Dynamic house pages)
├── admin-bulk-entry.html       (Bulk points - password protected)
├── settings.html               (Monthly reset toggle - password protected)
├── console.html                (Staff portal)
├── manifest.json               (PWA app configuration)
├── sw.js                       (Service worker - offline capability)
├── sorting-favicon.ico         (Browser tab icon)
├── teacher-favicon.ico
├── leaderboard-favicon.ico
├── admin-favicon.ico
├── console-favicon.ico
├── phoenix.png                 (Original house logos)
├── dragon.png
├── hydra.png
├── griffin.png
├── phoenix2.png                (New shield logos)
├── dragon2.png
├── hydra2.png
└── griffin2.png
```

### Apps Script Functions (What Each Does)
- `doPost()` - Entry point for form submissions
- `doGet()` - Entry point for data requests
- `logSorting()` - Adds student to roster
- `sendCertificateEmail()` - Sends house assignment email
- `logPoints()` - Records point award
- `getHouseTotalsJson()` - Returns current standings as JSON
- `getRecentPointsJson()` - Returns recent point awards
- `recordWeeklyWinner()` - Archives weekly results
- `setupWeeklyTrigger()` - Creates Thursday automation
- `getResetStatus()` - Checks if monthly reset enabled
- `setResetStatus()` - Enables/disables monthly reset
- `archiveCurrentSeason()` - Saves current month to history
- `resetAllPoints()` - Clears Points Log (archives first)
- `checkMonthlyReset()` - Daily check if reset needed
- `setupMonthlyResetTrigger()` - Creates daily reset automation

---

## 📞 GETTING HELP

### Internal Resources
1. **Console Page:** console.html - Links to everything
2. **Google Sheet:** Check formulas, data structure
3. **Apps Script Execution Log:** See what ran and any errors
4. **GitHub Commit History:** See what changed and when

### External Resources
1. **Apps Script Documentation:** https://developers.google.com/apps-script
2. **GitHub Pages Docs:** https://docs.github.com/pages
3. **Google Sheets Functions:** https://support.google.com/docs/table/25273

### If You're Stuck
1. Check Apps Script execution log first (most issues show here)
2. Check browser console (F12) for frontend errors
3. Test individual components (submit form, check if data appears in Sheet)
4. Check if recent GitHub commits broke something (revert if needed)
5. Contact: house.points.vasteras@engelska.se if shared access

---

## ✅ QUICK REFERENCE

### Most Common URLs (Bookmark These)
- **Console:** https://iesv-swe.github.io/iesv-house-points/console.html
- **Leaderboard:** https://iesv-swe.github.io/iesv-house-points/leaderboard.html
- **Google Sheet:** https://docs.google.com/spreadsheets/d/1rpiTKhNvHkA1suptamC4JSk_33YBLrW1qfLtiloVtL0/edit
- **Apps Script:** https://script.google.com/u/0/home/projects/1S-8pgLT4Q02NbT5M1nREJFHMtrkNyQbv1xpf_rCew92Vkcy7v5m3FQRY/edit
- **GitHub Repo:** https://github.com/iesv-swe/iesv-house-points

### Critical Info
- **Sheet ID:** 1rpiTKhNvHkA1suptamC4JSk_33YBLrW1qfLtiloVtL0
- **API URL:** https://script.google.com/macros/s/AKfycbyZkszKyoadMXT4fXahoNm3hqn6wj_pBscUjt0bt2gHOSnLaFyTJGEn9032liVRaqH3lQ/exec
- **Admin Password:** 135vasteras
- **Owner Email:** barryjshaw@gmail.com
- **Collaborator Email:** house.points.vasteras@engelska.se

### Quick Actions
- **Award Points:** teacher-form.html or teacher-mobile.html
- **Award Bulk:** admin-bulk-entry.html (password: 135vasteras)
- **View Rankings:** leaderboard.html
- **Check History:** Google Sheet → Weekly Winners tab
- **Toggle Reset:** settings.html (password: 135vasteras)
- **Update Pages:** GitHub → Edit file → Commit
- **Update Logic:** Apps Script → Edit → Save → Redeploy

### 4 Houses Quick Ref
- Phoenix 🔥 (Red #ff4444)
- Dragon 🐉 (Green #44aa44)
- Hydra 🌊 (Blue #4488ff)
- Griffin 🦅 (Orange #ffaa00)

### 7 Categories Quick Ref
1. Kindness/Helping Others
2. Academic Effort/Excellence
3. Teamwork/Collaboration
4. Respect
5. Leadership
6. Creativity/Problem Solving
7. Responsibility

---

## 🎉 YOU'RE READY!

You now know:
- ✅ What the system is and how it works
- ✅ Where everything is located
- ✅ How to access and edit components
- ✅ How to perform common maintenance tasks
- ✅ How to troubleshoot issues
- ✅ Where to find help

**The system is robust and largely self-maintaining.** Weekly automation runs without intervention. Monthly reset is optional and OFF by default.

Most of your time will be spent:
1. Monitoring that it's working (5 min/week)
2. Helping teachers who forget how to use it
3. Occasionally updating content/colors
4. Celebrating house winners!

**Good luck! 🏆**

---

**Document Version:** 1.0  
**Last Updated:** December 6, 2024  
**System Status:** V2 Operational - All features active
