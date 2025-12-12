# Testing Guide - Canvas War Staff Fix & Updates

## Overview
This guide provides step-by-step instructions to test all the changes made in this PR.

## Pre-Testing Requirements

### 1. Deploy Google Apps Script
⚠️ **CRITICAL**: The Canvas War staff territory fix requires deploying the updated `COMPLETE_APPS_SCRIPT_FIXED.js` to Google Apps Script.

**Steps:**
1. Open your Google Apps Script project
2. Copy the entire contents of `COMPLETE_APPS_SCRIPT_FIXED.js`
3. Paste it into the script editor (replace all existing code)
4. Click "Deploy" > "New deployment"
5. Choose "Web app"
6. Set "Execute as" to your account
7. Set "Who has access" to "Anyone"
8. Click "Deploy"
9. Copy the new deployment URL
10. Update the `API_URL` constant in all HTML files (if changed)

### 2. Clear Browser Cache
- Clear your browser cache or use an incognito/private window
- This ensures you're testing the latest version

## Test 1: Canvas War Staff Territory ✅

### Objective
Verify that staff members get their pixels counted toward "Teacher" territory instead of their house.

### Prerequisites
- A staff email account (e.g., firstname.lastname.vasteras@engelska.se - without .student.)
- The Canvas War campaign must be active

### Steps
1. Navigate to `pages/canvas.html`
2. Enter a staff email address (must have @engelska.se but NOT .student.)
3. Click "Enter Canvas"
4. Verify the following:
   - **Status Display** shows "Teacher" as the house ✅
   - **Your Color** preview shows a black square ✅
   - **Available Points** shows the staff member's point balance ✅

5. Click on an unclaimed block to place a pixel
6. Confirm the placement in the dialog
7. Verify the following:
   - The block turns **black** ✅
   - The **"Teacher" territory count increases** (not Phoenix/Dragon/Hydra/Griffin) ✅
   - Recent Activity shows **"Teacher placed a pixel"** ✅

### Expected Results
- ✅ Staff pixel is black
- ✅ Teacher territory increases by 1
- ✅ Staff member's house territory does NOT increase
- ✅ Recent activity correctly shows "Teacher"

### Troubleshooting
- If the pixel shows a house color instead of black, check that the Apps Script is deployed
- If territory goes to a house, verify the `placePixel` function has the updated logic

---

## Test 2: Admin Bulk Entry Submission ✅

### Objective
Verify that the admin bulk entry form correctly submits points to Google Sheets.

### Prerequisites
- Admin password: `135vasteras`
- Access to the Google Sheets "Points Log" tab

### Steps
1. Navigate to `pages/admin-bulk-entry.html`
2. Enter the following:
   - Admin Password: `135vasteras`
   - Your Name: `Test Admin`
   - Select any house (e.g., Phoenix)
   - Points: `5`
   - Category: `Special Event`
   - Justification: `Testing bulk entry fix`
3. Click "Award Bulk Points"
4. Verify:
   - **Success message appears** ✅
   - Form fields clear ✅

5. Open Google Sheets and check the "Points Log" tab
6. Verify the new entry appears with:
   - Timestamp ✅
   - Teacher: `[ADMIN] Test Admin - Testing bulk entry fix` ✅
   - Student: `Bulk Award` ✅
   - House: `Phoenix` (or selected house) ✅
   - Category: `Special Event` ✅
   - Points: `5` ✅

### Expected Results
- ✅ Success message displays
- ✅ Entry appears in Google Sheets Points Log
- ✅ All fields are correctly populated

### Troubleshooting
- If no success message appears, check browser console for errors
- If no entry in sheets, verify the Apps Script is deployed
- If password error, verify you're using `135vasteras`

---

## Test 3: Terminology Update (Staff → Teacher) ✅

### Objective
Verify all user-facing text shows "Teacher" instead of "Staff".

### Pages to Check

#### A. Index Page (index.html)
1. Navigate to the root URL
2. Verify: Link shows **"📱 Teacher Console"** (not "Staff Console") ✅

#### B. Console Page (pages/console.html)
1. Navigate to `pages/console.html`
2. Verify: Subtitle shows **"Teacher Administration Portal"** ✅
3. Verify: **No "Mobile Teacher App" button** exists ✅

#### C. Canvas War (pages/canvas.html)
1. Navigate to `pages/canvas.html`
2. Enter an email and view the page
3. Verify:
   - Territory stats show **"Teacher"** (not "Staff") ✅
   - If logged in as staff, status shows **"Teacher"** as house ✅
   - Recent activity shows **"Teacher placed a pixel"** when staff place pixels ✅

#### D. House Page (pages/house-page.html)
1. Navigate to any house page (e.g., `pages/house-page.html?house=phoenix`)
2. Scroll to "House Members" section
3. Verify: Authentication message says **"Teacher Verification Required"** ✅
4. Verify: Form labels say **"Teacher Password"** and **"Teacher Email"** ✅
5. Verify: Locked message says **"Teacher verification required"** ✅

#### E. Quiz Leaderboard (pages/quiz-leaderboard.html)
1. Navigate to `pages/quiz-leaderboard.html`
2. Verify: Tab says **"Individual Stats (Teacher)"** ✅
3. Click on the tab
4. Verify: Authentication message says **"Teacher Verification Required"** ✅
5. Verify: Form labels say **"Teacher Email"** ✅

