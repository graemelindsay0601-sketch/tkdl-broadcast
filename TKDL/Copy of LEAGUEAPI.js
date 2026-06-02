function getRecentMatches(){

  const sheet =
    getSheet(
      SHEETS.FORM_SUBMISSIONS
    );

  if(!sheet)
    return [];

  const data =
    sheet
      .getDataRange()
      .getValues();

  if(data.length <= 1)
    return [];

  return data
    .slice(1)
    .reverse()
    .slice(0,10)
    .map(row => ({

      timestamp:
        row[0],

      match:
        row[1],

      stake:
        row[2],

      winner:
        row[3],

      gameType:
        row[4]

    }));

}

function getCurrentSeason(){

  const now = new Date();

  const months = [

    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER"

  ];

  const month =

    months[
      now.getMonth()
    ];

  const year =
    now.getFullYear();

  return `${month}_${year}`;

}

function getLeagueDataCore(){

  const playersData =
    getPlayersData();

  const careerStats =
    calculateCareerStats();

  return playersData
    .slice(1)
    .filter(row => row[0])

    .map(row => ({

      name:
        row[0],

      points:
  Number(row[3]) || 0,  

      playerId:
        row[13] || "",

      elo:
        Number(row[8]) || 1000,

      rank:
  Number(row[17]) || 999,  

career:

  careerStats[row[0]]

  ||

  {

    wins:0,
    losses:0,
    games:0,
    winRate:0

  },

season: {

  wins:
    Number(row[5]) || 0,

  losses:
    Number(row[6]) || 0,

  games:
    Number(row[4]) || 0,

  winRate:

    row[4]

      ?

      Math.round(

        (
          (Number(row[5]) || 0)
          /
          (Number(row[4]) || 1)

        ) * 100

      )

      : 0

}

}));

}



function getLeagueData(){

  const playersData =
    getPlayersData();


    const careerStats =
  calculateCareerStats();

  const achievementMetadata =
  getAchievementMetadata();

const playerAchievements =
  getPlayerAchievements();

  const players =
    playersData
      .slice(1)
      .filter(row => row[0])
.map(row => ({

  name:
    row[0],

  status:
    row[1],

  points:
    Number(row[3]) || 0,

  games:
    Number(row[4]) || 0,

  wins:
    Number(row[5]) || 0,

  losses:
    Number(row[6]) || 0,

  winRate:

    row[4]

      ?

      Math.round(
        (
          (Number(row[5]) || 0)
          /
          (Number(row[4]) || 1)
        ) * 100
      )

      : 0,

  elo:
    Number(row[8]) || 1000,

  tier:
    row[9] || "🥇 Gold",

  rank:
    Number(row[17]) || 0,

  previousRank:
    Number(row[18]) || 0,

    rankChange:

  (Number(row[18]) || 0)

  -

  (Number(row[17]) || 0),

  playerId:
  row[13] || "", 


career:

  careerStats[row[0]]

  ||

  {

    wins:0,
    losses:0,
    games:0,
    winRate:0

  },

season: {

  wins:
    Number(row[5]) || 0,

  losses:
    Number(row[6]) || 0,

  games:
    Number(row[4]) || 0,

  winRate:

    row[4]

      ?

      Math.round(

        (
          (Number(row[5]) || 0)
          /
          (Number(row[4]) || 1)

        ) * 100

      )

      : 0

}



  ,

achievements: []

}));

  players.sort(
    (a,b) => b.points - a.points
  );

players.forEach(player => {

  const unlocked =
    playerAchievements.filter(a =>

      a.playerId === player.playerId

    );

  player.achievements =
    unlocked.map(unlock => {

      return achievementMetadata.find(meta =>

        meta.id === unlock.achievementId

      );

    }).filter(Boolean);

});

  return {

    season:
      getCurrentSeason(),

    generatedAt:
      new Date().toISOString(),

    stats: {

      totalPlayers:
        players.length,

totalMatches:

  Math.floor(

    players.reduce(

      (sum,p) =>

        sum + p.games,

      0

    ) / 2

  ),
      averageElo:

        Math.round(

          players.reduce(

            (sum,p) =>

              sum + p.elo,

            0

          )

          /

          Math.max(players.length,1)

        )

    },

    leaderboard:
      players,

    players:
      players,

    featuredPlayers:
      players.slice(0,3),

    recentMatches:
  getRecentMatches(),

achievements: [],

achievementMetadata:
  achievementMetadata,

rivalries: [],

spotlights: {},

playerAchievements:
  playerAchievements,

seasonArchives:
  getSeasonArchives(),

archivedMatches:
  getArchivedMatches()

  };

}


