/**
 * 组件 wxml 生成注册表（同源产出，供等价性校验使用）。
 *
 * ## 为什么需要
 *
 * wxml 里烧的是绝对下标（`nodeList[0]` / `nodeList[2]` / ...），运行时
 * 产出的是 `nodeList[lViewIndex - HEADER_OFFSET]`。要证明两端等价，必须
 * 知道「某个 wxml 属于哪个组件」，才能拿该组件的 Angular 编译产物来比对。
 *
 * 事后从制品反推配对是不可靠的：Vite 会把组件模板 code-split 到共享
 * chunk（`component1.component-XXXX.js`），entry.js 里根本没有模板指令；
 * 按文件名猜组件名也会退化。
 *
 * 但在 builder 生成 wxml 的那一刻，组件身份是**确定已知**的
 * （`makeComponentKey(fileName, className)`）。所以在这里记下来，
 * 配对关系就是权威的，不用猜。
 *
 * ## 为什么不写进制品
 *
 * 测试与 builder 跑在同一进程（harness 直接调 runBuilder），所以进程内
 * 注册表就够用了，不需要往 wxml 里塞注释、也不需要额外的 sidecar 文件
 * 污染小程序包。
 *
 * ## 生命周期
 *
 * builder 每次构建前 reset，避免跨次构建脏数据。
 */

export interface GeneratedWxmlRecord {
  /** makeComponentKey 的结果：`源文件#组件类名` */
  componentKey: string;
  /** 组件类名 */
  componentName: string;
  /** 源文件路径 */
  sourceFile: string;
  /** 生成的 wxml 内容 */
  wxml: string;
}

const records = new Map<string, GeneratedWxmlRecord>();

export function recordGeneratedWxml(
  componentKey: string,
  componentName: string,
  sourceFile: string,
  wxml: string
): void {
  records.set(componentKey, {
    componentKey,
    componentName,
    sourceFile,
    wxml,
  });
}

export function getGeneratedWxmlRecords(): GeneratedWxmlRecord[] {
  return [...records.values()];
}

export function resetGeneratedWxmlRecords(): void {
  records.clear();
}

/** wxml 里引用的所有 nodeList 下标 */
export function wxmlReferencedIndices(wxml: string): Set<number> {
  const s = new Set<number>();
  for (const m of wxml.matchAll(/nodeList\[(\d+)\]/g)) {
    s.add(Number(m[1]));
  }
  return s;
}
