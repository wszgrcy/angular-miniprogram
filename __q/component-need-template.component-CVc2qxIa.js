import { $ as ɵɵadvance, At as ɵɵproperty, Bt as ɵɵtext, J as ɵsetClassDebugInfo, Rt as ɵɵtemplate, _t as ɵɵelement, ct as ɵɵdefineComponent, d as NgIf, g as propertyChange, h as NgTemplateOutlet, vt as ɵɵelementContainer, x as input, xt as ɵɵgetCurrentView } from "./angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component-need-template/component-need-template.component.ts
function ComponentNeedTemplateComponent_ng_container_1_Template(rf, ctx) {
	if (rf & 1) ɵɵelementContainer(0);
}
function ComponentNeedTemplateComponent_div_3_Template(rf, ctx) {
	if (rf & 1) ɵɵelement(0, "div");
}
var ComponentNeedTemplateComponent = class ComponentNeedTemplateComponent {
	templateRef = input.required(...wx.__global.ngDevMode ? [{ debugName: "templateRef" }] : /* istanbul ignore next */ []);
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ComponentNeedTemplateComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComponentNeedTemplateComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: ComponentNeedTemplateComponent,
		selectors: [["app-component-need-template"]],
		inputs: { templateRef: [1, "templateRef"] },
		standalone: false,
		decls: 4,
		vars: 3,
		consts: [[4, "ngTemplateOutlet"], [
			4,
			"ngIf",
			"ngIfThen"
		]],
		template: function ComponentNeedTemplateComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵtext(0, "ngTemplateOutlet插入\n");
				ɵɵtemplate(1, ComponentNeedTemplateComponent_ng_container_1_Template, 1, 0, "ng-container", 0);
				ɵɵtext(2, "\nngIf 插入\n");
				ɵɵtemplate(3, ComponentNeedTemplateComponent_div_3_Template, 1, 0, "div", 1);
			}
			if (rf & 2) {
				ɵɵadvance();
				ɵɵproperty("ngTemplateOutlet", ctx.templateRef());
				ɵɵadvance(2);
				ɵɵproperty("ngIf", ctx.templateRef())("ngIfThen", ctx.templateRef());
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [NgIf, NgTemplateOutlet],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(ComponentNeedTemplateComponent, {
		className: "ComponentNeedTemplateComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component-need-template/component-need-template.component.ts",
		lineNumber: 9
	});
})();
//#endregion
export { ComponentNeedTemplateComponent as t };
