function processMatch(player1,player2,winner,stake){

  const lock =
    LockService.getScriptLock();

  lock.tryLock(10000);

  try{

        /* GUARD: reject blank player names immediately */
            if(!player1 || !player2 || !winner ||
                   !String(player1).trim() || !String(player2).trim() || !String(winner).trim()){
                         Logger.log('processMatch: blank name received, aborting. p1=' + player1 + ' p2=' + player2 + ' w=' + winner);
                               lock.releaseLock();
                                     return;
                                         }
                                         

    player1 =
      normalizePlayerName(player1);

    player2 =
      normalizePlayerName(player2);

    winner =
      normalizePlayerName(winner);

    const sheet =
      getSheet(SHEETS.PLAYERS);

    /* =========================
       FIND PLAYERS
    ========================= */

    let p1Index =
      findPlayerByName(player1);

    let p2Index =
      findPlayerByName(player2);

    /* =========================
       AUTO CREATE
    ========================= */

    if(p1Index === -1){

      createPlayer(player1);

    }

    if(p2Index === -1){

      createPlayer(player2);

    }

    /* REFRESH CACHE */

    clearLeagueCache();

    /* REFIND */

    p1Index =
      findPlayerByName(player1);

    p2Index =
      findPlayerByName(player2);

    const data =
      getPlayersData();

    const p1Row =
      p1Index + 1;

    const p2Row =
      p2Index + 1;

    const p1 =
      data[p1Index];

    const p2 =
      data[p2Index];

          /* =========================
                 GUARD: abort if either player row is missing
                        (happens when name is blank or not found after auto-create)
                            ========================= */

                                if(!p1 || !p2){
                                      Logger.log('processMatch: player row undefined for ' + player1 + ' or ' + player2 + ', aborting');
                                            lock.releaseLock();
                                                  return;
                                                      }

    /* =========================
       VALUES
    ========================= */

    let p1Points =
      Number(p1[PLAYER.POINTS]) || 0;

    let p2Points =
      Number(p2[PLAYER.POINTS]) || 0;

    let p1Games =
      Number(p1[PLAYER.GAMES]) || 0;

    let p2Games =
      Number(p2[PLAYER.GAMES]) || 0;

    let p1Wins =
      Number(p1[PLAYER.WINS]) || 0;

    let p2Wins =
      Number(p2[PLAYER.WINS]) || 0;

    let p1Losses =
      Number(p1[PLAYER.LOSSES]) || 0;

    let p2Losses =
      Number(p2[PLAYER.LOSSES]) || 0;

    let p1Peak =
      Number(p1[PLAYER.PEAK_POINTS]) || 0;

    let p2Peak =
      Number(p2[PLAYER.PEAK_POINTS]) || 0;

    let p1Elo =
      Number(p1[PLAYER.ELO]) || 1000;

    let p2Elo =
      Number(p2[PLAYER.ELO]) || 1000;

    let p1PeakElo =
      Number(p1[PLAYER.CAREER_PEAK_ELO]) || 1000;

    let p2PeakElo =
      Number(p2[PLAYER.CAREER_PEAK_ELO]) || 1000;

    /* =========================
       WINNER
    ========================= */

    const p1Win =

      winner.toLowerCase() ===
      player1.toLowerCase();

    /* =========================
       POINTS
    ========================= */

    if(p1Win){

      p1Points += Number(stake);

      p2Points =
        Math.max(
          0,
          p2Points - Number(stake)
        );

    }else{

      p2Points += Number(stake);

      p1Points =
        Math.max(
          0,
          p1Points - Number(stake)
        );

    }

    /* =========================
       STATS
    ========================= */

    p1Games++;
    p2Games++;

    if(p1Win){

      p1Wins++;
      p2Losses++;

    }else{

      p2Wins++;
      p1Losses++;

    }

    /* =========================
       ELO
    ========================= */

    const e1 =
      1 / (
        1 +
        Math.pow(
          10,
          (p2Elo-p1Elo)/400
        )
      );

    const e2 =
      1 / (
        1 +
        Math.pow(
          10,
          (p1Elo-p2Elo)/400
        )
      );

    if(p1Win){

      p1Elo =
        Math.round(
          p1Elo +
          TKDL.K_FACTOR *
          (1-e1)
        );

      p2Elo =
        Math.round(
          p2Elo +
          TKDL.K_FACTOR *
          (0-e2)
        );

    }else{

      p1Elo =
        Math.round(
          p1Elo +
          TKDL.K_FACTOR *
          (0-e1)
        );

      p2Elo =
        Math.round(
          p2Elo +
          TKDL.K_FACTOR *
          (1-e2)
        );

    }

    /* =========================
       PEAKS
    ========================= */

    p1Peak =
      Math.max(
        p1Peak,
        p1Points
      );

    p2Peak =
      Math.max(
        p2Peak,
        p2Points
      );

    p1PeakElo =
      Math.max(
        p1PeakElo,
        p1Elo
      );

    p2PeakElo =
      Math.max(
        p2PeakElo,
        p2Elo
      );

    /* =========================
       WRITE PLAYER 1
    ========================= */

    sheet
      .getRange(p1Row,1,1,20)
      .setValues([[

        player1,
        "ACTIVE",
        p1[PLAYER.BASE_POINTS],
        p1Points,
        p1Games,
        p1Wins,
        p1Losses,
        p1Peak,
        p1Elo,
        getTierFromElo(p1Elo),
        new Date(),
        getCurrentSeason(),
        true,
        p1[PLAYER.PLAYER_ID],
        p1Wins,
        p1Losses,
        p1Games,
        "",
        "",
        p1PeakElo

      ]]);

    /* =========================
       WRITE PLAYER 2
    ========================= */

    sheet
      .getRange(p2Row,1,1,20)
      .setValues([[

        player2,
        "ACTIVE",
        p2[PLAYER.BASE_POINTS],
        p2Points,
        p2Games,
        p2Wins,
        p2Losses,
        p2Peak,
        p2Elo,
        getTierFromElo(p2Elo),
        new Date(),
        getCurrentSeason(),
        true,
        p2[PLAYER.PLAYER_ID],
        p2Wins,
        p2Losses,
        p2Games,
        "",
        "",
        p2PeakElo

      ]]);
/* =========================
   ACHIEVEMENTS ENGINE
========================= */

const winnerPlayer =

  p1Win ? {

    playerId:
      p1[PLAYER.PLAYER_ID],

    name:
      player1,

    rank:
      p1[PLAYER.CURRENT_RANK],

    elo:
      p1Elo

  }

  :

  {

    playerId:
      p2[PLAYER.PLAYER_ID],

    name:
      player2,

    rank:
      p2[PLAYER.CURRENT_RANK],

    elo:
      p2Elo

  };

const loserPlayer =

  p1Win ? {

    playerId:
      p2[PLAYER.PLAYER_ID],

    name:
      player2,

    rank:
      p2[PLAYER.CURRENT_RANK],

    elo:
      p2Elo

  }

  :

  {

    playerId:
      p1[PLAYER.PLAYER_ID],

    name:
      player1,

    rank:
      p1[PLAYER.CURRENT_RANK],

    elo:
      p1Elo

  };

const context =

  buildMatchContext({

    winnerPlayer,
    loserPlayer,

    stake:
      Number(stake),

    winnerPrePoints:

      p1Win

        ? Number(
            p1[PLAYER.POINTS]
          )

        : Number(
            p2[PLAYER.POINTS]
          ),

    loserPrePoints:

      p1Win

        ? Number(
            p2[PLAYER.POINTS]
          )

        : Number(
            p1[PLAYER.POINTS]
          ),

    winnerPostPoints:

      p1Win
        ? p1Points
        : p2Points,

    loserPostPoints:

      p1Win
        ? p2Points
        : p1Points,

    season:
      getCurrentSeason()

  });

processAchievementsFromContext(
  context
);
    /* =========================
       REBUILD LEADERBOARD
    ========================= */

    rebuildLeaderboard();

    clearLeagueCache();

    Logger.log(
      "MATCH COMPLETE"
    );

  }finally{

    lock.releaseLock();

  }

}


















