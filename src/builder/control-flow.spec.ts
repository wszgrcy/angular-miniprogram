import { normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  MyTestProjectHost,
  describeBuilder,
} from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
} from '../../test/util/file';
import { runBuilder } from './application';
import { PlatformType } from './platform/platform';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  sourceMap: false,
};

const CONTROL_FLOW_TEMPLATE_KINDS = [
  'ifBlock',
  'forBlock',
  'forEmpty',
  'switchCase',
] as const;

/** 从 wxml 里按模板名前缀收集控制流锚点索引 */
function collectAnchorsFromWxml(wxml: string): Map<string, Set<number>> {
  const result = new Map<string, Set<number>>();
  const reg = /<template name="(ifBlock|forBlock|forEmpty|switchCase)_(\d+)">/g;
  let match: RegExpExecArray | null;
  while ((match = reg.exec(wxml))) {
    const set = result.get(match[1]) || new Set<number>();
    set.add(parseInt(match[2], 10));
    result.set(match[1], set);
  }
  return result;
}

/** 构建一次，多个用例复用同一份产物 */
function memoize<T>(fn: () => Promise<T>) {
  let promise: Promise<T> | undefined;
  return () => (promise = promise ?? fn());
}

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('control-flow', () => {
    const load = memoize(async () => {
      const root = harness.host.root();
      const myTestProjectHost = new MyTestProjectHost(harness.host);
      const list = await myTestProjectHost.getFileList(
        normalize(path.join(root, 'src', '__pages'))
      );
      list.push(
        ...(await myTestProjectHost.getFileList(
          normalize(path.join(root, 'src', '__components'))
        ))
      );
      await myTestProjectHost.importPathRename(list);
      await myTestProjectHost.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
      await myTestProjectHost.moveDir(
        ALL_COMPONENT_NAME_LIST,
        '__components',
        'components'
      );
      await myTestProjectHost.addPageEntry(ALL_PAGE_NAME_LIST);
      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
      expect(result.error).toBeFalsy();
      expect(result.result?.success).toBeTruthy();

      const base = result.result?.baseOutputPath as string;
      const wxml = fs.readFileSync(
        path.join(base, 'pages/control-flow/control-flow-entry.wxml'),
        'utf8'
      );
      const compiled = fs.readFileSync(
        path.join(base, 'pages/control-flow/control-flow-entry.js'),
        'utf8'
      );
      return { wxml, compiled };
    });

    it('应该为 @if / @for / @switch 生成模板', async () => {
      const { wxml } = await load();
      const anchors = collectAnchorsFromWxml(wxml);
      expect([...anchors.keys()].sort()).toEqual(
        [...CONTROL_FLOW_TEMPLATE_KINDS].sort()
      );
    });

    it('同一个 wxml 内模板名不能重复', async () => {
      const { wxml } = await load();
      const names = [...wxml.matchAll(/<template name="([^"]+)">/g)].map(
        (m) => m[1]
      );
      expect(names.length).toBeGreaterThan(0);
      expect(new Set(names).size).toBe(names.length);
    });

    it('@if / @switch 分支锚点必须命中编译产物里的模板声明', async () => {
      const { wxml, compiled } = await load();
      const anchors = collectAnchorsFromWxml(wxml);
      const declared = new Set(
        [...compiled.matchAll(/\((\d+),\s*[A-Za-z0-9_]+_Template/g)].map((m) =>
          parseInt(m[1], 10)
        )
      );
      const repeaters = [
        ...compiled.matchAll(/repeaterCreate"\]\((\d+),/g),
      ].map((m) => parseInt(m[1], 10));
      const repeaterSlots = new Set<number>(
        repeaters.flatMap((start) => [start, start + 1, start + 2])
      );

      for (const kind of ['ifBlock', 'switchCase']) {
        const indexes = anchors.get(kind) || new Set<number>();
        expect(indexes.size).toBeGreaterThan(0);
        for (const index of indexes) {
          expect(declared.has(index)).toBe(true);
          // 条件分支不能落在 repeater 的槽位上
          expect(repeaterSlots.has(index)).toBe(false);
        }
      }
    });

    it('@for 主模板位于 repeaterCreate(index+1)，@empty 位于 index+2', async () => {
      const { wxml, compiled } = await load();
      const anchors = collectAnchorsFromWxml(wxml);
      const repeaters = [
        ...compiled.matchAll(/repeaterCreate"\]\((\d+),/g),
      ].map((m) => parseInt(m[1], 10));
      const expectedMain = new Set(repeaters.map((start) => start + 1));
      const expectedEmpty = new Set(
        repeaters
          .filter((start) =>
            compiled.includes(`ForEmpty_${start + 2}_Template`)
          )
          .map((start) => start + 2)
      );
      expect(anchors.get('forBlock')).toEqual(expectedMain);
      expect(anchors.get('forEmpty')).toEqual(expectedEmpty);
    });
  });
});
