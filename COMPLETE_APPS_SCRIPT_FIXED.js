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

  // Canvas Actions
  if (action === 'getCanvasState') {
    const result = getCanvasState();
    return jsonResponse(result);
  }

  if (action === 'getCanvasStats') {
    const result = getCanvasStats();
    return jsonResponse(result);
  }

  if (action === 'getStudentCanvasStatus') {
    const email = e.parameter.email;
    const result = getStudentCanvasStatus(email);
    return jsonResponse(result);
  }

  if (action === 'getCanvasRecentActivity') {
    const limit = parseInt(e.parameter.limit) || 10;
    const result = getCanvasRecentActivity(limit);
    return jsonResponse(result);
  }

  if (action === 'getCanvasLeaderboard') {
    const password = e.parameter.password;
    const result = getCanvasLeaderboard(password);
    return jsonResponse(result);
  }

  if (action === 'getCanvasSettings') {
    const result = getCanvasSettings();
    return jsonResponse({ status: 'success', settings: result });
  }

  if (action === 'getCanvasWinnerStatus') {
    const result = getCanvasWinnerStatus();
    return jsonResponse(result);
  }

  if (action === 'getPreviousWinners') {
    const result = getPreviousWinners();
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

  // Canvas Actions
  if (data.action === 'placePixel') {
    const result = placePixel(data);
    return jsonResponse(result);
  }

  if (data.action === 'wipeCanvas') {
    const result = wipeCanvas(data.password);
    return jsonResponse(result);
  }

  if (data.action === 'extendCampaign') {
    const result = extendCampaign(data.newEndDate, data.password);
    return jsonResponse(result);
  }

  if (data.action === 'updateCanvasSettings') {
    const result = updateCanvasSettings(data.settings, data.password);
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

// ============================================================================
// CANVAS SYSTEM - Mondrian-Style Block War
// ============================================================================

/**
 * Generate Mondrian-style layout with ~400 blocks
 * Uses recursive subdivision algorithm
 */
function generateMondrianLayout() {
  const canvasWidth = 1000;  // Virtual canvas dimensions
  const canvasHeight = 1000;
  const targetBlocks = 400;
  const minSize = 25;  // Minimum block size (reduced to allow 400 blocks)

  const blocks = [];
  let blockId = 0;

  // Start with full canvas
  const queue = [{
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
    depth: 0
  }];

  while (blocks.length + queue.length < targetBlocks && queue.length > 0) {
    // Sort queue by size (larger first) to ensure good mix
    queue.sort((a, b) => (b.width * b.height) - (a.width * a.height));

    const rect = queue.shift();

    // Decide if this should be split or kept as a block
    const remaining = targetBlocks - (blocks.length + queue.length);
    const canSplitH = rect.height >= minSize * 2;
    const canSplitV = rect.width >= minSize * 2;

    // Force split if we need more blocks and can still split
    const needMoreBlocks = remaining > 0;
    const canSplit = canSplitH || canSplitV;

    // Probability of splitting - higher when we need more blocks
    const progress = blocks.length / targetBlocks;
    const splitProb = needMoreBlocks ? Math.max(0.7, 1 - (progress * 0.3)) : 0;
    const shouldSplit = canSplit && (Math.random() < splitProb || remaining > 1);

    if (!shouldSplit || !canSplit) {
      // Keep as block
      blocks.push({
        id: blockId++,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      });
    } else {
      // Decide split direction - prefer the dimension that can be split
      let splitHorizontal;
      if (canSplitH && canSplitV) {
        // Both directions possible - choose based on aspect ratio
        splitHorizontal = rect.height > rect.width;
        // Add randomness
        if (Math.random() < 0.3) splitHorizontal = !splitHorizontal;
      } else {
        splitHorizontal = canSplitH;
      }

      if (splitHorizontal) {
        // Split horizontally
        const minSplitY = rect.y + minSize;
        const maxSplitY = rect.y + rect.height - minSize;
        const splitY = Math.floor(minSplitY + Math.random() * (maxSplitY - minSplitY));

        queue.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: splitY - rect.y,
          depth: rect.depth + 1
        });

        queue.push({
          x: rect.x,
          y: splitY,
          width: rect.width,
          height: rect.y + rect.height - splitY,
          depth: rect.depth + 1
        });
      } else {
        // Split vertically
        const minSplitX = rect.x + minSize;
        const maxSplitX = rect.x + rect.width - minSize;
        const splitX = Math.floor(minSplitX + Math.random() * (maxSplitX - minSplitX));

        queue.push({
          x: rect.x,
          y: rect.y,
          width: splitX - rect.x,
          height: rect.height,
          depth: rect.depth + 1
        });

        queue.push({
          x: splitX,
          y: rect.y,
          width: rect.x + rect.width - splitX,
          height: rect.height,
          depth: rect.depth + 1
        });
      }
    }
  }

  // Add all remaining queue items as blocks
  while (queue.length > 0) {
    const rect = queue.shift();
    blocks.push({
      id: blockId++,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });
  }

  Logger.log(`Generated ${blocks.length} blocks for Mondrian layout`);

  return blocks;
}

