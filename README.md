# IESV House Points System

A comprehensive web-based house points management system for schools, inspired by the house system. This system allows teachers to award points, students to track progress, and administrators to manage house competitions.

## Features

### Core Functionality
- **House Points Management**: Award and track points across different houses
- **Student Roster**: Manage student assignments to houses
- **Real-time Leaderboard**: Display current house standings
- **Teacher Interface**: Mobile-friendly form for awarding points
- **Admin Console**: Centralized dashboard for all system features
- **Bulk Entry**: Import multiple point entries at once
- **House Display**: Large-screen display for public viewing

### Student Features
- **Sorting Ceremony**: Interactive house assignment for new students
- **House Finder**: Look up which house a student belongs to
- **Student Quiz System**: Earn points by answering trivia questions
  - Daily attempt limits and cooldowns to prevent abuse
  - Multiple difficulty levels and categories
  - Anti-cheating measures (server-side validation, session tracking)
  - AI-ready architecture for future Gemini integration

### Administrative Features
- **Settings Management**: Configure system behavior and appearance
- **House Swap**: Reassign students between houses
- **Point Categories**: Customize point award reasons
- **Quiz Management**: Control quiz settings, questions, and difficulty

## Repository Structure

```
iesv-house-points/
├── index.html                 # Root redirect page
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker for offline support
├── QUIZ_APPS_SCRIPT.js       # Google Apps Script backend for quiz system
├── QUIZ_SETUP_GUIDE.md       # Detailed quiz setup instructions
├── pages/                     # All application pages
│   ├── console.html          # Main admin dashboard
│   ├── teacher-form.html     # Desktop point entry form
│   ├── teacher-mobile.html   # Mobile-optimized point entry
│   ├── leaderboard.html      # House standings display
│   ├── quiz.html             # Student quiz interface
│   ├── sorting-ceremony.html # New student house assignment
│   ├── house-finder.html     # Student house lookup
│   ├── house-display.html    # Public display screen
│   ├── house-page.html       # Individual house details
│   ├── houseswap.html        # Student reassignment tool
│   ├── admin-bulk-entry.html # Batch point import
│   └── settings.html         # System configuration
├── assets/
│   ├── images/
│   │   ├── backgrounds/      # Stone textures, backgrounds
│   │   ├── houses/           # House logos and emblems
│   │   └── icons/            # UI icons
│   └── icons/                # PWA and favicon files
└── scripts/                   # Shared JavaScript utilities
```

## Setup Instructions

### Prerequisites
- Google Account with access to Google Sheets and Apps Script
- Web hosting (GitHub Pages, Netlify, Vercel, or any static host)

### 1. Google Sheets Setup

Create a new Google Sheet with the following tabs:

#### Required Tabs
- **Student Roster**: Student information and house assignments
  - Columns: Name, Email, House, Year/Grade
- **Points Log**: Record of all point transactions
  - Columns: Timestamp, Teacher, Student, House, Category, Points, Notes
- **Settings**: System configuration
  - Columns: Setting Name, Value

#### Quiz System Tabs (Optional)
If enabling the quiz feature, add these tabs:
- **Quiz Settings**: Configure quiz behavior
- **Quiz Questions**: Question bank
- **Quiz Log**: Student attempt history

See [QUIZ_SETUP_GUIDE.md](QUIZ_SETUP_GUIDE.md) for detailed quiz setup instructions.

### 2. Google Apps Script Deployment

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Create the main script with these functions:
   - `doGet(e)`: Handle GET requests (fetch data)
   - `doPost(e)`: Handle POST requests (submit data)
   - Helper functions for data validation and logging

4. If using the quiz system:
   - Add the code from `QUIZ_APPS_SCRIPT.js`
   - Add quiz endpoints to `doGet()` and `doPost()`

5. Deploy as web app:
   - Click **Deploy > New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (or restrict as needed)
   - Copy the deployment URL

### 3. Configure the Web App

Update the `API_URL` constant in each HTML file to point to your Apps Script deployment:

```javascript
const API_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

Files to update:
- `pages/teacher-form.html`
- `pages/teacher-mobile.html`
- `pages/leaderboard.html`
- `pages/quiz.html`
- `pages/sorting-ceremony.html`
- `pages/house-finder.html`
- `pages/admin-bulk-entry.html`
- `pages/houseswap.html`

### 4. Deploy the Website

#### Option A: GitHub Pages
1. Push repository to GitHub
2. Go to **Settings > Pages**
3. Source: Deploy from branch `main`
4. Your site will be available at `https://yourusername.github.io/iesv-house-points/`

#### Option B: Other Static Hosts
- **Netlify**: Drag and drop the folder
- **Vercel**: Import from Git
- **Firebase Hosting**: Use Firebase CLI

### 5. Customize Your Houses

Edit house information in the HTML files:
- House names
- House colors
- House emblems/logos (update image paths in `assets/images/houses/`)
- House descriptions and values

## Usage Guide

### For Teachers

