// ============================================================================
// QUIZ SYSTEM - Apps Script Code
// ============================================================================
// ADD THIS CODE TO YOUR EXISTING APPS SCRIPT
//
// Instructions:
// 1. Open your Apps Script editor
// 2. Add these two sections to your doGet() function (see marked lines)
// 3. Add all the helper functions at the bottom of your script
// 4. Save and deploy as v28
// ============================================================================

// ---------- ADD TO doGet() FUNCTION ----------
// Add these cases inside your existing doGet() function:

/*
  if (action === 'checkQuizEligibility') {
    const email = e.parameter.email;
    const result = checkQuizEligibility(email);
    return jsonResponse(result);
  }

  if (action === 'getQuizQuestion') {
    const email = e.parameter.email;
    const sessionId = e.parameter.sessionId;
    const result = getQuizQuestion(email, sessionId);
    return jsonResponse(result);
  }
*/

// ---------- ADD TO doPost() FUNCTION ----------
// Add this case inside your existing doPost() function:

/*
  if (data.action === 'submitQuizAnswer') {
    const result = submitQuizAnswer(data);
    return jsonResponse(result);
  }
*/

// ============================================================================
// QUIZ HELPER FUNCTIONS - Add these at the bottom of your script
// ============================================================================

function getQuizSettings() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settingsSheet = ss.getSheetByName('Quiz Settings');

  if (!settingsSheet) {
    return {
      maxDailyAttempts: 5,
      maxDailyPoints: 5,
      questionTimeLimit: 60,
      cooldownMinutes: 5,
      pointsPerCorrect: 1,
      aiEnabled: false
    };
  }

  const data = settingsSheet.getDataRange().getValues();
  const settings = {};

  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];

    if (key === 'Max Daily Attempts') settings.maxDailyAttempts = Number(value);
    if (key === 'Max Daily Points') settings.maxDailyPoints = Number(value);
    if (key === 'Question Time Limit') settings.questionTimeLimit = Number(value);
    if (key === 'Cooldown Minutes') settings.cooldownMinutes = Number(value);
    if (key === 'Points Per Correct') settings.pointsPerCorrect = Number(value);
    if (key === 'AI Enabled') settings.aiEnabled = (value === true || value === 'TRUE');
  }

  return settings;
}

