// ============================================
// MONTHLY RESET SYSTEM - ADD TO APPS SCRIPT
// ============================================

/**
 * Add these functions to your existing apps-script.js file
 * Also add the new doGet cases for getResetStatus
 * And new doPost case for setResetStatus
 */

// Get reset status from Settings tab
function getResetStatus() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  let settingsSheet = sheet.getSheetByName('Settings');
  
  // Create Settings tab if it doesn't exist
  if (!settingsSheet) {
    settingsSheet = sheet.insertSheet('Settings');
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

// Set reset status
function setResetStatus(enabled) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  let settingsSheet = sheet.getSheetByName('Settings');
  
  // Create Settings tab if it doesn't exist
  if (!settingsSheet) {
    settingsSheet = sheet.insertSheet('Settings');
    settingsSheet.getRange('A1').setValue('Reset Enabled');
    settingsSheet.getRange('A2').setValue('Last Reset Date');
  }
  
  settingsSheet.getRange('B1').setValue(enabled);
  
  return { success: true, enabled: enabled };
}

// Archive current season to Season History
function archiveCurrentSeason() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const houseTotals = sheet.getSheetByName('House Totals');
  let historySheet = sheet.getSheetByName('Season History');
  
  // Create Season History tab if it doesn't exist
  if (!historySheet) {
    historySheet = sheet.insertSheet('Season History');
    historySheet.getRange('A1:H1').setValues([[
      'Season #', 'Start Date', 'End Date', 
      '1st Place', '1st Score', 
      '2nd Place', '2nd Score',
      '3rd Place', '3rd Score',
      '4th Place', '4th Score'
    ]]);
    historySheet.getRange('A1:H1').setFontWeight('bold');
  }
  
  // Get current house standings
  const data = houseTotals.getRange('A2:E5').getValues();
  const houses = data.map(row => ({
    house: row[0],
    totalPoints: row[1],
    peopleCount: row[2],
    houseScore: row[3],
    rank: row[4]
  })).sort((a, b) => a.rank - b.rank);
  
  // Calculate season dates
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of month
  
  // Get season number
  const lastRow = historySheet.getLastRow();
  const seasonNumber = lastRow > 1 ? historySheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  // Prepare row data
  const newRow = [
    seasonNumber,
    Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    Utilities.formatDate(endDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    houses[0].house, houses[0].houseScore,
    houses[1].house, houses[1].houseScore,
    houses[2].house, houses[2].houseScore,
    houses[3].house, houses[3].houseScore
  ];
  
  // Append to history
  historySheet.appendRow(newRow);
  
  Logger.log('Season archived: ' + seasonNumber);
  return seasonNumber;
}

