const require_angular_miniprogram = require("./angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-y1jg3w78zjg/src/components/content/content.component.ts
var _c0 = ["*"];
var ContentComponent = class ContentComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ContentComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ContentComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: ContentComponent,
		selectors: [["app-content"]],
		standalone: false,
		ngContentSelectors: _c0,
		decls: 3,
		vars: 0,
		template: function ContentComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵprojectionDef();
				require_angular_miniprogram.ɵɵelementStart(0, "div");
				require_angular_miniprogram.ɵɵtext(1, "下面将会有投影内容");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵprojection(2);
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(ContentComponent, {
		className: "ContentComponent",
		filePath: "test/test-project-host-hello-world-app-y1jg3w78zjg/src/components/content/content.component.ts",
		lineNumber: 9
	});
})();
//#endregion
Object.defineProperty(exports, "ContentComponent", {
	enumerable: true,
	get: function() {
		return ContentComponent;
	}
});
