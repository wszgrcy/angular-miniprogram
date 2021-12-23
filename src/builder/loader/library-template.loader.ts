import { join, normalize, resolve } from '@angular-devkit/core';
import { createCssSelectorForTs } from 'cyia-code-util';
import { Injector } from 'static-injector';
import { VariableDeclaration } from 'typescript';
import * as webpack from 'webpack';
import {
  ExportMiniProgramAssetsPluginSymbol,
  GLOBAL_TEMPLATE_SUFFIX,
  InjectorSymbol,
  LIBRARY_OUTPUT_PATH,
  TemplateScopeSymbol,
} from '../const';
import { TemplateScopeOutside } from '../html/library-template-scope.service';
import { ExtraTemplateData } from '../library/type';
import { BuildPlatform } from '../platform/platform';
import { libraryTemplateResolve } from '../util/library-template-resolve';
import { ComponentTemplateLoaderContext } from './type';

export default async function (
  this: webpack.LoaderContext<any>,
  data: string,
  map: string
) {
  const callback = this.async();
  const selector = createCssSelectorForTs(data);
  const selfTemplateNode = selector.queryOne(
    `VariableDeclaration[name="$self_${GLOBAL_TEMPLATE_SUFFIX}"]`
  ) as VariableDeclaration;
  const injector: Injector = (this._compilation! as any)[InjectorSymbol];
  const context: ComponentTemplateLoaderContext = (this._compilation! as any)[
    ExportMiniProgramAssetsPluginSymbol
  ];
  const buildPlatform = injector.get(BuildPlatform);
  const templateScopeOutside = (this._compilation as any)[
    TemplateScopeSymbol
  ] as TemplateScopeOutside;
  if (selfTemplateNode) {
    const content = selfTemplateNode.initializer!.getText();
    const config: ExtraTemplateData = new Function('', `return ${content}`)();
    this.emitFile(
      resolve(
        normalize('/'),
        join(
          normalize(LIBRARY_OUTPUT_PATH),
          config.moduleId!,
          'self' + buildPlatform.fileExtname.contentTemplate
        )
      ),
      libraryTemplateResolve(
        config.template,
        buildPlatform.templateTransform.getData().directivePrefix,
        buildPlatform.templateTransform.eventListConvert,
        buildPlatform.templateTransform.templateInterpolation,
        buildPlatform.fileExtname
      )
    );
  }
  const libraryTemplateNode = selector.queryOne(
    `VariableDeclaration[name="library_${GLOBAL_TEMPLATE_SUFFIX}"]`
  ) as VariableDeclaration;
  if (libraryTemplateNode) {
    const content = libraryTemplateNode.initializer!.getText();
    const config: Record<string, ExtraTemplateData> = new Function(
      '',
      `return ${content}`
    )();
    for (const key in config) {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        const element = config[key];
        templateScopeOutside.setScopeExtraUseComponents(key, {
          useComponents: element.useComponents!,
          templateList: [element.template],
        });
      }
    }
  }
  callback(undefined, data, map);
}
