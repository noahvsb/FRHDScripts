# leaderboard

This folder contains scripts that can be used to generate and filter a json of all leaderboard spots of a user.

## Install

Go into a terminal, like Command Prompt, Powershell or Git Bash.

Clone the whole git repository (you might need to install [git](https://git-scm.com/downloads))

```sh
git clone https://github.com/noahvsb/FRHDScripts.git
```

Go to this folder

```sh
cd FRHDScripts/leaderboard
```

Install necessary packages (you might need to install [npm](https://nodejs.org/en/download/))

```
npm install
```

## Usage

### leaderboard

Generates the leaderboard spots for a user and stores the result into `out/tracks.json` and `out/filteredTracks.json`.

```sh
npm run leaderboard <username> <minPlays (optional)> <maxPlacement (optional)>
```

`username`: the user for which the leaderboard spots are generated.

`minPlays`: used to filter the tracks on a minimum amount of plays. (must be a positive integer)

`maxPlacement`: used to filter the tracks on a maximum placement. (must be a positive integer between 1 and 10)

Note: if you want to use `maxPlacement`, but not `minPlays`, just make `minPlays` 0

### filter

Filters tracks from a json file and stores the result into `out/filteredTracks.json`, that way you don't need to generate everything again to filter each time.

```sh
npm run filter <minPlays (optional)> <maxPlacement (optional)> <jsonPath (optional)>
```

`minPlays`: used to filter the tracks on a minimum amount of plays. (must be a positive integer)

`maxPlacement`: used to filter the tracks on a maximum placement. (must be a positive integer between 1 and 10)

`jsonPath`: path of the `tracks.json` file. You won't need to use this normally since it defaults to `out/tracks.json`, unless you changed the path of your `tracks.json`

Note: all arguments are optional, but having no option is just a waste of time and energy.

Note: if you only wish to use one of the latter arguments, set `minPlays` to 0 and or `maxPlacement` to 10.

Note: before pulling again from this repository, make sure to backup your `tracks.json` somewher, cuz it gets overwritten by the dummy file 😭.






