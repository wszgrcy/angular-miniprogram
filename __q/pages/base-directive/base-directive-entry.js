import { $ as ɵɵadvance, At as ɵɵproperty, Bt as ɵɵtext, Ct as ɵɵlistener, J as ɵsetClassDebugInfo, Lt as ɵɵstyleProp, bt as ɵɵelementStart, c as CommonModule, ct as ɵɵdefineComponent, g as propertyChange, i as bootstrapPage, lt as ɵɵdefineDirective, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd } from "../../angular-miniprogram-CzfAskez.js";
import { i as InputOutputDirective, t as DirectiveModule } from "../../test-library-cpVkA0Rn.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-directive/directive1.directive.ts
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
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: Directive1Directive,
		selectors: [[
			"",
			"appDirective1",
			""
		]],
		hostVars: 2,
		hostBindings: function Directive1Directive_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("tap", function Directive1Directive_tap_HostBindingHandler($event) {
				return ctx.tap($event);
			});
			if (rf & 2) ɵɵstyleProp("color", ctx.color);
		}
	});
};
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-directive/base-directive.component.ts
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
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
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
				ɵɵelementStart(0, "p", 0);
				ɵɵtext(1, "颜色会变,有tap反应");
				ɵɵelementEnd();
				ɵɵelementStart(2, "div");
				ɵɵtext(3, "---测试内部属性屏蔽---");
				ɵɵelementEnd();
				ɵɵelementStart(4, "p", 1);
				ɵɵlistener("output1", function BaseDirectiveComponent_Template_p_output1_4_listener($event) {
					return ctx.event1($event);
				})("output2", function BaseDirectiveComponent_Template_p_output2_4_listener($event) {
					return ctx.event2($event);
				});
				ɵɵelementEnd();
			}
			if (rf & 2) {
				ɵɵadvance(4);
				ɵɵproperty("input1", "1")("input2", 1);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [
			CommonModule,
			DirectiveModule,
			InputOutputDirective,
			Directive1Directive
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(BaseDirectiveComponent, {
		className: "BaseDirectiveComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-directive/base-directive.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-directive/base-directive.entry.ts
bootstrapPage(BaseDirectiveComponent);
//#endregion
