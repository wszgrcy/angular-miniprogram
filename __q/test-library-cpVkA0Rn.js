import { $ as ɵɵadvance, A as HostBinding, At as ɵɵproperty, Bt as ɵɵtext, Ct as ɵɵlistener, D as Directive, E as Component, F as NgModule, It as ɵɵsetNgModuleScope, J as ɵsetClassDebugInfo, L as Output, Mt as ɵɵreference, N as Injectable, P as Input, Rt as ɵɵtemplate, S as output, Tt as ɵɵnextContext, _t as ɵɵelement, an as ɵɵdefineInjectable, bt as ɵɵelementStart, c as CommonModule, ct as ɵɵdefineComponent, d as NgIf, g as propertyChange, gt as ɵɵdomProperty, h as NgTemplateOutlet, j as HostListener, lt as ɵɵdefineDirective, on as ɵɵdefineInjector, q as setClassMetadata, ut as ɵɵdefineNgModule, vt as ɵɵelementContainer, x as input, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd, zt as ɵɵtemplateRefExtractor } from "./angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/node_modules/test-library/fesm2022/test-library.mjs
var TestLibraryService = class TestLibraryService {
	constructor() {}
	static ɵfac = function TestLibraryService_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || TestLibraryService)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineInjectable({
		token: TestLibraryService,
		factory: TestLibraryService.ɵfac,
		providedIn: "root"
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(TestLibraryService, [{
		type: Injectable,
		args: [{ providedIn: "root" }]
	}], () => [], null);
})();
var TestLibraryComponent = class TestLibraryComponent {
	/** signal input，替代 @Input() */
	input1 = input(void 0, ...wx.__global.ngDevMode ? [{ debugName: "input1" }] : /* istanbul ignore next */ []);
	property1;
	constructor() {}
	ngOnInit() {}
	static ɵfac = function TestLibraryComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || TestLibraryComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: TestLibraryComponent,
		selectors: [["lib-test-library"]],
		hostVars: 1,
		hostBindings: function TestLibraryComponent_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵdomProperty("property1", ctx.property1);
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
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(TestLibraryComponent, [{
		type: Component,
		args: [{
			standalone: false,
			selector: "lib-test-library",
			template: ``
		}]
	}], () => [], {
		input1: [{
			type: Input,
			args: [{
				isSignal: true,
				alias: "input1",
				required: false
			}]
		}],
		property1: [{
			type: HostBinding,
			args: ["property1"]
		}]
	});
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(TestLibraryComponent, {
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
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: OtherComponent,
		selectors: [["app-other"]],
		standalone: false,
		decls: 2,
		vars: 0,
		consts: [[3, "tap"]],
		template: function OtherComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "p", 0);
				ɵɵlistener("tap", function OtherComponent_Template_p_tap_0_listener() {
					return ctx.click();
				});
				ɵɵtext(1, "other works!");
				ɵɵelementEnd();
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(OtherComponent, [{
		type: Component,
		args: [{
			standalone: false,
			selector: "app-other",
			template: "<p (tap)=\"click()\">other works!</p>\n"
		}]
	}], () => [], null);
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(OtherComponent, {
		className: "OtherComponent",
		filePath: "other/other.component.ts",
		lineNumber: 9
	});
})();
var OtherModule = class OtherModule {
	static ɵfac = function OtherModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || OtherModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: OtherModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(OtherModule, [{
		type: NgModule,
		args: [{
			imports: [],
			declarations: [OtherComponent],
			exports: [OtherComponent]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(OtherModule, {
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
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: TestLibraryDirective,
		selectors: [[
			"",
			"libTestLibrary",
			""
		]],
		hostVars: 1,
		hostBindings: function TestLibraryDirective_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("tap", function TestLibraryDirective_tap_HostBindingHandler($event) {
				return ctx.hostTap($event);
			})("touchstart", function TestLibraryDirective_touchstart_HostBindingHandler($event) {
				return ctx.methodDecoratorTouchstart($event);
			});
			if (rf & 2) ɵɵdomProperty("value", ctx.value);
		},
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(TestLibraryDirective, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "[libTestLibrary]",
			host: { "(tap)": "hostTap($event)" }
		}]
	}], () => [], {
		methodDecoratorTouchstart: [{
			type: HostListener,
			args: ["touchstart", ["$event"]]
		}],
		value: [{
			type: HostBinding,
			args: ["value"]
		}]
	});
})();
var TestLibraryModule = class TestLibraryModule {
	static ɵfac = function TestLibraryModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || TestLibraryModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: TestLibraryModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [OtherModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(TestLibraryModule, [{
		type: NgModule,
		args: [{
			declarations: [TestLibraryComponent, TestLibraryDirective],
			imports: [OtherModule],
			exports: [TestLibraryComponent, TestLibraryDirective]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(TestLibraryModule, {
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
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: LibComp1Component,
		selectors: [["app-lib-comp1"]],
		hostBindings: function LibComp1Component_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("tap", function LibComp1Component_tap_HostBindingHandler($event) {
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
				ɵɵelementStart(0, "p", 0);
				ɵɵtext(1, "lib-comp1 works!");
				ɵɵelementEnd();
			}
			if (rf & 2) propertyChange(ɵɵgetCurrentView());
		},
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(LibComp1Component, [{
		type: Component,
		args: [{
			standalone: false,
			selector: "app-lib-comp1",
			template: "<p class=\"lib-comp1-content\">lib-comp1 works!</p>\n"
		}]
	}], () => [], {
		tap1: [{
			type: HostListener,
			args: ["tap", ["$event"]]
		}],
		tap2: [{
			type: HostListener,
			args: ["bindtap", ["$event"]]
		}]
	});
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(LibComp1Component, {
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
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: LibDir1Directive,
		selectors: [[
			"",
			"appLibDir1",
			""
		]],
		hostBindings: function LibDir1Directive_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("tap", function LibDir1Directive_tap_HostBindingHandler($event) {
				return ctx.tap1($event);
			})("bindtap", function LibDir1Directive_bindtap_HostBindingHandler($event) {
				return ctx.tap2($event);
			});
		},
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(LibDir1Directive, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "[appLibDir1]"
		}]
	}], () => [], {
		tap1: [{
			type: HostListener,
			args: ["tap", ["$event"]]
		}],
		tap2: [{
			type: HostListener,
			args: ["bindtap", ["$event"]]
		}]
	});
})();
var LibComp1Module = class LibComp1Module {
	static ɵfac = function LibComp1Module_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || LibComp1Module)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: LibComp1Module });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [CommonModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(LibComp1Module, [{
		type: NgModule,
		args: [{
			imports: [CommonModule],
			declarations: [LibComp1Component, LibDir1Directive],
			exports: [LibComp1Component, LibDir1Directive]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(LibComp1Module, {
		declarations: [LibComp1Component, LibDir1Directive],
		imports: [CommonModule],
		exports: [LibComp1Component, LibDir1Directive]
	});
})();
var InputOutputDirective = class InputOutputDirective {
	/** signal input，替代 @Input() */
	input1 = input("", ...wx.__global.ngDevMode ? [{ debugName: "input1" }] : /* istanbul ignore next */ []);
	input2 = input(0, ...wx.__global.ngDevMode ? [{ debugName: "input2" }] : /* istanbul ignore next */ []);
	/** signal output，替代 @Output() + EventEmitter */
	output1 = output();
	output2 = output();
	ngOnInit() {
		this.output1.emit(this.input1());
		this.output2.emit(this.input2());
	}
	static ɵfac = function InputOutputDirective_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || InputOutputDirective)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
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
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(InputOutputDirective, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "[libInputOutput]"
		}]
	}], null, {
		input1: [{
			type: Input,
			args: [{
				isSignal: true,
				alias: "input1",
				required: false
			}]
		}],
		input2: [{
			type: Input,
			args: [{
				isSignal: true,
				alias: "input2",
				required: false
			}]
		}],
		output1: [{
			type: Output,
			args: ["output1"]
		}],
		output2: [{
			type: Output,
			args: ["output2"]
		}]
	});
})();
var DirectiveModule = class DirectiveModule {
	static ɵfac = function DirectiveModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || DirectiveModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: DirectiveModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(DirectiveModule, [{
		type: NgModule,
		args: [{
			declarations: [InputOutputDirective],
			imports: [],
			exports: [InputOutputDirective],
			providers: []
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(DirectiveModule, {
		declarations: [InputOutputDirective],
		exports: [InputOutputDirective]
	});
})();
function OutsideTemplateComponent_div_2_ng_container_1_Template(rf, ctx) {
	if (rf & 1) ɵɵelementContainer(0);
}
function OutsideTemplateComponent_div_2_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtemplate(1, OutsideTemplateComponent_div_2_ng_container_1_Template, 1, 0, "ng-container", 1);
		ɵɵelementEnd();
	}
	if (rf & 2) {
		const ctx_r0 = ɵɵnextContext();
		ɵɵadvance();
		ɵɵproperty("ngTemplateOutlet", ctx_r0.template);
	}
}
var OutsideTemplateComponent = class OutsideTemplateComponent {
	template;
	constructor() {}
	ngOnInit() {}
	static ɵfac = function OutsideTemplateComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || OutsideTemplateComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: OutsideTemplateComponent,
		selectors: [["app-outside-template"]],
		inputs: { template: "template" },
		standalone: false,
		decls: 3,
		vars: 1,
		consts: [[4, "ngIf"], [4, "ngTemplateOutlet"]],
		template: function OutsideTemplateComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "div");
				ɵɵtext(1, "下面将传入一个由外部提供的模板");
				ɵɵelementEnd();
				ɵɵtemplate(2, OutsideTemplateComponent_div_2_Template, 2, 1, "div", 0);
			}
			if (rf & 2) {
				ɵɵadvance(2);
				ɵɵproperty("ngIf", ctx.template);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [NgIf, NgTemplateOutlet],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(OutsideTemplateComponent, [{
		type: Component,
		args: [{
			standalone: false,
			selector: "app-outside-template",
			template: "<div>下面将传入一个由外部提供的模板</div>\n<div *ngIf=\"template\">\n  <ng-container *ngTemplateOutlet=\"template\"></ng-container>\n</div>\n"
		}]
	}], () => [], { template: [{ type: Input }] });
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(OutsideTemplateComponent, {
		className: "OutsideTemplateComponent",
		filePath: "outside-template/outside-template.component.ts",
		lineNumber: 9
	});
})();
var OutsideTemplateModule = class OutsideTemplateModule {
	static ɵfac = function OutsideTemplateModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || OutsideTemplateModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: OutsideTemplateModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [CommonModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(OutsideTemplateModule, [{
		type: NgModule,
		args: [{
			imports: [CommonModule],
			declarations: [OutsideTemplateComponent],
			exports: [OutsideTemplateComponent]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(OutsideTemplateModule, {
		declarations: [OutsideTemplateComponent],
		imports: [CommonModule],
		exports: [OutsideTemplateComponent]
	});
})();
function GlobalSelfTemplateComponent_ng_template_1_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵtext(0, " library内模板 ");
		ɵɵelement(1, "app-other");
	}
}
var GlobalSelfTemplateComponent = class GlobalSelfTemplateComponent {
	constructor() {}
	ngOnInit() {}
	static ɵfac = function GlobalSelfTemplateComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || GlobalSelfTemplateComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: GlobalSelfTemplateComponent,
		selectors: [["app-global-self-template"]],
		standalone: false,
		decls: 3,
		vars: 1,
		consts: [["$$mp$$__self__$$libraryFirst", ""], [3, "template"]],
		template: function GlobalSelfTemplateComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelement(0, "app-outside-template", 1);
				ɵɵtemplate(1, GlobalSelfTemplateComponent_ng_template_1_Template, 2, 0, "ng-template", null, 0, ɵɵtemplateRefExtractor);
			}
			if (rf & 2) {
				const $$mp$$__self__$$libraryFirst_r1 = ɵɵreference(2);
				ɵɵproperty("template", $$mp$$__self__$$libraryFirst_r1);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [OutsideTemplateComponent, OtherComponent],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(GlobalSelfTemplateComponent, [{
		type: Component,
		args: [{
			standalone: false,
			selector: "app-global-self-template",
			template: "<app-outside-template\n  [template]=\"$$mp$$__self__$$libraryFirst\"\n></app-outside-template>\n<ng-template #$$mp$$__self__$$libraryFirst>\n  library内模板\n  <app-other></app-other>\n</ng-template>\n"
		}]
	}], () => [], null);
})();
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(GlobalSelfTemplateComponent, {
		className: "GlobalSelfTemplateComponent",
		filePath: "global-self-template/global-self-template.component.ts",
		lineNumber: 9
	});
})();
var GlobalSelfTemplateModule = class GlobalSelfTemplateModule {
	static ɵfac = function GlobalSelfTemplateModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || GlobalSelfTemplateModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: GlobalSelfTemplateModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [OutsideTemplateModule, OtherModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(GlobalSelfTemplateModule, [{
		type: NgModule,
		args: [{
			imports: [OutsideTemplateModule, OtherModule],
			declarations: [GlobalSelfTemplateComponent],
			exports: [GlobalSelfTemplateComponent]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(GlobalSelfTemplateModule, {
		declarations: [GlobalSelfTemplateComponent],
		imports: [OutsideTemplateModule, OtherModule],
		exports: [GlobalSelfTemplateComponent]
	});
})();
//#endregion
export { LibComp1Component as a, OtherComponent as c, TestLibraryComponent as d, InputOutputDirective as i, OutsideTemplateComponent as l, GlobalSelfTemplateComponent as n, LibComp1Module as o, GlobalSelfTemplateModule as r, LibDir1Directive as s, DirectiveModule as t, OutsideTemplateModule as u };
