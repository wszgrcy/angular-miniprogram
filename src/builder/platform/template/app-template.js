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
  setImmediate: typeof setImmediate !== 'undefined' && setImmediate,
  clearImmediate:
    typeof clearImmediate !== 'undefined' &&
    function (id) {
      return clearImmediate(id);
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
};
