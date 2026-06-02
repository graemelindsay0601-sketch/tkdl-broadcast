function startNewSeason(newSeasonName) {
  const ss = SpreadsheetApp.openById('1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc');
  const playersSheet = ss.getSheetByName('PLAYERS');
  const stateSheet   = ss.getSheetByName('SYSTEM_STATE');
  if (!playersSheet || !stateSheet) { Logger.log('startNewSeason: missing sheets'); return; }
  const season = newSeasonName || getCurrentSeason();
  try { archiveSeasonSnapshot(); } catch(e) { Logger.log('Snapshot failed: ' + e); }
  const formSheet = ss.getSheetByName('FORM_SUBMISSIONS');
  if (formSheet && formSheet.getLastRow() > 1) {
    const prevSeason = String(stateSheet.getRange('B2').getValue() || 'PREV').trim();
    const backupName = 'MATCHES_' + prevSeason;
    let backup = ss.getSheetByName(backupName);
    if (!backup) backup = ss.insertSheet(backupName);
    backup.clearContents();
    const formData = formSheet.getDataRange().getValues();
    backup.getRange(1, 1, formData.length, formData[0].length).setValues(formData);
    Logger.log('Backed up ' + (formData.length - 1) + ' matches to ' + backupName);
    if (formSheet.getLastRow() > 1) { formSheet.deleteRows(2, formSheet.getLastRow() - 1); }
    Logger.log('FORM_SUBMISSIONS cleared for new season');
  }
  const STARTING_POINTS = 25;
  const playersData = playersSheet.getDataRange().getValues();
  let resetCount = 0;
  for (let i = 1; i < playersData.length; i++) {
    if (!playersData[i][0]) continue;
    if (String(playersData[i][1] || '').toUpperCase() === 'INACTIVE') continue;
    playersSheet.getRange(i + 1, 4).setValue(STARTING_POINTS);
    playersSheet.getRange(i + 1, 3).setValue(STARTING_POINTS);
    playersSheet.getRange(i + 1, 5).setValue(0);
    playersSheet.getRange(i + 1, 6).setValue(0);
    playersSheet.getRange(i + 1, 7).setValue(0);
    playersSheet.getRange(i + 1, 8).setValue(STARTING_POINTS);
    resetCount++;
  }
  Logger.log('Reset ' + resetCount + ' players to ' + STARTING_POINTS + ' points');
  stateSheet.getRange('B2').setValue(season);
  stateSheet.getRange('B3').setValue(new Date());
  stateSheet.getRange('B4').setValue(new Date());
  try { rebuildLeaderboard(); }       catch(e) { Logger.log('rebuildLeaderboard: ' + e); }
  try { rebuildCareerLeaderboard(); } catch(e) { Logger.log('careerLB: ' + e); }
  rebuildLeagueDataCache();
  Logger.log('Season rollover complete. Welcome to ' + season + '!');
}

function joinLeague(data) {
  const name = String(data.playerName || '').trim();
  if (!name) return { success: false, error: 'Please enter your name.' };
  if (name.length < 2) return { success: false, error: 'Name must be at least 2 characters.' };
  if (name.length > 30) return { success: false, error: 'Name must be 30 characters or less.' };
  if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(name)) return { success: false, error: 'Name can only contain letters, numbers, spaces, hyphens and apostrophes.' };
  const existing = findPlayerByName(name);
  if (existing !== -1) return { success: false, error: name + ' is already registered in the league.' };
  try { createPlayer(name); } catch(e) { Logger.log('joinLeague createPlayer failed: ' + e); return { success: false, error: 'Could not create player. Please try again.' }; }
  try { rebuildLeaderboard(); } catch(e) {}
  try { rebuildCareerLeaderboard(); } catch(e) {}
  rebuildLeagueDataCache();
  Logger.log('New player joined: ' + name);
  return { success: true, playerName: name, message: name + ' has joined the league!' };
}

function archiveSeasonSnapshot() {
  const ss           = SpreadsheetApp.openById('1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc');
  const playersSheet = ss.getSheetByName('PLAYERS');
  if (!playersSheet) return;
  const season = getCurrentSeason();
  let snapSheet = ss.getSheetByName('SEASON_STANDINGS_ARCHIVE');
  if (!snapSheet) {
    snapSheet = ss.insertSheet('SEASON_STANDINGS_ARCHIVE');
    snapSheet.appendRow(['Season','Rank','Player','Points','Wins','Losses','ELO','Status','ArchivedAt']);
  }
  const existing = snapSheet.getDataRange().getValues().slice(1);
  if (existing.some(r => String(r[0]) === season)) { Logger.log('Snapshot already exists for ' + season); return; }
  const players = playersSheet.getDataRange().getValues().slice(1)
    .filter(r => r[0] && String(r[1] || '').toUpperCase() !== 'INACTIVE')
    .sort((a, b) => Number(b[3]) - Number(a[3]));
  const now = new Date();
  players.forEach((row, i) => {
    snapSheet.appendRow([season, i + 1, String(row[0]), Number(row[3]) || 0,
      Number(row[5]) || 0, Number(row[6]) || 0, Number(row[8]) || 1000,
      String(row[1] || 'ACTIVE'), now]);
  });
  Logger.log('Snapshot saved: ' + season + ' (' + players.length + ' players)');
}

