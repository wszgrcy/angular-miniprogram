/**
 * 剥掉 vite / rollup 在模块 id 上附加的 query 与 suffix
 * （`?v=hash`、`?import`、`?raw` 之类）。
 *
 * 判扩展名、查包边界、拼落盘路径都要用干净路径，
 * 带 query 的 id 一律先过这里。
 */
export function stripModuleQuery(id: string): string {
  const q = id.search(/[?#]/);
  return q === -1 ? id : id.slice(0, q);
}
