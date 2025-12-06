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

// Reset all house points to zero
function resetAllPoints() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const pointsLog = sheet.getSheetByName('Points Log');
  
  // Archive current season first
  archiveCurrentSeason();
  
  // Clear all points (keep headers)
  const lastRow = pointsLog.getLastRow();
  if (lastRow > 1) {
    pointsLog.getRange(2, 1, lastRow - 1, pointsLog.getLastColumn()).clearContent();
  }
  
  // Update last reset date in Settings
  const settingsSheet = sheet.getSheetByName('Settings');
  settingsSheet.getRange('B2').setValue(new Date());
  
  Logger.log('All points reset to zero');
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
