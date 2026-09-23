const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_life_time_component = require("../../life-time.component-Dw4kGoph.js");
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/life-time-page-use-component/life-time.component.ts
var LifeTimePage = class LifeTimePage {
	static mpComponentOptions = {
		lifetimes: {
			created: function() {
				console.log("created(use-component)");
			},
			attached: function() {
				console.log("attached(use-component)");
			},
			ready: function() {
				console.log("ready(use-component)");
			},
			moved: function() {
				console.log("moved(use-component)");
			},
			detached: function() {
				console.log("detached(use-component)");
			},
			error: function() {
				console.log("error(use-component)");
			}
		},
		pageLifetimes: {
			show: function() {
				console.log("page-show(use-component)");
			},
			hide: function() {
				console.log("page-hide(use-component)");
			},
			resize: function() {
				console.log("page-resize(use-component)");
			}
		},
		methods: {
			onLoad: () => {
				console.log("onLoad(use-component)");
			},
			onShow: () => {
				console.log("onShow(use-component)");
			},
			onReady: () => {
				console.log("onReady(use-component)");
			}
		}
	};
	constructor() {
		console.log("ng-constructor(use-component)");
	}
	ngOnInit() {
		console.log("ng-ngOnInit(use-component)");
	}
	ngAfterViewInit() {
		console.log("ng-ngAfterViewInit(use-component)");
	}
	ngAfterContentInit() {
		console.log("ng-ngAfterContentInit(use-component)");
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
		filePath: "test/test-project-host-hello-world-app-n66njpxabtr/src/pages/life-time-page-use-component/life-time.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/pages/life-time-page-use-component/life-time-page-use-component.entry.ts
require_angular_miniprogram.bootstrapPage(LifeTimePage, { useComponent: true });
//#endregion
