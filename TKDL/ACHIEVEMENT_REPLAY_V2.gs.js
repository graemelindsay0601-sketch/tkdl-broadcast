/* =========================================================
   TKDL ACHIEVEMENT REPLAY V2
========================================================= */

function rebuildAllAchievementsV2(){

  const ss =
    SpreadsheetApp.openById(
      "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
    );

  /* =========================
     RESET SHEETS
  ========================= */

  resetAchievementSheetsV2(
    ss
  );

  /* =========================
     LOAD MATCHES
  ========================= */

  const matchesSheet =
    ss.getSheetByName(
      "CAREER_MATCHES"
    );

  if(!matchesSheet){

    throw new Error(
      "CAREER_MATCHES missing."
    );

  }

  const matches =

    matchesSheet
      .getDataRange()
      .getValues()
      .slice(1);

  Logger.log(

    "Loaded " +

    matches.length +

    " matches."

  );

  /* =========================
     CREATE ENGINE
  ========================= */

  const engine =
    createAchievementEngine();

  /* =========================
     PROCESS MATCHES
  ========================= */

  matches.forEach((row,index)=>{

    try {

      processReplayMatch(

        engine,
        row

      );

      if(
        index % 10 === 0
      ){

        Logger.log(

          "Processed " +

          index +

          " matches."

        );

      }

    } catch(error){

      Logger.log(

        "Replay failed at row " +

        index +

        ": " +

        error

      );

    }

  });

  /* =========================
     COMPLETE
  ========================= */

  Logger.log(
    "Achievement rebuild complete."
  );

}

/* =========================================================
   RESET SHEETS
========================================================= */

function resetAchievementSheetsV2(
  ss
){

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

  "unlockId",

  "playerId",

  "achievementId",

  "unlockedAt",

  "season",

  "rarity"

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

    "eliminatedBy",

    "season",

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

    "winnerId",

    "winnerName",

    "loserId",

    "loserName",

    "timestamp"

  ]);

  Logger.log(
    "Achievement sheets reset."
  );

}