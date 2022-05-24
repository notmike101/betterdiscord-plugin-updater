import semver from 'semver';
import { Plugins, showToast } from 'betterdiscord/bdapi';

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
  private updateNotice: HTMLDivElement;
  private storedNoticeContainer: HTMLDivElement;
  private remotePluginInfo: PluginInfo;

  constructor(updatePath: string, currentVersion: string) {
    this.updatePath = updatePath;
    this.currentVersion = currentVersion;
    this.remotePluginInfo = {};

    this.createUpdateNotice();
  }

  private get noticeContainer(): HTMLDivElement {
    if (!this.storedNoticeContainer) {
      const existingNoticeContainer: HTMLDivElement = document.querySelector('#plugin-updater-notice-container');

      if (!existingNoticeContainer) {
        const noticeContainer: HTMLDivElement = document.createElement('div');

        noticeContainer.id = 'plugin-updater-notice-container';
        noticeContainer.style.cssText = `
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          align-items: center;
          justify-content: center;
        `;

        this.storedNoticeContainer = noticeContainer;
        
        document.querySelector('#app-mount > div[class^="app"] > div[class^="app"]').prepend(noticeContainer);
      } else {
        this.storedNoticeContainer = existingNoticeContainer;
      }
    }

    return this.storedNoticeContainer;
  }

  private log(...message: string[]): void {
    console.log(`%c[PluginUpdater]%c (${process.env.VERSION})%c ${message.join(' ')}`, 'color: lightblue;', 'color: gray', 'color: white');
  }

  private dismissNotice(): void {
    this.updateNotice.remove();
  }

  private createUpdateNotice(): void {
    const notice: HTMLDivElement = document.createElement('div');
    const noticeText: HTMLSpanElement = document.createElement('span');
    const noticeApprove: HTMLButtonElement = document.createElement('button');
    const noticeRefuse: HTMLButtonElement = document.createElement('button');
    
    notice.classList.add('plugin-updater-update-notice');

    notice.style.cssText = `
      display: none;
      flex: 1;
      background-color: var(--info-help-background);
      color: var(--info-help-text);
      padding: 6px 0;
      font-size: 12px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 100%;
      border-bottom: 1px solid var(--info-help-background);
      margin: 0 15px;
    `;

    noticeApprove.style.cssText = `
      color: #ffffff;
      background-color: var(--button-positive-background);
      border: 0;
      outline: none;
      margin: 0 15px;
    `;

    noticeRefuse.style.cssText = `
      color: #ffffff;
      background-color: var(--button-danger-background);
      border: 0;
      outline: none;
    `;


    noticeApprove.textContent = 'Update';
    noticeRefuse.textContent = 'Ignore';

    noticeApprove.addEventListener('pointerup', this.installUpdate.bind(this));
    noticeRefuse.addEventListener('pointerup', this.dismissNotice.bind(this));

    notice.append(noticeText, noticeApprove, noticeRefuse);

    this.updateNotice = notice;

    this.noticeContainer.append(this.updateNotice);
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
    this.updateNotice.querySelector('span').textContent = `Update available for ${this.remotePluginInfo.name}`;
    this.updateNotice.style.display = 'flex';
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

      this.dismissNotice();

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
