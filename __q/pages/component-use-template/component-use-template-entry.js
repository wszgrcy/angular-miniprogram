import { $ as ɵɵadvance, At as ɵɵproperty, Bt as ɵɵtext, J as ɵsetClassDebugInfo, Mt as ɵɵreference, Rt as ɵɵtemplate, _t as ɵɵelement, bt as ɵɵelementStart, ct as ɵɵdefineComponent, g as propertyChange, i as bootstrapPage, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd, zt as ɵɵtemplateRefExtractor } from "../../angular-miniprogram-CzfAskez.js";
import { t as Component1Component } from "../../component1.component-DWorTJ9D.js";
import { t as Component1Module } from "../../component1.module-qNffkO5W.js";
import { l as OutsideTemplateComponent, n as GlobalSelfTemplateComponent, r as GlobalSelfTemplateModule, u as OutsideTemplateModule } from "../../test-library-cpVkA0Rn.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/component-use-template/component-use-template.component.ts
function ComponentUseTemplateComponent_ng_template_0_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵtext(0, " 这个是外部定义模板 引入组件");
		ɵɵelement(1, "app-component1", 2);
	}
	if (rf & 2) {
		ɵɵadvance();
		ɵɵproperty("input1", "外部模板");
	}
}
var ComponentUseTemplateComponent = class ComponentUseTemplateComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ComponentUseTemplateComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComponentUseTemplateComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
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
				ɵɵtemplate(0, ComponentUseTemplateComponent_ng_template_0_Template, 2, 1, "ng-template", null, 0, ɵɵtemplateRefExtractor);
				ɵɵelement(2, "app-outside-template", 1);
				ɵɵelementStart(3, "div");
				ɵɵtext(4, "下面的是调用library内组件的其他组件模板");
				ɵɵelementEnd();
				ɵɵelement(5, "app-global-self-template");
			}
			if (rf & 2) {
				const $$mp$$TestLibrary$$first_r1 = ɵɵreference(1);
				ɵɵadvance(2);
				ɵɵproperty("template", $$mp$$TestLibrary$$first_r1);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [
			OutsideTemplateModule,
			OutsideTemplateComponent,
			Component1Module,
			Component1Component,
			GlobalSelfTemplateModule,
			GlobalSelfTemplateComponent
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(ComponentUseTemplateComponent, {
		className: "ComponentUseTemplateComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/component-use-template/component-use-template.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/component-use-template/component-use-template.entry.ts
bootstrapPage(ComponentUseTemplateComponent);
//#endregion
