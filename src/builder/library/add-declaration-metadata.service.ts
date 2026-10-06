import type {
  R3ComponentMetadata,
  R3DirectiveMetadata,
} from '@angular/compiler';
import { createCssSelectorForTs } from 'cyia-code-util';
import { inject } from 'static-injector';
import ts from 'typescript';
import { MiniProgramCompilerService } from '../mini-program-compiler';
import { getComponentOutputPath } from './get-library-path';
import { LibraryDirectiveMetaRecord } from './library-meta-schema';
import {
  recordLibraryComponentMeta,
  recordLibraryDirectiveMeta,
} from './library-meta-store';
import { ENTRY_POINT_TOKEN } from './token';

/**
 * 把本 entry 编译期拿到的指令 / 组件 host 元数据登记进 sidecar 暂存区。
 * 不改写 `.d.ts`：`.d.ts` 是类型契约，不当 key-value 存储用。元数据走
 * `mp-library-meta.json` sidecar，扁平化怎么处理与我们无关。
 */
export class AddDeclarationMetaDataService {
  private entryPoint = inject(ENTRY_POINT_TOKEN);
  private directiveMap: Map<ts.ClassDeclaration, R3DirectiveMetadata>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private componentMap: Map<ts.ClassDeclaration, R3ComponentMetadata<any>>;

  constructor() {
    const miniProgramCompilerService = inject(MiniProgramCompilerService);
    this.directiveMap = miniProgramCompilerService.getDirectiveMap();
    this.componentMap = miniProgramCompilerService.getComponentMap();
  }

  /** 扫描本文件产出的 d.ts，把里面的指令/组件登记进暂存区，然后原样返回内容。 */
  run(_dTsFileName: string, data: string): string {
    const list = createCssSelectorForTs(data).queryAll(
      `ClassDeclaration`,
    ) as ts.ClassDeclaration[];
    this.recordComponents(list);
    this.recordDirectives(list);
    return data;
  }

  private recordComponents(list: ts.ClassDeclaration[]) {
    for (const classDeclaration of list) {
      if (!hasStaticMember(classDeclaration, 'ɵcmp')) {
        continue;
      }
      const className = classDeclaration.name?.getText();
      if (!className) {
        continue;
      }
      const base = this.readHostBinding(className, this.componentMap);
      recordLibraryComponentMeta(this.entryPoint, className, {
        ...base,
        outputPath: getComponentOutputPath(this.entryPoint, className),
      });
    }
  }

  private recordDirectives(list: ts.ClassDeclaration[]) {
    for (const classDeclaration of list) {
      // 组件的 `ɵcmp` 里也带 `ɵdir`，但组件已在上面登记过，这里只处理纯指令，避免同一个类进两个桶
      if (hasStaticMember(classDeclaration, 'ɵcmp')) {
        continue;
      }
      if (!hasStaticMember(classDeclaration, 'ɵdir')) {
        continue;
      }
      const className = classDeclaration.name?.getText();
      if (!className) {
        continue;
      }
      recordLibraryDirectiveMeta(
        this.entryPoint,
        className,
        this.readHostBinding(className, this.directiveMap),
      );
    }
  }

  private readHostBinding(
    className: string,
    map: Map<ts.ClassDeclaration, R3DirectiveMetadata>,
  ): LibraryDirectiveMetaRecord {
    for (const meta of map.values()) {
      if (meta.name !== className) {
        continue;
      }
      return {
        listeners: Object.keys(
          (meta.host.listeners ?? {}) as Record<string, string>,
        ),
        properties: Object.keys(
          (meta.host.properties ?? {}) as Record<string, string>,
        ),
      };
    }
    return { listeners: [], properties: [] };
  }
}

/** 判断类里有没有某个静态成员（`static ɵcmp` / `static ɵdir`）。 */
function hasStaticMember(
  classDeclaration: ts.ClassDeclaration,
  memberName: string,
): boolean {
  return classDeclaration.members.some(
    (item) =>
      ts.isPropertyDeclaration(item) &&
      item.modifiers?.some((modifier) => modifier.getText() === 'static') &&
      item.name.getText() === memberName,
  );
}
