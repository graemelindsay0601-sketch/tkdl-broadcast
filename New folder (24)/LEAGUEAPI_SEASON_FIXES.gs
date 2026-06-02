/* =========================
   FIX CAREER_MATCHES SEASONS CORRECTLY
   Differentiates between FEB_2026, MAY_2026, and JUNE_2026 based on:
   1. Season 1 (FEB_2026): Dummy/historical matches (stake=0, all on 5/25)
   2. Season 2 (MAY_2026): Actual games played 5/13-5/31
   3. Season 3 (JUNE_2026): Current season (no games yet)
========================= */

function fixCareerMatchesSeasonsProperly() {
  const ss = SpreadsheetApp.openById('1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc');
  const sheet = ss.getSheetByName('CAREER_MATCHES');
  const data = sheet.getDataRange().getValues();
  
  let fixed = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    if (!row[0]) break; // end of data
    
    const timestamp = String(row[0] || "");
    const stake = Number(row[4]) || 0;
    const currentSeason = String(row[6] || "").trim();
    
    let correctSeason = "";
    
    // Season 1 (FEB_2026): Historical/dummy data
    // Characteristics: stake=0, all timestamped 5/25 (backfilled), from old data
    if (stake === 0 && timestamp.includes("5/25")) {
      correctSeason = "FEB_2026";
    }
    // Season 2 (MAY_2026): Actual games played in May
    // Characteristics: stake > 0, dated 5/13 through 5/31
    else if (stake > 0 && timestamp.includes("5/")) {
      correctSeason = "MAY_2026";
    }
    // Season 3 (JUNE_2026): Current season
    // Characteristics: any games from June onwards (currently none)
    else if (timestamp.includes("6/")) {
      correctSeason = "JUNE_2026";
    }
    
    // Update if wrong or missing
    if (correctSeason && currentSeason !== correctSeason) {
      sheet.getRange(i + 1, 7).setValue(correctSeason);
      fixed++;
      Logger.log(
        `Row ${i+1}: "${currentSeason}" → "${correctSeason}" | ` +
        `Stake=${stake} Date=${timestamp}`
      );
    }
  }
  
  Logger.log(`Season correction complete: ${fixed} rows updated`);
  return { fixed: fixed };
}

/* =========================
   FIX SPECIFIC PLAYER NAME ISSUES
========================= */

function fixPlayerNameCaseSensitivity() {
  const ss = SpreadsheetApp.openById('1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc');
  const sheet = ss.getSheetByName('CAREER_MATCHES');
  const data = sheet.getDataRange().getValues();
  
  // Build canonical names from PLAYERS sheet
  const playersSheet = ss.getSheetByName('PLAYERS');
  const playersData = playersSheet.getDataRange().getValues();
  const canonicalNames = {};
  
  playersData.slice(1).forEach(row => {
    if (row[0]) {
      canonicalNames[String(row[0]).toLowerCase()] = String(row[0]);
    }
  });
  
  let fixed = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) break;
    
    // Check columns 1, 2, 3 (Player1, Player2, Winner)
    [1, 2, 3].forEach(col => {
      const rawName = String(row[col] || "").trim();
      if (rawName) {
        const canonical = canonicalNames[rawName.toLowerCase()];
        if (canonical && canonical !== rawName) {
          sheet.getRange(i + 1, col + 1).setValue(canonical);
          fixed++;
          Logger.log(`Row ${i+1} Col ${col+1}: "${rawName}" → "${canonical}"`);
        }
      }
    });
  }
  
  Logger.log(`Case sensitivity fix complete: ${fixed} names corrected`);
  return { fixed: fixed };
}

/* =========================
   FIX SPECIFIC PROBLEM ROWS
   Row 54: "ryan" should be "Ryan"
   Row 70: "v" should be "MAY_2026"
========================= */

function fixSpecificProblematicRows() {
  const ss = SpreadsheetApp.openById('1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc');
  const sheet = ss.getSheetByName('CAREER_MATCHES');
  
  // Row 54, Column 3 (Player2): "ryan" → "Ryan"
  sheet.getRange(54, 3).setValue("Ryan");
  Logger.log('Row 54, Col 3: Fixed "ryan" → "Ryan"');
  
  // Row 70, Column 7 (Season): "v" → "MAY_2026"
  sheet.getRange(70, 7).setValue("MAY_2026");
  Logger.log('Row 70, Col 7: Fixed "v" → "MAY_2026"');
  
  return { fixed: 2 };
}

/* =========================
   MASTER FIX FUNCTION - RUN THIS ONE
   Executes all fixes in correct order
========================= */

function fixAllCareerMatchIssues() {
  Logger.log('=== Starting CAREER_MATCHES fixes ===');
  
  try {
    const result1 = fixPlayerNameCaseSensitivity();
    Logger.log('✓ Player names fixed: ' + result1.fixed);
  } catch(e) {
    Logger.log('✗ Player name fix failed: ' + e);
  }
  
  try {
    const result2 = fixSpecificProblematicRows();
    Logger.log('✓ Problematic rows fixed: ' + result2.fixed);
  } catch(e) {
    Logger.log('✗ Problematic rows fix failed: ' + e);
  }
  
  try {
    const result3 = fixCareerMatchesSeasonsProperly();
    Logger.log('✓ Seasons corrected: ' + result3.fixed);
  } catch(e) {
    Logger.log('✗ Season fix failed: ' + e);
  }
  
  Logger.log('=== All fixes complete ===');
  Logger.log('Now run: rebuildAllCareerStats(); rebuildLeagueDataCache();');
}

/* =========================
   REBUILD AND CACHE
========================= */

function rebuildEverythingAfterFixes() {
  Logger.log('=== Rebuilding all data ===');
  
  try {
    rebuildAllCareerStats();
    Logger.log('✓ Career stats rebuilt');
  } catch(e) {
    Logger.log('✗ Career stats rebuild failed: ' + e);
  }
  
  try {
    rebuildCareerLeaderboard();
    Logger.log('✓ Career leaderboard rebuilt');
  } catch(e) {
    Logger.log('✗ Career leaderboard rebuild failed: ' + e);
  }
  
  try {
    rebuildLeagueDataCache();
    Logger.log('✓ League cache rebuilt');
  } catch(e) {
    Logger.log('✗ League cache rebuild failed: ' + e);
  }
  
  Logger.log('=== Rebuild complete ===');
}
