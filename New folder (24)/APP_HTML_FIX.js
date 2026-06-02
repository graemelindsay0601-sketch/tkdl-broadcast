/* =========================
   SIMPLIFIED ACHIEVEMENT LOOKUP FIX
   Use ONLY playerId - it's the source of truth
   
   REPLACE THIS FUNCTION in app.html (around line 10-18)
========================= */

// Original broken version (REMOVE THIS):
/*
function getPlayerUnlocks(player) {
  if(!leagueData) return [];
  const unlocks = (leagueData.playerAchievements || []).filter(u =>
    String(u.playerId||'').toLowerCase() === String(player.name||'').toLowerCase() ||
    u.playerId === player.playerId
  );
  const meta = leagueData.allAchievements || leagueData.achievementMetadata || [];
  return unlocks.map(u => meta.find(m => m.id === u.achievementId)).filter(Boolean);
}
*/

// NEW FIXED VERSION (USE THIS):
function getPlayerUnlocks(player) {
  if(!leagueData) return [];
  
  // Use ONLY playerId matching - it's the definitive identifier
  // playerId format: "P001", "P002", etc.
  // This avoids accidental name matches and is more reliable
  const unlocks = (leagueData.playerAchievements || []).filter(u =>
    u.playerId === player.playerId
  );
  
  const meta = leagueData.allAchievements || leagueData.achievementMetadata || [];
  return unlocks
    .map(u => meta.find(m => m.id === u.achievementId))
    .filter(Boolean);
}
