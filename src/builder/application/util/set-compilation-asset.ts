import * as webpack from 'webpack';

export function setCompilationAsset(
  compilation: webpack.Compilation,
  key: string,
  content: webpack.sources.Source
) {
  if (compilation.getAsset(key)) {
    compilation.updateAsset(key, content, {});
  } else {
    compilation.emitAsset(key, content, {});
  }
}