#### Awarding Points (Desktop)
1. Navigate to **Teacher Form** from the console
2. Select student and point category
3. Enter point value and optional notes
4. Click **Award Points**

#### Awarding Points (Mobile)
1. Open **Teacher Mobile** page
2. Use the streamlined mobile interface
3. Select from student list or search
4. Quick point entry with presets

#### Bulk Entry
1. Go to **Admin Bulk Entry**
2. Prepare CSV with columns: Student Email, Points, Category, Notes
3. Copy/paste into the form
4. Review and submit

### For Students

#### Taking Quizzes
1. Navigate to **Student Quiz** from the console
2. Enter school email address
3. Answer questions within the time limit
4. Earn points for correct answers
5. Respect daily limits and cooldowns

#### Finding Your House
1. Visit **House Finder**
2. Enter your email address
3. View your house assignment and current standings

#### Sorting Ceremony (New Students)
1. Navigate to **Sorting Ceremony**
2. Enter your information
3. Answer personality questions
4. Get assigned to a house

### For Administrators

#### Managing Settings
- Access **Settings** page from the console
- Configure point categories
- Adjust quiz parameters
- Customize house information

#### Viewing Analytics
- Check the **Leaderboard** for current standings
- Review **Points Log** in Google Sheets for detailed history
- Analyze **Quiz Log** for student performance data

## Quiz System Features

### Anti-Cheating Measures
- Server-side timer validation
- Unique session IDs per attempt
- Daily attempt limits (default: 5)
- Daily point caps (default: 5)
- Cooldown periods between attempts (default: 5 minutes)
- Complete audit trail in Quiz Log

### Question Management
- Support for multiple categories (Math, Science, History, etc.)
- Three difficulty levels (Easy, Medium, Hard)
- Active/inactive toggle for questions
- Static question bank
- AI-ready for future Gemini integration

### Student Experience
- Clean, mobile-friendly interface
- Real-time timer with visual warnings
- Immediate feedback on answers
- Progress tracking (attempts remaining, points earned)
- Responsive design for all devices

## Customization

### Changing House Colors
Update the CSS color variables in each HTML file:

```css
.house-color-1 { background: #your-color; }
.house-color-2 { background: #your-color; }
/* etc. */
```

### Adding New Point Categories
1. Open **Settings** page
2. Add new categories to the configuration
3. Update Google Sheets **Settings** tab
4. Categories appear automatically in forms

### Customizing Quiz Behavior
Edit values in the **Quiz Settings** sheet:
- Max Daily Attempts
- Question Time Limit
- Points Per Correct Answer
- Cooldown Duration

## Security Considerations

### Data Privacy
- Student emails are stored securely in Google Sheets
- Access controlled through Google Apps Script permissions
- Consider implementing email domain restrictions

### API Security
- Apps Script URL is public but requires valid data
- Server-side validation on all inputs
- Rate limiting through quiz cooldowns
- Session-based tracking prevents replay attacks

### Recommended Practices
1. Use school email domain restrictions (`@engelska.se`)
2. Regularly review access logs
3. Set appropriate sharing permissions on Google Sheets
4. Keep Apps Script deployment updated
5. Monitor for unusual point patterns

## Troubleshooting

### Common Issues

**Points not appearing**
- Check API_URL is correctly configured
- Verify Apps Script deployment is active
- Check browser console for errors
- Confirm Google Sheet permissions

**Quiz not loading**
- Ensure Quiz tabs exist in Google Sheet
- Verify Apps Script has quiz functions
- Check that questions are marked as Active
- Review Quiz Settings for proper values

**Mobile display issues**
- Clear browser cache
- Check viewport meta tag is present
- Test on different devices
- Verify CSS media queries

**Students can't find their house**
- Confirm email matches exactly in Student Roster
- Check for extra spaces or typos
- Verify Student Roster tab name is correct
- Review Apps Script data fetching logic

## Future Enhancements

### Planned Features
- **AI Question Generation**: Integration with Google Gemini for dynamic quiz questions
- **Student Dashboard**: Personal progress tracking and house history
- **Achievement System**: Badges and milestones for students
- **House Competitions**: Event-based point competitions with timers
- **Mobile App**: Native iOS/Android applications
- **Advanced Analytics**: Detailed reports and visualizations

### Community Contributions
This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Hosting**: Static hosting (GitHub Pages compatible)
- **PWA**: Service Worker for offline support
- **Icons**: Custom favicon and PWA icons

## License

This project is provided as-is for educational purposes. Feel free to adapt and modify for your school's needs.

## Credits

Developed for IESV (Internationella Engelska Skolan Västerås) to gamify student engagement and foster house spirit through a magical house points system.

## Support

For questions, issues, or feature requests:
1. Check this README and QUIZ_SETUP_GUIDE.md
2. Review the code comments in HTML files
3. Check Google Sheets data structure
4. Review Apps Script execution logs

---

**Last Updated**: December 2025
**Version**: 2.0 (with Quiz System)
