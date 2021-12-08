import { Path, join, normalize } from '@angular-devkit/core';
import {
  fileBufferToString,
  stringToFileBuffer,
} from '@angular-devkit/core/src/virtual-fs/host';
import { JasmineBuilderHarness } from '../plugin-describe-builder';
export async function getAllFile(
  harness: JasmineBuilderHarness<any>,
  dirPath: Path
): Promise<string[]> {
  const fileList: string[] = [];
  const list = await harness.host.list(dirPath).toPromise();
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    const filePath = join(dirPath, element);
    if (await harness.host.isDirectory(filePath).toPromise()) {
      fileList.push(...(await getAllFile(harness, filePath)));
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

export async function importPathRename(
  harness: JasmineBuilderHarness<any>,
  list: string[]
) {
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    const content = await harness.host.read(normalize(element)).toPromise();
    let contentString = Buffer.from(content).toString();

    contentString = contentString
      .replace(/\/__components\//g, '/components/')
      .replace(/\/__pages\//g, '/pages/');

    await harness.host
      .write(normalize(element), stringToFileBuffer(contentString))
      .toPromise();
  }
}
export const ALL_PAGE_NAME_LIST = [
  `root`,
  `base-component`,
  `base-directive`,
  `base-tap`,
  `complex-property-event`,
  `complex-structure`,
  `custom-structural-directive`,
  `default-structural-directive`,
  `ng-content`,
];
export const ALL_COMPONENT_NAME_LIST = [
  `component1`,
  `component2`,
  `component3`,
  `content`,
  `content-multi`,
];
export async function addPageEntry(
  harness: JasmineBuilderHarness<any>,
  list: string[]
) {
  const configPath = join(normalize(harness.host.root()), 'src', 'app.json');
  const file = await harness.host.read(configPath).toPromise();
  const json = JSON.parse(fileBufferToString(file));
  const entryList = ALL_PAGE_NAME_LIST.map(
    (item) => `pages/${item}/${item}.entry`
  );
  json.pages = entryList;
  await harness.host
    .write(configPath, stringToFileBuffer(JSON.stringify(json)))
    .toPromise();
}
export async function copySpecifiedPages(
  harness: JasmineBuilderHarness<any>,
  list: string[]
) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    await harness.host
      .rename(
        normalize(join(harness.host.root(), 'src', '__pages', item)),
        normalize(join(harness.host.root(), 'src', 'pages', item))
      )
      .toPromise();
  }
}
export async function copySpecifiedComponents(
  harness: JasmineBuilderHarness<any>,
  list: string[]
) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    await harness.host
      .rename(
        normalize(join(harness.host.root(), 'src', '__components', item)),
        normalize(join(harness.host.root(), 'src', 'components', item))
      )
      .toPromise();
  }
}
