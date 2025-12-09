# Quiz System Setup Guide

## 📊 Google Sheets Structure

You need to create **3 new tabs** in your existing Google Sheet:

---

### 1️⃣ **Quiz Settings** Tab

Controls for quiz behavior and anti-cheating measures.

**Columns (Row 1 - Headers):**
```
A: Setting Name | B: Value | C: Description
```

**Default Values (Rows 2+):**
| Setting Name | Value | Description |
|--------------|-------|-------------|
| Max Daily Attempts | 5 | Maximum questions per student per day |
| Max Daily Points | 5 | Maximum points a student can earn per day from quizzes |
| Question Time Limit | 60 | Seconds allowed to answer each question |
| Cooldown Minutes | 5 | Minutes between quiz attempts |
| Points Per Correct | 1 | Points awarded for correct answer |
| AI Enabled | FALSE | Enable Gemini AI question generation |
| AI Fallback | TRUE | Use static questions if AI fails |
| Gemini API Key | | Your Gemini API key (leave empty for now) |
| Min Difficulty | Easy | Minimum difficulty level |
| Max Difficulty | Hard | Maximum difficulty level |

---

### 2️⃣ **Quiz Questions** Tab

Static question bank (used now, fallback later with AI).

**Columns (Row 1 - Headers):**
```
A: ID | B: Question | C: Option A | D: Option B | E: Option C | F: Option D | G: Correct | H: Difficulty | I: Category | J: Active | K: Source
```

**Example Questions (Rows 2+):**
| ID | Question | Option A | Option B | Option C | Option D | Correct | Difficulty | Category | Active | Source |
|----|----------|----------|----------|----------|----------|---------|------------|----------|--------|--------|
| Q001 | What is the capital of Sweden? | Stockholm | Oslo | Copenhagen | Helsinki | A | Easy | Geography | TRUE | Static |
| Q002 | Who wrote "Harry Potter"? | J.K. Rowling | J.R.R. Tolkien | C.S. Lewis | Roald Dahl | A | Easy | Literature | TRUE | Static |
| Q003 | What is 15 × 12? | 180 | 175 | 190 | 185 | A | Medium | Mathematics | TRUE | Static |
| Q004 | What year did World War II end? | 1945 | 1944 | 1946 | 1943 | A | Medium | History | TRUE | Static |
| Q005 | What is the chemical symbol for Gold? | Au | Ag | Go | Gd | A | Easy | Science | TRUE | Static |

**Column Definitions:**
- **ID**: Unique identifier (format: Q001, Q002, AI-001, AI-002, etc.)
- **Question**: The question text
- **Option A-D**: Four possible answers
- **Correct**: Letter of correct answer (A, B, C, or D)
- **Difficulty**: Easy, Medium, or Hard
- **Category**: Subject area (Geography, Math, Science, History, etc.)
- **Active**: TRUE to use in quiz, FALSE to disable
- **Source**: "Static" or "AI-Generated"

---

### 3️⃣ **Quiz Log** Tab

Tracks all quiz attempts for anti-cheating and analytics.

**Columns (Row 1 - Headers):**
```
A: Timestamp | B: Student Email | C: Question ID | D: Question Text | E: Selected Answer | F: Correct Answer | G: Is Correct | H: Points Awarded | I: Time Taken (s) | J: Session ID
```

**Column Definitions:**
- **Timestamp**: When the answer was submitted
- **Student Email**: Student identifier
- **Question ID**: Links to Quiz Questions tab
- **Question Text**: Copy of question (in case it changes later)
- **Selected Answer**: A, B, C, or D
- **Correct Answer**: A, B, C, or D
- **Is Correct**: TRUE or FALSE
- **Points Awarded**: Usually 1 or 0
- **Time Taken (s)**: Seconds from question load to answer submission
- **Session ID**: Unique per quiz session (prevents cheating)

---

## 🔐 Anti-Cheating Measures Built In

1. **Server-Side Timer**: Question start time stored server-side, validated on submission
2. **Session Tracking**: Each quiz attempt gets unique session ID
3. **Daily Limits**: Max attempts and points per day per student
4. **Cooldown**: Forced wait time between attempts
5. **Question Lock**: Once shown, question can't be skipped/refreshed
6. **Answer Validation**: All validation happens server-side
7. **Audit Trail**: Complete log of all attempts

---

## 🤖 AI Integration (Future)

When you're ready to add Gemini AI:

1. Set **AI Enabled** to TRUE in Quiz Settings
2. Add your **Gemini API Key** in Quiz Settings
3. AI-generated questions will be stored in Quiz Questions tab with Source = "AI-Generated"
4. System automatically falls back to static questions if AI fails

---

## 📝 Adding Your Own Questions

To add questions now:
1. Go to **Quiz Questions** tab
2. Add new row with:
   - Unique ID (Q006, Q007, etc.)
   - Your question
   - Four options
   - Correct answer letter
   - Difficulty (Easy/Medium/Hard)
   - Category
   - Active = TRUE
   - Source = Static

Start with 20-50 questions for a good variety!

---

## 🎯 Recommended Question Categories

- **Mathematics**: Arithmetic, Algebra, Geometry
- **Science**: Physics, Chemistry, Biology
- **History**: World history, Local history
- **Geography**: Countries, Capitals, Landmarks
- **Literature**: Authors, Books, Characters
- **General Knowledge**: Current events, Culture
- **Language**: Grammar, Vocabulary, Idioms

---

## 🚀 Next Steps

1. Create these 3 tabs in your Google Sheet
2. Copy the headers exactly as shown
3. Add initial values to Quiz Settings
4. Add 10-20 starter questions to Quiz Questions
5. Deploy the updated Apps Script (I'll provide this next)
6. Test the quiz page!
