import { $ as ɵɵadvance, Bt as ɵɵtext, Ht as ɵɵtextInterpolate1, J as ɵsetClassDebugInfo, bt as ɵɵelementStart, ct as ɵɵdefineComponent, g as propertyChange, x as input, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd } from "./angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component1/component1.component.ts
var Component1Component = class Component1Component {
	/** signal input，替代 @Input() */
	input1 = input("", ...wx.__global.ngDevMode ? [{ debugName: "input1" }] : /* istanbul ignore next */ []);
	constructor() {}
	ngOnInit() {}
	static ɵfac = function Component1Component_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Component1Component)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: Component1Component,
		selectors: [["app-component1"]],
		inputs: { input1: [1, "input1"] },
		standalone: false,
		decls: 2,
		vars: 1,
		template: function Component1Component_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "div");
				ɵɵtext(1);
				ɵɵelementEnd();
			}
			if (rf & 2) {
				ɵɵadvance();
				ɵɵtextInterpolate1("显示传入input1:", ctx.input1());
				propertyChange(ɵɵgetCurrentView());
			}
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(Component1Component, {
		className: "Component1Component",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component1/component1.component.ts",
		lineNumber: 9
	});
})();
//#endregion
export { Component1Component as t };