function getSeasonStandings(seasonName) {
  const sheet = getSheet('SEASON_STANDINGS_ARCHIVE');
  if (!sheet || sheet.getLastRow() <= 1) return [];
  return sheet.getDataRange().getValues().slice(1)
    .filter(r => String(r[0]) === seasonName)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map(r => ({ rank: Number(r[1]) || 0, name: String(r[2]) || '', points: Number(r[3]) || 0,
      wins: Number(r[4]) || 0, losses: Number(r[5]) || 0, elo: Number(r[6]) || 1000,
      status: String(r[7]) || 'ACTIVE' }));
}

function getNextAchievementsForPlayer(player) {
  const metadata = getAchievementMetadataV2();
  const unlocked = new Set((player.achievements || []).map(a => a.id));
  let careerWins = 0, careerLosses = 0, careerGames = 0;
  if (player.careerStats) {
    careerWins = player.careerStats.totalWins || 0;
    careerLosses = player.careerStats.totalLosses || 0;
    careerGames = player.careerStats.totalMatches || 0;
  } else if (player.careerWins !== undefined) {
    careerWins = player.careerWins || 0; careerLosses = player.careerLosses || 0; careerGames = player.careerGames || 0;
  } else {
    try {
      const ss = SpreadsheetApp.openById('1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc');
      const sheet = ss.getSheetByName('PLAYERS');
      const data = sheet.getDataRange().getValues();
      const pName = String(player.name || '').trim().toLowerCase();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0] || '').trim().toLowerCase() === pName) {
          careerWins = Number(data[i][14]) || 0;
          careerLosses = Number(data[i][15]) || 0;
          careerGames = Number(data[i][16]) || 0;
          break;
        }
      }
    } catch(e) {}
  }
  const elo = player.elo || 1000;
  const winStreak = player.winStreak || 0;
  const total = careerWins + careerLosses;
  const winRate = total >= 10 ? Math.round((careerWins / total) * 100) : 0;
  const progressMap = {
    FIRST_BLOOD:   { current: careerWins,  target: 1,    label: 'career win'   },
    WARMED_UP:     { current: careerWins,  target: 5,    label: 'career wins'  },
    BREAKTHROUGH:  { current: careerWins,  target: 10,   label: 'career wins'  },
    WARLORD:       { current: careerWins,  target: 25,   label: 'career wins'  },
    LEGEND:        { current: careerWins,  target: 50,   label: 'career wins'  },
    IMMORTAL:      { current: careerWins,  target: 100,  label: 'career wins'  },
    APEX_PREDATOR: { current: careerWins,  target: 250,  label: 'career wins'  },
    ETERNAL:       { current: careerWins,  target: 500,  label: 'career wins'  },
    FIGHTER:       { current: careerGames, target: 5,    label: 'games played' },
    GLADIATOR:     { current: careerGames, target: 25,   label: 'games played' },
    VETERAN:       { current: careerGames, target: 50,   label: 'games played' },
    PROFESSIONAL:  { current: careerGames, target: 75,   label: 'games played' },
    MARATHON:      { current: careerGames, target: 100,  label: 'games played' },
    IRONMAN:       { current: careerGames, target: 250,  label: 'games played' },
    HOT_STREAK:    { current: winStreak,   target: 3,    label: 'win streak'   },
    RED_HOT:       { current: winStreak,   target: 5,    label: 'win streak'   },
    UNSTOPPABLE:   { current: winStreak,   target: 10,   label: 'win streak'   },
    EXECUTIONER:   { current: winStreak,   target: 15,   label: 'win streak'   },
    SUPERSTAR:     { current: elo,         target: 1200, label: 'ELO'          },
    BULLSEYE:      { current: winRate,     target: 60,   label: '% win rate'   },
    PRECISION:     { current: winRate,     target: 70,   label: '% win rate'   },
    SNIPER:        { current: winRate,     target: 80,   label: '% win rate'   },
  };
  const candidates = [];
  Object.entries(progressMap).forEach(([id, prog]) => {
    if (unlocked.has(id)) return;
    const meta = metadata[id];
    if (!meta) return;
    if (String(meta.hidden || '').toUpperCase() === 'TRUE') return;
    const pct = Math.min(99, Math.round((prog.current / prog.target) * 100));
    candidates.push({ id, name: meta.name || id, description: meta.description || '',
      rarity: meta.rarity || 'Common', icon: meta.icon || '🏆',
      current: prog.current, target: prog.target,
      remaining: Math.max(0, prog.target - prog.current), label: prog.label, pct });
  });
  return candidates.filter(c => c.pct < 100).sort((a, b) => b.pct - a.pct).slice(0, 3);
}