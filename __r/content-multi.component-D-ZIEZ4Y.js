const require_angular_miniprogram = require("./angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-n66njpxabtr/src/components/content-multi/content-multi.component.ts
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
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: ContentMultiComponent,
		selectors: [["app-content-multi"]],
		standalone: false,
		ngContentSelectors: _c1,
		decls: 10,
		vars: 0,
		template: function ContentMultiComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵprojectionDef(_c0);
				require_angular_miniprogram.ɵɵelementStart(0, "div");
				require_angular_miniprogram.ɵɵtext(1, "下面将会有投影内容(多)");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(2, "div");
				require_angular_miniprogram.ɵɵtext(3, "这个是slot1插槽的");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵprojection(4);
				require_angular_miniprogram.ɵɵelementStart(5, "div");
				require_angular_miniprogram.ɵɵtext(6, "这个是slot2插槽的");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵprojection(7, 1);
				require_angular_miniprogram.ɵɵelementStart(8, "div");
				require_angular_miniprogram.ɵɵtext(9, "---结束---");
				require_angular_miniprogram.ɵɵelementEnd();
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(ContentMultiComponent, {
		className: "ContentMultiComponent",
		filePath: "test/test-project-host-hello-world-app-n66njpxabtr/src/components/content-multi/content-multi.component.ts",
		lineNumber: 9
	});
})();
//#endregion
Object.defineProperty(exports, "ContentMultiComponent", {
	enumerable: true,
	get: function() {
		return ContentMultiComponent;
	}
});
