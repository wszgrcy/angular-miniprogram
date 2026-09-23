import { Bt as ɵɵtext, J as ɵsetClassDebugInfo, c as CommonModule, ct as ɵɵdefineComponent, ft as ɵɵdirectiveInject, g as propertyChange, ht as ɵɵdomListener, i as bootstrapPage, mt as ɵɵdomElementStart, n as MINIPROGRAM_GLOBAL_TOKEN, pt as ɵɵdomElementEnd, xt as ɵɵgetCurrentView } from "../../angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/root/root.component.ts
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
		return new (__ngFactoryType__ || RootComponent)(ɵɵdirectiveInject(MINIPROGRAM_GLOBAL_TOKEN));
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: RootComponent,
		selectors: [["app-root"]],
		decls: 28,
		vars: 0,
		consts: [[3, "tap"]],
		template: function RootComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵdomElementStart(0, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_0_listener() {
					return ctx.baseTag();
				});
				ɵɵtext(1, "基础tap");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(2, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_2_listener() {
					return ctx.baseComponent();
				});
				ɵɵtext(3, "基础组件");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(4, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_4_listener() {
					return ctx.baseDirective();
				});
				ɵɵtext(5, "基础指令");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(6, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_6_listener() {
					return ctx.baseHttp();
				});
				ɵɵtext(7, "基础请求");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(8, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_8_listener() {
					return ctx.ngContent();
				});
				ɵɵtext(9, "ng-content");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(10, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_10_listener() {
					return ctx.defaultStructuralDirective();
				});
				ɵɵtext(11, "默认结构型指令");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(12, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_12_listener() {
					return ctx.customStructuralDirective();
				});
				ɵɵtext(13, "自定义结构型指令");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(14, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_14_listener() {
					return ctx.complexStructure();
				});
				ɵɵtext(15, "复杂结构");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(16, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_16_listener() {
					return ctx.complexPropertyEvent();
				});
				ɵɵtext(17, "复杂属性与事件");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(18, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_18_listener() {
					return ctx.baseForms();
				});
				ɵɵtext(19, "基础表单");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(20, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_20_listener() {
					return ctx.componentUseTemplate();
				});
				ɵɵtext(21, "使用模板传入组件");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(22, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_22_listener() {
					return ctx.selfComponent();
				});
				ɵɵtext(23, "使用self模板");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(24, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_24_listener() {
					return ctx.lifeTime();
				});
				ɵɵtext(25, "生命周期");
				ɵɵdomElementEnd();
				ɵɵdomElementStart(26, "button", 0);
				ɵɵdomListener("tap", function RootComponent_Template_button_tap_26_listener() {
					return ctx.lifeTimeUseComponent();
				});
				ɵɵtext(27, "生命周期-useComponent");
				ɵɵdomElementEnd();
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		dependencies: [CommonModule],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(RootComponent, {
		className: "RootComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/root/root.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/root/root.entry.ts
bootstrapPage(RootComponent, { useComponent: true });
//#endregion