/**
 * Generate Mondrian layout and map to grid coordinates
 * This creates the complete layout that will be used by all users
 */
function generateMondrianLayoutWithMapping(gridWidth, gridHeight) {
  const blocks = generateMondrianLayout();

  // Create list of all grid coordinates
  const gridCoords = [];
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      gridCoords.push({ row, col });
    }
  }

  // Shuffle grid coordinates randomly
  gridCoords.sort(() => Math.random() - 0.5);

  // Assign each block to a grid coordinate
  blocks.forEach((block, index) => {
    if (index < gridCoords.length) {
      const coord = gridCoords[index];
      block.row = coord.row;
      block.col = coord.col;
    }
  });

  return blocks;
}

/**
 * Initialize Canvas sheets (run this once to set up)
 */
function initializeCanvasSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Canvas State sheet
  let canvasState = ss.getSheetByName('Canvas State');
  if (!canvasState) {
    canvasState = ss.insertSheet('Canvas State');
    canvasState.appendRow(['Row', 'Col', 'Color', 'PlacedBy', 'PlacedAt', 'House', 'StudentName']);
    canvasState.getRange('A1:G1').setFontWeight('bold').setBackground('#4a86e8');
  }

  // Canvas Settings sheet
  let canvasSettings = ss.getSheetByName('Canvas Settings');
  if (!canvasSettings) {
    canvasSettings = ss.insertSheet('Canvas Settings');
    canvasSettings.appendRow(['Setting', 'Value']);
    canvasSettings.getRange('A1:B1').setFontWeight('bold').setBackground('#4a86e8');

    // Default settings - 20x20 grid = 400 blocks
    // Generate initial Mondrian layout
    const mondrianLayout = generateMondrianLayoutWithMapping(20, 20);

    const defaults = [
      ['canvasWidth', 20],
      ['canvasHeight', 20],
      ['pixelSize', 30],
      ['cooldownMinutes', 60],
      ['pointCostPerPixel', 1],
      ['campaignStartDate', new Date()],
      ['campaignEndDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)], // 7 days from now
      ['canvasActive', 'TRUE'],
      ['allowOverwrite', 'FALSE'],
      ['allowBlackOverwrite', 'FALSE'],
      ['showCountdown', 'TRUE'],
      ['happyHourActive', 'FALSE'],
      ['happyHourPixelsAllowed', 5],
      ['leaderboardPassword', 'canvas2025'],
      ['adminPassword', 'admin2025'],
      ['mondrianLayout', JSON.stringify(mondrianLayout)]
    ];

    defaults.forEach(row => canvasSettings.appendRow(row));
  }

  // Canvas Activity Log sheet
  let canvasLog = ss.getSheetByName('Canvas Activity Log');
  if (!canvasLog) {
    canvasLog = ss.insertSheet('Canvas Activity Log');
    canvasLog.appendRow(['Timestamp', 'Email', 'Name', 'House', 'Row', 'Col', 'Color', 'PointsSpent', 'SessionId']);
    canvasLog.getRange('A1:I1').setFontWeight('bold').setBackground('#4a86e8');
  }

  // Canvas History sheet
  let canvasHistory = ss.getSheetByName('Canvas History');
  if (!canvasHistory) {
    canvasHistory = ss.insertSheet('Canvas History');
    canvasHistory.appendRow(['CampaignEndDate', 'WinningHouse', 'WinningPercentage', 'TotalPixels', 'Phoenix%', 'Dragon%', 'Hydra%', 'Griffin%', 'Staff%']);
    canvasHistory.getRange('A1:I1').setFontWeight('bold').setBackground('#4a86e8');
  }

  return { status: 'success', message: 'Canvas sheets initialized successfully!' };
}

/**
 * Get Canvas settings
 */
function getCanvasSettings() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settingsSheet = ss.getSheetByName('Canvas Settings');

  if (!settingsSheet) {
    return {
      canvasWidth: 100,
      canvasHeight: 100,
      pixelSize: 8,
      cooldownMinutes: 60,
      pointCostPerPixel: 1,
      campaignStartDate: new Date(),
      campaignEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      canvasActive: true,
      allowOverwrite: false,
      allowBlackOverwrite: false,
      showCountdown: true,
      happyHourActive: false,
      happyHourPixelsAllowed: 5
    };
  }

  const data = settingsSheet.getDataRange().getValues();
  const settings = {};

  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    let value = data[i][1];

    if (value === 'TRUE') value = true;
    if (value === 'FALSE') value = false;
    if (key.includes('Date') && value) value = new Date(value);

    // Parse Mondrian layout JSON
    if (key === 'mondrianLayout' && value) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        Logger.log('Error parsing mondrianLayout: ' + e);
        // Generate new layout if parsing fails
        value = generateMondrianLayoutWithMapping(settings.canvasWidth || 20, settings.canvasHeight || 20);
      }
    }

    settings[key] = value;
  }

  return settings;
}

/**
 * Get current canvas state (all placed pixels)
 */
