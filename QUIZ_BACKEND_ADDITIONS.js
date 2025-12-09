// ============================================================================
// QUIZ LEADERBOARD & SETTINGS BACKEND - Apps Script Code
// ============================================================================
// ADD THESE FUNCTIONS TO YOUR EXISTING APPS SCRIPT
//
// Also add the corresponding cases to your doGet() and doPost() functions
// ============================================================================

// ---------- ADD TO doGet() FUNCTION ----------
/*
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
*/

// ---------- ADD TO doPost() FUNCTION ----------
/*
  if (data.action === 'updateQuizSettings') {
    const result = updateQuizSettings(data.settings);
    return jsonResponse(result);
  }
*/

// ============================================================================
// QUIZ LEADERBOARD FUNCTIONS
// ============================================================================

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

  // Get all quiz attempts
  const logData = quizLog.getRange(2, 1, quizLog.getLastRow() - 1, quizLog.getLastColumn()).getValues();
  const rosterData = rosterSheet ? rosterSheet.getDataRange().getValues() : [];

  // Build house statistics
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

    // Find student's house
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

  // Convert to array and sort by points
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

  // Build student statistics
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

      // Find student info
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

  // Convert to array and sort by correct answers
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

// ============================================================================
// QUIZ SETTINGS MANAGEMENT FUNCTIONS
// ============================================================================

// Note: getQuizSettings() already exists in QUIZ_APPS_SCRIPT.js
// This is the update function

function updateQuizSettings(newSettings) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let settingsSheet = ss.getSheetByName('Quiz Settings');

  if (!settingsSheet) {
    // Create the sheet with default structure
    settingsSheet = ss.insertSheet('Quiz Settings');
    settingsSheet.getRange('A1:C1').setValues([['Setting Name', 'Value', 'Description']]);
    settingsSheet.getRange('A1:C1').setFontWeight('bold');

    // Initialize with default values
    settingsSheet.appendRow(['Max Daily Attempts', 5, 'Maximum questions per student per day']);
    settingsSheet.appendRow(['Max Daily Points', 5, 'Maximum points a student can earn per day']);
    settingsSheet.appendRow(['Question Time Limit', 60, 'Seconds allowed to answer each question']);
    settingsSheet.appendRow(['Cooldown Minutes', 5, 'Minutes between quiz attempts']);
    settingsSheet.appendRow(['Points Per Correct', 1, 'Points awarded for correct answer']);
    settingsSheet.appendRow(['AI Enabled', false, 'Enable Gemini AI question generation']);
  }

  // Update values
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

// ============================================================================
// HELPER: Update the getQuizSettings() function to return proper format
// ============================================================================
/*
// If your existing getQuizSettings() doesn't match this format, replace it:

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
*/
