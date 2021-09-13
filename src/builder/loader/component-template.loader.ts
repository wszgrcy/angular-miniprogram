import { TsChange, createCssSelectorForTs } from 'cyia-code-util';
import * as path from 'path';
import * as ts from 'typescript';
import * as webpack from 'webpack';
import { ExportWeiXinAssetsPluginSymbol } from '../const';
import { PlatformInfo } from '../platform/platform-info';
import { RawUpdater } from '../util/raw-updater';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (this: webpack.LoaderContext<any>, data: string) {
  const sf = ts.createSourceFile(
    this.resourcePath,
    data,
    ts.ScriptTarget.Latest,
    true
  );
  const selector = createCssSelectorForTs(sf);
  const node = selector.queryOne(
    'BinaryExpression[left$=ɵcmp] CallExpression ObjectLiteralExpression PropertyAssignment[name=template]'
  ) as ts.PropertyAssignment;
  if (!node) {
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = (this._compilation! as any)[ExportWeiXinAssetsPluginSymbol]
    .htmlContextMap as Map<string, string[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platformInfo = (this._compilation! as any)[
    ExportWeiXinAssetsPluginSymbol
  ].platformInfo as PlatformInfo;
  const viewContextName = platformInfo.templateTransform.viewContextName;

  const context = map.get(path.normalize(this.resourcePath))!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: Record<string, any> = {};
  const list = context
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
  const content = `{
    if(rf&2){wx.__window.__propertyChange(ctx,[${list}],'${viewContextName}')}
  }`;
  const change = new TsChange(sf);
  const replaceChange = change.replaceNode(
    (node.initializer as unknown as ts.FunctionDeclaration).body!,
    content
  );
  data = RawUpdater.update(data, [replaceChange]);

  return data;
}