function getCanvasState() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const canvasSheet = ss.getSheetByName('Canvas State');
  const settings = getCanvasSettings();

  if (!canvasSheet || canvasSheet.getLastRow() <= 1) {
    return {
      status: 'success',
      pixels: [],
      settings: {
        width: settings.canvasWidth,
        height: settings.canvasHeight,
        pixelSize: settings.pixelSize,
        mondrianLayout: settings.mondrianLayout
      }
    };
  }

  const data = canvasSheet.getRange(2, 1, canvasSheet.getLastRow() - 1, 7).getValues();
  const pixels = data.map(row => ({
    row: row[0],
    col: row[1],
    color: row[2],
    placedBy: row[3],
    placedAt: row[4],
    house: row[5],
    studentName: row[6]
  }));

  return {
    status: 'success',
    pixels: pixels,
    settings: {
      width: settings.canvasWidth,
      height: settings.canvasHeight,
      pixelSize: settings.pixelSize,
      mondrianLayout: settings.mondrianLayout
    }
  };
}

/**
 * Calculate student's available point balance
 */
function getStudentPointBalance(email, studentName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const pointsLog = ss.getSheetByName('Points Log');
  const canvasLog = ss.getSheetByName('Canvas Activity Log');

  let earnedPoints = 0;
  let spentPoints = 0;

  // Normalize email and name for consistent comparison throughout function
  const emailLower = email.toLowerCase().trim();
  const nameLower = studentName ? studentName.toLowerCase().trim() : '';

  // Calculate earned points from Points Log
  if (pointsLog && pointsLog.getLastRow() > 1) {
    const pointsData = pointsLog.getDataRange().getValues();
    for (let i = 1; i < pointsData.length; i++) {
      const rowStudent = pointsData[i][2]; // Column C = Student (could be email OR name)
      const rowPoints = pointsData[i][5]; // Column F = Points

      if (!rowStudent) continue;

      const rowStudentStr = rowStudent.toString().toLowerCase().trim();

      // Check multiple matching strategies:
      // 1. Exact email match
      const exactEmailMatch = rowStudentStr === emailLower;

      // 2. Exact name match (First Last format)
      const exactNameMatch = nameLower && rowStudentStr === nameLower;

      // 3. Column C contains the email
      const containsEmail = rowStudentStr.includes(emailLower);

      // 4. Column C contains the name
      const containsName = nameLower && rowStudentStr.includes(nameLower);

      // 5. Email contains what's in Column C (handles "barry.shaw" matching "barry.shaw.vasteras@engelska.se")
      const emailContainsValue = emailLower.includes(rowStudentStr);

      // 6. Name contains what's in Column C
      const nameContainsValue = nameLower && nameLower.includes(rowStudentStr);

      // If any match strategy succeeds, add points
      if (exactEmailMatch || exactNameMatch || containsEmail || containsName || emailContainsValue || nameContainsValue) {
        // Ignore N/A values and convert to number
        if (rowPoints !== 'N/A' && rowPoints !== null && rowPoints !== undefined && rowPoints !== '') {
          const points = Number(rowPoints);
          if (!isNaN(points)) {
            earnedPoints += points;
          }
        }
      }
    }
  }

  // Calculate spent points from Canvas Activity Log
  if (canvasLog && canvasLog.getLastRow() > 1) {
    const canvasData = canvasLog.getDataRange().getValues();
    for (let i = 1; i < canvasData.length; i++) {
      const rowEmail = canvasData[i][1]; // Column B = Email
      if (rowEmail && rowEmail.toString().toLowerCase().trim() === emailLower) {
        spentPoints += Number(canvasData[i][7]) || 0; // Column H = PointsSpent
      }
    }
  }

  return earnedPoints - spentPoints;
}

/**
 * Check if student is on cooldown
 */
function checkCanvasCooldown(email, settings) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const canvasLog = ss.getSheetByName('Canvas Activity Log');

  if (!canvasLog || canvasLog.getLastRow() <= 1) {
    return { onCooldown: false, minutesRemaining: 0 };
  }

  const logData = canvasLog.getDataRange().getValues();
  const now = new Date();

  // Find most recent placement by this student
  for (let i = logData.length - 1; i >= 1; i--) {
    if (logData[i][1] === email) {
      const lastPlacement = new Date(logData[i][0]);
      const minutesSince = (now - lastPlacement) / (1000 * 60);

      if (minutesSince < settings.cooldownMinutes) {
        return {
          onCooldown: true,
          minutesRemaining: Math.ceil(settings.cooldownMinutes - minutesSince),
          lastPlacement: lastPlacement
        };
      }
      break;
    }
  }

  return { onCooldown: false, minutesRemaining: 0 };
}

/**
 * Get student's canvas status (cooldown, points, etc.)
 */
