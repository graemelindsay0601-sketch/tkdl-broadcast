/* =========================================================
   TKDL RIVALRY ENGINE
========================================================= */

function buildPlayerRivalries(
  playerName
){

  const matches =
    getCareerMatches();

  const rivalMap = {};

  matches.forEach(row => {

    const p1 =
      String(row[1] || "")
        .trim();

    const p2 =
      String(row[2] || "")
        .trim();

    const winner =
      String(row[3] || "")
        .trim();

    let opponent = null;
    let won = false;

    if(p1 === playerName){

      opponent = p2;
      won = winner === p1;

    }

    else if(p2 === playerName){

      opponent = p1;
      won = winner === p2;

    }

    if(!opponent)
      return;

    if(!rivalMap[opponent]){

      rivalMap[opponent] = {

        opponent,

        matches:0,
        wins:0,
        losses:0,

        streak:0,
        lastWinner:null

      };

    }

    rivalMap[opponent]
      .matches++;

    if(won){

      rivalMap[opponent]
        .wins++;

      if(
        rivalMap[opponent]
          .lastWinner === playerName
      ){

        rivalMap[opponent]
          .streak++;

      }else{

        rivalMap[opponent]
          .streak = 1;

      }

      rivalMap[opponent]
        .lastWinner = playerName;

    }else{

      rivalMap[opponent]
        .losses++;

      rivalMap[opponent]
        .lastWinner = opponent;

      rivalMap[opponent]
        .streak = 0;

    }

  });

  return Object.values(
    rivalMap
  );

}

/* =========================================================
   SIGNATURE RIVAL
========================================================= */

function getSignatureRival(
  player
){

  const rivalries =
    buildPlayerRivalries(
      player.name
    );

  if(
    rivalries.length <= 0
  ){
    return "None";
  }

  rivalries.sort((a,b) => {

    const scoreA =

      (a.matches * 2)

      +

      (a.losses * 3);

    const scoreB =

      (b.matches * 2)

      +

      (b.losses * 3);

    return scoreB - scoreA;

  });

  return rivalries[0]
    .opponent;

}