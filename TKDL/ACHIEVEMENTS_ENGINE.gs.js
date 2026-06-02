/* =========================================================
   TKDL ACHIEVEMENT ENGINE V2
   PRODUCTION REFACTOR BUILD

   Refactor Goals:
   - Preserve achievement ecosystem
   - Preserve hidden achievements
   - Preserve endgame scaling
   - Preserve rarity structure

   Stability Fixes:
   - Removed duplicate state fields
   - Disabled impossible replay unlocks
   - Tagged future ranked systems
   - Tagged future season-finalization systems
   - Preserved metadata integrity
   - Preserved achievement IDs
========================================================= */

/* =========================================================
   TKDL ACHIEVEMENT ENGINE V2
========================================================= */

function createAchievementEngine(){

  return {

    unlocked:
      new Set(),

    playerStats:
      {},

    eliminations:
      [],

    topWins:
      [],

    seasonLosses:
      {},

    seasonGames:
      {},

    playerSeasons:
      {},

    seasonLeaders:
      {},

    seasonChampions:
      {},            

  };

}

function getOrCreatePlayerState(

  engine,
  playerId,
  playerName

){

  if(
    !engine.playerStats[playerId]
  ){

    engine.playerStats[playerId] = {

      playerId,
      playerName,

      wins: 0,
      losses: 0,

      gamesPlayed: 0,

      streak: 0,
      bestStreak: 0,

      lossStreak: 0,
      bestLossStreak: 0,  

      eliminations: 0,

      topWins: 0,

      allInWins: 0,

      achievements:
        new Set(),

      highStakeWins: 0,

      rivals: {},

      beatenPlayers: {},

      lossesAgainst: {},

      eliminatedPlayers: 0,

      revengeWins: 0,

      upsetWins: 0,

      streakBreaks: 0,

      seasonWins: {},

      seasonStreaks: {} ,

      underdogWins: 0,

      eliminationWins: 0,

      survivalWins: 0,

      flawlessSeasons: 0,

      totalStakeWon: 0,

      flawlessRuns: 0,

      dynastySeasons: 0,

      clutchWins: 0,

      giantKills: 0,

      mythicWins: 0,

      survivalChains: 0,

      apexMoments: 0,

      eliteVictories: 0,

      zeroStakeWins: 0,

      maxStakeWins: 0,

      comebackChains: 0,

      perfectSeasons: 0,

      comebackWins: 0,

      flawlessVictories: 0,

      rivalryWins: 0,

      legendaryVictories: 0,

      miracleWins: 0,

      deadlockWins: 0,

      dailyGrind: 0,

      titanKills: 0,

      millionaireGames: 0,

      featuredWins: 0,

      upsetVictories: 0,

      lowPointWins: 0,

      activeSeasons: 0,

      weeklyWinChains: 0,

      chaosWins: 0,

      achievementPoints: 0,

      eliminationChains: 0,

      seasonDominance: 0,

      undefeatedSeasons: 0,

      upsetChains: 0,

      seasonalTitles: 0,

      perfectSeasonChains: 0,

      eliteUnderdogWins: 0,

      hiddenMastery: 0,

      assassinationCount: 0,

      lowPointVictories: 0,

      inactiveSeasonWins: 0,

      detonatorWins: 0,

      snakeVictories: 0,

      frozenSeasons: 0,

                                                   

    };

  }

  return engine.playerStats[playerId];

}

function getRealPlayerId(
  playerName
){

  const players =
    getPlayersData()
      .slice(1);

  const normalized =

    String(playerName || "")
      .trim()
      .toLowerCase();

  const match =
    players.find(row =>

      String(row[0] || "")
        .trim()
        .toLowerCase()

      === normalized

    );

  if(match){

    return match[13];

  }

  return normalizeReplayPlayerId(
    playerName
  );

}

