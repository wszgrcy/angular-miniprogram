const require_angular_miniprogram = require("./angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-y1jg3w78zjg/node_modules/test-library/fesm2022/test-library.mjs
var TestLibraryService = class TestLibraryService {
	constructor() {}
	static ɵfac = function TestLibraryService_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || TestLibraryService)();
	};
	static ɵprov = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjectable({
		token: TestLibraryService,
		factory: TestLibraryService.ɵfac,
		providedIn: "root"
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(TestLibraryService, [{
		type: require_angular_miniprogram.Injectable,
		args: [{ providedIn: "root" }]
	}], () => [], null);
})();
var TestLibraryComponent = class TestLibraryComponent {
	/** signal input，替代 @Input() */
	input1 = require_angular_miniprogram.input(void 0, ...wx.__global.ngDevMode ? [{ debugName: "input1" }] : /* istanbul ignore next */ []);
	property1;
	constructor() {}
	ngOnInit() {}
	static ɵfac = function TestLibraryComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || TestLibraryComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: TestLibraryComponent,
		selectors: [["lib-test-library"]],
		hostVars: 1,
		hostBindings: function TestLibraryComponent_HostBindings(rf, ctx) {
			if (rf & 2) require_angular_miniprogram.ɵɵdomProperty("property1", ctx.property1);
		},
		inputs: { input1: [1, "input1"] },
		standalone: false,
		decls: 0,
		vars: 0,
		template: function TestLibraryComponent_Template(rf, ctx) {},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(TestLibraryComponent, [{
		type: require_angular_miniprogram.Component,
		args: [{
			standalone: false,
			selector: "lib-test-library",
			template: ``
		}]
	}], () => [], {
		input1: [{
			type: require_angular_miniprogram.Input,
			args: [{
				isSignal: true,
				alias: "input1",
				required: false
			}]
		}],
		property1: [{
			type: require_angular_miniprogram.HostBinding,
			args: ["property1"]
		}]
	});
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(TestLibraryComponent, {
		className: "TestLibraryComponent",
		filePath: "lib/test-library.component.ts",
		lineNumber: 9
	});
})();
var OtherComponent = class OtherComponent {
	constructor() {}
	ngOnInit() {}
	click() {
		console.log("other被点击");
	}
	static ɵfac = function OtherComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || OtherComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: OtherComponent,
		selectors: [["app-other"]],
		standalone: false,
		decls: 2,
		vars: 0,
		consts: [[3, "tap"]],
		template: function OtherComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelementStart(0, "p", 0);
				require_angular_miniprogram.ɵɵlistener("tap", function OtherComponent_Template_p_tap_0_listener() {
					return ctx.click();
				});
				require_angular_miniprogram.ɵɵtext(1, "other works!");
				require_angular_miniprogram.ɵɵelementEnd();
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(OtherComponent, [{
		type: require_angular_miniprogram.Component,
		args: [{
			standalone: false,
			selector: "app-other",
			template: "<p (tap)=\"click()\">other works!</p>\n"
		}]
	}], () => [], null);
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(OtherComponent, {
		className: "OtherComponent",
		filePath: "other/other.component.ts",
		lineNumber: 9
	});
})();
var OtherModule = class OtherModule {
	static ɵfac = function OtherModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || OtherModule)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: OtherModule });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(OtherModule, [{
		type: require_angular_miniprogram.NgModule,
		args: [{
			imports: [],
			declarations: [OtherComponent],
			exports: [OtherComponent]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && require_angular_miniprogram.ɵɵsetNgModuleScope(OtherModule, {
		declarations: [OtherComponent],
		exports: [OtherComponent]
	});
})();
var TestLibraryDirective = class TestLibraryDirective {
	methodDecoratorTouchstart(event) {
		console.log("HostListener-touchstart", event);
	}
	value;
	constructor() {
		wx.__window.setTimeout(() => {
			this.value = "sdfsdf";
			console.log("数据更改");
		}, 3e3);
	}
	hostTap(event) {
		console.log("tap", event);
	}
	static ɵfac = function TestLibraryDirective_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || TestLibraryDirective)();
	};
	static ɵdir = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineDirective({
		type: TestLibraryDirective,
		selectors: [[
			"",
			"libTestLibrary",
			""
		]],
		hostVars: 1,
		hostBindings: function TestLibraryDirective_HostBindings(rf, ctx) {
			if (rf & 1) require_angular_miniprogram.ɵɵlistener("tap", function TestLibraryDirective_tap_HostBindingHandler($event) {
				return ctx.hostTap($event);
			})("touchstart", function TestLibraryDirective_touchstart_HostBindingHandler($event) {
				return ctx.methodDecoratorTouchstart($event);
			});
			if (rf & 2) require_angular_miniprogram.ɵɵdomProperty("value", ctx.value);
		},
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(TestLibraryDirective, [{
		type: require_angular_miniprogram.Directive,
		args: [{
			standalone: false,
			selector: "[libTestLibrary]",
			host: { "(tap)": "hostTap($event)" }
		}]
	}], () => [], {
		methodDecoratorTouchstart: [{
			type: require_angular_miniprogram.HostListener,
			args: ["touchstart", ["$event"]]
		}],
		value: [{
			type: require_angular_miniprogram.HostBinding,
			args: ["value"]
		}]
	});
})();
var TestLibraryModule = class TestLibraryModule {
	static ɵfac = function TestLibraryModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || TestLibraryModule)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: TestLibraryModule });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({ imports: [OtherModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(TestLibraryModule, [{
		type: require_angular_miniprogram.NgModule,
		args: [{
			declarations: [TestLibraryComponent, TestLibraryDirective],
			imports: [OtherModule],
			exports: [TestLibraryComponent, TestLibraryDirective]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && require_angular_miniprogram.ɵɵsetNgModuleScope(TestLibraryModule, {
		declarations: [TestLibraryComponent, TestLibraryDirective],
		imports: [OtherModule],
		exports: [TestLibraryComponent, TestLibraryDirective]
	});
})();
var LibComp1Component = class LibComp1Component {
	tap1(event) {
		console.log("library组件的tap事件", event);
	}
	tap2(event) {
		console.log("library组件的(bind)tap事件", event);
	}
	constructor() {}
	ngOnInit() {}
	static ɵfac = function LibComp1Component_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || LibComp1Component)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: LibComp1Component,
		selectors: [["app-lib-comp1"]],
		hostBindings: function LibComp1Component_HostBindings(rf, ctx) {
			if (rf & 1) require_angular_miniprogram.ɵɵlistener("tap", function LibComp1Component_tap_HostBindingHandler($event) {
				return ctx.tap1($event);
			})("bindtap", function LibComp1Component_bindtap_HostBindingHandler($event) {
				return ctx.tap2($event);
			});
		},
		standalone: false,
		decls: 2,
		vars: 0,
		consts: [[1, "lib-comp1-content"]],
		template: function LibComp1Component_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelementStart(0, "p", 0);
				require_angular_miniprogram.ɵɵtext(1, "lib-comp1 works!");
				require_angular_miniprogram.ɵɵelementEnd();
			}
			if (rf & 2) require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(LibComp1Component, [{
		type: require_angular_miniprogram.Component,
		args: [{
			standalone: false,
			selector: "app-lib-comp1",
			template: "<p class=\"lib-comp1-content\">lib-comp1 works!</p>\n"
		}]
	}], () => [], {
		tap1: [{
			type: require_angular_miniprogram.HostListener,
			args: ["tap", ["$event"]]
		}],
		tap2: [{
			type: require_angular_miniprogram.HostListener,
			args: ["bindtap", ["$event"]]
		}]
	});
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(LibComp1Component, {
		className: "LibComp1Component",
		filePath: "lib-comp1/lib-comp1.component.ts",
		lineNumber: 9
	});
})();
var LibDir1Directive = class LibDir1Directive {
	tap1(event) {
		console.log("library指令的tap事件", event);
	}
	tap2(event) {
		console.log("library指令的(bind)tap事件", event);
	}
	constructor() {}
	static ɵfac = function LibDir1Directive_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || LibDir1Directive)();
	};
	static ɵdir = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineDirective({
		type: LibDir1Directive,
		selectors: [[
			"",
			"appLibDir1",
			""
		]],
		hostBindings: function LibDir1Directive_HostBindings(rf, ctx) {
			if (rf & 1) require_angular_miniprogram.ɵɵlistener("tap", function LibDir1Directive_tap_HostBindingHandler($event) {
				return ctx.tap1($event);
			})("bindtap", function LibDir1Directive_bindtap_HostBindingHandler($event) {
				return ctx.tap2($event);
			});
		},
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(LibDir1Directive, [{
		type: require_angular_miniprogram.Directive,
		args: [{
			standalone: false,
			selector: "[appLibDir1]"
		}]
	}], () => [], {
		tap1: [{
			type: require_angular_miniprogram.HostListener,
			args: ["tap", ["$event"]]
		}],
		tap2: [{
			type: require_angular_miniprogram.HostListener,
			args: ["bindtap", ["$event"]]
		}]
	});
})();
var LibComp1Module = class LibComp1Module {
	static ɵfac = function LibComp1Module_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || LibComp1Module)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: LibComp1Module });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({ imports: [require_angular_miniprogram.CommonModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(LibComp1Module, [{
		type: require_angular_miniprogram.NgModule,
		args: [{
			imports: [require_angular_miniprogram.CommonModule],
			declarations: [LibComp1Component, LibDir1Directive],
			exports: [LibComp1Component, LibDir1Directive]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && require_angular_miniprogram.ɵɵsetNgModuleScope(LibComp1Module, {
		declarations: [LibComp1Component, LibDir1Directive],
		imports: [require_angular_miniprogram.CommonModule],
		exports: [LibComp1Component, LibDir1Directive]
	});
})();
var InputOutputDirective = class InputOutputDirective {
	/** signal input，替代 @Input() */
	input1 = require_angular_miniprogram.input("", ...wx.__global.ngDevMode ? [{ debugName: "input1" }] : /* istanbul ignore next */ []);
	input2 = require_angular_miniprogram.input(0, ...wx.__global.ngDevMode ? [{ debugName: "input2" }] : /* istanbul ignore next */ []);
	/** signal output，替代 @Output() + EventEmitter */
	output1 = require_angular_miniprogram.output();
	output2 = require_angular_miniprogram.output();
	ngOnInit() {
		this.output1.emit(this.input1());
		this.output2.emit(this.input2());
	}
	static ɵfac = function InputOutputDirective_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || InputOutputDirective)();
	};
	static ɵdir = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineDirective({
		type: InputOutputDirective,
		selectors: [[
			"",
			"libInputOutput",
			""
		]],
		inputs: {
			input1: [1, "input1"],
			input2: [1, "input2"]
		},
		outputs: {
			output1: "output1",
			output2: "output2"
		},
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(InputOutputDirective, [{
		type: require_angular_miniprogram.Directive,
		args: [{
			standalone: false,
			selector: "[libInputOutput]"
		}]
	}], null, {
		input1: [{
			type: require_angular_miniprogram.Input,
			args: [{
				isSignal: true,
				alias: "input1",
				required: false
			}]
		}],
		input2: [{
			type: require_angular_miniprogram.Input,
			args: [{
				isSignal: true,
				alias: "input2",
				required: false
			}]
		}],
		output1: [{
			type: require_angular_miniprogram.Output,
			args: ["output1"]
		}],
		output2: [{
			type: require_angular_miniprogram.Output,
			args: ["output2"]
		}]
	});
})();
var DirectiveModule = class DirectiveModule {
	static ɵfac = function DirectiveModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || DirectiveModule)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: DirectiveModule });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(DirectiveModule, [{
		type: require_angular_miniprogram.NgModule,
		args: [{
			declarations: [InputOutputDirective],
			imports: [],
			exports: [InputOutputDirective],
			providers: []
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && require_angular_miniprogram.ɵɵsetNgModuleScope(DirectiveModule, {
		declarations: [InputOutputDirective],
		exports: [InputOutputDirective]
	});
})();
function OutsideTemplateComponent_div_2_ng_container_1_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵelementContainer(0);
}
function OutsideTemplateComponent_div_2_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtemplate(1, OutsideTemplateComponent_div_2_ng_container_1_Template, 1, 0, "ng-container", 1);
		require_angular_miniprogram.ɵɵelementEnd();
	}
	if (rf & 2) {
		const ctx_r0 = require_angular_miniprogram.ɵɵnextContext();
		require_angular_miniprogram.ɵɵadvance();
		require_angular_miniprogram.ɵɵproperty("ngTemplateOutlet", ctx_r0.template);
	}
}
var OutsideTemplateComponent = class OutsideTemplateComponent {
	template;
	constructor() {}
	ngOnInit() {}
	static ɵfac = function OutsideTemplateComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || OutsideTemplateComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: OutsideTemplateComponent,
		selectors: [["app-outside-template"]],
		inputs: { template: "template" },
		standalone: false,
		decls: 3,
		vars: 1,
		consts: [[4, "ngIf"], [4, "ngTemplateOutlet"]],
		template: function OutsideTemplateComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelementStart(0, "div");
				require_angular_miniprogram.ɵɵtext(1, "下面将传入一个由外部提供的模板");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(2, OutsideTemplateComponent_div_2_Template, 2, 1, "div", 0);
			}
			if (rf & 2) {
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵproperty("ngIf", ctx.template);
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [require_angular_miniprogram.NgIf, require_angular_miniprogram.NgTemplateOutlet],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(OutsideTemplateComponent, [{
		type: require_angular_miniprogram.Component,
		args: [{
			standalone: false,
			selector: "app-outside-template",
			template: "<div>下面将传入一个由外部提供的模板</div>\n<div *ngIf=\"template\">\n  <ng-container *ngTemplateOutlet=\"template\"></ng-container>\n</div>\n"
		}]
	}], () => [], { template: [{ type: require_angular_miniprogram.Input }] });
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(OutsideTemplateComponent, {
		className: "OutsideTemplateComponent",
		filePath: "outside-template/outside-template.component.ts",
		lineNumber: 9
	});
})();
var OutsideTemplateModule = class OutsideTemplateModule {
	static ɵfac = function OutsideTemplateModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || OutsideTemplateModule)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: OutsideTemplateModule });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({ imports: [require_angular_miniprogram.CommonModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(OutsideTemplateModule, [{
		type: require_angular_miniprogram.NgModule,
		args: [{
			imports: [require_angular_miniprogram.CommonModule],
			declarations: [OutsideTemplateComponent],
			exports: [OutsideTemplateComponent]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && require_angular_miniprogram.ɵɵsetNgModuleScope(OutsideTemplateModule, {
		declarations: [OutsideTemplateComponent],
		imports: [require_angular_miniprogram.CommonModule],
		exports: [OutsideTemplateComponent]
	});
})();
function GlobalSelfTemplateComponent_ng_template_1_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵtext(0, " library内模板 ");
		require_angular_miniprogram.ɵɵelement(1, "app-other");
	}
}
var GlobalSelfTemplateComponent = class GlobalSelfTemplateComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function GlobalSelfTemplateComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || GlobalSelfTemplateComponent)();
	};
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
		type: GlobalSelfTemplateComponent,
		selectors: [["app-global-self-template"]],
		standalone: false,
		decls: 3,
		vars: 1,
		consts: [["$$mp$$__self__$$libraryFirst", ""], [3, "template"]],
		template: function GlobalSelfTemplateComponent_Template(rf, ctx) {
			if (rf & 1) {
				require_angular_miniprogram.ɵɵelement(0, "app-outside-template", 1);
				require_angular_miniprogram.ɵɵtemplate(1, GlobalSelfTemplateComponent_ng_template_1_Template, 2, 0, "ng-template", null, 0, require_angular_miniprogram.ɵɵtemplateRefExtractor);
			}
			if (rf & 2) {
				const $$mp$$__self__$$libraryFirst_r1 = require_angular_miniprogram.ɵɵreference(2);
				require_angular_miniprogram.ɵɵproperty("template", $$mp$$__self__$$libraryFirst_r1);
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [OutsideTemplateComponent, OtherComponent],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(GlobalSelfTemplateComponent, [{
		type: require_angular_miniprogram.Component,
		args: [{
			standalone: false,
			selector: "app-global-self-template",
			template: "<app-outside-template\n  [template]=\"$$mp$$__self__$$libraryFirst\"\n></app-outside-template>\n<ng-template #$$mp$$__self__$$libraryFirst>\n  library内模板\n  <app-other></app-other>\n</ng-template>\n"
		}]
	}], () => [], null);
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(GlobalSelfTemplateComponent, {
		className: "GlobalSelfTemplateComponent",
		filePath: "global-self-template/global-self-template.component.ts",
		lineNumber: 9
	});
})();
var GlobalSelfTemplateModule = class GlobalSelfTemplateModule {
	static ɵfac = function GlobalSelfTemplateModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || GlobalSelfTemplateModule)();
	};
	static ɵmod = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineNgModule({ type: GlobalSelfTemplateModule });
	static ɵinj = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineInjector({ imports: [OutsideTemplateModule, OtherModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.setClassMetadata(GlobalSelfTemplateModule, [{
		type: require_angular_miniprogram.NgModule,
		args: [{
			imports: [OutsideTemplateModule, OtherModule],
			declarations: [GlobalSelfTemplateComponent],
			exports: [GlobalSelfTemplateComponent]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && require_angular_miniprogram.ɵɵsetNgModuleScope(GlobalSelfTemplateModule, {
		declarations: [GlobalSelfTemplateComponent],
		imports: [OutsideTemplateModule, OtherModule],
		exports: [GlobalSelfTemplateComponent]
	});
})();
//#endregion
Object.defineProperty(exports, "DirectiveModule", {
	enumerable: true,
	get: function() {
		return DirectiveModule;
	}
});
Object.defineProperty(exports, "GlobalSelfTemplateComponent", {
	enumerable: true,
	get: function() {
		return GlobalSelfTemplateComponent;
	}
});
Object.defineProperty(exports, "GlobalSelfTemplateModule", {
	enumerable: true,
	get: function() {
		return GlobalSelfTemplateModule;
	}
});
Object.defineProperty(exports, "InputOutputDirective", {
	enumerable: true,
	get: function() {
		return InputOutputDirective;
	}
});
Object.defineProperty(exports, "LibComp1Component", {
	enumerable: true,
	get: function() {
		return LibComp1Component;
	}
});
Object.defineProperty(exports, "LibComp1Module", {
	enumerable: true,
	get: function() {
		return LibComp1Module;
	}
});
Object.defineProperty(exports, "LibDir1Directive", {
	enumerable: true,
	get: function() {
		return LibDir1Directive;
	}
});
Object.defineProperty(exports, "OtherComponent", {
	enumerable: true,
	get: function() {
		return OtherComponent;
	}
});
Object.defineProperty(exports, "OutsideTemplateComponent", {
	enumerable: true,
	get: function() {
		return OutsideTemplateComponent;
	}
});
Object.defineProperty(exports, "OutsideTemplateModule", {
	enumerable: true,
	get: function() {
		return OutsideTemplateModule;
	}
});
Object.defineProperty(exports, "TestLibraryComponent", {
	enumerable: true,
	get: function() {
		return TestLibraryComponent;
	}
});
