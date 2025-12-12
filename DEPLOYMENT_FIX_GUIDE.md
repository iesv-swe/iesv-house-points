# Deployment Fix Guide

## Issues Fixed

This document outlines the issues that were identified and fixed in the IESV House Points system.

### Problem Summary

Several pages were not working due to missing API endpoints in the Google Apps Script backend:

1. **Sorting Ceremony** - Could not save sorted students or send emails
2. **House Finder** - Could not load student list for searching
3. **Teacher Mobile Form** - Network errors when submitting points
4. **Student Selector** - Cards not showing students properly

## Root Cause

The frontend pages were calling API endpoints that did not exist in the Apps Script backend:

- `action=houseLookup` - Missing from doGet handler
- `action=sort` - Missing from doPost handler  
- `action=points` - Wrong action name (should be `logPoints`)
- `listStudents` response - Missing status wrapper

## Changes Made

### 1. Apps Script Backend (`COMPLETE_APPS_SCRIPT_FIXED.js`)

#### Added `houseLookup` endpoint (GET)
```javascript
// In doGet function:
if (action === 'houseLookup') {
  return jsonResponse(houseLookup());
}

// New function:
function houseLookup() {
  // Returns student list with fullName field for searching
  // Format: { status: 'success', students: [{ fullName, email, house }] }
}
```

#### Added `sort` endpoint (POST)
```javascript
// In doPost function:
if (data.action === 'sort') {
  const result = sortStudent(data);
  return jsonResponse(result);
}

// New function:
function sortStudent(data) {
  // Adds student to roster
  // Sends welcome email
  // Format: { status: 'success', message: '...' }
}
```

#### Fixed `listStudents` response format
```javascript
// Changed from:
return { students: students };

// To:
return { status: 'success', students: students };
```

### 2. Frontend Pages

#### Fixed `teacher-mobile.html`
Changed incorrect action name from `"points"` to `"logPoints"` in two places:
- Line 576: Single house point submission
- Line 619: Multiple student point submission

## Deployment Steps

### Step 1: Deploy Updated Apps Script

1. Open your Google Apps Script project
2. Replace the entire contents with the updated `COMPLETE_APPS_SCRIPT_FIXED.js`
3. **IMPORTANT**: Update the `SHEET_ID` constant at the top with your actual Google Sheet ID
4. Click **Deploy** → **New deployment**
5. Choose type: **Web app**
6. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone** (or your organization)
7. Click **Deploy**
8. Copy the new deployment URL

### Step 2: Update Frontend Pages (If Needed)

The deployment URL is already embedded in the HTML files. If you created a new deployment with a different URL, you'll need to update it in these files:

- `pages/sorting-ceremony.html` (line 594-595)
- `pages/house-finder.html` (line 169-170)
- `pages/teacher-mobile.html` (line 365-366)
- `pages/teacher-form.html` (line 390-391)

Search for:
```javascript
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/...";
```

### Step 3: Test All Fixed Pages

1. **Sorting Ceremony** (`/pages/sorting-ceremony.html`)
   - Enter a valid student email (format: `firstname.lastname.student.vasteras@engelska.se`)
   - Click "Discover Your House"
   - Verify:
     - ✅ House is displayed after animation
     - ✅ Student is added to "Student Roster" sheet
     - ✅ Email is sent to the student

2. **House Finder** (`/pages/house-finder.html`)
   - Open the page
   - Verify "Loading roster..." changes to "Ready."
   - Start typing a student name
   - Verify:
     - ✅ Suggestions appear as you type
     - ✅ Selecting a student shows their house
     - ✅ Shield image displays correctly

3. **Teacher Mobile Form** (`/pages/teacher-mobile.html`)
   - Enter teacher name
   - Select a house OR select students
   - Select a category
   - Click "Award 1 Point"
   - Verify:
     - ✅ Success message appears
     - ✅ Point is logged in "Points Log" sheet
     - ✅ No network errors in console

4. **Teacher Desktop Form** (`/pages/teacher-form.html`)
   - Same tests as mobile form
   - Additionally verify student selector works:
     - ✅ Can search and select multiple students
     - ✅ House selector hides when students selected
     - ✅ Points awarded to each student's house

## Verification Checklist

After deployment, verify these in your Google Sheet:

- [ ] "Student Roster" sheet exists with columns: First Name, Last Name, Email, House
- [ ] "Points Log" sheet exists with columns: Timestamp, Teacher, Student, House, Category, Points
- [ ] Test sorting a new student - row appears in Student Roster
- [ ] Test awarding points - row appears in Points Log
- [ ] Check email was sent (may be in spam folder)

## Troubleshooting

### "Network error" or "Failed to fetch"

**Cause**: Apps Script not deployed or wrong URL

**Fix**:
1. Verify the Apps Script is deployed as a web app
2. Check the deployment URL matches the one in HTML files
3. Ensure "Who has access" is set correctly

### "Student Roster not found" error

**Cause**: Google Sheet doesn't have the required sheet

**Fix**:
1. Open your Google Sheet
2. Create a sheet named exactly "Student Roster"
3. Add headers: First Name | Last Name | Email | House
4. Optionally add some test data

### Students not appearing in House Finder

**Cause**: Empty Student Roster or API not returning data

**Fix**:
1. Check Student Roster has data
2. Open browser console (F12)
3. Look for errors in Network tab when page loads
4. Verify the API response contains student data

### Email not received after sorting

**Cause**: Email sending might fail silently

**Notes**:
- The system logs success even if email fails
- Check spam folder
- Gmail may delay emails by a few minutes
- MailApp requires proper permissions in Apps Script

## API Reference

### New Endpoints

#### GET `/exec?action=houseLookup`

Returns all students for house lookup with fullName field.

**Response**:
```json
{
  "status": "success",
  "students": [
    {
      "fullName": "John Smith",
      "email": "john.smith.student.vasteras@engelska.se",
      "house": "Phoenix"
    }
  ]
}
```

#### POST `/exec` with `action=sort`

Sorts a new student into a house.

**Request**:
```json
{
  "action": "sort",
  "email": "john.smith.student.vasteras@engelska.se",
  "house": "Phoenix",
  "timestamp": "2024-12-12T08:00:00.000Z"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Student sorted successfully"
}
```

### Modified Endpoints

#### GET `/exec?action=listStudents`

Now includes status wrapper.

**Old Response**:
```json
{
  "students": [...]
}
```

**New Response**:
```json
{
  "status": "success",
  "students": [...]
}
```

## Notes

- All fixes are backward compatible except for `listStudents` response format
- The sorting ceremony uses `no-cors` mode, so response checking is limited
- Student emails are validated on both frontend and backend
- House assignment uses deterministic hashing based on email

## Contact

If issues persist after following this guide, check:
1. Browser console for JavaScript errors
2. Apps Script logs (View → Logs in script editor)
3. Network tab in browser dev tools to see actual API responses