function processReplayMatch(

  engine,
  matchRow

){

  const p1 =
    String(matchRow[1] || "")
      .trim();

  const p2 =
    String(matchRow[2] || "")
      .trim();

  const winnerName =
    String(matchRow[3] || "")
      .trim();

  const stake =
    Number(matchRow[4]) || 0;

  const gameType =
    String(matchRow[5] || "");

  const isFeaturedMatch =

    gameType
      .toLowerCase()
      .includes(
        "featured"
      );    

  const season =
    String(matchRow[6] || "");

  if(
    !p1 ||
    !p2 ||
    !winnerName
  ){
    return;
  }

  const loserName =

    winnerName === p1
      ? p2
      : p1;

const winnerId =
  getRealPlayerId(
    winnerName
  );

const loserId =
  getRealPlayerId(
    loserName
  );

  const winner =
    getOrCreatePlayerState(
      engine,
      winnerId,
      winnerName
    );

  const loser =
    getOrCreatePlayerState(
      engine,
      loserId,
      loserName
    );

  winner.gamesPlayed++;
  loser.gamesPlayed++;

  const totalGames =

    winner.wins +
    winner.losses;

  const winRate =

    totalGames > 0
      ? winner.wins / totalGames
      : 0;

if(
  !winner.seasonWins[
    season
  ]
){

  winner.activeSeasons++;

}







  winner.wins++;
  loser.losses++;

  if(
    loser.wins === 0 &&
    loser.losses >= 10
  ){

    loser.frozenSeasons++;

  }  

  winner.totalStakeWon +=
    stake;



   

  if(isFeaturedMatch){

    winner.featuredWins++;

  }


  if(
    loser.wins >=
    winner.wins + 100
  ){

    winner.upsetVictories++;

  }

  if(
    loser.wins >=
    winner.wins + 250
  ){

    winner.detonatorWins++;

  }

  if(
    loser.bestStreak >= 25
  ){

    winner.eliteUnderdogWins++;

  }

  if(
    loser.wins >=
    winner.wins + 100
  ){

    winner.upsetChains++;

  }  

  if(
    stake >= 25000 &&
    loser.bestStreak >= 10
  ){

    winner.chaosWins++;

  }    

  if(
    loser.streak >= 20
  ){

    winner.titanKills++;

  }

  if(
    stake >= 50000
  ){

    winner.millionaireGames++;

  }

  if(
    loser.wins >= winner.wins + 50
  ){

    winner.miracleWins++;

  }

  if(
    winner.streak === 1 &&
    loser.streak >= 10
  ){

    winner.comebackWins++;

  }

  if(
    stake >= 1000 &&
    loser.streak >= 10
  ){

    winner.legendaryVictories++;

  }

    

  if(
    stake === 0
  ){

    winner.zeroStakeWins++;

  }

  if(
    stake >= 25000
  ){

    winner.maxStakeWins++;

  }

  if(
    loser.streak >= 10
  ){

    winner.comebackChains++;

  }     

  if(
    stake >= 5000
  ){

    winner.clutchWins++;

  }

  if(
    loser.bestStreak >= 15
  ){

    winner.giantKills++;

  }

  if(
    loser.losses >= 25
  ){

    winner.eliminationChains++;

  }

  if(
    loser.losses >= 50
  ){

    winner.assassinationCount++;

  }    

  if(
    stake >= 10000
  ){

    winner.mythicWins++;

  }

  if(
    loser.wins >= 100
  ){

    winner.eliteVictories++;

  }     


winner.seasonWins[
  season
] =

  (
    winner.seasonWins[
      season
    ] || 0
  ) + 1;

const currentWins =

  winner.seasonWins[
    season
  ];

const currentLeader =

  engine.seasonLeaders[
    season
  ];

if(
  !currentLeader ||
  currentWins >
  currentLeader.wins
){

  engine.seasonLeaders[
    season
  ] = {

    playerId:
      winner.playerId,

    wins:
      currentWins

    };

}

  engine.playerSeasons[
    winner.playerId
  ] =

    engine.playerSeasons[
      winner.playerId
    ] || new Set();

  engine.playerSeasons[
    winner.playerId
  ].add(season);

  engine.seasonGames[
    winner.playerId +
    "::" +
    season
  ] =

    (
      engine.seasonGames[
        winner.playerId +
        "::" +
        season
      ] || 0
    ) + 1;

  engine.seasonGames[
    loser.playerId +
    "::" +
    season
  ] =

    (
      engine.seasonGames[
        loser.playerId +
        "::" +
        season
      ] || 0
    ) + 1;

  engine.seasonLosses[
    loser.playerId +
    "::" +
    season
  ] =

    (
      engine.seasonLosses[
        loser.playerId +
        "::" +
        season
      ] || 0
    ) + 1;

const seasonsPlayed =

  engine.playerSeasons[
    winner.playerId
  ]
    ? engine.playerSeasons[
        winner.playerId
      ].size
    : 0;

const currentSeasonGames =

  engine.seasonGames[
    winner.playerId +
    "::" +
    season
  ] || 0;

  const loserPreviousStreak =
    loser.streak;

  winner.streak++;
  loser.streak = 0;

const previousLossStreak =
  winner.lossStreak;



winner.lossStreak = 0;

if(
  previousLossStreak >= 5
){

  winner.lowPointVictories++;

}
 

loser.lossStreak++;

if(
  loser.lossStreak >
  loser.bestLossStreak
){

  loser.bestLossStreak =
    loser.lossStreak;

}

if(
  loserPreviousStreak >= 5
){

  winner.streakBreaks++;

}

if(
  loserPreviousStreak >= 10
){

  winner.underdogWins++;

}

  if(
    winner.streak >
    winner.bestStreak
  ){
    winner.bestStreak =
      winner.streak;
  }

  winner.beatenPlayers[
    loser.playerId
  ] =

    (
      winner.beatenPlayers[
        loser.playerId
      ] || 0
    ) + 1;

loser.lossesAgainst[
  winner.playerId
] =

  (
    loser.lossesAgainst[
      winner.playerId
    ] || 0
  ) + 1;

if(

  winner.lossesAgainst[
    loser.playerId
  ] >= 3

){

  winner.revengeWins++;

}

  if(
    winner.lossesAgainst[
      loser.playerId
    ] >= 10
  ){

    winner.snakeVictories++;

  }

  winner.rivals[
    loser.playerId
  ] =

    (
      winner.rivals[
        loser.playerId
      ] || 0
    ) + 1;

    if(
  winner.rivals[
    loser.playerId
  ] >= 25
){

  winner.rivalryWins++;

}

  if(
    loser.losses >= 25
  ){

    winner.eliminationWins++;

  }

  if(stake >= 1000){

    winner.highStakeWins++;
    winner.allInWins++;

  }

evaluateCoreAchievements(
  engine,
  winner,
  loser,
  {
    stake,
    season,
    gameType
  }
);



}



