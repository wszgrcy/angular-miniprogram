import { Bt as ɵɵtext, J as ɵsetClassDebugInfo, _t as ɵɵelement, c as CommonModule, ct as ɵɵdefineComponent, g as propertyChange, i as bootstrapPage, xt as ɵɵgetCurrentView } from "../../angular-miniprogram-CzfAskez.js";
import { t as LifeTimeComponent } from "../../life-time.component-73-e7Z6f.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/life-time-page/life-time.component.ts
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
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: LifeTimePage,
		selectors: [["app-life-time"]],
		decls: 2,
		vars: 0,
		template: function LifeTimePage_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelement(0, "app-life-time-component");
				ɵɵtext(1, " 页面显示\n");
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		dependencies: [CommonModule, LifeTimeComponent],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(LifeTimePage, {
		className: "LifeTimePage",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/life-time-page/life-time.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/life-time-page/life-time-page.entry.ts
bootstrapPage(LifeTimePage);
//#endregion
