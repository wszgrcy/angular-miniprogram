import { Bt as ɵɵtext, J as ɵsetClassDebugInfo, Ot as ɵɵprojection, bt as ɵɵelementStart, ct as ɵɵdefineComponent, g as propertyChange, kt as ɵɵprojectionDef, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd } from "./angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/content/content.component.ts
var _c0 = ["*"];
var ContentComponent = class ContentComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ContentComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ContentComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: ContentComponent,
		selectors: [["app-content"]],
		standalone: false,
		ngContentSelectors: _c0,
		decls: 3,
		vars: 0,
		template: function ContentComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵprojectionDef();
				ɵɵelementStart(0, "div");
				ɵɵtext(1, "下面将会有投影内容");
				ɵɵelementEnd();
				ɵɵprojection(2);
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(ContentComponent, {
		className: "ContentComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/components/content/content.component.ts",
		lineNumber: 9
	});
})();
//#endregion
export { ContentComponent as t };
