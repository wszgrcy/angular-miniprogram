import * as webpack from 'webpack';
import { changeComponent } from '../../component-template-inject/change-component';

export default async function (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: webpack.LoaderContext<any>,
  data: string,
  map: string
) {
  const callback = this.async();
  const changeData = changeComponent(data)!;

  if (typeof data === 'undefined' || typeof changeData === 'undefined') {
    callback(undefined, data, map);
    return;
  }

  callback(undefined, changeData.content);
}
