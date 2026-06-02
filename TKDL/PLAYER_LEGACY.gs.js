/* =========================================================
   TKDL PLAYER LEGACY ENGINE
========================================================= */

function buildPlayerLegacyProfile(
  playerName
){

  const matches =
    getCareerMatches();

  const achievementsSheet =
    getSheet(
      "PLAYER_ACHIEVEMENTS"
    );

  const achievementRows =

    achievementsSheet
      .getDataRange()
      .getValues()
      .slice(1);

  /* =========================
     PLAYER MATCHES
  ========================= */

  const playerMatches =

    matches.filter(row => {

      const p1 =
        String(row[1] || "")
          .trim();

      const p2 =
        String(row[2] || "")
          .trim();

      return (

        p1 === playerName
        ||
        p2 === playerName

      );

    });

  /* =========================
     BASIC STATS
  ========================= */

  const totalGames =
    playerMatches.length;

  const totalWins =

    playerMatches.filter(row =>

      String(row[3] || "")
        .trim()

      ===

      playerName

    ).length;

  const totalLosses =
    totalGames - totalWins;

  const winRate =

    totalGames > 0

      ?

      Math.round(
        (totalWins / totalGames) * 100
      )

      :

      0;

  /* =========================
     BIGGEST WIN
  ========================= */

  let biggestStake = 0;

  playerMatches.forEach(row => {

    const winner =
      String(row[3] || "")
        .trim();

    const stake =
      Number(row[4] || 0);

    if(
      winner === playerName
      &&
      stake > biggestStake
    ){

      biggestStake = stake;

    }

  });

  /* =========================
     ACHIEVEMENTS
  ========================= */

  const playerAchievements =

    achievementRows.filter(row =>

      String(row[1] || "")
        .trim()

      ===

      playerName

    );

  const achievementIds =

    playerAchievements.map(row =>

      String(row[2] || "")
        .trim()

    );

  const prestigeScore =
    getAchievementScore(
      achievementIds
    );

  const prestigeTier =
    getPrestigeLevel(
      prestigeScore
    );

  /* =========================
     TITLE SYSTEM
  ========================= */


  /* =========================
     LEGACY PROFILE
  ========================= */
  /* =========================
   RIVALRY ANALYSIS
========================= */

const rivalryMap = {};

playerMatches.forEach(row => {

  const p1 =
    String(row[1] || "")
      .trim();

  const p2 =
    String(row[2] || "")
      .trim();

  const winner =
    String(row[3] || "")
      .trim();

  const opponent =

    p1 === playerName
      ? p2
      : p1;

  if(!rivalryMap[opponent]){

    rivalryMap[opponent] = {

      games:0,
      wins:0,
      losses:0

    };

  }

  rivalryMap[opponent]
    .games++;

  if(winner === playerName){

    rivalryMap[opponent]
      .wins++;

  }else{

    rivalryMap[opponent]
      .losses++;

  }

});

/* =========================
   SIGNATURE RIVAL
========================= */

let signatureRival =
  null;

let rivalryScore =
  0;

Object.entries(rivalryMap)
  .forEach(([name,data]) => {

    const score =

      (
        data.games * 2
      )

      +

      (
        Math.abs(
          data.wins -
          data.losses
        )
      );

    if(score > rivalryScore){

      rivalryScore =
        score;

      signatureRival = {

        name,

        games:
          data.games,

        wins:
          data.wins,

        losses:
          data.losses

      };

    }

  });

/* =========================
   ELIMINATION COUNT
========================= */

const eliminations =

  playerMatches.filter(row => {

    const winner =
      String(row[3] || "")
        .trim();

    const loser =

      winner === row[1]
        ? row[2]
        : row[1];

    const stake =
      Number(row[4] || 0);

    return (

      winner === playerName
      &&
      stake >= 10

    );

  }).length;

/* =========================
   RISK PROFILE
========================= */

const averageStake =

  playerMatches.length > 0

    ?

    Math.round(

      playerMatches.reduce(

        (sum,row) =>

          sum +
          Number(row[4] || 0),

        0

      )

      /

      playerMatches.length

    )

    :

    0;

let playerAura =
  "Balanced";

if(averageStake >= 15){

  playerAura =
    "Risk Addict";

}else if(eliminations >= 5){

  playerAura =
    "Executioner";

}else if(winRate >= 70){

  playerAura =
    "Untouchable";

}else if(totalGames >= 50){

  playerAura =
    "Veteran";

}


/* =========================
   PROFILE BADGES
========================= */

const profileBadges = [];

/* =========================
   RISK BADGES
========================= */

if(biggestStake >= 25){

  profileBadges.push(
    "🎲 High Roller"
  );

}

if(averageStake >= 15){

  profileBadges.push(
    "☢️ Risk Addict"
  );

}

/* =========================
   COMBAT BADGES
========================= */

if(eliminations >= 5){

  profileBadges.push(
    "💀 Eliminator"
  );

}

if(
  achievementIds.includes(
    "KINGSLAYER"
  )
){

  profileBadges.push(
    "👑 Kingslayer"
  );

}

if(
  achievementIds.includes(
    "GIANT_KILLER"
  )
){

  profileBadges.push(
    "🗡️ Giant Killer"
  );

}

/* =========================
   PERFORMANCE BADGES
========================= */

if(winRate >= 70
&& totalGames >= 10){

  profileBadges.push(
    "🔥 Untouchable"
  );

}

if(totalGames >= 50){

  profileBadges.push(
    "🧱 Veteran"
  );

}

/* =========================
   RIVALRY BADGES
========================= */

if(

  signatureRival
  &&
  signatureRival.games >= 10

){

  profileBadges.push(
    "⚔️ Blood Feud"
  );

}

if(

  signatureRival
  &&
  signatureRival.wins >= 5

){

  profileBadges.push(
    "🎯 Nemesis"
  );

}

/* =========================
   SIGNATURE MOMENTS
========================= */

let signatureMoments = [];

/* =========================
   BIGGEST GAMBLE
========================= */

if(biggestStake >= 25){

  signatureMoments.push({

    title:
      "Biggest Gamble",

    description:

      `Won a ${biggestStake}
       point wager`

  });

}

/* =========================
   ELIMINATION MOMENTS
========================= */

if(eliminations >= 1){

  signatureMoments.push({

    title:
      "Execution Record",

    description:

      `${eliminations}
       eliminations secured`

  });

}

/* =========================
   RIVALRY MOMENTS
========================= */

if(signatureRival){

  signatureMoments.push({

    title:
      "Signature Rival",

    description:

      `${signatureRival.name}
       (${signatureRival.wins}-${signatureRival.losses})`

  });

}

/* =========================
   DOMINANCE MOMENTS
========================= */

if(winRate >= 70
&& totalGames >= 10){

  signatureMoments.push({

    title:
      "Dominance",

    description:

      `${winRate}% career win rate`

  });

}

/* =========================
   LONGEVITY MOMENTS
========================= */

if(totalGames >= 50){

  signatureMoments.push({

    title:
      "Veteran Status",

    description:

      `${totalGames}
       career matches played`

  });

}

/* =========================
   LEGACY SCORE ENGINE
========================= */

let legacyScore = 0;

/* =========================
   CORE PERFORMANCE
========================= */

legacyScore +=
  totalWins * 5;

legacyScore +=
  eliminations * 15;

legacyScore +=
  Math.floor(
    biggestStake * 1.5
  );

/* =========================
   WIN RATE BONUS
========================= */

if(winRate >= 60){

  legacyScore += 25;

}

if(winRate >= 70){

  legacyScore += 50;

}

if(winRate >= 80){

  legacyScore += 100;

}

/* =========================
   LONGEVITY BONUS
========================= */

legacyScore +=
  totalGames * 2;

/* =========================
   RIVALRY BONUS
========================= */

if(signatureRival){

  legacyScore +=

    signatureRival.games * 3;

}

/* =========================
   ACHIEVEMENT BONUS
========================= */

legacyScore +=
  achievementIds.length * 10;

/* =========================
   LEGACY TIER
========================= */

let legacyTier =
  "LOCAL";

if(legacyScore >= 250){

  legacyTier =
    "CONTENDER";

}

if(legacyScore >= 500){

  legacyTier =
    "ELITE";

}

if(legacyScore >= 1000){

  legacyTier =
    "LEGEND";

}

if(legacyScore >= 2000){

  legacyTier =
    "IMMORTAL";

}

/* =========================
   PLAYER ARCHETYPE ENGINE
========================= */

let archetype =
  "Competitor";

/* =========================
   HIGH ROLLER
========================= */

if(
  biggestStake >= 25
){

  archetype =
    "High Roller";

}

/* =========================
   EXECUTIONER
========================= */

if(
  eliminations >= 3
){

  archetype =
    "Executioner";

}

/* =========================
   UNTOUCHABLE
========================= */

if(
  winRate >= 75
  &&
  totalGames >= 10
){

  archetype =
    "Untouchable";

}

/* =========================
   VETERAN
========================= */

if(
  totalGames >= 50
){

  archetype =
    "Veteran";

}

/* =========================
   SURVIVOR
========================= */

if(
  winRate <= 35
  &&
  eliminations >= 2
){

  archetype =
    "Survivor";

}

/* =========================
   RIVAL HUNTER
========================= */

if(

  signatureRival
  &&
  signatureRival.wins >= 5

){

  archetype =
    "Rival Hunter";

}

/* =========================
   CHAOS AGENT
========================= */

if(
  totalGames >= 5
  &&
  averageStake >= 10
  &&
  winRate <= 45
){

  archetype =
    "Chaos Agent";

}

/* =========================
   WARLORD
========================= */

if(
  winRate >= 70
  &&
  eliminations >= 5
){

  archetype =
    "Warlord";

}

/* =========================
   DYNAMIC TITLE ENGINE
========================= */

let legacyTitle =
  "Competitor";

/* =========================
   ELITE TITLES
========================= */

if(biggestStake >= 25){

  legacyTitle =
    "The High Roller";

}

if(eliminations >= 5){

  legacyTitle =
    "The Executioner";

}

if(winRate >= 75
&& totalGames >= 10){

  legacyTitle =
    "The Untouchable";

}

/* =========================
   RIVALRY TITLES
========================= */

if(

  signatureRival
  &&
  signatureRival.wins >= 5

){

  legacyTitle =
    "The Nemesis";

}

/* =========================
   LONGEVITY TITLES
========================= */

if(totalGames >= 50){

  legacyTitle =
    "The Veteran";

}

if(totalGames >= 100){

  legacyTitle =
    "The Immortal";

}

/* =========================
   ACHIEVEMENT TITLES
========================= */

if(
  achievementIds.includes(
    "KINGSLAYER"
  )
){

  legacyTitle =
    "The Kingslayer";

}

if(
  achievementIds.includes(
    "UNSTOPPABLE"
  )
){

  legacyTitle =
    "The Unbreakable";

}

if(
  achievementIds.includes(
    "HIGH_ROLLER"
  )
){

  legacyTitle =
    "The High Roller";

}
  return {

    signatureRival,

eliminations,

averageStake,

playerAura, 
profileBadges,
signatureMoments,

    playerName,

    legacyTitle,

    prestigeScore,
    prestigeTier,

    legacyScore,
legacyTier,

archetype,

    totalGames,
    totalWins,
    totalLosses,
    winRate,

    biggestStake,

    achievements:
      achievementIds

  };

}