function getStudentCanvasStatus(email) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settings = getCanvasSettings();
  const rosterSheet = ss.getSheetByName('Student Roster');

  // Get student info
  let studentName = '';
  let house = '';
  let isStaff = false;

  if (rosterSheet) {
    const rosterData = rosterSheet.getDataRange().getValues();
    const emailLower = email.toLowerCase().trim();

    for (let i = 1; i < rosterData.length; i++) {
      const rosterEmail = rosterData[i][2]; // Column C = Email

      // Flexible email matching (case-insensitive, trimmed)
      if (rosterEmail && rosterEmail.toString().toLowerCase().trim() === emailLower) {
        studentName = `${rosterData[i][0]} ${rosterData[i][1]}`; // First Last
        house = rosterData[i][3]; // Column D = House
        break;
      }
    }
  }

  // Check if staff (has @engelska.se but no .student.)
  isStaff = email.includes('@engelska.se') && !email.includes('.student.');

  const pointBalance = getStudentPointBalance(email, studentName);
  const cooldownStatus = checkCanvasCooldown(email, settings);

  // Get student's color
  const houseColors = {
    'Phoenix': '#dc143c',
    'Dragon': '#228b22',
    'Hydra': '#4169e1',
    'Griffin': '#ff8c00'
  };

  const color = isStaff ? '#000000' : houseColors[house] || '#cccccc';

  return {
    status: 'success',
    email: email,
    name: studentName,
    house: house,
    isStaff: isStaff,
    color: color,
    pointBalance: pointBalance,
    canPlace: pointBalance >= settings.pointCostPerPixel && !cooldownStatus.onCooldown && settings.canvasActive,
    cooldown: cooldownStatus,
    settings: {
      cooldownMinutes: settings.cooldownMinutes,
      pointCost: settings.pointCostPerPixel,
      campaignActive: settings.canvasActive,
      campaignEndDate: settings.campaignEndDate
    }
  };
}

/**
 * Place a pixel on the canvas
 */
function placePixel(data) {
  const email = data.email;
  const row = data.row;
  const col = data.col;
  const sessionId = data.sessionId || 'none';

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settings = getCanvasSettings();
  const canvasState = ss.getSheetByName('Canvas State');
  const canvasLog = ss.getSheetByName('Canvas Activity Log');
  const rosterSheet = ss.getSheetByName('Student Roster');

  // Validate campaign is active
  if (!settings.canvasActive) {
    return {
      status: 'error',
      message: 'Canvas campaign is not currently active.'
    };
  }

  // Check campaign dates
  const now = new Date();
  if (now < new Date(settings.campaignStartDate)) {
    return {
      status: 'error',
      message: 'Canvas campaign has not started yet.'
    };
  }
  if (now > new Date(settings.campaignEndDate)) {
    return {
      status: 'error',
      message: 'Canvas campaign has ended.'
    };
  }

  // Get student info
  let studentName = '';
  let house = '';
  let isStaff = false;

  if (rosterSheet) {
    const rosterData = rosterSheet.getDataRange().getValues();
    const emailLower = email.toLowerCase().trim();

    for (let i = 1; i < rosterData.length; i++) {
      const rosterEmail = rosterData[i][2]; // Column C = Email

      // Flexible email matching (case-insensitive, trimmed)
      if (rosterEmail && rosterEmail.toString().toLowerCase().trim() === emailLower) {
        studentName = `${rosterData[i][0]} ${rosterData[i][1]}`;
        house = rosterData[i][3];
        break;
      }
    }
  }

  isStaff = email.includes('@engelska.se') && !email.includes('.student.');

  if (!house && !isStaff) {
    return {
      status: 'error',
      message: 'Student not found in roster.'
    };
  }

  // Validate coordinates
  if (row < 0 || row >= settings.canvasHeight || col < 0 || col >= settings.canvasWidth) {
    return {
      status: 'error',
      message: 'Invalid coordinates.'
    };
  }

  // Check point balance
  const pointBalance = getStudentPointBalance(email, studentName);
  if (pointBalance < settings.pointCostPerPixel) {
    return {
      status: 'error',
      message: `You need at least ${settings.pointCostPerPixel} house point(s) to place a pixel. Earn points first!`
    };
  }

  // Check cooldown
  const cooldownStatus = checkCanvasCooldown(email, settings);
  if (cooldownStatus.onCooldown) {
    return {
      status: 'error',
      message: `Please wait ${cooldownStatus.minutesRemaining} more minute(s) before placing another pixel.`
    };
  }

  // Determine color based on house/staff
  const houseColors = {
    'Phoenix': '#dc143c',
    'Dragon': '#228b22',
    'Hydra': '#4169e1',
    'Griffin': '#ff8c00'
  };

  const color = isStaff ? '#000000' : houseColors[house];

  // Check if pixel already exists at this location
  const stateData = canvasState.getLastRow() > 1 ? canvasState.getRange(2, 1, canvasState.getLastRow() - 1, 7).getValues() : [];

  for (let i = 0; i < stateData.length; i++) {
    if (stateData[i][0] === row && stateData[i][1] === col) {
      // Pixel exists
      if (!settings.allowOverwrite) {
        return {
          status: 'error',
          message: 'This pixel has already been claimed! No overwrites allowed.'
        };
      }

      // Check if it's a black pixel and if black overwrites are disabled
      if (stateData[i][2] === '#000000' && !settings.allowBlackOverwrite) {
        return {
          status: 'error',
          message: 'Staff pixels cannot be overwritten!'
        };
      }
    }
  }

  // Add or update pixel in Canvas State
  let pixelExists = false;
  for (let i = 0; i < stateData.length; i++) {
    if (stateData[i][0] === row && stateData[i][1] === col) {
      // Update existing pixel
      canvasState.getRange(i + 2, 3, 1, 5).setValues([[color, email, new Date(), house || 'Staff', studentName]]);
      pixelExists = true;
      break;
    }
  }

  if (!pixelExists) {
    // Add new pixel
    canvasState.appendRow([row, col, color, email, new Date(), house || 'Staff', studentName]);
  }

  // Log the activity
  canvasLog.appendRow([
    new Date(),
    email,
    studentName,
    house || 'Staff',
    row,
    col,
    color,
    settings.pointCostPerPixel,
    sessionId
  ]);

  // Calculate new stats
  const stats = calculateCanvasStats();

  return {
    status: 'success',
    message: 'Pixel placed successfully!',
    pixel: {
      row: row,
      col: col,
      color: color,
      house: house || 'Staff'
    },
    newBalance: pointBalance - settings.pointCostPerPixel,
    stats: stats
  };
}

