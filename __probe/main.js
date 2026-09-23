const require_angular_miniprogram = require("./angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/main.module.ts
var MainModule = class MainModule {
	constructor() {}
	ngDoBootstrap() {}
	static ɵfac = function MainModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || MainModule)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: MainModule });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({
		providers: [require_angular_miniprogram.provideZonelessChangeDetection()],
		imports: [require_angular_miniprogram.MiniProgramModule]
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
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/main.ts
if ({ production: false }.production) require_angular_miniprogram.enableProdMode();
require_angular_miniprogram.platformMiniProgram().bootstrapModule(MainModule).then((e) => {
	console.log(e);
});
//#endregion
