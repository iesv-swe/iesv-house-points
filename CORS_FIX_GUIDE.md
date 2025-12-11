# CORS Fix Guide for Canvas Admin

## Problem
The canvas-admin.html page experiences CORS (Cross-Origin Resource Sharing) errors when making POST requests to the Google Apps Script backend. This prevents the admin buttons from working.

## Root Cause
CORS errors occur when:
1. The frontend (GitHub Pages) and backend (Google Apps Script) are on different domains
2. The browser enforces CORS security policy for cross-origin requests
3. The Google Apps Script doesn't properly handle CORS requests

## Solution

### Frontend Changes (Already Applied)
The frontend code in `pages/canvas-admin.html` has been updated to send POST requests WITHOUT the `Content-Type: application/json` header. This avoids triggering CORS preflight requests:

```javascript
// Correct approach (no Content-Type header)
const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
        action: 'wipeCanvas',
        password: password
    })
});
```

### Backend Configuration (Google Apps Script)
The Google Apps Script must be deployed correctly to handle cross-origin requests:

1. **Open your Google Sheet**
2. **Go to Extensions > Apps Script**
3. **Click Deploy > New deployment**
4. **Configure the deployment:**
   - Type: Web app
   - Execute as: **Me** (your account)
   - Who has access: **Anyone** (or "Anyone with Google account" if you want to restrict)
5. **Click Deploy**
6. **Copy the new Web App URL**
7. **Update API_URL in canvas-admin.html** with the new deployment URL

### Important Notes

- **Always deploy a NEW version** after making changes to the Apps Script
- **Test the deployment** by visiting the URL in a browser - it should return JSON, not an error
- **Check deployment permissions** - "Anyone" access is required for CORS to work
- The Apps Script automatically allows cross-origin requests when deployed with proper permissions

### Alternative: Add Explicit CORS Handling (If Needed)

If the above doesn't work, you can add explicit CORS handling to the Apps Script. However, Google Apps Script should handle this automatically when deployed correctly.

### Verification

After proper deployment, the canvas-admin page should:
- ✅ Make POST requests without CORS errors
- ✅ Receive responses and display success/error messages
- ✅ Show proper validation errors (wrong password, etc.)
- ✅ Update canvas state successfully

### Troubleshooting

**If buttons still don't work:**
1. Check browser console for the exact error message
2. Verify the API_URL in canvas-admin.html matches your deployment URL
3. Ensure the deployment is set to "Execute as: Me" not "User accessing the web app"
4. Try creating a completely new deployment (not updating existing one)
5. Clear browser cache and try again

**Common Errors:**
- "No 'Access-Control-Allow-Origin' header" = Deployment permission issue
- "Script function not found" = Using old deployment URL after script changes
- "Authorization required" = Wrong "Who has access" setting

## Why This Approach Works

1. **No Content-Type header** = No CORS preflight OPTIONS request
2. **Proper deployment** = Google handles CORS automatically
3. **Direct POST** = Simple request that browsers allow
4. **JSON in body** = Apps Script parses with `JSON.parse(e.postData.contents)`

## Files Involved

- `pages/canvas-admin.html` - Frontend code (fixed)
- `COMPLETE_APPS_SCRIPT_FIXED.js` - Backend code (reference)
- Google Apps Script deployment settings (must be configured)
