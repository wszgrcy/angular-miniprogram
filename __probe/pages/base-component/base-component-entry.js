const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_component1_component = require("../../component1.component-C_bJ9kEL.js");
const require_component1_module = require("../../component1.module-Bh1m8JaD.js");
const require_component2_component = require("../../component2.component-CB6Y-ljy.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/components/component2/component2.module.ts
var Component2Module = class Component2Module {
	static ɵfac = function Component2Module_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Component2Module)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: Component2Module });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({ imports: [require_angular_miniprogram.CommonModule, require_component1_module.Component1Module] });
};
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/base-component/base-component.component.ts
var BaseComponentComponent = class BaseComponentComponent {
	componentInput1 = "由父组件传入";
	constructor() {}
	ngOnInit() {}
	static ɵfac = function BaseComponentComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BaseComponentComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: BaseComponentComponent,
		selectors: [["app-base-component"]],
		decls: 6,
		vars: 2,
		consts: [[3, "input1"], [3, "cp2Input1"]],
		template: function BaseComponentComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelementStart(0, "div");
				require_angular_miniprogram.ɵɵtext(1, "测试引入组件");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelement(2, "app-component1", 0);
				require_angular_miniprogram.ɵɵelementStart(3, "div");
				require_angular_miniprogram.ɵɵtext(4, "component2中引入了component1");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelement(5, "app-component2", 1);
			}
			if (rf & 2) {
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵproperty("input1", ctx.componentInput1);
				require_angular_miniprogram.ɵɵadvance(3);
				require_angular_miniprogram.ɵɵproperty("cp2Input1", ctx.componentInput1 + "component2引入");
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [
			require_angular_miniprogram.CommonModule,
			require_component1_module.Component1Module,
			require_component1_component.Component1Component,
			Component2Module,
			require_component2_component.Component2Component
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(BaseComponentComponent, {
		className: "BaseComponentComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/base-component/base-component.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/base-component/base-component.entry.ts
require_angular_miniprogram.bootstrapPage(BaseComponentComponent);
//#endregion
