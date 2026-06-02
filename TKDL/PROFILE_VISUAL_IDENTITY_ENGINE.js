/* =========================================================
   TKDL PROFILE VISUAL IDENTITY ENGINE
   Visual Identity / Presentation Layer
   Read-Only
========================================================= */

/* =========================================================
   BUILD VISUAL IDENTITY
========================================================= */

function buildProfileVisualIdentity(player){

  const state =
    getCanonicalPlayerState(
      player
    );

  const title =
    buildProfileTitle(player);

  const visuals = {

    theme: "default",
    glow: "standard",
    border: "default",
    accent: "neutral",
    intensity: 1

  };

  /* =====================================================
     MYTHOLOGY VISUALS
  ===================================================== */

  if(title === "The Immortal"){

    visuals.theme =
      "immortal";

    visuals.glow =
      "white-gold";

    visuals.border =
      "legend";

    visuals.accent =
      "mythic";

    visuals.intensity = 10;

  }

  else if(title === "The Dynasty"){

    visuals.theme =
      "royal-gold";

    visuals.glow =
      "gold";

    visuals.border =
      "diamond";

    visuals.accent =
      "elite";

    visuals.intensity = 9;

  }

  else if(title === "The Executioner"){

    visuals.theme =
      "executioner-red";

    visuals.glow =
      "crimson";

    visuals.border =
      "blood";

    visuals.accent =
      "danger";

    visuals.intensity = 8;

  }

  else if(title === "Ice Veins"){

    visuals.theme =
      "ice";

    visuals.glow =
      "blue";

    visuals.border =
      "frost";

    visuals.accent =
      "cold";

    visuals.intensity = 7;

  }

  else if(title === "Chaos Agent"){

    visuals.theme =
      "chaos";

    visuals.glow =
      "purple";

    visuals.border =
      "volatile";

    visuals.accent =
      "chaos";

    visuals.intensity = 7;

  }

  /* =====================================================
     REPUTATION VISUALS
  ===================================================== */

  else if(state.isLegendary){

    visuals.theme =
      "legendary";

    visuals.glow =
      "amber";

    visuals.border =
      "elite";

    visuals.accent =
      "legend";

    visuals.intensity = 6;

  }

  else if(state.isElite){

    visuals.theme =
      "elite";

    visuals.glow =
      "orange";

    visuals.border =
      "elite";

    visuals.accent =
      "high";

    visuals.intensity = 5;

  }

  else if(state.isOnFire){

    visuals.theme =
      "inferno";

    visuals.glow =
      "fire";

    visuals.border =
      "hot";

    visuals.accent =
      "surging";

    visuals.intensity = 4;

  }

    /* =====================================================
     FALLBACK VISUAL IDENTITIES
  ===================================================== */

  else if(state.isEliminated){

    visuals.theme =
      "executioner-red";

    visuals.glow =
      "crimson";

    visuals.border =
      "danger";

    visuals.accent =
      "eliminated";

    visuals.intensity = 5;

  }

  else if(player.rank === 1){

    visuals.theme =
      "royal-gold";

    visuals.glow =
      "gold";

    visuals.border =
      "champion";

    visuals.accent =
      "leader";

    visuals.intensity = 5;

  }

  else if(player.winStreak >= 3){

    visuals.theme =
      "inferno";

    visuals.glow =
      "fire";

    visuals.border =
      "hot";

    visuals.accent =
      "surging";

    visuals.intensity = 4;

  }

  else if(player.losses > player.wins){

    visuals.theme =
      "chaos";

    visuals.glow =
      "purple";

    visuals.border =
      "volatile";

    visuals.accent =
      "unstable";

    visuals.intensity = 3;

  }

  else if(player.elo >= 1100){

    visuals.theme =
      "elite";

    visuals.glow =
      "orange";

    visuals.border =
      "elite";

    visuals.accent =
      "danger";

    visuals.intensity = 3;

  }

  return visuals;

}