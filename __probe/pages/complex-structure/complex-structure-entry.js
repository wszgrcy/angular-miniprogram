const require_angular_miniprogram = require("../../angular-miniprogram-hG_juYs4.js");
const require_content_component = require("../../content.component-CtDjYjpc.js");
const require_content_module = require("../../content.module-D_7FcAqa.js");
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/complex-structure/complex-structure.component.ts
function ComplexStructureComponent_div_2_div_2_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1, "第二层");
		require_angular_miniprogram.ɵɵelementEnd();
	}
	if (rf & 2) require_angular_miniprogram.ɵɵstyleProp("color", "yellow");
}
function ComplexStructureComponent_div_2_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1, " 第一层 ");
		require_angular_miniprogram.ɵɵtemplate(2, ComplexStructureComponent_div_2_div_2_Template, 2, 2, "div", 0);
		require_angular_miniprogram.ɵɵelementEnd();
	}
	if (rf & 2) {
		require_angular_miniprogram.ɵɵstyleProp("color", "red");
		require_angular_miniprogram.ɵɵadvance(2);
		require_angular_miniprogram.ɵɵproperty("ngIf", true);
	}
}
function ComplexStructureComponent_div_5_div_1_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1);
		require_angular_miniprogram.ɵɵelementEnd();
	}
	if (rf & 2) {
		const item_r1 = ctx.$implicit;
		const i_r2 = ctx.index;
		require_angular_miniprogram.ɵɵadvance();
		require_angular_miniprogram.ɵɵtextInterpolate2(" 内容:item:", item_r1, ",index:", i_r2, " ");
	}
}
function ComplexStructureComponent_div_5_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtemplate(1, ComplexStructureComponent_div_5_div_1_Template, 2, 2, "div", 2);
		require_angular_miniprogram.ɵɵelementEnd();
	}
	if (rf & 2) {
		const ctx_r2 = require_angular_miniprogram.ɵɵnextContext();
		require_angular_miniprogram.ɵɵadvance();
		require_angular_miniprogram.ɵɵproperty("ngForOf", ctx_r2.list);
	}
}
function ComplexStructureComponent_div_8_div_1_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtext(1);
		require_angular_miniprogram.ɵɵelementEnd();
	}
	if (rf & 2) {
		const item2_r4 = ctx.$implicit;
		const item1_r5 = require_angular_miniprogram.ɵɵnextContext().$implicit;
		require_angular_miniprogram.ɵɵadvance();
		require_angular_miniprogram.ɵɵtextInterpolate2("内容item1:", item1_r5, ",item2:", item2_r4);
	}
}
function ComplexStructureComponent_div_8_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div");
		require_angular_miniprogram.ɵɵtemplate(1, ComplexStructureComponent_div_8_div_1_Template, 2, 2, "div", 2);
		require_angular_miniprogram.ɵɵelementEnd();
	}
	if (rf & 2) {
		const ctx_r2 = require_angular_miniprogram.ɵɵnextContext();
		require_angular_miniprogram.ɵɵadvance();
		require_angular_miniprogram.ɵɵproperty("ngForOf", ctx_r2.list);
	}
}
function ComplexStructureComponent_div_11_Template(rf, ctx) {
	if (rf & 1) {
		require_angular_miniprogram.ɵɵelementStart(0, "div")(1, "app-content");
		require_angular_miniprogram.ɵɵtext(2);
		require_angular_miniprogram.ɵɵelementEnd()();
	}
	if (rf & 2) {
		const item_r6 = ctx.$implicit;
		require_angular_miniprogram.ɵɵadvance(2);
		require_angular_miniprogram.ɵɵtextInterpolate1(" 投影内容:", item_r6, " ");
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
	static ɵcmp = /*@__PURE__*/ require_angular_miniprogram.ɵɵdefineComponent({
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
				require_angular_miniprogram.ɵɵelementStart(0, "div");
				require_angular_miniprogram.ɵɵtext(1, "ngIf->ngIf");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(2, ComplexStructureComponent_div_2_Template, 3, 3, "div", 0);
				require_angular_miniprogram.ɵɵelementStart(3, "div");
				require_angular_miniprogram.ɵɵtext(4, "ngIf->ngFor");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(5, ComplexStructureComponent_div_5_Template, 2, 1, "div", 1);
				require_angular_miniprogram.ɵɵelementStart(6, "div");
				require_angular_miniprogram.ɵɵtext(7, "ngFor->ngFor");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(8, ComplexStructureComponent_div_8_Template, 2, 1, "div", 2);
				require_angular_miniprogram.ɵɵelementStart(9, "div");
				require_angular_miniprogram.ɵɵtext(10, "ngFor->ng-content");
				require_angular_miniprogram.ɵɵelementEnd();
				require_angular_miniprogram.ɵɵtemplate(11, ComplexStructureComponent_div_11_Template, 3, 1, "div", 2);
			}
			if (rf & 2) {
				require_angular_miniprogram.ɵɵadvance(2);
				require_angular_miniprogram.ɵɵproperty("ngIf", true);
				require_angular_miniprogram.ɵɵadvance(3);
				require_angular_miniprogram.ɵɵproperty("ngIf", true);
				require_angular_miniprogram.ɵɵadvance(3);
				require_angular_miniprogram.ɵɵproperty("ngForOf", ctx.list);
				require_angular_miniprogram.ɵɵadvance(3);
				require_angular_miniprogram.ɵɵproperty("ngForOf", ctx.list);
				require_angular_miniprogram.propertyChange(require_angular_miniprogram.ɵɵgetCurrentView());
			}
		},
		dependencies: [
			require_angular_miniprogram.CommonModule,
			require_angular_miniprogram.NgForOf,
			require_angular_miniprogram.NgIf,
			require_content_module.ContentModule,
			require_content_component.ContentComponent
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && require_angular_miniprogram.ɵsetClassDebugInfo(ComplexStructureComponent, {
		className: "ComplexStructureComponent",
		filePath: "test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/complex-structure/complex-structure.component.ts",
		lineNumber: 12
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-nc9qibuwjfh/src/pages/complex-structure/complex-structure.entry.ts
require_angular_miniprogram.bootstrapPage(ComplexStructureComponent);
//#endregion
