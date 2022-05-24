# BetterDiscord Plugin updater

> Library to assist in updating BetterDiscord plugins automatically

## Install

```
npm install betterdiscord-plugin-updater
```

## Usage

This plugin **should** be compatible with both ESM and CJS.


To check for updates, use `isUpdateAvailable`. This will return a promise resolving to a boolean `(true|false)` to determine if an update is available.

To download the most up-to-date version, use `installUpdate`. This will return a promise resolving to a boolean `(true|false)` if the installation was successful or not. The new version will instal ontop of the existing version.

## Example

```js
// ESM
import { Updater } from 'betterdiscord-plugin-updater'
// CJS
const { Updater } = require('betterdiscord-plugin-updater');

// Initialize the updater in `load` to ensure it is available when the plugin starts
load() {
    this.updater = new Updater(updateURL, currentVersion);
}

// Please use in `start` to ensure the updater only runs when the plugin is enabled
start() {
  // Run the updater routine as soon as possible
  this.doUpdate();
}

async doUpdate() {
  const isUpdateAvailable = await this.updater.isUpdateAvailable();

  if (isUpdateAvailable) {
    await this.updater.installUpdate();
  }
}
```
## License

[WTFPL](LICENSE.txt)
