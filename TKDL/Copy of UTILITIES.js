function getSheet(name){

  return SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(name);

}

function normalizePlayerName(name){

  if(!name)
    return '';

  return name
    .toString()
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word =>

      word.charAt(0).toUpperCase() +
      word.slice(1)

    )
    .join(' ');

}

function getSetting(settingName){

  const sheet =
    getSheet(SHEETS.SETTINGS);

  if(!sheet)
    return null;

  const data =
    sheet
      .getDataRange()
      .getValues();

  for(let i = 0; i < data.length; i++){

    const key =
      (data[i][0] || '')
        .toString()
        .trim()
        .toLowerCase();

    if(
      key ===
      settingName.toLowerCase()
    ){

      return data[i][1];

    }

  }

  return null;

}

function getCurrentSeason(){

  const now = new Date();

  const month =
    now.toLocaleString(
      'en-GB',
      { month:'long' }
    ).toUpperCase();

  const year =
    now.getFullYear();

  return `${month}_${year}`;

}

function getTierFromElo(elo){

  if(elo >= 1200)
    return '👑 Champion';

  if(elo >= 1100)
    return '💎 Elite';

  if(elo >= 1000)
    return '🥇 Gold';

  if(elo >= 950)
    return '🥈 Silver';

  return '🥉 Bronze';

}