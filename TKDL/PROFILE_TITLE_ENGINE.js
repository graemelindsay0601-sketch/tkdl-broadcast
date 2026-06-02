/* =========================================================
   TKDL PROFILE TITLE ENGINE
   Identity / Immersion Layer
   Read-Only
========================================================= */

function buildProfileTitle(player) {

  const winRate =
    calculatePlayerWinRate(player);

  const streak =
    player.winStreak || 0;

  const elo =
    player.elo || 1000;

  const titles =
    player.titles || 0;

      const state =
    getCanonicalPlayerState(
      player
    );

  /* =========================
   MYTHOLOGY TITLES
========================= */

if (
  hasAchievement(
    player,
    "IMMORTAL"
  )
){
  return "The Immortal";
}

if (
  hasAchievement(
    player,
    "DYNASTY"
  )
){
  return "The Dynasty";
}

if (
  isExecutioner(player)
){
  return "The Executioner";
}

if (
  isGiantKiller(player)
){
  return "Giant Killer";
}

if (
  hasIceVeins(player)
){
  return "Ice Veins";
}

if (
  isChaosPlayer(player)
){
  return "Chaos Agent";
}

/* =========================
   REPUTATION TITLES
========================= */

if (
  state.isLegendary
){
  return "The Untouchable";
}

if (
  state.isElite
){
  return "League Nightmare";
}

if (
  state.isOnFire
){
  return "Inferno";
}

if (
  state.careerTier ===
  "LEGEND"
){
  return "The Veteran";
}

if (
  winRate >= 75
){
  return "Silent Killer";
}

return "Competitor";
}

/* =========================================================
   PROFILE SUBTITLE
========================================================= */

function buildProfileSubtitle(player) {

  const rank =
    player.rank || 999;

  const streak =
    player.winStreak || 0;

      const state =
    getCanonicalPlayerState(
      player
    );

  if (rank === 1) {
    return "Current League Leader";
  }

  if (streak >= 5) {
    return "Currently Surging";
  }

  if (state.isEliminated) {
  return "Season Eliminated";
}

  return "Active Competitor";

}

/* =========================================================
   THREAT LEVEL
========================================================= */

function buildThreatLevel(player) {

  const elo =
    player.elo || 1000;

  const streak =
    player.winStreak || 0;

      const state =
    getCanonicalPlayerState(
      player
    );

  let level = "LOW";

  if (
  state.isLegendary
  ||
  state.isUntouchable
) {
    level = "EXTREME";
  }
  else if (
  state.isElite
  ||
  state.isOnFire
) {
    level = "HIGH";
  }
  else if (
  state.isDangerous
) {
    level = "MEDIUM";
  }

  return level;

}

/* =========================================================
   SIGNATURE TRAIT
========================================================= */

function buildSignatureTrait(player) {

  const wins =
    player.wins || 0;

  const losses =
    player.losses || 0;

  const streak =
    player.winStreak || 0;

  const games =
    wins + losses;

  if (streak >= 7) {
    return "Momentum Monster";
  }

  if (games >= 25 && losses <= 5) {
    return "Elite Consistency";
  }

  if (wins >= 20) {
    return "Veteran Presence";
  }

  if (losses >= wins) {
    return "Unpredictable Threat";
  }

  return "Balanced Competitor";

}

/* =========================================================
   WIN RATE HELPER
========================================================= */

function calculatePlayerWinRate(player) {

  const wins =
    player.wins || 0;

  const losses =
    player.losses || 0;

  const total =
    wins + losses;

  if (!total) {
    return 0;
  }

  return Math.round(
    (wins / total) * 100
  );
}