function replayAllAchievementsBatch(
  startIndex = 0
){

  const BATCH_SIZE = 10;

  const ss =
    SpreadsheetApp.openById(
      "1XMiRxT7W_OMmnaplaAKzdTWQngepIQFCfI3qJ1oVbwc"
    );

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

  /* =========================
     FIRST RUN ONLY
  ========================= */

  if(startIndex === 0){

    [
      "PLAYER_ACHIEVEMENTS",
      "PLAYER_ELIMINATIONS",
      "PLAYER_TOP_WINS"
    ]
    .forEach(name => {

      const sheet =
        ss.getSheetByName(name);

      if(
        sheet &&
        sheet.getLastRow() > 1
      ){

        sheet
          .getRange(

            2,
            1,

            sheet.getLastRow() - 1,

            Math.max(
              sheet.getLastColumn(),
              1
            )

          )
          .clearContent();

      }

    });

    Logger.log(
      "Replay reset complete."
    );

  }

  /* =========================
     BATCH LIMITS
  ========================= */

  const endIndex =

    Math.min(

      startIndex + BATCH_SIZE,

      matches.length

    );

  Logger.log(
    `Processing ${startIndex} → ${endIndex}`
  );

  const startTime =
    Date.now();

  /* =========================
     PROCESS MATCHES
  ========================= */

  for(
    let i = startIndex;
    i < endIndex;
    i++
  ){

    try {

      /* =========================
         EXECUTION SAFETY
      ========================= */

      if(

        Date.now() - startTime >

        240000

      ){

        Logger.log(
          `Stopping early at ${i}`
        );

        PropertiesService
          .getScriptProperties()
          .setProperty(

            "ACH_REPLAY_INDEX",

            String(i)

          );

        ScriptApp
          .newTrigger(
            "continueAchievementReplay"
          )
          .timeBased()
          .after(1)
          .create();

        return;

      }

      const row =
        matches[i];

      const p1 =
        String(row[1] || "")
          .trim();

      const p2 =
        String(row[2] || "")
          .trim();

      const winner =
        String(row[3] || "")
          .trim();

      const stake =
        Number(row[4]) || 0;

      const season =
        String(row[6] || "");

      const gameType =
        String(row[5] || "");

      if(
        !p1 ||
        !p2 ||
        !winner
      ){

        continue;

      }

      const loser =

        winner === p1
          ? p2
          : p1;

      /* =========================
         LOAD PLAYER OBJECTS
      ========================= */

      const leagueData =
        getLeagueData();

      const winnerPlayer =
        leagueData.players.find(

          p =>

            p.name
              .trim()
              .toLowerCase()

            ===

            winner
              .trim()
              .toLowerCase()

        );

      const loserPlayer =
        leagueData.players.find(

          p =>

            p.name
              .trim()
              .toLowerCase()

            ===

            loser
              .trim()
              .toLowerCase()

        );

      /* =========================
         HANDLE FULL FAILURE
      ========================= */

      if(
        !winnerPlayer &&
        !loserPlayer
      ){

        Logger.log(
          `No players found at row ${i}`
        );

        continue;

      }

      /* =========================
         SAFE FALLBACK PLAYERS
      ========================= */

      const safeWinnerPlayer =

        winnerPlayer ||

        {

          id:
            "UNKNOWN_WINNER",

          playerId:
            "UNKNOWN_WINNER",

          name:
            winner,

          points:
            999999

        };

      const safeLoserPlayer =

        loserPlayer ||

        {

          id:
            "UNKNOWN_LOSER",

          playerId:
            "UNKNOWN_LOSER",

          name:
            loser,

          points:
            999999

        };

      /* =========================
         NORMALISE IDS
      ========================= */

      safeWinnerPlayer.playerId =
        safeWinnerPlayer.playerId ||
        safeWinnerPlayer.id;

      safeLoserPlayer.playerId =
        safeLoserPlayer.playerId ||
        safeLoserPlayer.id;

      /* =========================
         BUILD CONTEXT
      ========================= */

      const context =

        buildMatchContext({

          winnerPlayer:
            safeWinnerPlayer,

          loserPlayer:
            safeLoserPlayer,

          stake,

          winnerPrePoints:
            999999,

          loserPrePoints:
            999999,

          winnerPostPoints:
            999999,

          loserPostPoints:
            999999,

          season,
          gameType

        });

      /* =========================
         PROCESS ACHIEVEMENTS
      ========================= */

      processAchievementsFromContext(
        context
      );

    } catch(error){

      Logger.log(
        `Replay failed at row ${i}: ${error}`
      );

    }

  }

  /* =========================
     FINISHED
  ========================= */

  if(endIndex >= matches.length){

    PropertiesService
      .getScriptProperties()
      .deleteProperty(
        "ACH_REPLAY_INDEX"
      );

    Logger.log(
      "Achievement replay complete."
    );

    return;

  }

  /* =========================
     STORE NEXT INDEX
  ========================= */

  PropertiesService
    .getScriptProperties()
    .setProperty(

      "ACH_REPLAY_INDEX",

      String(endIndex)

    );

  /* =========================
     CREATE NEXT TRIGGER
  ========================= */

  ScriptApp
    .newTrigger(
      "continueAchievementReplay"
    )
    .timeBased()
    .after(1)
    .create();

  Logger.log(
    `Scheduled next batch from ${endIndex}`
  );

}

function continueAchievementReplay(){

  const props =

    PropertiesService
      .getScriptProperties();

  const index =

    Number(

      props.getProperty(
        "ACH_REPLAY_INDEX"
      ) || 0

    );

  replayAllAchievementsBatch(
    index
  );

}