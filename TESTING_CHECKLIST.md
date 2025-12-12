# Testing Checklist for Fixed Pages

## Prerequisites

Before testing, ensure:
- [ ] Apps Script has been deployed with the updated code
- [ ] Google Sheet exists with required sheets:
  - [ ] Student Roster (columns: First Name, Last Name, Email, House)
  - [ ] Points Log (columns: Timestamp, Teacher, Student, House, Category, Points)
  - [ ] House Totals
- [ ] At least a few test students exist in Student Roster

## Page Testing

### 1. Sorting Ceremony (`/pages/sorting-ceremony.html`)

**Test Case 1: Valid Student Email**
- [ ] Open page in browser
- [ ] Enter valid email: `firstname.lastname.student.vasteras@engelska.se`
- [ ] Click "🎩 Discover Your House"
- [ ] Verify sorting animation plays for ~4 seconds
- [ ] Verify house reveal appears with:
  - [ ] Correct house shield image
  - [ ] House name in color
  - [ ] House values and motto
  - [ ] "✓ A certificate has been sent to your email!"
- [ ] Check Google Sheet "Student Roster" - new row added
- [ ] Check email inbox (may be in spam)

**Test Case 2: Invalid Email Format**
- [ ] Enter email without `@engelska.se`
- [ ] Verify error: "Email must end with @engelska.se"
- [ ] Enter email without `.vasteras@`
- [ ] Verify error: "Invalid email format"

**Test Case 3: Already Sorted Student**
- [ ] Enter same email twice
- [ ] Second attempt should still show the house (deterministic)
- [ ] Check Sheet - should have 2 rows (or handle duplicate check if implemented)

**Browser Console Check:**
- [ ] No red errors in console (F12)
- [ ] Network tab shows POST to Apps Script (may show as failed due to no-cors)

---

### 2. House Finder (`/pages/house-finder.html`)

**Test Case 1: Load Student List**
- [ ] Open page
- [ ] Verify status changes from "Loading roster..." to "Ready."
- [ ] No errors in console

**Test Case 2: Search by Name**
- [ ] Type first few letters of a student's first name
- [ ] Verify suggestions dropdown appears
- [ ] Verify max 5 suggestions shown
- [ ] Click on a suggestion
- [ ] Verify:
  - [ ] Student's full name displays
  - [ ] House name displays (e.g., "House Phoenix")
  - [ ] Shield image appears and glows
  - [ ] House-colored glow effect visible

**Test Case 3: Search by Last Name**
- [ ] Type last name
- [ ] Verify search works

**Test Case 4: No Results**
- [ ] Type gibberish like "zzzxxx"
- [ ] Verify no suggestions appear
- [ ] No errors in console

**Test Case 5: Press Enter**
- [ ] Type partial name with matches
- [ ] Press Enter key
- [ ] Verify first matching student is selected

**Browser Console Check:**
- [ ] No red errors
- [ ] Network tab shows successful GET to `?action=houseLookup`
- [ ] Response contains array of students with `fullName`, `email`, `house`

---

### 3. Teacher Mobile Form (`/pages/teacher-mobile.html`)

**Test Case 1: Award to House (No Student Selection)**
- [ ] Enter teacher name/email
- [ ] Select a house (one of the 4 shields)
- [ ] Verify shield highlights with glow
- [ ] Select a category (e.g., "❤️ Kindness/Helping Others")
- [ ] Verify button highlights in cyan
- [ ] Click "Award 1 Point"
- [ ] Verify success message: "✓ Point awarded!"
- [ ] Check Google Sheet "Points Log" - new row added
- [ ] Verify selections are cleared after submission

**Test Case 2: Award to Specific Students**
- [ ] Enter teacher name
- [ ] Click student selector toggle (▶ changes to ▼)
- [ ] Panel expands
- [ ] Type student name in search box
- [ ] Suggestions appear
- [ ] Click a student from suggestions
- [ ] Verify:
  - [ ] Student tag appears with name and house
  - [ ] House selection card disappears
  - [ ] Count shows "1 selected"
- [ ] Add another student
- [ ] Verify count shows "2 selected"
- [ ] Select a category
- [ ] Click "Award 1 Point"
- [ ] Verify: "✓ Points awarded for 2 student(s)."
- [ ] Check Sheet - 2 new rows in Points Log
- [ ] Verify each row has correct house from student's profile

