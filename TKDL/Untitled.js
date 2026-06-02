function testAchievements(){

  Logger.log(
    JSON.stringify(
      getAchievementMetadata(),
      null,
      2
    )
  );

}

function testInactivePlayers() {

  const playersData = getPlayersData();

  const players =
    playersData
      .slice(1)
      .filter(row =>

        row[0] &&

        String(row[1] || "")
          .toUpperCase() !== "INACTIVE"

      );

  Logger.log(
    players.map(r => [r[0], r[1]])
  );

}


function testLiveLeagueData(){

  const data = getLeagueData();

  Logger.log(
    data.players.map(p => ({
      name: p.name,
      status: p.status
    }))
  );

}

function debugInactiveFilter(){

  const playersData =
    getPlayersData();

  const filtered =
    playersData
      .slice(1)
      .filter(row =>

        row[0] &&

        String(row[1] || "")
          .toUpperCase() !== "INACTIVE"

      );

  Logger.log(
    filtered.map(r => [
      r[0],
      r[1]
    ])
  );

}

function testCachedLeagueData(){

  const data =
    getLeagueDataCached();

  Logger.log(
    data.players.map(p => [
      p.name,
      p.status
    ])
  );

}

function nukeLeagueCache(){

  PropertiesService
    .getScriptProperties()
    .deleteProperty(
      "TKDL_LEAGUE_DATA"
    );

  Logger.log(
    "CACHE DELETED"
  );

}

function testLiveLeagueDataCount(){

  const data = getLeagueData();

  Logger.log(
    "PLAYER COUNT = " +
    data.players.length
  );

}

function forceCacheRefresh(){

  PropertiesService
    .getScriptProperties()
    .deleteProperty(
      "TKDL_LEAGUE_DATA"
    );

  const fresh =
    getLeagueData();

  PropertiesService
    .getScriptProperties()
    .setProperty(
      "TKDL_LEAGUE_DATA",
      JSON.stringify(fresh)
    );

  Logger.log(
    "NEW COUNT: " +
    fresh.players.length
  );

}

function debugGetLeagueDataPlayers(){

  const playersData =
    getPlayersData();

  const filteredPlayers =
    playersData
      .slice(1)
      .filter(row =>

        row[0] &&

        String(row[1] || "")
          .toUpperCase() !== "INACTIVE"

      );

  Logger.log(
    "FILTERED COUNT = " +
    filteredPlayers.length
  );

  const data =
    getLeagueData();

  Logger.log(
    "FINAL COUNT = " +
    data.players.length
  );

  data.players.forEach(p => {

    if(
      p.status === "INACTIVE"
    ){

      Logger.log(
        "INACTIVE FOUND: " +
        p.name
      );

    }

  });

}