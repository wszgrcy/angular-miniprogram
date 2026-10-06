/**
 * 组件 wxml 生成注册表（同源产出，供等价性校验使用）。
 *
 * wxml 里烧的是绝对下标，要证明「wxml 下标」与「Angular 编译产物下标」两端等价，
 * 必须知道某个 wxml 属于哪个组件。事后从制品反推配对不可靠：Vite 会把组件模板
 * code-split 到共享 chunk，按文件名猜组件名也会退化。而在 builder 生成 wxml 的那一刻，
 * 组件身份是确定已知的，配对关系就是权威的。
 *
 * 测试与 builder 跑在同一进程，所以进程内注册表就够用，不需要往 wxml 里塞注释、
 * 也不需要额外的 sidecar 文件污染小程序包。builder 每次构建前 reset。
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
  wxml: string,
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
