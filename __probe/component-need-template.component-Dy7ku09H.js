const require_angular_miniprogram = require("./angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-z44kkref8xo/src/components/component-need-template/component-need-template.component.ts
function ComponentNeedTemplateComponent_ng_container_1_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵelementContainer(0);
}
function ComponentNeedTemplateComponent_div_3_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵelement(0, "div");
}
var ComponentNeedTemplateComponent = class ComponentNeedTemplateComponent {
	templateRef = require_angular_miniprogram.input.required(...wx.__global.ngDevMode ? [{ debugName: "templateRef" }] : /* istanbul ignore next */ []);
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ComponentNeedTemplateComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComponentNeedTemplateComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
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
				require_angular_miniprogram.ɵɵtext(0, "ngTemplateOutlet插入\n");
				require_angular_miniprogram.ɵɵtemplate(1, ComponentNeedTemplateComponent_ng_container_1_Template, 1, 0, "ng-container", 0);
				require_angular_miniprogram.ɵɵtext(2, "\nngIf 插入\n");
				require_angular_miniprogram.ɵɵtemplate(3, ComponentNeedTemplateComponent_div_3_Template, 1, 0, "div", 1);
			}
			if (rf & 2) {
				require_angular_miniprogram.ɵɵadvance();
				require_angular_miniprogram.ɵɵproperty("ngTemplateOutlet", ctx.templateRef());
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵproperty("ngIf", ctx.templateRef())("ngIfThen", ctx.templateRef());
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [require_angular_miniprogram.NgIf, require_angular_miniprogram.NgTemplateOutlet],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(ComponentNeedTemplateComponent, {
		className: "ComponentNeedTemplateComponent",
		filePath: "test/test-project-host-hello-world-app-z44kkref8xo/src/components/component-need-template/component-need-template.component.ts",
		lineNumber: 9
	});
})();
//#endregion
Object.defineProperty(exports, "ComponentNeedTemplateComponent", {
	enumerable: true,
	get: function() {
		return ComponentNeedTemplateComponent;
	}
});
