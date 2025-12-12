# Canvas System Setup Guide

## 🎨 Overview

The Canvas System is a r/Place-style pixel war where students can claim territory for their house by placing colored pixels on a shared 100x100 grid. Students must spend house points to participate, creating an engaging competition.

---

## 📋 Features

### Core Features
- **100x100 pixel grid** (configurable)
- **House-colored pixels**: Phoenix (red), Dragon (green), Hydra (blue), Griffin (orange), Staff (black)
- **Point-based system**: Students spend 1 house point per pixel (configurable)
- **Cooldown system**: 1 pixel per hour per student (configurable)
- **No overwrites by default**: First claim wins (configurable)
- **Campaign system**: Set start/end dates with optional countdown timer

### Must-Have Engagement Features
✅ **Live Territory Stats** - Real-time percentage control per house
✅ **Pixel Leaderboard** - Top 10 students (password protected)
✅ **House Leaderboard** - Total pixels placed per house
✅ **Recent Activity Feed** - Anonymous house activity display

### Anti-Cheat Protection
✅ Server-side cooldown validation
✅ Server-side point balance checking
✅ Activity logging (who, when, where, color)
✅ Session tracking
✅ Rate limiting
✅ Color validation (students can only use their house color)

### Admin Controls
- **Wipe Canvas**: Clear grid and save winner to history
- **Extend Campaign**: Adjust end date
- **Settings Management**: Toggle features, adjust cooldowns, etc.

---

## 🚀 Initial Setup

### Step 1: Initialize Canvas Sheets

1. Open your Google Sheet (the one with your `SHEET_ID`)
2. Go to **Extensions > Apps Script**
3. Find and run the following functions:
   - `initializeCanvasSheets()` - Creates canvas sheets
   - `initializeCanvasVerification()` - Creates verification sheet
4. Click **Run** for each function (you may need to authorize permissions)

This will create the following sheets:

| Sheet Name | Purpose |
|------------|---------|
| **Canvas State** | Stores current pixel placements |
| **Canvas Settings** | Configuration options |
| **Canvas Activity Log** | Audit trail of all placements |
| **Canvas History** | Winners from past campaigns |
| **Canvas Verification** | Email verification codes for anti-cheating |

### Step 2: Configure Default Settings

The system initializes with these defaults (customize in Canvas Settings sheet):

| Setting | Default Value | Description |
|---------|---------------|-------------|
| `canvasWidth` | 100 | Grid width in pixels (max 50, recommended ≤30) |
| `canvasHeight` | 100 | Grid height in pixels (max 50, recommended ≤30) |
| `pixelSize` | 8 | Visual size of each pixel (CSS pixels) |
| `cooldownMinutes` | 60 | Minutes between placements (1 hour) |
| `pointCostPerPixel` | 1 | House points required per pixel |
| `winnerPoints` | 0 | Points awarded to winning house (0 = no award) |
| `campaignStartDate` | Now | When canvas becomes active |
| `campaignEndDate` | Now + 7 days | When canvas closes |
| `canvasActive` | TRUE | Master on/off switch |
| `allowOverwrite` | FALSE | Can pixels be overwritten? |
| `allowBlackOverwrite` | FALSE | Can staff pixels be overwritten? |
| `showCountdown` | TRUE | Display countdown timer |
| `happyHourActive` | FALSE | Special event mode |
| `happyHourPixelsAllowed` | 5 | Pixels during happy hour |
| `leaderboardPassword` | canvas2025 | Password for leaderboard |
| `adminPassword` | admin2025 | Password for admin panel |

⚠️ **IMPORTANT**: Change the default passwords immediately!

### Canvas Size Recommendations

- **20x20 or smaller**: Excellent performance, works perfectly
- **25x25 to 30x30**: Good performance, recommended maximum
- **31x31 to 50x50**: May experience slower load times, use with caution
- **Above 50x50**: Not supported due to performance constraints

### Manual Sheet Editing

You can directly edit the Canvas Settings sheet to change configuration:

1. Open your Google Sheet
2. Go to the "Canvas Settings" tab
3. Find the setting you want to change (column A)
4. Edit the value (column B)
5. The system will automatically pick up changes on next page load

**Note**: When changing `canvasWidth` or `canvasHeight`, the system will automatically regenerate the `mondrianLayout` to match the new dimensions. This happens on the next API call that loads settings.

### Step 3: Deploy as Web App