/**
 * Calculate canvas statistics (territory percentages)
 */
function calculateCanvasStats() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const canvasState = ss.getSheetByName('Canvas State');

  const stats = {
    Phoenix: 0,
    Dragon: 0,
    Hydra: 0,
    Griffin: 0,
    Staff: 0,
    total: 0
  };

  if (!canvasState || canvasState.getLastRow() <= 1) {
    return {
      Phoenix: { count: 0, percentage: 0 },
      Dragon: { count: 0, percentage: 0 },
      Hydra: { count: 0, percentage: 0 },
      Griffin: { count: 0, percentage: 0 },
      Staff: { count: 0, percentage: 0 },
      total: 0
    };
  }

  const data = canvasState.getRange(2, 1, canvasState.getLastRow() - 1, 6).getValues();

  data.forEach(row => {
    const house = row[5]; // Column F = House
    if (stats[house] !== undefined) {
      stats[house]++;
      stats.total++;
    }
  });

  return {
    Phoenix: { count: stats.Phoenix, percentage: stats.total > 0 ? Math.round((stats.Phoenix / stats.total) * 100) : 0 },
    Dragon: { count: stats.Dragon, percentage: stats.total > 0 ? Math.round((stats.Dragon / stats.total) * 100) : 0 },
    Hydra: { count: stats.Hydra, percentage: stats.total > 0 ? Math.round((stats.Hydra / stats.total) * 100) : 0 },
    Griffin: { count: stats.Griffin, percentage: stats.total > 0 ? Math.round((stats.Griffin / stats.total) * 100) : 0 },
    Staff: { count: stats.Staff, percentage: stats.total > 0 ? Math.round((stats.Staff / stats.total) * 100) : 0 },
    total: stats.total
  };
}

/**
 * Get canvas statistics
 */
function getCanvasStats() {
  return {
    status: 'success',
    stats: calculateCanvasStats()
  };
}

/**
 * Check if there's a winner (mathematically impossible to catch up)
 * With 20x20 grid = 400 blocks, winner needs 200+ blocks (50%+)
 */
function checkForWinner() {
  const settings = getCanvasSettings();
  const stats = calculateCanvasStats();

  const totalBlocks = settings.canvasWidth * settings.canvasHeight; // 400
  const placedBlocks = stats.total;
  const remainingBlocks = totalBlocks - placedBlocks;

  // Sort houses by block count (excluding Staff)
  const houses = ['Phoenix', 'Dragon', 'Hydra', 'Griffin'];
  const houseCounts = houses.map(house => ({
    house: house,
    count: stats[house].count
  })).sort((a, b) => b.count - a.count);

  const leader = houseCounts[0];
  const secondPlace = houseCounts[1];

  // Winner condition: Leader has 200+ blocks (50%+) OR mathematically impossible to catch up
  const hasAbsoluteMajority = leader.count > (totalBlocks / 2); // 200+ blocks
  const mathematicallyImpossible = (secondPlace.count + remainingBlocks) < leader.count;

  if (hasAbsoluteMajority || mathematicallyImpossible) {
    return {
      hasWinner: true,
      winner: leader.house,
      winnerCount: leader.count,
      winnerPercentage: stats[leader.house].percentage,
      declaredAt: new Date(),
      totalBlocks: totalBlocks,
      placedBlocks: placedBlocks,
      stats: stats
    };
  }

  // Check if campaign end date has been reached (10:00 AM)
  const now = new Date();
  const campaignEnd = new Date(settings.campaignEndDate);
  campaignEnd.setHours(10, 0, 0, 0);

  if (now >= campaignEnd) {
    return {
      hasWinner: true,
      winner: leader.house,
      winnerCount: leader.count,
      winnerPercentage: stats[leader.house].percentage,
      declaredAt: campaignEnd,
      reason: 'Campaign end date reached',
      totalBlocks: totalBlocks,
      placedBlocks: placedBlocks,
      stats: stats
    };
  }

  return {
    hasWinner: false,
    leader: leader.house,
    leaderCount: leader.count,
    remainingBlocks: remainingBlocks
  };
}

