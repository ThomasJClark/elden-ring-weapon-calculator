# Elden Ring Weapon Attack Calculator

A weapon calculator that allows comparing multiple weapons and infusions. Try it at [eldenring.tclark.io](https://eldenring.tclark.io/).

![image](https://user-images.githubusercontent.com/3964980/233752758-8d2bf3b5-0c39-44c6-b861-a75cff93f44e.png)

Enter your stats and your criteria (weapon type, affinity, etc). The app will list every weapon matching your selections, along with the attack rating and status buildup you'll get on your build. Click a column header to sort the table by that column.

## Contributing

To start the server locally, run `yarn install && yarn start`.

### Updating data

The weapon stats are committed in the `public/` directory in this repo. To rebuild this data for new patches/DLC/mods, a `yarn rebuildWeaponData` script is included. You can also run `yarn buildData:v1.10`, `yarn buildData:reforged`, or `yarn buildData:convergence` to update a single game version.

The first time you run one of the above scripts, a `buildData.env` file will be created with some default values. You must update this to point to your [WitchyBND](https://github.com/ividyon/WitchyBND/releases/latest), and whichever versions of the game you're updating.

To update the vanilla game, the files must be unpacked using [UXM](https://github.com/Nordgaren/UXM-Selective-Unpack/releases/latest).

Also, `src/app/regulationVersions.tsx` should be updated to make the new or changed game version appear in the UI.

## Special Thanks

This was inspired the [Dark Souls Weapons Attack Calculator](https://soulsplanner.com/darksouls/weaponatk), which is a similar tool for previous games in the series.

Regulation data was extracted from the game using [WitchyBND](https://github.com/ividyon/WitchyBND/releases/latest).

Elden Ring Reforged support uses data from the [Elden Ring Reforged](https://www.nexusmods.com/eldenring/mods/541) mod provided by [ivi](https://github.com/ividyon) from the ERR team.

The Convergence Mod support uses data extracted from [The Convergence Mod](https://www.nexusmods.com/eldenring/mods/3419) public alpha on Nexus Mods.
