const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_test_library = require("../../test-library-CLdTlbqL.js");
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/base-directive/directive1.directive.ts
var Directive1Directive = class Directive1Directive {
	color = "red";
	tap(event) {
		console.log("tap事件", event);
		this.color = "green";
	}
	constructor() {}
	static ɵfac = function Directive1Directive_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Directive1Directive)();
	};
	static ɵdir = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineDirective({
		type: Directive1Directive,
		selectors: [[
			"",
			"appDirective1",
			""
		]],
		hostVars: 2,
		hostBindings: function Directive1Directive_HostBindings(rf, ctx) {
			if (rf & 1) require_angular_miniprogram.ɵɵlistener("tap", function Directive1Directive_tap_HostBindingHandler($event) {
				return ctx.tap($event);
			});
			if (rf & 2) require_angular_miniprogram.ɵɵstyleProp("color", ctx.color);
		}
	});
};
//#endregion
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/base-directive/base-directive.component.ts
var BaseDirectiveComponent = class BaseDirectiveComponent {
	/** 由 libInputOutput 的 signal output 回传 */
	output1Value;
	output2Value;
	constructor() {}
	ngOnInit() {}
	event1(value) {
		this.output1Value = value;
	}
	event2(value) {
		this.output2Value = value;
	}
	static ɵfac = function BaseDirectiveComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BaseDirectiveComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: BaseDirectiveComponent,
		selectors: [["app-base-directive"]],
		decls: 5,
		vars: 2,
		consts: [["appDirective1", ""], [
			"libInputOutput",
			"",
			3,
			"output1",
			"output2",
			"input1",
			"input2"
		]],
		template: function BaseDirectiveComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelementStart(0, "p", 0);
				require_angular_miniprogram.ɵɵtext(1, "颜色会变,有tap反应");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(2, "div");
				require_angular_miniprogram.ɵɵtext(3, "---测试内部属性屏蔽---");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(4, "p", 1);
				require_angular_miniprogram.ɵɵlistener("output1", function BaseDirectiveComponent_Template_p_output1_4_listener($event) {
					return ctx.event1($event);
				})("output2", function BaseDirectiveComponent_Template_p_output2_4_listener($event) {
					return ctx.event2($event);
				});
				require_angular_miniprogram.ɵɵelementEnd();
			}
			if (rf & 2) {
				require_angular_miniprogram.ɵɵadvance(4);
				require_angular_miniprogram.ɵɵproperty("input1", "1")("input2", 1);
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [
			require_angular_miniprogram.CommonModule,
			require_test_library.DirectiveModule,
			require_test_library.InputOutputDirective,
			Directive1Directive
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(BaseDirectiveComponent, {
		className: "BaseDirectiveComponent",
		filePath: "test/test-project-host-hello-world-app-n66njpxabtr/src/pages/base-directive/base-directive.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/base-directive/base-directive.entry.ts
require_angular_miniprogram.bootstrapPage(BaseDirectiveComponent);
//#endregion
