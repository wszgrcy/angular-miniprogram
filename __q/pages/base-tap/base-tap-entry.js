import { $ as ɵɵadvance, Bt as ɵɵtext, Ht as ɵɵtextInterpolate1, J as ɵsetClassDebugInfo, Lt as ɵɵstyleProp, c as CommonModule, ct as ɵɵdefineComponent, g as propertyChange, ht as ɵɵdomListener, i as bootstrapPage, mt as ɵɵdomElementStart, pt as ɵɵdomElementEnd, xt as ɵɵgetCurrentView } from "../../angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-tap/base-tap.component.ts
var BaseTagComponent = class BaseTagComponent {
	color = "red";
	backgroundColor = "green";
	interpolation = "这个是插值内容";
	constructor() {}
	ngOnInit() {}
	tap1(event) {
		console.log("tap事件", event);
	}
	mutBindTap1(event) {
		console.log("mut-bindtap事件", event);
	}
	catchTap1(event) {
		console.log("catchtap事件", event);
	}
	captureBindTap1(event) {
		console.log("capture-bind事件", event);
	}
	static ɵfac = function BaseTagComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BaseTagComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: BaseTagComponent,
		selectors: [["app-base-tap"]],
		decls: 23,
		vars: 9,
		consts: [
			[3, "tap"],
			[3, "mut-bindtap"],
			[3, "catchtap"],
			[3, "capture-bindtap"]
		],
		template: function BaseTagComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵtext(0);
				ɵɵdomElementStart(1, "view");
				ɵɵtext(2, "原生组件需要在module加入`schemas:[NO_ERRORS_SCHEMA]`");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(3, "div");
				ɵɵtext(4, "div组件转换为view");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(5, "span");
				ɵɵtext(6, "span组件转换为view");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(7, "div", 0);
				ɵɵdomListener("tap", function BaseTagComponent_Template_div_tap_7_listener($event) {
					return ctx.tap1($event);
				});
				ɵɵtext(8, "组件定义的点击");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(9, "div");
				ɵɵtext(10, "字符串->字体颜色红色");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(11, "div");
				ɵɵtext(12, "变量->字体颜色红色");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(13, "div");
				ɵɵtext(14, "字符串->颜色背景绿色");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(15, "div");
				ɵɵtext(16, "变量->颜色背景绿色");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(17, "div", 1);
				ɵɵdomListener("mut-bindtap", function BaseTagComponent_Template_div_mut_bindtap_17_listener($event) {
					return ctx.mutBindTap1($event);
				});
				ɵɵtext(18, "mut-bind使用");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(19, "div", 2);
				ɵɵdomListener("catchtap", function BaseTagComponent_Template_div_catchtap_19_listener($event) {
					return ctx.catchTap1($event);
				});
				ɵɵtext(20, "catch使用");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(21, "div", 3);
				ɵɵdomListener("capture-bindtap", function BaseTagComponent_Template_div_capture_bindtap_21_listener($event) {
					return ctx.captureBindTap1($event);
				});
				ɵɵtext(22, "capture-bind使用");
				ɵɵdomElementEnd();
			}
			if (rf & 2) {
				ɵɵtextInterpolate1("直接插值(", ctx.interpolation, ")\n");
				ɵɵadvance(9);
				ɵɵstyleProp("color", "red");
				ɵɵadvance(2);
				ɵɵstyleProp("color", ctx.color);
				ɵɵadvance(2);
				ɵɵstyleProp("background-color", "green");
				ɵɵadvance(2);
				ɵɵstyleProp("background-color", ctx.backgroundColor);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [CommonModule],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(BaseTagComponent, {
		className: "BaseTagComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-tap/base-tap.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-tap/base-tap.entry.ts
bootstrapPage(BaseTagComponent);
//#endregion
