/**
 * 一次构建喂多个用例。
 *
 * sandbox 与产物目录在每个用例跑完后就销毁，所以共享的构建必须在第一次
 * 就把后面要用的东西全取出来，这里只负责「只跑一次并复用同一个结果」。
 */
export function memoize<T>(fn: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => (promise = promise ?? fn());
}
