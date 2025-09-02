const cliProgress = require('cli-progress');

// Generate array of track IDs
function rangeArray(start, end) {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

const trackIds = [...rangeArray(1001, 11106), ...rangeArray(50001, 1010000)];

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
    format: 'Progress |{bar}| {percentage}% | {value}/{total} tracks',
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

// Example usage
const username = process.argv[2];
if (!username) {
  console.error("Usage: node script.js <username>");
  process.exit(1);
}
fetchInBatches(username, trackIds).then(foundTrackIds => {
  console.log(`\n\n\nTracks containing "${username}":`, foundTrackIds);
  console.log(`Amount of tracks:`, foundTrackIds.length);
});
