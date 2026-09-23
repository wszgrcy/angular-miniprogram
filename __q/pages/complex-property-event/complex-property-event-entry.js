import { Bt as ɵɵtext, Ct as ɵɵlistener, J as ɵsetClassDebugInfo, _t as ɵɵelement, bt as ɵɵelementStart, c as CommonModule, ct as ɵɵdefineComponent, g as propertyChange, i as bootstrapPage, lt as ɵɵdefineDirective, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd } from "../../angular-miniprogram-CzfAskez.js";
import { a as LibComp1Component, o as LibComp1Module, s as LibDir1Directive } from "../../test-library-cpVkA0Rn.js";
import { t as Component3Component } from "../../component3.component-CxekxpK9.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/complex-property-event/app-dir1.directive.ts
var AppDir1Directive = class AppDir1Directive {
	tap1(event) {
		console.log("内置指令的tap事件", event);
	}
	tap2(event) {
		console.log("内置指令的(bind)tap事件", event);
	}
	constructor() {}
	static ɵfac = function AppDir1Directive_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || AppDir1Directive)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: AppDir1Directive,
		selectors: [[
			"",
			"appDir1",
			""
		]],
		hostBindings: function AppDir1Directive_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("tap", function AppDir1Directive_tap_HostBindingHandler($event) {
				return ctx.tap1($event);
			})("bindtap", function AppDir1Directive_bindtap_HostBindingHandler($event) {
				return ctx.tap2($event);
			});
		}
	});
};
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/complex-property-event/complex-property-event.component.ts
var ComplexPropertyEventComponent = class ComplexPropertyEventComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ComplexPropertyEventComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComplexPropertyEventComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: ComplexPropertyEventComponent,
		selectors: [["app-complex-property-event"]],
		decls: 8,
		vars: 0,
		consts: [[
			"appDir1",
			"",
			"appLibDir1",
			""
		]],
		template: function ComplexPropertyEventComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "div", 0);
				ɵɵtext(1, "指令事件");
				ɵɵelementEnd();
				ɵɵelementStart(2, "div");
				ɵɵtext(3, "内置组件+内置指令+library指令");
				ɵɵelementEnd();
				ɵɵelement(4, "app-component3", 0);
				ɵɵelementStart(5, "div");
				ɵɵtext(6, "library组件+内置指令+library指令");
				ɵɵelementEnd();
				ɵɵelement(7, "app-lib-comp1", 0);
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		dependencies: [
			CommonModule,
			LibComp1Module,
			LibComp1Component,
			LibDir1Directive,
			Component3Component,
			AppDir1Directive
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(ComplexPropertyEventComponent, {
		className: "ComplexPropertyEventComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/complex-property-event/complex-property-event.component.ts",
		lineNumber: 19
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/complex-property-event/complex-property-event.entry.ts
bootstrapPage(ComplexPropertyEventComponent);
//#endregion
