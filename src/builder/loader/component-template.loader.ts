import * as webpack from 'webpack';
import { createCssSelectorForTs, TsChange } from 'cyia-code-util';
import * as ts from 'typescript';
import { ExportWeiXinAssetsPluginSymbol } from '../const';
import { RawUpdater } from '../util/raw-updater';
import * as path from 'path';
import { PlatformInfo } from '../platform/platform-info';
export default function (this: webpack.LoaderContext<any>, data: string) {
  let sf = ts.createSourceFile(
    this.resourcePath,
    data,
    ts.ScriptTarget.Latest,
    true
  );
  let selector = createCssSelectorForTs(sf);
  let node = selector.queryOne(
    'BinaryExpression[left$=ɵcmp] CallExpression ObjectLiteralExpression PropertyAssignment[name=template]'
  ) as ts.PropertyAssignment;
  if (!node) {
    return data;
  }

  let map = (this._compilation! as any)[ExportWeiXinAssetsPluginSymbol]
    .htmlContextMap as Map<string, string[]>;
  let platformInfo = (this._compilation! as any)[ExportWeiXinAssetsPluginSymbol]
    .platformInfo as PlatformInfo;
  let viewContextName = platformInfo.templateTransform.viewContextName;

  let context = map.get(path.normalize(this.resourcePath))!;
  let obj: Record<string, any> = {};
  let list = context
    .map((item) => item)
    .filter((item) => {
      if (item in obj) {
        return false;
      }
      obj[item] = true;
      return true;
    })
    .map((item) => `{value:ctx.${item},name:"${item}"}`)
    .join(',');
  let content = `{
    if(rf&2){wx.__window.__propertyChange(ctx,[${list}],'${viewContextName}')}
  }`;
  let change = new TsChange(sf);
  let replaceChange = change.replaceNode(
    (node.initializer as any as ts.FunctionDeclaration).body!,
    content
  );
  data = RawUpdater.update(data, [replaceChange]);

  return data;
}
