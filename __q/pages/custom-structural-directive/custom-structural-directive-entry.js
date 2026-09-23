import { At as ɵɵproperty, Bt as ɵɵtext, H as ViewContainerRef, Ht as ɵɵtextInterpolate1, J as ɵsetClassDebugInfo, Mt as ɵɵreference, Rt as ɵɵtemplate, c as CommonModule, ct as ɵɵdefineComponent, ft as ɵɵdirectiveInject, g as propertyChange, i as bootstrapPage, lt as ɵɵdefineDirective, vt as ɵɵelementContainer, x as input, xt as ɵɵgetCurrentView, zt as ɵɵtemplateRefExtractor } from "../../angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/custom-structural-directive/structural1.directive.ts
var Structural1Directive = class Structural1Directive {
	viewContainerRef;
	appStructural1 = input.required(...wx.__global.ngDevMode ? [{ debugName: "appStructural1" }] : /* istanbul ignore next */ []);
	appStructural1Name = input.required(...wx.__global.ngDevMode ? [{ debugName: "appStructural1Name" }] : /* istanbul ignore next */ []);
	constructor(viewContainerRef) {
		this.viewContainerRef = viewContainerRef;
	}
	ngOnInit() {
		this.viewContainerRef.createEmbeddedView(this.appStructural1(), { __templateName: this.appStructural1Name() });
	}
	static ɵfac = function Structural1Directive_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Structural1Directive)(ɵɵdirectiveInject(ViewContainerRef));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: Structural1Directive,
		selectors: [[
			"",
			"appStructural1",
			""
		]],
		inputs: {
			appStructural1: [1, "appStructural1"],
			appStructural1Name: [1, "appStructural1Name"]
		}
	});
};
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/custom-structural-directive/custom-structural-directive.component.ts
function CustomStructuralDirectiveComponent_ng_container_0_Template(rf, ctx) {
	if (rf & 1) ɵɵelementContainer(0);
}
function CustomStructuralDirectiveComponent_ng_template_1_Template(rf, ctx) {
	if (rf & 1) ɵɵtext(0);
	if (rf & 2) {
		const name_r1 = ctx.__templateName;
		ɵɵtextInterpolate1(" 使用自定义指令显示的模板->模板名:", name_r1, "\n");
	}
}
var CustomStructuralDirectiveComponent = class CustomStructuralDirectiveComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function CustomStructuralDirectiveComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CustomStructuralDirectiveComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: CustomStructuralDirectiveComponent,
		selectors: [["app-custom-structural-directive"]],
		decls: 3,
		vars: 2,
		consts: [["template1", ""], [
			4,
			"appStructural1",
			"appStructural1Name"
		]],
		template: function CustomStructuralDirectiveComponent_Template(rf, ctx) {
			if (rf & 1) ɵɵtemplate(0, CustomStructuralDirectiveComponent_ng_container_0_Template, 1, 0, "ng-container", 1)(1, CustomStructuralDirectiveComponent_ng_template_1_Template, 1, 1, "ng-template", null, 0, ɵɵtemplateRefExtractor);
			if (rf & 2) {
				const template1_r2 = ɵɵreference(2);
				ɵɵproperty("appStructural1", template1_r2)("appStructural1Name", "template1");
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [CommonModule, Structural1Directive],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(CustomStructuralDirectiveComponent, {
		className: "CustomStructuralDirectiveComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/custom-structural-directive/custom-structural-directive.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/custom-structural-directive/custom-structural-directive.entry.ts
bootstrapPage(CustomStructuralDirectiveComponent);
//#endregion
