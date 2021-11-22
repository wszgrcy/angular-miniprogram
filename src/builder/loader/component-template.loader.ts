import * as path from 'path';
import * as webpack from 'webpack';
import { ExportMiniProgramAssetsPluginSymbol } from '../const';
import { changeComponent } from '../ts/change-component';
import { ComponentTemplateLoaderContext } from './type';

export default async function (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: webpack.LoaderContext<any>,
  data: string,
  map: string
) {
  const callback = this.async();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context: ComponentTemplateLoaderContext = (this._compilation! as any)[
    ExportMiniProgramAssetsPluginSymbol
  ];
  const meta = (await context.metaMapPromise).get(
    path.normalize(this.resourcePath)
  )!;
  if (!meta) {
    callback(undefined, data, map);
    return;
  }
  const changeData = changeComponent(data, meta)!;
  if (typeof data === 'undefined') {
    callback(undefined, data, map);
    return;
  }

  callback(undefined, changeData);
}
