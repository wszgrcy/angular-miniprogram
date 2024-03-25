const obj = {
  Zone: typeof Zone !== 'undefined' && Zone,
  setTimeout: typeof setTimeout !== 'undefined' && setTimeout,
  clearTimeout:
    typeof clearTimeout !== 'undefined' &&
    function (id) {
      return clearTimeout(id);
    },
  setInterval: typeof setInterval !== 'undefined' && setInterval,
  clearInterval:
    typeof clearInterval !== 'undefined' &&
    function (id) {
      return clearInterval(id);
    },
  Promise: typeof Promise !== 'undefined' && Promise,
  Reflect: typeof Reflect !== 'undefined' && Reflect,
  requestAnimationFrame:
    typeof requestAnimationFrame !== 'undefined' && requestAnimationFrame,
  cancelAnimationFrame:
    typeof cancelAnimationFrame !== 'undefined' &&
    function (id) {
      return cancelAnimationFrame(id);
    },
  performance: typeof performance !== 'undefined' && performance,
  navigator: typeof navigator !== 'undefined' && navigator,
  // 来自 queue-microtask 因为引入太麻烦直接复制了
  queueMicrotask:typeof queueMicrotask === 'function'
  ? queueMicrotask.bind(typeof window !== 'undefined' ? window : global)
  // reuse resolved promise, and allocate it lazily
  : cb => (promise || (promise = Promise.resolve()))
    .then(cb)
    .catch(err => setTimeout(() => { throw err }, 0))
};
