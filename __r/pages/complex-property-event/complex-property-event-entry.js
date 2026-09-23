const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_test_library = require("../../test-library-CLdTlbqL.js");
const require_component3_component = require("../../component3.component-o2RC1gQX.js");
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/complex-property-event/app-dir1.directive.ts
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
	static ɵdir = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineDirective({
		type: AppDir1Directive,
		selectors: [[
			"",
			"appDir1",
			""
		]],
		hostBindings: function AppDir1Directive_HostBindings(rf, ctx) {
			if (rf & 1) require_angular_miniprogram.ɵɵlistener("tap", function AppDir1Directive_tap_HostBindingHandler($event) {
				return ctx.tap1($event);
			})("bindtap", function AppDir1Directive_bindtap_HostBindingHandler($event) {
				return ctx.tap2($event);
			});
		}
	});
};
//#endregion
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/complex-property-event/complex-property-event.component.ts
var ComplexPropertyEventComponent = class ComplexPropertyEventComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ComplexPropertyEventComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComplexPropertyEventComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
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
				require_angular_miniprogram.ɵɵelementStart(0, "div", 0);
				require_angular_miniprogram.ɵɵtext(1, "指令事件");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(2, "div");
				require_angular_miniprogram.ɵɵtext(3, "内置组件+内置指令+library指令");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelement(4, "app-component3", 0);
				require_angular_miniprogram.ɵɵelementStart(5, "div");
				require_angular_miniprogram.ɵɵtext(6, "library组件+内置指令+library指令");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelement(7, "app-lib-comp1", 0);
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		dependencies: [
			require_angular_miniprogram.CommonModule,
			require_test_library.LibComp1Module,
			require_test_library.LibComp1Component,
			require_test_library.LibDir1Directive,
			require_component3_component.Component3Component,
			AppDir1Directive
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(ComplexPropertyEventComponent, {
		className: "ComplexPropertyEventComponent",
		filePath: "test/test-project-host-hello-world-app-n66njpxabtr/src/pages/complex-property-event/complex-property-event.component.ts",
		lineNumber: 19
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/complex-property-event/complex-property-event.entry.ts
require_angular_miniprogram.bootstrapPage(ComplexPropertyEventComponent);
//#endregion
