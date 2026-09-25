const obj = {
  performance: typeof performance !== 'undefined' && performance,
  navigator: typeof navigator !== 'undefined' && navigator,
  // 来自 queue-microtask 因为引入太麻烦直接复制了
  queueMicrotask:
    typeof queueMicrotask === 'function'
      ? queueMicrotask.bind(typeof window !== 'undefined' ? window : global)
      : // reuse resolved promise, and allocate it lazily
        (cb) =>
          (promise || (promise = Promise.resolve())).then(cb).catch((err) =>
            setTimeout(() => {
              throw err;
            }, 0),
          ),
};