// Archive quiz statistics for the season
function archiveQuizStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const quizLog = sheet.getSheetByName('Quiz Log');
  let quizHistorySheet = sheet.getSheetByName('Quiz Season History');

  // Create Quiz Season History tab if it doesn't exist
  if (!quizHistorySheet) {
    quizHistorySheet = sheet.insertSheet('Quiz Season History');
    quizHistorySheet.getRange('A1:J1').setValues([[
      'Season #', 'End Date', 'House', 'Total Attempts', 'Correct Answers',
      'Accuracy %', 'Total Points', 'Top Student', 'Top Student Correct', 'Top Student House'
    ]]);
    quizHistorySheet.getRange('A1:J1').setFontWeight('bold');
  }

  if (!quizLog || quizLog.getLastRow() <= 1) {
    Logger.log('No quiz data to archive');
    return;
  }

  // Get all quiz log data
  const quizData = quizLog.getRange(2, 1, quizLog.getLastRow() - 1, quizLog.getLastColumn()).getValues();

  // Get season number from Season History
  const historySheet = sheet.getSheetByName('Season History');
  const seasonNumber = historySheet ? historySheet.getLastRow() : 1;
  const endDate = new Date();

  // Calculate stats by house
  const houseStats = {};
  const studentStats = {};

  quizData.forEach(row => {
    const email = row[1];
    const isCorrect = row[6];
    const points = row[7];

    // Get student's house from Student Roster
    const rosterSheet = sheet.getSheetByName('Student Roster');
    if (rosterSheet) {
      const rosterData = rosterSheet.getDataRange().getValues();
      for (let i = 1; i < rosterData.length; i++) {
        if (rosterData[i][2] === email) {
          const house = rosterData[i][3];
          const studentName = `${rosterData[i][0]} ${rosterData[i][1]}`;

          // House stats
          if (!houseStats[house]) {
            houseStats[house] = { attempts: 0, correct: 0, points: 0 };
          }
          houseStats[house].attempts++;
          if (isCorrect) houseStats[house].correct++;
          houseStats[house].points += points;

          // Student stats
          if (!studentStats[email]) {
            studentStats[email] = { name: studentName, house: house, correct: 0, attempts: 0 };
          }
          studentStats[email].attempts++;
          if (isCorrect) studentStats[email].correct++;

          break;
        }
      }
    }
  });

  // Find top student
  let topStudent = { name: '-', correct: 0, house: '-' };
  Object.values(studentStats).forEach(student => {
    if (student.correct > topStudent.correct) {
      topStudent = student;
    }
  });

  // Archive each house's stats
  Object.entries(houseStats).forEach(([house, stats]) => {
    const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;

    quizHistorySheet.appendRow([
      seasonNumber,
      Utilities.formatDate(endDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      house,
      stats.attempts,
      stats.correct,
      accuracy,
      stats.points,
      topStudent.name,
      topStudent.correct,
      topStudent.house
    ]);
  });

  Logger.log('Quiz stats archived for season ' + seasonNumber);
}

// Reset all house points to zero
function resetAllPoints() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const pointsLog = sheet.getSheetByName('Points Log');

  // Archive current season first
  archiveCurrentSeason();

  // Archive quiz statistics
  archiveQuizStats();

  // Clear all points (keep headers)
  const lastRow = pointsLog.getLastRow();
  if (lastRow > 1) {
    pointsLog.getRange(2, 1, lastRow - 1, pointsLog.getLastColumn()).clearContent();
  }

  // Clear quiz log (keep headers)
  const quizLog = sheet.getSheetByName('Quiz Log');
  if (quizLog && quizLog.getLastRow() > 1) {
    const quizLastRow = quizLog.getLastRow();
    quizLog.getRange(2, 1, quizLastRow - 1, quizLog.getLastColumn()).clearContent();
    Logger.log('Quiz log reset');
  }

  // Update last reset date in Settings
  const settingsSheet = sheet.getSheetByName('Settings');
  settingsSheet.getRange('B2').setValue(new Date());

  Logger.log('All points and quiz stats reset to zero');
}

// Check if reset should happen (run this daily via trigger)
function checkMonthlyReset() {
  const status = getResetStatus();
  
  // Only proceed if reset is enabled
  if (!status.resetEnabled) {
    Logger.log('Monthly reset is disabled');
    return;
  }
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  
  // Check if tomorrow is the 1st of the month
  if (tomorrow.getDate() === 1) {
    Logger.log('Today is the last day of the month - resetting points');
    resetAllPoints();
  } else {
    Logger.log('Not time to reset yet. Days until reset: ' + (new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()));
  }
}

// Setup trigger for monthly reset check (run this once manually)
function setupMonthlyResetTrigger() {
  // Delete existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkMonthlyReset') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new daily trigger at 23:59
  ScriptApp.newTrigger('checkMonthlyReset')
    .timeBased()
    .atHour(23)
    .nearMinute(59)
    .everyDays(1)
    .create();
  
  Logger.log('Monthly reset trigger created - runs daily at 23:59');
}

// ============================================
// ADD THESE CASES TO YOUR EXISTING doGet() FUNCTION
// ============================================
/*
  if (action === 'getResetStatus') {
    const status = getResetStatus();
    return ContentService.createTextOutput(JSON.stringify(status))
      .setMimeType(ContentService.MimeType.JSON);
  }
*/

// ============================================
// ADD THIS CASE TO YOUR EXISTING doPost() FUNCTION
// ============================================
/*
  if (data.action === 'setResetStatus') {
    const result = setResetStatus(data.enabled);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
*/
