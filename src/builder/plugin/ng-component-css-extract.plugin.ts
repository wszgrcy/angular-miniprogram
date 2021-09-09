import * as webpack from 'webpack';
import { WebpackResourceLoader } from '@ngtools/webpack/src/resource_loader';
import ts from 'typescript';
import { ResolvedValue } from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
export class NgComponentCssExtractPlugin {
  cssMap = new Map<ts.ClassDeclaration, Promise<string>>();

  constructor(
    private map: Map<ts.ClassDeclaration, Record<string, ResolvedValue>>,
    private resourceLoader: WebpackResourceLoader
  ) {}
  run(compilation: webpack.Compilation) {
    this.resourceLoader.update(compilation);
    this.map.forEach((value, key) => {
      let styles = value['styles'] as string[];
      let styleList: Promise<string>[] = [];
      if (styles && styles.length) {
        styles.forEach((value) => {
          styleList.push(
            this.resourceLoader.process(
              value,
              'text/css',
              'style',
              key.getSourceFile().fileName
            )
          );
        });
      }
      let styleUrls = value['styleUrls'] as string[];
      if (styleUrls && styleUrls.length) {
        styleUrls.forEach((value) => {
          styleList.push(this.resourceLoader.get(value));
        });
      }
      this.cssMap.set(
        key,
        Promise.all(styleList).then((list) => list.join('\n'))
      );
    });
  }
  getAllCss() {
    return this.cssMap;
  }
}