**Test Case 3: Remove Student from Selection**
- [ ] Select a student
- [ ] Click the × on their tag
- [ ] Verify student removed
- [ ] Verify count updates
- [ ] If all removed, house selector reappears

**Test Case 4: Validation Errors**
- [ ] Click "Award 1 Point" with nothing selected
- [ ] Verify error: "Please enter your name or email."
- [ ] Enter name, click button
- [ ] Verify error: "Please select a category."
- [ ] Select category but no house/student
- [ ] Verify error: "Please select a house."

**Browser Console Check:**
- [ ] No errors loading page
- [ ] Student list loads successfully
- [ ] POST requests to `action=logPoints` succeed
- [ ] Check payload has correct structure

---

### 4. Teacher Desktop Form (`/pages/teacher-form.html`)

**Same tests as Teacher Mobile Form**
- [ ] Test all 4 test cases from above
- [ ] Verify responsive layout on desktop
- [ ] Shield images are larger and more visible
- [ ] Category grid layout works

**Additional Desktop-Specific Tests:**
- [ ] Hover effects on house shields work
- [ ] Hover effects on category buttons work
- [ ] Student panel UI looks good on wider screen

---

### 5. Other Pages (Regression Testing)

Quick check that other pages still work:

**Quiz Page (`/pages/quiz.html`)**
- [ ] Opens without errors
- [ ] Can start quiz (if eligible)

**Leaderboard (`/pages/leaderboard.html`)**
- [ ] Opens without errors
- [ ] Shows house standings

**Console (`/pages/console.html`)**
- [ ] Opens without errors
- [ ] All navigation links work

**Settings (`/pages/settings.html`)**
- [ ] Opens without errors
- [ ] Can view settings

---

## API Endpoint Testing

### Manual API Tests (Optional)

Use browser console or tools like Postman to test directly:

**Test `houseLookup`:**
```javascript
fetch('YOUR_APPS_SCRIPT_URL?action=houseLookup')
  .then(r => r.json())
  .then(console.log);
```
Expected: `{ status: 'success', students: [...] }`

**Test `listStudents`:**
```javascript
fetch('YOUR_APPS_SCRIPT_URL?action=listStudents')
  .then(r => r.json())
  .then(console.log);
```
Expected: `{ status: 'success', students: [...] }`

**Test `sort`:**
```javascript
fetch('YOUR_APPS_SCRIPT_URL', {
  method: 'POST',
  body: JSON.stringify({
    action: 'sort',
    email: 'test.student.student.vasteras@engelska.se',
    house: 'Phoenix',
    timestamp: new Date().toISOString()
  })
}).then(r => r.json()).then(console.log);
```
Expected: `{ status: 'success', message: '...' }`

**Test `logPoints`:**
```javascript
fetch('YOUR_APPS_SCRIPT_URL', {
  method: 'POST',
  body: JSON.stringify({
    action: 'logPoints',
    teacher: 'Test Teacher',
    student: 'Test Student',
    house: 'Phoenix',
    category: 'Testing',
    points: 1
  })
}).then(r => r.json()).then(console.log);
```
Expected: `{ status: 'success', message: '...' }`

---

## Common Issues and Solutions

### Issue: "Failed to load student list"
**Check:**
- Apps Script deployed correctly?
- Student Roster sheet exists?
- Sheet has data?
- API URL correct in HTML?

### Issue: "Network error" when submitting
**Check:**
- Apps Script URL correct?
- Sheet name "Points Log" exists?
- Check browser console Network tab for actual error
- Verify Apps Script permissions are granted

### Issue: Students appear but can't select
**Check:**
- Browser console for JavaScript errors
- Student objects have required fields (name, email, house)
- Event listeners working (no JS errors)

### Issue: Email not received
**Notes:**
- Email sending is "fire and forget" - may fail silently
- Check spam folder
- Gmail delays emails sometimes
- MailApp requires proper Apps Script permissions

---

## Performance Checks

- [ ] Pages load in under 3 seconds
- [ ] API calls return in under 2 seconds
- [ ] No memory leaks (check browser Task Manager)
- [ ] Mobile responsive on actual phones
- [ ] Works in multiple browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

---

## Accessibility Checks

- [ ] All interactive elements keyboard accessible
- [ ] Tab order makes sense
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Images have alt text
- [ ] Form labels associated with inputs

---

## Sign-Off

Tested by: ________________

Date: ________________

All critical tests passed: [ ] Yes [ ] No

Notes:
_______________________________________________________
_______________________________________________________
_______________________________________________________