function checkQuizEligibility(email) {
  if (!email || !email.includes('@')) {
    return { status: 'error', message: 'Invalid email' };
  }

  const settings = getQuizSettings();
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const logSheet = ss.getSheetByName('Quiz Log');

  if (!logSheet) {
    return {
      status: 'success',
      allowed: true,
      attemptsRemaining: settings.maxDailyAttempts,
      pointsToday: 0
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = logSheet.getDataRange().getValues();
  let attemptsToday = 0;
  let pointsToday = 0;
  let lastAttemptTime = null;

  for (let i = data.length - 1; i >= 1; i--) {
    const rowEmail = data[i][1];
    const rowTime = new Date(data[i][0]);

    if (rowEmail === email && rowTime >= today) {
      attemptsToday++;
      pointsToday += Number(data[i][7]) || 0;

      if (!lastAttemptTime || rowTime > lastAttemptTime) {
        lastAttemptTime = rowTime;
      }
    }
  }

  // Check daily limits
  if (attemptsToday >= settings.maxDailyAttempts) {
    return {
      status: 'error',
      message: `You've reached your daily limit of ${settings.maxDailyAttempts} questions. Try again tomorrow!`
    };
  }

  if (pointsToday >= settings.maxDailyPoints) {
    return {
      status: 'error',
      message: `You've earned the maximum ${settings.maxDailyPoints} points today. Try again tomorrow!`
    };
  }

  // Check cooldown
  if (lastAttemptTime) {
    const minutesSince = (new Date() - lastAttemptTime) / 1000 / 60;
    if (minutesSince < settings.cooldownMinutes) {
      const waitTime = Math.ceil(settings.cooldownMinutes - minutesSince);
      return {
        status: 'error',
        message: `Please wait ${waitTime} more minute(s) before trying again.`
      };
    }
  }

  return {
    status: 'success',
    allowed: true,
    attemptsRemaining: settings.maxDailyAttempts - attemptsToday,
    pointsToday: pointsToday
  };
}

function getQuizQuestion(email, sessionId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const questionsSheet = ss.getSheetByName('Quiz Questions');

  if (!questionsSheet) {
    return {
      status: 'error',
      message: 'Quiz questions not configured. Please contact an administrator.'
    };
  }

  const settings = getQuizSettings();

  // Get all active questions
  const data = questionsSheet.getDataRange().getValues();
  const activeQuestions = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const active = (row[9] === true || row[9] === 'TRUE');

    if (active && row[0] && row[1]) {
      activeQuestions.push({
        id: row[0],
        question: row[1],
        optionA: row[2],
        optionB: row[3],
        optionC: row[4],
        optionD: row[5],
        correct: row[6],
        difficulty: row[7],
        category: row[8]
      });
    }
  }

  if (activeQuestions.length === 0) {
    return {
      status: 'error',
      message: 'No questions available. Please contact an administrator.'
    };
  }

  // Get recently asked questions for this student
  const logSheet = ss.getSheetByName('Quiz Log');
  const recentQuestions = new Set();

  if (logSheet && logSheet.getLastRow() > 1) {
    const logData = logSheet.getDataRange().getValues();

    for (let i = logData.length - 1; i >= 1 && i >= logData.length - 20; i--) {
      if (logData[i][1] === email) {
        recentQuestions.add(logData[i][2]);
      }
    }
  }

  // Filter out recently asked questions
  let availableQuestions = activeQuestions.filter(q => !recentQuestions.has(q.id));

  // If all questions were recent, use all questions
  if (availableQuestions.length === 0) {
    availableQuestions = activeQuestions;
  }

  // Pick random question
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const question = availableQuestions[randomIndex];

  return {
    status: 'success',
    question: question,
    timeLimit: settings.questionTimeLimit,
    sessionId: sessionId
  };
}

function submitQuizAnswer(data) {
  const email = data.email;
  const questionId = data.questionId;
  const answer = data.answer;
  const timeTaken = data.timeTaken;
  const sessionId = data.sessionId;

  const settings = getQuizSettings();
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Verify time limit (anti-cheat)
  if (timeTaken > settings.questionTimeLimit + 5) {
    return {
      status: 'error',
      message: 'Time limit exceeded. Answer not recorded.'
    };
  }

  // Get correct answer
  const questionsSheet = ss.getSheetByName('Quiz Questions');
  const questionsData = questionsSheet.getDataRange().getValues();

  let correctAnswer = null;
  let questionText = '';
  let fullCorrectAnswer = '';

  for (let i = 1; i < questionsData.length; i++) {
    if (questionsData[i][0] === questionId) {
      correctAnswer = questionsData[i][6];
      questionText = questionsData[i][1];

      // Get full text of correct answer
      const answerMap = {
        'A': questionsData[i][2],
        'B': questionsData[i][3],
        'C': questionsData[i][4],
        'D': questionsData[i][5]
      };
      fullCorrectAnswer = answerMap[correctAnswer];
      break;
    }
  }

  if (!correctAnswer) {
    return {
      status: 'error',
      message: 'Question not found.'
    };
  }

  const isCorrect = (answer === correctAnswer);
  const pointsAwarded = isCorrect ? settings.pointsPerCorrect : 0;

  // Log the attempt
  const logSheet = ss.getSheetByName('Quiz Log');
  logSheet.appendRow([
    new Date(),
    email,
    questionId,
    questionText,
    answer,
    correctAnswer,
    isCorrect,
    pointsAwarded,
    timeTaken,
    sessionId
  ]);

  // Award points if correct
  if (isCorrect) {
    // Get student's house
    const rosterSheet = ss.getSheetByName('Student Roster');
    const rosterData = rosterSheet.getDataRange().getValues();
    let studentHouse = 'Unknown';

    for (let i = 1; i < rosterData.length; i++) {
      if (rosterData[i][2] === email) {
        studentHouse = rosterData[i][3];
        break;
      }
    }

    // Log points
    if (studentHouse !== 'Unknown') {
      logPoints({
        teacher: 'Quiz System',
        student: email,
        house: studentHouse,
        category: 'Quiz: Correct Answer',
        points: pointsAwarded
      });
    }
  }

  // Check remaining attempts
  const eligibility = checkQuizEligibility(email);

  return {
    status: 'success',
    isCorrect: isCorrect,
    correctAnswer: isCorrect ? null : `${correctAnswer}. ${fullCorrectAnswer}`,
    pointsAwarded: pointsAwarded,
    timeTaken: timeTaken,
    attemptsRemaining: eligibility.attemptsRemaining || 0,
    pointsToday: (eligibility.pointsToday || 0) + pointsAwarded
  };
}

// ============================================================================
// FUTURE: GEMINI AI INTEGRATION
// ============================================================================
// When you're ready to add AI-generated questions, add this function:

/*
function generateAIQuestion(category, difficulty) {
  const settings = getQuizSettings();

  if (!settings.aiEnabled) {
    return null;
  }

  const apiKey = settings.geminiApiKey;
  if (!apiKey) {
    return null;
  }

  const prompt = `Generate a ${difficulty} difficulty multiple choice question about ${category}.

  Format your response as JSON:
  {
    "question": "Your question here?",
    "optionA": "First option",
    "optionB": "Second option",
    "optionC": "Third option",
    "optionD": "Fourth option",
    "correct": "A",
    "explanation": "Brief explanation of the answer"
  }

  Make the question challenging but fair for students.`;

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: {
        'x-goog-api-key': apiKey
      }
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    // Parse Gemini response
    const generatedText = result.candidates[0].content.parts[0].text;
    const questionData = JSON.parse(generatedText);

    // Store AI question in Quiz Questions sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const questionsSheet = ss.getSheetByName('Quiz Questions');

    const questionId = 'AI-' + Date.now();
    questionsSheet.appendRow([
      questionId,
      questionData.question,
      questionData.optionA,
      questionData.optionB,
      questionData.optionC,
      questionData.optionD,
      questionData.correct,
      difficulty,
      category,
      true,
      'AI-Generated'
    ]);

    return questionData;
  } catch (error) {
    Logger.log('AI question generation failed: ' + error.toString());
    return null;
  }
}
*/
