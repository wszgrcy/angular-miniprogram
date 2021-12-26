import { WebpackResourceLoader } from '@ngtools/webpack/src/resource_loader';
import * as webpack from 'webpack';
import { sources } from 'webpack';
import { setCompilationAsset } from '../util/set-compilation-asset';

export class NgComponentCssExtractPlugin {
  constructor(
    private map: Map<string, { styles: string[]; styleUrls: string[] }>,
    private resourceLoader: WebpackResourceLoader
  ) {}
  apply(compilation: webpack.Compilation) {
    const cssMap = new Map<string, Promise<string>>();
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
      cssMap.set(
        outputPath,
        Promise.all(styleList).then((list) => list.join('\n'))
      );
    });
    compilation.hooks.processAdditionalAssets.tapAsync(
      'NgComponentCssExtractPlugin',
      async (assets, cb) => {
        for (const [key, value] of cssMap.entries()) {
          setCompilationAsset(
            compilation,
            key,
            new sources.RawSource(await value)
          );
        }
        cb();
      }
    );
  }
}
