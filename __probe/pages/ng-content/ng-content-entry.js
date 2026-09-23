const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_content_component = require("../../content.component-CtDjYjpc.js");
const require_content_module = require("../../content.module-D_7FcAqa.js");
const require_content_multi_component = require("../../content-multi.component-CZLh8SCw.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/components/content-multi/content-multi.module.ts
var ContentMultiModule = class ContentMultiModule {
	static ɵfac = function ContentMultiModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ContentMultiModule)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: ContentMultiModule });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({ imports: [require_angular_miniprogram.CommonModule] });
};
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/ng-content/ng-content.component.ts
var NgContentComponent = class NgContentComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function NgContentComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NgContentComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: NgContentComponent,
		selectors: [["app-ng-content"]],
		decls: 7,
		vars: 0,
		consts: [["slot", "slot1"], ["slot", "slot2"]],
		template: function NgContentComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelementStart(0, "app-content");
				require_angular_miniprogram.ɵɵtext(1, " 这个是投影内容 ");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(2, "app-content-multi")(3, "div", 0);
				require_angular_miniprogram.ɵɵtext(4, "插槽1内容");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(5, "div", 1);
				require_angular_miniprogram.ɵɵtext(6, "插槽2内容");
				require_angular_miniprogram.ɵɵelementEnd()();
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		dependencies: [
			require_angular_miniprogram.CommonModule,
			require_content_module.ContentModule,
			require_content_component.ContentComponent,
			ContentMultiModule,
			require_content_multi_component.ContentMultiComponent
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(NgContentComponent, {
		className: "NgContentComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/ng-content/ng-content.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/ng-content/ng-content.entry.ts
require_angular_miniprogram.bootstrapPage(NgContentComponent);
//#endregion