/**
 * Get winner status with auto-wipe schedule
 */
function getCanvasWinnerStatus() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settingsSheet = ss.getSheetByName('Canvas Settings');

  // Check if winner has been declared
  let winnerData = null;
  let wipeScheduled = null;

  if (settingsSheet) {
    const data = settingsSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'winnerDeclared' && data[i][1] === 'TRUE') {
        // Winner exists, get details
        for (let j = 1; j < data.length; j++) {
          if (data[j][0] === 'winnerHouse') winnerData = { house: data[j][1] };
          if (data[j][0] === 'winnerPercentage') winnerData.percentage = data[j][1];
          if (data[j][0] === 'winnerDeclaredAt') winnerData.declaredAt = new Date(data[j][1]);
          if (data[j][0] === 'wipeScheduledFor') wipeScheduled = new Date(data[j][1]);
        }
        break;
      }
    }
  }

  if (winnerData) {
    return {
      status: 'success',
      hasWinner: true,
      winner: winnerData,
      wipeScheduled: wipeScheduled,
      message: `🏆 ${winnerData.house} has won with ${winnerData.percentage}%! Canvas will reset tomorrow at 06:00.`
    };
  }

  // No winner declared yet, check current state
  const winnerCheck = checkForWinner();

  if (winnerCheck.hasWinner) {
    // Winner just detected, declare it now
    declareWinner(winnerCheck);

    return {
      status: 'success',
      hasWinner: true,
      winner: {
        house: winnerCheck.winner,
        percentage: winnerCheck.winnerPercentage,
        declaredAt: winnerCheck.declaredAt
      },
      wipeScheduled: getWipeSchedule(winnerCheck.declaredAt),
      message: `🏆 ${winnerCheck.winner} has won with ${winnerCheck.winnerPercentage}%! Come back tomorrow to play again!`
    };
  }

  return {
    status: 'success',
    hasWinner: false
  };
}

/**
 * Declare winner and schedule wipe
 */
function declareWinner(winnerData) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settingsSheet = ss.getSheetByName('Canvas Settings');

  if (!settingsSheet) return;

  const data = settingsSheet.getDataRange().getValues();

  // Calculate wipe time: 23:59 today
  const declaredDate = new Date(winnerData.declaredAt);
  const wipeTime = new Date(declaredDate);
  wipeTime.setHours(23, 59, 0, 0);

  // Update or add winner settings
  const updates = [
    ['winnerDeclared', 'TRUE'],
    ['winnerHouse', winnerData.winner],
    ['winnerPercentage', winnerData.winnerPercentage],
    ['winnerDeclaredAt', declaredDate],
    ['wipeScheduledFor', wipeTime],
    ['canvasActive', 'FALSE'] // Disable new pixel placement
  ];

  updates.forEach(([key, value]) => {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        settingsSheet.getRange(i + 1, 2).setValue(value);
        found = true;
        break;
      }
    }
    if (!found) {
      settingsSheet.appendRow([key, value]);
    }
  });
}

/**
 * Get wipe schedule (23:59 today)
 */
function getWipeSchedule(declaredAt) {
  const wipeTime = new Date(declaredAt);
  wipeTime.setHours(23, 59, 0, 0);
  return wipeTime;
}

/**
 * Check if it's time to wipe and perform auto-wipe
 * This function should be called by time-based trigger (every hour)
 */
function checkAndPerformScheduledWipe() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settingsSheet = ss.getSheetByName('Canvas Settings');

  if (!settingsSheet) return { status: 'error', message: 'Canvas Settings not found' };

  const data = settingsSheet.getDataRange().getValues();
  let wipeScheduled = null;
  let winnerDeclared = false;

  // Check if winner declared and wipe scheduled
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'winnerDeclared' && data[i][1] === 'TRUE') {
      winnerDeclared = true;
    }
    if (data[i][0] === 'wipeScheduledFor') {
      wipeScheduled = new Date(data[i][1]);
    }
  }

  if (!winnerDeclared || !wipeScheduled) {
    return { status: 'info', message: 'No wipe scheduled' };
  }

  const now = new Date();

  // If current time is past scheduled wipe time, perform wipe
  if (now >= wipeScheduled) {
    Logger.log(`Auto-wipe triggered at ${now}. Scheduled for: ${wipeScheduled}`);

    // Perform the wipe without password (internal call)
    const result = performAutoWipe();

    return result;
  }

  return {
    status: 'info',
    message: `Wipe scheduled for ${wipeScheduled}. Current time: ${now}`
  };
}

/**
 * Perform auto-wipe (internal, no password required)
 */
