const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/base-http/base-http.component.ts
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
		return new (__ngFactoryType__ || BaseHttpComponent)(require_angular_miniprogram.ɵɵdirectiveInject(require_angular_miniprogram.HttpClient));
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: BaseHttpComponent,
		selectors: [["app-base-http"]],
		decls: 2,
		vars: 0,
		consts: [[3, "tap"]],
		template: function BaseHttpComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵdomElementStart(0, "button", 0);
				require_angular_miniprogram.ɵɵdomListener("tap", function BaseHttpComponent_Template_button_tap_0_listener() {
					return ctx.request();
				});
				require_angular_miniprogram.ɵɵtext(1, "点击请求");
				require_angular_miniprogram.ɵɵdomElementEnd();
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		dependencies: [require_angular_miniprogram.CommonModule, require_angular_miniprogram.HttpClientModule],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(BaseHttpComponent, {
		className: "BaseHttpComponent",
		filePath: "test/test-project-host-hello-world-app-n66njpxabtr/src/pages/base-http/base-http.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/base-http/base-http.entry.ts
require_angular_miniprogram.bootstrapPage(BaseHttpComponent);
//#endregion
