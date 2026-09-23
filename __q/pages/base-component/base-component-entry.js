import { $ as ɵɵadvance, At as ɵɵproperty, Bt as ɵɵtext, J as ɵsetClassDebugInfo, _t as ɵɵelement, bt as ɵɵelementStart, c as CommonModule, ct as ɵɵdefineComponent, g as propertyChange, i as bootstrapPage, on as ɵɵdefineInjector, ut as ɵɵdefineNgModule, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd } from "../../angular-miniprogram-CzfAskez.js";
import { t as Component1Component } from "../../component1.component-DWorTJ9D.js";
import { t as Component1Module } from "../../component1.module-qNffkO5W.js";
import { t as Component2Component } from "../../component2.component-GB423OAs.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component2/component2.module.ts
var Component2Module = class Component2Module {
	static ɵfac = function Component2Module_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Component2Module)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: Component2Module });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [CommonModule, Component1Module] });
};
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-component/base-component.component.ts
var BaseComponentComponent = class BaseComponentComponent {
	componentInput1 = "由父组件传入";
	constructor() {}
	ngOnInit() {}
	static ɵfac = function BaseComponentComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BaseComponentComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: BaseComponentComponent,
		selectors: [["app-base-component"]],
		decls: 6,
		vars: 2,
		consts: [[3, "input1"], [3, "cp2Input1"]],
		template: function BaseComponentComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "div");
				ɵɵtext(1, "测试引入组件");
				ɵɵelementEnd();
				ɵɵelement(2, "app-component1", 0);
				ɵɵelementStart(3, "div");
				ɵɵtext(4, "component2中引入了component1");
				ɵɵelementEnd();
				ɵɵelement(5, "app-component2", 1);
			}
			if (rf & 2) {
				ɵɵadvance(2);
				ɵɵproperty("input1", ctx.componentInput1);
				ɵɵadvance(3);
				ɵɵproperty("cp2Input1", ctx.componentInput1 + "component2引入");
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [
			CommonModule,
			Component1Module,
			Component1Component,
			Component2Module,
			Component2Component
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(BaseComponentComponent, {
		className: "BaseComponentComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-component/base-component.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-component/base-component.entry.ts
bootstrapPage(BaseComponentComponent);
//#endregion