function getArchivedMatches(){

  const sheet =
    getSheet(
      "ARCHIVED_MATCHES"
    );

  if(!sheet)
    return [];

  const data =
    sheet
      .getDataRange()
      .getValues();

  if(data.length <= 1)
    return [];

  return data
    .slice(1)
    .filter(row => row[1] && row[2])
    .map(row => ({

      season:
        row[0],

      playerA:
        row[1],

      playerB:
        row[2],

      winner:
        row[3],

      gameType:
        row[4]

    }));

}


function calculateCareerStats(){

  const sheet =
    getSheet("CAREER_MATCHES");

  if(!sheet)
    return {};

  const data =
    sheet
      .getDataRange()
      .getValues();

  if(data.length <= 1)
    return {};

  const stats = {};

  data
    .slice(1)
    .forEach(row => {

      const p1 =
        String(row[1] || "").trim();

      const p2 =
        String(row[2] || "").trim();

const winner =
  String(row[3] || "").trim();

      if(!p1 || !p2)
        return;

      [p1,p2].forEach(name => {

        if(!stats[name]){

          stats[name] = {

            wins:0,
            losses:0,
            games:0,
            winRate:0

          };

        }

        stats[name].games++;

      });

      if(stats[winner]){

        stats[winner].wins++;

      }

      const loser =
        winner === p1
          ? p2
          : p1;

      if(stats[loser]){

        stats[loser].losses++;

      }

    });

  Object.keys(stats)
    .forEach(name => {

      const s =
        stats[name];

      s.winRate =
        s.games

          ?

          Math.round(
            (s.wins / s.games) * 100
          )

          : 0;

    });

  return stats;

}


function getPlayerWinStreak(playerName){

  const sheet =
    getSheet("CAREER_MATCHES");

  if(!sheet)
    return 0;

  const data =
    sheet
      .getDataRange()
      .getValues()
      .slice(1)
      .reverse();

  let streak = 0;

  for(let i = 0; i < data.length; i++){

    const row = data[i];

    const p1 =
      String(row[1] || "");

    const p2 =
      String(row[2] || "");

    const winner =
      String(row[3] || "");

    if(
      p1 !== playerName &&
      p2 !== playerName
    ){
      continue;
    }

    if(winner === playerName){

      streak++;

    }else{

      break;

    }

  }

  return streak;

}


function getAchievementMetadata(){

  const sheet =
    getSheet(
      "ACHIEVEMENT_METADATA"
    );

  if(!sheet)
    return [];

  const data =
    sheet
      .getDataRange()
      .getValues();

  return data
    .slice(1)
    .map(row => ({

      name:
        row[0],

      id:
        row[1],

      category:
        row[2],

      rarity:
        row[3],

      reelPriority:
        row[4],

      hidden:
        row[5],

      icon:
        row[6],

description:
  row[7],

criteriaType:
  row[8] || "",

criteriaValue:
  row[9] || "",

engineType:
  row[10] || "",

secondaryCriteriaType:
  row[11] || "",

secondaryCriteriaValue:
  row[12] || "",

trackingScope:
  row[13] || "CAREER"
    }));

}


function getPlayerAchievements(){

  const sheet =
    getSheet(
      "PLAYER_ACHIEVEMENTS"
    );

  if(!sheet)
    return [];

  const data =
    sheet
      .getDataRange()
      .getValues();

  return data
    .slice(1)
    .map(row => ({

      unlockId:
        row[0],

      playerId:
        row[1],

      achievementId:
        row[2],

      unlockedAt:
        row[3],

      season:
        row[4],

      rarity:
        row[5]

    }));

}


