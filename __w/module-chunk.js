"use strict";
(wx["webpackChunktest"] = wx["webpackChunktest"] || []).push([["module-chunk"],{

/***/ 6371
/*!*************************************************************************************!*\
  !*** ./src/components/component-need-template/component-need-template.component.ts ***!
  \*************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ComponentNeedTemplateComponent: () => (/* binding */ ComponentNeedTemplateComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram */ 241);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 9733);
/* harmony import */ var angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! angular-miniprogram/common */ 9859);





function ComponentNeedTemplateComponent_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainer"](0);
  }
}
function ComponentNeedTemplateComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "div");
  }
}
class ComponentNeedTemplateComponent {
  templateRef = _angular_core__WEBPACK_IMPORTED_MODULE_2__.input.required(/* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "templateRef"
  }] : /* istanbul ignore next */[]));
  constructor() {}
  ngOnInit() {}
  static ɵfac = function ComponentNeedTemplateComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ComponentNeedTemplateComponent)();
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
    type: ComponentNeedTemplateComponent,
    selectors: [["app-component-need-template"]],
    inputs: {
      templateRef: [1, "templateRef"]
    },
    standalone: false,
    decls: 4,
    vars: 3,
    consts: [[4, "ngTemplateOutlet"], [4, "ngIf", "ngIfThen"]],
    template: function ComponentNeedTemplateComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](0, "ngTemplateOutlet\u63D2\u5165\n");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, ComponentNeedTemplateComponent_ng_container_1_Template, 1, 0, "ng-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "\nngIf \u63D2\u5165\n");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, ComponentNeedTemplateComponent_div_3_Template, 1, 0, "div", 1);
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngTemplateOutlet", ctx.templateRef());
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.templateRef())("ngIfThen", ctx.templateRef());;angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__.propertyChange(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]());
      }
    },
    dependencies: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_3__.NgIf, angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_3__.NgTemplateOutlet],
    encapsulation: 2
  });
}

/***/ },

/***/ 4245
/*!***********************************************************!*\
  !*** ./src/components/component1/component1.component.ts ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component1Component: () => (/* binding */ Component1Component)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram */ 241);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 9733);




class Component1Component {
  /** signal input，替代 @Input() */
  input1 = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.input)('', /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "input1"
  }] : /* istanbul ignore next */[]));
  constructor() {}
  ngOnInit() {}
  static ɵfac = function Component1Component_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Component1Component)();
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
    type: Component1Component,
    selectors: [["app-component1"]],
    inputs: {
      input1: [1, "input1"]
    },
    standalone: false,
    decls: 2,
    vars: 1,
    template: function Component1Component_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"]("\u663E\u793A\u4F20\u5165input1:", ctx.input1());;angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__.propertyChange(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]());
      }
    },
    encapsulation: 2
  });
}

/***/ },

/***/ 3384
/*!********************************************************!*\
  !*** ./src/components/component1/component1.module.ts ***!
  \********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component1Module: () => (/* binding */ Component1Module)
/* harmony export */ });
/* harmony import */ var angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular-miniprogram/common */ 9859);
/* harmony import */ var _component1_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component1.component */ 4245);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 9631);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 263);



class Component1Module {
  static ɵfac = function Component1Module_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Component1Module)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({
    type: Component1Module
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjector"]({
    imports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_0__.CommonModule]
  });
}
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsetNgModuleScope"](Component1Module, {
    declarations: [_component1_component__WEBPACK_IMPORTED_MODULE_1__.Component1Component],
    imports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_0__.CommonModule],
    exports: [_component1_component__WEBPACK_IMPORTED_MODULE_1__.Component1Component]
  });
})();

/***/ },

/***/ 2467
/*!***********************************************************!*\
  !*** ./src/components/component2/component2.component.ts ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component2Component: () => (/* binding */ Component2Component)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram */ 241);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 9733);
/* harmony import */ var _component1_component1_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../component1/component1.component */ 4245);





class Component2Component {
  cp2Input1 = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.input)('', /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "cp2Input1"
  }] : /* istanbul ignore next */[]));
  constructor() {}
  ngOnInit() {}
  static ɵfac = function Component2Component_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Component2Component)();
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
    type: Component2Component,
    selectors: [["app-component2"]],
    inputs: {
      cp2Input1: [1, "cp2Input1"]
    },
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[3, "input1"]],
    template: function Component2Component_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "app-component1", 0);
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("input1", ctx.cp2Input1());;angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__.propertyChange(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]());
      }
    },
    dependencies: [_component1_component1_component__WEBPACK_IMPORTED_MODULE_3__.Component1Component],
    encapsulation: 2
  });
}

/***/ },

/***/ 2561
/*!***********************************************************!*\
  !*** ./src/components/component3/component3.component.ts ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component3Component: () => (/* binding */ Component3Component)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram */ 241);



