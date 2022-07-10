/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TestProjectHost } from '@angular-devkit/architect/testing';

import { Path, join, normalize } from '@angular-devkit/core';
import {
  fileBufferToString,
  stringToFileBuffer,
} from '@angular-devkit/core/src/virtual-fs/host';

import type { Configuration } from 'webpack';

export interface TestContext {
  buildSuccess: (webpackConfig: Configuration) => void;
}

export class MyTestProjectHost {
  constructor(private host: TestProjectHost) {}
  async getFileList(dirPath: Path): Promise<string[]> {
    const fileList: string[] = [];
    const list = await this.host.list(dirPath).toPromise();
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const filePath = join(dirPath, element);
      if (await this.host.isDirectory(filePath).toPromise()) {
        fileList.push(...(await this.getFileList(filePath)));
      } else {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  async importPathRename(list: string[]) {
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const content = await this.host.read(normalize(element)).toPromise();
      let contentString = fileBufferToString(content);

      contentString = contentString
        .replace(/\/__components\//g, '/components/')
        .replace(/\/__pages\//g, '/pages/');

      await this.host
        .write(normalize(element), stringToFileBuffer(contentString))
        .toPromise();
    }
  }

  async moveDir(list: string[], from: string, to: string) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      await this.host
        .rename(
          normalize(join(this.host.root(), 'src', from, item)),
          normalize(join(this.host.root(), 'src', to, item))
        )
        .toPromise();
    }
  }
  async addPageEntry(list: string[]) {
    const configPath = join(normalize(this.host.root()), 'src', 'app.json');
    const file = await this.host.read(configPath).toPromise();
    const json = JSON.parse(fileBufferToString(file));
    const entryList = list.map((item) => `pages/${item}/${item}-entry`);
    json.pages = entryList;
    await this.host
      .write(configPath, stringToFileBuffer(JSON.stringify(json)))
      .toPromise();
  }
  async addSpecEntry(list: string[]) {
    const configPath = join(normalize(this.host.root()), 'src', 'app.json');
    const file = await this.host.read(configPath).toPromise();
    const json = JSON.parse(fileBufferToString(file));
    const entryList = list.map((item) => `spec/${item}/${item}-entry`);
    json.pages = entryList;
    await this.host
      .write(configPath, stringToFileBuffer(JSON.stringify(json)))
      .toPromise();
  }
}
import { setWorkspaceRoot } from 'cyia-ngx-devkit';
export * from 'cyia-ngx-devkit';
setWorkspaceRoot(join(normalize(__dirname), `../hello-world-app/`));