/* =========================
   UPDATE PLAYER STATS
========================= */

function updatePlayerStatsAfterMatch(
  winnerId,
  loserId,
  stake,
  winnerPoints,
  loserPoints
){

  const sheet =
    SpreadsheetApp
      .getActive()
      .getSheetByName(
        "PLAYER_STATS"
      );

  const data =
    sheet
      .getDataRange()
      .getValues();

  let winnerRow = -1;
  let loserRow = -1;

  for(let i = 1; i < data.length; i++){

    if(data[i][0] === winnerId){

      winnerRow = i + 1;

    }

    if(data[i][0] === loserId){

      loserRow = i + 1;

    }

  }

  if(
    winnerRow === -1 ||
    loserRow === -1
  ){
    return;
  }

  /* =========================
     WINNER
  ========================= */

  const winnerStats =
    sheet
      .getRange(
        winnerRow,
        1,
        1,
        sheet.getLastColumn()
      )
      .getValues()[0];

  let bestStreak =
    Number(winnerStats[1]) || 0;

  let currentWinStreak =
    Number(winnerStats[3]) || 0;

  let eliminations =
    Number(winnerStats[6]) || 0;

  let highStakeMatches =
    Number(winnerStats[7]) || 0;

  let highestStakeWin =
    Number(winnerStats[8]) || 0;

  let allInWagers =
    Number(winnerStats[9]) || 0;

  /* =========================
     STREAKS
  ========================= */

  currentWinStreak++;

  bestStreak =
    Math.max(
      bestStreak,
      currentWinStreak
    );

  /* =========================
     HIGH STAKE
  ========================= */

  if(stake >= 10){

    highStakeMatches++;

  }

  if(stake > highestStakeWin){

    highestStakeWin = stake;

  }

  /* =========================
     ALL IN
  ========================= */

  if(stake >= winnerPoints){

    allInWagers++;

  }

  /* =========================
     ELIMINATIONS
  ========================= */

  if(loserPoints <= 0){

    eliminations++;

  }

  /* =========================
     WRITE WINNER
  ========================= */

  winnerStats[1] =
    bestStreak;

  winnerStats[3] =
    currentWinStreak;

  winnerStats[6] =
    eliminations;

  winnerStats[7] =
    highStakeMatches;

  winnerStats[8] =
    highestStakeWin;

  winnerStats[9] =
    allInWagers;

  sheet
    .getRange(
      winnerRow,
      1,
      1,
      winnerStats.length
    )
    .setValues([winnerStats]);

  /* =========================
     LOSER
  ========================= */

  const loserStats =
    sheet
      .getRange(
        loserRow,
        1,
        1,
        sheet.getLastColumn()
      )
      .getValues()[0];

  let worstStreak =
    Number(loserStats[2]) || 0;

  worstStreak++;

  loserStats[2] =
    worstStreak;

  loserStats[3] = 0;

  sheet
    .getRange(
      loserRow,
      1,
      1,
      loserStats.length
    )
    .setValues([loserStats]);

}
