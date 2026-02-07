import { readFile } from "fs/promises";

async function fetchRaceTimes() {
  // read context
  const contextPath = new URL("../context/racetimes.json", import.meta.url);
  const raw = await readFile(contextPath, "utf8");
  const { t_id, users } = JSON.parse(raw);

  let results = [];

  // there's a limit of amount of users you can do at a time
  const limit = 20;
  const times = Math.ceil(users.length / limit);
  for (let i = 0; i < times; i++) {
    const usersSlice = users.slice(i * limit, (i+1) * limit);

    // create custom url
    const userPath = usersSlice.join("/");
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

    results = results.concat(data.race_leaderboard
      .filter(entry => entry?.user && entry?.run_time)
      .map(entry => ({
        user: entry.user?.u_name ?? entry.user?.d_name,
        run_time: entry.run_time
      })));

    // print info the first time
    if (i == 0) console.log(data.track.title, "by", data.track.author, "\n");
  }

  // Add DNG for users not in results
  results = users.map(u => {
    const found = results.find(r => r.user === u.toLowerCase());
    return found ? found : { user: u, run_time: "DNG" };
  });

  // print results
  console.log(results);
}

fetchRaceTimes().catch(console.error);
