import { createCssSelectorForTs } from 'cyia-code-util';
import { Injector } from 'static-injector';
import { VariableDeclaration } from 'typescript';
import * as webpack from 'webpack';
import { TemplateScopeOutside } from '../../application/library-template-scope.service';
import { GLOBAL_TEMPLATE_SUFFIX } from '../../library';
import { ExtraTemplateData } from '../../library/type';
import { BuildPlatform } from '../../platform/platform';
import { literalResolve } from '../../util';
import { InjectorSymbol, TemplateScopeSymbol } from '../const';
import { LibraryTemplateLiteralConvertOptions } from '../type';

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
    const config: ExtraTemplateData = literalResolve(content);

    this.emitFile(
      config.outputPath + buildPlatform.fileExtname.contentTemplate,
      literalResolve<LibraryTemplateLiteralConvertOptions>(
        `\`${config.template}\``,
        {
          directivePrefix:
            buildPlatform.templateTransform.getData().directivePrefix,
          eventListConvert: buildPlatform.templateTransform.eventListConvert,
          templateInterpolation:
            buildPlatform.templateTransform.templateInterpolation,
          fileExtname: buildPlatform.fileExtname,
        }
      )
    );
  }
  const libraryTemplateNode = selector.queryOne(
    `VariableDeclaration[name="library_${GLOBAL_TEMPLATE_SUFFIX}"]`
  ) as VariableDeclaration;
  if (libraryTemplateNode) {
    const content = libraryTemplateNode.initializer!.getText();
    const config: Record<string, ExtraTemplateData> = literalResolve(content);

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