#### F. House Swap (pages/houseswap.html)
1. Navigate to `pages/houseswap.html`
2. Verify: Email field label says **"Your Teacher Email"** ✅

### Expected Results
- ✅ All user-facing text shows "Teacher"
- ✅ No visible "Staff" text remains (except in internal code)
- ✅ Functionality remains unchanged

### Acceptable Internal References
These should **NOT** be changed and are expected:
- Variable names: `isStaff`, `staffBar`, `staffEmail`
- Function names: `verifyStaffAccess()`, `checkStaffAuth()`
- Form field IDs: `id="staffPassword"`
- Color mappings: `'Staff': '#000000'`

---

## Test 4: Mobile Teacher App Removal ✅

### Objective
Verify all references to teacher-mobile.html are removed.

### Steps
1. Navigate to `pages/console.html`
2. Verify: **No "Mobile Teacher App" button** exists ✅
3. Try to access `pages/teacher-mobile.html` directly
4. Expected: Page may not load or show 404 (this is correct) ✅

5. Check PWA shortcuts (if on mobile/installable):
   - Open the installed PWA app menu
   - Verify: "Award Points" shortcut goes to `teacher-form.html` ✅

### Expected Results
- ✅ No mobile app link on console
- ✅ PWA shortcuts point to teacher-form.html
- ✅ Service worker cache updated (v3)

---

## Test 5: Start New Campaign Card Removal ✅

### Objective
Verify the "Start New Campaign" card is removed from canvas-admin.html.

### Steps
1. Navigate to `pages/canvas-admin.html`
2. Scroll through the page
3. Verify: **No "Start New Campaign" card** exists ✅
4. Verify the following cards/sections ARE present:
   - "Wipe Canvas" ✅
   - "Extend Campaign" ✅
   - "Update Settings" ✅

### Expected Results
- ✅ "Start New Campaign" card is gone
- ✅ Other admin functions work correctly
- ✅ Page has no JavaScript errors

### To Start New Campaigns
Admins should now start campaigns by editing the Google Sheet:
1. Open the "Canvas Settings" sheet
2. Update the campaign end date
3. Optionally update canvas size
4. Save changes

---

## Test 6: Integration Testing ✅

### Objective
Test complete workflows to ensure nothing is broken.

### Workflow 1: Student Point Earning & Canvas
1. Student earns points via quiz or teacher form
2. Student uses points to place pixel on canvas
3. Verify points deducted correctly ✅
4. Verify pixel appears on canvas ✅

### Workflow 2: Staff Point Awarding
1. Teacher logs into teacher-form.html
2. Awards points to a student
3. Verify points appear in Google Sheets ✅
4. Verify house totals update ✅

### Workflow 3: Staff Playing Canvas War
1. Staff member logs into canvas.html
2. Staff places a black pixel
3. Verify Teacher territory increases ✅
4. Verify staff's house territory does NOT increase ✅

### Workflow 4: Admin Bulk Points
1. Admin uses bulk entry form
2. Awards points to a house
3. Verify points logged in sheets ✅
4. Verify house total updates ✅

---

## Regression Testing Checklist

Test these existing features to ensure nothing broke:

- [ ] Teacher point entry form (teacher-form.html) still works
- [ ] Student quiz (quiz.html) still works
- [ ] Leaderboard (leaderboard.html) displays correctly
- [ ] House totals calculate correctly
- [ ] Sorting ceremony still works
- [ ] House finder still works
- [ ] Recent points display correctly
- [ ] Canvas pixel placement works for students
- [ ] Canvas leaderboard displays correctly
- [ ] Quiz leaderboard displays correctly

---

## Known Issues & Limitations

1. **Historical Data**: Past Canvas War pixels placed by staff before this fix may show their house instead of "Teacher". This is expected and does not affect current functionality.

2. **Staff in Roster**: Staff members may still have a house assigned in the Student Roster sheet. This is intentional - they should only be treated as "Teacher" in Canvas War, but can still award points to their house.

3. **Manual Campaign Start**: The "Start New Campaign" feature has been removed from the UI. Admins must now edit the Google Sheet directly to start new campaigns.

---

## Reporting Issues

If you find any bugs during testing:

1. **Check Browser Console**: Press F12 and look for JavaScript errors
2. **Check Google Sheets**: Verify data is being written correctly
3. **Verify Apps Script**: Ensure the latest version is deployed
4. **Document the Issue**:
   - What you were doing
   - What you expected to happen
   - What actually happened
   - Browser and device information
   - Screenshots if possible

---

## Success Criteria

All tests pass when:
- ✅ Staff pixels count toward Teacher territory
- ✅ Recent activity shows "Teacher" for staff
- ✅ All UI text shows "Teacher" instead of "Staff"
- ✅ Admin bulk entry submits to Google Sheets
- ✅ Mobile app references removed
- ✅ Start campaign card removed
- ✅ No existing functionality broken
- ✅ No JavaScript errors in console

---

## Post-Testing

After all tests pass:
1. Announce changes to staff and students
2. Provide brief training if needed
3. Monitor for any issues in first few days
4. Update any printed documentation if applicable

---

## Contact

For questions or issues during testing, contact:
- Repository maintainer via GitHub issues
- School IT support
- house.points.vasteras@engelska.se
