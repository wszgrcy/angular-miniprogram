import { join, normalize, resolve } from '@angular-devkit/core';
import { createCssSelectorForTs } from 'cyia-code-util';
import { Injector } from 'static-injector';
import { VariableDeclaration } from 'typescript';
import * as webpack from 'webpack';
import { TemplateScopeOutside } from '../browser/library-template-scope.service';
import {
  GLOBAL_TEMPLATE_SUFFIX,
  InjectorSymbol,
  LIBRARY_OUTPUT_ROOTDIR,
  TemplateScopeSymbol,
} from '../const';
import { ExtraTemplateData } from '../library/type';
import { BuildPlatform } from '../platform/platform';
import { libraryTemplateResolve } from '../util/library-template-resolve';
import { stringConfigToObjectConfig } from '../util/string-config-to-object-config';

export default async function (
  this: webpack.LoaderContext<any>,
  data: string,
  map: string
) {
  const callback = this.async();
  const selector = createCssSelectorForTs(data);
  const injector: Injector = (this._compilation! as any)[InjectorSymbol];
  const buildPlatform = injector.get(BuildPlatform);
  const templateScopeOutside = (this._compilation as any)[
    TemplateScopeSymbol
  ] as TemplateScopeOutside;
  const selfTemplateNode = selector.queryOne(
    `VariableDeclaration[name="$self_${GLOBAL_TEMPLATE_SUFFIX}"]`
  ) as VariableDeclaration;
  if (selfTemplateNode) {
    const content = selfTemplateNode.initializer!.getText();
    const config: ExtraTemplateData = stringConfigToObjectConfig(content);

    this.emitFile(
      config.outputPath + buildPlatform.fileExtname.contentTemplate,
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
    const config: Record<string, ExtraTemplateData> =
      stringConfigToObjectConfig(content);

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
