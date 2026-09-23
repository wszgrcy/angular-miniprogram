const require_angular_miniprogram = require("./angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-elc7t9gekx/src/components/life-time/life-time.component.ts
var LifeTimeComponent = class LifeTimeComponent {
	static mpComponentOptions = {
		lifetimes: {
			created: function() {
				console.log("created(component)");
			},
			attached: function() {
				console.log("attached(component)");
			},
			ready: function() {
				console.log("ready(component)");
			},
			moved: function() {
				console.log("moved(component)");
			},
			detached: function() {
				console.log("detached(component)");
			},
			error: function() {
				console.log("error(component)");
			}
		},
		pageLifetimes: {
			show: function() {
				console.log("page-show(component)");
			},
			hide: function() {
				console.log("page-hide(component)");
			},
			resize: function() {
				console.log("page-resize(component)");
			}
		}
	};
	constructor() {
		console.log("ng-constructor(component)");
	}
	ngOnInit() {
		console.log("ng-ngOnInit(component)");
	}
	ngAfterViewInit() {
		console.log("ng-ngAfterViewInit(component)");
	}
	ngAfterContentInit() {
		console.log("ng-ngAfterContentInit(component)");
	}
	static ɵfac = function LifeTimeComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || LifeTimeComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: LifeTimeComponent,
		selectors: [["app-life-time-component"]],
		decls: 1,
		vars: 0,
		template: function LifeTimeComponent_Template(rf, ctx) {
			if (rf & 1) require_angular_miniprogram.ɵɵtext(0, "组件生命周期\n");
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(LifeTimeComponent, {
		className: "LifeTimeComponent",
		filePath: "test/test-project-host-hello-world-app-elc7t9gekx/src/components/life-time/life-time.component.ts",
		lineNumber: 9
	});
})();
//#endregion
Object.defineProperty(exports, "LifeTimeComponent", {
	enumerable: true,
	get: function() {
		return LifeTimeComponent;
	}
});
