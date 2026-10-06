import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

// 每篇文档的 markdown 正文（不含 frontmatter），供页头「复制」按钮取用。
export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({
    params: { id: entry.id },
    props: { body: (entry.body ?? '').trim() },
  }));
}

export function GET({ props }: APIContext) {
  const { body } = props as { body: string };
  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
