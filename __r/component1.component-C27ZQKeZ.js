const require_angular_miniprogram = require("./angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/components/component1/component1.component.ts
var Component1Component = class Component1Component {
	/** signal input，替代 @Input() */
	input1 = require_angular_miniprogram.input("", ...wx.__global.ngDevMode ? [{ debugName: "input1" }] : /* istanbul ignore next */ []);
	constructor() {}
	ngOnInit() {}
	static ɵfac = function Component1Component_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Component1Component)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: Component1Component,
		selectors: [["app-component1"]],
		inputs: { input1: [1, "input1"] },
		standalone: false,
		decls: 2,
		vars: 1,
		template: function Component1Component_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelementStart(0, "div");
				require_angular_miniprogram.ɵɵtext(1);
				require_angular_miniprogram.ɵɵelementEnd();
			}
			if (rf & 2) {
				require_angular_miniprogram.ɵɵadvance();
				require_angular_miniprogram.ɵɵtextInterpolate1("显示传入input1:", ctx.input1());
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(Component1Component, {
		className: "Component1Component",
		filePath: "test/test-project-host-hello-world-app-n66njpxabtr/src/components/component1/component1.component.ts",
		lineNumber: 9
	});
})();
//#endregion
Object.defineProperty(exports, "Component1Component", {
	enumerable: true,
	get: function() {
		return Component1Component;
	}
});