1. In Apps Script, click **Deploy > New deployment**
2. Choose **Web app**
3. Settings:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy the **Web app URL** (you'll need this)

### Step 4: Update Frontend URLs

In all HTML files (`canvas.html`, `canvas-leaderboard.html`, `canvas-admin.html`), update the `API_URL`:

```javascript
const API_URL = "YOUR_WEB_APP_URL_HERE";
```

Replace `YOUR_WEB_APP_URL_HERE` with the URL from Step 3.

---

## 🎮 How It Works

### For Students

1. **Earn Points**: Students must first earn house points through the main system
2. **Join Canvas**: Navigate to `canvas.html` and enter their school email
3. **Verify Email**: Enter the 2-digit verification code sent to their email
4. **Check Status**: View their available points, cooldown timer, and house color
5. **Place Pixel**: Click any empty spot on the grid (costs 1 point)
6. **Wait Cooldown**: Must wait 60 minutes before placing another pixel
7. **View Stats**: See live territory percentages and recent activity

### Email Verification System

**Why Verification?**
- Prevents students from using other students' emails to cheat
- Ensures only the email owner can spend their points
- Simple 2-digit code sent via email

**How It Works**:
1. Student enters their @engelska.se email address
2. System generates random 2-digit code (10-99)
3. Code is sent via email to the student
4. Student enters code within 5 minutes
5. Up to 3 attempts allowed per code
6. Verification valid for 24 hours
7. New code can be requested after 1 minute cooldown

**Security Features**:
- Only @engelska.se email addresses allowed
- Codes expire after 5 minutes
- Maximum 3 verification attempts per code
- 1 minute cooldown between code requests
- Verification logged for audit trail

### Point System

**How Points Work**:
- Students earn points through the main House Points system
- Points Log shows all earned points
- Canvas Activity Log tracks spent points
- **Balance = Earned - Spent**

Example:
- Student earns 5 points from teachers
- Student places 2 pixels on canvas (-2 points)
- **Balance: 3 points remaining**

### Cooldown System

**Rules**:
- Each student can place **1 pixel per hour**
- Cooldown is **server-validated** (cannot be bypassed)
- Timer displayed in student status panel
- No daily limit (as long as they have points and respect cooldown)

### No Overwrites (Default)

**Default Behavior**:
- Once a pixel is placed, it's **permanent**
- Other students cannot claim that spot
- First house to claim wins
- Creates strategic gameplay

**Staff Exception**:
- Staff pixels (black) can be configured to be overwriteable or not via `allowBlackOverwrite`

---

## 🏆 Winning & Campaign End

### How to Win

The house with the **most pixels placed** when the campaign ends wins.

**Example Final Stats**:
- Phoenix: 28% (2,800 pixels) ← **WINNER**
- Dragon: 26% (2,600 pixels)
- Hydra: 24% (2,400 pixels)
- Griffin: 22% (2,200 pixels)

### Campaign End

When the campaign end date is reached:
1. Canvas becomes read-only
2. No more pixels can be placed
3. Admin can view final stats
4. Admin clicks "Wipe Canvas" to save winner to history

### Wipe Canvas (Admin)

**What happens**:
1. Calculates final territory percentages
2. Determines winning house
3. Saves results to **Canvas History** sheet
4. Clears all pixels from canvas
5. Ready for next campaign

---

## 🔒 Security & Anti-Cheat

### Built-in Protections

1. **Email Verification (NEW!)**
   - 2-digit verification code sent to email
   - Prevents students from using others' emails
   - Codes expire after 5 minutes
   - Maximum 3 attempts per code
   - 1 minute cooldown between requests
   - Verification valid for 24 hours

2. **Server-Side Validation**
   - All rules enforced on server
   - Client cannot fake point balances
   - Client cannot bypass cooldown
   - Client cannot fake timestamps

3. **Color Restrictions**
   - Students can ONLY place their house color
   - Server validates house membership
   - Staff can only place black pixels

4. **Point Verification**
   - Server checks Points Log for earned points
   - Server checks Canvas Activity Log for spent points
   - Balance calculated server-side

5. **Cooldown Enforcement**
   - Timestamps stored server-side
   - Server calculates time since last placement
   - Rejects placements within cooldown window

6. **Activity Logging**
   - Every placement logged with:
     - Timestamp, Email, Name, House, Coordinates, Color, Points Spent, Session ID
   - Full audit trail for investigation

7. **Session Tracking**
   - Unique session ID per student
   - Helps detect multi-tab abuse
   - Logged in activity log

### What Students CANNOT Do

❌ Place pixels without points
❌ Bypass cooldown timer
❌ Use other houses' colors
❌ Overwrite existing pixels (unless enabled)
❌ Fake point balances
❌ Manipulate server-side settings
❌ Use someone else's email without verification code

### What Students CAN Do

✅ View the canvas (anyone)
✅ See live stats (anyone)
✅ Place pixels (if they have points and no cooldown)
✅ Check their own status

---

## ⚙️ Settings Reference

### Campaign Control

**canvasActive** (TRUE/FALSE)
- Master on/off switch
- When FALSE, no pixels can be placed
- Canvas remains visible

**campaignStartDate** (Date)
- When canvas opens for placements
- Before this date, students cannot place pixels

**campaignEndDate** (Date)
- When canvas closes
- After this date, students cannot place pixels
- Use admin panel to extend if needed

**showCountdown** (TRUE/FALSE)
- Display countdown timer on canvas page
- Shows time remaining until campaign ends

### Pixel Rules

**allowOverwrite** (TRUE/FALSE)
- FALSE: Pixels are permanent (default)
- TRUE: Pixels can be overwritten by any house

**allowBlackOverwrite** (TRUE/FALSE)
- FALSE: Staff pixels cannot be overwritten (default)
- TRUE: Staff pixels can be overwritten

### Gameplay Settings

**cooldownMinutes** (Number)
- Minutes between pixel placements
- Default: 60 (1 hour)
- Range: 1-1440 (1 minute to 24 hours)

**pointCostPerPixel** (Number)
- House points required per pixel
- Default: 1
- Range: 1-10

### Canvas Size

**canvasWidth** (Number)
- Grid width in pixels
- Default: 100

**canvasHeight** (Number)
- Grid height in pixels
- Default: 100

**pixelSize** (Number)
- Visual size of each pixel in CSS pixels
- Default: 8
- Smaller = more compact, larger = easier to click

### Security

**leaderboardPassword** (String)
- Password to view leaderboards
- Default: canvas2025
- ⚠️ **Change this immediately!**

**adminPassword** (String)
- Password for admin panel
- Default: admin2025
- ⚠️ **Change this immediately!**

### Special Events (Future)

**happyHourActive** (TRUE/FALSE)
- Enable special event mode
- Not fully implemented yet

**happyHourPixelsAllowed** (Number)
- Pixels allowed during happy hour
- Not fully implemented yet

---

## 📊 Leaderboards (Password Protected)

### Accessing Leaderboards

1. Navigate to `canvas-leaderboard.html`
2. Enter the **leaderboard password** (default: `canvas2025`)
3. View rankings

### What's Shown

**House Leaderboard**:
- Rank, House Name, Total Pixels Placed
- Sorted by most pixels

**Student Leaderboard** (Top 10):
- Rank, Student Name, House, Pixels Placed
- Sorted by most pixels
- Shows top 10 contributors

### Privacy

- Leaderboards are PASSWORD PROTECTED
- Students cannot access without password
- Share password only with staff/appropriate students
- Activity feed on main canvas shows HOUSE names only, not student names

---

## 🔧 Admin Panel

### Accessing Admin Panel

Navigate to `canvas-admin.html`

### Admin Functions

#### 1. Wipe Canvas

**Purpose**: End campaign and clear canvas

**Steps**:
1. Enter admin password
2. Click "Wipe Canvas & Save Winner"
3. Confirm the warning dialog

**What Happens**:
- Calculates final stats
- Determines winning house
- Saves to Canvas History sheet
- Clears all pixels
- Canvas ready for next campaign

⚠️ **This action cannot be undone!**

#### 2. Extend Campaign

**Purpose**: Push back the end date

**Steps**:
1. Select new end date/time
2. Enter admin password
3. Click "Extend Campaign"

**Use Cases**:
- Students request more time
- Campaign going well and you want to extend
- Technical issues required pause

#### 3. Update Settings

**Purpose**: Change canvas rules mid-campaign

**Available Settings**:
- Toggle canvas active/inactive
- Enable/disable overwrites
- Enable/disable black pixel overwrites
- Toggle countdown display
- Adjust cooldown duration
- Change point cost

**Steps**:
1. Adjust toggles/values
2. Enter admin password
3. Click "Update Settings"

⚠️ **Note**: Changes take effect immediately

---

## 🎯 Recommended Campaigns

### Campaign 1: The Territory Rush (7 days)
- **Duration**: 7 days
- **Cooldown**: 60 minutes
- **Overwrite**: FALSE
- **Strategy**: First-come, first-served. Strategic claiming!

### Campaign 2: The Turf War (3 days)
- **Duration**: 3 days (weekend)
- **Cooldown**: 30 minutes
- **Overwrite**: TRUE
- **Strategy**: Battle for dominance, pixels can be reclaimed!

### Campaign 3: The Marathon (14 days)
- **Duration**: 14 days (2 weeks)
- **Cooldown**: 120 minutes (2 hours)
- **Overwrite**: FALSE
- **Strategy**: Long-term commitment, steady progress

### Campaign 4: Speed Round (24 hours)
- **Duration**: 1 day
- **Cooldown**: 15 minutes
- **Overwrite**: TRUE
- **Strategy**: Fast-paced, constant action

---

## 🐛 Troubleshooting

### Email Verification Issues

**Problem**: Verification email not received

**Solutions**:
1. Check spam/junk folder
2. Verify email address is correct (@engelska.se)
3. Wait 1-2 minutes for email to arrive
4. Click "Resend Code" if email doesn't arrive
5. Check Google Apps Script execution log for errors
6. Verify MailApp permissions are granted in Apps Script

**Problem**: Verification code expired

**Solutions**:
1. Click "Resend Code" to get a new code
2. Enter code within 5 minutes of receiving email
3. Check email timestamp to ensure code is still valid

**Problem**: "Invalid verification code" error

**Solutions**:
1. Double-check the code from your email
2. Ensure you're entering exactly 2 digits (10-99)
3. Request a new code if you've used all 3 attempts
4. Check Canvas Verification sheet for active codes

**Problem**: "Please wait X seconds" when requesting code

**Solutions**:
1. Wait for the 1-minute cooldown to expire
2. This prevents spam and abuse
3. Use the "Resend Code" button instead of refreshing the page

### Canvas Won't Load

**Problem**: Students see loading spinner forever

**Solutions**:
1. Check that `initializeCanvasSheets()` and `initializeCanvasVerification()` were run
2. Verify Web App is deployed
3. Check API_URL is correct in HTML files
4. Open browser console (F12) for error messages

### Students Can't Place Pixels

**Problem**: "You need at least 1 house point" error

**Check**:
1. Student has earned points (check Points Log sheet)
2. Student hasn't spent all points (check Canvas Activity Log)
3. Calculate balance: Earned - Spent

**Problem**: "Please wait X minutes" error

**Check**:
1. Student placed a pixel recently
2. Check Canvas Activity Log for last placement time
3. Cooldown is server-enforced, no bypass

**Problem**: "This pixel has already been claimed"

**Check**:
1. `allowOverwrite` setting in Canvas Settings
2. If FALSE, pixels are permanent
3. Try a different spot

### Wrong House Color

**Problem**: Student placing wrong color

**Solutions**:
1. Check Student Roster sheet - verify house assignment
2. Refresh student status
3. Student may be staff (black pixels)

### Canvas Size Errors

**Problem**: Getting errors when trying to set canvas larger than 25x25

**Cause**: The mondrianLayout generation can be slow for larger grids, causing timeouts or memory issues.

**Solutions**:
1. **Best option**: Keep canvas at 30x30 or smaller for reliable performance
2. Manually edit Canvas Settings sheet:
   - Set `canvasWidth` to desired value (max 50)
   - Set `canvasHeight` to desired value (max 50)
   - Delete the `mondrianLayout` row (system will regenerate it)
   - Wait 10-15 seconds after saving, then refresh the canvas page
3. If regeneration fails, manually set smaller dimensions (20x20 or 25x25)
4. Consider using a simple square grid pattern instead of artistic blocks

**Note**: Grid sizes above 30x30 may cause slower load times and higher server processing. 25x25 (625 blocks) is a good balance between size and performance.

### Admin Password Not Working

**Problem**: Admin panel rejects password

**Solutions**:
1. Check Canvas Settings sheet for `adminPassword` value
2. Ensure no extra spaces in password
3. Password is case-sensitive

---

## 📈 Monitoring & Analytics

### Canvas State Sheet

**Columns**:
- Row, Col, Color, PlacedBy, PlacedAt, House, StudentName

**Use**:
- See current canvas state
- Export for analysis
- Manual review if needed

### Canvas Activity Log

**Columns**:
- Timestamp, Email, Name, House, Row, Col, Color, PointsSpent, SessionId

**Use**:
- Full audit trail
- Detect cheating attempts
- Analyze student engagement
- Calculate individual participation

### Canvas History

**Columns**:
- CampaignEndDate, WinningHouse, WinningPercentage, TotalPixels, Phoenix%, Dragon%, Hydra%, Griffin%, Staff%

**Use**:
- Track winners over time
- Compare campaigns
- Historical data

---

## 🎓 Best Practices

### Before Launch

1. ✅ Change default passwords
2. ✅ Set appropriate campaign dates
3. ✅ Test with staff accounts
4. ✅ Announce to students
5. ✅ Explain rules clearly

### During Campaign

1. 📊 Monitor activity regularly
2. 📢 Share live stats with students
3. 🔍 Watch for unusual patterns
4. 💬 Engage students with updates

### After Campaign

1. 📈 Announce winner
2. 🏆 Recognize top contributors (if desired)
3. 🗑️ Wipe canvas and save history
4. 📝 Plan next campaign based on feedback

---

## 🔗 File Reference

| File | Purpose |
|------|---------|
| `pages/canvas.html` | Main canvas interface for students |
| `pages/canvas-leaderboard.html` | Password-protected leaderboards |
| `pages/canvas-admin.html` | Admin control panel |
| `COMPLETE_APPS_SCRIPT_FIXED.js` | Backend functions (lines 843-1577) |

---

## 💡 Tips & Tricks

### Encourage Participation

- **Announce progress**: Share daily stats
- **Celebrate milestones**: "1000 pixels placed!"
- **Strategic hints**: "Hydra is making a comeback!"
- **Photo opportunities**: Screenshot cool artwork

### Manage Point Economy

- **Balance point costs**: If too expensive, students won't participate
- **Reward participation**: Award extra points for specific achievements
- **Monitor balances**: Ensure enough students have points to play

### Create Storylines

- **House alliances**: Temporarily team up against leaders
- **Comeback narratives**: "Can Phoenix reclaim the lead?"
- **Final push**: "24 hours remaining, who will win?"

---

## ❓ FAQ

**Q: Can students place multiple pixels at once?**
A: No, cooldown enforced server-side. 1 pixel per hour.

**Q: What if a student runs out of points?**
A: They can still view the canvas but must earn more points to play.

**Q: Can I change settings mid-campaign?**
A: Yes, use admin panel. Changes take effect immediately.

**Q: How do I start a new campaign?**
A: Wipe canvas via admin panel, adjust dates in Canvas Settings.

**Q: Can staff participate?**
A: Yes, they place black pixels (if they have points).

**Q: What if two students click the same pixel simultaneously?**
A: Server processes requests sequentially. First request wins.

**Q: Can I make the canvas bigger?**
A: Yes, adjust `canvasWidth` and `canvasHeight` in Canvas Settings. Recommended maximum is 30x30. Above that, you may experience performance issues. The system automatically regenerates the grid layout when you change dimensions.

**Q: What is mondrianLayout and can I disable it?**
A: `mondrianLayout` creates the artistic block-based grid layout. The system automatically generates and updates it when canvas dimensions change. It's integral to how the canvas works - each "block" corresponds to a grid position that students claim. If you're having issues with larger grids (25x25+), try reducing the canvas size to 20x20 or 25x25.

**Q: How do I manually change canvas size?**
A: 
1. Open the Canvas Settings sheet in Google Sheets
2. Change the `canvasWidth` and `canvasHeight` values
3. The system will auto-regenerate the layout on next load
4. Alternatively, use the "Start New Campaign" button in the admin panel

**Q: What happens to the winning house?**
A: At campaign end, the house with the most territory wins. You can award house points to the winner by setting `winnerPoints` in Canvas Settings or the admin panel (e.g., 100 points). Set to 0 for no point award.

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check browser console (F12) for errors
2. Verify all sheets are initialized
3. Test with a staff account first
4. Review Canvas Activity Log for clues

---

## 🚀 Future Enhancements (Ideas)

- [ ] Happy Hour events (reduced cooldown)
- [ ] Protected pixels (can't be overwritten for X minutes)
- [ ] Pixel history (click to see who placed it)
- [ ] Canvas export as PNG image
- [ ] Time-lapse GIF generation
- [ ] Alliance system
- [ ] Themed templates to guide artwork
- [ ] Mobile-optimized interface

---

**Good luck with your Canvas War! May the best house win! 🎨🏆**
