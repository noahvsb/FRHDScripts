const fs = require('fs');

function writeToJsonFile(filePath, data, pretty = true) {
  try {
    const jsonData = pretty 
      ? JSON.stringify(data, null, 2) 
      : JSON.stringify(data);

    fs.writeFileSync(filePath, jsonData, 'utf8');
    console.log(`Data successfully written to ${filePath}`);
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
}

// Argument handling
const minPlays = Number(process.argv[2] ?? NaN);
const maxPlacement = Number(process.argv[3] ?? NaN);
const jsonPath = process.argv[4] ?? "out/tracks.json";
if (!Number.isNaN(minPlays) && (!Number.isInteger(minPlays) || minPlays < 0)) {
  console.error("minPlays must be a positive integer.");
  process.exit(1);
}
if (!Number.isNaN(maxPlacement) && (!Number.isInteger(maxPlacement) || maxPlacement < 1 || maxPlacement > 10)) {
  console.error("maxPlacement must be an integer between 1 and 10.");
  process.exit(1);
}

// Reading and parsing JSON
let tracksJSON;
try {
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  tracksJSON = JSON.parse(rawData);
} catch (err) {
  console.error(`Error reading or parsing ${jsonPath}:`, err);
}

// Filtering
let filteredTracks = tracksJSON.tracks;
if (!Number.isNaN(minPlays)) {
  filteredTracks = filteredTracks.filter(track => track.plays >= minPlays);
}
if (!Number.isNaN(maxPlacement)) {
  filteredTracks = filteredTracks.filter(track => track.placement <= maxPlacement);
}
console.log(`\nFiltered amount of leaderboard spots for ${tracksJSON.username}:`, filteredTracks.length);
writeToJsonFile('out/filteredTracks.json', { username: tracksJSON.username, date: tracksJSON.date, tracks: filteredTracks });
