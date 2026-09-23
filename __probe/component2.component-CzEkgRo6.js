const require_angular_miniprogram = require("./angular-miniprogram-hG_juYs4.js");
const require_component1_component = require("./component1.component-DaHV1Xq-.js");
//#region test/test-project-host-hello-world-app-q5g2yx070ya/src/components/component2/component2.component.ts
var Component2Component = class Component2Component {
	cp2Input1 = require_angular_miniprogram.input("", ...wx.__global.ngDevMode ? [{ debugName: "cp2Input1" }] : /* istanbul ignore next */ []);
	constructor() {}
	ngOnInit() {}
	static ɵfac = function Component2Component_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Component2Component)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: Component2Component,
		selectors: [["app-component2"]],
		inputs: { cp2Input1: [1, "cp2Input1"] },
		standalone: false,
		decls: 1,
		vars: 1,
		consts: [[3, "input1"]],
		template: function Component2Component_Template(rf, ctx) {
			if (rf & 1) require_angular_miniprogram.ɵɵelement(0, "app-component1", 0);
			if (rf & 2) {
				require_angular_miniprogram.ɵɵproperty("input1", ctx.cp2Input1());
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [require_component1_component.Component1Component],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(Component2Component, {
		className: "Component2Component",
		filePath: "test/test-project-host-hello-world-app-q5g2yx070ya/src/components/component2/component2.component.ts",
		lineNumber: 9
	});
})();
//#endregion
Object.defineProperty(exports, "Component2Component", {
	enumerable: true,
	get: function() {
		return Component2Component;
	}
});
