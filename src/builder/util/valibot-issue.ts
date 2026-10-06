import type { BaseIssue } from 'valibot';

/**
 * valibot 报的路径转成可读形式：`tabBar.list[0].pagePath`、`styles[1].input`。
 *
 * valibot 的 issue.path 是一段段 `{ type, key | index }`，直接拼出来是
 * `[object Object]`，等于没报。
 */
export function formatIssuePath(path: readonly unknown[] | undefined): string {
  let result = '';
  for (const raw of path ?? []) {
    const part = raw as { type: string; key?: unknown; index?: number };
    const key = part.key ?? part.index;
    if (typeof key === 'number') {
      result += `[${key}]`;
    } else {
      result += `${result ? '.' : ''}${typeof key === 'string' ? key : '?'}`;
    }
  }
  return result;
}

/** 一组 issue → `  - 路径: 说明（期望 …）` 的条目列表 */
export function formatIssues(
  issues: readonly BaseIssue<unknown>[],
  label: string,
): string[] {
  return issues.map((issue) => {
    const where = formatIssuePath(issue.path) || '(根)';
    const expected = issue.expected ? `，期望 ${issue.expected}` : '';
    return `  - ${label} ${where}: ${issue.message}${expected}`;
  });
}
