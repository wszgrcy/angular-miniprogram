import { At as ɵɵproperty, J as ɵsetClassDebugInfo, _t as ɵɵelement, ct as ɵɵdefineComponent, g as propertyChange, x as input, xt as ɵɵgetCurrentView } from "./angular-miniprogram-CzfAskez.js";
import { t as Component1Component } from "./component1.component-DWorTJ9D.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component2/component2.component.ts
var Component2Component = class Component2Component {
	cp2Input1 = input("", ...wx.__global.ngDevMode ? [{ debugName: "cp2Input1" }] : /* istanbul ignore next */ []);
	constructor() {}
	ngOnInit() {}
	static ɵfac = function Component2Component_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Component2Component)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: Component2Component,
		selectors: [["app-component2"]],
		inputs: { cp2Input1: [1, "cp2Input1"] },
		standalone: false,
		decls: 1,
		vars: 1,
		consts: [[3, "input1"]],
		template: function Component2Component_Template(rf, ctx) {
			if (rf & 1) ɵɵelement(0, "app-component1", 0);
			if (rf & 2) {
				ɵɵproperty("input1", ctx.cp2Input1());
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [Component1Component],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(Component2Component, {
		className: "Component2Component",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component2/component2.component.ts",
		lineNumber: 9
	});
})();
//#endregion
export { Component2Component as t };
