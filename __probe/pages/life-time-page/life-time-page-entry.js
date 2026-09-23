const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_life_time_component = require("../../life-time.component-T8s6wabc.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/life-time-page/life-time.component.ts
var LifeTimePage = class LifeTimePage {
	static mpPageOptions = {
		onLoad: function() {
			console.log("mp-onLoad", this.__ngComponentInstance);
		},
		onShow: function() {
			console.log("mp-onShow", this.__ngComponentInstance);
		},
		onReady: function() {
			console.log("mp-onReady");
		}
	};
	constructor() {
		console.log("ng-constructor");
	}
	ngOnInit() {
		console.log("ng-ngOnInit");
	}
	ngAfterViewInit() {
		console.log("ng-ngAfterViewInit");
	}
	ngAfterContentInit() {
		console.log("ng-ngAfterContentInit");
	}
	static ɵfac = function LifeTimePage_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || LifeTimePage)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: LifeTimePage,
		selectors: [["app-life-time"]],
		decls: 2,
		vars: 0,
		template: function LifeTimePage_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelement(0, "app-life-time-component");
				require_angular_miniprogram.ɵɵtext(1, " 页面显示\n");
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		dependencies: [require_angular_miniprogram.CommonModule, require_life_time_component.LifeTimeComponent],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(LifeTimePage, {
		className: "LifeTimePage",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/life-time-page/life-time.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/life-time-page/life-time-page.entry.ts
require_angular_miniprogram.bootstrapPage(LifeTimePage);
//#endregion
