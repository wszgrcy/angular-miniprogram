const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_component_need_template_component = require("../../component-need-template.component-BHKlzPDY.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/components/component-need-template/component-need-template.module.ts
var ComponentNeedTemplateModule = class ComponentNeedTemplateModule {
	static ɵfac = function ComponentNeedTemplateModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComponentNeedTemplateModule)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: ComponentNeedTemplateModule });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({ imports: [require_angular_miniprogram.CommonModule] });
};
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/self-component/self-component.component.ts
function SelfComponentComponent_ng_template_0_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵtext(0, " 传入模板测试 ");
}
var SelfComponentComponent = class SelfComponentComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function SelfComponentComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || SelfComponentComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: SelfComponentComponent,
		selectors: [["app-self-component"]],
		decls: 3,
		vars: 1,
		consts: [["$$mp$$__self__$$self1", ""], [3, "templateRef"]],
		template: function SelfComponentComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵtemplate(0, SelfComponentComponent_ng_template_0_Template, 1, 0, "ng-template", null, 0, require_angular_miniprogram.ɵɵtemplateRefExtractor);
				require_angular_miniprogram.ɵɵelement(2, "app-component-need-template", 1);
			}
			if (rf & 2) {
				const $$mp$$__self__$$self1_r1 = require_angular_miniprogram.ɵɵreference(1);
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵproperty("templateRef", $$mp$$__self__$$self1_r1);
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [
			require_angular_miniprogram.CommonModule,
			ComponentNeedTemplateModule,
			require_component_need_template_component.ComponentNeedTemplateComponent
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(SelfComponentComponent, {
		className: "SelfComponentComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/self-component/self-component.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/self-component/self-component.entry.ts
require_angular_miniprogram.bootstrapPage(SelfComponentComponent);
//#endregion