/* =========================================================
   PLAYER LEGACY SUMMARY
========================================================= */

function getPlayerLegacySummary(
  playerName
){

  const profile =

    buildPlayerLegacyProfile(
      playerName
    );

  return {

    player:
      profile.playerName,

    title:
      profile.legacyTitle,

    aura:
      profile.playerAura,

    prestige:

      `${profile.prestigeTier}
       (${profile.prestigeScore})`,

legacy:

  `${profile.legacyTier}
   (${profile.legacyScore})`,
   archetype:
  profile.archetype,

    record:

      `${profile.totalWins}-${profile.totalLosses}`,

    winRate:

      `${profile.winRate}%`,

    biggestStake:

      `${profile.biggestStake} pts`,

    eliminations:
      profile.eliminations,

    rival:

      profile.signatureRival

        ?

        `${profile.signatureRival.name}
         (${profile.signatureRival.wins}-${profile.signatureRival.losses})`

        :

        "None"
        ,

badges:
  profile.profileBadges
  ,

moments:
  profile.signatureMoments

  };

}

function testLegacy(){

  Logger.log(

    getPlayerLegacySummary(
      "Richard"
    )

  );

}


/* =========================================================
   LEGACY LEADERBOARD
========================================================= */

function buildLegacyLeaderboard(){

  const leagueData =
    getLeagueData();

  const legacyProfiles =

    leagueData.players.map(player =>

      buildPlayerLegacyProfile(
        player.name
      )

    );

  /* =========================
     SORT BY LEGACY SCORE
  ========================= */

  legacyProfiles.sort(

    (a,b) =>

      b.legacyScore -
      a.legacyScore

  );

  /* =========================
     FORMAT OUTPUT
  ========================= */

  return legacyProfiles.map(
    (profile,index) => ({

      rank:
        index + 1,

      player:
        profile.playerName,

      title:
        profile.legacyTitle,

      legacyTier:
        profile.legacyTier,

      legacyScore:
        profile.legacyScore,

        archetype:
  profile.archetype,

      winRate:
        `${profile.winRate}%`,

      biggestStake:
        profile.biggestStake,

      eliminations:
        profile.eliminations,

      badges:
        profile.profileBadges

    })
  );

}

/* =========================================================
   TEST LEGACY LEADERBOARD
========================================================= */

function testLegacyLeaderboard(){

  Logger.log(

    buildLegacyLeaderboard()

  );

}


/* =========================================================
   GET PLAYER LEGACY API
========================================================= */

function getPlayerLegacyAPI(
  playerName
){

  const profile =

    getPlayerLegacySummary(
      playerName
    );

  return JSON.stringify({

    success:true,

    profile

  });

}