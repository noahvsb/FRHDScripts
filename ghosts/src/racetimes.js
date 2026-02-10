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
  printResults(results);
}

function printResults(results) {
  function parseTime(t) {
    if (t === 'DNG') return Infinity;
    const [m, s] = t.split(':');
    return parseInt(m, 10) * 60 + parseFloat(s);
  }

  // sort
  const sorted = [...results].sort((a, b) => {
    const ta = parseTime(a.run_time);
    const tb = parseTime(b.run_time);
    if (ta !== tb) return ta - tb;
    return a.user.localeCompare(b.user);
  });

  // column widths
  const nameWidth = Math.max(...sorted.map(r => r.user.length));
  const placeWidth = String(sorted.length).length;
  const timeWidth = Math.max(...sorted.map(r => r.run_time.length));

  let lastTime = null;
  let placement = 0;

  sorted.forEach((r, index) => {
    const t = parseTime(r.run_time);

    if (t !== lastTime) {
      placement = index + 1;
      lastTime = t;
    }

    const placeStr = String(placement).padStart(placeWidth);
    const nameStr = r.user.padEnd(nameWidth);
    const timeStr = r.run_time.padEnd(timeWidth);

    console.log(`${placeStr}. ${nameStr}  ${timeStr}`);
  });
}


fetchRaceTimes().catch(console.error);
