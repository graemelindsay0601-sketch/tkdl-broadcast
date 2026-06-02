/* =========================
   CRITICAL MISSING FUNCTIONS
   Add these to LEAGUEAPI.gs to fix crashes
========================= */

function getPlayerWinStreak(playerName) {
  const sheet = getSheet("CAREER_MATCHES");
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues().slice(1);
  if (data.length === 0) return 0;
  
  let streak = 0;
  
  // Iterate from most recent (end) backwards
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    const p1 = String(row[1] || "").trim();
    const p2 = String(row[2] || "").trim();
    const winner = String(row[3] || "").trim();
    
    // Skip if player not in this match
    if (p1.toLowerCase() !== playerName.toLowerCase() && 
        p2.toLowerCase() !== playerName.toLowerCase()) {
      continue;
    }
    
    // Increment streak if player won, otherwise break
    if (winner.toLowerCase() === playerName.toLowerCase()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function getPlayerLossStreak(playerName) {
  const sheet = getSheet("CAREER_MATCHES");
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues().slice(1);
  if (data.length === 0) return 0;
  
  let streak = 0;
  
  // Iterate from most recent (end) backwards
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    const p1 = String(row[1] || "").trim();
    const p2 = String(row[2] || "").trim();
    const winner = String(row[3] || "").trim();
    
    // Skip if player not in this match
    if (p1.toLowerCase() !== playerName.toLowerCase() && 
        p2.toLowerCase() !== playerName.toLowerCase()) {
      continue;
    }
    
    // Increment streak if player lost, otherwise break
    if (winner.toLowerCase() !== playerName.toLowerCase()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/* =========================
   PLAYER PROFILE BUILDERS
========================= */

function buildPlayerProfile(playerId, context) {
  const players = context.players || {};
  const player = Object.values(players).find(p => p.playerId === playerId);
  
  if (!player) {
    return {
      playerId: playerId,
      name: 'Unknown',
      visuals: { cardTheme: 'default', auraGlow: 'standard', prestigeBorder: 'default' },
      visualIdentity: { theme: 'default', glow: 'standard', border: 'default' },
      title: 'Competitor',
      subtitle: 'Active Competitor',
      threatLevel: 'medium',
      signatureTrait: 'Balanced',
      aura: { tier: 'STANDARD' },
      prestige: { level: 'ROOKIE' },
      rivalrySpotlight: { hasRivalry: false, spotlight: {} }
    };
  }
  
  // Determine threat level based on ELO
  let threatLevel = 'low';
  if (player.elo >= 1100) threatLevel = 'high';
  else if (player.elo >= 1000) threatLevel = 'medium';
  
  // Determine aura glow based on ELO tier
  let auraGlow = 'bronze';
  if (player.elo >= 1100) auraGlow = 'gold';
  else if (player.elo >= 1000) auraGlow = 'silver';
  
  return {
    playerId: playerId,
    name: player.name,
    visuals: {
      cardTheme: 'default',
      auraGlow: auraGlow,
      prestigeBorder: 'default',
      archetypeLabel: 'Competitor'
    },
    visualIdentity: {
      theme: 'default',
      glow: 'standard',
      border: 'default'
    },
    title: 'Competitor',
    subtitle: 'Active Competitor',
    threatLevel: threatLevel,
    signatureTrait: 'Balanced Competitor',
    aura: { tier: 'STANDARD' },
    prestige: { level: 'ROOKIE' },
    rivalrySpotlight: { hasRivalry: false, spotlight: {} }
  };
}

function buildAllPlayerProfiles(context) {
  const players = context.players || {};
  const profiles = {};
  
  try {
    Object.values(players).forEach(player => {
      if (player.playerId) {
        profiles[player.playerId] = buildPlayerProfile(player.playerId, context);
      }
    });
  } catch(err) {
    Logger.log('buildAllPlayerProfiles error: ' + err);
  }
  
  return profiles;
}

function buildLeagueNarratives(context) {
  // Generates narrative context for league state
  // Currently returns empty - can be expanded with story generation
  try {
    const players = context.players || [];
    const matches = context.matches || [];
    
    return {
      topStories: [],
      emergingRivals: [],
      upsets: [],
      streaks: []
    };
  } catch(err) {
    Logger.log('buildLeagueNarratives error: ' + err);
    return {};
  }
}

function getArchivedMatches() {
  // Returns historical matches from previous seasons
  const sheet = getSheet("CAREER_MATCHES");
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  return data
    .slice(1)
    .filter(row => {
      const season = String(row[6] || "").trim();
      // Archive matches from past seasons (FEB, any completed season)
      return season === "FEB_2026" || (season && season !== "JUNE_2026");
    })
    .map(row => ({
      timestamp: row[0],
      player1: String(row[1] || "").trim(),
      player2: String(row[2] || "").trim(),
      winner: String(row[3] || "").trim(),
      stake: Number(row[4]) || 0,
      gameType: String(row[5] || "").trim(),
      season: String(row[6] || "").trim()
    }));
}

function getAchievementMetadataV2() {
  // Returns achievement metadata as object keyed by achievement ID
  const sheet = getSheet("ACHIEVEMENT_METADATA");
  if (!sheet) return {};
  
  const data = sheet.getDataRange().getValues();
  const metadata = {};
  
  data.slice(1).forEach(row => {
    if (row[1]) { // ID column exists
      const id = String(row[1]).trim();
      metadata[id] = {
        id: id,
        name: String(row[0] || "").trim(),
        category: String(row[2] || "").trim(),
        rarity: String(row[3] || "Common").trim(),
        reelPriority: Number(row[4]) || 0,
        hidden: String(row[5] || "FALSE").trim().toUpperCase() === "TRUE",
        icon: String(row[6] || "🏆").trim(),
        description: String(row[7] || "").trim(),
        criteriaType: String(row[8] || "").trim(),
        criteriaValue: String(row[9] || "").trim(),
        engineType: String(row[10] || "").trim(),
        secondaryCriteriaType: String(row[11] || "").trim(),
        secondaryCriteriaValue: String(row[12] || "").trim(),
        trackingScope: String(row[13] || "CAREER").trim()
      };
    }
  });
  
  return metadata;
}

function getPlayersData() {
  // Returns all player data from PLAYERS sheet
  const sheet = getSheet("PLAYERS");
  if (!sheet) return [];
  return sheet.getDataRange().getValues();
}

function getSheet(name) {
  // Helper to get sheet by name from main spreadsheet
  try {
    const ss = SpreadsheetApp.openById('1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc');
    const sheet = ss.getSheetByName(name);
    return sheet || null;
  } catch(e) {
    Logger.log('getSheet error for "' + name + '": ' + e);
    return null;
  }
}
