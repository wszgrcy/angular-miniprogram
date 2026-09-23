import { $ as ɵɵadvance, At as ɵɵproperty, Bt as ɵɵtext, J as ɵsetClassDebugInfo, Mt as ɵɵreference, Rt as ɵɵtemplate, _t as ɵɵelement, c as CommonModule, ct as ɵɵdefineComponent, g as propertyChange, i as bootstrapPage, on as ɵɵdefineInjector, ut as ɵɵdefineNgModule, xt as ɵɵgetCurrentView, zt as ɵɵtemplateRefExtractor } from "../../angular-miniprogram-CzfAskez.js";
import { t as ComponentNeedTemplateComponent } from "../../component-need-template.component-CVc2qxIa.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component-need-template/component-need-template.module.ts
var ComponentNeedTemplateModule = class ComponentNeedTemplateModule {
	static ɵfac = function ComponentNeedTemplateModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComponentNeedTemplateModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: ComponentNeedTemplateModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [CommonModule] });
};
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/self-component/self-component.component.ts
function SelfComponentComponent_ng_template_0_Template(rf, ctx) {
	if (rf & 1) ɵɵtext(0, " 传入模板测试 ");
}
var SelfComponentComponent = class SelfComponentComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function SelfComponentComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || SelfComponentComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: SelfComponentComponent,
		selectors: [["app-self-component"]],
		decls: 3,
		vars: 1,
		consts: [["$$mp$$__self__$$self1", ""], [3, "templateRef"]],
		template: function SelfComponentComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵtemplate(0, SelfComponentComponent_ng_template_0_Template, 1, 0, "ng-template", null, 0, ɵɵtemplateRefExtractor);
				ɵɵelement(2, "app-component-need-template", 1);
			}
			if (rf & 2) {
				const $$mp$$__self__$$self1_r1 = ɵɵreference(1);
				ɵɵadvance(2);
				ɵɵproperty("templateRef", $$mp$$__self__$$self1_r1);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [
			CommonModule,
			ComponentNeedTemplateModule,
			ComponentNeedTemplateComponent
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(SelfComponentComponent, {
		className: "SelfComponentComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/self-component/self-component.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/self-component/self-component.entry.ts
bootstrapPage(SelfComponentComponent);
//#endregion
