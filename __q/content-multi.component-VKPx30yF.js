import { Bt as ɵɵtext, J as ɵsetClassDebugInfo, Ot as ɵɵprojection, bt as ɵɵelementStart, ct as ɵɵdefineComponent, g as propertyChange, kt as ɵɵprojectionDef, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd } from "./angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/content-multi/content-multi.component.ts
var _c0 = [[[
	"",
	"slot",
	"slot1"
]], [[
	"",
	"slot",
	"slot2"
]]];
var _c1 = ["[slot='slot1']", "[slot='slot2']"];
var ContentMultiComponent = class ContentMultiComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ContentMultiComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ContentMultiComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: ContentMultiComponent,
		selectors: [["app-content-multi"]],
		standalone: false,
		ngContentSelectors: _c1,
		decls: 10,
		vars: 0,
		template: function ContentMultiComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵprojectionDef(_c0);
				ɵɵelementStart(0, "div");
				ɵɵtext(1, "下面将会有投影内容(多)");
				ɵɵelementEnd();
				ɵɵelementStart(2, "div");
				ɵɵtext(3, "这个是slot1插槽的");
				ɵɵelementEnd();
				ɵɵprojection(4);
				ɵɵelementStart(5, "div");
				ɵɵtext(6, "这个是slot2插槽的");
				ɵɵelementEnd();
				ɵɵprojection(7, 1);
				ɵɵelementStart(8, "div");
				ɵɵtext(9, "---结束---");
				ɵɵelementEnd();
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(ContentMultiComponent, {
		className: "ContentMultiComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/components/content-multi/content-multi.component.ts",
		lineNumber: 9
	});
})();
//#endregion
export { ContentMultiComponent as t };
