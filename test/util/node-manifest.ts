/**
 * 从 Angular 编译产出的指令流中提取「节点清单」。
 *
 * ## 为什么需要
 *
 * wxml 里烧的是绝对下标（`nodeList[0]` / `nodeList[2]` / ...），
 * 运行时 `lViewToWXView` 产出的是 `nodeList[lViewIndex - HEADER_OFFSET]`。
 * 这两套下标必须严格相等，否则整页渲染错位——而且不报错。
 *
 * 本模块把「Angular 认定的节点下标」显式提取成一份可断言的数据结构，
 * 让「两端等价」从「恰好如此」变成「有测试证明」。
 *
 * ## 权威性
 *
 * 下标不是我们数出来的，是 Angular 的 `allocateSlots` 阶段算好后
 * **烤进每条指令的第一个参数**的（见 compiler 的 slot_allocation.ts：
 * `op.handle.slot = slotCount`）。所以这份清单等价于 Angular 的官方口径。
 *
 * 好处：i18n / 控制流 / 未来任何 pipeline 改造，都已经反映在指令流里，
 * 我们读到的就是最终结果，不需要自己重建那 ~30 个 phase。
 */
import * as ts from 'typescript';

/** 消耗节点槽位的指令（其第一个参数就是节点下标） */
const NODE_SLOT_INSTRUCTIONS = new Set([
  'elementStart',
  'element',
  'text',
  'template',
  'elementContainer',
  /**
   * 本 fork 的 patched 指令名（`ɵɵdom*` 系列）。
   *
   * ⚠️ 之前漏了这一组，导致 manifest 只收到 text（偶数下标），
   * 元素节点（奇数下标）全丢，「按组件精确校验」误报 8 个组件错位。
   * 实际产物是正确的——是提取器不完整，不是渲染 off-by-one。
   *
   * 已核对首参：
   *   domElementStart(index, ...)          消耗
   *   domElement(index)                   消耗
   *   domElementContainer(index, ...)     消耗
   *   domElementContainerStart(index,..)  消耗
   *   domTemplate(index, ...)             消耗
   * 不消耗（无 index 参数，故不列入）：
   *   domElementEnd() / domElementContainerEnd()
   *   domListener / domProperty / advance
   */
  'domElementStart',
  'domElement',
  'domElementContainer',
  'domElementContainerStart',
  'domTemplate',
  // 控制流 create 也占节点槽（本 fixture 未出现，但必须计入，
  // 否则又回到「漏算槽位」的老问题）
  'conditionalCreate',
  'conditionalBranchCreate',
  'repeaterCreate',
  'switchCreate',
  // i18n 块占一个 TI18n 节点槽——这正是原架构漏掉的那一类
  'i18nStart',
]);

export interface ManifestEntry {
  /** Angular 分配的节点下标（未加 HEADER_OFFSET） */
  index: number;
  /** 指令名，去掉 ɵɵ 前缀 */
  instruction: string;
  /** 元素标签（elementStart / element / elementContainer 有） */
  tag?: string;
}

export interface NodeManifest {
  componentName: string;
  entries: ManifestEntry[];
  /** max(index) + 1 —— Angular 认定的该视图节点总数 */
  nodeCount: number;
  /** 所有出现过的节点下标 */
  indices: Set<number>;
  /** 元素类节点的下标（wxml 会引用这些） */
  elementIndices: Set<number>;
}

function instructionName(callee: ts.Expression): string | undefined {
  // 兼容 webpack/rollup 的 `(0, mod["ɵɵelementStart"])(...)` 包装
  if (ts.isPropertyAccessExpression(callee)) {
    return callee.name.text.replace(/^ɵɵ/, '');
  }
  if (ts.isIdentifier(callee)) {
    return callee.text.replace(/^ɵɵ/, '');
  }
  return undefined;
}

function firstArgAsNumber(call: ts.CallExpression): number | undefined {
  const a = call.arguments[0];
  if (a && ts.isNumericLiteral(a)) {
    return Number(a.text);
  }
  return undefined;
}

function secondArgAsString(call: ts.CallExpression): string | undefined {
  const a = call.arguments[1];
  if (a && ts.isStringLiteral(a)) {
    return a.text;
  }
  return undefined;
}

/**
 * 遍历一个模板函数体（含嵌套的嵌入式模板函数），收集所有节点槽指令。
 *
 * 注意：必须递归进嵌套模板。嵌入式视图的下标是各自从 0 开始的，
 * 但收集在一起能让我们看到「有没有漏掉的构造类型」。
 */
export function extractNodeManifest(
  fn: ts.FunctionLikeDeclaration,
  componentName: string
): NodeManifest {
  const entries: ManifestEntry[] = [];
  const seen = new Set<ts.Node>();

  const walk = (node: ts.Node) => {
    if (seen.has(node)) {
      return;
    }
    seen.add(node);

    if (ts.isCallExpression(node)) {
      const name = instructionName(node.expression);
      if (name && NODE_SLOT_INSTRUCTIONS.has(name)) {
        const index = firstArgAsNumber(node);
        if (index !== undefined) {
          entries.push({
            index,
            instruction: name,
            tag: secondArgAsString(node),
          });
        }
      }
    }

    ts.forEachChild(node, walk);
  };

  walk(fn);

  const indices = new Set(entries.map((e) => e.index));
  const max = indices.size > 0 ? Math.max(...indices) : -1;

  return {
    componentName,
    entries,
    nodeCount: max + 1,
    indices,
    elementIndices: new Set(
      entries
        .filter((e) =>
          ['elementStart', 'element', 'elementContainer'].includes(
            e.instruction
          )
        )
        .map((e) => e.index)
    ),
  };
}

/**
 * 从整份编译产物 JS 里找出所有组件的模板函数并提清单。
 *
 * 模板函数 = `ɵɵdefineComponent({ template: function(rf, ctx) {...} })`
 */
export function extractManifestsFromSource(
  source: string,
  fileName: string
): NodeManifest[] {
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true
  );
  const manifests: NodeManifest[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const name = instructionName(node.expression);
      if (name === 'defineComponent') {
        const arg = node.arguments[0];
        if (arg && ts.isObjectLiteralExpression(arg)) {
          const typeProp = arg.properties.find(
            (p) =>
              ts.isPropertyAssignment(p) &&
              p.name.getText(sf).replace(/['"]/g, '') === 'type'
          ) as ts.PropertyAssignment | undefined;
          const cmpName =
            typeProp && ts.isIdentifier(typeProp.initializer)
              ? typeProp.initializer.text
              : 'Anonymous';

          const tplProp = arg.properties.find(
            (p) =>
              ts.isPropertyAssignment(p) &&
              p.name.getText(sf).replace(/['"]/g, '') === 'template'
          ) as ts.PropertyAssignment | undefined;

          if (
            tplProp &&
            (ts.isFunctionExpression(tplProp.initializer) ||
              ts.isArrowFunction(tplProp.initializer))
          ) {
            manifests.push(extractNodeManifest(tplProp.initializer, cmpName));
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return manifests;
}
