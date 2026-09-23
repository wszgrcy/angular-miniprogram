const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/custom-structural-directive/structural1.directive.ts
var Structural1Directive = class Structural1Directive {
	viewContainerRef;
	appStructural1 = require_angular_miniprogram.input.required(...wx.__global.ngDevMode ? [{ debugName: "appStructural1" }] : /* istanbul ignore next */ []);
	appStructural1Name = require_angular_miniprogram.input.required(...wx.__global.ngDevMode ? [{ debugName: "appStructural1Name" }] : /* istanbul ignore next */ []);
	constructor(viewContainerRef) {
		this.viewContainerRef = viewContainerRef;
	}
	ngOnInit() {
		this.viewContainerRef.createEmbeddedView(this.appStructural1(), { __templateName: this.appStructural1Name() });
	}
	static ɵfac = function Structural1Directive_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Structural1Directive)(require_angular_miniprogram.ɵɵdirectiveInject(require_angular_miniprogram.ViewContainerRef));
	};
	static ɵdir = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineDirective({
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
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/custom-structural-directive/custom-structural-directive.component.ts
function CustomStructuralDirectiveComponent_ng_container_0_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵelementContainer(0);
}
function CustomStructuralDirectiveComponent_ng_template_1_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵtext(0);
	if (rf & 2) {
		const name_r1 = ctx.__templateName;
		require_angular_miniprogram.ɵɵtextInterpolate1(" 使用自定义指令显示的模板->模板名:", name_r1, "\n");
	}
}
var CustomStructuralDirectiveComponent = class CustomStructuralDirectiveComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function CustomStructuralDirectiveComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CustomStructuralDirectiveComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
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
			if (rf & 1) require_angular_miniprogram.ɵɵtemplate(0, CustomStructuralDirectiveComponent_ng_container_0_Template, 1, 0, "ng-container", 1)(1, CustomStructuralDirectiveComponent_ng_template_1_Template, 1, 1, "ng-template", null, 0, require_angular_miniprogram.ɵɵtemplateRefExtractor);
			if (rf & 2) {
				const template1_r2 = require_angular_miniprogram.ɵɵreference(2);
				require_angular_miniprogram.ɵɵproperty("appStructural1", template1_r2)("appStructural1Name", "template1");
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [require_angular_miniprogram.CommonModule, Structural1Directive],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(CustomStructuralDirectiveComponent, {
		className: "CustomStructuralDirectiveComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/custom-structural-directive/custom-structural-directive.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/custom-structural-directive/custom-structural-directive.entry.ts
require_angular_miniprogram.bootstrapPage(CustomStructuralDirectiveComponent);
//#endregion
