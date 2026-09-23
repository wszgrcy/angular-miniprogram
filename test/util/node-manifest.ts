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

/**
 * 展开 Angular 的链式调用 codegen。
 *
 * `ɵɵelementStart` 的返回类型是 `typeof ɵɵelementStart`（返回自身），
 * 所以 Angular 把连续的同类调用写成链：
 *
 *   ɵɵelementStart(2, "app-content-multi")(3, "div", 0);
 *
 * 合法且有意，不是 corruption。但对提取器是陷阱：第二个节点没有独立的
 * `ɵɵelementStart(3,` 文本，而是 `)(3, "div", 0)`，按「指令名+首参」
 * 匹配就会漏掉 index 3。
 *
 * 返回链上所有环（外→内展开为 [内, ..., 外]），links[0] 是带指令名
 * 的那一环。
 */
function unwrapCallChain(node: ts.CallExpression): ts.CallExpression[] {
  const links: ts.CallExpression[] = [];
  let cur: ts.Node = node;
  while (ts.isCallExpression(cur)) {
    links.unshift(cur);
    // 注意：TypeScript 的 CallExpression 用 `.expression` 表示被调用方，
    // 不是 ESTree 的 `.callee`。用错会恒得 undefined，
    // 导致链完全展不开（上一轮 base=undefined 就是这个原因）。
    cur = cur.expression;
  }
  return links;
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
      const links = unwrapCallChain(node);
      const baseName = links.length
        ? instructionName(links[0].expression)
        : undefined;
      if (baseName && NODE_SLOT_INSTRUCTIONS.has(baseName)) {
        for (const link of links) {
          // 链上每一环都是同一指令的一次调用；标记已见避免重复计数
          seen.add(link);
          const index = firstArgAsNumber(link);
          if (index !== undefined) {
            entries.push({
              index,
              instruction: baseName,
              tag: secondArgAsString(link),
            });
          }
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

/* ------------------------------------------------------------------ *
 * 视图分组（view grouping）
 * ------------------------------------------------------------------ *
 *
 * Angular 的槽位是**每个视图各自从 0 开始**的（allocateSlots 注释：
 * "Slot indices start at 0 for each view (and are not unique between
 * views)"）。@if / @for / @ngIf 的分支会被编译成**独立的顶层模板函数**
 * （如 X_Conditional_1_Template），通过
 *   ɵɵtemplate(rootSlot, X_Conditional_1_Template, decls, vars, ...)
 * 挂在父视图的某个槽上。
 *
 * 对应到 wxml 侧，每个嵌入视图是一个具名模板：
 *   <template name="ifBlock_3">...nodeList[0]...</template>
 * 块内下标同样从 0 开始。
 *
 * 所以校验必须**按视图分块**进行。把整个 wxml 文件的 nodeList 下标
 * 混成一个集合是错的——那会把多个独立下标空间揉在一起，
 * 既可能假通过也可能假失败。
 */

export interface ViewManifest {
  /** Angular 模板函数名，如 ControlFlowComponent_Conditional_1_Template */
  viewName: string;
  entries: ManifestEntry[];
  indices: Set<number>;
  nodeCount: number;
  /** 本视图引用的子视图：父槽 -> 子模板函数名 */
  childRefs: { slot: number; fnName: string }[];
}

export interface ComponentViewTree {
  componentName: string;
  /** 含根视图在内的所有视图 */
  views: ViewManifest[];
  root: ViewManifest;
}

/** 引用子模板函数的指令 */
const TEMPLATE_REF_INSTRUCTIONS = new Set([
  'template',
  'domTemplate',
  'conditionalCreate',
  'conditionalBranchCreate',
  'repeaterCreate',
  'switchCreate',
]);

function collectTopLevelFunctions(
  sf: ts.SourceFile
): Map<string, ts.FunctionLikeDeclaration> {
  const map = new Map<string, ts.FunctionLikeDeclaration>();
  const add = (name: string, fn: ts.FunctionLikeDeclaration) => {
    if (!map.has(name)) {
      map.set(name, fn);
    }
  };
  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      add(stmt.name.text, stmt);
    } else if (ts.isVariableStatement(stmt)) {
      for (const d of stmt.declarationList.declarations) {
        if (
          ts.isIdentifier(d.name) &&
          d.initializer &&
          (ts.isFunctionExpression(d.initializer) ||
            ts.isArrowFunction(d.initializer))
        ) {
          add(d.name.text, d.initializer);
        }
      }
    }
  }
  return map;
}

/**
 * 把一个模板函数（含其引用到的所有子模板函数）拆成按视图分组的清单。
 */
export function extractViewTree(
  rootFn: ts.FunctionLikeDeclaration,
  rootViewName: string,
  fnMap: Map<string, ts.FunctionLikeDeclaration>,
  componentName: string
): ComponentViewTree {
  const views: ViewManifest[] = [];
  const visited = new Set<string>();

  const buildView = (fn: ts.FunctionLikeDeclaration, viewName: string) => {
    if (visited.has(viewName)) {
      return;
    }
    visited.add(viewName);

    const entries: ManifestEntry[] = [];
    const childRefs: { slot: number; fnName: string }[] = [];
    const seen = new Set<ts.Node>();

    const walk = (node: ts.Node) => {
      if (seen.has(node)) {
        return;
      }
      seen.add(node);

      if (ts.isCallExpression(node)) {
        // 同样要展开链式 codegen（见 unwrapCallChain 注释）
        const links = unwrapCallChain(node);
        const name = links.length
          ? instructionName(links[0].expression)
          : undefined;
        if (name) {
          for (const link of links) {
            seen.add(link);
            const idx = firstArgAsNumber(link);
            if (idx === undefined) {
              continue;
            }
            if (NODE_SLOT_INSTRUCTIONS.has(name)) {
              entries.push({
                index: idx,
                instruction: name,
                tag: secondArgAsString(link),
              });
            }
            // 引用子视图：第二个参数是模板函数标识符
            if (
              TEMPLATE_REF_INSTRUCTIONS.has(name) &&
              link.arguments[1] &&
              ts.isIdentifier(link.arguments[1])
            ) {
              const fnName = link.arguments[1].text;
              childRefs.push({ slot: idx, fnName });
              const childFn = fnMap.get(fnName);
              if (childFn) {
                buildView(childFn, fnName);
              }
            }

            /**
             * `ɵɵrepeaterCreate` 额外占用的**锚点槽**。
             *
             * Angular 把主模板与 @empty 模板都作为**参数**传给
             * repeaterCreate，不像 @if 那样为锚点单独发一条指令，
             * 所以按「指令名+首参」提取会漏掉这些槽：
             *
             *   repeaterCreate(10, For_11_Template, 2, 3, "div", 8,
             *                  trackByIdentity, false,
             *                  ForEmpty_12_Template, 2, 0, "div", 9)
             *
             * 槽布局（与 builder 侧 template-definition.ts 的注释一致）：
             *   10 = RepeaterMetadata（不可渲染但占位）
             *   11 = 主模板锚点
             *   12 = @empty 模板锚点（若有）
             *
             * 锚点下标直接**编码在模板函数名里**（`For_11_Template` → 11），
             * 用它比按位置猜更稳，且能与 name 交叉校验。
             */
            if (name === 'repeaterCreate') {
              for (const arg of link.arguments) {
                if (!ts.isIdentifier(arg)) {
                  continue;
                }
                const m = /_(\d+)_Template$/.exec(arg.text);
                if (!m) {
                  continue;
                }
                const anchor = Number(m[1]);
                // 只补比 metadata 槽大的锚点；嵌套视图的下标属于其自身空间
                if (anchor > idx) {
                  entries.push({
                    index: anchor,
                    instruction: 'templateAnchor',
                    tag: arg.text,
                  });
                }
              }
            }
          }
        }
      }
      ts.forEachChild(node, walk);
    };

    walk(fn);

    const indices = new Set(entries.map((e) => e.index));
    const max = indices.size > 0 ? Math.max(...indices) : -1;
    views.push({
      viewName,
      entries,
      indices,
      nodeCount: max + 1,
      childRefs,
    });
  };

  buildView(rootFn, rootViewName);
  const root = views[0];
  return { componentName, views, root };
}

/** 从源码提取每个组件的视图树 */
export function extractViewTreesFromSource(
  source: string,
  fileName: string
): ComponentViewTree[] {
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true
  );
  const fnMap = collectTopLevelFunctions(sf);
  const trees: ComponentViewTree[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const name = instructionName(node.expression);
      if (name === 'defineComponent') {
        const arg = node.arguments[0];
        if (arg && ts.isObjectLiteralExpression(arg)) {
          const get = (prop: string) =>
            arg.properties.find(
              (p) =>
                ts.isPropertyAssignment(p) &&
                p.name.getText(sf).replace(/['"]/g, '') === prop
            ) as ts.PropertyAssignment | undefined;

          const typeProp = get('type');
          const cmpName =
            typeProp && ts.isIdentifier(typeProp.initializer)
              ? typeProp.initializer.text
              : 'Anonymous';
          const tplProp = get('template');
          const tpl = tplProp?.initializer;

          let fn: ts.FunctionLikeDeclaration | undefined;
          let viewName = `${cmpName}_Template`;
          if (
            tpl &&
            (ts.isFunctionExpression(tpl) || ts.isArrowFunction(tpl))
          ) {
            fn = tpl;
          } else if (tpl && ts.isIdentifier(tpl)) {
            // hoisted: template: X_Template
            fn = fnMap.get(tpl.text);
            viewName = tpl.text;
          }

          if (fn) {
            trees.push(extractViewTree(fn, viewName, fnMap, cmpName));
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return trees;
}