function performAutoWipe() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const canvasState = ss.getSheetByName('Canvas State');
  const canvasHistory = ss.getSheetByName('Canvas History');
  const settingsSheet = ss.getSheetByName('Canvas Settings');

  // Calculate final stats
  const stats = calculateCanvasStats();

  // Get winner info
  let winner = 'None';
  let winningPercentage = 0;

  const data = settingsSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'winnerHouse') winner = data[i][1];
    if (data[i][0] === 'winnerPercentage') winningPercentage = data[i][1];
  }

  // Save to history
  canvasHistory.appendRow([
    new Date(),
    winner,
    winningPercentage,
    stats.total,
    stats.Phoenix.percentage,
    stats.Dragon.percentage,
    stats.Hydra.percentage,
    stats.Griffin.percentage,
    stats.Staff.percentage
  ]);

  // Clear canvas state (keep header)
  if (canvasState.getLastRow() > 1) {
    canvasState.deleteRows(2, canvasState.getLastRow() - 1);
  }

  // Reset winner flags and schedule new campaign start (06:00 tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);

  const newEndDate = new Date(tomorrow);
  newEndDate.setDate(newEndDate.getDate() + 7); // 7 days from new start

  // Update settings
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'winnerDeclared') settingsSheet.getRange(i + 1, 2).setValue('FALSE');
    if (data[i][0] === 'canvasActive') settingsSheet.getRange(i + 1, 2).setValue('TRUE');
    if (data[i][0] === 'campaignStartDate') settingsSheet.getRange(i + 1, 2).setValue(tomorrow);
    if (data[i][0] === 'campaignEndDate') settingsSheet.getRange(i + 1, 2).setValue(newEndDate);
  }

  Logger.log(`Canvas wiped! Winner: ${winner}. New campaign starts: ${tomorrow}`);

  return {
    status: 'success',
    message: `Canvas wiped! Winner: ${winner} with ${winningPercentage}%. New campaign starts at 06:00 tomorrow.`,
    winner: winner,
    winningPercentage: winningPercentage,
    newCampaignStart: tomorrow
  };
}

/**
 * Get previous winners (last 5 campaigns)
 */
function getPreviousWinners() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const canvasHistory = ss.getSheetByName('Canvas History');

  if (!canvasHistory || canvasHistory.getLastRow() <= 1) {
    return {
      status: 'success',
      winners: []
    };
  }

  const lastRow = canvasHistory.getLastRow();
  const startRow = Math.max(2, lastRow - 4); // Get last 5
  const numRows = lastRow - startRow + 1;

  const data = canvasHistory.getRange(startRow, 1, numRows, 9).getValues();

  // Reverse to get most recent first
  const winners = data.reverse().map(row => ({
    date: row[0],
    house: row[1],
    percentage: row[2],
    totalPixels: row[3]
  }));

  return {
    status: 'success',
    winners: winners
  };
}

/**
 * Get recent canvas activity
 */
function getCanvasRecentActivity(limit = 10) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const canvasLog = ss.getSheetByName('Canvas Activity Log');

  if (!canvasLog || canvasLog.getLastRow() <= 1) {
    return {
      status: 'success',
      activity: []
    };
  }

  const lastRow = canvasLog.getLastRow();
  const startRow = Math.max(2, lastRow - limit + 1);
  const numRows = lastRow - startRow + 1;

  const data = canvasLog.getRange(startRow, 1, numRows, 7).getValues();

  // Reverse to get most recent first
  const activity = data.reverse().map(row => ({
    timestamp: row[0],
    house: row[3],
    row: row[4],
    col: row[5],
    color: row[6]
  }));

  return {
    status: 'success',
    activity: activity
  };
}

/**
 * Get canvas leaderboards (password protected)
 */
