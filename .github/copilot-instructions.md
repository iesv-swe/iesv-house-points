# IESV House Points System - Copilot Instructions

## Project Overview

This is a web-based house points management system for schools inspired by the house system. It enables:
- Teachers to award points to students
- Students to earn points through quizzes and track their progress
- Administrators to manage house competitions and view analytics
- Real-time leaderboards and public displays

**Target Audience:** Primary users are teachers, students, and school administrators at IESV (Internationella Engelska Skolan Västerås).

**Key Features:**
- House points tracking and leaderboard
- Student quiz system with anti-cheating measures
- Teacher point entry forms (desktop and mobile)
- Sorting ceremony for new students
- Bulk point entry
- Administrative console and settings
- PWA support with offline capabilities

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **Hosting:** Static hosting (GitHub Pages compatible)
- **PWA:** Service Worker (sw.js) for offline support
- **External Services:** Google Sheets API via Apps Script web app

**Important:** No build process, bundlers, or transpilers are used. All code runs directly in the browser.

## Architecture and Project Structure

```
iesv-house-points/
├── index.html                    # Root redirect page
├── manifest.json                 # PWA manifest
├── sw.js                         # Service worker
├── COMPLETE_APPS_SCRIPT_FIXED.js # Backend code (deployed separately)
├── QUIZ_SETUP_GUIDE.md           # Quiz system documentation
├── CANVAS_SETUP_GUIDE.md         # Canvas integration guide
├── pages/                        # All application pages
│   ├── console.html              # Main admin dashboard
│   ├── teacher-form.html         # Desktop point entry
│   ├── teacher-mobile.html       # Mobile point entry
│   ├── leaderboard.html          # House standings
│   ├── quiz.html                 # Student quiz interface
│   ├── sorting-ceremony.html     # New student assignment
│   ├── house-finder.html         # Student house lookup
│   ├── house-display.html        # Public display screen
│   ├── settings.html             # System configuration
│   └── [other pages]
├── assets/
│   ├── images/
│   │   ├── backgrounds/          # Stone textures, backgrounds
│   │   ├── houses/               # House logos and emblems
│   │   └── icons/                # UI icons
│   └── icons/                    # PWA and favicon files
└── scripts/
    └── monthly-reset-script.js   # Automation script
```

### Architecture Patterns

- **Single-page HTML files:** Each page is self-contained with inline CSS and JavaScript
- **No shared JavaScript modules:** Each HTML file has its own `<script>` tags
- **API-first communication:** All pages communicate with Google Sheets via Apps Script API
- **Progressive Web App:** Offline support via service worker and manifest

## Coding Guidelines

### General Conventions

1. **Code Organization:**
   - Keep all styles in `<style>` tags within the HTML file
   - Keep all JavaScript in `<script>` tags at the bottom of the HTML file
   - Use semantic HTML5 elements
   - Maintain consistent indentation (4 spaces)

2. **Naming Conventions:**
   - Use `camelCase` for JavaScript variables and functions
   - Use `kebab-case` for CSS classes and IDs
   - Use `UPPER_SNAKE_CASE` for constants (e.g., `API_URL`, `SHEET_ID`)
   - Prefix event handlers with `handle` or `on` (e.g., `handleSubmit`, `onLoadComplete`)

3. **CSS:**
   - Use CSS custom properties for theme colors when possible
   - Follow mobile-first responsive design
   - Prefer flexbox and grid for layouts
   - Include animations for better UX (fade-ins, slide-ins)
   - Use `rgba()` for transparency effects

4. **JavaScript:**
   - Use modern ES6+ syntax (arrow functions, const/let, template literals)
   - Prefer `async/await` over callbacks or raw promises
   - Always validate user input before API calls
   - Include error handling with try-catch blocks
   - Log errors to console for debugging
   - Use descriptive error messages for users

### Code Style Examples

#### ✅ Correct:
```javascript
const API_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

async function fetchHouseTotals() {
    try {
        const response = await fetch(`${API_URL}?action=houseTotals`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching house totals:', error);
        showError('Unable to load house standings. Please try again.');
        return null;
    }
}
```

#### ❌ Incorrect:
```javascript
// Don't use var
var apiUrl = "...";

// Don't use callbacks when async/await is clearer
fetch(url).then(response => {
    return response.json();
}).then(data => {
    // handle data
});

// Don't skip error handling
async function getData() {
    const response = await fetch(url);
    return response.json();
}
```

### Security Best Practices

1. **Input Validation:**
   - Always validate email addresses using regex
   - Sanitize user input before displaying or submitting
   - Verify numeric inputs are within expected ranges
   - Check for required fields before submission

2. **API Security:**
   - All data validation happens server-side in Apps Script
   - Session IDs for quiz attempts to prevent replay attacks
   - Rate limiting through cooldowns and daily limits
   - Email domain restrictions where appropriate (`@engelska.se`)

3. **Content Security:**
   - Include Content-Security-Policy meta tags
   - Avoid inline event handlers in HTML
   - Use textContent instead of innerHTML when possible
   - Never expose sensitive credentials in frontend code

