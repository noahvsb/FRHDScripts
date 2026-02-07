import { SingleBar } from 'cli-progress';
import { writeToJsonFile } from './util.js';

// Generate array of track IDs
function rangeArray(start, end) {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

// Used to parse like 37.6k or 1.2m
function parsePlays(plays) {
  const num = parseFloat(plays);
  if (num === plays) return num;
  if (plays.endsWith('k')) return num * 1_000;
  return num * 1_000_000;
}

// Fetch leaderboard for a single track and check for user
async function fetchLeaderboard(user, t_id) {
  try {
    const leaderboardResponse = await fetch("https://www.freeriderhd.com/track_api/load_leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `t_id=${t_id}`
    });
    const leaderboardData = await leaderboardResponse.json();

    if (!leaderboardData.result) {
      console.error(`No result for ${t_id}:`, leaderboardData.msg);
      return null;
    }

    // Check if user is in the leaderboard and provide a bit more data if so 
    for (const entry of (leaderboardData.track_leaderboard || [])) {
      if (entry.user && entry.user.u_name && entry.user.u_name.toLowerCase() === user.toLowerCase()) {
        const response = await fetch(`http://frhd.co/t/${t_id}?ajax=true`);
        if (!response.ok) {
          console.error(`Error fetching extra track data ${t_id}:`, response.statusText);
        }
        const data = await response.json();
        const plays = data.track_stats.plays;
        return { id: t_id, placement: entry.place, title: data.track.title, author: data.track.author, plays: parsePlays(plays), plays_str: plays.toString() };
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
  const progressBar = new SingleBar({
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

// Argument handling
const username = process.argv[2];
const minPlays = Number(process.argv[3] ?? NaN);
const maxPlacement = Number(process.argv[4] ?? NaN);
if (!username) {
  console.error("Usage: npm run leaderboard <username> <minPlays (optional)> <maxPlacement (optional)>");
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

const trackIds = [...rangeArray(1001, 11106), ...rangeArray(50001, 1100000)];

fetchInBatches(username, trackIds).then(foundTracks => {
  const date = new Date().toISOString();
  console.log(`\nTotal amount of leaderboard spots for ${username}:`, foundTracks.length);
  writeToJsonFile('out/tracks.json', { username, date, tracks: foundTracks });

  // Filtering
  if (!(Number.isNaN(minPlays) && Number.isNaN(maxPlacement))) {
    let filteredTracks = foundTracks;
    if (!Number.isNaN(minPlays)) {
      filteredTracks = filteredTracks.filter(track => track.plays >= minPlays);
    }
    if (!Number.isNaN(maxPlacement)) {
      filteredTracks = filteredTracks.filter(track => track.placement <= maxPlacement);
    }
    console.log(`\nFiltered amount of leaderboard spots for ${username}:`, filteredTracks.length);
    writeToJsonFile('out/filteredTracks.json', { username, date, tracks: filteredTracks });
  }
});