function getCanvasLeaderboard(password) {
  const settings = getCanvasSettings();

  // Check password
  if (password !== settings.leaderboardPassword) {
    return {
      status: 'error',
      message: 'Invalid password. Leaderboard is password protected.'
    };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const canvasLog = ss.getSheetByName('Canvas Activity Log');

  if (!canvasLog || canvasLog.getLastRow() <= 1) {
    return {
      status: 'success',
      studentLeaderboard: [],
      houseLeaderboard: []
    };
  }

  const data = canvasLog.getRange(2, 1, canvasLog.getLastRow() - 1, 9).getValues();

  // Count pixels per student
  const studentCounts = {};
  const houseCounts = { Phoenix: 0, Dragon: 0, Hydra: 0, Griffin: 0, Staff: 0 };

  data.forEach(row => {
    const email = row[1];
    const name = row[2];
    const house = row[3];

    if (!studentCounts[email]) {
      studentCounts[email] = { name: name, house: house, count: 0 };
    }
    studentCounts[email].count++;

    if (houseCounts[house] !== undefined) {
      houseCounts[house]++;
    }
  });

  // Convert to array and sort
  const studentLeaderboard = Object.entries(studentCounts)
    .map(([email, data]) => ({
      email: email,
      name: data.name,
      house: data.house,
      pixelsPlaced: data.count
    }))
    .sort((a, b) => b.pixelsPlaced - a.pixelsPlaced)
    .slice(0, 10); // Top 10

  const houseLeaderboard = Object.entries(houseCounts)
    .map(([house, count]) => ({
      house: house,
      pixelsPlaced: count
    }))
    .sort((a, b) => b.pixelsPlaced - a.pixelsPlaced);

  return {
    status: 'success',
    studentLeaderboard: studentLeaderboard,
    houseLeaderboard: houseLeaderboard
  };
}

/**
 * Wipe canvas and save winner (admin only)
 */
function wipeCanvas(password) {
  const settings = getCanvasSettings();

  // Check admin password
  if (password !== settings.adminPassword) {
    return {
      status: 'error',
      message: 'Invalid admin password.'
    };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const canvasState = ss.getSheetByName('Canvas State');
  const canvasHistory = ss.getSheetByName('Canvas History');

  // Calculate final stats
  const stats = calculateCanvasStats();

  // Determine winner
  let winner = 'None';
  let winningCount = 0;

  ['Phoenix', 'Dragon', 'Hydra', 'Griffin', 'Staff'].forEach(house => {
    if (stats[house].count > winningCount) {
      winningCount = stats[house].count;
      winner = house;
    }
  });

  // Save to history
  canvasHistory.appendRow([
    new Date(),
    winner,
    stats[winner].percentage,
    stats.total,
    stats.Phoenix.percentage,
    stats.Dragon.percentage,
    stats.Hydra.percentage,
    stats.Griffin.percentage,
    stats.Staff.percentage
  ]);

  // Clear canvas state (keep header)
  if (canvasState.getLastRow() > 1) {
    canvasState.deleteRows(2, canvasState.getLastRow() - 1);
  }

  // Generate new Mondrian layout for next campaign
  const newLayout = generateMondrianLayoutWithMapping(settings.canvasWidth, settings.canvasHeight);
  const settingsSheet = ss.getSheetByName('Canvas Settings');
  const settingsData = settingsSheet.getDataRange().getValues();

  // Update mondrianLayout setting
  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === 'mondrianLayout') {
      settingsSheet.getRange(i + 1, 2).setValue(JSON.stringify(newLayout));
      break;
    }
  }

  Logger.log(`Canvas wiped. Winner: ${winner}. New Mondrian layout generated with ${newLayout.length} blocks.`);

  return {
    status: 'success',
    message: `Canvas wiped! Winner: ${winner} with ${stats[winner].percentage}%`,
    winner: winner,
    stats: stats
  };
}

/**
 * Extend campaign end date (admin only)
 */
function extendCampaign(newEndDate, password) {
  const settings = getCanvasSettings();

  // Check admin password
  if (password !== settings.adminPassword) {
    return {
      status: 'error',
      message: 'Invalid admin password.'
    };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settingsSheet = ss.getSheetByName('Canvas Settings');
  const data = settingsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'campaignEndDate') {
      settingsSheet.getRange(i + 1, 2).setValue(new Date(newEndDate));
      break;
    }
  }

  return {
    status: 'success',
    message: 'Campaign end date extended successfully!',
    newEndDate: new Date(newEndDate)
  };
}

/**
 * Update canvas settings (admin only)
 */
function updateCanvasSettings(newSettings, password) {
  const settings = getCanvasSettings();

  // Check admin password
  if (password !== settings.adminPassword) {
    return {
      status: 'error',
      message: 'Invalid admin password.'
    };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settingsSheet = ss.getSheetByName('Canvas Settings');
  const data = settingsSheet.getDataRange().getValues();

  Object.keys(newSettings).forEach(key => {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        let value = newSettings[key];
        if (typeof value === 'boolean') {
          value = value ? 'TRUE' : 'FALSE';
        }
        settingsSheet.getRange(i + 1, 2).setValue(value);
        break;
      }
    }
  });

  return {
    status: 'success',
    message: 'Settings updated successfully!'
  };
}

// ============================================================================
// TRIGGER SETUP FUNCTIONS
// ============================================================================

/**
 * Set up time-based trigger for auto-wipe checking
 * Run this function ONCE to enable automatic canvas wipes
 */
function setupAutoWipeTrigger() {
  // Delete existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkAndPerformScheduledWipe') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new hourly trigger
  ScriptApp.newTrigger('checkAndPerformScheduledWipe')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('✅ Auto-wipe trigger set up successfully! Runs every hour.');

  return {
    status: 'success',
    message: 'Auto-wipe trigger created successfully! The system will check every hour for scheduled wipes.'
  };
}

/**
 * Remove auto-wipe trigger
 * Run this if you want to disable automatic wipes
 */
function removeAutoWipeTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkAndPerformScheduledWipe') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });

  Logger.log(`✅ Removed ${count} auto-wipe trigger(s).`);

  return {
    status: 'success',
    message: `Removed ${count} auto-wipe trigger(s). Automatic wipes are now disabled.`
  };
}

/**
 * View active triggers
 * Run this to see all active triggers
 */
function viewActiveTriggers() {
  const triggers = ScriptApp.getProjectTriggers();

  if (triggers.length === 0) {
    Logger.log('No active triggers found.');
    return { status: 'info', message: 'No active triggers' };
  }

  Logger.log(`Found ${triggers.length} active trigger(s):`);

  triggers.forEach((trigger, index) => {
    Logger.log(`${index + 1}. Function: ${trigger.getHandlerFunction()}`);
    Logger.log(`   Type: ${trigger.getEventType()}`);
  });

  return {
    status: 'success',
    message: `Found ${triggers.length} active trigger(s). Check execution log for details.`
  };
}
