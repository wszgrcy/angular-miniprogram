import { $ as ɵɵadvance, At as ɵɵproperty, Bt as ɵɵtext, Ct as ɵɵlistener, J as ɵsetClassDebugInfo, Mt as ɵɵreference, Rt as ɵɵtemplate, Vt as ɵɵtextInterpolate, bt as ɵɵelementStart, c as CommonModule, ct as ɵɵdefineComponent, d as NgIf, f as NgSwitch, g as propertyChange, h as NgTemplateOutlet, i as bootstrapPage, m as NgSwitchDefault, p as NgSwitchCase, u as NgForOf, vt as ɵɵelementContainer, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd, zt as ɵɵtemplateRefExtractor } from "../../angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/default-structural-directive/default-structural-directive.component.ts
function DefaultStructuralDirectiveComponent_div_6_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1, "默认为显示");
		ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_div_11_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1, "默认if为显示");
		ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_ng_template_12_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1, "else时显示");
		ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_ng_template_18_Template(rf, ctx) {
	if (rf & 1) ɵɵtext(0, "模板上默认if为显示");
}
function DefaultStructuralDirectiveComponent_ng_template_19_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1, "模板上else时显示");
		ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_div_29_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1);
		ɵɵelementEnd();
	}
	if (rf & 2) {
		const item_r1 = ctx.$implicit;
		ɵɵadvance();
		ɵɵtextInterpolate(item_r1);
	}
}
function DefaultStructuralDirectiveComponent_p_37_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "p");
		ɵɵtext(1, "0显示");
		ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_p_38_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "p");
		ɵɵtext(1, "1显示");
		ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_p_39_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "p", 12);
		ɵɵtext(1, "(2)其他显示");
		ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_ng_template_44_Template(rf, ctx) {
	if (rf & 1) ɵɵtext(0, "ngTemplateOutLet测试");
}
function DefaultStructuralDirectiveComponent_ng_container_46_Template(rf, ctx) {
	if (rf & 1) ɵɵelementContainer(0);
}
var DefaultStructuralDirectiveComponent = class DefaultStructuralDirectiveComponent {
	flag = {
		if: true,
		ifElse: true,
		ifDefault: true
	};
	list = [
		0,
		1,
		2
	];
	ngSwitchValue = 0;
	ngSwitchValueList = [
		0,
		1,
		2
	];
	ngSwitchValueIndex = 0;
	constructor() {}
	ngOnInit() {}
	ngIfControl() {
		this.flag.if = !this.flag.if;
	}
	ngIfElseControl() {
		this.flag.ifElse = !this.flag.ifElse;
	}
	ngIfDefault() {
		this.flag.ifDefault = !this.flag.ifDefault;
	}
	addList() {
		this.list.push(this.list.length);
		this.list = this.list.slice();
	}
	removeList() {
		this.list.pop();
		this.list = this.list.slice();
	}
	changeSwitch() {
		this.ngSwitchValueIndex = this.ngSwitchValueList.length === this.ngSwitchValueIndex + 1 ? 0 : ++this.ngSwitchValueIndex;
		this.ngSwitchValue = this.ngSwitchValueList[this.ngSwitchValueIndex];
		console.log(this.ngSwitchValue);
	}
	static ɵfac = function DefaultStructuralDirectiveComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || DefaultStructuralDirectiveComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: DefaultStructuralDirectiveComponent,
		selectors: [["app-default-structural-directive"]],
		decls: 49,
		vars: 10,
		consts: [
			["ngIfElseTemplate", ""],
			["ngIfDefaultElseTemplate", ""],
			["outletTemplate", ""],
			[3, "tap"],
			[4, "ngIf"],
			[
				4,
				"ngIf",
				"ngIfElse"
			],
			[
				3,
				"ngIf",
				"ngIfElse"
			],
			[
				4,
				"ngFor",
				"ngForOf"
			],
			[3, "ngSwitch"],
			[4, "ngSwitchCase"],
			[
				"style",
				"background-color: green",
				4,
				"ngSwitchDefault"
			],
			[4, "ngTemplateOutlet"],
			[
				2,
				"background-color",
				"green"
			]
		],
		template: function DefaultStructuralDirectiveComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "div");
				ɵɵtext(1, " 默认结构型指令为静态解析,所以模板将会在编译时固定,如果想有限的使用模板(当前组件内传递模板),可以先定义自定义结构型指令,或者后期有时间hook common依赖库来实现\n");
				ɵɵelementEnd();
				ɵɵelementStart(2, "div");
				ɵɵtext(3, "语法糖ngIf显示测试");
				ɵɵelementEnd();
				ɵɵelementStart(4, "button", 3);
				ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_4_listener() {
					return ctx.ngIfControl();
				});
				ɵɵtext(5, "点击控制显示/隐藏");
				ɵɵelementEnd();
				ɵɵtemplate(6, DefaultStructuralDirectiveComponent_div_6_Template, 2, 0, "div", 4);
				ɵɵelementStart(7, "div");
				ɵɵtext(8, "语法糖ngIf else测试");
				ɵɵelementEnd();
				ɵɵelementStart(9, "button", 3);
				ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_9_listener() {
					return ctx.ngIfElseControl();
				});
				ɵɵtext(10, "点击控制显示/隐藏");
				ɵɵelementEnd();
				ɵɵtemplate(11, DefaultStructuralDirectiveComponent_div_11_Template, 2, 0, "div", 5)(12, DefaultStructuralDirectiveComponent_ng_template_12_Template, 2, 0, "ng-template", null, 0, ɵɵtemplateRefExtractor);
				ɵɵelementStart(14, "p");
				ɵɵtext(15, "非语法糖ngIf显示测试");
				ɵɵelementEnd();
				ɵɵelementStart(16, "button", 3);
				ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_16_listener() {
					return ctx.ngIfDefault();
				});
				ɵɵtext(17, "点击控制显示/隐藏");
				ɵɵelementEnd();
				ɵɵtemplate(18, DefaultStructuralDirectiveComponent_ng_template_18_Template, 1, 0, "ng-template", 6)(19, DefaultStructuralDirectiveComponent_ng_template_19_Template, 2, 0, "ng-template", null, 1, ɵɵtemplateRefExtractor);
				ɵɵelementStart(21, "div");
				ɵɵtext(22, "------------------------");
				ɵɵelementEnd();
				ɵɵelementStart(23, "div");
				ɵɵtext(24, "ngfor测试");
				ɵɵelementEnd();
				ɵɵelementStart(25, "button", 3);
				ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_25_listener() {
					return ctx.addList();
				});
				ɵɵtext(26, "增加列表");
				ɵɵelementEnd();
				ɵɵelementStart(27, "button", 3);
				ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_27_listener() {
					return ctx.removeList();
				});
				ɵɵtext(28, "减少列表");
				ɵɵelementEnd();
				ɵɵtemplate(29, DefaultStructuralDirectiveComponent_div_29_Template, 2, 1, "div", 7);
				ɵɵelementStart(30, "div");
				ɵɵtext(31, "-------------");
				ɵɵelementEnd();
				ɵɵelementStart(32, "div");
				ɵɵtext(33, "ngSwitch测试");
				ɵɵelementEnd();
				ɵɵelementStart(34, "button", 3);
				ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_34_listener() {
					return ctx.changeSwitch();
				});
				ɵɵtext(35, "修改显示");
				ɵɵelementEnd();
				ɵɵelementStart(36, "span", 8);
				ɵɵtemplate(37, DefaultStructuralDirectiveComponent_p_37_Template, 2, 0, "p", 9)(38, DefaultStructuralDirectiveComponent_p_38_Template, 2, 0, "p", 9)(39, DefaultStructuralDirectiveComponent_p_39_Template, 2, 0, "p", 10);
				ɵɵelementEnd();
				ɵɵelementStart(40, "div");
				ɵɵtext(41, "-----------");
				ɵɵelementEnd();
				ɵɵelementStart(42, "div");
				ɵɵtext(43, "ngTemplateOutLet");
				ɵɵelementEnd();
				ɵɵtemplate(44, DefaultStructuralDirectiveComponent_ng_template_44_Template, 1, 0, "ng-template", null, 2, ɵɵtemplateRefExtractor)(46, DefaultStructuralDirectiveComponent_ng_container_46_Template, 1, 0, "ng-container", 11);
				ɵɵelementStart(47, "div");
				ɵɵtext(48, "ngComponentOutLet暂时不支持(如果hook common组件库可能会有限支持)");
				ɵɵelementEnd();
			}
			if (rf & 2) {
				const ngIfElseTemplate_r2 = ɵɵreference(13);
				const ngIfDefaultElseTemplate_r3 = ɵɵreference(20);
				const outletTemplate_r4 = ɵɵreference(45);
				ɵɵadvance(6);
				ɵɵproperty("ngIf", ctx.flag.if);
				ɵɵadvance(5);
				ɵɵproperty("ngIf", ctx.flag.ifElse)("ngIfElse", ngIfElseTemplate_r2);
				ɵɵadvance(7);
				ɵɵproperty("ngIf", ctx.flag.ifDefault)("ngIfElse", ngIfDefaultElseTemplate_r3);
				ɵɵadvance(11);
				ɵɵproperty("ngForOf", ctx.list);
				ɵɵadvance(7);
				ɵɵproperty("ngSwitch", ctx.ngSwitchValue);
				ɵɵadvance();
				ɵɵproperty("ngSwitchCase", 0);
				ɵɵadvance();
				ɵɵproperty("ngSwitchCase", 1);
				ɵɵadvance(8);
				ɵɵproperty("ngTemplateOutlet", outletTemplate_r4);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [
			CommonModule,
			NgForOf,
			NgIf,
			NgTemplateOutlet,
			NgSwitch,
			NgSwitchCase,
			NgSwitchDefault
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(DefaultStructuralDirectiveComponent, {
		className: "DefaultStructuralDirectiveComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/default-structural-directive/default-structural-directive.component.ts",
		lineNumber: 11
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/default-structural-directive/default-structural-directive.entry.ts
bootstrapPage(DefaultStructuralDirectiveComponent);
//#endregion
