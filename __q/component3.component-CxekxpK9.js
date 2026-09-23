import { Bt as ɵɵtext, Ct as ɵɵlistener, J as ɵsetClassDebugInfo, ct as ɵɵdefineComponent, g as propertyChange, mt as ɵɵdomElementStart, pt as ɵɵdomElementEnd, xt as ɵɵgetCurrentView } from "./angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component3/component3.component.ts
var Component3Component = class Component3Component {
	tap1(event) {
		console.log("内置组件的tap事件", event);
	}
	tap2(event) {
		console.log("内置组件的(bind)tap事件", event);
	}
	constructor() {}
	ngOnInit() {}
	static ɵfac = function Component3Component_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || Component3Component)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: Component3Component,
		selectors: [["app-component3"]],
		hostBindings: function Component3Component_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("tap", function Component3Component_tap_HostBindingHandler($event) {
				return ctx.tap1($event);
			})("bindtap", function Component3Component_bindtap_HostBindingHandler($event) {
				return ctx.tap2($event);
			});
		},
		decls: 2,
		vars: 0,
		template: function Component3Component_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵdomElementStart(0, "p");
				ɵɵtext(1, "component3 works!");
				ɵɵdomElementEnd();
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(Component3Component, {
		className: "Component3Component",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/components/component3/component3.component.ts",
		lineNumber: 9
	});
})();
//#endregion
export { Component3Component as t };
