import { Bt as ɵɵtext, J as ɵsetClassDebugInfo, ct as ɵɵdefineComponent, g as propertyChange, xt as ɵɵgetCurrentView } from "./angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/life-time/life-time.component.ts
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
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: LifeTimeComponent,
		selectors: [["app-life-time-component"]],
		decls: 1,
		vars: 0,
		template: function LifeTimeComponent_Template(rf, ctx) {
			if (rf & 1) ɵɵtext(0, "组件生命周期\n");
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(LifeTimeComponent, {
		className: "LifeTimeComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/components/life-time/life-time.component.ts",
		lineNumber: 9
	});
})();
//#endregion
export { LifeTimeComponent as t };