### Google Apps Script Integration

1. **API URL Configuration:**
   - Each HTML file must define `API_URL` constant
   - Replace `YOUR_DEPLOYMENT_ID` with actual deployment ID
   - Test API endpoints after each deployment update

2. **Request Patterns:**
   ```javascript
   // GET request
   const url = `${API_URL}?action=actionName&param=value`;
   const response = await fetch(url);
   
   // POST request
   const response = await fetch(API_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: new URLSearchParams({ action: 'actionName', data: value })
   });
   ```

3. **Common Actions:**
   - `houseTotals` - Get current house standings
   - `recentPoints` - Get recent point transactions
   - `listStudents` - Get all students
   - `awardPoints` - Submit new point entry
   - `checkQuizEligibility` - Verify student can take quiz
   - `submitQuizAnswer` - Validate quiz answer

### UI Patterns

1. **Loading States:**
   ```javascript
   function showLoading() {
       // Display spinner or loading message
   }
   
   function hideLoading() {
       // Hide spinner
   }
   ```

2. **Error Messages:**
   ```javascript
   function showError(message) {
       // Display user-friendly error in UI
       console.error(message);
   }
   ```

3. **Success Feedback:**
   ```javascript
   function showSuccess(message) {
       // Display success message
       // Auto-hide after 3-5 seconds
   }
   ```

4. **Responsive Design:**
   - All pages must work on mobile devices
   - Use viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
   - Test on different screen sizes
   - Consider touch targets (minimum 44px)

### House System Conventions

1. **House Colors:**
   - Maintain consistent color scheme across all pages
   - Use house colors for visual differentiation
   - Store colors in CSS classes (e.g., `.house-color-1`, `.house-color-2`)

2. **House Names:**
   - Reference houses by name consistently
   - Match names in Google Sheets exactly
   - Support 4 houses by default (expandable)

## Common Tasks and Patterns

### Adding a New Page

1. Create HTML file in `pages/` directory
2. Copy structure from existing page (console.html is good template)
3. Include required meta tags and favicon link
4. Define `API_URL` constant
5. Implement page-specific functionality
6. Add navigation link from console.html
7. Test on mobile and desktop

### Modifying API Integration

1. Update Apps Script code first
2. Deploy new version
3. Update `API_URL` in affected HTML files
4. Test endpoints with browser dev tools
5. Check for CORS issues
6. Verify error handling

### Adding New Quiz Questions

1. Update Google Sheets "Quiz Questions" tab
2. Include: Question, Options (A-D), Correct Answer, Category, Difficulty, Active status
3. No code changes needed - questions loaded dynamically
4. Test question display and validation

## Development Workflow

1. **Local Development:**
   - Use any web server (e.g., `python -m http.server`)
   - Test in browser with developer tools open
   - Check console for errors
   - Verify API calls in Network tab

2. **Testing:**
   - Test all features manually
   - Verify mobile responsiveness
   - Check different browsers (Chrome, Safari, Firefox)
   - Test offline functionality (PWA)
   - Validate Google Sheets data updates

3. **Deployment:**
   - Push changes to GitHub
   - GitHub Pages auto-deploys from main branch
   - Clear browser cache after deployment
   - Verify production URLs work

4. **Apps Script Updates:**
   - Edit code in Google Apps Script editor
   - Test with script editor
   - Deploy new version
   - Update deployment URL in HTML files if needed

## Resources and References

- **Documentation:**
  - [README.md](../README.md) - Complete setup guide
  - [QUIZ_SETUP_GUIDE.md](../QUIZ_SETUP_GUIDE.md) - Quiz system details
  - [CANVAS_SETUP_GUIDE.md](../CANVAS_SETUP_GUIDE.md) - LMS integration

- **External APIs:**
  - Google Apps Script Web App: https://developers.google.com/apps-script/guides/web
  - Google Sheets API: https://developers.google.com/sheets/api

- **Design Inspiration:**
  - House system inspired by Harry Potter house points
  - Color scheme: IESV blue (#102d69) and cyan (#00a0df)

## Important Notes

1. **No Build Process:** All HTML, CSS, and JavaScript is written directly without transpilation or bundling
2. **Inline Everything:** Each page is self-contained with inline styles and scripts
3. **API-First:** All data operations go through Google Apps Script
4. **Mobile-First:** Always consider mobile users first
5. **Progressive Enhancement:** Core functionality works without JavaScript where possible
6. **Security:** Never commit API keys, deployment URLs with write access, or sensitive data
7. **Testing:** Always test quiz anti-cheating measures after changes
8. **Data Integrity:** Validate data before submission to prevent corruption

## Anti-Patterns to Avoid

- ❌ Don't add npm packages or build tools
- ❌ Don't create separate .css or .js files (keep inline)
- ❌ Don't use jQuery or large frameworks
- ❌ Don't hardcode student names or sensitive data
- ❌ Don't skip input validation
- ❌ Don't ignore mobile responsiveness
- ❌ Don't commit actual deployment URLs or credentials
- ❌ Don't modify working code unless fixing bugs or adding features
