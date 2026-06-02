function rebuildAchievementSheets(){

  const ss =
    SpreadsheetApp.openById(
      "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
    );

  /* =========================
     PLAYER_ACHIEVEMENTS
  ========================= */

  let achSheet =
    ss.getSheetByName(
      "PLAYER_ACHIEVEMENTS"
    );

  if(!achSheet){

    achSheet =
      ss.insertSheet(
        "PLAYER_ACHIEVEMENTS"
      );

  }

  achSheet.clear();

  achSheet.appendRow([

    "playerId",
    "playerName",

    "achievementId",
    "achievementName",

    "category",
    "rarity",

    "unlockedAt",

    "season",

    "matchId",

    "description",

    "hidden",

    "pointsAwarded"

  ]);

  /* =========================
     PLAYER_ELIMINATIONS
  ========================= */

  let elimSheet =
    ss.getSheetByName(
      "PLAYER_ELIMINATIONS"
    );

  if(!elimSheet){

    elimSheet =
      ss.insertSheet(
        "PLAYER_ELIMINATIONS"
      );

  }

  elimSheet.clear();

  elimSheet.appendRow([

    "playerId",
    "playerName",

    "season",

    "eliminatedBy",

    "timestamp"

  ]);

  /* =========================
     PLAYER_TOP_WINS
  ========================= */

  let topWinsSheet =
    ss.getSheetByName(
      "PLAYER_TOP_WINS"
    );

  if(!topWinsSheet){

    topWinsSheet =
      ss.insertSheet(
        "PLAYER_TOP_WINS"
      );

  }

  topWinsSheet.clear();

  topWinsSheet.appendRow([

    "playerId",
    "playerName",

    "defeatedPlayerId",
    "defeatedPlayerName",

    "season",

    "timestamp"

  ]);

  Logger.log(
    "Achievement schemas rebuilt."
  );

}