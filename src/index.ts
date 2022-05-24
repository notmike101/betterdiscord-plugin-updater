import semver from 'semver';
import { Plugins, showToast } from 'betterdiscord/bdapi';
import { version } from '../package.json';

export interface UpdaterInterface {
  isUpdateAvailable(): Promise<boolean>;
  installUpdate(): Promise<boolean>;
}

export class Updater implements UpdaterInterface {
  private updatePath: string;
  private currentVersion: string;
  private updatedPluginText: string;
  private pluginName: string;

  constructor(updatePath: string, currentVersion: string) {
    this.updatePath = updatePath;
    this.currentVersion = currentVersion;
    this.updatedPluginText = '';
  }

  private log(...message: string[]): void {
    console.log(`%c[PluginUpdater]%c (${version})%c ${message.join(' ')}`, 'color: lightblue;', 'color: gray', 'color: white');
  }

  private async downloadPluginFile(): Promise<void> {
    try {
      const res = await fetch(this.updatePath);
      const pluginText = await res.text();

      this.pluginName = this.updatePath.split('/').slice(-1)[0];

      this.updatedPluginText = pluginText;
    } catch (err) {
      this.log('Failed to download plugin file', (err as Error).message);
    }
  }

  public async isUpdateAvailable(): Promise<boolean> {
    try {
      if (!this.updatePath) throw new Error('No update path defined for this plugin');
      if (!this.currentVersion) throw new Error('Current version of plugin unknown');

      await this.downloadPluginFile();

      const latestVersion = this.updatedPluginText.match(/@version (.*)/)![1];

      return semver.gt(latestVersion, this.currentVersion);
    } catch (err) {
      this.log('Failed to check for updates', (err as Error).message);

      return false;
    }
  }

  public async installUpdate(): Promise<boolean> {
    try {
      showToast(`Downloading update for ${this.pluginName}`, { type: 'info'});

      const fs = require('fs');

      await new Promise((resolve, reject): void=> {
        fs.writeFile(`${Plugins.folder}/${this.pluginName}`, this.updatedPluginText, (err): void => {
          if (err) reject(err);

          resolve(true);
        });
      });

      showToast(`Downloaded update for ${this.pluginName}`, { type: 'success'});

      return true;
    } catch (err) {
      this.log('Failed to download and install update', (err as Error).message);

      showToast(`Failed to download and install update for ${this.pluginName}`, { type: 'error'});

      return false;
    }
  }
}

export default Object.freeze({
  Updater,
});