class Component3Component {
  tap1(event) {
    console.log('内置组件的tap事件', event);
  }
  tap2(event) {
    console.log('内置组件的(bind)tap事件', event);
  }
  constructor() {}
  ngOnInit() {}
  static ɵfac = function Component3Component_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Component3Component)();
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
    type: Component3Component,
    selectors: [["app-component3"]],
    hostBindings: function Component3Component_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("tap", function Component3Component_tap_HostBindingHandler($event) {
          return ctx.tap1($event);
        })("bindtap", function Component3Component_bindtap_HostBindingHandler($event) {
          return ctx.tap2($event);
        });
      }
    },
    decls: 2,
    vars: 0,
    template: function Component3Component_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdomElementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "component3 works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdomElementEnd"]();
      }if(rf & 2){angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__.propertyChange(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]());}
    },
    encapsulation: 2
  });
}

/***/ },

/***/ 11
/*!*****************************************************************!*\
  !*** ./src/components/content-multi/content-multi.component.ts ***!
  \*****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContentMultiComponent: () => (/* binding */ ContentMultiComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram */ 241);



const _c0 = [[["", "slot", "slot1"]], [["", "slot", "slot2"]]];
const _c1 = ["[slot='slot1']", "[slot='slot2']"];
class ContentMultiComponent {
  constructor() {}
  ngOnInit() {}
  static ɵfac = function ContentMultiComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ContentMultiComponent)();
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
    type: ContentMultiComponent,
    selectors: [["app-content-multi"]],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 10,
    vars: 0,
    template: function ContentMultiComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojectionDef"](_c0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "\u4E0B\u9762\u5C06\u4F1A\u6709\u6295\u5F71\u5185\u5BB9(\u591A)");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, "\u8FD9\u4E2A\u662Fslot1\u63D2\u69FD\u7684");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojection"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6, "\u8FD9\u4E2A\u662Fslot2\u63D2\u69FD\u7684");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojection"](7, 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](9, "---\u7ED3\u675F---");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
      }if(rf & 2){angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__.propertyChange(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]());}
    },
    encapsulation: 2
  });
}

/***/ },

/***/ 5587
/*!*****************************************************!*\
  !*** ./src/components/content/content.component.ts ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContentComponent: () => (/* binding */ ContentComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram */ 241);



const _c0 = ["*"];
class ContentComponent {
  constructor() {}
  ngOnInit() {}
  static ɵfac = function ContentComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ContentComponent)();
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
    type: ContentComponent,
    selectors: [["app-content"]],
    standalone: false,
    ngContentSelectors: _c0,
    decls: 3,
    vars: 0,
    template: function ContentComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojectionDef"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "\u4E0B\u9762\u5C06\u4F1A\u6709\u6295\u5F71\u5185\u5BB9");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojection"](2);
      }if(rf & 2){angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__.propertyChange(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]());}
    },
    encapsulation: 2
  });
}

/***/ },

/***/ 7234
/*!**************************************************!*\
  !*** ./src/components/content/content.module.ts ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContentModule: () => (/* binding */ ContentModule)
/* harmony export */ });
/* harmony import */ var angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular-miniprogram/common */ 9859);
/* harmony import */ var _content_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./content.component */ 5587);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 9631);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 263);



class ContentModule {
  static ɵfac = function ContentModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ContentModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({
    type: ContentModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjector"]({
    imports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_0__.CommonModule]
  });
}
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsetNgModuleScope"](ContentModule, {
    declarations: [_content_component__WEBPACK_IMPORTED_MODULE_1__.ContentComponent],
    imports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_0__.CommonModule],
    exports: [_content_component__WEBPACK_IMPORTED_MODULE_1__.ContentComponent]
  });
})();

/***/ },

/***/ 5735
/*!*********************************************************!*\
  !*** ./src/components/life-time/life-time.component.ts ***!
  \*********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LifeTimeComponent: () => (/* binding */ LifeTimeComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram */ 241);



class LifeTimeComponent {
  static mpComponentOptions = {
    lifetimes: {
      created: function () {
        console.log('created(component)');
      },
      attached: function () {
        console.log('attached(component)');
      },
      ready: function () {
        console.log('ready(component)');
      },
      moved: function () {
        console.log('moved(component)');
      },
      detached: function () {
        console.log('detached(component)');
      },
      error: function () {
        console.log('error(component)');
      }
    },
    pageLifetimes: {
      show: function () {
        console.log('page-show(component)');
      },
      hide: function () {
        console.log('page-hide(component)');
      },
      resize: function () {
        console.log('page-resize(component)');
      }
    }
  };
  constructor() {
    console.log('ng-constructor(component)');
  }
  ngOnInit() {
    console.log('ng-ngOnInit(component)');
  }
  ngAfterViewInit() {
    console.log('ng-ngAfterViewInit(component)');
  }
  ngAfterContentInit() {
    console.log('ng-ngAfterContentInit(component)');
  }
  static ɵfac = function LifeTimeComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LifeTimeComponent)();
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
    type: LifeTimeComponent,
    selectors: [["app-life-time-component"]],
    decls: 1,
    vars: 0,
    template: function LifeTimeComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](0, "\u7EC4\u4EF6\u751F\u547D\u5468\u671F\n");
      }if(rf & 2){angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__.propertyChange(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]());}
    },
    encapsulation: 2
  });
}

/***/ }

}]);