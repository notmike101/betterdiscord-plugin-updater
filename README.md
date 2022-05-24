# BetterDiscord Plugin updater

> Library to assist in updating BetterDiscord plugins automatically

## Install

```
npm install betterdiscord-plugin-updater
```

## Usage

To check for updates, use `isUpdateAvailable`. This will return a promise resolving to a boolean `(true|false)` to determine if an update is available.

To download the most up-to-date version, use `installUpdate`. This will return a promise resolving to a boolean `(true|false)` if the installation was successful or not. The new version will instal ontop of the existing version.

## License

[WTFPL](LICENSE.txt)
