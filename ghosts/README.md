# ghosts

This folder contains scripts related to ghosts. A ghost is the "replay" of a users time on a certain track.

## Install

Go into a terminal.
For windows this includes apps like Command Prompt, Powershell or Git Bash. (I only explained for windows, because on average these are less techy people, linux and mac trek uw plan. Honestly some linux distros like mint cinnamon are easier to work with than windows and free, I have no idea why people who don't game still use windows.)

Clone the whole git repository (you might need to install [git](https://git-scm.com/downloads))

```sh
git clone https://github.com/noahvsb/FRHDScripts.git
```

Go to this folder

```sh
cd FRHDScripts/ghosts
```

Install necessary packages (you might need to install [npm](https://nodejs.org/en/download/))

```
npm install
```

## Usage

### leaderboard

Generates the leaderboard spots for a user and stores all results into `out/tracks.json` and the filtered ones into `out/filteredTracks.json`.

```sh
npm run leaderboard <username> <minPlays (optional)> <maxPlacement (optional)>
```

`username`: the user for which the leaderboard spots are generated. (caps insensitive)

`minPlays`: used to filter the tracks on a minimum amount of plays. (must be a positive integer)

`maxPlacement`: used to filter the tracks on a maximum placement. (must be a positive integer between 1 and 10)

Note: if you want to use `maxPlacement`, but not `minPlays`, just make `minPlays` 0

Note: this can easily take over an hour, since there are almost 1 000 000 tracks.

### filter

Filters tracks from a json file and stores the filtered results into `out/filteredTracks.json`.

```sh
npm run filter <minPlays (optional)> <maxPlacement (optional)> <jsonPath (optional)>
```

`minPlays`: used to filter the tracks on a minimum amount of plays. (must be a positive integer)

`maxPlacement`: used to filter the tracks on a maximum placement. (must be a positive integer between 1 and 10)

`jsonPath`: path of the `tracks.json` file. You won't need to use this normally since it defaults to `out/tracks.json`, unless you changed the path of your `tracks.json`

Note: all arguments are optional, but having no option is just a waste of time and energy.

Note: if you only wish to use one of the latter arguments, set `minPlays` to 0 and or `maxPlacement` to 10.

### racetimes

Fetch the racetimes of a few users on a track.

```sh
npm run racetimes
```

Note that you don't have to add arguments, this is because you need to change the context file `context/racetimes.json`:

```json
{
  "t_id": 985096,
  "users": ["Protvod", "FieryBowser", "deadrising2"]
}
```

On windows, you can edit the file through the terminal by using this notepad command:

```sh
notepad context/racetimes.json
```

On linux and mac, you know what to do.


