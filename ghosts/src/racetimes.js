import { readFile } from "fs/promises";

async function fetchRaceTimes() {
  // read context
  const contextPath = new URL("../context/racetimes.json", import.meta.url);
  const raw = await readFile(contextPath, "utf8");
  const { t_id, users } = JSON.parse(raw);

  // create custom url
  const userPath = users.join("/");
  const url = `https://freeriderhd.com/t/${t_id}/r/${userPath}?ajax`;

  // fetch
  const res = await fetch(url, {
    headers: { accept: "application/json" }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  // process data
  const data = await res.json();

  const results = data.race_leaderboard
    .filter(entry => entry?.user && entry?.run_time)
    .map(entry => ({
      user: entry.user?.u_name ?? entry.user?.d_name,
      run_time: entry.run_time
    }));

  // print info + results
  console.log(data.track.title, "by", data.track.author, "\n");
  console.log(results);
}

fetchRaceTimes().catch(console.error);
