// ============================================================================
// IESV HOUSE POINTS SYSTEM - COMPLETE APPS SCRIPT
// ============================================================================

// REPLACE THIS WITH YOUR ACTUAL GOOGLE SHEET ID
const SHEET_ID = 'YOUR_SHEET_ID_HERE';

// ============================================================================
// MAIN HANDLERS
// ============================================================================

function doGet(e) {
  const action = e.parameter.action;

  // House Points Actions
  if (action === 'houseTotals') {
    return jsonResponse(getHouseTotals());
  }

  if (action === 'recentPoints') {
    const limit = parseInt(e.parameter.limit) || 50;
    return jsonResponse(getRecentPoints(limit));
  }

  if (action === 'listStudents') {
    return jsonResponse(listStudents());
  }

  if (action === 'getResetStatus') {
    const status = getResetStatus();
    return jsonResponse(status);
  }

  // Quiz Actions
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

  if (action === 'getQuizLeaderboard') {
    const result = getQuizLeaderboard();
    return jsonResponse(result);
  }

  if (action === 'getQuizStudentStats') {
    const result = getQuizStudentStats();
    return jsonResponse(result);
  }

  if (action === 'getQuizSettings') {
    const result = getQuizSettings();
    return jsonResponse({ status: 'success', settings: result });
  }

  if (action === 'getQuizPointsByHouse') {
    const result = getQuizPointsByHouse();
    return jsonResponse(result);
  }

  return jsonResponse({ status: 'error', message: 'Invalid action' });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  // House Points Actions
  if (data.action === 'logPoints') {
    const result = logPoints(data);
    return jsonResponse(result);
  }

  if (data.action === 'setResetStatus') {
    const result = setResetStatus(data.enabled);
    return jsonResponse(result);
  }

  // Quiz Actions
  if (data.action === 'submitQuizAnswer') {
    const result = submitQuizAnswer(data);
    return jsonResponse(result);
  }

  if (data.action === 'updateQuizSettings') {
    const result = updateQuizSettings(data.settings);
    return jsonResponse(result);
  }

  return jsonResponse({ status: 'error', message: 'Invalid action' });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// HOUSE POINTS FUNCTIONS
// ============================================================================

function getHouseTotals() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('House Totals');

  if (!sheet) {
    return { status: 'error', message: 'House Totals sheet not found' };
  }

  const data = sheet.getRange('A2:E5').getValues();

  const houses = data.map(row => ({
    house: row[0],
    totalPoints: row[1],
    peopleCount: row[2],
    houseScore: row[3],
    rank: row[4]
  }));

  return {
    status: 'success',
    data: { houses: houses }
  };
}

function getRecentPoints(limit) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Points Log');

  if (!sheet) {
    return { status: 'error', message: 'Points Log sheet not found' };
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { status: 'success', data: { entries: [] } };
  }

  const startRow = Math.max(2, lastRow - limit + 1);
  const numRows = lastRow - startRow + 1;
  const data = sheet.getRange(startRow, 1, numRows, 6).getValues();

  const entries = data.map(row => ({
    timestamp: row[0],
    teacher: row[1],
    student: row[2],
    house: row[3],
    category: row[4],
    points: row[5]
  })).reverse();

  return {
    status: 'success',
    data: { entries: entries }
  };
}

function listStudents() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Student Roster');

  if (!sheet) {
    return { status: 'error', message: 'Student Roster not found' };
  }

  const data = sheet.getDataRange().getValues();
  const students = [];

  for (let i = 1; i < data.length; i++) {
    students.push({
      firstName: data[i][0],
      lastName: data[i][1],
      email: data[i][2],
      house: data[i][3]
    });
  }

  return { students: students };
}

function logPoints(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const logSheet = ss.getSheetByName('Points Log');

  if (!logSheet) {
    return { status: 'error', message: 'Points Log not found' };
  }

  logSheet.appendRow([
    new Date(),
    data.teacher,
    data.student,
    data.house,
    data.category,
    data.points
  ]);

  return { status: 'success', message: 'Points logged successfully' };
}

