import { $ as ɵɵadvance, At as ɵɵproperty, Bt as ɵɵtext, Ht as ɵɵtextInterpolate1, J as ɵsetClassDebugInfo, Lt as ɵɵstyleProp, Rt as ɵɵtemplate, Tt as ɵɵnextContext, Ut as ɵɵtextInterpolate2, bt as ɵɵelementStart, c as CommonModule, ct as ɵɵdefineComponent, d as NgIf, g as propertyChange, i as bootstrapPage, u as NgForOf, xt as ɵɵgetCurrentView, yt as ɵɵelementEnd } from "../../angular-miniprogram-CzfAskez.js";
import { t as ContentComponent } from "../../content.component-C4UaPuqo.js";
import { t as ContentModule } from "../../content.module-C31bkBFu.js";
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/complex-structure/complex-structure.component.ts
function ComplexStructureComponent_div_2_div_2_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1, "第二层");
		ɵɵelementEnd();
	}
	if (rf & 2) ɵɵstyleProp("color", "yellow");
}
function ComplexStructureComponent_div_2_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1, " 第一层 ");
		ɵɵtemplate(2, ComplexStructureComponent_div_2_div_2_Template, 2, 2, "div", 0);
		ɵɵelementEnd();
	}
	if (rf & 2) {
		ɵɵstyleProp("color", "red");
		ɵɵadvance(2);
		ɵɵproperty("ngIf", true);
	}
}
function ComplexStructureComponent_div_5_div_1_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1);
		ɵɵelementEnd();
	}
	if (rf & 2) {
		const item_r1 = ctx.$implicit;
		const i_r2 = ctx.index;
		ɵɵadvance();
		ɵɵtextInterpolate2(" 内容:item:", item_r1, ",index:", i_r2, " ");
	}
}
function ComplexStructureComponent_div_5_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtemplate(1, ComplexStructureComponent_div_5_div_1_Template, 2, 2, "div", 2);
		ɵɵelementEnd();
	}
	if (rf & 2) {
		const ctx_r2 = ɵɵnextContext();
		ɵɵadvance();
		ɵɵproperty("ngForOf", ctx_r2.list);
	}
}
function ComplexStructureComponent_div_8_div_1_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtext(1);
		ɵɵelementEnd();
	}
	if (rf & 2) {
		const item2_r4 = ctx.$implicit;
		const item1_r5 = ɵɵnextContext().$implicit;
		ɵɵadvance();
		ɵɵtextInterpolate2("内容item1:", item1_r5, ",item2:", item2_r4);
	}
}
function ComplexStructureComponent_div_8_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div");
		ɵɵtemplate(1, ComplexStructureComponent_div_8_div_1_Template, 2, 2, "div", 2);
		ɵɵelementEnd();
	}
	if (rf & 2) {
		const ctx_r2 = ɵɵnextContext();
		ɵɵadvance();
		ɵɵproperty("ngForOf", ctx_r2.list);
	}
}
function ComplexStructureComponent_div_11_Template(rf, ctx) {
	if (rf & 1) {
		ɵɵelementStart(0, "div")(1, "app-content");
		ɵɵtext(2);
		ɵɵelementEnd()();
	}
	if (rf & 2) {
		const item_r6 = ctx.$implicit;
		ɵɵadvance(2);
		ɵɵtextInterpolate1(" 投影内容:", item_r6, " ");
	}
}
var ComplexStructureComponent = class ComplexStructureComponent {
	list = [
		1,
		2,
		3
	];
	constructor() {}
	ngOnInit() {}
	static ɵfac = function ComplexStructureComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ComplexStructureComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: ComplexStructureComponent,
		selectors: [["app-complex-structure"]],
		decls: 12,
		vars: 4,
		consts: [
			[
				3,
				"color",
				4,
				"ngIf"
			],
			[4, "ngIf"],
			[
				4,
				"ngFor",
				"ngForOf"
			]
		],
		template: function ComplexStructureComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "div");
				ɵɵtext(1, "ngIf->ngIf");
				ɵɵelementEnd();
				ɵɵtemplate(2, ComplexStructureComponent_div_2_Template, 3, 3, "div", 0);
				ɵɵelementStart(3, "div");
				ɵɵtext(4, "ngIf->ngFor");
				ɵɵelementEnd();
				ɵɵtemplate(5, ComplexStructureComponent_div_5_Template, 2, 1, "div", 1);
				ɵɵelementStart(6, "div");
				ɵɵtext(7, "ngFor->ngFor");
				ɵɵelementEnd();
				ɵɵtemplate(8, ComplexStructureComponent_div_8_Template, 2, 1, "div", 2);
				ɵɵelementStart(9, "div");
				ɵɵtext(10, "ngFor->ng-content");
				ɵɵelementEnd();
				ɵɵtemplate(11, ComplexStructureComponent_div_11_Template, 3, 1, "div", 2);
			}
			if (rf & 2) {
				ɵɵadvance(2);
				ɵɵproperty("ngIf", true);
				ɵɵadvance(3);
				ɵɵproperty("ngIf", true);
				ɵɵadvance(3);
				ɵɵproperty("ngForOf", ctx.list);
				ɵɵadvance(3);
				ɵɵproperty("ngForOf", ctx.list);
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [
			CommonModule,
			NgForOf,
			NgIf,
			ContentModule,
			ContentComponent
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(ComplexStructureComponent, {
		className: "ComplexStructureComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/complex-structure/complex-structure.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/complex-structure/complex-structure.entry.ts
bootstrapPage(ComplexStructureComponent);
//#endregion
