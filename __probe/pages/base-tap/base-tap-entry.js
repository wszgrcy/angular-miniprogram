const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/base-tap/base-tap.component.ts
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
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
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
				require_angular_miniprogram.ɵɵtext(0);
				require_angular_miniprogram.ɵɵdomElementStart(1, "view");
				require_angular_miniprogram.ɵɵtext(2, "原生组件需要在module加入`schemas:[NO_ERRORS_SCHEMA]`");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(3, "div");
				require_angular_miniprogram.ɵɵtext(4, "div组件转换为view");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(5, "span");
				require_angular_miniprogram.ɵɵtext(6, "span组件转换为view");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(7, "div", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function BaseTagComponent_Template_div_tap_7_listener($event) {
					return ctx.tap1($event);
				});
				require_angular_miniprogram.ɵɵtext(8, "组件定义的点击");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(9, "div");
				require_angular_miniprogram.ɵɵtext(10, "字符串->字体颜色红色");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(11, "div");
				require_angular_miniprogram.ɵɵtext(12, "变量->字体颜色红色");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(13, "div");
				require_angular_miniprogram.ɵɵtext(14, "字符串->颜色背景绿色");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(15, "div");
				require_angular_miniprogram.ɵɵtext(16, "变量->颜色背景绿色");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(17, "div", 1);
				require_angular_miniprogram.ɵɵdomListener("mut-bindtap", function BaseTagComponent_Template_div_mut_bindtap_17_listener($event) {
					return ctx.mutBindTap1($event);
				});
				require_angular_miniprogram.ɵɵtext(18, "mut-bind使用");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(19, "div", 2);
				require_angular_miniprogram.ɵɵdomListener("catchtap", function BaseTagComponent_Template_div_catchtap_19_listener($event) {
					return ctx.catchTap1($event);
				});
				require_angular_miniprogram.ɵɵtext(20, "catch使用");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(21, "div", 3);
				require_angular_miniprogram.ɵɵdomListener("capture-bindtap", function BaseTagComponent_Template_div_capture_bindtap_21_listener($event) {
					return ctx.captureBindTap1($event);
				});
				require_angular_miniprogram.ɵɵtext(22, "capture-bind使用");
				require_angular_miniprogram.ɵɵdomElementEnd();
			}
			if (rf & 2) {
				require_angular_miniprogram.ɵɵtextInterpolate1("直接插值(", ctx.interpolation, ")\n");
				require_angular_miniprogram.ɵɵadvance(9);
				require_angular_miniprogram.ɵɵstyleProp("color", "red");
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵstyleProp("color", ctx.color);
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵstyleProp("background-color", "green");
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵstyleProp("background-color", ctx.backgroundColor);
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [require_angular_miniprogram.CommonModule],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(BaseTagComponent, {
		className: "BaseTagComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/base-tap/base-tap.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/base-tap/base-tap.entry.ts
require_angular_miniprogram.bootstrapPage(BaseTagComponent);
//#endregion
