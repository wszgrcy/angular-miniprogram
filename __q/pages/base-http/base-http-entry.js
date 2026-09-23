import { Bt as ɵɵtext, J as ɵsetClassDebugInfo, c as CommonModule, ct as ɵɵdefineComponent, ft as ɵɵdirectiveInject, g as propertyChange, ht as ɵɵdomListener, i as bootstrapPage, mt as ɵɵdomElementStart, pt as ɵɵdomElementEnd, s as HttpClient, t as HttpClientModule, xt as ɵɵgetCurrentView } from "../../angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-http/base-http.component.ts
var BaseHttpComponent = class BaseHttpComponent {
	http;
	constructor(http) {
		this.http = http;
	}
	ngOnInit() {}
	request() {
		this.http.get("https://api.realworld.io/api/articles?limit=10&offset=0").subscribe((item) => {
			console.log(item);
		});
	}
	static ɵfac = function BaseHttpComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BaseHttpComponent)(ɵɵdirectiveInject(HttpClient));
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: BaseHttpComponent,
		selectors: [["app-base-http"]],
		decls: 2,
		vars: 0,
		consts: [[3, "tap"]],
		template: function BaseHttpComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵdomElementStart(0, "button", 0);
				ɵɵdomListener("tap", function BaseHttpComponent_Template_button_tap_0_listener() {
					return ctx.request();
				});
				ɵɵtext(1, "点击请求");
				ɵɵdomElementEnd();
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		dependencies: [CommonModule, HttpClientModule],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(BaseHttpComponent, {
		className: "BaseHttpComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-http/base-http.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-http/base-http.entry.ts
bootstrapPage(BaseHttpComponent);
//#endregion
