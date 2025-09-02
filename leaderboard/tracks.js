const cliProgress = require('cli-progress');
const fs = require('fs');

// Generate array of track IDs
function rangeArray(start, end) {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

// Fetch leaderboard for a single track and check for user
async function fetchLeaderboard(user, t_id) {
  try {
    const response = await fetch("https://www.freeriderhd.com/track_api/load_leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `t_id=${t_id}`
    });
    const data = await response.json();

    if (!data.result) {
      console.error(`No result for ${t_id}:`, data.msg);
      return null;
    }

    // Look through track_leaderboard for the user
    for (const entry of (data.track_leaderboard || [])) {
      // Some entries may not have a user object
      if (entry.user && entry.user.u_name && entry.user.u_name.toLowerCase() === user.toLowerCase()) {
        return { t_id, placement: entry.place }; // Return track ID + placement
      }
    }
  } catch (err) {
    console.error(`Error fetching track ${t_id}:`, err);
    return null;
  }
}

// Fetch in batches to avoid overwhelming the server
async function fetchInBatches(user, ids, batchSize = 50) {
  const foundTracks = [];

  // Create new progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Fetching data |{bar}| {percentage}% | {value}/{total} tracks',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  progressBar.start(ids.length, 0);

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(t_id => fetchLeaderboard(user, t_id)));
    foundTracks.push(...batchResults.filter(Boolean));
    progressBar.update(Math.min(i + batchSize, ids.length));
  }

  progressBar.stop();

  // Sort the tracks by placement ascending
  foundTracks.sort((a, b) => a.placement - b.placement);

  return foundTracks;
}

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
const username = process.argv[2];
const minPlays = Number(process.argv[3] ?? NaN);
const maxPlacement = Number(process.argv[4] ?? NaN);
if (!username) {
  console.error("Usage: node script.js <username> <minPlays (optional)> <maxPlacement (optional)>");
  process.exit(1);
}
if (!Number.isNaN(minPlays) && (!Number.isInteger(minPlays) || minPlays < 0)) {
  console.error("minPlays must be a positive integer.");
  process.exit(1);
}
if (!Number.isNaN(maxPlacement) && (!Number.isInteger(maxPlacement) || maxPlacement < 1 || maxPlacement > 10)) {
  console.error("maxPlacement must be an integer between 1 and 10.");
  process.exit(1);
}

const trackIds = [...rangeArray(1001, 11106), /*...rangeArray(50001, 1010000)*/];

fetchInBatches(username, trackIds).then(foundTracks => {
  console.log(`\nTotal amount of leaderboard spots for ${username}:`, foundTracks.length);
  writeToJsonFile('out/tracks.json', { username, tracks: foundTracks });
  if (!(Number.isNaN(minPlays) && Number.isNaN(maxPlacement))) {
    let filteredTracks = foundTracks;
    if (!Number.isNaN(minPlays)) {
      // TODO: implement when track object has a plays property
    }
    if (!Number.isNaN(maxPlacement)) {
      filteredTracks = filteredTracks.filter(track => track.placement <= maxPlacement);
    }
    console.log(`\nFiltered amount of leaderboard spots for ${username}:`, foundTracks.length);
    writeToJsonFile('out/filteredTracks.json', { username, tracks: filteredTracks });
  }
});
