import { $ as ɵɵadvance, Bt as ɵɵtext, Dt as ɵɵpipeBind1, Et as ɵɵpipe, Ft as ɵɵrepeaterTrackByIdentity, J as ɵsetClassDebugInfo, Nt as ɵɵrepeater, Pt as ɵɵrepeaterCreate, Tt as ɵɵnextContext, Vt as ɵɵtextInterpolate, Wt as ɵɵtextInterpolate3, c as CommonModule, ct as ɵɵdefineComponent, g as propertyChange, i as bootstrapPage, it as ɵɵconditionalCreate, l as JsonPipe, mt as ɵɵdomElementStart, nt as ɵɵconditional, pt as ɵɵdomElementEnd, rt as ɵɵconditionalBranchCreate, xt as ɵɵgetCurrentView } from "../../angular-miniprogram-CzfAskez.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/control-flow/control-flow.component.ts
function ControlFlowComponent_Conditional_3_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 2);
		ɵɵtext(1, "yes");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_Conditional_4_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 3);
		ɵɵtext(1, "other");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_Conditional_5_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 4);
		ɵɵtext(1, "no");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_Conditional_6_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 5);
		ɵɵtext(1);
		ɵɵdomElementEnd();
	}
	if (rf & 2) {
		ɵɵadvance();
		ɵɵtextInterpolate(ctx);
	}
}
function ControlFlowComponent_Conditional_7_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 6);
		ɵɵtext(1, "pipe");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_Conditional_9_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 7);
		ɵɵtext(1, "pipe-else");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_For_11_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 8);
		ɵɵtext(1);
		ɵɵdomElementEnd();
	}
	if (rf & 2) {
		const item_r1 = ctx.$implicit;
		const ɵ$index_31_r2 = ctx.$index;
		ɵɵadvance();
		ɵɵtextInterpolate3("", ɵ$index_31_r2, ":", item_r1, ":", ɵ$index_31_r2 === 0);
	}
}
function ControlFlowComponent_ForEmpty_12_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 9);
		ɵɵtext(1, "empty");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_For_14_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 10);
		ɵɵtext(1, "never");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_ForEmpty_15_Conditional_1_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "span", 16);
		ɵɵtext(1, "nested");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_ForEmpty_15_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 11);
		ɵɵconditionalCreate(1, ControlFlowComponent_ForEmpty_15_Conditional_1_Template, 2, 0, "span", 16);
		ɵɵdomElementEnd();
	}
	if (rf & 2) {
		const ctx_r2 = ɵɵnextContext();
		ɵɵadvance();
		ɵɵconditional(ctx_r2.nested ? 1 : -1);
	}
}
function ControlFlowComponent_Case_16_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 12);
		ɵɵtext(1, "A");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_Case_17_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 13);
		ɵɵtext(1, "B");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_Case_18_Conditional_1_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "span", 17);
		ɵɵtext(1, "nested-case");
		ɵɵdomElementEnd();
	}
}
function ControlFlowComponent_Case_18_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵdomElementStart(0, "div", 14);
		ɵɵconditionalCreate(1, ControlFlowComponent_Case_18_Conditional_1_Template, 2, 0, "span", 17);
		ɵɵdomElementEnd();
	}
	if (rf & 2) {
		const ctx_r2 = ɵɵnextContext();
		ɵɵadvance();
		ɵɵconditional(ctx_r2.nested ? 1 : -1);
	}
}
/**
* 内建控制流（`@if` / `@for` / `@switch`）的样例页面。
*
* 覆盖点：
* - `@if` / `@else if` / `@else`
* - `@if (x as y)` 别名
* - 条件表达式里带管道（会额外占用宿主视图的声明槽位）
* - `@for` + `@empty`，以及 `$index` 等上下文变量
* - `@switch` / `@case` / `@default`
* - 控制流嵌套
*/
var ControlFlowComponent = class ControlFlowComponent {
	show = true;
	other = false;
	list = [
		"a",
		"b",
		"c"
	];
	emptyList = [];
	mode = "a";
	nested = true;
	/** 用于管道条件，避免真的引入 async 带来的时序问题 */
	flag$ = { pipe: true };
	static ɵfac = function ControlFlowComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ControlFlowComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: ControlFlowComponent,
		selectors: [["app-control-flow"]],
		decls: 21,
		vars: 8,
		consts: [
			[1, "control-flow-page"],
			[1, "before"],
			[1, "if-yes"],
			[1, "if-other"],
			[1, "if-no"],
			[1, "if-alias"],
			[1, "if-pipe"],
			[1, "if-pipe-else"],
			[1, "for-item"],
			[1, "for-empty"],
			[1, "for-real-empty"],
			[1, "for-real-empty-tip"],
			[1, "case-a"],
			[1, "case-b"],
			[1, "case-default"],
			[1, "after"],
			[1, "nested-in-empty"],
			[1, "nested-in-case"]
		],
		template: function ControlFlowComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵdomElementStart(0, "div", 0)(1, "div", 1);
				ɵɵtext(2, "before");
				ɵɵdomElementEnd();
				ɵɵconditionalCreate(3, ControlFlowComponent_Conditional_3_Template, 2, 0, "div", 2)(4, ControlFlowComponent_Conditional_4_Template, 2, 0, "div", 3)(5, ControlFlowComponent_Conditional_5_Template, 2, 0, "div", 4);
				ɵɵconditionalCreate(6, ControlFlowComponent_Conditional_6_Template, 2, 1, "div", 5);
				ɵɵconditionalCreate(7, ControlFlowComponent_Conditional_7_Template, 2, 0, "div", 6);
				ɵɵpipe(8, "json");
				ɵɵconditionalBranchCreate(9, ControlFlowComponent_Conditional_9_Template, 2, 0, "div", 7);
				ɵɵrepeaterCreate(10, ControlFlowComponent_For_11_Template, 2, 3, "div", 8, ɵɵrepeaterTrackByIdentity, false, ControlFlowComponent_ForEmpty_12_Template, 2, 0, "div", 9);
				ɵɵrepeaterCreate(13, ControlFlowComponent_For_14_Template, 2, 0, "div", 10, ɵɵrepeaterTrackByIdentity, false, ControlFlowComponent_ForEmpty_15_Template, 2, 1, "div", 11);
				ɵɵconditionalCreate(16, ControlFlowComponent_Case_16_Template, 2, 0, "div", 12)(17, ControlFlowComponent_Case_17_Template, 2, 0, "div", 13)(18, ControlFlowComponent_Case_18_Template, 2, 1, "div", 14);
				ɵɵdomElementStart(19, "div", 15);
				ɵɵtext(20, "after");
				ɵɵdomElementEnd()();
			}
			if (rf & 2) {
				let tmp_1_0;
				let tmp_5_0;
				ɵɵadvance(3);
				ɵɵconditional(ctx.show ? 3 : ctx.other ? 4 : 5);
				ɵɵadvance(3);
				ɵɵconditional((tmp_1_0 = ctx.show) ? 6 : -1, tmp_1_0);
				ɵɵadvance();
				ɵɵconditional(ɵɵpipeBind1(8, 6, ctx.flag$) ? 7 : 9);
				ɵɵadvance(3);
				ɵɵrepeater(ctx.list);
				ɵɵadvance(3);
				ɵɵrepeater(ctx.emptyList);
				ɵɵadvance(3);
				ɵɵconditional((tmp_5_0 = ctx.mode) === "a" ? 16 : tmp_5_0 === "b" ? 17 : 18);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [CommonModule, JsonPipe],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(ControlFlowComponent, {
		className: "ControlFlowComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/control-flow/control-flow.component.ts",
		lineNumber: 21
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/control-flow/control-flow.entry.ts
bootstrapPage(ControlFlowComponent);
//#endregion
