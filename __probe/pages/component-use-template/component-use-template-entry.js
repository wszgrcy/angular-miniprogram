const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_component1_component = require("../../component1.component-C_bJ9kEL.js");
const require_component1_module = require("../../component1.module-Bh1m8JaD.js");
const require_test_library = require("../../test-library-Cy91VvRN.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/component-use-template/component-use-template.component.ts
function ComponentUseTemplateComponent_ng_template_0_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵtext(0, " 这个是外部定义模板 引入组件");
		require_angular_miniprogram.ɵɵelement(1, "app-component1", 2);
	}
	if (rf & 2) {
		require_angular_miniprogram.ɵɵadvance();
		require_angular_miniprogram.ɵɵproperty("input1", "外部模板");
	}
}
var ComponentUseTemplateComponent = class ComponentUseTemplateComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ComponentUseTemplateComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComponentUseTemplateComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: ComponentUseTemplateComponent,
		selectors: [["app-component-use-template"]],
		decls: 6,
		vars: 1,
		consts: [
			["$$mp$$TestLibrary$$first", ""],
			[3, "template"],
			[3, "input1"]
		],
		template: function ComponentUseTemplateComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵtemplate(0, ComponentUseTemplateComponent_ng_template_0_Template, 2, 1, "ng-template", null, 0, require_angular_miniprogram.ɵɵtemplateRefExtractor);
				require_angular_miniprogram.ɵɵelement(2, "app-outside-template", 1);
				require_angular_miniprogram.ɵɵelementStart(3, "div");
				require_angular_miniprogram.ɵɵtext(4, "下面的是调用library内组件的其他组件模板");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelement(5, "app-global-self-template");
			}
			if (rf & 2) {
				const $$mp$$TestLibrary$$first_r1 = require_angular_miniprogram.ɵɵreference(1);
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵproperty("template", $$mp$$TestLibrary$$first_r1);
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [
			require_test_library.OutsideTemplateModule,
			require_test_library.OutsideTemplateComponent,
			require_component1_module.Component1Module,
			require_component1_component.Component1Component,
			require_test_library.GlobalSelfTemplateModule,
			require_test_library.GlobalSelfTemplateComponent
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(ComponentUseTemplateComponent, {
		className: "ComponentUseTemplateComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/component-use-template/component-use-template.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/component-use-template/component-use-template.entry.ts
require_angular_miniprogram.bootstrapPage(ComponentUseTemplateComponent);
//#endregion