function autoUnlockAchievements(){

  const unlockSheet =
    getSheet(
      "PLAYER_ACHIEVEMENTS"
    );

  const metadata =
    getAchievementMetadata();

  const existingUnlocks =
    getPlayerAchievements();

  const players =
    getLeagueDataCore();

  players.forEach(player => {

    const unlockedIds =

      existingUnlocks

        .filter(a =>

          a.playerId ===
          player.playerId

        )

        .map(a =>
          a.achievementId
        );

    metadata.forEach(achievement => {

      if(
        unlockedIds.includes(
          achievement.id
        )
      ){
        return;
      }

      const engineType =

        String(
          achievement.engineType || ""
        ).trim();

      /* =========================
         ONLY PROCESS
         STAT BASED HERE
      ========================= */

      if(
        engineType !==
        "STAT_BASED"
      ){
        return;
      }

      const criteriaType =

        String(
          achievement.criteriaType || ""
        ).trim();

      const criteriaValue =

        Number(
          achievement.criteriaValue || 0
        );

      const secondaryType =

        String(
          achievement
            .secondaryCriteriaType
            || ""
        ).trim();

const secondaryValue =

  Number(
    achievement
      .secondaryCriteriaValue
      || 0
  );

const trackingScope =

  String(
    achievement.trackingScope || "CAREER"
  ).trim();

      let unlocked = false;

      const statSource =

  trackingScope === "SEASON"

    ? player.season

    : player.career;

      /* =========================
         PRIMARY CRITERIA
      ========================= */

      switch(criteriaType){

        case "CAREER_WINS":

          unlocked =

  statSource.wins >=
  criteriaValue;

          break;

  case "CAREER_GAMES":

  unlocked =

    statSource.games >=
    criteriaValue;

  break;

        case "ELO":

          unlocked =

            player.elo >=
            criteriaValue;

          break;

case "WIN_RATE":

  unlocked =

    statSource.winRate >=
    criteriaValue;

  break;

case "CURRENT_RANK":

  unlocked =

    player.rank <=
    criteriaValue;

  break;

}





      /* =========================
         SECONDARY REQUIREMENTS
      ========================= */

      if(
        unlocked &&
        secondaryType
      ){

        switch(secondaryType){

          case "CAREER_GAMES":

            unlocked =

              statSource.games >=
secondaryValue;

            break;

          case "CAREER_WINS":

            unlocked =

  statSource.wins >=
  secondaryValue;

            break;

        }

      }

      /* =========================
         FINAL UNLOCK
      ========================= */

      if(unlocked){

        unlockSheet.appendRow([

          Utilities.getUuid(),

          player.playerId,

          achievement.id,

          new Date(),

          getCurrentSeason(),

          achievement.rarity

        ]);

      }

    });

  });

}



  
function doGet(e){

  const fn =
    e?.parameter?.function || "";

  const playerId =
    e?.parameter?.playerId || "";

  /* =========================
     WEBSITE LOAD
  ========================= */

  if(fn === ""){

    return HtmlService
      .createTemplateFromFile("index")
      .evaluate()
      .setTitle("TKDL")
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );

  }




  /* =========================
     API ROUTES
  ========================= */

  if(fn === "getLeagueData"){

    return ContentService
      .createTextOutput(
        JSON.stringify(
          getLeagueData()
        )
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  }

  if(fn === "getDashboardData"){

    return getDashboardData();

  }

  if(fn === "getSeasonsIndex"){

    return getSeasonsIndex();

  }

  if(fn === "getPlayerProfile"){

    return ContentService
      .createTextOutput(
        JSON.stringify(
          getPlayerProfile(playerId)
        )
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  }

  return ContentService
    .createTextOutput(
      JSON.stringify({
        error:"Invalid function",
        received: fn
      })
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}


/* =========================
   POST API
========================= */

function doPost(e){

  try{

    const fn =
      e?.parameter?.function || "";

const data =
  e.parameter || {};

    if(fn === "submitMatch"){

      return ContentService
        .createTextOutput(
          JSON.stringify(
            submitMatchToSheet(data)
          )
        )
        .setMimeType(
          ContentService.MimeType.JSON
        );

    }

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success:false,
          error:"Invalid POST function"
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  }catch(err){

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success:false,
          error:String(err)
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  }

}

function getSeasonArchives(){

  const sheet =
    getSheet("SEASON_ARCHIVES");

  if(!sheet)
    return [];

  const data =
    sheet
      .getDataRange()
      .getValues();

  if(data.length <= 1)
    return [];

  return data
    .slice(1)
    .map(row => ({

      season:
        row[0] || "",

      champion:
        row[1] || "",

      matches:
        Number(row[2]) || 0,

      highestElo:
        Number(row[3]) || 0,

      players:
        Number(row[4]) || 0,

      notes:
        row[5] || ""

    }));

}


/* =========================
   SUBMIT MATCH
========================= */

function submitMatchToSheet(data){

const ss =
SpreadsheetApp.openById(
  "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
);

  const sheet =
    ss.getSheetByName(
      "FORM_SUBMISSIONS"
    );

  const playersSheet =
    ss.getSheetByName(
      "PLAYERS"
    );

Logger.log(sheet);
Logger.log(playersSheet);

if(!sheet){

  throw new Error(
    "FORM_SUBMISSIONS sheet missing"
  );

}

if(!playersSheet){

  throw new Error(
    "PLAYERS sheet missing"
  );

}

  const playersData =
    playersSheet
      .getDataRange()
      .getValues();

  const existingPlayers =
    playersData
      .slice(1)
      .map(row => String(row[0]));

const p1Raw =
  String(data.player1 || "")
    .trim();

const p2Raw =
  String(data.player2 || "")
    .trim();

const winnerRaw =
  String(data.winner || "")
    .trim();

const normalizePlayerName = name =>

  name
    .toLowerCase()
    .replace(/\s+/g," ")
    .trim();

const existingNameMap = {};

playersData
  .slice(1)
  .forEach(row => {

    const existingName =
      String(row[0] || "").trim();

    existingNameMap[
      normalizePlayerName(
        existingName
      )
    ] = existingName;

  });

const p1 =

  existingNameMap[
    normalizePlayerName(p1Raw)
  ]

  ||

  p1Raw;

const p2 =

  existingNameMap[
    normalizePlayerName(p2Raw)
  ]

  ||

  p2Raw;

const winner =

  existingNameMap[
    normalizePlayerName(winnerRaw)
  ]

  ||

  winnerRaw;

  const gameType =
    String(
      data.gameType || "League"
    );

  const stake =
    Number(data.stake || 3);

  if(!p1 || !p2){

    return {
      success:false,
      error:"Missing players."
    };

  }

  if(p1 === p2){

    return {
      success:false,
      error:"Players cannot match."
    };

  }

  [p1,p2].forEach(name => {

    if(
      !existingPlayers.includes(name)
    ){

      playersSheet.appendRow([

        name,
        "ACTIVE",
        "",
        0,
        0,
        0,
        0,
        "",
        1000,
        "🥉 Bronze"

      ]);

    }

  });

sheet.appendRow([

  new Date(),
  `${p1} vs ${p2}`,
  stake,
  winner,
  gameType

]);

const careerSheet =
  ss.getSheetByName(
    "CAREER_MATCHES"
  );

careerSheet.appendRow([

  new Date(),

  p1,

  p2,

  winner,

  stake,

  gameType,

  getCurrentSeason()

]);

const loser =

  winner === p1
    ? p2
    : p1;



recalculatePlayerStats();

processMatchAchievements(

  winner,
  loser,
  stake

);

return {
  success:true
};

}



function processMatchAchievements(
  winner,
  loser,
  stake
){

  const unlockSheet =
    getSheet(
      "PLAYER_ACHIEVEMENTS"
    );

  const metadata =
    getAchievementMetadata();

  const unlocks =
    getPlayerAchievements();

  const players =
    getLeagueDataCore();

  const winnerData =
    players.find(p =>
      p.name === winner
    );

  const loserData =
    players.find(p =>
      p.name === loser
    );

  if(
    !winnerData ||
    !loserData
  ){
    return;
  }

  metadata.forEach(achievement => {

    if(
      achievement.engineType !==
      "MATCH_EVENT"
    ){
      return;
    }

    const alreadyUnlocked =
      unlocks.some(a =>

        a.playerId ===
        winnerData.playerId

        &&

        a.achievementId ===
        achievement.id

      );

    if(alreadyUnlocked){
      return;
    }

    let unlocked = false;

    switch(achievement.criteriaType){

      case "SINGLE_MATCH_STAKE":

        unlocked =
          stake >=
          Number(
            achievement.criteriaValue
          );

        break;

      case "MATCH_STREAK":

        unlocked =

          getPlayerWinStreak(
            winner
          )

          >=

          Number(
            achievement.criteriaValue
          );

        break;

      case "TOP_PLAYER_WINS":

        unlocked =
          loserData.rank === 1;

        break;

      case "ELIMINATIONS":

        unlocked =
          loserData.points <= 0;

        break;

      case "ALL_IN_WAGERS":

        unlocked =
          stake >= loserData.points;

        break;

      case "LOW_POINTS_WIN":

        unlocked =
          winnerData.points <= 1;

        break;

      case "SAME_PLAYER_WINS":

        unlocked = false;

        break;

    }

    if(unlocked){

      unlockSheet.appendRow([

        Utilities.getUuid(),

        winnerData.playerId,

        achievement.id,

        new Date(),

        getCurrentSeason(),

        achievement.rarity

      ]);

    }

  });

}

function recalculatePlayerStats(){



const ss =
  SpreadsheetApp.openById(
    "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
  );

  const matchesSheet =
    ss.getSheetByName(
      "FORM_SUBMISSIONS"
    );

  const playersSheet =
    ss.getSheetByName(
      "PLAYERS"
    );

const identitySheet =
  ss.getSheetByName(
    "PlayerIdentity"
  );

const identityData =
  identitySheet
    .getDataRange()
    .getValues();

const playersData =
  playersSheet
    .getDataRange()
    .getValues(); 

  if(
    !matchesSheet ||
    !playersSheet
  ){
    return;
  }

  const matchData =
    matchesSheet
      .getDataRange()
      .getValues()
      .slice(1);

  const playerMap = {};

/* =========================
   PRELOAD EXISTING PLAYERS
========================= */

identityData
  .slice(1)
  .forEach(row => {

    const playerId =
      String(row[0] || "").trim();

    const currentName =
      String(row[1] || "").trim();

    const isActive =
      String(row[6] || "")
        .toUpperCase() === "TRUE";

    if(!currentName){
      return;
    }

    playerMap[currentName] = {

      name:
        currentName,

      playerId,

      status:
        isActive
          ? "ACTIVE"
          : "INACTIVE",

      startingPoints:25,

      points:25,

      games:0,
      wins:0,
      losses:0,

      elo:1000,

      highestBalance:25,

      peakElo:1000

    };

  });

  /* =========================
     BUILD PLAYER STATS
  ========================= */

  matchData.forEach(row => {

    const match =
      String(row[1] || "");

    const stake =
      Number(row[2]) || 0;

    const winnerRaw =
  String(row[3] || "").trim();

    const parts =
      match.split(" vs ");

    if(parts.length !== 2){
      return;
    }

    const normalizePlayerName = name =>

  name
    .toLowerCase()
    .replace(/\s+/g," ")
    .trim();

const canonicalNameMap = {};

playersData
  .slice(1)
  .forEach(row => {

    const existingName =
      String(row[0] || "").trim();

    canonicalNameMap[
      normalizePlayerName(
        existingName
      )
    ] = existingName;

  });

const p1Raw =
  parts[0].trim();

const p2Raw =
  parts[1].trim();

const p1 =

  canonicalNameMap[
    normalizePlayerName(p1Raw)
  ]

  ||

  p1Raw;

const p2 =

  canonicalNameMap[
    normalizePlayerName(p2Raw)
  ]

  ||

  p2Raw;

  const winner =

  canonicalNameMap[
    normalizePlayerName(winnerRaw)
  ]

  ||

  winnerRaw;

    [p1,p2].forEach(name => {

      if(!playerMap[name]){

        playerMap[name] = {

          name,
          status:"ACTIVE",

          startingPoints:25,
          points:25,

          games:0,
          wins:0,
          losses:0,

          elo:1000,

          highestBalance:25,

          peakElo:1000

        };

      }

    });

    const loser =
      winner === p1
        ? p2
        : p1;

    /* =========================
       MATCH COUNTS
    ========================= */

    playerMap[p1].games++;
    playerMap[p2].games++;

    playerMap[winner].wins++;
    playerMap[loser].losses++;

    /* =========================
       POINT TRANSFER
    ========================= */

    playerMap[winner].points +=
      stake;

    playerMap[loser].points -=
      stake;

    if(
      playerMap[loser].points <= 0
    ){

      playerMap[loser].points = 0;

      playerMap[loser].status =
        "ELIMINATED";

    }

    /* =========================
       HIGHEST BALANCE
    ========================= */

    [winner,loser].forEach(name => {

      if(
        playerMap[name].points >
        playerMap[name].highestBalance
      ){

        playerMap[name].highestBalance =
          playerMap[name].points;

      }

    });

  });

  /* =========================
     ELO CALCULATION
  ========================= */

  Object.values(playerMap)
    .forEach(player => {

      player.elo =

        Math.round(

          1000 +

          (
            (player.wins - player.losses)
            * 15
          )

        );

      if(
        player.elo >
        player.peakElo
      ){

        player.peakElo =
          player.elo;

      }

    });

  /* =========================
     RANKINGS
  ========================= */

  const rankedPlayers =

    Object.values(playerMap)

      .sort(
        (a,b) => b.points - a.points
      );

  rankedPlayers.forEach((p,index) => {

    p.rank = index + 1;

  });

  /* =========================
     REBUILD PLAYERS SHEET
  ========================= */

  const existingIds = {};

playersData
  .slice(1)
  .forEach(row => {

    existingIds[row[0]] =
      row[13];

  });



const playerRows = {};

playersData
  .slice(1)
  .forEach((row,index) => {

    const existingName =
      String(row[0] || "").trim();

    if(existingName){

      playerRows[
        existingName
      ] = index + 2;

    }

  });

rankedPlayers.forEach((p,index) => {

  const rowNumber =
    playerRows[p.name];

  if(!rowNumber){
    return;
  }

  const tier =

    p.elo >= 1100
      ? "🥇 Gold"

    : p.elo >= 950
      ? "🥈 Silver"

    : "🥉 Bronze";

  const existingRow =
    playersData[rowNumber - 1];

  playersSheet
    .getRange(rowNumber,2,1,19)
    .setValues([[

      p.status,
      existingRow[2] || 25,
      p.points,
      p.games,
      p.wins,
      p.losses,
      p.highestBalance,
      p.elo,
      tier,

      existingRow[10],

      getCurrentSeason(),

      existingRow[12] || true,

      existingRow[13],

    existingRow[14] || 0,
    existingRow[15] || 0,
    existingRow[16] || 0,

      p.rank,

      existingRow[18],

      Math.max(
        p.peakElo,
        existingRow[19] || 1000
      )

    ]]);

});
}


function checkSeasonRollover(){

  const ss =
    SpreadsheetApp.openById(
      "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
    );

  const stateSheet =
    ss.getSheetByName(
      "SYSTEM_STATE"
    );

  if(!stateSheet){
    return;
  }

  const data =
    stateSheet
      .getDataRange()
      .getValues();

  const state = {};

  data
    .slice(1)
    .forEach(row => {

      state[row[0]] = row[1];

    });

  const liveSeason =
    getCurrentSeason();

  const storedSeason =
    state.CURRENT_SEASON;

  /* =========================
     NO CHANGE
  ========================= */

  if(
    liveSeason === storedSeason
  ){

    stateSheet
      .getRange("B3")
      .setValue(
        new Date()
      );

return {

  rollover:false,
  season:liveSeason

};

  }

  /* =========================
     SEASON CHANGED
  ========================= */

  return {

    rollover:true,

    oldSeason:
      storedSeason,

    newSeason:
      liveSeason

  };

}

function archiveSeason(){

  const ss =
    SpreadsheetApp.openById(
      "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
    );

  const archiveSheet =
    ss.getSheetByName(
      "SEASON_ARCHIVES"
    );

  const playersSheet =
    ss.getSheetByName(
      "PLAYERS"
    );

  const matchesSheet =
    ss.getSheetByName(
      "FORM_SUBMISSIONS"
    );

  if(
    !archiveSheet ||
    !playersSheet ||
    !matchesSheet
  ){
    return;
  }

  const playersData =
    playersSheet
      .getDataRange()
      .getValues();

  const matchData =
    matchesSheet
      .getDataRange()
      .getValues();

  const archiveData =
  archiveSheet
    .getDataRange()
    .getValues();

const alreadyArchived =

  archiveData
    .slice(1)
    .some(row =>

      String(row[0]) ===
      getCurrentSeason()

    );

if(alreadyArchived){

  Logger.log(
    "Season already archived."
  );

  return;

}    

  const players =

    playersData
      .slice(1)
      .filter(row => row[0]);

  if(players.length === 0){
    return;
  }

  /* =========================
     CHAMPION
  ========================= */

  const champion =

    players
      .sort(
        (a,b) =>

          Number(b[3]) -
          Number(a[3])

      )[0];

  /* =========================
     HIGHEST ELO
  ========================= */

  let highestElo = 0;

  players.forEach(row => {

    const elo =
      Number(row[8]) || 0;

    if(elo > highestElo){

      highestElo = elo;

    }

  });

  /* =========================
     MATCH COUNT
  ========================= */

  const matchCount =

    Math.max(
      matchData.length - 1,
      0
    );

  /* =========================
     SAVE ARCHIVE
  ========================= */

  archiveSheet.appendRow([

    getCurrentSeason(),

    champion[0],

    matchCount,

    highestElo,

    players.length,

    ""

  ]);

}

function runSeasonRollover(){

  const ss =
    SpreadsheetApp.openById(
      "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
    );

  const playersSheet =
    ss.getSheetByName(
      "PLAYERS"
    );

  const stateSheet =
    ss.getSheetByName(
      "SYSTEM_STATE"
    );

  if(
    !playersSheet ||
    !stateSheet
  ){
    return;
  }

  /* =========================
     CHECK ROLLOVER
  ========================= */

  const rolloverCheck =
    checkSeasonRollover();

  if(
    !rolloverCheck.rollover
  ){

    Logger.log(
      "No rollover required."
    );

    return;
  }

  /* =========================
     ARCHIVE SEASON
  ========================= */

  archiveSeason();

  /* =========================
     RESET PLAYER STATS
  ========================= */




    /* =========================
   AWARD SEASONAL ACHIEVEMENTS
========================= */

awardSeasonalAchievements();

  /* =========================
     UPDATE SYSTEM STATE
  ========================= */

  stateSheet
    .getRange("B2")
    .setValue(
      rolloverCheck.newSeason
    );

  stateSheet
    .getRange("B3")
    .setValue(
      new Date()
    );

  stateSheet
    .getRange("B4")
    .setValue(
      new Date()
    );

  Logger.log(
    "Season rollover complete."
  );

}


function awardSeasonalAchievements(){

  const ss =
    SpreadsheetApp.openById(
      "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
    );

  const playersSheet =
    ss.getSheetByName(
      "PLAYERS"
    );

  const unlockSheet =
    ss.getSheetByName(
      "PLAYER_ACHIEVEMENTS"
    );

  if(
    !playersSheet ||
    !unlockSheet
  ){
    return;
  }

  const players =

    playersSheet
      .getDataRange()
      .getValues()
      .slice(1)
      .filter(row => row[0]);

  if(players.length === 0){
    return;
  }

  /* =========================
     SORTINGS
  ========================= */

  const byPoints =
    [...players]
      .sort(
        (a,b) =>

          Number(b[3]) -
          Number(a[3])

      );

  const byGames =
    [...players]
      .sort(
        (a,b) =>

          Number(b[4]) -
          Number(a[4])

      );

  const byWins =
    [...players]
      .sort(
        (a,b) =>

          Number(b[5]) -
          Number(a[5])

      );

  const byRankClimb =
    [...players]
      .sort(
        (a,b) =>

          (
            Number(b[18]) -
            Number(b[17])
          )

          -

          (
            Number(a[18]) -
            Number(a[17])
          )

      );

  const byRankDrop =
    [...players]
      .sort(
        (a,b) =>

          (
            Number(a[17]) -
            Number(a[18])
          )

          -

          (
            Number(b[17]) -
            Number(b[18])
          )

      );

  /* =========================
     WINNERS
  ========================= */

  const awards = [

    {

      playerId:
        byPoints[0][13],

      achievementId:
        "MVP"

    },

    {

      playerId:
        byGames[0][13],

      achievementId:
        "MOST_ACTIVE"

    },

    {

      playerId:
        byWins[0][13],

      achievementId:
        "REAPER_SEASONAL"

    },

    {

      playerId:
        byRankClimb[0][13],

      achievementId:
        "RISING_STAR"

    },

    {

      playerId:
        byRankDrop[0][13],

      achievementId:
        "COLLAPSING"

    }

  ];

  /* =========================
     INSERT AWARDS
  ========================= */

  awards.forEach(award => {

    const existingAwards =
  getPlayerAchievements();

const alreadyAwarded =

  existingAwards.some(a =>

    a.playerId ===
    award.playerId

    &&

    a.achievementId ===
    award.achievementId

    &&

    a.season ===
    getCurrentSeason()

  );

if(alreadyAwarded){
  return;
}

    if(
      !award.playerId
    ){
      return;
    }

    unlockSheet.appendRow([

      Utilities.getUuid(),

      award.playerId,

      award.achievementId,

      new Date(),

      getCurrentSeason(),

      "Seasonal"

    ]);

  });

}

function backfillCareerMatches(){

  const ss =
    SpreadsheetApp.openById(
      "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
    );

  const formSheet =
    ss.getSheetByName(
      "FORM_SUBMISSIONS"
    );

  const careerSheet =
    ss.getSheetByName(
      "CAREER_MATCHES"
    );

  if(
    !formSheet ||
    !careerSheet
  ){
    return;
  }

  const formData =
    formSheet
      .getDataRange()
      .getValues();

  const careerData =
    careerSheet
      .getDataRange()
      .getValues();

  const existingKeys =
    new Set();

  careerData
    .slice(1)
    .forEach(row => {

      const key = [

        row[1],
        row[2],
        row[3]

      ].join("|");

      existingKeys.add(key);

    });

  formData
    .slice(1)
    .forEach(row => {

      const match =
        String(row[1] || "");

      const winner =
        String(row[3] || "");

      const stake =
        Number(row[2]) || 0;

      const gameType =
        String(row[4] || "");

      const parts =
        match.split(" vs ");

      if(parts.length !== 2){
        return;
      }

      const p1 =
        parts[0].trim();

      const p2 =
        parts[1].trim();

      const key = [
        p1,
        p2,
        winner
      ].join("|");

      if(existingKeys.has(key)){
        return;
      }

      careerSheet.appendRow([

        new Date(),

        p1,

        p2,

        winner,

        stake,

        gameType,

        getCurrentSeason()

      ]);

    });

  Logger.log(
    "Career match backfill complete."
  );

}