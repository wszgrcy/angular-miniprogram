import { ResolvedValue } from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import { WebpackResourceLoader } from '@ngtools/webpack/src/resource_loader';
import ts from 'typescript';
import * as webpack from 'webpack';

export class NgComponentCssExtractPlugin {
  cssMap = new Map<string, Promise<string>>();

  constructor(
    private map: Map<string, { styles: string[]; styleUrls: string[] }>,
    private resourceLoader: WebpackResourceLoader
  ) {}
  run(compilation: webpack.Compilation) {
    this.resourceLoader.update(compilation);
    this.map.forEach((value, outputPath) => {
      const styles = value.styles;
      const styleList: Promise<string>[] = [];
      if (styles && styles.length) {
        styles.forEach((value) => {
          styleList.push(
            this.resourceLoader.process(value, 'text/css', 'style', outputPath)
          );
        });
      }
      const styleUrls = value.styleUrls;
      if (styleUrls && styleUrls.length) {
        styleUrls.forEach((value) => {
          styleList.push(this.resourceLoader.get(value));
        });
      }
      this.cssMap.set(
        outputPath,
        Promise.all(styleList).then((list) => list.join('\n'))
      );
    });
  }
  getAllCss() {
    return this.cssMap;
  }
}
