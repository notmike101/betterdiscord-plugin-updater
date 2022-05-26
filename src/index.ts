import semver from 'semver';
import { Plugins, showToast } from 'betterdiscord/bdapi';
import { Banners } from 'betterdiscord-plugin-banners';

export interface UpdaterInterface {
  isUpdateAvailable(): Promise<boolean>;
  installUpdate(): Promise<boolean>;
  showUpdateBanner(): void;
}

interface PluginInfo {
  name?: string;
  version?: string;
  fileName?: string;
  content?: string;
}

export class Updater implements UpdaterInterface {
  private updatePath: string;
  private currentVersion: string;
  private remotePluginInfo: PluginInfo;
  private banners: Banners;

  constructor(updatePath: string, currentVersion: string) {
    this.updatePath = updatePath;
    this.currentVersion = currentVersion;
    this.remotePluginInfo = {};
    this.banners = new Banners();
  }

  private log(...message: string[]): void {
    console.log(`%c[PluginUpdater]%c (${process.env.VERSION})%c ${message.join(' ')}`, 'color: lightblue;', 'color: gray', 'color: white');
  }

  private async downloadPluginFile(): Promise<void> {
    try {
      const res: Response = await fetch(this.updatePath);
      const pluginText: string = await res.text();

      this.remotePluginInfo.fileName = this.updatePath.split('/').slice(-1)[0];
      this.remotePluginInfo.name = pluginText.match(/@name (.*)/)![1];
      this.remotePluginInfo.version = pluginText.match(/@version (.*)/)![1];
      this.remotePluginInfo.content = pluginText;
    } catch (err) {
      this.log('Failed to download plugin file', (err as Error).message);
    }
  }

  public async isUpdateAvailable(): Promise<boolean> {
    try {
      if (!this.updatePath) throw new Error('No update path defined for this plugin');
      if (!this.currentVersion) throw new Error('Current version of plugin unknown');

      await this.downloadPluginFile();

      return semver.gt(this.remotePluginInfo.version, this.currentVersion);
    } catch (err) {
      this.log('Failed to check for updates', (err as Error).message);

      return false;
    }
  }

  public showUpdateBanner(): void {
    this.banners.createBanner(`Update available for ${this.remotePluginInfo.name}`, {
      acceptCallback: this.installUpdate.bind(this),
    });
  }

  public async installUpdate(): Promise<boolean> {
    try {
      const fs: any = require('fs');

      if (!fs) throw new Error('Unable to load `fs` module');

      await new Promise((resolve, reject): void => {
        fs.writeFile(`${Plugins.folder}/${this.remotePluginInfo.fileName}`, this.remotePluginInfo.content, (err: Error): void => {
          if (err) reject(err);

          resolve(true);
        });
      });

      showToast(`${this.remotePluginInfo.name} updated`, { type: 'success'});

      return true;
    } catch (err) {
      showToast(`Failed to download and install update for ${this.remotePluginInfo.name}`, { type: 'error'});

      return false;
    }
  }
}

export default Object.freeze({
  Updater,
});
