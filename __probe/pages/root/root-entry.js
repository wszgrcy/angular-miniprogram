const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/root/root.component.ts
var RootComponent = class RootComponent {
	global;
	constructor(global) {
		this.global = global;
	}
	ngOnInit() {}
	baseTag() {
		this.global.navigateTo({ url: "/pages/base-tap/base-tap-entry" });
	}
	baseComponent() {
		this.global.navigateTo({ url: "/pages/base-component/base-component-entry" });
	}
	baseDirective() {
		this.global.navigateTo({ url: "/pages/base-directive/base-directive-entry" });
	}
	ngContent() {
		this.global.navigateTo({ url: "/pages/ng-content/ng-content-entry" });
	}
	defaultStructuralDirective() {
		this.global.navigateTo({ url: "/pages/default-structural-directive/default-structural-directive-entry" });
	}
	customStructuralDirective() {
		this.global.navigateTo({ url: "/pages/custom-structural-directive/custom-structural-directive-entry" });
	}
	complexStructure() {
		this.global.navigateTo({ url: "/pages/complex-structure/complex-structure-entry" });
	}
	complexPropertyEvent() {
		this.global.navigateTo({ url: "/pages/complex-property-event/complex-property-event-entry" });
	}
	baseForms() {
		this.global.navigateTo({ url: "/pages/base-forms/base-forms-entry" });
	}
	componentUseTemplate() {
		this.global.navigateTo({ url: "/pages/component-use-template/component-use-template-entry" });
	}
	baseHttp() {
		this.global.navigateTo({ url: "/pages/base-http/base-http-entry" });
	}
	selfComponent() {
		this.global.navigateTo({ url: "/pages/self-component/self-component-entry" });
	}
	lifeTime() {
		this.global.navigateTo({ url: "/pages/life-time-page/life-time-page-entry" });
	}
	lifeTimeUseComponent() {
		this.global.navigateTo({ url: "/pages/life-time-page-use-component/life-time-page-use-component-entry" });
	}
	static ɵfac = function RootComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || RootComponent)(require_angular_miniprogram.ɵɵdirectiveInject(require_angular_miniprogram.MINIPROGRAM_GLOBAL_TOKEN));
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: RootComponent,
		selectors: [["app-root"]],
		decls: 28,
		vars: 0,
		consts: [[3, "tap"]],
		template: function RootComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵdomElementStart(0, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_0_listener() {
					return ctx.baseTag();
				});
				require_angular_miniprogram.ɵɵtext(1, "基础tap");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(2, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_2_listener() {
					return ctx.baseComponent();
				});
				require_angular_miniprogram.ɵɵtext(3, "基础组件");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(4, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_4_listener() {
					return ctx.baseDirective();
				});
				require_angular_miniprogram.ɵɵtext(5, "基础指令");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(6, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_6_listener() {
					return ctx.baseHttp();
				});
				require_angular_miniprogram.ɵɵtext(7, "基础请求");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(8, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_8_listener() {
					return ctx.ngContent();
				});
				require_angular_miniprogram.ɵɵtext(9, "ng-content");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(10, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_10_listener() {
					return ctx.defaultStructuralDirective();
				});
				require_angular_miniprogram.ɵɵtext(11, "默认结构型指令");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(12, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_12_listener() {
					return ctx.customStructuralDirective();
				});
				require_angular_miniprogram.ɵɵtext(13, "自定义结构型指令");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(14, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_14_listener() {
					return ctx.complexStructure();
				});
				require_angular_miniprogram.ɵɵtext(15, "复杂结构");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(16, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_16_listener() {
					return ctx.complexPropertyEvent();
				});
				require_angular_miniprogram.ɵɵtext(17, "复杂属性与事件");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(18, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_18_listener() {
					return ctx.baseForms();
				});
				require_angular_miniprogram.ɵɵtext(19, "基础表单");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(20, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_20_listener() {
					return ctx.componentUseTemplate();
				});
				require_angular_miniprogram.ɵɵtext(21, "使用模板传入组件");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(22, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_22_listener() {
					return ctx.selfComponent();
				});
				require_angular_miniprogram.ɵɵtext(23, "使用self模板");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(24, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_24_listener() {
					return ctx.lifeTime();
				});
				require_angular_miniprogram.ɵɵtext(25, "生命周期");
				require_angular_miniprogram.ɵɵdomElementEnd();
				require_angular_miniprogram.ɵɵdomElementStart(26, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function RootComponent_Template_button_tap_26_listener() {
					return ctx.lifeTimeUseComponent();
				});
				require_angular_miniprogram.ɵɵtext(27, "生命周期-useComponent");
				require_angular_miniprogram.ɵɵdomElementEnd();
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		dependencies: [require_angular_miniprogram.CommonModule],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(RootComponent, {
		className: "RootComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/root/root.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/root/root.entry.ts
require_angular_miniprogram.bootstrapPage(RootComponent, { useComponent: true });
//#endregion