function evaluateCoreAchievements(
  engine,
  winner,
  loser,
  context
){
  const metadata  = getAchievementMetadataV2();
  const stake     = Number(context.stake)   || 0;
  const season    = String(context.season || '').trim();
  const gameType  = String(context.gameType || '').toLowerCase();
  const isFeatured = gameType.includes('featured');

  // ---- helpers ----
  function wr(p){
    return p.gamesPlayed > 0 ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
  }
  function maxSeasonWins(p){
    const vals = Object.values(p.seasonWins || {});
    return vals.length ? Math.max(...vals) : 0;
  }
  function maxSeasonStreak(p){
    const vals = Object.values(p.seasonStreaks || {});
    return vals.length ? Math.max(...vals) : 0;
  }
  function maxBeaten(p){
    const vals = Object.values(p.beatenPlayers || {});
    return vals.length ? Math.max(...vals) : 0;
  }

  function check(player, isWinner){
    if(!player) return;
    const g  = player.gamesPlayed || 0;
    const w  = player.wins        || 0;
    const rate = wr(player);

    Object.values(metadata).forEach(ach => {
      if(player.achievements.has(ach.id)) return;
      const v   = Number(ach.value)    || 0;
      const sv  = Number(ach.secValue) || 0;
      let met   = false;

      switch(ach.criteria){

        /* ======= STAT_BASED ======= */
        case 'CAREER_WINS':         met = w >= v; break;
        case 'CAREER_GAMES':        met = g >= v; break;
        case 'CAREER_POINTS':       met = (player.totalStakeWon||0) >= v; break;
        case 'WIN_RATE':            met = rate >= v && (!sv || g >= sv); break;
        case 'WIN_RATE_AFTER_50':   met = rate >= v && g >= 50; break;
        case 'ELO':                 met = (player.eloScore||1000) >= v && (!sv || g >= sv); break;
        case 'TOTAL_ACHIEVEMENTS':  met = player.achievements.size >= v; break;
        case 'CURRENT_RANK':        met = (player.rank||999) <= v && (!sv || g >= sv); break;
        case 'TIER_REACHED':
          // evaluate Bronze/Silver/Gold from wins count as proxy
          if(ach.id === 'BRONZE_BLOODED') met = w >= 5;
          else if(ach.id === 'SILVER_STANDARD') met = w >= 20;
          else if(ach.id === 'GOLDEN_ERA') met = w >= 50;
          break;
        case 'ALL_HIDDEN_UNLOCKED':
          met = Object.values(metadata)
            .filter(a => a.hidden)
            .every(a => player.achievements.has(a.id));
          break;

        /* ======= MATCH_EVENT ======= */
        case 'SINGLE_MATCH_STAKE':  met = isWinner && stake >= v; break;
        case 'ELIMINATIONS':        met = (player.eliminations||0) >= v; break;
        case 'TOP_PLAYER_WINS':     met = (player.topWins||0) >= v; break;
        case 'MATCH_STREAK':        met = (player.streak||0) >= v && (!sv || g >= sv); break;
        case 'UNBEATEN_STREAK':     met = (player.streak||0) >= v && (!sv || g >= sv); break;
        case 'LOW_POINTS_WIN':      met = (player.lowPointWins||0) >= v; break;
        case 'COMEBACK_WINS':       met = (player.comebackWins||0) >= v; break;
        case 'ALL_IN_WAGERS':       met = (player.allInWins||0) >= v; break;
        case 'ELIMINATE_TOP_PLAYER':met = (player.giantKills||0) >= v; break;
        case 'SAME_PLAYER_WINS':    met = maxBeaten(player) >= v; break;
        case 'HIGH_STAKE_MATCHES':  met = (player.highStakeWins||0) >= v; break;
        case 'ELIMINATION_STREAK':  met = (player.eliminationChains||0) >= v; break;
        case 'RIVAL_WINS':          met = (player.rivalryWins||0) >= v; break;
        case 'FEATURED_MATCH_WINS': met = (player.featuredWins||0) >= v; break;
        case 'RECOVER_FROM_ONE':    met = (player.comebackWins||0) >= v; break;
        case 'LOSS_STREAK':         met = (player.lossStreak||0) >= v && (!sv || g >= sv); break;

        /* ======= SEASON_EVENT ======= */
        case 'SEASONS_WON':         met = (player.dynastySeasons||0) >= v; break;
        case 'ACTIVE_SEASONS':      met = (player.activeSeasons||0) >= v; break;
        case 'PERFECT_SEASON':      met = (player.perfectSeasons||0) >= v; break;
        case 'SEASON_WINS':         met = maxSeasonWins(player) >= v; break;
        case 'FINAL_SURVIVOR':      met = (player.survivalWins||0) >= v; break;
        case 'LOW_LOSS_SEASON':     met = (player.undefeatedSeasons||0) >= v; break;
        case 'LOW_LOSSES':          met = (player.undefeatedSeasons||0) >= v && (!sv || g >= sv); break;
        case 'ELIMINATED_NO_WINS':  met = (player.frozenSeasons||0) >= v; break;
        case 'TOP3_FULL_SEASON':    met = (player.flawlessSeasons||0) >= v; break;
        case 'FORTRESS':            met = (player.flawlessSeasons||0) >= v; break;
        case 'RANK_CLIMB':          met = (player.upsetWins||0) >= v; break;
        case 'RANK_DROP':           met = !isWinner && (player.lossStreak||0) >= v; break;
        case 'FREEFALL':            met = !isWinner && (player.lossStreak||0) >= v; break;
        case 'FIRST_SEASON_TOP3':   met = (player.survivalChains||0) >= v; break;
        case 'METEOR':              met = (player.survivalChains||0) >= v; break;
        case 'CLIMBER':             met = (player.upsetWins||0) >= v; break;
        case 'STORM_BRINGER':       met = (player.seasonDominance||0) >= v; break;
        case 'ROCKET_START':        met = maxSeasonStreak(player) >= v; break;
        case 'SEASON_START_STREAK': met = maxSeasonStreak(player) >= v; break;
        case 'BRICK_WALL':          met = (player.undefeatedSeasons||0) >= v && (!sv || g >= sv); break;
        case 'MOMENTUM':            met = (player.weeklyWinChains||0) >= v; break;
        case 'FROZEN_OUT':          met = (player.frozenSeasons||0) >= v; break;
        case 'SURVIVOR_ELITE':      met = (player.activeSeasons||0) >= v; break;
        case 'HISTORIAN':           met = (player.activeSeasons||0) >= v; break;
        case 'WIN_COLLECTOR':       met = (player.activeSeasons||0) >= v; break;
        case 'IRON_WALL':           met = (player.undefeatedSeasons||0) >= v; break;
        case 'HALL_OF_FAME':        met = (player.dynastySeasons||0) >= v; break;
        case 'UNTOUCHABLE':         met = (player.perfectSeasons||0) >= v; break;
        case 'SURVIVOR':            met = (player.activeSeasons||0) >= v; break;
        case 'CHAMPION':            met = (player.dynastySeasons||0) >= v; break;
        case 'DYNASTY':             met = (player.dynastySeasons||0) >= v; break;

        default: break;
      }

      if(met) unlockAchievementV2(engine, player, ach.id);
    });
  }

  check(winner, true);
  check(loser,  false);
}

