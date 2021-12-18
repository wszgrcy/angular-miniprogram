const obj = {
  Zone: typeof Zone !== 'undefined' && Zone,
  setTimeout: typeof setTimeout !== 'undefined' && setTimeout,
  clearTimeout: typeof clearTimeout !== 'undefined' && clearTimeout,
  setInterval: typeof setInterval !== 'undefined' && setInterval,
  clearInterval: typeof clearInterval !== 'undefined' && clearInterval,
  setImmediate: typeof setImmediate !== 'undefined' && setImmediate,
  clearImmediate: typeof clearImmediate !== 'undefined' && clearImmediate,
  Promise: typeof Promise !== 'undefined' && Promise,
  Reflect: typeof Reflect !== 'undefined' && Reflect,
  requestAnimationFrame:
    typeof requestAnimationFrame !== 'undefined' && requestAnimationFrame,
  cancelAnimationFrame:
    typeof cancelAnimationFrame !== 'undefined' && cancelAnimationFrame,
  performance: typeof performance !== 'undefined' && performance,
  navigator: typeof navigator !== 'undefined' && navigator,
};

