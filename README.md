# BetterDiscord Plugin Updater

> Library to assist in updating BetterDiscord plugins automatically

[![NPM](https://nodei.co/npm/betterdiscord-plugin-updater.png)](https://nodei.co/npm/betterdiscord-plugin-updater/)

## Install

```
npm install betterdiscord-plugin-updater
```

## Usage

This plugin **should** be compatible with both ESM and CJS.


To check for updates, use `isUpdateAvailable`. This will return a promise resolving to a boolean `(true|false)` to determine if an update is available.

To allow the user to download the most up-to-date version of your plugin, use `showUpdateBanner`. This will display a banner on the top of discord allowing the user to accept or refuse the available update.

To forcefully download an the most up-to-date version of your code, either without user interaction or for custom implementation, use `installUpdate`.

**NOTE**: To abide by the BetterDiscord Plugin policy, you should not trigger an update yourself, it must be triggered by the user.

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
    await this.updater.showUpdateBanner();
  }
}
```
## License

[WTFPL](LICENSE.txt)