function unlockAchievementV2(

  engine,
  player,
  achievementId

){

  const key =

    player.playerId +
    "::" +
    achievementId;

  if(
    engine.unlocked.has(key)
  ){
    return;
  }

  engine.unlocked.add(key);

  player.achievements.add(
    achievementId
  );  

  const metadata =
    getAchievementMetadataV2()[
      achievementId
    ];

  if(!metadata){
    return;
  }

  const sheet =
    getSheet(
      "PLAYER_ACHIEVEMENTS"
    );

sheet.appendRow([

  Utilities.getUuid(),

  player.playerId,

  achievementId,

  new Date(),

  getCurrentSeason(),

  metadata.rarity

]);

  Logger.log(

    "UNLOCKED: " +
    achievementId +
    " for " +
    player.playerId

  );

}

/* =========================================================
   PLAYER IDS
========================================================= */

function normalizeReplayPlayerId(
  playerName
){

return (
  playerName
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
);

}

/* =========================================================
   ACHIEVEMENT METADATA
========================================================= */

function getAchievementMetadataV2(){
  try {
    const ss    = SpreadsheetApp.openById('1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc');
    const sheet = ss.getSheetByName('ACHIEVEMENT_METADATA');
    if(!sheet) return {};
    const rows  = sheet.getDataRange().getValues().slice(1);
    const out   = {};
    rows.forEach(function(row){
      const id = String(row[1]||'').trim();
      if(!id) return;
      out[id] = {
        id:          id,
        name:        String(row[0]||'').trim(),
        category:    String(row[2]||'').trim(),
        rarity:      String(row[3]||'').trim(),
        priority:    Number(row[4]) || 0,
        hidden:      String(row[5]||'').toLowerCase() === 'true',
        icon:        String(row[6]||'').trim(),
        description: String(row[7]||'').trim(),
        criteria:    String(row[8]||'').trim(),
        value:       Number(row[9])  || 0,
        engine:      String(row[10]||'').trim(),
        secCriteria: String(row[11]||'').trim(),
        secValue:    Number(row[12]) || 0,
        scope:       String(row[13]||'').trim()
      };
    });
    return out;
  } catch(e){
    Logger.log('getAchievementMetadataV2 error: ' + e);
    return {};
  }
}
