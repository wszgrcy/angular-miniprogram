import { Bt as ɵɵtext, J as ɵsetClassDebugInfo, bt as ɵɵelementStart, c as CommonModule, ct as ɵɵdefineComponent, g as propertyChange, i as bootstrapPage, on as ɵɵdefineInjector, ut as ɵɵdefineNgModule, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd } from "../../angular-miniprogram-CzfAskez.js";
import { t as ContentComponent } from "../../content.component-C4UaPuqo.js";
import { t as ContentModule } from "../../content.module-C31bkBFu.js";
import { t as ContentMultiComponent } from "../../content-multi.component-VKPx30yF.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/components/content-multi/content-multi.module.ts
var ContentMultiModule = class ContentMultiModule {
	static ɵfac = function ContentMultiModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ContentMultiModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: ContentMultiModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [CommonModule] });
};
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/ng-content/ng-content.component.ts
var NgContentComponent = class NgContentComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function NgContentComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NgContentComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: NgContentComponent,
		selectors: [["app-ng-content"]],
		decls: 7,
		vars: 0,
		consts: [["slot", "slot1"], ["slot", "slot2"]],
		template: function NgContentComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "app-content");
				ɵɵtext(1, " 这个是投影内容 ");
				ɵɵelementEnd();
				ɵɵelementStart(2, "app-content-multi")(3, "div", 0);
				ɵɵtext(4, "插槽1内容");
				ɵɵelementEnd();
				ɵɵelementStart(5, "div", 1);
				ɵɵtext(6, "插槽2内容");
				ɵɵelementEnd()();
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		dependencies: [
			CommonModule,
			ContentModule,
			ContentComponent,
			ContentMultiModule,
			ContentMultiComponent
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(NgContentComponent, {
		className: "NgContentComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/ng-content/ng-content.component.ts",
		lineNumber: 13
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/ng-content/ng-content.entry.ts
bootstrapPage(NgContentComponent);
//#endregion