function getResetStatus() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let settingsSheet = ss.getSheetByName('Settings');

  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('Settings');
    settingsSheet.getRange('A1').setValue('Reset Enabled');
    settingsSheet.getRange('B1').setValue(false);
    settingsSheet.getRange('A2').setValue('Last Reset Date');
    settingsSheet.getRange('B2').setValue('');
  }

  const resetEnabled = settingsSheet.getRange('B1').getValue();
  const lastResetDate = settingsSheet.getRange('B2').getValue();

  return {
    resetEnabled: resetEnabled === true || resetEnabled === 'TRUE',
    lastResetDate: lastResetDate
  };
}

function setResetStatus(enabled) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let settingsSheet = ss.getSheetByName('Settings');

  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('Settings');
    settingsSheet.getRange('A1').setValue('Reset Enabled');
    settingsSheet.getRange('A2').setValue('Last Reset Date');
  }

  settingsSheet.getRange('B1').setValue(enabled);

  return { success: true, enabled: enabled };
}

// ============================================================================
// QUIZ SYSTEM FUNCTIONS
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

function updateQuizSettings(newSettings) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let settingsSheet = ss.getSheetByName('Quiz Settings');

  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('Quiz Settings');
    settingsSheet.getRange('A1:C1').setValues([['Setting Name', 'Value', 'Description']]);
    settingsSheet.getRange('A1:C1').setFontWeight('bold');

    settingsSheet.appendRow(['Max Daily Attempts', 5, 'Maximum questions per student per day']);
    settingsSheet.appendRow(['Max Daily Points', 5, 'Maximum points a student can earn per day']);
    settingsSheet.appendRow(['Question Time Limit', 60, 'Seconds allowed to answer each question']);
    settingsSheet.appendRow(['Cooldown Minutes', 5, 'Minutes between quiz attempts']);
    settingsSheet.appendRow(['Points Per Correct', 1, 'Points awarded for correct answer']);
    settingsSheet.appendRow(['AI Enabled', false, 'Enable Gemini AI question generation']);
  }

  const data = settingsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const settingName = data[i][0];

    if (settingName === 'Max Daily Attempts' && newSettings.maxDailyAttempts !== undefined) {
      settingsSheet.getRange(i + 1, 2).setValue(newSettings.maxDailyAttempts);
    }
    if (settingName === 'Cooldown Minutes' && newSettings.cooldownMinutes !== undefined) {
      settingsSheet.getRange(i + 1, 2).setValue(newSettings.cooldownMinutes);
    }
    if (settingName === 'Question Time Limit' && newSettings.questionTimeLimit !== undefined) {
      settingsSheet.getRange(i + 1, 2).setValue(newSettings.questionTimeLimit);
    }
    if (settingName === 'Points Per Correct' && newSettings.pointsPerCorrect !== undefined) {
      settingsSheet.getRange(i + 1, 2).setValue(newSettings.pointsPerCorrect);
    }
    if (settingName === 'Max Daily Points' && newSettings.maxDailyPoints !== undefined) {
      settingsSheet.getRange(i + 1, 2).setValue(newSettings.maxDailyPoints);
    }
  }

  return {
    status: 'success',
    message: 'Quiz settings updated successfully'
  };
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
  const data = questionsSheet.getDataRange().getValues();
  const activeQuestions = [];

  // Check if user is staff (no .student. in email)
  const isStaff = email && email.includes('@engelska.se') && !email.includes('.student.');

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const active = (row[9] === true || row[9] === 'TRUE');

    if (active && row[0] && row[1]) {
      const difficulty = row[7] ? row[7].toString().trim() : '';

      // Staff members only get HARD difficulty questions
      if (isStaff && difficulty.toLowerCase() !== 'hard') {
        continue; // Skip non-hard questions for staff
      }

      activeQuestions.push({
        id: row[0],
        question: row[1],
        optionA: row[2],
        optionB: row[3],
        optionC: row[4],
        optionD: row[5],
        // correct: row[6],  // Security: Do not send correct answer to client
        difficulty: difficulty,
        category: row[8]
      });
    }
  }

  if (activeQuestions.length === 0) {
    return {
      status: 'error',
      message: isStaff
        ? 'No HARD difficulty questions available. Please contact an administrator.'
        : 'No questions available. Please contact an administrator.'
    };
  }

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

  let availableQuestions = activeQuestions.filter(q => !recentQuestions.has(q.id));

  if (availableQuestions.length === 0) {
    availableQuestions = activeQuestions;
  }

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

  if (timeTaken > settings.questionTimeLimit + 5) {
    return {
      status: 'error',
      message: 'Time limit exceeded. Answer not recorded.'
    };
  }

  const questionsSheet = ss.getSheetByName('Quiz Questions');
  const questionsData = questionsSheet.getDataRange().getValues();

  let correctAnswer = null;
  let questionText = '';
  let fullCorrectAnswer = '';

  for (let i = 1; i < questionsData.length; i++) {
    if (questionsData[i][0] === questionId) {
      correctAnswer = questionsData[i][6];
      questionText = questionsData[i][1];

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
    const rosterSheet = ss.getSheetByName('Student Roster');
    const rosterData = rosterSheet.getDataRange().getValues();
    let studentHouse = 'Unknown';

    for (let i = 1; i < rosterData.length; i++) {
      if (rosterData[i][2] === email) {
        studentHouse = rosterData[i][3];
        break;
      }
    }

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

  // Calculate remaining attempts AFTER logging this attempt
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const logData = logSheet.getDataRange().getValues();

  let attemptsToday = 0;
  let pointsToday = 0;

  for (let i = logData.length - 1; i >= 1; i--) {
    const rowEmail = logData[i][1];
    const rowTime = new Date(logData[i][0]);

    if (rowEmail === email && rowTime >= today) {
      attemptsToday++;
      pointsToday += Number(logData[i][7]) || 0;
    }
  }

  const attemptsRemaining = settings.maxDailyAttempts - attemptsToday;

  return {
    status: 'success',
    isCorrect: isCorrect,
    correctAnswer: isCorrect ? null : `${correctAnswer}. ${fullCorrectAnswer}`,
    pointsAwarded: pointsAwarded,
    timeTaken: timeTaken,
    attemptsRemaining: Math.max(0, attemptsRemaining),
    pointsToday: pointsToday
  };
}

function getQuizLeaderboard() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const quizLog = ss.getSheetByName('Quiz Log');
  const rosterSheet = ss.getSheetByName('Student Roster');

  if (!quizLog || quizLog.getLastRow() <= 1) {
    return {
      status: 'success',
      houses: [],
      globalStats: { totalQuestions: 0, totalCorrect: 0, avgAccuracy: 0 }
    };
  }

  const logData = quizLog.getRange(2, 1, quizLog.getLastRow() - 1, quizLog.getLastColumn()).getValues();
  const rosterData = rosterSheet ? rosterSheet.getDataRange().getValues() : [];

  const houseStats = {
    Phoenix: { totalAttempts: 0, correctAnswers: 0, totalPoints: 0 },
    Dragon: { totalAttempts: 0, correctAnswers: 0, totalPoints: 0 },
    Hydra: { totalAttempts: 0, correctAnswers: 0, totalPoints: 0 },
    Griffin: { totalAttempts: 0, correctAnswers: 0, totalPoints: 0 }
  };

  let totalQuestions = 0;
  let totalCorrect = 0;

  logData.forEach(row => {
    const email = row[1];
    const isCorrect = row[6];
    const points = row[7];

    totalQuestions++;
    if (isCorrect) totalCorrect++;

    for (let i = 1; i < rosterData.length; i++) {
      if (rosterData[i][2] === email) {
        const house = rosterData[i][3];
        if (houseStats[house]) {
          houseStats[house].totalAttempts++;
          if (isCorrect) {
            houseStats[house].correctAnswers++;
            houseStats[house].totalPoints += points;
          }
        }
        break;
      }
    }
  });

  const housesArray = Object.entries(houseStats)
    .map(([house, stats]) => ({
      house: house,
      totalAttempts: stats.totalAttempts,
      correctAnswers: stats.correctAnswers,
      totalPoints: stats.totalPoints,
      accuracy: stats.totalAttempts > 0 ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) : 0
    }))
    .filter(h => h.totalAttempts > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    status: 'success',
    houses: housesArray,
    globalStats: {
      totalQuestions: totalQuestions,
      totalCorrect: totalCorrect,
      avgAccuracy: avgAccuracy
    }
  };
}

