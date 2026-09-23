const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/default-structural-directive/default-structural-directive.component.ts
function DefaultStructuralDirectiveComponent_div_6_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1, "默认为显示");
		require_angular_miniprogram.ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_div_11_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1, "默认if为显示");
		require_angular_miniprogram.ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_ng_template_12_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1, "else时显示");
		require_angular_miniprogram.ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_ng_template_18_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵtext(0, "模板上默认if为显示");
}
function DefaultStructuralDirectiveComponent_ng_template_19_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1, "模板上else时显示");
		require_angular_miniprogram.ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_div_29_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1);
		require_angular_miniprogram.ɵɵelementEnd();
	}
	if (rf & 2) {
		const item_r1 = ctx.$implicit;
		require_angular_miniprogram.ɵɵadvance();
		require_angular_miniprogram.ɵɵtextInterpolate(item_r1);
	}
}
function DefaultStructuralDirectiveComponent_p_37_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "p");
		require_angular_miniprogram.ɵɵtext(1, "0显示");
		require_angular_miniprogram.ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_p_38_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "p");
		require_angular_miniprogram.ɵɵtext(1, "1显示");
		require_angular_miniprogram.ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_p_39_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "p", 12);
		require_angular_miniprogram.ɵɵtext(1, "(2)其他显示");
		require_angular_miniprogram.ɵɵelementEnd();
	}
}
function DefaultStructuralDirectiveComponent_ng_template_44_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵtext(0, "ngTemplateOutLet测试");
}
function DefaultStructuralDirectiveComponent_ng_container_46_Template(rf, ctx) {
	if (rf & 1) require_angular_miniprogram.ɵɵelementContainer(0);
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
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
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
				require_angular_miniprogram.ɵɵelementStart(0, "div");
				require_angular_miniprogram.ɵɵtext(1, " 默认结构型指令为静态解析,所以模板将会在编译时固定,如果想有限的使用模板(当前组件内传递模板),可以先定义自定义结构型指令,或者后期有时间hook common依赖库来实现\n");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(2, "div");
				require_angular_miniprogram.ɵɵtext(3, "语法糖ngIf显示测试");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(4, "button", 3);
				require_angular_miniprogram.ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_4_listener() {
					return ctx.ngIfControl();
				});
				require_angular_miniprogram.ɵɵtext(5, "点击控制显示/隐藏");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(6, DefaultStructuralDirectiveComponent_div_6_Template, 2, 0, "div", 4);
				require_angular_miniprogram.ɵɵelementStart(7, "div");
				require_angular_miniprogram.ɵɵtext(8, "语法糖ngIf else测试");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(9, "button", 3);
				require_angular_miniprogram.ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_9_listener() {
					return ctx.ngIfElseControl();
				});
				require_angular_miniprogram.ɵɵtext(10, "点击控制显示/隐藏");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(11, DefaultStructuralDirectiveComponent_div_11_Template, 2, 0, "div", 5)(12, DefaultStructuralDirectiveComponent_ng_template_12_Template, 2, 0, "ng-template", null, 0, require_angular_miniprogram.ɵɵtemplateRefExtractor);
				require_angular_miniprogram.ɵɵelementStart(14, "p");
				require_angular_miniprogram.ɵɵtext(15, "非语法糖ngIf显示测试");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(16, "button", 3);
				require_angular_miniprogram.ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_16_listener() {
					return ctx.ngIfDefault();
				});
				require_angular_miniprogram.ɵɵtext(17, "点击控制显示/隐藏");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(18, DefaultStructuralDirectiveComponent_ng_template_18_Template, 1, 0, "ng-template", 6)(19, DefaultStructuralDirectiveComponent_ng_template_19_Template, 2, 0, "ng-template", null, 1, require_angular_miniprogram.ɵɵtemplateRefExtractor);
				require_angular_miniprogram.ɵɵelementStart(21, "div");
				require_angular_miniprogram.ɵɵtext(22, "------------------------");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(23, "div");
				require_angular_miniprogram.ɵɵtext(24, "ngfor测试");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(25, "button", 3);
				require_angular_miniprogram.ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_25_listener() {
					return ctx.addList();
				});
				require_angular_miniprogram.ɵɵtext(26, "增加列表");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(27, "button", 3);
				require_angular_miniprogram.ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_27_listener() {
					return ctx.removeList();
				});
				require_angular_miniprogram.ɵɵtext(28, "减少列表");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(29, DefaultStructuralDirectiveComponent_div_29_Template, 2, 1, "div", 7);
				require_angular_miniprogram.ɵɵelementStart(30, "div");
				require_angular_miniprogram.ɵɵtext(31, "-------------");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(32, "div");
				require_angular_miniprogram.ɵɵtext(33, "ngSwitch测试");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(34, "button", 3);
				require_angular_miniprogram.ɵɵlistener("tap", function DefaultStructuralDirectiveComponent_Template_button_tap_34_listener() {
					return ctx.changeSwitch();
				});
				require_angular_miniprogram.ɵɵtext(35, "修改显示");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(36, "span", 8);
				require_angular_miniprogram.ɵɵtemplate(37, DefaultStructuralDirectiveComponent_p_37_Template, 2, 0, "p", 9)(38, DefaultStructuralDirectiveComponent_p_38_Template, 2, 0, "p", 9)(39, DefaultStructuralDirectiveComponent_p_39_Template, 2, 0, "p", 10);
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(40, "div");
				require_angular_miniprogram.ɵɵtext(41, "-----------");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵelementStart(42, "div");
				require_angular_miniprogram.ɵɵtext(43, "ngTemplateOutLet");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(44, DefaultStructuralDirectiveComponent_ng_template_44_Template, 1, 0, "ng-template", null, 2, require_angular_miniprogram.ɵɵtemplateRefExtractor)(46, DefaultStructuralDirectiveComponent_ng_container_46_Template, 1, 0, "ng-container", 11);
				require_angular_miniprogram.ɵɵelementStart(47, "div");
				require_angular_miniprogram.ɵɵtext(48, "ngComponentOutLet暂时不支持(如果hook common组件库可能会有限支持)");
				require_angular_miniprogram.ɵɵelementEnd();
			}
			if (rf & 2) {
				const ngIfElseTemplate_r2 = require_angular_miniprogram.ɵɵreference(13);
				const ngIfDefaultElseTemplate_r3 = require_angular_miniprogram.ɵɵreference(20);
				const outletTemplate_r4 = require_angular_miniprogram.ɵɵreference(45);
				require_angular_miniprogram.ɵɵadvance(6);
				require_angular_miniprogram.ɵɵproperty("ngIf", ctx.flag.if);
				require_angular_miniprogram.ɵɵadvance(5);
				require_angular_miniprogram.ɵɵproperty("ngIf", ctx.flag.ifElse)("ngIfElse", ngIfElseTemplate_r2);
				require_angular_miniprogram.ɵɵadvance(7);
				require_angular_miniprogram.ɵɵproperty("ngIf", ctx.flag.ifDefault)("ngIfElse", ngIfDefaultElseTemplate_r3);
				require_angular_miniprogram.ɵɵadvance(11);
				require_angular_miniprogram.ɵɵproperty("ngForOf", ctx.list);
				require_angular_miniprogram.ɵɵadvance(7);
				require_angular_miniprogram.ɵɵproperty("ngSwitch", ctx.ngSwitchValue);
				require_angular_miniprogram.ɵɵadvance();
				require_angular_miniprogram.ɵɵproperty("ngSwitchCase", 0);
				require_angular_miniprogram.ɵɵadvance();
				require_angular_miniprogram.ɵɵproperty("ngSwitchCase", 1);
				require_angular_miniprogram.ɵɵadvance(8);
				require_angular_miniprogram.ɵɵproperty("ngTemplateOutlet", outletTemplate_r4);
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [
			require_angular_miniprogram.CommonModule,
			require_angular_miniprogram.NgForOf,
			require_angular_miniprogram.NgIf,
			require_angular_miniprogram.NgTemplateOutlet,
			require_angular_miniprogram.NgSwitch,
			require_angular_miniprogram.NgSwitchCase,
			require_angular_miniprogram.NgSwitchDefault
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(DefaultStructuralDirectiveComponent, {
		className: "DefaultStructuralDirectiveComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/default-structural-directive/default-structural-directive.component.ts",
		lineNumber: 11
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/default-structural-directive/default-structural-directive.entry.ts
require_angular_miniprogram.bootstrapPage(DefaultStructuralDirectiveComponent);
//#endregion
