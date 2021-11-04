import { dirname, join, normalize } from '@angular-devkit/core';
import { NgtscProgram } from '@angular/compiler-cli';
import { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import { ResolvedValue } from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {
  ClassRecord,
  TraitCompiler,
} from '@angular/compiler-cli/src/ngtsc/transform';
import { DeleteChange, InsertChange, TsChange } from 'cyia-code-util';
import * as path from 'path';
import { config } from 'rxjs';
import { Inject, Injectable, Injector } from 'static-injector';
import ts, {
  CallExpression,
  ClassDeclaration,
  ObjectLiteralExpression,
  SourceFile,
} from 'typescript';
import { Compilation } from 'webpack';
import {
  COMPONENT_FILE_NAME_TOKEN,
  COMPONENT_TEMPLATE_CONTENT_TOKEN,
  TEMPLATE_COMPILER_OPTIONS_TOKEN,
} from '../token/component.token';
import {
  NGTSC_PROGRAM,
  NG_COMPILER,
  OLD_BUILDER,
  TS_TPROGRAM as TS_PROGRAM,
  TS_SYSTEM,
} from '../token/ts-program.token';
import { WEBPACK_COMPILATION } from '../token/webpack.token';
import { DecoratorMetaDataResolver } from '../ts/decorator-metadata-resolver';
import { RawUpdater } from '../util/raw-updater';
import { TemplateGlobalContext } from './node-handle/global-context';
import { TemplateCompiler } from './template-compiler';
import { TemplateInterpolationService } from './template-interpolation.service';

@Injectable()
export class TemplateService {
  private resolver!: DecoratorMetaDataResolver;
  private componentToModule = new Map<SourceFile, SourceFile>();
  private changeFileMap = new Map<
    string,
    { sizeOffset: number; content: string }
  >();
  constructor(
    @Inject(NG_COMPILER) private ngCompiler: NgCompiler,
    @Inject(TS_PROGRAM) private tsProgram: ts.Program,
    @Inject(NGTSC_PROGRAM) private ngTscProgram: NgtscProgram,
    private injector: Injector,
    @Inject(WEBPACK_COMPILATION) private compilation: Compilation,
    @Inject(TS_SYSTEM) private system: ts.System
  ) {
    this.resolver = new DecoratorMetaDataResolver(
      this.tsProgram,
      this.tsProgram.getTypeChecker()
    );
    this.tsProgram
      .getSourceFiles()
      .filter((sf) => !sf.isDeclarationFile)
      .filter((sf) => !sf.fileName.includes('node_modules'))
      .forEach((item) => {
        this.resolver.resolverSourceFile(item);
      });
  }
  removeStyle() {
    this.resolver.getComponentMetaMap().forEach((value, key) => {
      this.removeTemplateAndStyleInTs(
        (key.decorators![0].expression as CallExpression)
          .arguments[0] as ObjectLiteralExpression,
        key.getSourceFile(),
        ''
      );
    });
    return this.changeFileMap;
  }
  buildTemplate() {
    this.resolver.getModuleMetaMap().forEach((value, key) => {
      if (value['declarations'] && value['declarations'].length) {
        if (value['declarations'].length > 1) {
          throw new Error('类声明组件超过一个');
        }
        const ref = value['declarations'][0];
        const sf = ref.node.getSourceFile();
        this.componentToModule.set(sf, key.getSourceFile());
      }
    });
    const traitCompiler: TraitCompiler = (this.ngCompiler as any).compilation
      .traitCompiler;
    this.resolver.getComponentMetaMap().forEach((value, key) => {
      const original = ts.getOriginalNode(key) as ClassDeclaration;
      const record = (
        (traitCompiler as any).classes as Map<ts.ClassDeclaration, ClassRecord>
      ).get(original)!;
      record;
      //   const WXMLTemplate = this.buildWxmlTemplate(key, value);
      //   const module = this.componentToModule.get(key.getSourceFile());
      //   const entry = this.getModuleEntry(module!);
      //   if (!entry) {
      //     throw new Error('没有找到对应的出口信息');
      //   }
      //   this.WXMLMap.set(entry.outputWXML, WXMLTemplate.content);
      //   if (WXMLTemplate.template) {
      //     this.WXMLMap.set(
      //       join(dirname(normalize(entry.outputWXML)), 'template.wxml'),
      //       WXMLTemplate.template
      //     );
      //   }
      //   this.removeTemplateAndStyleInTs(
      //     (key.decorators![0].expression as CallExpression)
      //       .arguments[0] as ObjectLiteralExpression,
      //     key.getSourceFile(),
      //     WXMLTemplate.htmlTemplate
      //   );
      //   this.updateLogicMap.set(
      //     path.normalize(key.getSourceFile().fileName),
      //     WXMLTemplate.logic
      //   );
    });
  }
  private removeTemplateAndStyleInTs(
    objectNode: ObjectLiteralExpression,
    sf: SourceFile,
    htmlString: string
  ) {
    const change = new TsChange(sf);
    const list: (InsertChange | DeleteChange)[] = change.deleteChildNode(
      objectNode,
      (node) => {
        let value: string;
        if (ts.isPropertyAssignment(node)) {
          const propertyName = node.name;
          if (
            ts.isIdentifier(propertyName) ||
            ts.isStringLiteral(propertyName) ||
            ts.isNumericLiteral(propertyName)
          ) {
            value = propertyName.text;
          } else {
            return false;
          }
        } else if (ts.isShorthandPropertyAssignment(node)) {
          value = node.name.text;
        } else {
          return false;
        }

        return /^(templateUrl|template|styleUrls|styles)$/.test(
          value as string
        );
      }
    );
    if (typeof htmlString === 'string' && htmlString) {
      list.push(change.insertChildNode(objectNode, `template:"${htmlString}"`));
    } else {
      list.push(change.insertChildNode(objectNode, `template:''`));
    }
    list.sort((a, b) => {
      return b.start - a.start;
    });
    const content = RawUpdater.update(sf.text, list);
    this.changeFileMap.set(path.normalize(sf.fileName), {
      sizeOffset: sf.text.length - content.length,
      content: content,
    });
  }

  private buildWxmlTemplate(
    classDeclaration: ts.ClassDeclaration,
    meta: Record<string, ResolvedValue>
  ) {
    let templateContent = '';
    const templateUrl = meta['templateUrl'] as string;
    if (templateUrl) {
      templateContent = this.system.readFile(templateUrl)!;
      this.compilation.fileDependencies.add(templateUrl);
    } else {
      templateContent = meta['template'] as string;
    }
    if (typeof templateContent !== 'string') {
      throw new Error('解析错误');
    }
    const interpolation = meta['interpolation'] as string[];
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: TemplateCompiler },
        {
          provide: COMPONENT_FILE_NAME_TOKEN,
          useValue: classDeclaration.getSourceFile().fileName,
        },
        {
          provide: COMPONENT_TEMPLATE_CONTENT_TOKEN,
          useValue: templateContent,
        },
        {
          provide: TEMPLATE_COMPILER_OPTIONS_TOKEN,
          useValue: { interpolation },
        },
        { provide: TemplateInterpolationService },
        { provide: TemplateGlobalContext },
      ],
    });
    const instance = injector.get(TemplateCompiler);
    return instance.transform();
  }
}
