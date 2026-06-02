const TKDL_CACHE = {

  players: null,

  matchHistory: null,

  achievementMetadata: null,

  playerAchievements: null,

  seasonResults: null,

  playerProfiles: {},

  sheets: {}

};

function getPlayersData(){

  if(TKDL_CACHE.players){

    return TKDL_CACHE.players;

  }

  const sheet =
    getSheet(SHEETS.PLAYERS);

  if(!sheet)
    return [];

  TKDL_CACHE.players =
    sheet
      .getDataRange()
      .getValues();

  return TKDL_CACHE.players;

}

function clearLeagueCache(){

  TKDL_CACHE.players = null;

  TKDL_CACHE.matchHistory = null;

  TKDL_CACHE.achievementMetadata = null;

  TKDL_CACHE.playerAchievements = null;

  TKDL_CACHE.seasonResults = null;

  TKDL_CACHE.playerProfiles = {};

  TKDL_CACHE.sheets = {};

}