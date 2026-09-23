import { K as provideZonelessChangeDetection, b as enableProdMode, o as platformMiniProgram, on as ɵɵdefineInjector, r as MiniProgramModule, ut as ɵɵdefineNgModule } from "./angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/main.module.ts
var MainModule = class MainModule {
	constructor() {}
	ngDoBootstrap() {}
	static ɵfac = function MainModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MainModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: MainModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({
		providers: [provideZonelessChangeDetection()],
		imports: [MiniProgramModule]
	});
};
/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/main.ts
if ({ production: false }.production) enableProdMode();
platformMiniProgram().bootstrapModule(MainModule).then((e) => {
	console.log(e);
});
//#endregion