function getQuizStudentStats() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const quizLog = ss.getSheetByName('Quiz Log');
  const rosterSheet = ss.getSheetByName('Student Roster');

  if (!quizLog || quizLog.getLastRow() <= 1) {
    return {
      status: 'success',
      students: []
    };
  }

  const logData = quizLog.getRange(2, 1, quizLog.getLastRow() - 1, quizLog.getLastColumn()).getValues();
  const rosterData = rosterSheet ? rosterSheet.getDataRange().getValues() : [];

  const studentStats = {};

  logData.forEach(row => {
    const email = row[1];
    const isCorrect = row[6];

    if (!studentStats[email]) {
      studentStats[email] = {
        email: email,
        name: 'Unknown',
        house: 'Unknown',
        totalAttempts: 0,
        correctAnswers: 0
      };

      for (let i = 1; i < rosterData.length; i++) {
        if (rosterData[i][2] === email) {
          studentStats[email].name = `${rosterData[i][0]} ${rosterData[i][1]}`;
          studentStats[email].house = rosterData[i][3];
          break;
        }
      }
    }

    studentStats[email].totalAttempts++;
    if (isCorrect) {
      studentStats[email].correctAnswers++;
    }
  });

  const studentsArray = Object.values(studentStats)
    .map(student => ({
      name: student.name,
      house: student.house,
      totalAttempts: student.totalAttempts,
      correctAnswers: student.correctAnswers,
      accuracy: student.totalAttempts > 0
        ? Math.round((student.correctAnswers / student.totalAttempts) * 100)
        : 0
    }))
    .sort((a, b) => b.correctAnswers - a.correctAnswers);

  return {
    status: 'success',
    students: studentsArray
  };
}

function getQuizPointsByHouse() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const quizLog = ss.getSheetByName('Quiz Log');
  const rosterSheet = ss.getSheetByName('Student Roster');

  if (!quizLog || quizLog.getLastRow() <= 1) {
    return {
      status: 'success',
      houses: {
        Phoenix: 0,
        Dragon: 0,
        Hydra: 0,
        Griffin: 0
      }
    };
  }

  const logData = quizLog.getRange(2, 1, quizLog.getLastRow() - 1, quizLog.getLastColumn()).getValues();
  const rosterData = rosterSheet ? rosterSheet.getDataRange().getValues() : [];

  const housePoints = {
    Phoenix: 0,
    Dragon: 0,
    Hydra: 0,
    Griffin: 0
  };

  logData.forEach(row => {
    const email = row[1];
    const points = row[7] || 0;

    // Find student's house
    for (let i = 1; i < rosterData.length; i++) {
      if (rosterData[i][2] === email) {
        const house = rosterData[i][3];
        if (housePoints[house] !== undefined) {
          housePoints[house] += points;
        }
        break;
      }
    }
  });

  return {
    status: 'success',
    houses: housePoints
  };
}
