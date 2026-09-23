import { $ as ɵɵadvance, $t as Version, A as HostBinding, At as ɵɵproperty, B as Service, C as computed, Ct as ɵɵlistener, D as Directive, F as NgModule, G as isSubscribable, Gt as ɵɵtwoWayBindingSet, I as Optional, It as ɵɵsetNgModuleScope, J as ɵsetClassDebugInfo, Jt as DestroyRef, Kt as ɵɵtwoWayListener, L as Output, M as Inject, N as Injectable, O as ElementRef, P as Input, Q as ɵɵProvidersFeature, Qt as RuntimeError, R as Renderer2, St as ɵɵgetInheritedFactory, T as ApplicationRef, U as afterNextRender, V as SkipSelf, W as isPromise, X as ɵɵInheritDefinitionFeature, Xt as InjectionToken, Y as ɵɵControlFeature, Yt as EventEmitter, Z as ɵɵNgOnChangesFeature, Zt as Injector, _ as ChangeDetectorRef, _t as ɵɵelement, an as ɵɵdefineInjectable, at as ɵɵcontentQuery, bt as ɵɵelementStart, c as CommonModule, cn as from, ct as ɵɵdefineComponent, dn as Subject, dt as ɵɵdefineService, en as effect, et as ɵɵattribute, fn as createOperatorSubscriber, ft as ɵɵdirectiveInject, g as propertyChange, gn as __spreadArray, gt as ɵɵdomProperty, hn as __read, i as bootstrapPage, in as signal, jt as ɵɵqueryRefresh, k as Host, ln as innerFrom, lt as ɵɵdefineDirective, mn as Subscription, nn as forwardRef, on as ɵɵdefineInjector, ot as ɵɵcontrol, pn as Observable, q as setClassMetadata, qt as ɵɵtwoWayProperty, rn as inject, sn as map, st as ɵɵcontrolCreate, tn as formatRuntimeError, tt as ɵɵclassProp, un as popResultSelector, ut as ɵɵdefineNgModule, v as ContentChildren, w as untracked, wt as ɵɵloadQuery, xt as ɵɵgetCurrentView, y as booleanAttribute, yt as ɵɵelementEnd, z as Self } from "../../angular-miniprogram-CzfAskez.js";
//#region node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js
var isArray$1 = Array.isArray;
function callOrApply(fn, args) {
	return isArray$1(args) ? fn.apply(void 0, __spreadArray([], __read(args))) : fn(args);
}
function mapOneOrManyArgs(fn) {
	return map(function(args) {
		return callOrApply(fn, args);
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/argsArgArrayOrObject.js
var isArray = Array.isArray;
var getPrototypeOf = Object.getPrototypeOf;
var objectProto = Object.prototype;
var getKeys = Object.keys;
function argsArgArrayOrObject(args) {
	if (args.length === 1) {
		var first_1 = args[0];
		if (isArray(first_1)) return {
			args: first_1,
			keys: null
		};
		if (isPOJO(first_1)) {
			var keys = getKeys(first_1);
			return {
				args: keys.map(function(key) {
					return first_1[key];
				}),
				keys
			};
		}
	}
	return {
		args,
		keys: null
	};
}
function isPOJO(obj) {
	return obj && typeof obj === "object" && getPrototypeOf(obj) === objectProto;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/createObject.js
function createObject(keys, values) {
	return keys.reduce(function(result, key, i) {
		return result[key] = values[i], result;
	}, {});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/forkJoin.js
function forkJoin() {
	var args = [];
	for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
	var resultSelector = popResultSelector(args);
	var _a = argsArgArrayOrObject(args), sources = _a.args, keys = _a.keys;
	var result = new Observable(function(subscriber) {
		var length = sources.length;
		if (!length) {
			subscriber.complete();
			return;
		}
		var values = new Array(length);
		var remainingCompletions = length;
		var remainingEmissions = length;
		var _loop_1 = function(sourceIndex) {
			var hasValue = false;
			innerFrom(sources[sourceIndex]).subscribe(createOperatorSubscriber(subscriber, function(value) {
				if (!hasValue) {
					hasValue = true;
					remainingEmissions--;
				}
				values[sourceIndex] = value;
			}, function() {
				return remainingCompletions--;
			}, void 0, function() {
				if (!remainingCompletions || !hasValue) {
					if (!remainingEmissions) subscriber.next(keys ? createObject(keys, values) : values);
					subscriber.complete();
				}
			}));
		};
		for (var sourceIndex = 0; sourceIndex < length; sourceIndex++) _loop_1(sourceIndex);
	});
	return resultSelector ? result.pipe(mapOneOrManyArgs(resultSelector)) : result;
}
//#endregion
//#region dist/fesm2022/angular-miniprogram-forms.mjs
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* Base class for all ControlValueAccessor classes defined in Forms package.
* Contains common logic and utility functions.
*
* Note: this is an *internal-only* class and should not be extended or used directly in
* applications code.
*/
var BaseControlValueAccessor = class BaseControlValueAccessor {
	_renderer;
	_elementRef;
	/**
	* The registered callback function called when a change or input event occurs on the input
	* element.
	* @docs-private
	*/
	onChange = (_) => {};
	/**
	* The registered callback function called when a blur event occurs on the input element.
	* @docs-private
	*/
	onTouched = () => {};
	constructor(_renderer, _elementRef) {
		this._renderer = _renderer;
		this._elementRef = _elementRef;
	}
	/**
	* Helper method that sets a property on a target element using the current Renderer
	* implementation.
	* @docs-private
	*/
	setProperty(key, value) {
		this._renderer.setProperty(this._elementRef.nativeElement, key, value);
	}
	/**
	* Registers a function called when the control is touched.
	* @docs-private
	*/
	registerOnTouched(fn) {
		this.onTouched = fn;
	}
	/**
	* Registers a function called when the control value changes.
	* @docs-private
	*/
	registerOnChange(fn) {
		this.onChange = fn;
	}
	/**
	* Sets the "disabled" property on the range input element.
	* @docs-private
	*/
	setDisabledState(isDisabled) {
		this.setProperty("disabled", isDisabled);
	}
	static ɵfac = function BaseControlValueAccessor_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BaseControlValueAccessor)(ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ElementRef));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({ type: BaseControlValueAccessor });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(BaseControlValueAccessor, [{ type: Directive }], () => [{ type: Renderer2 }, { type: ElementRef }], null);
})();
/**
* Base class for all built-in ControlValueAccessor classes (except DefaultValueAccessor, which is
* used in case no other CVAs can be found). We use this class to distinguish between default CVA,
* built-in CVAs and custom CVAs, so that Forms logic can recognize built-in CVAs and treat custom
* ones with higher priority (when both built-in and custom CVAs are present).
*
* Note: this is an *internal-only* class and should not be extended or used directly in
* applications code.
*/
var BuiltInControlValueAccessor = class BuiltInControlValueAccessor extends BaseControlValueAccessor {
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵBuiltInControlValueAccessor_BaseFactory;
		return function BuiltInControlValueAccessor_Factory(__ngFactoryType__) {
			return (ɵBuiltInControlValueAccessor_BaseFactory || (ɵBuiltInControlValueAccessor_BaseFactory = ɵɵgetInheritedFactory(BuiltInControlValueAccessor)))(__ngFactoryType__ || BuiltInControlValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: BuiltInControlValueAccessor,
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(BuiltInControlValueAccessor, [{ type: Directive }], null, null);
})();
/**
* Used to provide a `ControlValueAccessor` for form controls.
*
* See `DefaultValueAccessor` for how to implement one.
*
* @publicApi
*/
var NG_VALUE_ACCESSOR = new InjectionToken(typeof wx.__global.ngDevMode !== "undefined" && wx.__global.ngDevMode ? "NgValueAccessor" : "");
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
var CHECKBOX_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => CheckBoxGroupValueAccessor),
	multi: true
};
var CheckBoxGroupValueAccessor = class CheckBoxGroupValueAccessor extends BuiltInControlValueAccessor {
	children;
	valueChange(list) {
		if (this.children) this.children.forEach((item) => {
			item.updateChecked(list.some((value) => value === item.value));
		});
		this.onChange(list);
	}
	writeValue(list) {
		if (this.children) this.children.forEach((item) => {
			item.updateChecked(list.some((value) => value === item.value));
		});
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵCheckBoxGroupValueAccessor_BaseFactory;
		return function CheckBoxGroupValueAccessor_Factory(__ngFactoryType__) {
			return (ɵCheckBoxGroupValueAccessor_BaseFactory || (ɵCheckBoxGroupValueAccessor_BaseFactory = ɵɵgetInheritedFactory(CheckBoxGroupValueAccessor)))(__ngFactoryType__ || CheckBoxGroupValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CheckBoxGroupValueAccessor,
		selectors: [
			[
				"checkbox-group",
				"formControlName",
				""
			],
			[
				"checkbox-group",
				"formControl",
				""
			],
			[
				"checkbox-group",
				"ngModel",
				""
			]
		],
		contentQueries: function CheckBoxGroupValueAccessor_ContentQueries(rf, ctx, dirIndex) {
			if (rf & 1) ɵɵcontentQuery(dirIndex, CheckboxControl, 5);
			if (rf & 2) {
				let _t;
				ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.children = _t);
			}
		},
		hostBindings: function CheckBoxGroupValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("bindchange", function CheckBoxGroupValueAccessor_bindchange_HostBindingHandler($event) {
				return ctx.valueChange($event.detail.value);
			});
		},
		standalone: false,
		features: [ɵɵProvidersFeature([CHECKBOX_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(CheckBoxGroupValueAccessor, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "checkbox-group[formControlName],checkbox-group[formControl],checkbox-group[ngModel]",
			host: { "(bindchange)": "valueChange($event.detail.value)" },
			providers: [CHECKBOX_VALUE_ACCESSOR]
		}]
	}], null, { children: [{
		type: ContentChildren,
		args: [forwardRef(() => CheckboxControl), { descendants: true }]
	}] });
})();
/**
* @description
* A `ControlValueAccessor` for writing a value and listening to changes on a checkbox input
* element.
*
* @usageNotes
*
* ### Using a checkbox with a reactive form.
*
* The following example shows how to use a checkbox with a reactive form.
*
* ```ts
* const rememberLoginControl = new FormControl();
* ```
*
* ```
* <input type="checkbox" [formControl]="rememberLoginControl">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var CheckboxControl = class CheckboxControl {
	elementRef;
	renderer;
	/**
	* @description
	* Tracks the value of the radio input element
	*/
	value;
	checked;
	constructor(elementRef, renderer) {
		this.elementRef = elementRef;
		this.renderer = renderer;
	}
	updateChecked(value) {
		this.renderer.setProperty(this.elementRef.nativeElement, "checked", value);
	}
	static ɵfac = function CheckboxControl_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || CheckboxControl)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CheckboxControl,
		selectors: [["checkbox"]],
		hostVars: 2,
		hostBindings: function CheckboxControl_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵdomProperty("value", ctx.value)("checked", ctx.checked);
		},
		inputs: { value: "value" },
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(CheckboxControl, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "checkbox",
			host: {}
		}]
	}], () => [{ type: ElementRef }, { type: Renderer2 }], {
		value: [{
			type: HostBinding,
			args: ["value"]
		}, { type: Input }],
		checked: [{
			type: HostBinding,
			args: ["checked"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
var DEFAULT_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => DefaultValueAccessor),
	multi: true
};
new InjectionToken("CompositionEventMode");
/**
* The default `ControlValueAccessor` for writing a value and listening to changes on input
* elements. The accessor is used by the `FormControlDirective`, `FormControlName`, and
* `NgModel` directives.
*
* {@searchKeywords ngDefaultControl}
*
* @usageNotes
*
* ### Using the default value accessor
*
* The following example shows how to use an input element that activates the default value accessor
* (in this case, a text field).
*
* ```ts
* const firstNameControl = new FormControl();
* ```
*
* ```
* <input type="text" [formControl]="firstNameControl">
* ```
*
* This value accessor is used by default for `<input type="text">` and `<textarea>` elements, but
* you could also use it for custom components that have similar behavior and do not require special
* processing. In order to attach the default value accessor to a custom element, add the
* `ngDefaultControl` attribute as shown below.
*
* ```
* <custom-input-component ngDefaultControl [(ngModel)]="value"></custom-input-component>
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var DefaultValueAccessor = class DefaultValueAccessor extends BaseControlValueAccessor {
	value;
	disabled;
	constructor(renderer, elementRef) {
		super(renderer, elementRef);
	}
	/**
	* Sets the "value" property on the input element.
	* @nodoc
	*/
	writeValue(value) {
		const normalizedValue = value == null ? void 0 : value;
		if (typeof normalizedValue !== "undefined") this.setProperty("value", normalizedValue);
	}
	valueChange(value) {
		this.onChange(value);
	}
	static ɵfac = function DefaultValueAccessor_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || DefaultValueAccessor)(ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ElementRef));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: DefaultValueAccessor,
		selectors: [
			[
				"input",
				"formControlName",
				""
			],
			[
				"textarea",
				"formControlName",
				""
			],
			[
				"input",
				"formControl",
				""
			],
			[
				"textarea",
				"formControl",
				""
			],
			[
				"input",
				"ngModel",
				""
			],
			[
				"textarea",
				"ngModel",
				""
			],
			[
				"",
				"ngDefaultControl",
				""
			]
		],
		hostVars: 2,
		hostBindings: function DefaultValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("bindinput", function DefaultValueAccessor_bindinput_HostBindingHandler($event) {
				return ctx.valueChange($event.detail.value);
			})("bindblur", function DefaultValueAccessor_bindblur_HostBindingHandler() {
				return ctx.onTouched();
			});
			if (rf & 2) ɵɵdomProperty("value", ctx.value)("disabled", ctx.disabled);
		},
		standalone: false,
		features: [ɵɵProvidersFeature([DEFAULT_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(DefaultValueAccessor, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "input[formControlName],textarea[formControlName],input[formControl],textarea[formControl],input[ngModel],textarea[ngModel],[ngDefaultControl]",
			host: {
				"(bindinput)": "valueChange($event.detail.value)",
				"(bindblur)": "onTouched()"
			},
			providers: [DEFAULT_VALUE_ACCESSOR]
		}]
	}], () => [{ type: Renderer2 }, { type: ElementRef }], {
		value: [{
			type: HostBinding,
			args: ["value"]
		}],
		disabled: [{
			type: HostBinding,
			args: ["disabled"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var formControlNameExample = `
  <div [formGroup]="myGroup">
    <input formControlName="firstName">
  </div>

  In your class:

  this.myGroup = new FormGroup({
      firstName: new FormControl()
  });`;
var formGroupNameExample = `
  <div [formGroup]="myGroup">
      <div formGroupName="person">
        <input formControlName="firstName">
      </div>
  </div>

  In your class:

  this.myGroup = new FormGroup({
      person: new FormGroup({ firstName: new FormControl() })
  });`;
var formArrayNameExample = `
  <div [formGroup]="myGroup">
    <div formArrayName="cities">
      <div *ngFor="let city of cityArray.controls; index as i">
        <input [formControlName]="i">
      </div>
    </div>
  </div>

  In your class:

  this.cityArray = new FormArray([new FormControl('SF')]);
  this.myGroup = new FormGroup({
    cities: this.cityArray
  });`;
var ngModelGroupExample = `
  <form>
      <div ngModelGroup="person">
        <input [(ngModel)]="person.name" name="firstName">
      </div>
  </form>`;
var ngModelWithFormGroupExample = `
  <div [formGroup]="myGroup">
      <input formControlName="firstName">
      <input [(ngModel)]="showMoreControls" [ngModelOptions]="{standalone: true}">
  </div>
`;
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* @module
* @description
* Entry point for all public APIs of the forms package.
*/
/**
* @publicApi
*/
var VERSION = /* @__PURE__ */ new Version("0.0.0-PLACEHOLDER");
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
function controlParentException(nameOrIndex) {
	return new RuntimeError(1050, `formControlName must be used with a parent formGroup or formArray directive. You'll want to add a formGroup/formArray
      directive and pass it an existing FormGroup/FormArray instance (you can create one in your class).

      ${describeFormControl(nameOrIndex)}

    Example:

    ${formControlNameExample}`);
}
function describeFormControl(nameOrIndex) {
	if (nameOrIndex == null || nameOrIndex === "") return "";
	return `Affected Form Control ${typeof nameOrIndex === "string" ? "name" : "index"}: "${nameOrIndex}"`;
}
function ngModelGroupException() {
	return new RuntimeError(1051, `formControlName cannot be used with an ngModelGroup parent. It is only compatible with parents
      that also have a "form" prefix: formGroupName, formArrayName, or formGroup.

      Option 1:  Update the parent to be formGroupName (reactive form strategy)

      ${formGroupNameExample}

      Option 2: Use ngModel instead of formControlName (template-driven strategy)

      ${ngModelGroupExample}`);
}
function missingFormException() {
	return new RuntimeError(1052, `formGroup expects a FormGroup instance. Please pass one in.

      Example:

      ${formControlNameExample}`);
}
function groupParentException() {
	return new RuntimeError(1053, `formGroupName must be used with a parent formGroup directive.  You'll want to add a formGroup
    directive and pass it an existing FormGroup instance (you can create one in your class).

    Example:

    ${formGroupNameExample}`);
}
function arrayParentException() {
	return new RuntimeError(1054, `formArrayName must be used with a parent formGroup directive.  You'll want to add a formGroup
      directive and pass it an existing FormGroup instance (you can create one in your class).

      Example:

      ${formArrayNameExample}`);
}
var disabledAttrWarning = `
  It looks like you're using the disabled attribute with a reactive form directive. If you set disabled to true
  when you set up this control in your component class, the disabled attribute will actually be set in the DOM for
  you. We recommend using this approach to avoid 'changed after checked' errors.

  Example:
  // Specify the \`disabled\` property at control creation time:
  form = new FormGroup({
    first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),
    last: new FormControl('Drew', Validators.required)
  });

  // Controls can also be enabled/disabled after creation:
  form.get('first')?.enable();
  form.get('last')?.disable();
`;
var asyncValidatorsDroppedWithOptsWarning = `
  It looks like you're constructing using a FormControl with both an options argument and an
  async validators argument. Mixing these arguments will cause your async validators to be dropped.
  You should either put all your validators in the options object, or in separate validators
  arguments. For example:

  // Using validators arguments
  fc = new FormControl(42, Validators.required, myAsyncValidator);

  // Using AbstractControlOptions
  fc = new FormControl(42, {validators: Validators.required, asyncValidators: myAV});

  // Do NOT mix them: async validators will be dropped!
  fc = new FormControl(42, {validators: Validators.required}, /* Oops! */ myAsyncValidator);
`;
function ngModelWarning(directiveName) {
	return `
  It looks like you're using ngModel on the same form field as ${directiveName}.
  Support for using the ngModel input property and ngModelChange event with
  reactive form directives has been deprecated in Angular v6 and will be removed
  in a future version of Angular.

  For more information on this, see our API docs here:
  https://${VERSION.major !== "0" ? `v${VERSION.major}.` : ""}angular.dev/api/forms/${directiveName === "formControl" ? "FormControlDirective" : "FormControlName"}
  `;
}
function describeKey(isFormGroup, key) {
	return isFormGroup ? `with name: '${key}'` : `at index: ${key}`;
}
function noControlsError(isFormGroup) {
	return `
    There are no form controls registered with this ${isFormGroup ? "group" : "array"} yet. If you're using ngModel,
    you may want to check next tick (e.g. use setTimeout).
  `;
}
function missingControlError(isFormGroup, key) {
	return `Cannot find form control ${describeKey(isFormGroup, key)}`;
}
function missingControlValueError(isFormGroup, key) {
	return `Must supply a value for form control ${describeKey(isFormGroup, key)}`;
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
function isEmptyInputValue(value) {
	return value == null || lengthOrSize(value) === 0;
}
/**
* Extract the length property in case it's an array or a string.
* Extract the size property in case it's a set.
* Return null else.
* @param value Either an array, set or undefined.
*/
function lengthOrSize(value) {
	if (value == null) return null;
	else if (Array.isArray(value) || typeof value === "string") return value.length;
	else if (value instanceof Set) return value.size;
	return null;
}
/**
* @description
* An `InjectionToken` for registering additional synchronous validators used with
* `AbstractControl`s.
*
* @see {@link NG_ASYNC_VALIDATORS}
*
* @usageNotes
*
* ### Providing a custom validator
*
* The following example registers a custom validator directive. Adding the validator to the
* existing collection of validators requires the `multi: true` option.
*
* ```ts
* @Directive({
*   selector: '[customValidator]',
*   providers: [{provide: NG_VALIDATORS, useExisting: forwardRef(() => CustomValidatorDirective), multi: true}]
* })
* class CustomValidatorDirective implements Validator {
*   validate(control: AbstractControl): ValidationErrors | null {
*     return { 'custom': true };
*   }
* }
* ```
*
* @see [Defining custom validators](guide/forms/form-validation#defining-custom-validators)
*
* @publicApi
*/
var NG_VALIDATORS = new InjectionToken(typeof wx.__global.ngDevMode !== "undefined" && wx.__global.ngDevMode ? "NgValidators" : "");
/**
* @description
* An `InjectionToken` for registering additional asynchronous validators used with
* `AbstractControl`s.
*
* @see {@link NG_VALIDATORS}
*
* @usageNotes
*
* ### Provide a custom async validator directive
*
* The following example implements the `AsyncValidator` interface to create an
* async validator directive with a custom error key.
*
* ```ts
* @Directive({
*   selector: '[customAsyncValidator]',
*   providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: CustomAsyncValidatorDirective, multi:
* true}]
* })
* class CustomAsyncValidatorDirective implements AsyncValidator {
*   validate(control: AbstractControl): Promise<ValidationErrors|null> {
*     return Promise.resolve({'custom': true});
*   }
* }
* ```
*
* @see [Implementing a custom async validator](guide/forms/form-validation#implementing-a-custom-async-validator)
*
* @publicApi
*/
var NG_ASYNC_VALIDATORS = new InjectionToken(typeof wx.__global.ngDevMode !== "undefined" && wx.__global.ngDevMode ? "NgAsyncValidators" : "");
/**
* A regular expression that matches valid e-mail addresses.
*
* At a high level, this regexp matches e-mail addresses of the format `local-part@tld`, where:
* - `local-part` consists of one or more of the allowed characters (alphanumeric and some
*   punctuation symbols).
* - `local-part` cannot begin or end with a period (`.`).
* - `local-part` cannot be longer than 64 characters.
* - `tld` consists of one or more `labels` separated by periods (`.`). For example `localhost` or
*   `foo.com`.
* - A `label` consists of one or more of the allowed characters (alphanumeric, dashes (`-`) and
*   periods (`.`)).
* - A `label` cannot begin or end with a dash (`-`) or a period (`.`).
* - A `label` cannot be longer than 63 characters.
* - The whole address cannot be longer than 254 characters.
*
* ## Implementation background
*
* This regexp was ported over from AngularJS (see there for git history):
* https://github.com/angular/angular.js/blob/c133ef836/src/ng/directive/input.js#L27
* It is based on the
* [WHATWG version](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) with
* some enhancements to incorporate more RFC rules (such as rules related to domain names and the
* lengths of different parts of the address). The main differences from the WHATWG version are:
*   - Disallow `local-part` to begin or end with a period (`.`).
*   - Disallow `local-part` length to exceed 64 characters.
*   - Disallow total address length to exceed 254 characters.
*
* See [this commit](https://github.com/angular/angular.js/commit/f3f5cf72e) for more details.
*/
var EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
/**
* @description
* Provides a set of built-in validators that can be used by form controls.
*
* A validator is a function that processes a `FormControl` or collection of
* controls and returns an error map or null. A null map means that validation has passed.
*
* @see [Form Validation](guide/forms/form-validation)
*
* @publicApi
*/
var Validators = class {
	/**
	* @description
	* Validator that requires the control's value to be greater than or equal to the provided number.
	*
	* @usageNotes
	*
	* ### Validate against a minimum of 3
	*
	* ```ts
	* const control = new FormControl(2, Validators.min(3));
	*
	* console.log(control.errors); // {min: {min: 3, actual: 2}}
	* ```
	*
	* @returns A validator function that returns an error map with the
	* `min` property if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static min(min) {
		return minValidator(min);
	}
	/**
	* @description
	* Validator that requires the control's value to be less than or equal to the provided number.
	*
	* @usageNotes
	*
	* ### Validate against a maximum of 15
	*
	* ```ts
	* const control = new FormControl(16, Validators.max(15));
	*
	* console.log(control.errors); // {max: {max: 15, actual: 16}}
	* ```
	*
	* @returns A validator function that returns an error map with the
	* `max` property if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static max(max) {
		return maxValidator(max);
	}
	/**
	* @description
	* Validator that requires the control have a non-empty value.
	*
	* @usageNotes
	*
	* ### Validate that the field is non-empty
	*
	* ```ts
	* const control = new FormControl('', Validators.required);
	*
	* console.log(control.errors); // {required: true}
	* ```
	*
	* @returns An error map with the `required` property
	* if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static required(control) {
		return requiredValidator(control);
	}
	/**
	* @description
	* Validator that requires the control's value be true. This validator is commonly
	* used for required checkboxes.
	*
	* @usageNotes
	*
	* ### Validate that the field value is true
	*
	* ```ts
	* const control = new FormControl('some value', Validators.requiredTrue);
	*
	* console.log(control.errors); // {required: true}
	* ```
	*
	* @returns An error map that contains the `required` property
	* set to `true` if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static requiredTrue(control) {
		return requiredTrueValidator(control);
	}
	/**
	* @description
	* Validator that requires the control's value pass an email validation test.
	*
	* Tests the value using a [regular
	* expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
	* pattern suitable for common use cases. The pattern is based on the definition of a valid email
	* address in the [WHATWG HTML
	* specification](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) with
	* some enhancements to incorporate more RFC rules (such as rules related to domain names and the
	* lengths of different parts of the address).
	*
	* The differences from the WHATWG version include:
	* - Disallow `local-part` (the part before the `@` symbol) to begin or end with a period (`.`).
	* - Disallow `local-part` to be longer than 64 characters.
	* - Disallow the whole address to be longer than 254 characters.
	*
	* If this pattern does not satisfy your business needs, you can use `Validators.pattern()` to
	* validate the value against a different pattern.
	*
	* @usageNotes
	*
	* ### Validate that the field matches a valid email pattern
	*
	* ```ts
	* const control = new FormControl('bad@', Validators.email);
	*
	* console.log(control.errors); // {email: true}
	* ```
	*
	* @returns An error map with the `email` property
	* if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static email(control) {
		return emailValidator(control);
	}
	/**
	* @description
	* Validator that requires the number of items in the control's value to be greater than or equal
	* to the provided minimum length. This validator is also provided by default if you use
	* the HTML5 `minlength` attribute. Note that the `minLength` validator is intended to be used
	* only for types that have a numeric `length` or `size` property, such as strings, arrays or
	* sets. The `minLength` validator logic is also not invoked for values when their `length` or
	* `size` property is 0 (for example in case of an empty string or an empty array), to support
	* optional controls. You can use the standard `required` validator if empty values should not be
	* considered valid.
	*
	* @usageNotes
	*
	* ### Validate that the field has a minimum of 3 characters
	*
	* ```ts
	* const control = new FormControl('ng', Validators.minLength(3));
	*
	* console.log(control.errors); // {minlength: {requiredLength: 3, actualLength: 2}}
	* ```
	*
	* ```html
	* <input minlength="5">
	* ```
	*
	* @returns A validator function that returns an error map with the
	* `minlength` property if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static minLength(minLength) {
		return minLengthValidator(minLength);
	}
	/**
	* @description
	* Validator that requires the number of items in the control's value to be less than or equal
	* to the provided maximum length. This validator is also provided by default if you use
	* the HTML5 `maxlength` attribute. Note that the `maxLength` validator is intended to be used
	* only for types that have a numeric `length` or `size` property, such as strings, arrays or
	* sets.
	*
	* @usageNotes
	*
	* ### Validate that the field has maximum of 5 characters
	*
	* ```ts
	* const control = new FormControl('Angular', Validators.maxLength(5));
	*
	* console.log(control.errors); // {maxlength: {requiredLength: 5, actualLength: 7}}
	* ```
	*
	* ```html
	* <input maxlength="5">
	* ```
	*
	* @returns A validator function that returns an error map with the
	* `maxlength` property if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static maxLength(maxLength) {
		return maxLengthValidator(maxLength);
	}
	/**
	* @description
	* Validator that requires the control's value to match a regex pattern. This validator is also
	* provided by default if you use the HTML5 `pattern` attribute.
	*
	* @usageNotes
	*
	* ### Validate that the field only contains letters or spaces
	*
	* ```ts
	* const control = new FormControl('1', Validators.pattern('[a-zA-Z ]*'));
	*
	* console.log(control.errors); // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
	* ```
	*
	* ```html
	* <input pattern="[a-zA-Z ]*">
	* ```
	*
	* ### Pattern matching with the global or sticky flag
	*
	* `RegExp` objects created with the `g` or `y` flags that are passed into `Validators.pattern`
	* can produce different results on the same input when validations are run consecutively. This is
	* due to how the behavior of `RegExp.prototype.test` is
	* specified in [ECMA-262](https://tc39.es/ecma262/#sec-regexpbuiltinexec)
	* (`RegExp` preserves the index of the last match when the global or sticky flag is used).
	* Due to this behavior, it is recommended that when using
	* `Validators.pattern` you **do not** pass in a `RegExp` object with either the global or sticky
	* flag enabled.
	*
	* ```ts
	* // Not recommended (since the `g` flag is used)
	* const controlOne = new FormControl('1', Validators.pattern(/foo/g));
	*
	* // Good
	* const controlTwo = new FormControl('1', Validators.pattern(/foo/));
	* ```
	*
	* @param pattern A regular expression to be used as is to test the values, or a string.
	* If a string is passed, the `^` character is prepended and the `$` character is
	* appended to the provided string (if not already present), and the resulting regular
	* expression is used to test the values.
	*
	* @returns A validator function that returns an error map with the
	* `pattern` property if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static pattern(pattern) {
		return patternValidator(pattern);
	}
	/**
	* @description
	* Validator that performs no operation.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static nullValidator(control) {
		return nullValidator(control);
	}
	static compose(validators) {
		return compose(validators);
	}
	/**
	* @description
	* Compose multiple async validators into a single function that returns the union
	* of the individual error objects for the provided control.
	*
	* @returns A validator function that returns an error map with the
	* merged error objects of the async validators if the validation check fails, otherwise `null`.
	*
	* @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
	*
	*/
	static composeAsync(validators) {
		return composeAsync(validators);
	}
};
/**
* Validator that requires the control's value to be greater than or equal to the provided number.
* See `Validators.min` for additional information.
*/
function minValidator(min) {
	return (control) => {
		if (control.value == null || min == null) return null;
		const value = parseFloat(control.value);
		return !isNaN(value) && value < min ? { "min": {
			"min": min,
			"actual": control.value
		} } : null;
	};
}
/**
* Validator that requires the control's value to be less than or equal to the provided number.
* See `Validators.max` for additional information.
*/
function maxValidator(max) {
	return (control) => {
		if (control.value == null || max == null) return null;
		const value = parseFloat(control.value);
		return !isNaN(value) && value > max ? { "max": {
			"max": max,
			"actual": control.value
		} } : null;
	};
}
/**
* Validator that requires the control have a non-empty value.
* See `Validators.required` for additional information.
*/
function requiredValidator(control) {
	return isEmptyInputValue(control.value) ? { "required": true } : null;
}
/**
* Validator that requires the control's value be true. This validator is commonly
* used for required checkboxes.
* See `Validators.requiredTrue` for additional information.
*/
function requiredTrueValidator(control) {
	return control.value === true ? null : { "required": true };
}
/**
* Validator that requires the control's value pass an email validation test.
* See `Validators.email` for additional information.
*/
function emailValidator(control) {
	if (isEmptyInputValue(control.value)) return null;
	return EMAIL_REGEXP.test(control.value) ? null : { "email": true };
}
/**
* Validator that requires the number of items in the control's value to be greater than or equal
* to the provided minimum length. See `Validators.minLength` for additional information.
*
* The minLengthValidator respects every length property in an object, regardless of whether it's an array.
* For example, the object {id: 1, length: 0, width: 0} should be validated.
*/
function minLengthValidator(minLength) {
	return (control) => {
		const length = control.value?.length ?? lengthOrSize(control.value);
		if (length === null || length === 0) return null;
		return length < minLength ? { "minlength": {
			"requiredLength": minLength,
			"actualLength": length
		} } : null;
	};
}
/**
* Validator that requires the number of items in the control's value to be less than or equal
* to the provided maximum length. See `Validators.maxLength` for additional information.
*
* The maxLengthValidator respects every length property in an object, regardless of whether it's an array.
* For example, the object {id: 1, length: 0, width: 0} should be validated.
*/
function maxLengthValidator(maxLength) {
	return (control) => {
		const length = control.value?.length ?? lengthOrSize(control.value);
		if (length !== null && length > maxLength) return { "maxlength": {
			"requiredLength": maxLength,
			"actualLength": length
		} };
		return null;
	};
}
/**
* Validator that requires the control's value to match a regex pattern.
* See `Validators.pattern` for additional information.
*/
function patternValidator(pattern) {
	if (!pattern) return nullValidator;
	let regex;
	let regexStr;
	if (typeof pattern === "string") {
		regexStr = "";
		if (pattern.charAt(0) !== "^") regexStr += "^";
		regexStr += pattern;
		if (pattern.charAt(pattern.length - 1) !== "$") regexStr += "$";
		regex = new RegExp(regexStr);
	} else {
		regexStr = pattern.toString();
		regex = pattern;
	}
	return (control) => {
		if (isEmptyInputValue(control.value)) return null;
		const value = control.value;
		return regex.test(value) ? null : { "pattern": {
			"requiredPattern": regexStr,
			"actualValue": value
		} };
	};
}
/**
* Function that has `ValidatorFn` shape, but performs no operation.
*/
function nullValidator(control) {
	return null;
}
function isPresent(o) {
	return o != null;
}
function toObservable(value) {
	const obs = isPromise(value) ? from(value) : value;
	if ((typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && !isSubscribable(obs)) {
		let errorMessage = `Expected async validator to return Promise or Observable.`;
		if (typeof value === "object") errorMessage += " Are you using a synchronous validator where an async validator is expected?";
		throw new RuntimeError(-1101, errorMessage);
	}
	return obs;
}
function mergeErrors(arrayOfErrors) {
	let res = {};
	arrayOfErrors.forEach((errors) => {
		res = errors != null ? {
			...res,
			...errors
		} : res;
	});
	return Object.keys(res).length === 0 ? null : res;
}
function executeValidators(control, validators) {
	return validators.map((validator) => validator(control));
}
function isValidatorFn(validator) {
	return !validator.validate;
}
/**
* Given the list of validators that may contain both functions as well as classes, return the list
* of validator functions (convert validator classes into validator functions). This is needed to
* have consistent structure in validators list before composing them.
*
* @param validators The set of validators that may contain validators both in plain function form
*     as well as represented as a validator class.
*/
function normalizeValidators(validators) {
	return validators.map((validator) => {
		return isValidatorFn(validator) ? validator : ((c) => validator.validate(c));
	});
}
/**
* Merges synchronous validators into a single validator function.
* See `Validators.compose` for additional information.
*/
function compose(validators) {
	if (!validators) return null;
	const presentValidators = validators.filter(isPresent);
	if (presentValidators.length == 0) return null;
	return function(control) {
		return mergeErrors(executeValidators(control, presentValidators));
	};
}
/**
* Accepts a list of validators of different possible shapes (`Validator` and `ValidatorFn`),
* normalizes the list (converts everything to `ValidatorFn`) and merges them into a single
* validator function.
*/
function composeValidators(validators) {
	return validators != null ? compose(normalizeValidators(validators)) : null;
}
/**
* Merges asynchronous validators into a single validator function.
* See `Validators.composeAsync` for additional information.
*/
function composeAsync(validators) {
	if (!validators) return null;
	const presentValidators = validators.filter(isPresent);
	if (presentValidators.length == 0) return null;
	return function(control) {
		return forkJoin(executeValidators(control, presentValidators).map(toObservable)).pipe(map(mergeErrors));
	};
}
/**
* Accepts a list of async validators of different possible shapes (`AsyncValidator` and
* `AsyncValidatorFn`), normalizes the list (converts everything to `AsyncValidatorFn`) and merges
* them into a single validator function.
*/
function composeAsyncValidators(validators) {
	return validators != null ? composeAsync(normalizeValidators(validators)) : null;
}
/**
* Merges raw control validators with a given directive validator and returns the combined list of
* validators as an array.
*/
function mergeValidators(controlValidators, dirValidator) {
	if (controlValidators === null) return [dirValidator];
	return Array.isArray(controlValidators) ? [...controlValidators, dirValidator] : [controlValidators, dirValidator];
}
/**
* Retrieves the list of raw synchronous validators attached to a given control.
*/
function getControlValidators(control) {
	return control._rawValidators;
}
/**
* Retrieves the list of raw asynchronous validators attached to a given control.
*/
function getControlAsyncValidators(control) {
	return control._rawAsyncValidators;
}
/**
* Accepts a singleton validator, an array, or null, and returns an array type with the provided
* validators.
*
* @param validators A validator, validators, or null.
* @returns A validators array.
*/
function makeValidatorsArray(validators) {
	if (!validators) return [];
	return Array.isArray(validators) ? validators : [validators];
}
/**
* Determines whether a validator or validators array has a given validator.
*
* @param validators The validator or validators to compare against.
* @param validator The validator to check.
* @returns Whether the validator is present.
*/
function hasValidator(validators, validator) {
	return Array.isArray(validators) ? validators.includes(validator) : validators === validator;
}
/**
* Combines two arrays of validators into one. If duplicates are provided, only one will be added.
*
* @param validators The new validators.
* @param currentValidators The base array of current validators.
* @returns An array of validators.
*/
function addValidators(validators, currentValidators) {
	const current = makeValidatorsArray(currentValidators);
	makeValidatorsArray(validators).forEach((v) => {
		if (!hasValidator(current, v)) current.push(v);
	});
	return current;
}
function removeValidators(validators, currentValidators) {
	return makeValidatorsArray(currentValidators).filter((v) => !hasValidator(validators, v));
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* Reports that a control is valid, meaning that no errors exist in the input value.
*
* @see {@link status}
*/
var VALID = "VALID";
/**
* Reports that a control is invalid, meaning that an error exists in the input value.
*
* @see {@link status}
*/
var INVALID = "INVALID";
/**
* Reports that a control is pending, meaning that async validation is occurring and
* errors are not yet available for the input value.
*
* @see {@link markAsPending}
* @see {@link status}
*/
var PENDING = "PENDING";
/**
* Reports that a control is disabled, meaning that the control is exempt from ancestor
* calculations of validity or value.
*
* @see {@link markAsDisabled}
* @see {@link status}
*/
var DISABLED = "DISABLED";
/**
* Base class for every event sent by `AbstractControl.events()`
*
* @publicApi
*/
var ControlEvent = class {};
/**
* Event fired when the value of a control changes.
*
* @see {@link AbstractControl.events}
*
* @publicApi
*/
var ValueChangeEvent = class extends ControlEvent {
	value;
	source;
	constructor(value, source) {
		super();
		this.value = value;
		this.source = source;
	}
};
/**
* Event fired when the control's pristine state changes (pristine <=> dirty).
*
* @see {@link AbstractControl.events}
*
* @publicApi */
var PristineChangeEvent = class extends ControlEvent {
	pristine;
	source;
	constructor(pristine, source) {
		super();
		this.pristine = pristine;
		this.source = source;
	}
};
/**
* Event fired when the control's touched status changes (touched <=> untouched).
*
* @see {@link AbstractControl.events}
*
* @publicApi
*/
var TouchedChangeEvent = class extends ControlEvent {
	touched;
	source;
	constructor(touched, source) {
		super();
		this.touched = touched;
		this.source = source;
	}
};
/**
* Event fired when the control's status changes.
*
* @see {@link AbstractControl.events}
*
* @publicApi
*/
var StatusChangeEvent = class extends ControlEvent {
	status;
	source;
	constructor(status, source) {
		super();
		this.status = status;
		this.source = source;
	}
};
/**
* Event fired when a form is submitted
*
* @see {@link AbstractControl.events}
*
* @publicApi
*/
var FormSubmittedEvent = class extends ControlEvent {
	source;
	constructor(source) {
		super();
		this.source = source;
	}
};
/**
* Event fired when a form is reset.
*
* @see {@link AbstractControl.events}
*
* @publicApi
*/
var FormResetEvent = class extends ControlEvent {
	source;
	constructor(source) {
		super();
		this.source = source;
	}
};
/**
* Gets validators from either an options object or given validators.
*/
function pickValidators(validatorOrOpts) {
	return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.validators : validatorOrOpts) || null;
}
/**
* Creates validator function by combining provided validators.
*/
function coerceToValidator(validator) {
	return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}
/**
* Gets async validators from either an options object or given validators.
*/
function pickAsyncValidators(asyncValidator, validatorOrOpts) {
	if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) {
		if (isOptionsObj(validatorOrOpts) && asyncValidator) console.warn(asyncValidatorsDroppedWithOptsWarning);
	}
	return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.asyncValidators : asyncValidator) || null;
}
/**
* Creates async validator function by combining provided async validators.
*/
function coerceToAsyncValidator(asyncValidator) {
	return Array.isArray(asyncValidator) ? composeAsyncValidators(asyncValidator) : asyncValidator || null;
}
function isOptionsObj(validatorOrOpts) {
	return validatorOrOpts != null && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === "object";
}
function assertControlPresent(parent, isGroup, key) {
	const controls = parent.controls;
	if (!(isGroup ? Object.keys(controls) : controls).length) throw new RuntimeError(1e3, typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode ? noControlsError(isGroup) : "");
	if (!hasOwnControl(controls, key)) throw new RuntimeError(1001, typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode ? missingControlError(isGroup, key) : "");
}
function assertAllValuesPresent(control, isGroup, value) {
	control._forEachChild((_, key) => {
		if (value[key] === void 0) throw new RuntimeError(-1002, typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode ? missingControlValueError(isGroup, key) : "");
	});
}
/**
* This is the base class for `FormControl`, `FormGroup`, and `FormArray`.
*
* It provides some of the shared behavior that all controls and groups of controls have, like
* running validators, calculating status, and resetting state. It also defines the properties
* that are shared between all sub-classes, like `value`, `valid`, and `dirty`. It shouldn't be
* instantiated directly.
*
* The first type parameter TValue represents the value type of the control (`control.value`).
* The optional type parameter TRawValue  represents the raw value type (`control.getRawValue()`).
*
* @see [Forms Guide](guide/forms)
* @see [Reactive Forms Guide](guide/forms/reactive-forms)
* @see [Dynamic Forms Guide](guide/forms/dynamic-forms)
*
* @publicApi
*/
var AbstractControl = class {
	/** @internal */
	_pendingDirty = false;
	/**
	* Indicates that a control has its own pending asynchronous validation in progress.
	* It also stores if the control should emit events when the validation status changes.
	*
	* @internal
	*/
	_hasOwnPendingAsyncValidator = null;
	/** @internal */
	_pendingTouched = false;
	/** @internal */
	_onCollectionChange = () => {};
	/** @internal */
	_updateOn;
	/** @internal */
	_hasRequired = signal(false, ...wx.__global.ngDevMode ? [{ debugName: "_hasRequired" }] : /* istanbul ignore next */ []);
	_parent = null;
	_asyncValidationSubscription;
	/**
	* Contains the result of merging synchronous validators into a single validator function
	* (combined using `Validators.compose`).
	*
	* @internal
	*/
	_composedValidatorFn;
	/**
	* Contains the result of merging asynchronous validators into a single validator function
	* (combined using `Validators.composeAsync`).
	*
	* @internal
	*/
	_composedAsyncValidatorFn;
	/**
	* Synchronous validators as they were provided:
	*  - in `AbstractControl` constructor
	*  - as an argument while calling `setValidators` function
	*  - while calling the setter on the `validator` field (e.g. `control.validator = validatorFn`)
	*
	* @internal
	*/
	_rawValidators;
	/**
	* Asynchronous validators as they were provided:
	*  - in `AbstractControl` constructor
	*  - as an argument while calling `setAsyncValidators` function
	*  - while calling the setter on the `asyncValidator` field (e.g. `control.asyncValidator =
	* asyncValidatorFn`)
	*
	* @internal
	*/
	_rawAsyncValidators;
	/**
	* The current value of the control.
	*
	* * For a `FormControl`, the current value.
	* * For an enabled `FormGroup`, the values of enabled controls as an object
	* with a key-value pair for each member of the group.
	* * For a disabled `FormGroup`, the values of all controls as an object
	* with a key-value pair for each member of the group.
	* * For an enabled `FormArray`, the values of enabled controls as an array.
	* * For a disabled `FormArray`, the values of all controls as an array.
	*
	*/
	value;
	/**
	* Initialize the AbstractControl instance.
	*
	* @param validators The function or array of functions that is used to determine the validity of
	*     this control synchronously.
	* @param asyncValidators The function or array of functions that is used to determine validity of
	*     this control asynchronously.
	*/
	constructor(validators, asyncValidators) {
		this._assignValidators(validators);
		this._assignAsyncValidators(asyncValidators);
	}
	/**
	* Returns the function that is used to determine the validity of this control synchronously.
	* If multiple validators have been added, this will be a single composed function.
	* See `Validators.compose()` for additional information.
	*/
	get validator() {
		return this._composedValidatorFn;
	}
	set validator(validatorFn) {
		this._rawValidators = this._composedValidatorFn = validatorFn;
		this._updateHasRequiredValidator();
	}
	/**
	* Returns the function that is used to determine the validity of this control asynchronously.
	* If multiple validators have been added, this will be a single composed function.
	* See `Validators.compose()` for additional information.
	*/
	get asyncValidator() {
		return this._composedAsyncValidatorFn;
	}
	set asyncValidator(asyncValidatorFn) {
		this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
	}
	/**
	* The parent control.
	*/
	get parent() {
		return this._parent;
	}
	/**
	* The validation status of the control.
	*
	* @see {@link FormControlStatus}
	*
	* These status values are mutually exclusive, so a control cannot be
	* both valid AND invalid or invalid AND disabled.
	*/
	get status() {
		return untracked(this.statusReactive);
	}
	set status(v) {
		untracked(() => this.statusReactive.set(v));
	}
	/** @internal */
	_status = computed(() => this.statusReactive(), ...wx.__global.ngDevMode ? [{ debugName: "_status" }] : /* istanbul ignore next */ []);
	statusReactive = signal(void 0, ...wx.__global.ngDevMode ? [{ debugName: "statusReactive" }] : /* istanbul ignore next */ []);
	/**
	* A control is `valid` when its `status` is `VALID`.
	*
	* @see {@link AbstractControl.status}
	*
	* @returns True if the control has passed all of its validation tests,
	* false otherwise.
	*/
	get valid() {
		return this.status === VALID;
	}
	/**
	* A control is `invalid` when its `status` is `INVALID`.
	*
	* @see {@link AbstractControl.status}
	*
	* @returns True if this control has failed one or more of its validation checks,
	* false otherwise.
	*/
	get invalid() {
		return this.status === INVALID;
	}
	/**
	* A control is `pending` when its `status` is `PENDING`.
	*
	* @see {@link AbstractControl.status}
	*
	* @returns True if this control is in the process of conducting a validation check,
	* false otherwise.
	*/
	get pending() {
		return this.status === PENDING;
	}
	/**
	* A control is `disabled` when its `status` is `DISABLED`.
	*
	* Disabled controls are exempt from validation checks and
	* are not included in the aggregate value of their ancestor
	* controls.
	*
	* @see {@link AbstractControl.status}
	*
	* @returns True if the control is disabled, false otherwise.
	*/
	get disabled() {
		return this.status === DISABLED;
	}
	/**
	* A control is `enabled` as long as its `status` is not `DISABLED`.
	*
	* @returns True if the control has any status other than 'DISABLED',
	* false if the status is 'DISABLED'.
	*
	* @see {@link AbstractControl.status}
	*
	*/
	get enabled() {
		return this.status !== DISABLED;
	}
	/**
	* An object containing any errors generated by failing validation,
	* or null if there are no errors.
	*/
	errors;
	/**
	* A control is `pristine` if the user has not yet changed
	* the value in the UI.
	*
	* @returns True if the user has not yet changed the value in the UI; compare `dirty`.
	* Programmatic changes to a control's value do not mark it dirty.
	*/
	get pristine() {
		return untracked(this.pristineReactive);
	}
	set pristine(v) {
		untracked(() => this.pristineReactive.set(v));
	}
	/** @internal */
	_pristine = computed(() => this.pristineReactive(), ...wx.__global.ngDevMode ? [{ debugName: "_pristine" }] : /* istanbul ignore next */ []);
	pristineReactive = signal(true, ...wx.__global.ngDevMode ? [{ debugName: "pristineReactive" }] : /* istanbul ignore next */ []);
	/**
	* A control is `dirty` if the user has changed the value
	* in the UI.
	*
	* @returns True if the user has changed the value of this control in the UI; compare `pristine`.
	* Programmatic changes to a control's value do not mark it dirty.
	*/
	get dirty() {
		return !this.pristine;
	}
	/**
	* True if the control is marked as `touched`.
	*
	* A control is marked `touched` once the user has triggered
	* a `blur` event on it.
	*/
	get touched() {
		return untracked(this.touchedReactive);
	}
	set touched(v) {
		untracked(() => this.touchedReactive.set(v));
	}
	/** @internal */
	_touched = computed(() => this.touchedReactive(), ...wx.__global.ngDevMode ? [{ debugName: "_touched" }] : /* istanbul ignore next */ []);
	touchedReactive = signal(false, ...wx.__global.ngDevMode ? [{ debugName: "touchedReactive" }] : /* istanbul ignore next */ []);
	/**
	* True if the control has not been marked as touched
	*
	* A control is `untouched` if the user has not yet triggered
	* a `blur` event on it.
	*/
	get untouched() {
		return !this.touched;
	}
	/**
	* Exposed as observable, see below.
	*
	* @internal
	*/
	_events = new Subject();
	/**
	* A multicasting observable that emits an event every time the state of the control changes.
	* It emits for value, status, pristine or touched changes.
	*
	* **Note**: On value change, the emit happens right after a value of this control is updated. The
	* value of a parent control (for example if this FormControl is a part of a FormGroup) is updated
	* later, so accessing a value of a parent control (using the `value` property) from the callback
	* of this event might result in getting a value that has not been updated yet. Subscribe to the
	* `events` of the parent control instead.
	* For other event types, the events are emitted after the parent control has been updated.
	*
	* @see [Unified control state change events](guide/forms/reactive-forms#unified-control-state-change-events)
	*/
	events = this._events.asObservable();
	/**
	* A multicasting observable that emits an event every time the value of the control changes, in
	* the UI or programmatically. It also emits an event each time you call enable() or disable()
	* without passing along {emitEvent: false} as a function argument.
	*
	* **Note**: the emit happens right after a value of this control is updated. The value of a
	* parent control (for example if this FormControl is a part of a FormGroup) is updated later, so
	* accessing a value of a parent control (using the `value` property) from the callback of this
	* event might result in getting a value that has not been updated yet. Subscribe to the
	* `valueChanges` event of the parent control instead.
	*/
	valueChanges;
	/**
	* A multicasting observable that emits an event every time the validation `status` of the control
	* recalculates.
	*
	* @see {@link FormControlStatus}
	* @see {@link AbstractControl.status}
	*/
	statusChanges;
	/**
	* Reports the update strategy of the `AbstractControl` (meaning
	* the event on which the control updates itself).
	* Possible values: `'change'` | `'blur'` | `'submit'`
	* Default value: `'change'`
	*/
	get updateOn() {
		return this._updateOn ? this._updateOn : this.parent ? this.parent.updateOn : "change";
	}
	/**
	* Sets the synchronous validators that are active on this control.  Calling
	* this overwrites any existing synchronous validators.
	*
	* When you add or remove a validator at run time, you must call
	* `updateValueAndValidity()` for the new validation to take effect.
	*
	* If you want to add a new validator without affecting existing ones, consider
	* using `addValidators()` method instead.
	*/
	setValidators(validators) {
		this._assignValidators(validators);
	}
	/**
	* Sets the asynchronous validators that are active on this control. Calling this
	* overwrites any existing asynchronous validators.
	*
	* When you add or remove a validator at run time, you must call
	* `updateValueAndValidity()` for the new validation to take effect.
	*
	* If you want to add a new validator without affecting existing ones, consider
	* using `addAsyncValidators()` method instead.
	*/
	setAsyncValidators(validators) {
		this._assignAsyncValidators(validators);
	}
	/**
	* Add a synchronous validator or validators to this control, without affecting other validators.
	*
	* When you add or remove a validator at run time, you must call
	* `updateValueAndValidity()` for the new validation to take effect.
	*
	* Adding a validator that already exists will have no effect. If duplicate validator functions
	* are present in the `validators` array, only the first instance would be added to a form
	* control.
	*
	* @param validators The new validator function or functions to add to this control.
	*/
	addValidators(validators) {
		this.setValidators(addValidators(validators, this._rawValidators));
	}
	/**
	* Add an asynchronous validator or validators to this control, without affecting other
	* validators.
	*
	* When you add or remove a validator at run time, you must call
	* `updateValueAndValidity()` for the new validation to take effect.
	*
	* Adding a validator that already exists will have no effect.
	*
	* @param validators The new asynchronous validator function or functions to add to this control.
	*/
	addAsyncValidators(validators) {
		this.setAsyncValidators(addValidators(validators, this._rawAsyncValidators));
	}
	/**
	* Remove a synchronous validator from this control, without affecting other validators.
	* Validators are compared by function reference; you must pass a reference to the exact same
	* validator function as the one that was originally set. If a provided validator is not found,
	* it is ignored.
	*
	* @usageNotes
	*
	* ```ts
	* // Reference to the RequiredValidator
	* const ctrl = new FormControl<string | null>('', Validators.required);
	* ctrl.removeValidators(Validators.required);
	*
	* // Reference to anonymous function inside MinValidator
	* const minValidator = Validators.min(3);
	* const ctrl = new FormControl<string | null>('', minValidator);
	* expect(ctrl.hasValidator(minValidator)).toEqual(true)
	* expect(ctrl.hasValidator(Validators.min(3))).toEqual(false)
	*
	* ctrl.removeValidators(minValidator);
	* ```
	*
	* When you add or remove a validator at run time, you must call
	* `updateValueAndValidity()` for the new validation to take effect.
	*
	* @param validators The validator or validators to remove.
	*/
	removeValidators(validators) {
		this.setValidators(removeValidators(validators, this._rawValidators));
	}
	/**
	* Remove an asynchronous validator from this control, without affecting other validators.
	* Validators are compared by function reference; you must pass a reference to the exact same
	* validator function as the one that was originally set. If a provided validator is not found, it
	* is ignored.
	*
	* When you add or remove a validator at run time, you must call
	* `updateValueAndValidity()` for the new validation to take effect.
	*
	* @param validators The asynchronous validator or validators to remove.
	*/
	removeAsyncValidators(validators) {
		this.setAsyncValidators(removeValidators(validators, this._rawAsyncValidators));
	}
	/**
	* Check whether a synchronous validator function is present on this control. The provided
	* validator must be a reference to the exact same function that was provided.
	*
	* @usageNotes
	*
	* ```ts
	* // Reference to the RequiredValidator
	* const ctrl = new FormControl<number | null>(0, Validators.required);
	* expect(ctrl.hasValidator(Validators.required)).toEqual(true)
	*
	* // Reference to anonymous function inside MinValidator
	* const minValidator = Validators.min(3);
	* const ctrl = new FormControl<number | null>(0, minValidator);
	* expect(ctrl.hasValidator(minValidator)).toEqual(true)
	* expect(ctrl.hasValidator(Validators.min(3))).toEqual(false)
	* ```
	*
	* @param validator The validator to check for presence. Compared by function reference.
	* @returns Whether the provided validator was found on this control.
	*/
	hasValidator(validator) {
		return hasValidator(this._rawValidators, validator);
	}
	/**
	* Check whether an asynchronous validator function is present on this control. The provided
	* validator must be a reference to the exact same function that was provided.
	*
	* @param validator The asynchronous validator to check for presence. Compared by function
	*     reference.
	* @returns Whether the provided asynchronous validator was found on this control.
	*/
	hasAsyncValidator(validator) {
		return hasValidator(this._rawAsyncValidators, validator);
	}
	/**
	* Empties out the synchronous validator list.
	*
	* When you add or remove a validator at run time, you must call
	* `updateValueAndValidity()` for the new validation to take effect.
	*
	*/
	clearValidators() {
		this.validator = null;
	}
	/**
	* Empties out the async validator list.
	*
	* When you add or remove a validator at run time, you must call
	* `updateValueAndValidity()` for the new validation to take effect.
	*
	*/
	clearAsyncValidators() {
		this.asyncValidator = null;
	}
	markAsTouched(opts = {}) {
		const changed = this.touched === false;
		this.touched = true;
		const sourceControl = opts.sourceControl ?? this;
		if (!opts.onlySelf) this._parent?.markAsTouched({
			...opts,
			sourceControl
		});
		if (changed && opts.emitEvent !== false) this._events.next(new TouchedChangeEvent(true, sourceControl));
	}
	/**
	* Marks the control and all its descendant controls as `dirty`.
	* @see {@link markAsDirty()}
	*
	* @param opts Configuration options that determine how the control propagates changes
	* and emits events after marking is applied.
	* * `emitEvent`: When true or not supplied (the default), the `events`
	* observable emits a `PristineChangeEvent` with the `pristine` property being `false`.
	* When false, no events are emitted.
	*
	* @see [Managing form control state](guide/forms/reactive-forms#managing-form-control-state)
	*
	*/
	markAllAsDirty(opts = {}) {
		this.markAsDirty({
			onlySelf: true,
			emitEvent: opts.emitEvent,
			sourceControl: this
		});
		this._forEachChild((control) => control.markAllAsDirty(opts));
	}
	/**
	* Marks the control and all its descendant controls as `touched`.
	* @see {@link markAsTouched()}
	*
	* @param opts Configuration options that determine how the control propagates changes
	* and emits events after marking is applied.
	* * `emitEvent`: When true or not supplied (the default), the `events`
	* observable emits a `TouchedChangeEvent` with the `touched` property being `true`.
	* When false, no events are emitted.
	*
	* @see [Managing form control state](guide/forms/reactive-forms#managing-form-control-state)
	*
	*/
	markAllAsTouched(opts = {}) {
		this.markAsTouched({
			onlySelf: true,
			emitEvent: opts.emitEvent,
			sourceControl: this
		});
		this._forEachChild((control) => control.markAllAsTouched(opts));
	}
	markAsUntouched(opts = {}) {
		const changed = this.touched === true;
		this.touched = false;
		this._pendingTouched = false;
		const sourceControl = opts.sourceControl ?? this;
		this._forEachChild((control) => {
			control.markAsUntouched({
				onlySelf: true,
				emitEvent: opts.emitEvent,
				sourceControl
			});
		});
		if (!opts.onlySelf) this._parent?._updateTouched(opts, sourceControl);
		if (changed && opts.emitEvent !== false) this._events.next(new TouchedChangeEvent(false, sourceControl));
	}
	markAsDirty(opts = {}) {
		const changed = this.pristine === true;
		this.pristine = false;
		const sourceControl = opts.sourceControl ?? this;
		if (!opts.onlySelf) this._parent?.markAsDirty({
			...opts,
			sourceControl
		});
		if (changed && opts.emitEvent !== false) this._events.next(new PristineChangeEvent(false, sourceControl));
	}
	markAsPristine(opts = {}) {
		const changed = this.pristine === false;
		this.pristine = true;
		this._pendingDirty = false;
		const sourceControl = opts.sourceControl ?? this;
		this._forEachChild((control) => {
			/** We don't propagate the source control downwards */
			control.markAsPristine({
				onlySelf: true,
				emitEvent: opts.emitEvent
			});
		});
		if (!opts.onlySelf) this._parent?._updatePristine(opts, sourceControl);
		if (changed && opts.emitEvent !== false) this._events.next(new PristineChangeEvent(true, sourceControl));
	}
	markAsPending(opts = {}) {
		this.status = PENDING;
		const sourceControl = opts.sourceControl ?? this;
		if (opts.emitEvent !== false) {
			this._events.next(new StatusChangeEvent(this.status, sourceControl));
			this.statusChanges.emit(this.status);
		}
		if (!opts.onlySelf) this._parent?.markAsPending({
			...opts,
			sourceControl
		});
	}
	disable(opts = {}) {
		const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
		this.status = DISABLED;
		this.errors = null;
		this._forEachChild((control) => {
			/** We don't propagate the source control downwards */
			control.disable({
				...opts,
				onlySelf: true
			});
		});
		this._updateValue();
		const sourceControl = opts.sourceControl ?? this;
		if (opts.emitEvent !== false) {
			this._events.next(new ValueChangeEvent(this.value, sourceControl));
			this._events.next(new StatusChangeEvent(this.status, sourceControl));
			this.valueChanges.emit(this.value);
			this.statusChanges.emit(this.status);
		}
		this._updateAncestors({
			...opts,
			skipPristineCheck
		}, this);
		this._onDisabledChange.forEach((changeFn) => changeFn(true));
	}
	/**
	* Enables the control. This means the control is included in validation checks and
	* the aggregate value of its parent. Its status recalculates based on its value and
	* its validators.
	*
	* By default, if the control has children, all children are enabled.
	*
	* @see {@link AbstractControl.status}
	*
	* @param opts Configure options that control how the control propagates changes and
	* emits events when marked as untouched
	* * `onlySelf`: When true, mark only this control. When false or not supplied,
	* marks all direct ancestors. Default is false.
	* * `emitEvent`: When true or not supplied (the default), the `statusChanges`,
	* `valueChanges` and `events`
	* observables emit events with the latest status and value when the control is enabled.
	* When false, no events are emitted.
	*/
	enable(opts = {}) {
		const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
		this.status = VALID;
		this._forEachChild((control) => {
			control.enable({
				...opts,
				onlySelf: true
			});
		});
		this.updateValueAndValidity({
			onlySelf: true,
			emitEvent: opts.emitEvent
		});
		this._updateAncestors({
			...opts,
			skipPristineCheck
		}, this);
		this._onDisabledChange.forEach((changeFn) => changeFn(false));
	}
	_updateAncestors(opts, sourceControl) {
		if (!opts.onlySelf) {
			this._parent?.updateValueAndValidity(opts);
			if (!opts.skipPristineCheck) this._parent?._updatePristine({}, sourceControl);
			this._parent?._updateTouched({}, sourceControl);
		}
	}
	/**
	* Sets the parent of the control
	*
	* @param parent The new parent.
	*/
	setParent(parent) {
		this._parent = parent;
	}
	/**
	* The raw value of this control. For most control implementations, the raw value will include
	* disabled children.
	*/
	getRawValue() {
		return this.value;
	}
	updateValueAndValidity(opts = {}) {
		this._setInitialStatus();
		this._updateValue();
		if (this.enabled) {
			const shouldHaveEmitted = this._cancelExistingSubscription();
			this.errors = this._runValidator();
			this.status = this._calculateStatus();
			if (this.status === VALID || this.status === PENDING) this._runAsyncValidator(shouldHaveEmitted, opts.emitEvent);
		}
		const sourceControl = opts.sourceControl ?? this;
		if (opts.emitEvent !== false) {
			this._events.next(new ValueChangeEvent(this.value, sourceControl));
			this._events.next(new StatusChangeEvent(this.status, sourceControl));
			this.valueChanges.emit(this.value);
			this.statusChanges.emit(this.status);
		}
		if (!opts.onlySelf) this._parent?.updateValueAndValidity({
			...opts,
			sourceControl
		});
	}
	/** @internal */
	_updateTreeValidity(opts = { emitEvent: true }) {
		this._forEachChild((ctrl) => ctrl._updateTreeValidity(opts));
		this.updateValueAndValidity({
			onlySelf: true,
			emitEvent: opts.emitEvent
		});
	}
	_setInitialStatus() {
		this.status = this._allControlsDisabled() ? DISABLED : VALID;
	}
	_runValidator() {
		return this.validator ? this.validator(this) : null;
	}
	_runAsyncValidator(shouldHaveEmitted, emitEvent) {
		if (this.asyncValidator) {
			this.status = PENDING;
			this._hasOwnPendingAsyncValidator = {
				emitEvent: emitEvent !== false,
				shouldHaveEmitted: shouldHaveEmitted !== false
			};
			const obs = toObservable(this.asyncValidator(this));
			this._asyncValidationSubscription = obs.subscribe((errors) => {
				this._hasOwnPendingAsyncValidator = null;
				this.setErrors(errors, {
					emitEvent,
					shouldHaveEmitted
				});
			});
		}
	}
	_cancelExistingSubscription() {
		if (this._asyncValidationSubscription) {
			this._asyncValidationSubscription.unsubscribe();
			const shouldHaveEmitted = (this._hasOwnPendingAsyncValidator?.emitEvent || this._hasOwnPendingAsyncValidator?.shouldHaveEmitted) ?? false;
			this._hasOwnPendingAsyncValidator = null;
			return shouldHaveEmitted;
		}
		return false;
	}
	setErrors(errors, opts = {}) {
		this.errors = errors;
		this._updateControlsErrors(opts.emitEvent !== false, this, opts.shouldHaveEmitted);
	}
	/**
	* Retrieves a child control given the control's name or path.
	*
	* @param path A dot-delimited string or array of string/number values that define the path to the
	* control. If a string is provided, passing it as a string literal will result in improved type
	* information. Likewise, if an array is provided, passing it `as const` will cause improved type
	* information to be available.
	*
	* @usageNotes
	* ### Retrieve a nested control
	*
	* For example, to get a `name` control nested within a `person` sub-group:
	*
	* * `this.form.get('person.name');`
	*
	* -OR-
	*
	* * `this.form.get(['person', 'name'] as const);` // `as const` gives improved typings
	*
	* ### Retrieve a control in a FormArray
	*
	* When accessing an element inside a FormArray, you can use an element index.
	* For example, to get a `price` control from the first element in an `items` array you can use:
	*
	* * `this.form.get('items.0.price');`
	*
	* -OR-
	*
	* * `this.form.get(['items', 0, 'price']);`
	*/
	get(path) {
		let currPath = path;
		if (currPath == null) return null;
		if (!Array.isArray(currPath)) currPath = currPath.split(".");
		if (currPath.length === 0) return null;
		return currPath.reduce((control, name) => control && control._find(name), this);
	}
	/**
	* @description
	* Reports error data for the control with the given path.
	*
	* @param errorCode The code of the error to check
	* @param path A list of control names that designates how to move from the current control
	* to the control that should be queried for errors.
	*
	* @usageNotes
	* For example, for the following `FormGroup`:
	*
	* ```ts
	* form = new FormGroup({
	*   address: new FormGroup({ street: new FormControl() })
	* });
	* ```
	*
	* The path to the 'street' control from the root form would be 'address' -> 'street'.
	*
	* It can be provided to this method in one of two formats:
	*
	* 1. An array of string control names, e.g. `['address', 'street']`
	* 1. A period-delimited list of control names in one string, e.g. `'address.street'`
	*
	* @returns error data for that particular error. If the control or error is not present,
	* null is returned.
	*/
	getError(errorCode, path) {
		const control = path ? this.get(path) : this;
		return control?.errors ? control.errors[errorCode] : null;
	}
	/**
	* @description
	* Reports whether the control with the given path has the error specified.
	*
	* @param errorCode The code of the error to check
	* @param path A list of control names that designates how to move from the current control
	* to the control that should be queried for errors.
	*
	* @usageNotes
	* For example, for the following `FormGroup`:
	*
	* ```ts
	* form = new FormGroup({
	*   address: new FormGroup({ street: new FormControl() })
	* });
	* ```
	*
	* The path to the 'street' control from the root form would be 'address' -> 'street'.
	*
	* It can be provided to this method in one of two formats:
	*
	* 1. An array of string control names, e.g. `['address', 'street']`
	* 1. A period-delimited list of control names in one string, e.g. `'address.street'`
	*
	* If no path is given, this method checks for the error on the current control.
	*
	* @returns whether the given error is present in the control at the given path.
	*
	* If the control is not present, false is returned.
	*/
	hasError(errorCode, path) {
		return !!this.getError(errorCode, path);
	}
	/**
	* Retrieves the top-level ancestor of this control.
	*/
	get root() {
		let x = this;
		while (x._parent) x = x._parent;
		return x;
	}
	/** @internal */
	_updateControlsErrors(emitEvent, changedControl, shouldHaveEmitted) {
		this.status = this._calculateStatus();
		if (emitEvent) this.statusChanges.emit(this.status);
		if (emitEvent || shouldHaveEmitted) this._events.next(new StatusChangeEvent(this.status, changedControl));
		if (this._parent) this._parent._updateControlsErrors(emitEvent, changedControl, shouldHaveEmitted);
	}
	/** @internal */
	_initObservables() {
		this.valueChanges = new EventEmitter();
		this.statusChanges = new EventEmitter();
	}
	_calculateStatus() {
		if (this._allControlsDisabled()) return DISABLED;
		if (this.errors) return INVALID;
		if (this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(PENDING)) return PENDING;
		if (this._anyControlsHaveStatus(INVALID)) return INVALID;
		return VALID;
	}
	/** @internal */
	_anyControlsHaveStatus(status) {
		return this._anyControls((control) => control.status === status);
	}
	/** @internal */
	_anyControlsDirty() {
		return this._anyControls((control) => control.dirty);
	}
	/** @internal */
	_anyControlsTouched() {
		return this._anyControls((control) => control.touched);
	}
	/** @internal */
	_updatePristine(opts, changedControl) {
		const newPristine = !this._anyControlsDirty();
		const changed = this.pristine !== newPristine;
		this.pristine = newPristine;
		if (!opts.onlySelf) this._parent?._updatePristine(opts, changedControl);
		if (changed) this._events.next(new PristineChangeEvent(this.pristine, changedControl));
	}
	/** @internal */
	_updateTouched(opts = {}, changedControl) {
		this.touched = this._anyControlsTouched();
		this._events.next(new TouchedChangeEvent(this.touched, changedControl));
		if (!opts.onlySelf) this._parent?._updateTouched(opts, changedControl);
	}
	/** @internal */
	_onDisabledChange = [];
	/** @internal */
	_registerOnCollectionChange(fn) {
		this._onCollectionChange = fn;
	}
	/** @internal */
	_setUpdateStrategy(opts) {
		if (isOptionsObj(opts) && opts.updateOn != null) this._updateOn = opts.updateOn;
	}
	/**
	* Check to see if parent has been marked artificially dirty.
	*
	* @internal
	*/
	_parentMarkedDirty(onlySelf) {
		return !onlySelf && !!this._parent?.dirty && !this._parent._anyControlsDirty();
	}
	/** @internal */
	_find(name) {
		return null;
	}
	/**
	* Internal implementation of the `setValidators` method. Needs to be separated out into a
	* different method, because it is called in the constructor and it can break cases where
	* a control is extended.
	*/
	_assignValidators(validators) {
		this._rawValidators = Array.isArray(validators) ? validators.slice() : validators;
		this._composedValidatorFn = coerceToValidator(this._rawValidators);
		this._updateHasRequiredValidator();
	}
	/**
	* Internal implementation of the `setAsyncValidators` method. Needs to be separated out into a
	* different method, because it is called in the constructor and it can break cases where
	* a control is extended.
	*/
	_assignAsyncValidators(validators) {
		this._rawAsyncValidators = Array.isArray(validators) ? validators.slice() : validators;
		this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
	}
	_updateHasRequiredValidator() {
		untracked(() => this._hasRequired.set(this.hasValidator(Validators.required)));
	}
};
function hasOwnControl(controls, name) {
	return Object.hasOwn(controls, name);
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* @description
* Base class for control directives.
*
* This class is only used internally in the `ReactiveFormsModule` and the `FormsModule`.
*
* @publicApi
*/
var AbstractControlDirective = class {
	/**
	* @description
	* Reports the value of the control if it is present, otherwise null.
	*/
	get value() {
		return this.control ? this.control.value : null;
	}
	/**
	* @description
	* Reports whether the control is valid. A control is considered valid if no
	* validation errors exist with the current value.
	* If the control is not present, null is returned.
	*/
	get valid() {
		return this.control ? this.control.valid : null;
	}
	/**
	* @description
	* Reports whether the control is invalid, meaning that an error exists in the input value.
	* If the control is not present, null is returned.
	*/
	get invalid() {
		return this.control ? this.control.invalid : null;
	}
	/**
	* @description
	* Reports whether a control is pending, meaning that async validation is occurring and
	* errors are not yet available for the input value. If the control is not present, null is
	* returned.
	*/
	get pending() {
		return this.control ? this.control.pending : null;
	}
	/**
	* @description
	* Reports whether the control is disabled, meaning that the control is disabled
	* in the UI and is exempt from validation checks and excluded from aggregate
	* values of ancestor controls. If the control is not present, null is returned.
	*/
	get disabled() {
		return this.control ? this.control.disabled : null;
	}
	/**
	* @description
	* Reports whether the control is enabled, meaning that the control is included in ancestor
	* calculations of validity or value. If the control is not present, null is returned.
	*/
	get enabled() {
		return this.control ? this.control.enabled : null;
	}
	/**
	* @description
	* Reports the control's validation errors. If the control is not present, null is returned.
	*/
	get errors() {
		return this.control ? this.control.errors : null;
	}
	/**
	* @description
	* Reports whether the control is pristine, meaning that the user has not yet changed
	* the value in the UI. If the control is not present, null is returned.
	*/
	get pristine() {
		return this.control ? this.control.pristine : null;
	}
	/**
	* @description
	* Reports whether the control is dirty, meaning that the user has changed
	* the value in the UI. If the control is not present, null is returned.
	*/
	get dirty() {
		return this.control ? this.control.dirty : null;
	}
	/**
	* @description
	* Reports whether the control is touched, meaning that the user has triggered
	* a `blur` event on it. If the control is not present, null is returned.
	*/
	get touched() {
		return this.control ? this.control.touched : null;
	}
	/**
	* @description
	* Reports the validation status of the control. Possible values include:
	* 'VALID', 'INVALID', 'DISABLED', and 'PENDING'.
	* If the control is not present, null is returned.
	*/
	get status() {
		return this.control ? this.control.status : null;
	}
	/**
	* @description
	* Reports whether the control is untouched, meaning that the user has not yet triggered
	* a `blur` event on it. If the control is not present, null is returned.
	*/
	get untouched() {
		return this.control ? this.control.untouched : null;
	}
	/**
	* @description
	* Returns a multicasting observable that emits a validation status whenever it is
	* calculated for the control. If the control is not present, null is returned.
	*/
	get statusChanges() {
		return this.control ? this.control.statusChanges : null;
	}
	/**
	* @description
	* Returns a multicasting observable of value changes for the control that emits every time the
	* value of the control changes in the UI or programmatically.
	* If the control is not present, null is returned.
	*/
	get valueChanges() {
		return this.control ? this.control.valueChanges : null;
	}
	/**
	* @description
	* Returns an array that represents the path from the top-level form to this control.
	* Each index is the string name of the control on that level.
	*/
	get path() {
		return null;
	}
	/**
	* Contains the result of merging synchronous validators into a single validator function
	* (combined using `Validators.compose`).
	*/
	_composedValidatorFn;
	/**
	* Contains the result of merging asynchronous validators into a single validator function
	* (combined using `Validators.composeAsync`).
	*/
	_composedAsyncValidatorFn;
	/**
	* Set of synchronous validators as they were provided while calling `setValidators` function.
	* @internal
	*/
	_rawValidators = [];
	/**
	* Set of asynchronous validators as they were provided while calling `setAsyncValidators`
	* function.
	* @internal
	*/
	_rawAsyncValidators = [];
	/**
	* Sets synchronous validators for this directive.
	* @internal
	*/
	_setValidators(validators) {
		this._rawValidators = validators || [];
		this._composedValidatorFn = composeValidators(this._rawValidators);
	}
	/**
	* Sets asynchronous validators for this directive.
	* @internal
	*/
	_setAsyncValidators(validators) {
		this._rawAsyncValidators = validators || [];
		this._composedAsyncValidatorFn = composeAsyncValidators(this._rawAsyncValidators);
	}
	/**
	* @description
	* Synchronous validator function composed of all the synchronous validators registered with this
	* directive.
	*/
	get validator() {
		return this._composedValidatorFn || null;
	}
	/**
	* @description
	* Asynchronous validator function composed of all the asynchronous validators registered with
	* this directive.
	*/
	get asyncValidator() {
		return this._composedAsyncValidatorFn || null;
	}
	_onDestroyCallbacks = [];
	/**
	* Internal function to register callbacks that should be invoked
	* when directive instance is being destroyed.
	* @internal
	*/
	_registerOnDestroy(fn) {
		this._onDestroyCallbacks.push(fn);
	}
	/**
	* Internal function to invoke all registered "on destroy" callbacks.
	* Note: calling this function also clears the list of callbacks.
	* @internal
	*/
	_invokeOnDestroyCallbacks() {
		this._onDestroyCallbacks.forEach((fn) => fn());
		this._onDestroyCallbacks = [];
	}
	/**
	* @description
	* Resets the control with the provided value if the control is present.
	*/
	reset(value = void 0) {
		this.control?.reset(value);
	}
	/**
	* @description
	* Reports whether the control with the given path has the error specified.
	*
	* @param errorCode The code of the error to check
	* @param path A list of control names that designates how to move from the current control
	* to the control that should be queried for errors.
	*
	* @usageNotes
	* For example, for the following `FormGroup`:
	*
	* ```ts
	* form = new FormGroup({
	*   address: new FormGroup({ street: new FormControl() })
	* });
	* ```
	*
	* The path to the 'street' control from the root form would be 'address' -> 'street'.
	*
	* It can be provided to this method in one of two formats:
	*
	* 1. An array of string control names, e.g. `['address', 'street']`
	* 1. A period-delimited list of control names in one string, e.g. `'address.street'`
	*
	* If no path is given, this method checks for the error on the current control.
	*
	* @returns whether the given error is present in the control at the given path.
	*
	* If the control is not present, false is returned.
	*/
	hasError(errorCode, path) {
		return this.control ? this.control.hasError(errorCode, path) : false;
	}
	/**
	* @description
	* Reports error data for the control with the given path.
	*
	* @param errorCode The code of the error to check
	* @param path A list of control names that designates how to move from the current control
	* to the control that should be queried for errors.
	*
	* @usageNotes
	* For example, for the following `FormGroup`:
	*
	* ```ts
	* form = new FormGroup({
	*   address: new FormGroup({ street: new FormControl() })
	* });
	* ```
	*
	* The path to the 'street' control from the root form would be 'address' -> 'street'.
	*
	* It can be provided to this method in one of two formats:
	*
	* 1. An array of string control names, e.g. `['address', 'street']`
	* 1. A period-delimited list of control names in one string, e.g. `'address.street'`
	*
	* @returns error data for that particular error. If the control or error is not present,
	* null is returned.
	*/
	getError(errorCode, path) {
		return this.control ? this.control.getError(errorCode, path) : null;
	}
};
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
function isNativeFormElement(element) {
	return element.tagName === "INPUT" || element.tagName === "SELECT" || element.tagName === "TEXTAREA";
}
/**
* Updates the native DOM property on the given node.
*
* @param renderer The renderer to use for DOM operations.
* @param element The native form control element.
* @param name The DOM attribute/property name.
* @param value The new value for the property.
*/
function setNativeDomProperty(renderer, element, name, value) {
	switch (name) {
		case "name":
			renderer.setAttribute(element, name, value);
			break;
		case "disabled":
		case "readonly":
		case "required":
			if (value) renderer.setAttribute(element, name, "");
			else renderer.removeAttribute(element, name);
			break;
		case "max":
		case "min":
		case "minLength":
		case "maxLength": if (value !== void 0) renderer.setAttribute(element, name, value.toString());
		else renderer.removeAttribute(element, name);
	}
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* A validation error used when propagating Reactive Forms errors to FVC components.
*
* @internal
*/
var ReactiveValidationError = class {
	kind;
	context;
	control;
	message;
	constructor({ kind, context, control }) {
		this.kind = kind;
		this.context = context;
		this.control = control;
	}
};
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* Method that updates string to integer if not already a number
*
* @param value The value to convert to integer.
* @returns value of parameter converted to number or integer.
*/
function toInteger(value) {
	return typeof value === "number" ? value : parseInt(value, 10);
}
/**
* Method that ensures that provided value is a float (and converts it to float if needed).
*
* @param value The value to convert to float.
* @returns value of parameter converted to number or float.
*/
function toFloat(value) {
	return typeof value === "number" ? value : parseFloat(value);
}
/**
* A base class for Validator-based Directives. The class contains common logic shared across such
* Directives.
*
* For internal use only, this class is not intended for use outside of the Forms package.
*/
var AbstractValidatorDirective = class AbstractValidatorDirective {
	_validator = nullValidator;
	_onChange;
	/**
	* A flag that tracks whether this validator is enabled.
	*
	* Marking it `internal` (vs `protected`), so that this flag can be used in host bindings of
	* directive classes that extend this base class.
	* @internal
	*/
	_enabled;
	/** @docs-private */
	ngOnChanges(changes) {
		if (this.inputName in changes) {
			const input = this.normalizeInput(changes[this.inputName].currentValue);
			this._enabled = this.enabled(input);
			this._validator = this._enabled ? this.createValidator(input) : nullValidator;
			this._onChange?.();
		}
	}
	/** @docs-private */
	validate(control) {
		return this._validator(control);
	}
	/** @docs-private */
	registerOnValidatorChange(fn) {
		this._onChange = fn;
	}
	/**
	* @description
	* Determines whether this validator should be active or not based on an input.
	* Base class implementation checks whether an input is defined (if the value is different from
	* `null` and `undefined`). Validator classes that extend this base class can override this
	* function with the logic specific to a particular validator directive.
	*/
	enabled(input) {
		return input != null;
	}
	static ɵfac = function AbstractValidatorDirective_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || AbstractValidatorDirective)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: AbstractValidatorDirective,
		features: [ɵɵNgOnChangesFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(AbstractValidatorDirective, [{ type: Directive }], null, null);
})();
/**
* @description
* Provider which adds `MaxValidator` to the `NG_VALIDATORS` multi-provider list.
*/
var MAX_VALIDATOR = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => MaxValidator),
	multi: true
};
/**
* A directive which installs the {@link MaxValidator} for any `formControlName`,
* `formControl`, or control with `ngModel` that also has a `max` attribute.
*
* @see [Form Validation](guide/forms/form-validation)
*
* @usageNotes
*
* ### Adding a max validator
*
* The following example shows how to add a max validator to an input attached to an
* ngModel binding.
*
* ```html
* <input type="number" ngModel max="4">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var MaxValidator = class MaxValidator extends AbstractValidatorDirective {
	/**
	* @description
	* Tracks changes to the max bound to this directive.
	*/
	max;
	/** @internal */
	inputName = "max";
	/** @internal */
	normalizeInput = (input) => toFloat(input);
	/** @internal */
	createValidator = (max) => maxValidator(max);
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵMaxValidator_BaseFactory;
		return function MaxValidator_Factory(__ngFactoryType__) {
			return (ɵMaxValidator_BaseFactory || (ɵMaxValidator_BaseFactory = ɵɵgetInheritedFactory(MaxValidator)))(__ngFactoryType__ || MaxValidator);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MaxValidator,
		selectors: [
			[
				"input",
				"type",
				"number",
				"max",
				"",
				"formControlName",
				""
			],
			[
				"input",
				"type",
				"number",
				"max",
				"",
				"formControl",
				""
			],
			[
				"input",
				"type",
				"number",
				"max",
				"",
				"ngModel",
				""
			]
		],
		hostVars: 1,
		hostBindings: function MaxValidator_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵattribute("max", ctx._enabled ? ctx.max : null);
		},
		inputs: { max: "max" },
		standalone: false,
		features: [ɵɵProvidersFeature([MAX_VALIDATOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(MaxValidator, [{
		type: Directive,
		args: [{
			selector: "input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]",
			providers: [MAX_VALIDATOR],
			host: { "[attr.max]": "_enabled ? max : null" },
			standalone: false
		}]
	}], null, { max: [{ type: Input }] });
})();
/**
* @description
* Provider which adds `MinValidator` to the `NG_VALIDATORS` multi-provider list.
*/
var MIN_VALIDATOR = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => MinValidator),
	multi: true
};
/**
* A directive which installs the {@link MinValidator} for any `formControlName`,
* `formControl`, or control with `ngModel` that also has a `min` attribute.
*
* @see [Form Validation](guide/forms/form-validation)
*
* @usageNotes
*
* ### Adding a min validator
*
* The following example shows how to add a min validator to an input attached to an
* ngModel binding.
*
* ```html
* <input type="number" ngModel min="4">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var MinValidator = class MinValidator extends AbstractValidatorDirective {
	/**
	* @description
	* Tracks changes to the min bound to this directive.
	*/
	min;
	/** @internal */
	inputName = "min";
	/** @internal */
	normalizeInput = (input) => toFloat(input);
	/** @internal */
	createValidator = (min) => minValidator(min);
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵMinValidator_BaseFactory;
		return function MinValidator_Factory(__ngFactoryType__) {
			return (ɵMinValidator_BaseFactory || (ɵMinValidator_BaseFactory = ɵɵgetInheritedFactory(MinValidator)))(__ngFactoryType__ || MinValidator);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MinValidator,
		selectors: [
			[
				"input",
				"type",
				"number",
				"min",
				"",
				"formControlName",
				""
			],
			[
				"input",
				"type",
				"number",
				"min",
				"",
				"formControl",
				""
			],
			[
				"input",
				"type",
				"number",
				"min",
				"",
				"ngModel",
				""
			]
		],
		hostVars: 1,
		hostBindings: function MinValidator_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵattribute("min", ctx._enabled ? ctx.min : null);
		},
		inputs: { min: "min" },
		standalone: false,
		features: [ɵɵProvidersFeature([MIN_VALIDATOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(MinValidator, [{
		type: Directive,
		args: [{
			selector: "input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]",
			providers: [MIN_VALIDATOR],
			host: { "[attr.min]": "_enabled ? min : null" },
			standalone: false
		}]
	}], null, { min: [{ type: Input }] });
})();
/**
* @description
* Provider which adds `RequiredValidator` to the `NG_VALIDATORS` multi-provider list.
*/
var REQUIRED_VALIDATOR = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => RequiredValidator),
	multi: true
};
/**
* @description
* Provider which adds `CheckboxRequiredValidator` to the `NG_VALIDATORS` multi-provider list.
*/
var CHECKBOX_REQUIRED_VALIDATOR = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => CheckboxRequiredValidator),
	multi: true
};
/**
* @description
* A directive that adds the `required` validator to any controls marked with the
* `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
*
* @see [Form Validation](guide/forms/form-validation)
*
* @usageNotes
*
* ### Adding a required validator using template-driven forms
*
* ```html
* <input name="fullName" ngModel required>
* ```
*
* @ngModule FormsModule
* @ngModule ReactiveFormsModule
* @publicApi
*/
var RequiredValidator = class RequiredValidator extends AbstractValidatorDirective {
	/**
	* @description
	* Tracks changes to the required attribute bound to this directive.
	*/
	required;
	/** @internal */
	inputName = "required";
	/** @internal */
	normalizeInput = booleanAttribute;
	/** @internal */
	createValidator = (input) => requiredValidator;
	/** @docs-private */
	enabled(input) {
		return input;
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵRequiredValidator_BaseFactory;
		return function RequiredValidator_Factory(__ngFactoryType__) {
			return (ɵRequiredValidator_BaseFactory || (ɵRequiredValidator_BaseFactory = ɵɵgetInheritedFactory(RequiredValidator)))(__ngFactoryType__ || RequiredValidator);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: RequiredValidator,
		selectors: [
			[
				"",
				"required",
				"",
				"formControlName",
				"",
				3,
				"type",
				"checkbox"
			],
			[
				"",
				"required",
				"",
				"formControl",
				"",
				3,
				"type",
				"checkbox"
			],
			[
				"",
				"required",
				"",
				"ngModel",
				"",
				3,
				"type",
				"checkbox"
			]
		],
		hostVars: 1,
		hostBindings: function RequiredValidator_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵattribute("required", ctx._enabled ? "" : null);
		},
		inputs: { required: "required" },
		standalone: false,
		features: [ɵɵProvidersFeature([REQUIRED_VALIDATOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(RequiredValidator, [{
		type: Directive,
		args: [{
			selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]",
			providers: [REQUIRED_VALIDATOR],
			host: { "[attr.required]": "_enabled ? \"\" : null" },
			standalone: false
		}]
	}], null, { required: [{ type: Input }] });
})();
/**
* A Directive that adds the `required` validator to checkbox controls marked with the
* `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
*
* @see [Form Validation](guide/forms/form-validation)
*
* @usageNotes
*
* ### Adding a required checkbox validator using template-driven forms
*
* The following example shows how to add a checkbox required validator to an input attached to an
* ngModel binding.
*
* ```html
* <input type="checkbox" name="active" ngModel required>
* ```
*
* @publicApi
* @ngModule FormsModule
* @ngModule ReactiveFormsModule
*/
var CheckboxRequiredValidator = class CheckboxRequiredValidator extends RequiredValidator {
	/** @internal */
	createValidator = (input) => requiredTrueValidator;
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵCheckboxRequiredValidator_BaseFactory;
		return function CheckboxRequiredValidator_Factory(__ngFactoryType__) {
			return (ɵCheckboxRequiredValidator_BaseFactory || (ɵCheckboxRequiredValidator_BaseFactory = ɵɵgetInheritedFactory(CheckboxRequiredValidator)))(__ngFactoryType__ || CheckboxRequiredValidator);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: CheckboxRequiredValidator,
		selectors: [
			[
				"input",
				"type",
				"checkbox",
				"required",
				"",
				"formControlName",
				""
			],
			[
				"input",
				"type",
				"checkbox",
				"required",
				"",
				"formControl",
				""
			],
			[
				"input",
				"type",
				"checkbox",
				"required",
				"",
				"ngModel",
				""
			]
		],
		hostVars: 1,
		hostBindings: function CheckboxRequiredValidator_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵattribute("required", ctx._enabled ? "" : null);
		},
		standalone: false,
		features: [ɵɵProvidersFeature([CHECKBOX_REQUIRED_VALIDATOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(CheckboxRequiredValidator, [{
		type: Directive,
		args: [{
			selector: "input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]",
			providers: [CHECKBOX_REQUIRED_VALIDATOR],
			host: { "[attr.required]": "_enabled ? \"\" : null" },
			standalone: false
		}]
	}], null, null);
})();
/**
* @description
* Provider which adds `EmailValidator` to the `NG_VALIDATORS` multi-provider list.
*/
var EMAIL_VALIDATOR = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => EmailValidator),
	multi: true
};
/**
* A directive that adds the `email` validator to controls marked with the
* `email` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
*
* The email validation is based on the WHATWG HTML specification with some enhancements to
* incorporate more RFC rules. More information can be found on the [Validators.email
* page](api/forms/Validators#email).
*
* @see [Form Validation](guide/forms/form-validation)
*
* @usageNotes
*
* ### Adding an email validator
*
* The following example shows how to add an email validator to an input attached to an ngModel
* binding.
*
* ```html
* <input type="email" name="email" ngModel email>
* <input type="email" name="email" ngModel email="true">
* <input type="email" name="email" ngModel [email]="true">
* ```
*
* @publicApi
* @ngModule FormsModule
* @ngModule ReactiveFormsModule
*/
var EmailValidator = class EmailValidator extends AbstractValidatorDirective {
	/**
	* @description
	* Tracks changes to the email attribute bound to this directive.
	*/
	email;
	/** @internal */
	inputName = "email";
	/** @internal */
	normalizeInput = booleanAttribute;
	/** @internal */
	createValidator = (input) => emailValidator;
	/** @docs-private */
	enabled(input) {
		return input;
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵEmailValidator_BaseFactory;
		return function EmailValidator_Factory(__ngFactoryType__) {
			return (ɵEmailValidator_BaseFactory || (ɵEmailValidator_BaseFactory = ɵɵgetInheritedFactory(EmailValidator)))(__ngFactoryType__ || EmailValidator);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: EmailValidator,
		selectors: [
			[
				"",
				"email",
				"",
				"formControlName",
				""
			],
			[
				"",
				"email",
				"",
				"formControl",
				""
			],
			[
				"",
				"email",
				"",
				"ngModel",
				""
			]
		],
		inputs: { email: "email" },
		standalone: false,
		features: [ɵɵProvidersFeature([EMAIL_VALIDATOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(EmailValidator, [{
		type: Directive,
		args: [{
			selector: "[email][formControlName],[email][formControl],[email][ngModel]",
			providers: [EMAIL_VALIDATOR],
			standalone: false
		}]
	}], null, { email: [{ type: Input }] });
})();
/**
* @description
* Provider which adds `MinLengthValidator` to the `NG_VALIDATORS` multi-provider list.
*/
var MIN_LENGTH_VALIDATOR = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => MinLengthValidator),
	multi: true
};
/**
* A directive that adds minimum length validation to controls marked with the
* `minlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
*
* @see [Form Validation](guide/forms/form-validation)
*
* @usageNotes
*
* ### Adding a minimum length validator
*
* The following example shows how to add a minimum length validator to an input attached to an
* ngModel binding.
*
* ```html
* <input name="firstName" ngModel minlength="4">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var MinLengthValidator = class MinLengthValidator extends AbstractValidatorDirective {
	/**
	* @description
	* Tracks changes to the minimum length bound to this directive.
	*/
	minlength;
	/** @internal */
	inputName = "minlength";
	/** @internal */
	normalizeInput = (input) => toInteger(input);
	/** @internal */
	createValidator = (minlength) => minLengthValidator(minlength);
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵMinLengthValidator_BaseFactory;
		return function MinLengthValidator_Factory(__ngFactoryType__) {
			return (ɵMinLengthValidator_BaseFactory || (ɵMinLengthValidator_BaseFactory = ɵɵgetInheritedFactory(MinLengthValidator)))(__ngFactoryType__ || MinLengthValidator);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MinLengthValidator,
		selectors: [
			[
				"",
				"minlength",
				"",
				"formControlName",
				""
			],
			[
				"",
				"minlength",
				"",
				"formControl",
				""
			],
			[
				"",
				"minlength",
				"",
				"ngModel",
				""
			]
		],
		hostVars: 1,
		hostBindings: function MinLengthValidator_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵattribute("minlength", ctx._enabled ? ctx.minlength : null);
		},
		inputs: { minlength: "minlength" },
		standalone: false,
		features: [ɵɵProvidersFeature([MIN_LENGTH_VALIDATOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(MinLengthValidator, [{
		type: Directive,
		args: [{
			selector: "[minlength][formControlName],[minlength][formControl],[minlength][ngModel]",
			providers: [MIN_LENGTH_VALIDATOR],
			host: { "[attr.minlength]": "_enabled ? minlength : null" },
			standalone: false
		}]
	}], null, { minlength: [{ type: Input }] });
})();
/**
* @description
* Provider which adds `MaxLengthValidator` to the `NG_VALIDATORS` multi-provider list.
*/
var MAX_LENGTH_VALIDATOR = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => MaxLengthValidator),
	multi: true
};
/**
* A directive that adds maximum length validation to controls marked with the
* `maxlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
*
* @see [Form Validation](guide/forms/form-validation)
*
* @usageNotes
*
* ### Adding a maximum length validator
*
* The following example shows how to add a maximum length validator to an input attached to an
* ngModel binding.
*
* ```html
* <input name="firstName" ngModel maxlength="25">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var MaxLengthValidator = class MaxLengthValidator extends AbstractValidatorDirective {
	/**
	* @description
	* Tracks changes to the maximum length bound to this directive.
	*/
	maxlength;
	/** @internal */
	inputName = "maxlength";
	/** @internal */
	normalizeInput = (input) => toInteger(input);
	/** @internal */
	createValidator = (maxlength) => maxLengthValidator(maxlength);
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵMaxLengthValidator_BaseFactory;
		return function MaxLengthValidator_Factory(__ngFactoryType__) {
			return (ɵMaxLengthValidator_BaseFactory || (ɵMaxLengthValidator_BaseFactory = ɵɵgetInheritedFactory(MaxLengthValidator)))(__ngFactoryType__ || MaxLengthValidator);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: MaxLengthValidator,
		selectors: [
			[
				"",
				"maxlength",
				"",
				"formControlName",
				""
			],
			[
				"",
				"maxlength",
				"",
				"formControl",
				""
			],
			[
				"",
				"maxlength",
				"",
				"ngModel",
				""
			]
		],
		hostVars: 1,
		hostBindings: function MaxLengthValidator_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵattribute("maxlength", ctx._enabled ? ctx.maxlength : null);
		},
		inputs: { maxlength: "maxlength" },
		standalone: false,
		features: [ɵɵProvidersFeature([MAX_LENGTH_VALIDATOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(MaxLengthValidator, [{
		type: Directive,
		args: [{
			selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]",
			providers: [MAX_LENGTH_VALIDATOR],
			host: { "[attr.maxlength]": "_enabled ? maxlength : null" },
			standalone: false
		}]
	}], null, { maxlength: [{ type: Input }] });
})();
/**
* @description
* Provider which adds `PatternValidator` to the `NG_VALIDATORS` multi-provider list.
*/
var PATTERN_VALIDATOR = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => PatternValidator),
	multi: true
};
/**
* @description
* A directive that adds regex pattern validation to controls marked with the
* `pattern` attribute. The regex must match the entire control value.
* The directive is provided with the `NG_VALIDATORS` multi-provider list.
*
* @see [Form Validation](guide/forms/form-validation)
*
* @usageNotes
*
* ### Adding a pattern validator
*
* The following example shows how to add a pattern validator to an input attached to an
* ngModel binding.
*
* ```html
* <input name="firstName" ngModel pattern="[a-zA-Z ]*">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var PatternValidator = class PatternValidator extends AbstractValidatorDirective {
	/**
	* @description
	* Tracks changes to the pattern bound to this directive.
	*/
	pattern;
	/** @internal */
	inputName = "pattern";
	/** @internal */
	normalizeInput = (input) => input;
	/** @internal */
	createValidator = (input) => patternValidator(input);
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵPatternValidator_BaseFactory;
		return function PatternValidator_Factory(__ngFactoryType__) {
			return (ɵPatternValidator_BaseFactory || (ɵPatternValidator_BaseFactory = ɵɵgetInheritedFactory(PatternValidator)))(__ngFactoryType__ || PatternValidator);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: PatternValidator,
		selectors: [
			[
				"",
				"pattern",
				"",
				"formControlName",
				""
			],
			[
				"",
				"pattern",
				"",
				"formControl",
				""
			],
			[
				"",
				"pattern",
				"",
				"ngModel",
				""
			]
		],
		hostVars: 1,
		hostBindings: function PatternValidator_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵattribute("pattern", ctx._enabled ? ctx.pattern : null);
		},
		inputs: { pattern: "pattern" },
		standalone: false,
		features: [ɵɵProvidersFeature([PATTERN_VALIDATOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(PatternValidator, [{
		type: Directive,
		args: [{
			selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]",
			providers: [PATTERN_VALIDATOR],
			host: { "[attr.pattern]": "_enabled ? pattern : null" },
			standalone: false
		}]
	}], null, { pattern: [{ type: Input }] });
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* DI token that provides the ɵFormControlIntegration context for FVC/UI controls.
*/
var ɵFORM_CONTROL_INTEGRATION = new InjectionToken(typeof wx.__global.ngDevMode !== "undefined" && wx.__global.ngDevMode ? "FORM_CONTROL_INTEGRATION" : "");
/**
* Token to provide to allow SetDisabledState to always be called when a CVA is added, regardless of
* whether the control is disabled or enabled.
*
* @see {@link FormsModule#withConfig}
*/
var CALL_SET_DISABLED_STATE = new InjectionToken(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode ? "CallSetDisabledState" : "", { factory: () => setDisabledStateDefault });
/**
* Whether to use the fixed setDisabledState behavior by default.
*/
var setDisabledStateDefault = "always";
function controlPath(name, parent) {
	return [...parent.path, name];
}
/**
* Links a Form control and a Form directive by setting up callbacks (such as `onChange`) on both
* instances. This function is typically invoked when form directive is being initialized.
*
* @param control Form control instance that should be linked.
* @param dir Directive that should be linked with a given control.
*/
function setUpControlValueAccessor(control, dir, callSetDisabledState = setDisabledStateDefault) {
	if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) {
		if (!control) _throwError(dir, "Cannot find control with");
		if (!dir.valueAccessor) _throwMissingValueAccessorError(dir);
	}
	setUpValidators(control, dir);
	dir.valueAccessor.writeValue(control.value);
	if (control.disabled || callSetDisabledState === "always") dir.valueAccessor.setDisabledState?.(control.disabled);
	setUpViewChangePipeline(control, dir);
	setUpModelChangePipeline(control, dir);
	setUpBlurPipeline(control, dir);
	setUpDisabledChangeHandler(control, dir);
}
/**
* Reverts configuration performed by the `setUpControl` control function.
* Effectively disconnects form control with a given form directive.
* This function is typically invoked when corresponding form directive is being destroyed.
*
* @param control Form control which should be cleaned up.
* @param dir Directive that should be disconnected from a given control.
* @param validateControlPresenceOnChange Flag that indicates whether onChange handler should
*     contain asserts to verify that it's not called once directive is destroyed. We need this flag
*     to avoid potentially breaking changes caused by better control cleanup introduced in #39235.
*/
function cleanUpControl(control, dir, validateControlPresenceOnChange = true) {
	const noop = () => {
		if (validateControlPresenceOnChange && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) _noControlError(dir);
	};
	dir?.valueAccessor?.registerOnChange(noop);
	dir?.valueAccessor?.registerOnTouched(noop);
	cleanUpValidators(control, dir);
	if (control) {
		dir._invokeOnDestroyCallbacks();
		control._registerOnCollectionChange(() => {});
	}
}
function registerOnValidatorChange(validators, onChange) {
	validators.forEach((validator) => {
		if (validator.registerOnValidatorChange) validator.registerOnValidatorChange(onChange);
	});
}
/**
* Sets up disabled change handler function on a given form control if ControlValueAccessor
* associated with a given directive instance supports the `setDisabledState` call.
*
* @param control Form control where disabled change handler should be setup.
* @param dir Corresponding directive instance associated with this control.
*/
function setUpDisabledChangeHandler(control, dir) {
	if (dir.valueAccessor.setDisabledState) {
		const onDisabledChange = (isDisabled) => {
			dir.valueAccessor.setDisabledState(isDisabled);
		};
		control.registerOnDisabledChange(onDisabledChange);
		dir._registerOnDestroy(() => {
			control._unregisterOnDisabledChange(onDisabledChange);
		});
	}
}
/**
* Sets up sync and async directive validators on provided form control.
* This function merges validators from the directive into the validators of the control.
*
* @param control Form control where directive validators should be setup.
* @param dir Directive instance that contains validators to be setup.
*/
function setUpValidators(control, dir) {
	const validators = getControlValidators(control);
	if (dir.validator !== null) control.setValidators(mergeValidators(validators, dir.validator));
	else if (typeof validators === "function") control.setValidators([validators]);
	const asyncValidators = getControlAsyncValidators(control);
	if (dir.asyncValidator !== null) control.setAsyncValidators(mergeValidators(asyncValidators, dir.asyncValidator));
	else if (typeof asyncValidators === "function") control.setAsyncValidators([asyncValidators]);
	const onValidatorChange = () => control.updateValueAndValidity();
	registerOnValidatorChange(dir._rawValidators, onValidatorChange);
	registerOnValidatorChange(dir._rawAsyncValidators, onValidatorChange);
}
/**
* Cleans up sync and async directive validators on provided form control.
* This function reverts the setup performed by the `setUpValidators` function, i.e.
* removes directive-specific validators from a given control instance.
*
* @param control Form control from where directive validators should be removed.
* @param dir Directive instance that contains validators to be removed.
* @returns true if a control was updated as a result of this action.
*/
function cleanUpValidators(control, dir) {
	let isControlUpdated = false;
	if (control !== null) {
		if (dir.validator !== null) {
			const validators = getControlValidators(control);
			if (Array.isArray(validators) && validators.length > 0) {
				const updatedValidators = validators.filter((validator) => validator !== dir.validator);
				if (updatedValidators.length !== validators.length) {
					isControlUpdated = true;
					control.setValidators(updatedValidators);
				}
			}
		}
		if (dir.asyncValidator !== null) {
			const asyncValidators = getControlAsyncValidators(control);
			if (Array.isArray(asyncValidators) && asyncValidators.length > 0) {
				const updatedAsyncValidators = asyncValidators.filter((asyncValidator) => asyncValidator !== dir.asyncValidator);
				if (updatedAsyncValidators.length !== asyncValidators.length) {
					isControlUpdated = true;
					control.setAsyncValidators(updatedAsyncValidators);
				}
			}
		}
	}
	const noop = () => {};
	registerOnValidatorChange(dir._rawValidators, noop);
	registerOnValidatorChange(dir._rawAsyncValidators, noop);
	return isControlUpdated;
}
function setUpViewChangePipeline(control, dir) {
	dir.valueAccessor.registerOnChange((newValue) => {
		control._pendingValue = newValue;
		control._pendingChange = true;
		control._pendingDirty = true;
		if (control.updateOn === "change") updateControl(control, dir);
	});
}
function setUpBlurPipeline(control, dir) {
	dir.valueAccessor.registerOnTouched(() => {
		control._pendingTouched = true;
		if (control.updateOn === "blur" && control._pendingChange) updateControl(control, dir);
		if (control.updateOn !== "submit") control.markAsTouched();
	});
}
function updateControl(control, dir) {
	if (control._pendingDirty) control.markAsDirty();
	control.setValue(control._pendingValue, { emitModelToViewChange: false });
	dir.viewToModelUpdate(control._pendingValue);
	control._pendingChange = false;
}
function setUpModelChangePipeline(control, dir) {
	const onChange = (newValue, emitModelEvent) => {
		dir.valueAccessor.writeValue(newValue);
		if (emitModelEvent) dir.viewToModelUpdate(newValue);
	};
	control.registerOnChange(onChange);
	dir._registerOnDestroy(() => {
		control._unregisterOnChange(onChange);
	});
}
/**
* Links a FormGroup or FormArray instance and corresponding Form directive by setting up validators
* present in the view.
*
* @param control FormGroup or FormArray instance that should be linked.
* @param dir Directive that provides view validators.
*/
function setUpFormContainer(control, dir) {
	if (control == null && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) _throwError(dir, "Cannot find control with");
	setUpValidators(control, dir);
}
/**
* Reverts the setup performed by the `setUpFormContainer` function.
*
* @param control FormGroup or FormArray instance that should be cleaned up.
* @param dir Directive that provided view validators.
* @returns true if a control was updated as a result of this action.
*/
function cleanUpFormContainer(control, dir) {
	return cleanUpValidators(control, dir);
}
function _noControlError(dir) {
	return _throwError(dir, "There is no FormControl instance attached to form control element with");
}
function _throwError(dir, message) {
	const messageEnd = _describeControlLocation(dir);
	throw new Error(`${message} ${messageEnd}`);
}
function _describeControlLocation(dir) {
	const path = dir.path;
	if (path && path.length > 1) return `path: '${path.join(" -> ")}'`;
	if (path?.[0]) return `name: '${path}'`;
	return "unspecified name attribute";
}
function _throwMissingValueAccessorError(dir) {
	const loc = _describeControlLocation(dir);
	throw new RuntimeError(-1203, `No value accessor for form control ${loc}.`);
}
function _throwInvalidValueAccessorError(dir) {
	const loc = _describeControlLocation(dir);
	throw new RuntimeError(1200, `Value accessor was not provided as an array for form control with ${loc}. Check that the \`NG_VALUE_ACCESSOR\` token is configured as a \`multi: true\` provider.`);
}
function isPropertyUpdated(changes, viewModel) {
	if (!Object.hasOwn(changes, "model")) return false;
	const change = changes["model"];
	if (change.isFirstChange()) return true;
	return !Object.is(viewModel, change.currentValue);
}
function isBuiltInAccessor(valueAccessor) {
	return Object.getPrototypeOf(valueAccessor.constructor) === BuiltInControlValueAccessor;
}
function syncPendingControls(form, directives) {
	form._syncPendingControls();
	directives.forEach((dir) => {
		const control = dir.control;
		if (control.updateOn === "submit" && control._pendingChange) {
			dir.viewToModelUpdate(control._pendingValue);
			control._pendingChange = false;
		}
	});
}
function selectValueAccessor(dir, valueAccessors) {
	if (!valueAccessors) return null;
	if (!Array.isArray(valueAccessors) && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) _throwInvalidValueAccessorError(dir);
	let defaultAccessor = void 0;
	let builtinAccessor = void 0;
	let customAccessor = void 0;
	valueAccessors.forEach((v) => {
		if (v.constructor === DefaultValueAccessor) defaultAccessor = v;
		else if (isBuiltInAccessor(v)) {
			if (builtinAccessor && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) _throwError(dir, "More than one built-in value accessor matches form control with");
			builtinAccessor = v;
		} else {
			if (customAccessor && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) _throwError(dir, "More than one custom value accessor matches form control with");
			customAccessor = v;
		}
	});
	if (customAccessor) return customAccessor;
	if (builtinAccessor) return builtinAccessor;
	if (defaultAccessor) return defaultAccessor;
	if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) _throwError(dir, "No valid value accessor for form control with");
	return null;
}
function removeListItem$1(list, el) {
	const index = list.indexOf(el);
	if (index > -1) list.splice(index, 1);
}
function _ngModelWarning(name, type, instance, warningConfig) {
	if (warningConfig === "never") return;
	if ((warningConfig === null || warningConfig === "once") && !type._ngModelWarningSentOnce || warningConfig === "always" && !instance._ngModelWarningSent) {
		console.warn(ngModelWarning(name));
		type._ngModelWarningSentOnce = true;
		instance._ngModelWarningSent = true;
	}
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var NG_CONTROL_INTEGRATION_PROVIDER = {
	provide: ɵFORM_CONTROL_INTEGRATION,
	useFactory: () => {
		const control = inject(NgControl, { self: true });
		return {
			setParseErrors: (source) => {
				control.setParseErrorSource(source);
			},
			set onReset(callback) {
				control.onReset = callback;
			}
		};
	}
};
/**
* @description
* A base class that all `FormControl`-based directives extend. It binds a `FormControl`
* object to a DOM element.
*
* @publicApi
*/
var NgControl = class extends AbstractControlDirective {
	/**
	* @description
	* The parent form for the control.
	*
	* @internal
	*/
	_parent = null;
	/**
	* @description
	* The name for the control
	*/
	name = null;
	/**
	* @description
	* The value accessor for the control
	*/
	valueAccessor = null;
	isCustomControlBased = false;
	userOnReset;
	resetSubscription;
	/** @internal */
	set onReset(callback) {
		this.userOnReset = callback;
		this.resetSubscription?.unsubscribe();
		this.resetSubscription = void 0;
		if (this.control) {
			this.resetSubscription = this.control.events.subscribe((event) => {
				if (event instanceof FormResetEvent && this.control) this.userOnReset?.(this.control.value);
			});
			this.subscription?.add(this.resetSubscription);
		}
	}
	isNativeFormElement = false;
	/**
	* Raw `ControlValueAccessor`s retrieved from DI.
	*/
	rawValueAccessors;
	_selectedValueAccessor = null;
	get selectedValueAccessor() {
		return this._selectedValueAccessor ??= selectValueAccessor(this, this.rawValueAccessors);
	}
	/**
	* Validator function that returns current parse errors.
	*/
	parseErrorsValidator = null;
	/**
	* Renderer for setting native DOM properties. Set by subclass constructor.
	*/
	renderer;
	/**
	* Injector for creating effects. Set by subclass constructor.
	*/
	injector;
	requiredValidatorViaDi;
	/**
	* Container for any RxJS subscriptions related to the current control.
	*
	* This gets cleaned up and recreated when the control changes.
	*/
	subscription;
	/**
	* Tracks last bound values to avoid unnecessary FVC updates.
	*/
	customControlBindings = null;
	constructor(injector, renderer, rawValueAccessors) {
		super();
		this.injector = injector;
		this.renderer = renderer;
		this.rawValueAccessors = rawValueAccessors;
		this.injector?.get(DestroyRef)?.onDestroy(() => {
			this.removeParseErrorsValidator(this.control);
			this.subscription?.unsubscribe();
		});
	}
	setupCustomControl() {
		this.subscription?.unsubscribe();
		const cdr = this.injector?.get(ChangeDetectorRef);
		if (!this.control || !cdr) return;
		const markForCheck = cdr.markForCheck.bind(cdr);
		this.subscription = new Subscription();
		this.subscription.add(this.control.valueChanges.subscribe(markForCheck));
		this.subscription.add(this.control.statusChanges.subscribe(markForCheck));
		this.resetSubscription?.unsubscribe();
		this.resetSubscription = void 0;
		if (this.userOnReset) {
			this.resetSubscription = this.control.events.subscribe((event) => {
				if (event instanceof FormResetEvent && this.control) this.userOnReset?.(this.control.value);
			});
			this.subscription.add(this.resetSubscription);
		}
		if (this.parseErrorsValidator) this.control.addValidators(this.parseErrorsValidator);
	}
	/**
	* Internal control directive creation lifecycle hook.
	*
	* The presence of this method tells the compiler to install `ɵɵControlFeature`, which will
	* cause this directive to be recognized as a control directive by the `ɵcontrolCreate` and
	* `ɵcontrol` instructions.
	*
	* @internal
	*/
	ngControlCreate(host) {
		if (!host.nativeElement.hasAttribute?.("ngNoCva") && (this.rawValueAccessors && this.rawValueAccessors.length > 0 || this.valueAccessor !== null) || !host.customControl) return;
		this.isCustomControlBased = true;
		host.listenToCustomControlModel((value) => {
			this.control?.markAsDirty();
			this.control?.setValue(value, { emitModelToViewChange: false });
			this.viewToModelUpdate(value);
		});
		host.listenToCustomControlOutput("touch", () => {
			this.control?.markAsTouched();
		});
		this.customControlBindings = {};
		this.isNativeFormElement = isNativeFormElement(host.nativeElement);
		this.requiredValidatorViaDi = this._rawValidators.find((v) => v instanceof RequiredValidator);
	}
	ngControlUpdate(host, bindRequired) {
		if (!this.isCustomControlBased) return;
		const control = this.control;
		const bindings = this.customControlBindings;
		if (!Object.is(bindings.value, control.value)) {
			bindings.value = control.value;
			host.setCustomControlModelInput(control.value);
		}
		this.bindControlProperty(host, bindings, "touched", control.touched);
		this.bindControlProperty(host, bindings, "dirty", control.dirty);
		this.bindControlProperty(host, bindings, "valid", control.valid);
		this.bindControlProperty(host, bindings, "invalid", control.invalid);
		this.bindControlProperty(host, bindings, "pending", control.pending);
		this.bindControlProperty(host, bindings, "disabled", control.disabled);
		if (this.shouldBindRequired) this.bindControlProperty(host, bindings, "required", this.isRequired);
		const errorObject = control.errors;
		if (bindings.errors !== errorObject) {
			bindings.errors = errorObject;
			const errorArray = this._convertErrors(errorObject);
			host.setInputOnDirectives("errors", errorArray);
		}
	}
	/**
	* Returns true if the control is currently considered required, false otherwise.
	*
	* A control can be required either via `NG_VALIDATORS` including the `RequiredValidator`.
	*/
	get isRequired() {
		return (this.requiredValidatorViaDi?._enabled || this.control?._hasRequired()) ?? false;
	}
	/**
	* Whether the control should bind the `required` property (in custom control mode).
	*
	* Can be overridden by subclasses that handle `required` in a different way.
	*/
	get shouldBindRequired() {
		return true;
	}
	/**
	* Binds a status property to FVC, falling back to native DOM if FVC lacks the input.
	*/
	bindControlProperty(host, bindings, name, value) {
		if (bindings[name] === value) return;
		bindings[name] = value;
		const wasSet = host.setInputOnDirectives(name, value);
		if (this.isNativeFormElement && !wasSet && (name === "disabled" || name === "required") && this.renderer) setNativeDomProperty(this.renderer, host.nativeElement, name, value);
	}
	/**
	* Converts Reactive Forms errors to Signal Forms error format.
	*/
	_convertErrors(errors) {
		if (errors === null) return [];
		const control = this.control;
		return Object.entries(errors).map(([kind, context]) => {
			return new ReactiveValidationError({
				context,
				kind,
				control
			});
		});
	}
	/** @internal */
	setParseErrorSource(parseErrors) {
		if (parseErrors === void 0) return;
		let convertedErrors = null;
		const convertedParseErrors = computed(() => {
			const rawErrors = parseErrors();
			if (rawErrors.length === 0) return null;
			return rawErrors.reduce((acc, err) => {
				acc[err.kind] = err;
				return acc;
			}, {});
		}, ...wx.__global.ngDevMode ? [{ debugName: "convertedParseErrors" }] : /* istanbul ignore next */ []);
		this.parseErrorsValidator = (() => convertedErrors).bind(this);
		effect(() => {
			convertedErrors = convertedParseErrors();
			this.control?.updateValueAndValidity({ emitEvent: false });
		}, { injector: this.injector });
	}
	removeParseErrorsValidator(control) {
		if (this.parseErrorsValidator) {
			control?.removeValidators(this.parseErrorsValidator);
			control?.updateValueAndValidity({ emitEvent: false });
		}
	}
};
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* @description
* A base class for directives that contain multiple registered instances of `NgControl`.
* Only used by the forms module.
*
* @publicApi
*/
var ControlContainer = class extends AbstractControlDirective {
	/**
	* @description
	* The name for the control
	*/
	name;
	/**
	* @description
	* The top-level form directive for the control.
	*/
	get formDirective() {
		return null;
	}
	/**
	* @description
	* The path to this group.
	*/
	get path() {
		return null;
	}
};
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var AbstractControlStatus = class {
	_cd;
	constructor(cd) {
		this._cd = cd;
	}
	get isTouched() {
		this._cd?.control?._touched?.();
		return !!this._cd?.control?.touched;
	}
	get isUntouched() {
		return !!this._cd?.control?.untouched;
	}
	get isPristine() {
		this._cd?.control?._pristine?.();
		return !!this._cd?.control?.pristine;
	}
	get isDirty() {
		return !!this._cd?.control?.dirty;
	}
	get isValid() {
		this._cd?.control?._status?.();
		return !!this._cd?.control?.valid;
	}
	get isInvalid() {
		return !!this._cd?.control?.invalid;
	}
	get isPending() {
		return !!this._cd?.control?.pending;
	}
	get isSubmitted() {
		this._cd?._submitted?.();
		return !!this._cd?.submitted;
	}
};
var ngControlStatusHost = {
	"[class.ng-untouched]": "isUntouched",
	"[class.ng-touched]": "isTouched",
	"[class.ng-pristine]": "isPristine",
	"[class.ng-dirty]": "isDirty",
	"[class.ng-valid]": "isValid",
	"[class.ng-invalid]": "isInvalid",
	"[class.ng-pending]": "isPending"
};
/**
* @description
* Directive automatically applied to Angular form controls that sets CSS classes
* based on control status.
*
* @usageNotes
*
* ### CSS classes applied
*
* The following classes are applied as the properties become true:
*
* * ng-valid
* * ng-invalid
* * ng-pending
* * ng-pristine
* * ng-dirty
* * ng-untouched
* * ng-touched
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var NgControlStatus = class NgControlStatus extends AbstractControlStatus {
	constructor(cd) {
		super(cd);
	}
	static ɵfac = function NgControlStatus_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NgControlStatus)(ɵɵdirectiveInject(NgControl, 2));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: NgControlStatus,
		selectors: [
			[
				"",
				"formControlName",
				""
			],
			[
				"",
				"ngModel",
				""
			],
			[
				"",
				"formControl",
				""
			]
		],
		hostVars: 14,
		hostBindings: function NgControlStatus_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵclassProp("ng-untouched", ctx.isUntouched)("ng-touched", ctx.isTouched)("ng-pristine", ctx.isPristine)("ng-dirty", ctx.isDirty)("ng-valid", ctx.isValid)("ng-invalid", ctx.isInvalid)("ng-pending", ctx.isPending);
		},
		standalone: false,
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(NgControlStatus, [{
		type: Directive,
		args: [{
			selector: "[formControlName],[ngModel],[formControl]",
			host: ngControlStatusHost,
			standalone: false
		}]
	}], () => [{
		type: NgControl,
		decorators: [{ type: Self }]
	}], null);
})();
/**
* @description
* Directive automatically applied to Angular form groups that sets CSS classes
* based on control status (valid/invalid/dirty/etc). On groups, this includes the additional
* class ng-submitted.
*
* @see {@link NgControlStatus}
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var NgControlStatusGroup = class NgControlStatusGroup extends AbstractControlStatus {
	constructor(cd) {
		super(cd);
	}
	static ɵfac = function NgControlStatusGroup_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NgControlStatusGroup)(ɵɵdirectiveInject(ControlContainer, 10));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: NgControlStatusGroup,
		selectors: [
			[
				"",
				"formGroupName",
				""
			],
			[
				"",
				"formArrayName",
				""
			],
			[
				"",
				"ngModelGroup",
				""
			],
			[
				"",
				"formGroup",
				""
			],
			[
				"",
				"formArray",
				""
			],
			[
				"form",
				3,
				"ngNoForm",
				""
			],
			[
				"",
				"ngForm",
				""
			]
		],
		hostVars: 16,
		hostBindings: function NgControlStatusGroup_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵclassProp("ng-untouched", ctx.isUntouched)("ng-touched", ctx.isTouched)("ng-pristine", ctx.isPristine)("ng-dirty", ctx.isDirty)("ng-valid", ctx.isValid)("ng-invalid", ctx.isInvalid)("ng-pending", ctx.isPending)("ng-submitted", ctx.isSubmitted);
		},
		standalone: false,
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(NgControlStatusGroup, [{
		type: Directive,
		args: [{
			selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],[formArray],form:not([ngNoForm]),[ngForm]",
			host: {
				...ngControlStatusHost,
				"[class.ng-submitted]": "isSubmitted"
			},
			standalone: false
		}]
	}], () => [{
		type: ControlContainer,
		decorators: [{ type: Optional }, { type: Self }]
	}], null);
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* Tracks the value and validity state of a group of `FormControl` instances.
*
* A `FormGroup` aggregates the values of each child `FormControl` into one object,
* with each control name as the key.  It calculates its status by reducing the status values
* of its children. For example, if one of the controls in a group is invalid, the entire
* group becomes invalid.
*
* `FormGroup` is one of the four fundamental building blocks used to define forms in Angular,
* along with `FormControl`, `FormArray`, and `FormRecord`.
*
* When instantiating a `FormGroup`, pass in a collection of child controls as the first
* argument. The key for each child registers the name for the control.
*
* `FormGroup` is intended for use cases where the keys are known ahead of time.
* If you need to dynamically add and remove controls, use {@link FormRecord} instead.
*
* `FormGroup` accepts an optional type parameter `TControl`, which is an object type with inner
* control types as values.
*
* @usageNotes
*
* ### Create a form group with 2 controls
*
* ```ts
* const form = new FormGroup({
*   first: new FormControl('Nancy', Validators.minLength(2)),
*   last: new FormControl('Drew'),
* });
*
* console.log(form.value);   // {first: 'Nancy', last; 'Drew'}
* console.log(form.status);  // 'VALID'
* ```
*
* ### The type argument, and optional controls
*
* `FormGroup` accepts one generic argument, which is an object containing its inner controls.
* This type will usually be inferred automatically, but you can always specify it explicitly if you
* wish.
*
* If you have controls that are optional (i.e. they can be removed, you can use the `?` in the
* type):
*
* ```ts
* const form = new FormGroup<{
*   first: FormControl<string|null>,
*   middle?: FormControl<string|null>, // Middle name is optional.
*   last: FormControl<string|null>,
* }>({
*   first: new FormControl('Nancy'),
*   last: new FormControl('Drew'),
* });
* ```
*
* ### Create a form group with a group-level validator
*
* You include group-level validators as the second arg, or group-level async
* validators as the third arg. These come in handy when you want to perform validation
* that considers the value of more than one child control.
*
* ```ts
* const form = new FormGroup({
*   password: new FormControl('', Validators.minLength(2)),
*   passwordConfirm: new FormControl('', Validators.minLength(2)),
* }, passwordMatchValidator);
*
*
* function passwordMatchValidator(g: FormGroup) {
*    return g.get('password').value === g.get('passwordConfirm').value
*       ? null : {'mismatch': true};
* }
* ```
*
* Like `FormControl` instances, you choose to pass in
* validators and async validators as part of an options object.
*
* ```ts
* const form = new FormGroup({
*   password: new FormControl('')
*   passwordConfirm: new FormControl('')
* }, { validators: passwordMatchValidator, asyncValidators: otherValidator });
* ```
*
* ### Set the updateOn property for all controls in a form group
*
* The options object is used to set a default value for each child
* control's `updateOn` property. If you set `updateOn` to `'blur'` at the
* group level, all child controls default to 'blur', unless the child
* has explicitly specified a different `updateOn` value.
*
* ```ts
* const c = new FormGroup({
*   one: new FormControl()
* }, { updateOn: 'blur' });
* ```
*
* ### Using a FormGroup with optional controls
*
* It is possible to have optional controls in a FormGroup. An optional control can be removed later
* using `removeControl`, and can be omitted when calling `reset`. Optional controls must be
* declared optional in the group's type.
*
* ```ts
* const c = new FormGroup<{one?: FormControl<string>}>({
*   one: new FormControl('')
* });
* ```
*
* Notice that `c.value.one` has type `string|null|undefined`. This is because calling `c.reset({})`
* without providing the optional key `one` will cause it to become `null`.
*
* @see [Grouping form controls](guide/forms/reactive-forms#grouping-form-controls)
* @see [FormGroup and FormRecord](guide/forms/typed-forms#formgroup-and-formrecord)
*
* @publicApi
*/
var FormGroup = class extends AbstractControl {
	/**
	* Creates a new `FormGroup` instance.
	*
	* @param controls A collection of child controls. The key for each child is the name
	* under which it is registered.
	*
	* @param validatorOrOpts A synchronous validator function, or an array of
	* such functions, or an `AbstractControlOptions` object that contains validation functions
	* and a validation trigger.
	*
	* @param asyncValidator A single async validator or array of async validator functions
	*
	*/
	constructor(controls, validatorOrOpts, asyncValidator) {
		super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
		(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && validateFormGroupControls(controls);
		this.controls = controls;
		this._initObservables();
		this._setUpdateStrategy(validatorOrOpts);
		this._setUpControls();
		this.updateValueAndValidity({
			onlySelf: true,
			emitEvent: !!this.asyncValidator
		});
	}
	controls;
	registerControl(name, control) {
		const existingControl = this._find(name);
		if (existingControl) return existingControl;
		this.controls[name] = control;
		control.setParent(this);
		control._registerOnCollectionChange(this._onCollectionChange);
		return control;
	}
	addControl(name, control, options = {}) {
		this.registerControl(name, control);
		this.updateValueAndValidity({ emitEvent: options.emitEvent });
		this._onCollectionChange();
	}
	/**
	* Remove a control from this group. In a strongly-typed group, required controls cannot be
	* removed.
	*
	* This method also updates the value and validity of the control.
	*
	* @param name The control name to remove from the collection
	* @param options Specifies whether this FormGroup instance should emit events after a
	*     control is removed.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges` observables emit events with the latest status and value when the control is
	* removed. When false, no events are emitted.
	*/
	removeControl(name, options = {}) {
		const existingControl = this._find(name);
		if (existingControl) existingControl._registerOnCollectionChange(() => {});
		delete this.controls[name];
		this.updateValueAndValidity({ emitEvent: options.emitEvent });
		this._onCollectionChange();
	}
	setControl(name, control, options = {}) {
		const existingControl = this._find(name);
		if (existingControl) existingControl._registerOnCollectionChange(() => {});
		delete this.controls[name];
		if (control) this.registerControl(name, control);
		this.updateValueAndValidity({ emitEvent: options.emitEvent });
		this._onCollectionChange();
	}
	contains(controlName) {
		return this._find(controlName)?.enabled === true;
	}
	/**
	* Sets the value of the `FormGroup`. It accepts an object that matches
	* the structure of the group, with control names as keys.
	*
	* @usageNotes
	* ### Set the complete value for the form group
	*
	* ```ts
	* const form = new FormGroup({
	*   first: new FormControl(),
	*   last: new FormControl()
	* });
	*
	* console.log(form.value);   // {first: null, last: null}
	*
	* form.setValue({first: 'Nancy', last: 'Drew'});
	* console.log(form.value);   // {first: 'Nancy', last: 'Drew'}
	* ```
	*
	* @throws When strict checks fail, such as setting the value of a control
	* that doesn't exist or if you exclude a value of a control that does exist.
	*
	* @param value The new value for the control that matches the structure of the group.
	* @param options Configuration options that determine how the control propagates changes
	* and emits events after the value changes.
	* The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	* updateValueAndValidity} method.
	*
	* * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
	* false.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges`
	* observables emit events with the latest status and value when the control value is updated.
	* When false, no events are emitted.
	*/
	setValue(value, options = {}) {
		untracked(() => {
			assertAllValuesPresent(this, true, value);
			Object.keys(value).forEach((name) => {
				assertControlPresent(this, true, name);
				this.controls[name].setValue(value[name], {
					onlySelf: true,
					emitEvent: options.emitEvent
				});
			});
			this.updateValueAndValidity(options);
		});
	}
	/**
	* Patches the value of the `FormGroup`. It accepts an object with control
	* names as keys, and does its best to match the values to the correct controls
	* in the group.
	*
	* It accepts both super-sets and sub-sets of the group without throwing an error.
	*
	* @usageNotes
	* ### Patch the value for a form group
	*
	* ```ts
	* const form = new FormGroup({
	*    first: new FormControl(),
	*    last: new FormControl()
	* });
	* console.log(form.value);   // {first: null, last: null}
	*
	* form.patchValue({first: 'Nancy'});
	* console.log(form.value);   // {first: 'Nancy', last: null}
	* ```
	*
	* @param value The object that matches the structure of the group.
	* @param options Configuration options that determine how the control propagates changes and
	* emits events after the value is patched.
	* * `onlySelf`: When true, each change only affects this control and not its parent. Default is
	* true.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges` observables emit events with the latest status and value when the control value
	* is updated. When false, no events are emitted. The configuration options are passed to
	* the {@link AbstractControl#updateValueAndValidity updateValueAndValidity} method.
	*/
	patchValue(value, options = {}) {
		if (value == null) return;
		Object.keys(value).forEach((name) => {
			const existingControl = this._find(name);
			if (existingControl) existingControl.patchValue(value[name], {
				onlySelf: true,
				emitEvent: options.emitEvent
			});
		});
		this.updateValueAndValidity(options);
	}
	/**
	* Resets the `FormGroup`, marks all descendants `pristine` and `untouched` and sets
	* the value of all descendants to their default values, or null if no defaults were provided.
	*
	* You reset to a specific form state by passing in a map of states
	* that matches the structure of your form, with control names as keys. The state
	* is a standalone value or a form state object with both a value and a disabled
	* status.
	*
	* @param value Resets the control with an initial value,
	* or an object that defines the initial value and disabled state.
	*
	* @param options Configuration options that determine how the control propagates changes
	* and emits events when the group is reset.
	* * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
	* false.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges`
	* observables emit events with the latest status and value when the control is reset.
	* When false, no events are emitted.
	* The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	* updateValueAndValidity} method.
	*
	* @usageNotes
	*
	* ### Reset the form group values
	*
	* ```ts
	* const form = new FormGroup({
	*   first: new FormControl('first name'),
	*   last: new FormControl('last name')
	* });
	*
	* console.log(form.value);  // {first: 'first name', last: 'last name'}
	*
	* form.reset({ first: 'name', last: 'last name' });
	*
	* console.log(form.value);  // {first: 'name', last: 'last name'}
	* ```
	*
	* ### Reset the form group values and disabled status
	*
	* ```ts
	* const form = new FormGroup({
	*   first: new FormControl('first name'),
	*   last: new FormControl('last name')
	* });
	*
	* form.reset({
	*   first: {value: 'name', disabled: true},
	*   last: 'last'
	* });
	*
	* console.log(form.value);  // {last: 'last'}
	* console.log(form.get('first').status);  // 'DISABLED'
	* ```
	*/
	reset(value = {}, options = {}) {
		this._forEachChild((control, name) => {
			control.reset(value ? value[name] : null, {
				...options,
				onlySelf: true
			});
		});
		this._updatePristine(options, this);
		this._updateTouched(options, this);
		this.updateValueAndValidity(options);
		if (options?.emitEvent !== false) this._events.next(new FormResetEvent(this));
	}
	/**
	* The aggregate value of the `FormGroup`, including any disabled controls.
	*
	* Retrieves all values regardless of disabled status.
	*/
	getRawValue() {
		return this._reduceChildren({}, (acc, control, name) => {
			acc[name] = control.getRawValue();
			return acc;
		});
	}
	/** @internal */
	_syncPendingControls() {
		let subtreeUpdated = this._reduceChildren(false, (updated, child) => {
			return child._syncPendingControls() ? true : updated;
		});
		if (subtreeUpdated) this.updateValueAndValidity({ onlySelf: true });
		return subtreeUpdated;
	}
	/** @internal */
	_forEachChild(cb) {
		Object.keys(this.controls).forEach((key) => {
			const control = this.controls[key];
			control && cb(control, key);
		});
	}
	/** @internal */
	_setUpControls() {
		this._forEachChild((control) => {
			control.setParent(this);
			control._registerOnCollectionChange(this._onCollectionChange);
		});
	}
	/** @internal */
	_updateValue() {
		this.value = this._reduceValue();
	}
	/** @internal */
	_anyControls(condition) {
		for (const [controlName, control] of Object.entries(this.controls)) if (this.contains(controlName) && condition(control)) return true;
		return false;
	}
	/** @internal */
	_reduceValue() {
		return this._reduceChildren({}, (acc, control, name) => {
			if (control.enabled || this.disabled) acc[name] = control.value;
			return acc;
		});
	}
	/** @internal */
	_reduceChildren(initValue, fn) {
		let res = initValue;
		this._forEachChild((control, name) => {
			res = fn(res, control, name);
		});
		return res;
	}
	/** @internal */
	_allControlsDisabled() {
		for (const controlName of Object.keys(this.controls)) if (this.controls[controlName].enabled) return false;
		return Object.keys(this.controls).length > 0 || this.disabled;
	}
	/** @internal */
	_find(name) {
		return hasOwnControl(this.controls, name) ? this.controls[name] : null;
	}
};
/**
* Will validate that none of the controls has a key with a dot
* Throws other wise
*/
function validateFormGroupControls(controls) {
	const invalidKeys = Object.keys(controls).filter((key) => key.includes("."));
	if (invalidKeys.length > 0) console.warn(`FormGroup keys cannot include \`.\`, please replace the keys for: ${invalidKeys.join(",")}.`);
}
/**
* Tracks the value and validity state of a collection of `FormControl` instances, each of which has
* the same value type.
*
* `FormRecord` is very similar to {@link FormGroup}, except it can be used with a dynamic keys,
* with controls added and removed as needed.
*
* `FormRecord` accepts one generic argument, which describes the type of the controls it contains.
*
* @usageNotes
*
* ```ts
* let numbers = new FormRecord({bill: new FormControl('415-123-456')});
* numbers.addControl('bob', new FormControl('415-234-567'));
* numbers.removeControl('bill');
* ```
*
* @see [FormGroup and FormRecord](guide/forms/typed-forms#formgroup-and-formrecord)
*
* @publicApi
*/
var FormRecord = class extends FormGroup {};
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var formDirectiveProvider$1 = {
	provide: ControlContainer,
	useExisting: forwardRef(() => NgForm)
};
var resolvedPromise$1 = (() => wx.__window.Promise.resolve())();
/**
* @description
* Creates a top-level `FormGroup` instance and binds it to a form
* to track aggregate form value and validation status.
*
* As soon as you import the `FormsModule`, this directive becomes active by default on
* all `<form>` tags.  You don't need to add a special selector.
*
* You optionally export the directive into a local template variable using `ngForm` as the key
* (ex: `#myForm="ngForm"`). This is optional, but useful.  Many properties from the underlying
* `FormGroup` instance are duplicated on the directive itself, so a reference to it
* gives you access to the aggregate value and validity status of the form, as well as
* user interaction properties like `dirty` and `touched`.
*
* To register child controls with the form, use `NgModel` with a `name`
* attribute. You may use `NgModelGroup` to create sub-groups within the form.
*
* If necessary, listen to the directive's `ngSubmit` event to be notified when the user has
* triggered a form submission. The `ngSubmit` event emits the original form
* submission event.
*
* In template driven forms, all `<form>` tags are automatically tagged as `NgForm`.
* To import the `FormsModule` but skip its usage in some forms,
* for example, to use native HTML5 validation, add the `ngNoForm` and the `<form>`
* tags won't create an `NgForm` directive. In reactive forms, using `ngNoForm` is
* unnecessary because the `<form>` tags are inert. In that case, you would
* refrain from using the `formGroup` directive.
*
* @usageNotes
*
* ### Listening for form submission
*
* The following example shows how to capture the form values from the "ngSubmit" event.
*
* {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
*
* ### Setting the update options
*
* The following example shows you how to change the "updateOn" option from its default using
* ngFormOptions.
*
* ```html
* <form [ngFormOptions]="{updateOn: 'blur'}">
*    <input name="one" ngModel>  <!-- this ngModel will update on blur -->
* </form>
* ```
*
* ### Native DOM validation UI
*
* In order to prevent the native DOM form validation UI from interfering with Angular's form
* validation, Angular automatically adds the `novalidate` attribute on any `<form>` whenever
* `FormModule` or `ReactiveFormModule` are imported into the application.
* If you want to explicitly enable native DOM validation UI with Angular forms, you can add the
* `ngNativeValidate` attribute to the `<form>` element:
*
* ```html
* <form ngNativeValidate>
*   ...
* </form>
* ```
*
* @ngModule FormsModule
* @publicApi
*/
var NgForm = class NgForm extends ControlContainer {
	callSetDisabledState;
	/**
	* @description
	* Returns whether the form submission has been triggered.
	*/
	get submitted() {
		return untracked(this.submittedReactive);
	}
	/** @internal */
	_submitted = computed(() => this.submittedReactive(), ...wx.__global.ngDevMode ? [{ debugName: "_submitted" }] : /* istanbul ignore next */ []);
	submittedReactive = signal(false, ...wx.__global.ngDevMode ? [{ debugName: "submittedReactive" }] : /* istanbul ignore next */ []);
	_directives = /* @__PURE__ */ new Set();
	/**
	* @description
	* The `FormGroup` instance created for this form.
	*/
	form;
	/**
	* @description
	* Event emitter for the "ngSubmit" event
	*/
	ngSubmit = new EventEmitter();
	/**
	* @description
	* Tracks options for the `NgForm` instance.
	*
	* **updateOn**: Sets the default `updateOn` value for all child `NgModels` below it
	* unless explicitly set by a child `NgModel` using `ngModelOptions`). Defaults to 'change'.
	* Possible values: `'change'` | `'blur'` | `'submit'`.
	*
	*/
	options;
	constructor(validators, asyncValidators, callSetDisabledState) {
		super();
		this.callSetDisabledState = callSetDisabledState;
		this.form = new FormGroup({}, composeValidators(validators), composeAsyncValidators(asyncValidators));
	}
	/** @docs-private */
	ngAfterViewInit() {
		this._setUpdateStrategy();
	}
	/**
	* @description
	* The directive instance.
	*/
	get formDirective() {
		return this;
	}
	/**
	* @description
	* The internal `FormGroup` instance.
	*/
	get control() {
		return this.form;
	}
	/**
	* @description
	* Returns an array representing the path to this group. Because this directive
	* always lives at the top level of a form, it is always an empty array.
	*/
	get path() {
		return [];
	}
	/**
	* @description
	* Returns a map of the controls in this group.
	*/
	get controls() {
		return this.form.controls;
	}
	/**
	* @description
	* Method that sets up the control directive in this group, re-calculates its value
	* and validity, and adds the instance to the internal list of directives.
	*
	* @param dir The `NgModel` directive instance.
	*/
	addControl(dir) {
		resolvedPromise$1.then(() => {
			dir.control = this._findContainer(dir.path).registerControl(dir.name, dir.control);
			dir._setupWithForm(this.callSetDisabledState);
			dir.control.updateValueAndValidity({ emitEvent: false });
			this._directives.add(dir);
		});
	}
	/**
	* @description
	* Retrieves the `FormControl` instance from the provided `NgModel` directive.
	*
	* @param dir The `NgModel` directive instance.
	*/
	getControl(dir) {
		return this.form.get(dir.path);
	}
	/**
	* @description
	* Removes the `NgModel` instance from the internal list of directives
	*
	* @param dir The `NgModel` directive instance.
	*/
	removeControl(dir) {
		resolvedPromise$1.then(() => {
			this._findContainer(dir.path)?.removeControl(dir.name);
			this._directives.delete(dir);
		});
	}
	/**
	* @description
	* Adds a new `NgModelGroup` directive instance to the form.
	*
	* @param dir The `NgModelGroup` directive instance.
	*/
	addFormGroup(dir) {
		resolvedPromise$1.then(() => {
			const container = this._findContainer(dir.path);
			const group = new FormGroup({});
			setUpFormContainer(group, dir);
			container.registerControl(dir.name, group);
			group.updateValueAndValidity({ emitEvent: false });
		});
	}
	/**
	* @description
	* Removes the `NgModelGroup` directive instance from the form.
	*
	* @param dir The `NgModelGroup` directive instance.
	*/
	removeFormGroup(dir) {
		resolvedPromise$1.then(() => {
			this._findContainer(dir.path)?.removeControl?.(dir.name);
		});
	}
	/**
	* @description
	* Retrieves the `FormGroup` for a provided `NgModelGroup` directive instance
	*
	* @param dir The `NgModelGroup` directive instance.
	*/
	getFormGroup(dir) {
		return this.form.get(dir.path);
	}
	/**
	* Sets the new value for the provided `NgControl` directive.
	*
	* @param dir The `NgControl` directive instance.
	* @param value The new value for the directive's control.
	*/
	updateModel(dir, value) {
		resolvedPromise$1.then(() => {
			this.form.get(dir.path).setValue(value);
		});
	}
	/**
	* @description
	* Sets the value for this `FormGroup`.
	*
	* @param value The new value
	*/
	setValue(value) {
		this.control.setValue(value);
	}
	/**
	* @description
	* Method called when the "submit" event is triggered on the form.
	* Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
	*
	* @param $event The "submit" event object
	*/
	onSubmit($event) {
		this.submittedReactive.set(true);
		syncPendingControls(this.form, this._directives);
		this.ngSubmit.emit($event);
		this.form._events.next(new FormSubmittedEvent(this.control));
		return $event?.target?.method === "dialog";
	}
	/**
	* @description
	* Method called when the "reset" event is triggered on the form.
	*/
	onReset() {
		this.resetForm();
	}
	/**
	* @description
	* Resets the form to an initial value and resets its submitted status.
	*
	* @param value The new value for the form.
	*/
	resetForm(value = void 0) {
		this.form.reset(value);
		this.submittedReactive.set(false);
	}
	_setUpdateStrategy() {
		if (this.options && this.options.updateOn != null) this.form._updateOn = this.options.updateOn;
	}
	_findContainer(path) {
		path.pop();
		return path.length ? this.form.get(path) : this.form;
	}
	static ɵfac = function NgForm_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NgForm)(ɵɵdirectiveInject(NG_VALIDATORS, 10), ɵɵdirectiveInject(NG_ASYNC_VALIDATORS, 10), ɵɵdirectiveInject(CALL_SET_DISABLED_STATE, 8));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: NgForm,
		selectors: [
			[
				"form",
				3,
				"ngNoForm",
				"",
				3,
				"formGroup",
				"",
				3,
				"formArray",
				""
			],
			["ng-form"],
			[
				"",
				"ngForm",
				""
			]
		],
		hostBindings: function NgForm_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("submit", function NgForm_submit_HostBindingHandler($event) {
				return ctx.onSubmit($event);
			})("reset", function NgForm_reset_HostBindingHandler() {
				return ctx.onReset();
			});
		},
		inputs: { options: [
			0,
			"ngFormOptions",
			"options"
		] },
		outputs: { ngSubmit: "ngSubmit" },
		exportAs: ["ngForm"],
		standalone: false,
		features: [ɵɵProvidersFeature([formDirectiveProvider$1]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(NgForm, [{
		type: Directive,
		args: [{
			selector: "form:not([ngNoForm]):not([formGroup]):not([formArray]),ng-form,[ngForm]",
			providers: [formDirectiveProvider$1],
			host: {
				"(submit)": "onSubmit($event)",
				"(reset)": "onReset()"
			},
			outputs: ["ngSubmit"],
			exportAs: "ngForm",
			standalone: false
		}]
	}], () => [
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_ASYNC_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [{ type: Optional }, {
				type: Inject,
				args: [CALL_SET_DISABLED_STATE]
			}]
		}
	], { options: [{
		type: Input,
		args: ["ngFormOptions"]
	}] });
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
function removeListItem(list, el) {
	const index = list.indexOf(el);
	if (index > -1) list.splice(index, 1);
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
function isFormControlState(formState) {
	return typeof formState === "object" && formState !== null && Object.keys(formState).length === 2 && "value" in formState && "disabled" in formState;
}
var FormControl = class FormControl extends AbstractControl {
	/** @publicApi */
	defaultValue = null;
	/** @internal */
	_onChange = [];
	/** @internal */
	_pendingValue;
	/** @internal */
	_pendingChange = false;
	constructor(formState = null, validatorOrOpts, asyncValidator) {
		super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
		this._applyFormState(formState);
		this._setUpdateStrategy(validatorOrOpts);
		this._initObservables();
		this.updateValueAndValidity({
			onlySelf: true,
			emitEvent: !!this.asyncValidator
		});
		if (isOptionsObj(validatorOrOpts) && (validatorOrOpts.nonNullable || validatorOrOpts.initialValueIsDefault)) {
			if (isFormControlState(formState)) this.defaultValue = formState.value;
			else this.defaultValue = formState;
		}
	}
	setValue(value, options = {}) {
		untracked(() => {
			this.value = this._pendingValue = value;
			if (this._onChange.length && options.emitModelToViewChange !== false) this._onChange.forEach((changeFn) => changeFn(this.value, options.emitViewToModelChange !== false));
			this.updateValueAndValidity(options);
		});
	}
	patchValue(value, options = {}) {
		this.setValue(value, options);
	}
	reset(formState = this.defaultValue, options = {}) {
		this._applyFormState(formState);
		this.markAsPristine(options);
		this.markAsUntouched(options);
		this.setValue(this.value, options);
		if (options.overwriteDefaultValue) this.defaultValue = this.value;
		this._pendingChange = false;
		if (options?.emitEvent !== false) this._events.next(new FormResetEvent(this));
	}
	/**  @internal */
	_updateValue() {}
	/**  @internal */
	_anyControls(condition) {
		return false;
	}
	/**  @internal */
	_allControlsDisabled() {
		return this.disabled;
	}
	registerOnChange(fn) {
		this._onChange.push(fn);
	}
	/** @internal */
	_unregisterOnChange(fn) {
		removeListItem(this._onChange, fn);
	}
	registerOnDisabledChange(fn) {
		this._onDisabledChange.push(fn);
	}
	/** @internal */
	_unregisterOnDisabledChange(fn) {
		removeListItem(this._onDisabledChange, fn);
	}
	/** @internal */
	_forEachChild(cb) {}
	/** @internal */
	_syncPendingControls() {
		if (this.updateOn === "submit") {
			if (this._pendingDirty) this.markAsDirty();
			if (this._pendingTouched) this.markAsTouched();
			if (this._pendingChange) {
				this.setValue(this._pendingValue, {
					onlySelf: true,
					emitModelToViewChange: false
				});
				return true;
			}
		}
		return false;
	}
	_applyFormState(formState) {
		if (isFormControlState(formState)) {
			this.value = this._pendingValue = formState.value;
			formState.disabled ? this.disable({
				onlySelf: true,
				emitEvent: false
			}) : this.enable({
				onlySelf: true,
				emitEvent: false
			});
		} else this.value = this._pendingValue = formState;
	}
};
/**
* @description
* Asserts that the given control is an instance of `FormControl`
*
* @see [Utility functions for narrowing form control types](guide/forms/reactive-forms#utility-functions-for-narrowing-form-control-types)
*
* @publicApi
*/
var isFormControl = (control) => control instanceof FormControl;
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* @description
* A base class for code shared between the `NgModelGroup` and `FormGroupName` directives.
*
* @publicApi
*/
var AbstractFormGroupDirective = class AbstractFormGroupDirective extends ControlContainer {
	/**
	* @description
	* The parent control for the group
	*
	* @internal
	*/
	_parent;
	/** @docs-private */
	ngOnInit() {
		this._checkParentType();
		this.formDirective.addFormGroup(this);
	}
	/** @docs-private */
	ngOnDestroy() {
		this.formDirective?.removeFormGroup(this);
	}
	/**
	* @description
	* The `FormGroup` bound to this directive.
	*/
	get control() {
		return this.formDirective.getFormGroup(this);
	}
	/**
	* @description
	* The path to this group from the top-level directive.
	*/
	get path() {
		return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
	}
	/**
	* @description
	* The top-level directive for this group if present, otherwise null.
	*/
	get formDirective() {
		return this._parent ? this._parent.formDirective : null;
	}
	/** @internal */
	_checkParentType() {}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵAbstractFormGroupDirective_BaseFactory;
		return function AbstractFormGroupDirective_Factory(__ngFactoryType__) {
			return (ɵAbstractFormGroupDirective_BaseFactory || (ɵAbstractFormGroupDirective_BaseFactory = ɵɵgetInheritedFactory(AbstractFormGroupDirective)))(__ngFactoryType__ || AbstractFormGroupDirective);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: AbstractFormGroupDirective,
		standalone: false,
		features: [ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(AbstractFormGroupDirective, [{
		type: Directive,
		args: [{ standalone: false }]
	}], null, null);
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
function modelParentException() {
	return new RuntimeError(1350, `
    ngModel cannot be used to register form controls with a parent formGroup directive.  Try using
    formGroup's partner directive "formControlName" instead.  Example:

    ${formControlNameExample}

    Or, if you'd like to avoid registering this form control, indicate that it's standalone in ngModelOptions:

    Example:

    ${ngModelWithFormGroupExample}`);
}
function formGroupNameException() {
	return new RuntimeError(1351, `
    ngModel cannot be used to register form controls with a parent formGroupName or formArrayName directive.

    Option 1: Use formControlName instead of ngModel (reactive strategy):

    ${formGroupNameExample}

    Option 2:  Update ngModel's parent be ngModelGroup (template-driven strategy):

    ${ngModelGroupExample}`);
}
function ngModelInChildComponentWarning(containerTypeName) {
	return formatRuntimeError(-1354, `ngModel on a form control inside a child component cannot register with the ${containerTypeName} in the parent component because @Host() stops injection at the component boundary. To register this control with the parent form, add viewProviders to the child component: @Component({ ..., viewProviders: [{ provide: ControlContainer, useExisting: ${containerTypeName} }] }). Or, to opt out of form registration, use [ngModelOptions]="{standalone: true}".`);
}
function missingNameException() {
	return new RuntimeError(1352, `If ngModel is used within a form tag, either the name attribute must be set or the form
    control must be defined as 'standalone' in ngModelOptions.

    Example 1: <input [(ngModel)]="person.firstName" name="first">
    Example 2: <input [(ngModel)]="person.firstName" [ngModelOptions]="{standalone: true}">`);
}
function modelGroupParentException() {
	return new RuntimeError(1353, `
    ngModelGroup cannot be used with a parent formGroup directive.

    Option 1: Use formGroupName instead of ngModelGroup (reactive strategy):

    ${formGroupNameExample}

    Option 2:  Use a regular form tag instead of the formGroup directive (template-driven strategy):

    ${ngModelGroupExample}`);
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var modelGroupProvider = {
	provide: ControlContainer,
	useExisting: forwardRef(() => NgModelGroup)
};
/**
* @description
* Creates and binds a `FormGroup` instance to a DOM element.
*
* This directive can only be used as a child of `NgForm` (within `<form>` tags).
*
* Use this directive to validate a sub-group of your form separately from the
* rest of your form, or if some values in your domain model make more sense
* to consume together in a nested object.
*
* Provide a name for the sub-group and it will become the key
* for the sub-group in the form's full value. If you need direct access, export the directive into
* a local template variable using `ngModelGroup` (ex: `#myGroup="ngModelGroup"`).
*
* @usageNotes
*
* ### Consuming controls in a grouping
*
* The following example shows you how to combine controls together in a sub-group
* of the form.
*
* {@example forms/ts/ngModelGroup/ng_model_group_example.ts region='Component'}
*
* @ngModule FormsModule
* @publicApi
*/
var NgModelGroup = class NgModelGroup extends AbstractFormGroupDirective {
	/**
	* @description
	* Tracks the name of the `NgModelGroup` bound to the directive. The name corresponds
	* to a key in the parent `NgForm`.
	*/
	name = "";
	constructor(parent, validators, asyncValidators) {
		super();
		this._parent = parent;
		this._setValidators(validators);
		this._setAsyncValidators(asyncValidators);
	}
	/** @internal */
	_checkParentType() {
		if (!(this._parent instanceof NgModelGroup) && !(this._parent instanceof NgForm) && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) throw modelGroupParentException();
	}
	static ɵfac = function NgModelGroup_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NgModelGroup)(ɵɵdirectiveInject(ControlContainer, 5), ɵɵdirectiveInject(NG_VALIDATORS, 10), ɵɵdirectiveInject(NG_ASYNC_VALIDATORS, 10));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: NgModelGroup,
		selectors: [[
			"",
			"ngModelGroup",
			""
		]],
		inputs: { name: [
			0,
			"ngModelGroup",
			"name"
		] },
		exportAs: ["ngModelGroup"],
		standalone: false,
		features: [ɵɵProvidersFeature([modelGroupProvider]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(NgModelGroup, [{
		type: Directive,
		args: [{
			selector: "[ngModelGroup]",
			providers: [modelGroupProvider],
			exportAs: "ngModelGroup",
			standalone: false
		}]
	}], () => [
		{
			type: ControlContainer,
			decorators: [{ type: Host }, { type: SkipSelf }]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_ASYNC_VALIDATORS]
				}
			]
		}
	], { name: [{
		type: Input,
		args: ["ngModelGroup"]
	}] });
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* @description
*
* Abstract class for top-level form directives (FormArrayDirective, FormGroupDirective) who bind an
* existing `Form` to a DOM element.
*
* @publicApi
*/
var AbstractFormDirective = class AbstractFormDirective extends ControlContainer {
	callSetDisabledState;
	/**
	* @description
	* Reports whether the form submission has been triggered.
	*/
	get submitted() {
		return untracked(this._submittedReactive);
	}
	set submitted(value) {
		this._submittedReactive.set(value);
	}
	/** @internal */
	_submitted = computed(() => this._submittedReactive(), ...wx.__global.ngDevMode ? [{ debugName: "_submitted" }] : /* istanbul ignore next */ []);
	_submittedReactive = signal(false, ...wx.__global.ngDevMode ? [{ debugName: "_submittedReactive" }] : /* istanbul ignore next */ []);
	/**
	* Reference to an old form group input value, which is needed to cleanup
	* old instance in case it was replaced with a new one.
	*/
	_oldForm;
	/**
	* Callback that should be invoked when controls in FormGroup or FormArray collection change
	* (added or removed). This callback triggers corresponding DOM updates.
	*/
	_onCollectionChange = () => this._updateDomValue();
	/**
	* @description
	* Tracks the list of added `FormControlName` instances
	*/
	directives = [];
	constructor(validators, asyncValidators, callSetDisabledState) {
		super();
		this.callSetDisabledState = callSetDisabledState;
		this._setValidators(validators);
		this._setAsyncValidators(asyncValidators);
	}
	/** @nodoc */
	ngOnChanges(changes) {
		this.onChanges(changes);
	}
	/** @nodoc */
	ngOnDestroy() {
		this.onDestroy();
	}
	/** @nodoc */
	onChanges(changes) {
		this._checkFormPresent();
		if (Object.hasOwn(changes, "form")) {
			this._updateValidators();
			this._updateDomValue();
			this._updateRegistrations();
			this._oldForm = this.form;
		}
	}
	/** @nodoc */
	onDestroy() {
		if (this.form) {
			cleanUpValidators(this.form, this);
			if (this.form._onCollectionChange === this._onCollectionChange) this.form._registerOnCollectionChange(() => {});
		}
	}
	/**
	* @description
	* Returns this directive's instance.
	*/
	get formDirective() {
		return this;
	}
	/**
	* @description
	* Returns an array representing the path to this group. Because this directive
	* always lives at the top level of a form, it always an empty array.
	*/
	get path() {
		return [];
	}
	/**
	* @description
	* Method that sets up the control directive in this group, re-calculates its value
	* and validity, and adds the instance to the internal list of directives.
	*
	* @param dir The `FormControlName` directive instance.
	*/
	addControl(dir) {
		const ctrl = this.form.get(dir.path);
		dir._setupWithForm(ctrl, this.callSetDisabledState);
		ctrl.updateValueAndValidity({ emitEvent: false });
		this.directives.push(dir);
		return ctrl;
	}
	/**
	* @description
	* Retrieves the `FormControl` instance from the provided `FormControlName` directive
	*
	* @param dir The `FormControlName` directive instance.
	*/
	getControl(dir) {
		return this.form.get(dir.path);
	}
	/**
	* @description
	* Removes the `FormControlName` instance from the internal list of directives
	*
	* @param dir The `FormControlName` directive instance.
	*/
	removeControl(dir) {
		cleanUpControl(dir.control || null, dir, false);
		removeListItem$1(this.directives, dir);
	}
	/**
	* Adds a new `FormGroupName` directive instance to the form.
	*
	* @param dir The `FormGroupName` directive instance.
	*/
	addFormGroup(dir) {
		this._setUpFormContainer(dir);
	}
	/**
	* Performs the necessary cleanup when a `FormGroupName` directive instance is removed from the
	* view.
	*
	* @param dir The `FormGroupName` directive instance.
	*/
	removeFormGroup(dir) {
		this._cleanUpFormContainer(dir);
	}
	/**
	* @description
	* Retrieves the `FormGroup` for a provided `FormGroupName` directive instance
	*
	* @param dir The `FormGroupName` directive instance.
	*/
	getFormGroup(dir) {
		return this.form.get(dir.path);
	}
	/**
	* @description
	* Retrieves the `FormArray` for a provided `FormArrayName` directive instance.
	*
	* @param dir The `FormArrayName` directive instance.
	*/
	getFormArray(dir) {
		return this.form.get(dir.path);
	}
	/**
	* Performs the necessary setup when a `FormArrayName` directive instance is added to the view.
	*
	* @param dir The `FormArrayName` directive instance.
	*/
	addFormArray(dir) {
		this._setUpFormContainer(dir);
	}
	/**
	* Performs the necessary cleanup when a `FormArrayName` directive instance is removed from the
	* view.
	*
	* @param dir The `FormArrayName` directive instance.
	*/
	removeFormArray(dir) {
		this._cleanUpFormContainer(dir);
	}
	/**
	* Sets the new value for the provided `FormControlName` directive.
	*
	* @param dir The `FormControlName` directive instance.
	* @param value The new value for the directive's control.
	*/
	updateModel(dir, value) {
		this.form.get(dir.path).setValue(value);
	}
	/**
	* @description
	* Method called when the "reset" event is triggered on the form.
	*/
	onReset() {
		this.resetForm();
	}
	/**
	* @description
	* Resets the form to an initial value and resets its submitted status.
	*
	* @param value The new value for the form.
	*/
	resetForm(value = void 0, options = {}) {
		this.form.reset(value, options);
		this._submittedReactive.set(false);
	}
	/**
	* @description
	* Method called with the "submit" event is triggered on the form.
	* Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
	*
	* @param $event The "submit" event object
	*/
	onSubmit($event) {
		this.submitted = true;
		syncPendingControls(this.form, this.directives);
		this.ngSubmit.emit($event);
		this.form._events.next(new FormSubmittedEvent(this.control));
		return $event?.target?.method === "dialog";
	}
	/** @internal */
	_updateDomValue() {
		this.directives.forEach((dir) => {
			const oldCtrl = dir.control;
			const newCtrl = this.form.get(dir.path);
			if (oldCtrl !== newCtrl) {
				cleanUpControl(oldCtrl || null, dir);
				if (isFormControl(newCtrl)) dir._setupWithForm(newCtrl, this.callSetDisabledState);
			}
		});
		this.form._updateTreeValidity({ emitEvent: false });
	}
	_setUpFormContainer(dir) {
		const ctrl = this.form.get(dir.path);
		setUpFormContainer(ctrl, dir);
		ctrl.updateValueAndValidity({ emitEvent: false });
	}
	_cleanUpFormContainer(dir) {
		const ctrl = this.form?.get(dir.path);
		if (ctrl) {
			if (cleanUpFormContainer(ctrl, dir)) ctrl.updateValueAndValidity({ emitEvent: false });
		}
	}
	_updateRegistrations() {
		this.form._registerOnCollectionChange(this._onCollectionChange);
		this._oldForm?._registerOnCollectionChange(() => {});
	}
	_updateValidators() {
		setUpValidators(this.form, this);
		if (this._oldForm) cleanUpValidators(this._oldForm, this);
	}
	_checkFormPresent() {
		if (!this.form && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) throw missingFormException();
	}
	static ɵfac = function AbstractFormDirective_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || AbstractFormDirective)(ɵɵdirectiveInject(NG_VALIDATORS, 10), ɵɵdirectiveInject(NG_ASYNC_VALIDATORS, 10), ɵɵdirectiveInject(CALL_SET_DISABLED_STATE, 8));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: AbstractFormDirective,
		features: [ɵɵInheritDefinitionFeature, ɵɵNgOnChangesFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(AbstractFormDirective, [{ type: Directive }], () => [
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_ASYNC_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [{ type: Optional }, {
				type: Inject,
				args: [CALL_SET_DISABLED_STATE]
			}]
		}
	], null);
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var formDirectiveProvider = {
	provide: ControlContainer,
	useExisting: forwardRef(() => FormGroupDirective)
};
/**
* @description
*
* Binds an existing `FormGroup` or `FormRecord` to a DOM element.
*
* This directive accepts an existing `FormGroup` instance. It will then use this
* `FormGroup` instance to match any child `FormControl`, `FormGroup`/`FormRecord`,
* and `FormArray` instances to child `FormControlName`, `FormGroupName`,
* and `FormArrayName` directives.
*
* @see [Reactive Forms Guide](guide/forms/reactive-forms)
* @see {@link AbstractControl}
*
* @usageNotes
* ### Register Form Group
*
* The following example registers a `FormGroup` with first name and last name controls,
* and listens for the *ngSubmit* event when the button is clicked.
*
* {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
*
* @ngModule ReactiveFormsModule
* @publicApi
*/
var FormGroupDirective = class FormGroupDirective extends AbstractFormDirective {
	/**
	* @description
	* Tracks the `FormGroup` bound to this directive.
	*/
	form = null;
	/**
	* @description
	* Emits an event when the form submission has been triggered.
	*/
	ngSubmit = new EventEmitter();
	/**
	* @description
	* Returns the `FormGroup` bound to this directive.
	*/
	get control() {
		return this.form;
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵFormGroupDirective_BaseFactory;
		return function FormGroupDirective_Factory(__ngFactoryType__) {
			return (ɵFormGroupDirective_BaseFactory || (ɵFormGroupDirective_BaseFactory = ɵɵgetInheritedFactory(FormGroupDirective)))(__ngFactoryType__ || FormGroupDirective);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: FormGroupDirective,
		selectors: [[
			"",
			"formGroup",
			""
		]],
		hostBindings: function FormGroupDirective_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("submit", function FormGroupDirective_submit_HostBindingHandler($event) {
				return ctx.onSubmit($event);
			})("reset", function FormGroupDirective_reset_HostBindingHandler() {
				return ctx.onReset();
			});
		},
		inputs: { form: [
			0,
			"formGroup",
			"form"
		] },
		outputs: { ngSubmit: "ngSubmit" },
		exportAs: ["ngForm"],
		standalone: false,
		features: [ɵɵProvidersFeature([formDirectiveProvider]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(FormGroupDirective, [{
		type: Directive,
		args: [{
			selector: "[formGroup]",
			providers: [formDirectiveProvider],
			host: {
				"(submit)": "onSubmit($event)",
				"(reset)": "onReset()"
			},
			exportAs: "ngForm",
			standalone: false
		}]
	}], null, {
		form: [{
			type: Input,
			args: ["formGroup"]
		}],
		ngSubmit: [{ type: Output }]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var formControlBinding$1 = {
	provide: NgControl,
	useExisting: forwardRef(() => NgModel)
};
/**
* `ngModel` forces an additional change detection run when its inputs change:
* E.g.:
* ```html
* <div>{{myModel.valid}}</div>
* <input [(ngModel)]="myValue" #myModel="ngModel">
* ```
* I.e. `ngModel` can export itself on the element and then be used in the template.
* Normally, this would result in expressions before the `input` that use the exported directive
* to have an old value as they have been
* dirty checked before. As this is a very common case for `ngModel`, we added this second change
* detection run.
*
* Notes:
* - this is just one extra run no matter how many `ngModel`s have been changed.
* - this is a general problem when using `exportAs` for directives!
*/
var resolvedPromise = (() => wx.__window.Promise.resolve())();
/**
* @description
* Creates a `FormControl` instance from a [domain
* model](https://en.wikipedia.org/wiki/Domain_model) and binds it to a form control element.
*
* The `FormControl` instance tracks the value, user interaction, and
* validation status of the control and keeps the view synced with the model. If used
* within a parent form, the directive also registers itself with the form as a child
* control.
*
* This directive is used by itself or as part of a larger form. Use the
* `ngModel` selector to activate it.
*
* It accepts a domain model as an optional `Input`. If you have a one-way binding
* to `ngModel` with `[]` syntax, changing the domain model's value in the component
* class sets the value in the view. If you have a two-way binding with `[()]` syntax
* (also known as 'banana-in-a-box syntax'), the value in the UI always syncs back to
* the domain model in your class.
*
* To inspect the properties of the associated `FormControl` (like the validity state),
* export the directive into a local template variable using `ngModel` as the key (ex:
* `#myVar="ngModel"`). You can then access the control using the directive's `field` property.
* However, the most commonly used properties (like `valid` and `dirty`) also exist on the control
* for direct access. See a full list of properties directly available in
* `AbstractControlDirective`.
*
* @see {@link RadioControlValueAccessor}
* @see {@link SelectControlValueAccessor}
*
* @usageNotes
*
* ### Using ngModel on a standalone control
*
* The following examples show a simple standalone control using `ngModel`:
*
* {@example forms/ts/simpleNgModel/simple_ng_model_example.ts region='Component'}
*
* When using the `ngModel` within `<form>` tags, you'll also need to supply a `name` attribute
* so that the control can be registered with the parent form under that name.
*
* In the context of a parent form, it's often unnecessary to include one-way or two-way binding,
* as the parent form syncs the value for you. You access its properties by exporting it into a
* local template variable using `ngForm` such as (`#f="ngForm"`). Use the variable where
* needed on form submission.
*
* If you do need to populate initial values into your form, using a one-way binding for
* `ngModel` tends to be sufficient as long as you use the exported form's value rather
* than the domain model's value on submit.
*
* ### Using ngModel within a form
*
* The following example shows controls using `ngModel` within a form:
*
* {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
*
* ### Using a standalone ngModel within a group
*
* The following example shows you how to use a standalone ngModel control
* within a form. This controls the display of the form, but doesn't contain form data.
*
* ```html
* <form>
*   <input name="login" ngModel placeholder="Login">
*   <input type="checkbox" ngModel [ngModelOptions]="{standalone: true}"> Show more options?
* </form>
* <!-- form value: {login: ''} -->
* ```
*
* ### Setting the ngModel `name` attribute through options
*
* The following example shows you an alternate way to set the name attribute. Here,
* an attribute identified as name is used within a custom form control component. To still be able
* to specify the NgModel's name, you must specify it using the `ngModelOptions` input instead.
*
* ```html
* <form>
*   <my-custom-form-control name="Nancy" ngModel [ngModelOptions]="{name: 'user'}">
*   </my-custom-form-control>
* </form>
* <!-- form value: {user: ''} -->
* ```
*
* @ngModule FormsModule
* @publicApi
*/
var NgModel = class NgModel extends NgControl {
	_changeDetectorRef;
	callSetDisabledState;
	control = new FormControl();
	/** @docs-private */
	static ngAcceptInputType_isDisabled;
	/** @internal */
	_registered = false;
	_ngModelInjector;
	/**
	* Internal reference to the view model value.
	* @docs-private
	*/
	viewModel;
	/**
	* @description
	* Tracks the name bound to the directive. If a parent form exists, it
	* uses this name as a key to retrieve this control's value.
	*/
	name = "";
	/**
	* @description
	* Tracks whether the control is disabled.
	*/
	isDisabled;
	/**
	* @description
	* Tracks the value bound to this directive.
	*/
	model;
	/**
	* @description
	* Tracks the configuration options for this `ngModel` instance.
	*
	* **name**: An alternative to setting the name attribute on the form control element. See
	* the [example](api/forms/NgModel) for using `NgModel`
	* as a standalone control.
	*
	* **standalone**: When set to true, the `ngModel` will not register itself with its parent form,
	* and acts as if it's not in the form. Defaults to false. If no parent form exists, this option
	* has no effect.
	*
	* **updateOn**: Defines the event upon which the form control value and validity update.
	* Defaults to 'change'. Possible values: `'change'` | `'blur'` | `'submit'`.
	*
	*/
	options;
	/**
	* @description
	* Event emitter for producing the `ngModelChange` event after
	* the view model updates.
	*/
	update = new EventEmitter();
	constructor(parent, validators, asyncValidators, valueAccessors, _changeDetectorRef, callSetDisabledState, injector, renderer) {
		super(injector, renderer, valueAccessors);
		this._changeDetectorRef = _changeDetectorRef;
		this.callSetDisabledState = callSetDisabledState;
		this._parent = parent;
		if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) this._ngModelInjector = injector;
		this._setValidators(validators);
		this._setAsyncValidators(asyncValidators);
	}
	/** @docs-private */
	ngOnChanges(changes) {
		if (!this._registered && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && this._parent === null && !this.options?.standalone) {
			const parentContainer = this._ngModelInjector?.get(ControlContainer, null);
			if (parentContainer != null) {
				const typeName = parentContainer instanceof NgForm ? "NgForm" : parentContainer instanceof FormGroupDirective ? "FormGroupDirective" : parentContainer instanceof NgModelGroup ? "NgModelGroup" : parentContainer.constructor.name || "ControlContainer";
				console.warn(ngModelInChildComponentWarning(typeName));
			}
		}
		this._checkForErrors();
		if (!this._registered || "name" in changes) {
			if (this._registered) {
				this._checkName();
				if (this.formDirective) {
					const oldName = changes["name"].previousValue;
					this.formDirective.removeControl({
						name: oldName,
						path: this._getPath(oldName)
					});
				}
			}
			this._setUpControl();
		}
		if ("isDisabled" in changes) this._updateDisabled(changes);
		if (isPropertyUpdated(changes, this.viewModel)) {
			this._updateValue(this.model);
			this.viewModel = this.model;
		}
	}
	/** @docs-private */
	ngOnDestroy() {
		this.formDirective?.removeControl(this);
	}
	/**
	* Internal control directive creation lifecycle hook.
	* @internal
	*/
	ɵngControlCreate(host) {
		super.ngControlCreate(host);
	}
	/**
	* Internal control directive update lifecycle hook.
	* @internal
	*/
	ɵngControlUpdate(host) {
		super.ngControlUpdate(host, false);
	}
	/**
	* Template-driven forms handle `required` via the `RequiredValidator` directive.
	*
	* This directive has a `required` input and a host binding to `[attr.required]`. It defines the
	* source of truth for required-ness, so disable the normal control binding for it.
	*/
	get shouldBindRequired() {
		return false;
	}
	/**
	* @description
	* Returns an array that represents the path from the top-level form to this control.
	* Each index is the string name of the control on that level.
	*/
	get path() {
		return this._getPath(this.name);
	}
	/**
	* @description
	* The top-level directive for this control if present, otherwise null.
	*/
	get formDirective() {
		return this._parent ? this._parent.formDirective : null;
	}
	/**
	* @description
	* Sets the new value for the view model and emits an `ngModelChange` event.
	*
	* @param newValue The new value emitted by `ngModelChange`.
	*/
	viewToModelUpdate(newValue) {
		this.viewModel = newValue;
		this.update.emit(newValue);
	}
	_setUpControl() {
		this._setUpdateStrategy();
		this._isStandalone() ? this._setUpStandalone() : this.formDirective.addControl(this);
		this._registered = true;
	}
	_setUpdateStrategy() {
		if (this.options && this.options.updateOn != null) this.control._updateOn = this.options.updateOn;
	}
	_isStandalone() {
		return !this._parent || !!(this.options && this.options.standalone);
	}
	_setUpStandalone() {
		if (!this.isCustomControlBased) {
			this.valueAccessor ??= this.selectedValueAccessor;
			setUpControlValueAccessor(this.control, this, this.callSetDisabledState);
		} else this.setupCustomControl();
		this.control.updateValueAndValidity({ emitEvent: false });
	}
	/**
	* Sets up the control with the form, handling FVC vs CVA branching.
	* Called by NgForm.addControl.
	* @internal
	*/
	_setupWithForm(callSetDisabledState) {
		if (!this.isCustomControlBased) {
			this.valueAccessor ??= this.selectedValueAccessor;
			setUpControlValueAccessor(this.control, this, callSetDisabledState);
		} else this.setupCustomControl();
	}
	_checkForErrors() {
		if ((typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && !this._isStandalone()) checkParentType$1(this._parent);
		this._checkName();
	}
	_checkName() {
		if (this.options && this.options.name) this.name = this.options.name;
		if (!this._isStandalone() && !this.name && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) throw missingNameException();
	}
	_updateValue(value) {
		resolvedPromise.then(() => {
			this.control.setValue(value, { emitViewToModelChange: false });
			this._changeDetectorRef?.markForCheck();
		});
	}
	_updateDisabled(changes) {
		const disabledValue = changes["isDisabled"].currentValue;
		const isDisabled = disabledValue !== 0 && booleanAttribute(disabledValue);
		resolvedPromise.then(() => {
			if (isDisabled && !this.control.disabled) this.control.disable();
			else if (!isDisabled && this.control.disabled) this.control.enable();
			this._changeDetectorRef?.markForCheck();
		});
	}
	_getPath(controlName) {
		return this._parent ? controlPath(controlName, this._parent) : [controlName];
	}
	static ɵfac = function NgModel_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NgModel)(ɵɵdirectiveInject(ControlContainer, 9), ɵɵdirectiveInject(NG_VALIDATORS, 10), ɵɵdirectiveInject(NG_ASYNC_VALIDATORS, 10), ɵɵdirectiveInject(NG_VALUE_ACCESSOR, 10), ɵɵdirectiveInject(ChangeDetectorRef, 8), ɵɵdirectiveInject(CALL_SET_DISABLED_STATE, 8), ɵɵdirectiveInject(Injector, 8), ɵɵdirectiveInject(Renderer2, 8));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: NgModel,
		selectors: [[
			"",
			"ngModel",
			"",
			3,
			"formControlName",
			"",
			3,
			"formControl",
			""
		]],
		inputs: {
			name: "name",
			isDisabled: [
				0,
				"disabled",
				"isDisabled"
			],
			model: [
				0,
				"ngModel",
				"model"
			],
			options: [
				0,
				"ngModelOptions",
				"options"
			]
		},
		outputs: { update: "ngModelChange" },
		exportAs: ["ngModel"],
		standalone: false,
		features: [
			ɵɵProvidersFeature([formControlBinding$1, NG_CONTROL_INTEGRATION_PROVIDER]),
			ɵɵInheritDefinitionFeature,
			ɵɵNgOnChangesFeature,
			ɵɵControlFeature(null)
		]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(NgModel, [{
		type: Directive,
		args: [{
			selector: "[ngModel]:not([formControlName]):not([formControl])",
			providers: [formControlBinding$1, NG_CONTROL_INTEGRATION_PROVIDER],
			exportAs: "ngModel",
			standalone: false
		}]
	}], () => [
		{
			type: ControlContainer,
			decorators: [{ type: Optional }, { type: Host }]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_ASYNC_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALUE_ACCESSOR]
				}
			]
		},
		{
			type: ChangeDetectorRef,
			decorators: [{ type: Optional }, {
				type: Inject,
				args: [ChangeDetectorRef]
			}]
		},
		{
			type: void 0,
			decorators: [{ type: Optional }, {
				type: Inject,
				args: [CALL_SET_DISABLED_STATE]
			}]
		},
		{
			type: Injector,
			decorators: [{ type: Optional }]
		},
		{
			type: Renderer2,
			decorators: [{ type: Optional }]
		}
	], {
		name: [{ type: Input }],
		isDisabled: [{
			type: Input,
			args: ["disabled"]
		}],
		model: [{
			type: Input,
			args: ["ngModel"]
		}],
		options: [{
			type: Input,
			args: ["ngModelOptions"]
		}],
		update: [{
			type: Output,
			args: ["ngModelChange"]
		}]
	});
})();
function checkParentType$1(parent) {
	if (!(parent instanceof NgModelGroup) && parent instanceof AbstractFormGroupDirective) throw formGroupNameException();
	else if (!(parent instanceof NgModelGroup) && !(parent instanceof NgForm)) throw modelParentException();
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* @description
*
* Adds `novalidate` attribute to all forms by default.
*
* `novalidate` is used to disable browser's native form validation.
*
* If you want to use native validation with Angular forms, just add `ngNativeValidate` attribute:
*
* ```html
* <form ngNativeValidate></form>
* ```
*
* @publicApi
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
*/
var ɵNgNoValidate = class ɵNgNoValidate {
	static ɵfac = function ɵNgNoValidate_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ɵNgNoValidate)();
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: ɵNgNoValidate,
		selectors: [[
			"form",
			3,
			"ngNoForm",
			"",
			3,
			"ngNativeValidate",
			""
		]],
		hostAttrs: ["novalidate", ""],
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(ɵNgNoValidate, [{
		type: Directive,
		args: [{
			selector: "form:not([ngNoForm]):not([ngNativeValidate])",
			host: { "novalidate": "" },
			standalone: false
		}]
	}], null, null);
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
var SWITCH_VALUE_ACCESSOR$1 = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => PickerValueAccessor),
	multi: true
};
/**
* @description
* The `ControlValueAccessor` for writing a number value and listening to number input changes.
* The value accessor is used by the `FormControlDirective`, `FormControlName`, and `NgModel`
* directives.
*
* @usageNotes
*
* ### Using a number input with a reactive form.
*
* The following example shows how to use a number input with a reactive form.
*
* ```ts
* const totalCountControl = new FormControl();
* ```
*
* ```
* <input type="number" [formControl]="totalCountControl">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var PickerValueAccessor = class PickerValueAccessor extends BuiltInControlValueAccessor {
	value;
	disabled;
	/**
	* Sets the "value" property on the input element.
	* @nodoc
	*/
	writeValue(value) {
		const normalizedValue = value == null ? void 0 : value;
		if (typeof normalizedValue !== "undefined") this.setProperty("value", normalizedValue);
	}
	valueChange(value) {
		this.setProperty("value", value);
		this.onChange(value);
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵPickerValueAccessor_BaseFactory;
		return function PickerValueAccessor_Factory(__ngFactoryType__) {
			return (ɵPickerValueAccessor_BaseFactory || (ɵPickerValueAccessor_BaseFactory = ɵɵgetInheritedFactory(PickerValueAccessor)))(__ngFactoryType__ || PickerValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: PickerValueAccessor,
		selectors: [
			[
				"picker",
				"formControlName",
				""
			],
			[
				"picker",
				"formControl",
				""
			],
			[
				"picker",
				"ngModel",
				""
			]
		],
		hostVars: 2,
		hostBindings: function PickerValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("bindchange", function PickerValueAccessor_bindchange_HostBindingHandler($event) {
				return ctx.valueChange($event.detail.value);
			});
			if (rf & 2) ɵɵdomProperty("value", ctx.value)("disabled", ctx.disabled);
		},
		standalone: false,
		features: [ɵɵProvidersFeature([SWITCH_VALUE_ACCESSOR$1]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(PickerValueAccessor, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "picker[formControlName],picker[formControl],picker[ngModel]",
			host: { "(bindchange)": "valueChange($event.detail.value)" },
			providers: [SWITCH_VALUE_ACCESSOR$1]
		}]
	}], null, {
		value: [{
			type: HostBinding,
			args: ["value"]
		}],
		disabled: [{
			type: HostBinding,
			args: ["disabled"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
var PICKER_VIEW_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => PickerViewValueAccessor),
	multi: true
};
/**
* @description
* The `ControlValueAccessor` for writing a number value and listening to number input changes.
* The value accessor is used by the `FormControlDirective`, `FormControlName`, and `NgModel`
* directives.
*
* @usageNotes
*
* ### Using a number input with a reactive form.
*
* The following example shows how to use a number input with a reactive form.
*
* ```ts
* const totalCountControl = new FormControl();
* ```
*
* ```
* <input type="number" [formControl]="totalCountControl">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var PickerViewValueAccessor = class PickerViewValueAccessor extends BuiltInControlValueAccessor {
	value;
	/**
	* Sets the "value" property on the input element.
	* @nodoc
	*/
	writeValue(value) {
		const normalizedValue = value == null ? void 0 : value;
		if (typeof normalizedValue !== "undefined") this.setProperty("value", normalizedValue);
	}
	setDisabledState() {}
	valueChange(value) {
		this.setProperty("value", value);
		this.onChange(value);
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵPickerViewValueAccessor_BaseFactory;
		return function PickerViewValueAccessor_Factory(__ngFactoryType__) {
			return (ɵPickerViewValueAccessor_BaseFactory || (ɵPickerViewValueAccessor_BaseFactory = ɵɵgetInheritedFactory(PickerViewValueAccessor)))(__ngFactoryType__ || PickerViewValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: PickerViewValueAccessor,
		selectors: [
			[
				"picker-view",
				"formControlName",
				""
			],
			[
				"picker-view",
				"formControl",
				""
			],
			[
				"picker-view",
				"ngModel",
				""
			]
		],
		hostVars: 1,
		hostBindings: function PickerViewValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("bindchange", function PickerViewValueAccessor_bindchange_HostBindingHandler($event) {
				return ctx.valueChange($event.detail.value);
			});
			if (rf & 2) ɵɵdomProperty("value", ctx.value);
		},
		standalone: false,
		features: [ɵɵProvidersFeature([PICKER_VIEW_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(PickerViewValueAccessor, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "picker-view[formControlName],picker-view[formControl],picker-view[ngModel]",
			host: { "(bindchange)": "valueChange($event.detail.value)" },
			providers: [PICKER_VIEW_VALUE_ACCESSOR]
		}]
	}], null, { value: [{
		type: HostBinding,
		args: ["value"]
	}] });
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
var RADIO_GROUP_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => RadioGroupValueAccessor),
	multi: true
};
/**
* Internal-only NgModule that works as a host for the `RadioControlRegistry` tree-shakable
* provider. Note: the `InternalFormsSharedModule` can not be used here directly, since it's
* declared *after* the `RadioControlRegistry` class and the `providedIn` doesn't support
* `forwardRef` logic.
*/
var RadioControlRegistryModule = class RadioControlRegistryModule {
	static ɵfac = function RadioControlRegistryModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || RadioControlRegistryModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: RadioControlRegistryModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(RadioControlRegistryModule, [{ type: NgModule }], null, null);
})();
/**
* @description
* Class used by Angular to track radio buttons. For internal use only.
*/
var RadioControlRegistry = class RadioControlRegistry {
	_accessors = [];
	/**
	* @description
	* Adds a control to the internal registry. For internal use only.
	*/
	add(control, accessor) {
		this._accessors.push([control, accessor]);
	}
	/**
	* @description
	* Removes a control from the internal registry. For internal use only.
	*/
	remove(accessor) {
		for (let i = this._accessors.length - 1; i >= 0; --i) if (this._accessors[i][1] === accessor) {
			this._accessors.splice(i, 1);
			return;
		}
	}
	/**
	* @description
	* Selects a radio button. For internal use only.
	*/
	select(accessor) {
		this._accessors.forEach((c) => {
			if (this._isSameGroup(c, accessor) && c[1] !== accessor) c[1].fireUncheck(accessor.value);
		});
	}
	_isSameGroup(controlPair, accessor) {
		if (!controlPair[0].control) return false;
		return false;
	}
	static ɵfac = function RadioControlRegistry_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || RadioControlRegistry)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineInjectable({
		token: RadioControlRegistry,
		factory: RadioControlRegistry.ɵfac,
		providedIn: RadioControlRegistryModule
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(RadioControlRegistry, [{
		type: Injectable,
		args: [{ providedIn: RadioControlRegistryModule }]
	}], null, null);
})();
var RadioGroupValueAccessor = class RadioGroupValueAccessor extends BuiltInControlValueAccessor {
	children;
	valueChange(value) {
		if (this.children) this.children.forEach((item) => {
			item.updateChecked(item.value === value);
		});
		this.onChange(value);
	}
	writeValue(value) {
		if (this.children) this.children.forEach((item) => {
			item.updateChecked(item.value === value);
		});
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵRadioGroupValueAccessor_BaseFactory;
		return function RadioGroupValueAccessor_Factory(__ngFactoryType__) {
			return (ɵRadioGroupValueAccessor_BaseFactory || (ɵRadioGroupValueAccessor_BaseFactory = ɵɵgetInheritedFactory(RadioGroupValueAccessor)))(__ngFactoryType__ || RadioGroupValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: RadioGroupValueAccessor,
		selectors: [
			[
				"radio-group",
				"formControlName",
				""
			],
			[
				"radio-group",
				"formControl",
				""
			],
			[
				"radio-group",
				"ngModel",
				""
			]
		],
		contentQueries: function RadioGroupValueAccessor_ContentQueries(rf, ctx, dirIndex) {
			if (rf & 1) ɵɵcontentQuery(dirIndex, RadioControl, 5);
			if (rf & 2) {
				let _t;
				ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.children = _t);
			}
		},
		hostBindings: function RadioGroupValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("bindchange", function RadioGroupValueAccessor_bindchange_HostBindingHandler($event) {
				return ctx.valueChange($event.detail.value);
			});
		},
		standalone: false,
		features: [ɵɵProvidersFeature([RADIO_GROUP_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(RadioGroupValueAccessor, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "radio-group[formControlName],radio-group[formControl],radio-group[ngModel]",
			host: { "(bindchange)": "valueChange($event.detail.value)" },
			providers: [RADIO_GROUP_VALUE_ACCESSOR]
		}]
	}], null, { children: [{
		type: ContentChildren,
		args: [forwardRef(() => RadioControl), { descendants: true }]
	}] });
})();
/**
* @description
* The `ControlValueAccessor` for writing radio control values and listening to radio control
* changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
* `NgModel` directives.
*
* @usageNotes
*
* ### Using radio buttons with reactive form directives
*
* The follow example shows how to use radio buttons in a reactive form. When using radio buttons in
* a reactive form, radio buttons in the same group should have the same `formControlName`.
* Providing a `name` attribute is optional.
*
* {@example forms/ts/reactiveRadioButtons/reactive_radio_button_example.ts region='Reactive'}
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
* todo 写入值可以从这里来,读取的话就需要从上一级,需要处理本组件与group的关系
*/
var RadioControl = class RadioControl {
	renderer;
	elementRef;
	_registry;
	_injector;
	/**
	* @description
	* Tracks the value of the radio input element
	*/
	value;
	checked;
	constructor(renderer, elementRef, _registry, _injector) {
		this.renderer = renderer;
		this.elementRef = elementRef;
		this._registry = _registry;
		this._injector = _injector;
	}
	updateChecked(value) {
		this.renderer.setProperty(this.elementRef.nativeElement, "checked", value);
	}
	static ɵfac = function RadioControl_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || RadioControl)(ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(RadioControlRegistry), ɵɵdirectiveInject(Injector));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: RadioControl,
		selectors: [["radio"]],
		hostVars: 2,
		hostBindings: function RadioControl_HostBindings(rf, ctx) {
			if (rf & 2) ɵɵdomProperty("value", ctx.value)("checked", ctx.checked);
		},
		inputs: { value: "value" },
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(RadioControl, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "radio",
			host: {}
		}]
	}], () => [
		{ type: Renderer2 },
		{ type: ElementRef },
		{ type: RadioControlRegistry },
		{ type: Injector }
	], {
		value: [{
			type: HostBinding,
			args: ["value"]
		}, { type: Input }],
		checked: [{
			type: HostBinding,
			args: ["checked"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var RANGE_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => RangeValueAccessor),
	multi: true
};
/**
* @description
* The `ControlValueAccessor` for writing a range value and listening to range input changes.
* The value accessor is used by the `FormControlDirective`, `FormControlName`, and  `NgModel`
* directives.
*
* @usageNotes
*
* ### Using a range input with a reactive form
*
* The following example shows how to use a range input with a reactive form.
*
* ```ts
* const ageControl = new FormControl();
* ```
*
* ```html
* <input type="range" [formControl]="ageControl">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var RangeValueAccessor = class RangeValueAccessor extends BuiltInControlValueAccessor {
	/**
	* Sets the "value" property on the input element.
	* @docs-private
	*/
	writeValue(value) {
		this.setProperty("value", parseFloat(value));
	}
	/**
	* Registers a function called when the control value changes.
	* @docs-private
	*/
	registerOnChange(fn) {
		this.onChange = (value) => {
			fn(value == "" ? null : parseFloat(value));
		};
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵRangeValueAccessor_BaseFactory;
		return function RangeValueAccessor_Factory(__ngFactoryType__) {
			return (ɵRangeValueAccessor_BaseFactory || (ɵRangeValueAccessor_BaseFactory = ɵɵgetInheritedFactory(RangeValueAccessor)))(__ngFactoryType__ || RangeValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: RangeValueAccessor,
		selectors: [
			[
				"input",
				"type",
				"range",
				"formControlName",
				"",
				3,
				"ngNoCva",
				""
			],
			[
				"input",
				"type",
				"range",
				"formControl",
				"",
				3,
				"ngNoCva",
				""
			],
			[
				"input",
				"type",
				"range",
				"ngModel",
				"",
				3,
				"ngNoCva",
				""
			]
		],
		hostBindings: function RangeValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("change", function RangeValueAccessor_change_HostBindingHandler($event) {
				return ctx.onChange($event.target.value);
			})("input", function RangeValueAccessor_input_HostBindingHandler($event) {
				return ctx.onChange($event.target.value);
			})("blur", function RangeValueAccessor_blur_HostBindingHandler() {
				return ctx.onTouched();
			});
		},
		standalone: false,
		features: [ɵɵProvidersFeature([RANGE_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(RangeValueAccessor, [{
		type: Directive,
		args: [{
			selector: "input[type=range]:not([ngNoCva])[formControlName],input[type=range]:not([ngNoCva])[formControl],input[type=range]:not([ngNoCva])[ngModel]",
			host: {
				"(change)": "onChange($any($event.target).value)",
				"(input)": "onChange($any($event.target).value)",
				"(blur)": "onTouched()"
			},
			providers: [RANGE_VALUE_ACCESSOR],
			standalone: false
		}]
	}], null, null);
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* Token to provide to turn off the ngModel warning on formControl and formControlName.
*/
var NG_MODEL_WITH_FORM_CONTROL_WARNING = new InjectionToken(typeof wx.__global.ngDevMode !== "undefined" && wx.__global.ngDevMode ? "NgModelWithFormControlWarning" : "");
var formControlBinding = {
	provide: NgControl,
	useExisting: forwardRef(() => FormControlDirective)
};
/**
* @description
* Synchronizes a standalone `FormControl` instance to a form control element.
*
* Note that support for using the `ngModel` input property and `ngModelChange` event with reactive
* form directives was deprecated in Angular v6 and is scheduled for removal in
* a future version of Angular.
*
* @see [Reactive Forms Guide](guide/forms/reactive-forms)
* @see {@link FormControl}
* @see {@link AbstractControl}
*
* @usageNotes
*
* The following example shows how to register a standalone control and set its value.
*
* {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
*
* @ngModule ReactiveFormsModule
* @publicApi
*/
var FormControlDirective = class FormControlDirective extends NgControl {
	_ngModelWarningConfig;
	callSetDisabledState;
	/**
	* Internal reference to the view model value.
	* @docs-private
	*/
	viewModel;
	/**
	* @description
	* Tracks the `FormControl` instance bound to the directive.
	*/
	form;
	/**
	* @description
	* Triggers a warning in dev mode that this input should not be used with reactive forms.
	*/
	set isDisabled(isDisabled) {
		if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) console.warn(disabledAttrWarning);
	}
	/** @deprecated as of v6 */
	model;
	/** @deprecated as of v6 */
	update = new EventEmitter();
	/**
	* @description
	* Static property used to track whether any ngModel warnings have been sent across
	* all instances of FormControlDirective. Used to support warning config of "once".
	*
	* @internal
	*/
	static _ngModelWarningSentOnce = false;
	/**
	* @description
	* Instance property used to track whether an ngModel warning has been sent out for this
	* particular `FormControlDirective` instance. Used to support warning config of "always".
	*
	* @internal
	*/
	_ngModelWarningSent = false;
	constructor(validators, asyncValidators, valueAccessors, _ngModelWarningConfig, callSetDisabledState, renderer, injector) {
		super(injector, renderer, valueAccessors);
		this._ngModelWarningConfig = _ngModelWarningConfig;
		this.callSetDisabledState = callSetDisabledState;
		this._setValidators(validators);
		this._setAsyncValidators(asyncValidators);
	}
	/** @docs-private */
	ngOnChanges(changes) {
		if (this._isControlChanged(changes)) {
			const previousForm = changes["form"].previousValue;
			if (previousForm) {
				cleanUpControl(previousForm, this, false);
				this.removeParseErrorsValidator(previousForm);
			}
			if (!this.isCustomControlBased) {
				this.valueAccessor ??= this.selectedValueAccessor;
				setUpControlValueAccessor(this.form, this, this.callSetDisabledState);
			} else this.setupCustomControl();
			this.form.updateValueAndValidity({ emitEvent: false });
		}
		if (isPropertyUpdated(changes, this.viewModel)) {
			if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) _ngModelWarning("formControl", FormControlDirective, this, this._ngModelWarningConfig);
			this.form.setValue(this.model);
			this.viewModel = this.model;
		}
	}
	/** @docs-private */
	ngOnDestroy() {
		if (this.form) cleanUpControl(this.form, this, false);
	}
	/**
	* @description
	* Returns an array that represents the path from the top-level form to this control.
	* Each index is the string name of the control on that level.
	*/
	get path() {
		return [];
	}
	/**
	* @description
	* The `FormControl` bound to this directive.
	*/
	get control() {
		return this.form;
	}
	/**
	* @description
	* Sets the new value for the view model and emits an `ngModelChange` event.
	*
	* @param newValue The new value for the view model.
	*/
	viewToModelUpdate(newValue) {
		this.viewModel = newValue;
		this.update.emit(newValue);
	}
	_isControlChanged(changes) {
		return Object.hasOwn(changes, "form");
	}
	/**
	* Internal control directive creation lifecycle hook.
	*
	* The presence of this method tells the compiler to install `ɵɵControlFeature`, which will
	* cause this directive to be recognized as a control directive by the `ɵcontrolCreate` and
	* `ɵcontrol` instructions.
	*
	* @internal
	*/
	ɵngControlCreate(host) {
		super.ngControlCreate(host);
	}
	/**
	* Internal control directive update lifecycle hook.
	*
	* @internal
	*/
	ɵngControlUpdate(host) {
		super.ngControlUpdate(host, true);
	}
	static ɵfac = function FormControlDirective_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FormControlDirective)(ɵɵdirectiveInject(NG_VALIDATORS, 10), ɵɵdirectiveInject(NG_ASYNC_VALIDATORS, 10), ɵɵdirectiveInject(NG_VALUE_ACCESSOR, 10), ɵɵdirectiveInject(NG_MODEL_WITH_FORM_CONTROL_WARNING, 8), ɵɵdirectiveInject(CALL_SET_DISABLED_STATE, 8), ɵɵdirectiveInject(Renderer2, 8), ɵɵdirectiveInject(Injector, 8));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: FormControlDirective,
		selectors: [[
			"",
			"formControl",
			""
		]],
		inputs: {
			form: [
				0,
				"formControl",
				"form"
			],
			isDisabled: [
				0,
				"disabled",
				"isDisabled"
			],
			model: [
				0,
				"ngModel",
				"model"
			]
		},
		outputs: { update: "ngModelChange" },
		exportAs: ["ngForm"],
		standalone: false,
		features: [
			ɵɵProvidersFeature([formControlBinding, NG_CONTROL_INTEGRATION_PROVIDER]),
			ɵɵInheritDefinitionFeature,
			ɵɵNgOnChangesFeature,
			ɵɵControlFeature(null)
		]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(FormControlDirective, [{
		type: Directive,
		args: [{
			selector: "[formControl]",
			providers: [formControlBinding, NG_CONTROL_INTEGRATION_PROVIDER],
			exportAs: "ngForm",
			standalone: false
		}]
	}], () => [
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_ASYNC_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALUE_ACCESSOR]
				}
			]
		},
		{
			type: void 0,
			decorators: [{ type: Optional }, {
				type: Inject,
				args: [NG_MODEL_WITH_FORM_CONTROL_WARNING]
			}]
		},
		{
			type: void 0,
			decorators: [{ type: Optional }, {
				type: Inject,
				args: [CALL_SET_DISABLED_STATE]
			}]
		},
		{
			type: Renderer2,
			decorators: [{ type: Optional }]
		},
		{
			type: Injector,
			decorators: [{ type: Optional }]
		}
	], {
		form: [{
			type: Input,
			args: ["formControl"]
		}],
		isDisabled: [{
			type: Input,
			args: ["disabled"]
		}],
		model: [{
			type: Input,
			args: ["ngModel"]
		}],
		update: [{
			type: Output,
			args: ["ngModelChange"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var formGroupNameProvider = {
	provide: ControlContainer,
	useExisting: forwardRef(() => FormGroupName)
};
/**
* @description
*
* Syncs a nested `FormGroup` or `FormRecord` to a DOM element.
*
* This directive can only be used with a parent `FormGroupDirective`.
*
* It accepts the string name of the nested `FormGroup` or `FormRecord` to link, and
* looks for a `FormGroup` or `FormRecord` registered with that name in the parent
* `FormGroup` instance you passed into `FormGroupDirective`.
*
* Use nested form groups to validate a sub-group of a
* form separately from the rest or to group the values of certain
* controls into their own nested object.
*
* @see [Reactive Forms Guide](guide/forms/reactive-forms)
*
* @usageNotes
*
* ### Access the group by name
*
* The following example uses the `AbstractControl.get` method to access the
* associated `FormGroup`
*
* ```ts
*   this.form.get('name');
* ```
*
* ### Access individual controls in the group
*
* The following example uses the `AbstractControl.get` method to access
* individual controls within the group using dot syntax.
*
* ```ts
*   this.form.get('name.first');
* ```
*
* ### Register a nested `FormGroup`.
*
* The following example registers a nested *name* `FormGroup` within an existing `FormGroup`,
* and provides methods to retrieve the nested `FormGroup` and individual controls.
*
* {@example forms/ts/nestedFormGroup/nested_form_group_example.ts region='Component'}
*
* @ngModule ReactiveFormsModule
* @publicApi
*/
var FormGroupName = class FormGroupName extends AbstractFormGroupDirective {
	/**
	* @description
	* Tracks the name of the `FormGroup` bound to the directive. The name corresponds
	* to a key in the parent `FormGroup` or `FormArray`.
	* Accepts a name as a string or a number.
	* The name in the form of a string is useful for individual forms,
	* while the numerical form allows for form groups to be bound
	* to indices when iterating over groups in a `FormArray`.
	*/
	name = null;
	constructor(parent, validators, asyncValidators) {
		super();
		this._parent = parent;
		this._setValidators(validators);
		this._setAsyncValidators(asyncValidators);
	}
	/** @internal */
	_checkParentType() {
		if (hasInvalidParent(this._parent) && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) throw groupParentException();
	}
	static ɵfac = function FormGroupName_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FormGroupName)(ɵɵdirectiveInject(ControlContainer, 13), ɵɵdirectiveInject(NG_VALIDATORS, 10), ɵɵdirectiveInject(NG_ASYNC_VALIDATORS, 10));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: FormGroupName,
		selectors: [[
			"",
			"formGroupName",
			""
		]],
		inputs: { name: [
			0,
			"formGroupName",
			"name"
		] },
		standalone: false,
		features: [ɵɵProvidersFeature([formGroupNameProvider]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(FormGroupName, [{
		type: Directive,
		args: [{
			selector: "[formGroupName]",
			providers: [formGroupNameProvider],
			standalone: false
		}]
	}], () => [
		{
			type: ControlContainer,
			decorators: [
				{ type: Optional },
				{ type: Host },
				{ type: SkipSelf }
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_ASYNC_VALIDATORS]
				}
			]
		}
	], { name: [{
		type: Input,
		args: ["formGroupName"]
	}] });
})();
var formArrayNameProvider = {
	provide: ControlContainer,
	useExisting: forwardRef(() => FormArrayName)
};
/**
* @description
*
* Syncs a nested `FormArray` to a DOM element.
*
* This directive is designed to be used with a parent `FormGroupDirective`/`FormArrayDirective` (selector:
* `[formGroup]`/`[formArray]`).
*
* It accepts the string name of the nested `FormArray` you want to link, and
* will look for a `FormArray` registered with that name in the parent
* `FormGroup`/`FormArray` instance you passed into `FormGroupDirective`/`FormArrayDirective`.
*
* @see [Reactive Forms Guide](guide/forms/reactive-forms)
* @see {@link AbstractControl}
*
* @usageNotes
*
* ### Example
*
* {@example forms/ts/nestedFormArray/nested_form_array_example.ts region='Component'}
*
* @ngModule ReactiveFormsModule
* @publicApi
*/
var FormArrayName = class FormArrayName extends ControlContainer {
	/** @internal */
	_parent;
	/**
	* @description
	* Tracks the name of the `FormArray` bound to the directive. The name corresponds
	* to a key in the parent `FormGroup` or `FormArray`.
	* Accepts a name as a string or a number.
	* The name in the form of a string is useful for individual forms,
	* while the numerical form allows for form arrays to be bound
	* to indices when iterating over arrays in a `FormArray`.
	*/
	name = null;
	constructor(parent, validators, asyncValidators) {
		super();
		this._parent = parent;
		this._setValidators(validators);
		this._setAsyncValidators(asyncValidators);
	}
	/**
	* A lifecycle method called when the directive's inputs are initialized. For internal use only.
	* @throws If the directive does not have a valid parent.
	* @docs-private
	*/
	ngOnInit() {
		if (hasInvalidParent(this._parent) && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) throw arrayParentException();
		this.formDirective.addFormArray(this);
	}
	/**
	* A lifecycle method called before the directive's instance is destroyed. For internal use only.
	* @docs-private
	*/
	ngOnDestroy() {
		this.formDirective?.removeFormArray(this);
	}
	/**
	* @description
	* The `FormArray` bound to this directive.
	*/
	get control() {
		return this.formDirective.getFormArray(this);
	}
	/**
	* @description
	* The top-level directive for this group if present, otherwise null.
	*/
	get formDirective() {
		return this._parent ? this._parent.formDirective : null;
	}
	/**
	* @description
	* Returns an array that represents the path from the top-level form to this control.
	* Each index is the string name of the control on that level.
	*/
	get path() {
		return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
	}
	static ɵfac = function FormArrayName_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FormArrayName)(ɵɵdirectiveInject(ControlContainer, 13), ɵɵdirectiveInject(NG_VALIDATORS, 10), ɵɵdirectiveInject(NG_ASYNC_VALIDATORS, 10));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: FormArrayName,
		selectors: [[
			"",
			"formArrayName",
			""
		]],
		inputs: { name: [
			0,
			"formArrayName",
			"name"
		] },
		standalone: false,
		features: [ɵɵProvidersFeature([formArrayNameProvider]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(FormArrayName, [{
		type: Directive,
		args: [{
			selector: "[formArrayName]",
			providers: [formArrayNameProvider],
			standalone: false
		}]
	}], () => [
		{
			type: ControlContainer,
			decorators: [
				{ type: Optional },
				{ type: Host },
				{ type: SkipSelf }
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_ASYNC_VALIDATORS]
				}
			]
		}
	], { name: [{
		type: Input,
		args: ["formArrayName"]
	}] });
})();
function hasInvalidParent(parent) {
	return !(parent instanceof FormGroupName) && !(parent instanceof AbstractFormDirective) && !(parent instanceof FormArrayName);
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var controlNameBinding = {
	provide: NgControl,
	useExisting: forwardRef(() => FormControlName)
};
/**
* @description
* Syncs a `FormControl` in an existing `FormGroup` to a form control
* element by name.
*
* @see [Reactive Forms Guide](guide/forms/reactive-forms)
* @see {@link FormControl}
* @see {@link AbstractControl}
*
* @usageNotes
*
* ### Register `FormControl` within a group
*
* The following example shows how to register multiple form controls within a form group
* and set their value.
*
* {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
*
* To see `formControlName` examples with different form control types, see:
*
* * Radio buttons: `RadioControlValueAccessor`
* * Selects: `SelectControlValueAccessor`
*
* ### Use with ngModel is deprecated
*
* Support for using the `ngModel` input property and `ngModelChange` event with reactive
* form directives has been deprecated in Angular v6 and is scheduled for removal in
* a future version of Angular.
*
* @ngModule ReactiveFormsModule
* @publicApi
*/
var FormControlName = class FormControlName extends NgControl {
	_ngModelWarningConfig;
	_added = false;
	/**
	* Internal reference to the view model value.
	* @internal
	*/
	viewModel;
	/**
	* @description
	* Tracks the `FormControl` instance bound to the directive.
	*/
	control;
	/**
	* @description
	* Tracks the name of the `FormControl` bound to the directive. The name corresponds
	* to a key in the parent `FormGroup` or `FormArray`.
	* Accepts a name as a string or a number.
	* The name in the form of a string is useful for individual forms,
	* while the numerical form allows for form controls to be bound
	* to indices when iterating over controls in a `FormArray`.
	*/
	name = null;
	/**
	* @description
	* Triggers a warning in dev mode that this input should not be used with reactive forms.
	*/
	set isDisabled(isDisabled) {
		if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) console.warn(disabledAttrWarning);
	}
	/** @deprecated as of v6 */
	model;
	/** @deprecated as of v6 */
	update = new EventEmitter();
	/**
	* @description
	* Static property used to track whether any ngModel warnings have been sent across
	* all instances of FormControlName. Used to support warning config of "once".
	*
	* @internal
	*/
	static _ngModelWarningSentOnce = false;
	/**
	* @description
	* Instance property used to track whether an ngModel warning has been sent out for this
	* particular FormControlName instance. Used to support warning config of "always".
	*
	* @internal
	*/
	_ngModelWarningSent = false;
	constructor(parent, validators, asyncValidators, valueAccessors, _ngModelWarningConfig, renderer, injector) {
		super(injector, renderer, valueAccessors);
		this._ngModelWarningConfig = _ngModelWarningConfig;
		this._parent = parent;
		this._setValidators(validators);
		this._setAsyncValidators(asyncValidators);
	}
	/**
	* Sets up the control with the form, handling FVC vs CVA branching.
	* Called by AbstractFormDirective.addControl.
	* @internal
	*/
	_setupWithForm(control, callSetDisabledState) {
		this.control = control;
		if (!this.isCustomControlBased) {
			this.valueAccessor ??= this.selectedValueAccessor;
			setUpControlValueAccessor(control, this, callSetDisabledState);
		} else this.setupCustomControl();
	}
	/** @docs-private */
	ngOnChanges(changes) {
		if (!this._added) this._setUpControl();
		if (isPropertyUpdated(changes, this.viewModel)) {
			if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) _ngModelWarning("formControlName", FormControlName, this, this._ngModelWarningConfig);
			this.viewModel = this.model;
			this.formDirective.updateModel(this, this.model);
		}
	}
	/** @docs-private */
	ngOnDestroy() {
		this.formDirective?.removeControl(this);
	}
	/**
	* @description
	* Sets the new value for the view model and emits an `ngModelChange` event.
	*
	* @param newValue The new value for the view model.
	*/
	viewToModelUpdate(newValue) {
		this.viewModel = newValue;
		this.update.emit(newValue);
	}
	/**
	* @description
	* Returns an array that represents the path from the top-level form to this control.
	* Each index is the string name of the control on that level.
	*/
	get path() {
		return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
	}
	/**
	* @description
	* The top-level directive for this group if present, otherwise null.
	*/
	get formDirective() {
		return this._parent ? this._parent.formDirective : null;
	}
	_setUpControl() {
		if (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) checkParentType(this._parent, this.name);
		this.control = this.formDirective.addControl(this);
		this._added = true;
	}
	/**
	* Internal control directive creation lifecycle hook.
	*
	* The presence of this method tells the compiler to install `ɵɵControlFeature`, which will
	* cause this directive to be recognized as a control directive by the `ɵcontrolCreate` and
	* `ɵcontrol` instructions.
	*
	* @internal
	*/
	ɵngControlCreate(host) {
		super.ngControlCreate(host);
	}
	/**
	* Internal control directive update lifecycle hook.
	*
	* @internal
	*/
	ɵngControlUpdate(host) {
		if (!this.isCustomControlBased) return;
		if (!this._added) this._setUpControl();
		super.ngControlUpdate(host, true);
	}
	static ɵfac = function FormControlName_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FormControlName)(ɵɵdirectiveInject(ControlContainer, 13), ɵɵdirectiveInject(NG_VALIDATORS, 10), ɵɵdirectiveInject(NG_ASYNC_VALIDATORS, 10), ɵɵdirectiveInject(NG_VALUE_ACCESSOR, 10), ɵɵdirectiveInject(NG_MODEL_WITH_FORM_CONTROL_WARNING, 8), ɵɵdirectiveInject(Renderer2, 8), ɵɵdirectiveInject(Injector, 8));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: FormControlName,
		selectors: [[
			"",
			"formControlName",
			""
		]],
		inputs: {
			name: [
				0,
				"formControlName",
				"name"
			],
			isDisabled: [
				0,
				"disabled",
				"isDisabled"
			],
			model: [
				0,
				"ngModel",
				"model"
			]
		},
		outputs: { update: "ngModelChange" },
		standalone: false,
		features: [
			ɵɵProvidersFeature([controlNameBinding, NG_CONTROL_INTEGRATION_PROVIDER]),
			ɵɵInheritDefinitionFeature,
			ɵɵNgOnChangesFeature,
			ɵɵControlFeature(null)
		]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(FormControlName, [{
		type: Directive,
		args: [{
			selector: "[formControlName]",
			providers: [controlNameBinding, NG_CONTROL_INTEGRATION_PROVIDER],
			standalone: false
		}]
	}], () => [
		{
			type: ControlContainer,
			decorators: [
				{ type: Optional },
				{ type: Host },
				{ type: SkipSelf }
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_ASYNC_VALIDATORS]
				}
			]
		},
		{
			type: void 0,
			decorators: [
				{ type: Optional },
				{ type: Self },
				{
					type: Inject,
					args: [NG_VALUE_ACCESSOR]
				}
			]
		},
		{
			type: void 0,
			decorators: [{ type: Optional }, {
				type: Inject,
				args: [NG_MODEL_WITH_FORM_CONTROL_WARNING]
			}]
		},
		{
			type: Renderer2,
			decorators: [{ type: Optional }]
		},
		{
			type: Injector,
			decorators: [{ type: Optional }]
		}
	], {
		name: [{
			type: Input,
			args: ["formControlName"]
		}],
		isDisabled: [{
			type: Input,
			args: ["disabled"]
		}],
		model: [{
			type: Input,
			args: ["ngModel"]
		}],
		update: [{
			type: Output,
			args: ["ngModelChange"]
		}]
	});
})();
function checkParentType(parent, name) {
	if (!(parent instanceof FormGroupName) && parent instanceof AbstractFormGroupDirective) throw ngModelGroupException();
	else if (!(parent instanceof FormGroupName) && !(parent instanceof AbstractFormDirective) && !(parent instanceof FormArrayName)) throw controlParentException(name);
}
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var SELECT_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => SelectControlValueAccessor),
	multi: true
};
function _buildValueString$1(id, value) {
	if (id == null) return `${value}`;
	if (value && typeof value === "object") value = "Object";
	return `${id}: ${value}`.slice(0, 50);
}
function _extractId$1(valueString) {
	return valueString.split(":")[0];
}
/**
* @description
* The `ControlValueAccessor` for writing select control values and listening to select control
* changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
* `NgModel` directives.
*
* @usageNotes
*
* ### Using select controls in a reactive form
*
* The following examples show how to use a select control in a reactive form.
*
* {@example forms/ts/reactiveSelectControl/reactive_select_control_example.ts region='Component'}
*
* ### Using select controls in a template-driven form
*
* To use a select in a template-driven form, simply add an `ngModel` and a `name`
* attribute to the main `<select>` tag.
*
* {@example forms/ts/selectControl/select_control_example.ts region='Component'}
*
* ### Customizing option selection
*
* Angular uses object identity to select option. It's possible for the identities of items
* to change while the data does not. This can happen, for example, if the items are produced
* from an RPC to the server, and that RPC is re-run. Even if the data hasn't changed, the
* second response will produce objects with different identities.
*
* To customize the default option comparison algorithm, `<select>` supports `compareWith` input.
* `compareWith` takes a **function** which has two arguments: `option1` and `option2`.
* If `compareWith` is given, Angular selects option by the return value of the function.
*
* ```ts
* const selectedCountriesControl = new FormControl();
* ```
*
* ```html
* <select [compareWith]="compareFn"  [formControl]="selectedCountriesControl">
*    @for(country of countries; track $index) {
*        <option[ngValue]="country">{{country.name}}</option>
*    }
* </select>
*
* compareFn(c1: Country, c2: Country): boolean {
*     return c1 && c2 ? c1.id === c2.id : c1 === c2;
* }
* ```
*
* **Note:** We listen to the 'change' event because 'input' events aren't fired
* for selects in IE, see:
* https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event#browser_compatibility
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var SelectControlValueAccessor = class SelectControlValueAccessor extends BuiltInControlValueAccessor {
	/** @docs-private */
	value;
	/** @internal */
	_optionMap = /* @__PURE__ */ new Map();
	/** @internal */
	_idCounter = 0;
	/**
	* @description
	* Tracks the option comparison algorithm for tracking identities when
	* checking for changes.
	*/
	set compareWith(fn) {
		if (typeof fn !== "function" && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) throw new RuntimeError(1201, `compareWith must be a function, but received ${JSON.stringify(fn)}`);
		this._compareWith = fn;
	}
	_compareWith = Object.is;
	appRefInjector = inject(ApplicationRef).injector;
	destroyRef = inject(DestroyRef);
	cdr = inject(ChangeDetectorRef);
	_queuedWrite = false;
	/**
	* This is needed to efficiently set the select value when adding/removing options. If
	* writeValue is instead called for every added/removed option, this results in exponentially
	* more _compareValue calls than the number of option elements (issue #41330).
	*
	* Secondly, calling writeValue when rendering individual option elements instead of after they
	* are all rendered caused an issue in Safari and IE 11 where the first option element failed
	* to be deselected when no option matched the select ngModel. This was because Angular would
	* set the select element's value property before appending the option's child text node to the
	* DOM (issue #14505).
	*
	* Finally, this approach is necessary to avoid an issue with delayed element removal when
	* using the animations module (in all browsers). Otherwise when a selected option is removed
	* (so no option matches the ngModel anymore), Angular would change the select element value
	* before actually removing the option from the DOM. Then when the option is finally removed
	* from the DOM, the browser would change the select value to that of the first option, even
	* though it doesn't match the ngModel (issue #18430).
	*
	* @internal
	*/
	_writeValueAfterRender() {
		if (this._queuedWrite || this.appRefInjector.destroyed) return;
		this._queuedWrite = true;
		afterNextRender({ write: () => {
			if (this.destroyRef.destroyed) return;
			this._queuedWrite = false;
			this.writeValue(this.value);
		} }, { injector: this.appRefInjector });
	}
	/**
	* Sets the "value" property on the select element.
	* @docs-private
	*/
	writeValue(value) {
		this.cdr.markForCheck();
		this.value = value;
		const valueString = _buildValueString$1(this._getOptionId(value), value);
		this.setProperty("value", valueString);
	}
	/**
	* Registers a function called when the control value changes.
	* @docs-private
	*/
	registerOnChange(fn) {
		this.onChange = (valueString) => {
			this.value = this._getOptionValue(valueString);
			fn(this.value);
		};
	}
	/** @internal */
	_registerOption() {
		return (this._idCounter++).toString();
	}
	/** @internal */
	_getOptionId(value) {
		for (const id of this._optionMap.keys()) if (this._compareWith(this._optionMap.get(id), value)) return id;
		return null;
	}
	/** @internal */
	_getOptionValue(valueString) {
		const id = _extractId$1(valueString);
		return this._optionMap.has(id) ? this._optionMap.get(id) : valueString;
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵSelectControlValueAccessor_BaseFactory;
		return function SelectControlValueAccessor_Factory(__ngFactoryType__) {
			return (ɵSelectControlValueAccessor_BaseFactory || (ɵSelectControlValueAccessor_BaseFactory = ɵɵgetInheritedFactory(SelectControlValueAccessor)))(__ngFactoryType__ || SelectControlValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: SelectControlValueAccessor,
		selectors: [
			[
				"select",
				"formControlName",
				"",
				3,
				"multiple",
				"",
				3,
				"ngNoCva",
				""
			],
			[
				"select",
				"formControl",
				"",
				3,
				"multiple",
				"",
				3,
				"ngNoCva",
				""
			],
			[
				"select",
				"ngModel",
				"",
				3,
				"multiple",
				"",
				3,
				"ngNoCva",
				""
			]
		],
		hostBindings: function SelectControlValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("change", function SelectControlValueAccessor_change_HostBindingHandler($event) {
				return ctx.onChange($event.target.value);
			})("blur", function SelectControlValueAccessor_blur_HostBindingHandler() {
				return ctx.onTouched();
			});
		},
		inputs: { compareWith: "compareWith" },
		standalone: false,
		features: [ɵɵProvidersFeature([SELECT_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(SelectControlValueAccessor, [{
		type: Directive,
		args: [{
			selector: "select:not([multiple]):not([ngNoCva])[formControlName],select:not([multiple]):not([ngNoCva])[formControl],select:not([multiple]):not([ngNoCva])[ngModel]",
			host: {
				"(change)": "onChange($any($event.target).value)",
				"(blur)": "onTouched()"
			},
			providers: [SELECT_VALUE_ACCESSOR],
			standalone: false
		}]
	}], null, { compareWith: [{ type: Input }] });
})();
/**
* @description
* Marks `<option>` as dynamic, so Angular can be notified when options change.
*
* @see {@link SelectControlValueAccessor}
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var NgSelectOption = class NgSelectOption {
	_element;
	_renderer;
	_select;
	/**
	* @description
	* ID of the option element
	*/
	id;
	constructor(_element, _renderer, _select) {
		this._element = _element;
		this._renderer = _renderer;
		this._select = _select;
		if (this._select) this.id = this._select._registerOption();
	}
	/**
	* @description
	* Tracks the value bound to the option element. Unlike the value binding,
	* ngValue supports binding to objects.
	*/
	set ngValue(value) {
		if (this._select == null) return;
		this._select._optionMap.set(this.id, value);
		this._setElementValue(_buildValueString$1(this.id, value));
		this._select._writeValueAfterRender();
	}
	/**
	* @description
	* Tracks simple string values bound to the option element.
	* For objects, use the `ngValue` input binding.
	*/
	set value(value) {
		this._setElementValue(value);
		this._select?._writeValueAfterRender();
	}
	/** @internal */
	_setElementValue(value) {
		this._renderer.setProperty(this._element.nativeElement, "value", value);
	}
	/** @docs-private */
	ngOnDestroy() {
		this._select?._optionMap.delete(this.id);
		this._select?._writeValueAfterRender();
	}
	static ɵfac = function NgSelectOption_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NgSelectOption)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(SelectControlValueAccessor, 9));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: NgSelectOption,
		selectors: [["option"]],
		inputs: {
			ngValue: "ngValue",
			value: "value"
		},
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(NgSelectOption, [{
		type: Directive,
		args: [{
			selector: "option",
			standalone: false
		}]
	}], () => [
		{ type: ElementRef },
		{ type: Renderer2 },
		{
			type: SelectControlValueAccessor,
			decorators: [{ type: Optional }, { type: Host }]
		}
	], {
		ngValue: [{
			type: Input,
			args: ["ngValue"]
		}],
		value: [{
			type: Input,
			args: ["value"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var SELECT_MULTIPLE_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => SelectMultipleControlValueAccessor),
	multi: true
};
function _buildValueString(id, value) {
	if (id == null) return `${value}`;
	if (typeof value === "string") value = `'${value}'`;
	if (value && typeof value === "object") value = "Object";
	return `${id}: ${value}`.slice(0, 50);
}
function _extractId(valueString) {
	return valueString.split(":")[0];
}
/**
* @description
* The `ControlValueAccessor` for writing multi-select control values and listening to multi-select
* control changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
* `NgModel` directives.
*
* @see {@link SelectControlValueAccessor}
*
* @usageNotes
*
* ### Using a multi-select control
*
* The follow example shows you how to use a multi-select control with a reactive form.
*
* ```ts
* const countryControl = new FormControl();
* ```
*
* ```html
* <select multiple name="countries" [formControl]="countryControl">
*   @for(country of countries; track $index) {
*      <option [ngValue]="country">{{ country.name }}</option>
*   }
* </select>
* ```
*
* ### Customizing option selection
*
* To customize the default option comparison algorithm, `<select>` supports `compareWith` input.
* See the `SelectControlValueAccessor` for usage.
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var SelectMultipleControlValueAccessor = class SelectMultipleControlValueAccessor extends BuiltInControlValueAccessor {
	/**
	* The current value.
	* @docs-private
	*/
	value;
	/** @internal */
	_optionMap = /* @__PURE__ */ new Map();
	/** @internal */
	_idCounter = 0;
	/**
	* @description
	* Tracks the option comparison algorithm for tracking identities when
	* checking for changes.
	*/
	set compareWith(fn) {
		if (typeof fn !== "function" && (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode)) throw new RuntimeError(1201, `compareWith must be a function, but received ${JSON.stringify(fn)}`);
		this._compareWith = fn;
	}
	_compareWith = Object.is;
	/**
	* Sets the "value" property on one or of more of the select's options.
	* @docs-private
	*/
	writeValue(value) {
		this.value = value;
		let optionSelectedStateSetter;
		if (Array.isArray(value)) {
			const ids = value.map((v) => this._getOptionId(v));
			optionSelectedStateSetter = (opt, id) => {
				opt._setSelected(ids.indexOf(id) > -1);
			};
		} else optionSelectedStateSetter = (opt) => {
			opt._setSelected(false);
		};
		this._optionMap.forEach(optionSelectedStateSetter);
	}
	/**
	* Registers a function called when the control value changes
	* and writes an array of the selected options.
	* @docs-private
	*/
	registerOnChange(fn) {
		this.onChange = (element) => {
			const selected = [];
			const selectedOptions = element.selectedOptions;
			if (selectedOptions !== void 0) {
				const options = selectedOptions;
				for (let i = 0; i < options.length; i++) {
					const opt = options[i];
					const val = this._getOptionValue(opt.value);
					selected.push(val);
				}
			} else {
				const options = element.options;
				for (let i = 0; i < options.length; i++) {
					const opt = options[i];
					if (opt.selected) {
						const val = this._getOptionValue(opt.value);
						selected.push(val);
					}
				}
			}
			this.value = selected;
			fn(selected);
		};
	}
	/** @internal */
	_registerOption(value) {
		const id = (this._idCounter++).toString();
		this._optionMap.set(id, value);
		return id;
	}
	/** @internal */
	_getOptionId(value) {
		for (const id of this._optionMap.keys()) if (this._compareWith(this._optionMap.get(id)._value, value)) return id;
		return null;
	}
	/** @internal */
	_getOptionValue(valueString) {
		const id = _extractId(valueString);
		return this._optionMap.has(id) ? this._optionMap.get(id)._value : valueString;
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵSelectMultipleControlValueAccessor_BaseFactory;
		return function SelectMultipleControlValueAccessor_Factory(__ngFactoryType__) {
			return (ɵSelectMultipleControlValueAccessor_BaseFactory || (ɵSelectMultipleControlValueAccessor_BaseFactory = ɵɵgetInheritedFactory(SelectMultipleControlValueAccessor)))(__ngFactoryType__ || SelectMultipleControlValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: SelectMultipleControlValueAccessor,
		selectors: [
			[
				"select",
				"multiple",
				"",
				"formControlName",
				"",
				3,
				"ngNoCva",
				""
			],
			[
				"select",
				"multiple",
				"",
				"formControl",
				"",
				3,
				"ngNoCva",
				""
			],
			[
				"select",
				"multiple",
				"",
				"ngModel",
				"",
				3,
				"ngNoCva",
				""
			]
		],
		hostBindings: function SelectMultipleControlValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("change", function SelectMultipleControlValueAccessor_change_HostBindingHandler($event) {
				return ctx.onChange($event.target);
			})("blur", function SelectMultipleControlValueAccessor_blur_HostBindingHandler() {
				return ctx.onTouched();
			});
		},
		inputs: { compareWith: "compareWith" },
		standalone: false,
		features: [ɵɵProvidersFeature([SELECT_MULTIPLE_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(SelectMultipleControlValueAccessor, [{
		type: Directive,
		args: [{
			selector: "select[multiple]:not([ngNoCva])[formControlName],select[multiple]:not([ngNoCva])[formControl],select[multiple]:not([ngNoCva])[ngModel]",
			host: {
				"(change)": "onChange($event.target)",
				"(blur)": "onTouched()"
			},
			providers: [SELECT_MULTIPLE_VALUE_ACCESSOR],
			standalone: false
		}]
	}], null, { compareWith: [{ type: Input }] });
})();
/**
* @description
* Marks `<option>` as dynamic, so Angular can be notified when options change.
*
* @see {@link SelectMultipleControlValueAccessor}
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var ɵNgSelectMultipleOption = class ɵNgSelectMultipleOption {
	_element;
	_renderer;
	_select;
	id;
	/** @internal */
	_value;
	constructor(_element, _renderer, _select) {
		this._element = _element;
		this._renderer = _renderer;
		this._select = _select;
		if (this._select) this.id = this._select._registerOption(this);
	}
	/**
	* @description
	* Tracks the value bound to the option element. Unlike the value binding,
	* ngValue supports binding to objects.
	*/
	set ngValue(value) {
		if (this._select == null) return;
		this._value = value;
		this._setElementValue(_buildValueString(this.id, value));
		this._select.writeValue(this._select.value);
	}
	/**
	* @description
	* Tracks simple string values bound to the option element.
	* For objects, use the `ngValue` input binding.
	*/
	set value(value) {
		if (this._select) {
			this._value = value;
			this._setElementValue(_buildValueString(this.id, value));
			this._select.writeValue(this._select.value);
		} else this._setElementValue(value);
	}
	/** @internal */
	_setElementValue(value) {
		this._renderer.setProperty(this._element.nativeElement, "value", value);
	}
	/** @internal */
	_setSelected(selected) {
		this._renderer.setProperty(this._element.nativeElement, "selected", selected);
	}
	/** @docs-private */
	ngOnDestroy() {
		if (this._select) {
			this._select._optionMap.delete(this.id);
			this._select.writeValue(this._select.value);
		}
	}
	static ɵfac = function ɵNgSelectMultipleOption_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ɵNgSelectMultipleOption)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(SelectMultipleControlValueAccessor, 9));
	};
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: ɵNgSelectMultipleOption,
		selectors: [["option"]],
		inputs: {
			ngValue: "ngValue",
			value: "value"
		},
		standalone: false
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(ɵNgSelectMultipleOption, [{
		type: Directive,
		args: [{
			selector: "option",
			standalone: false
		}]
	}], () => [
		{ type: ElementRef },
		{ type: Renderer2 },
		{
			type: SelectMultipleControlValueAccessor,
			decorators: [{ type: Optional }, { type: Host }]
		}
	], {
		ngValue: [{
			type: Input,
			args: ["ngValue"]
		}],
		value: [{
			type: Input,
			args: ["value"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
var NUMBER_VALUE_ACCESSOR$1 = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => SliderValueAccessor),
	multi: true
};
/**
* @description
* The `ControlValueAccessor` for writing a number value and listening to number input changes.
* The value accessor is used by the `FormControlDirective`, `FormControlName`, and `NgModel`
* directives.
*
* @usageNotes
*
* ### Using a number input with a reactive form.
*
* The following example shows how to use a number input with a reactive form.
*
* ```ts
* const totalCountControl = new FormControl();
* ```
*
* ```
* <input type="number" [formControl]="totalCountControl">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var SliderValueAccessor = class SliderValueAccessor extends BuiltInControlValueAccessor {
	value;
	disabled;
	/**
	* Sets the "value" property on the input element.
	* @nodoc
	*/
	writeValue(value) {
		const normalizedValue = value == null ? void 0 : value;
		if (typeof normalizedValue !== "undefined") this.setProperty("value", normalizedValue);
	}
	valueChange(value) {
		this.setProperty("value", value);
		this.onChange(value);
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵSliderValueAccessor_BaseFactory;
		return function SliderValueAccessor_Factory(__ngFactoryType__) {
			return (ɵSliderValueAccessor_BaseFactory || (ɵSliderValueAccessor_BaseFactory = ɵɵgetInheritedFactory(SliderValueAccessor)))(__ngFactoryType__ || SliderValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: SliderValueAccessor,
		selectors: [
			[
				"slider",
				"formControlName",
				""
			],
			[
				"slider",
				"formControl",
				""
			],
			[
				"slider",
				"ngModel",
				""
			]
		],
		hostVars: 2,
		hostBindings: function SliderValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("bindchange", function SliderValueAccessor_bindchange_HostBindingHandler($event) {
				return ctx.valueChange($event.detail.value);
			});
			if (rf & 2) ɵɵdomProperty("value", ctx.value)("disabled", ctx.disabled);
		},
		standalone: false,
		features: [ɵɵProvidersFeature([NUMBER_VALUE_ACCESSOR$1]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(SliderValueAccessor, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "slider[formControlName],slider[formControl],slider[ngModel]",
			host: { "(bindchange)": "valueChange($event.detail.value)" },
			providers: [NUMBER_VALUE_ACCESSOR$1]
		}]
	}], null, {
		value: [{
			type: HostBinding,
			args: ["value"]
		}],
		disabled: [{
			type: HostBinding,
			args: ["disabled"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
var SWITCH_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => SwitchValueAccessor),
	multi: true
};
/**
* @description
* The `ControlValueAccessor` for writing a number value and listening to number input changes.
* The value accessor is used by the `FormControlDirective`, `FormControlName`, and `NgModel`
* directives.
*
* @usageNotes
*
* ### Using a number input with a reactive form.
*
* The following example shows how to use a number input with a reactive form.
*
* ```ts
* const totalCountControl = new FormControl();
* ```
*
* ```
* <input type="number" [formControl]="totalCountControl">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var SwitchValueAccessor = class SwitchValueAccessor extends BuiltInControlValueAccessor {
	value;
	disabled;
	/**
	* Sets the "value" property on the input element.
	* @nodoc
	*/
	writeValue(value) {
		const normalizedValue = value == null ? void 0 : value;
		if (typeof normalizedValue !== "undefined") this.setProperty("value", normalizedValue);
	}
	valueChange(value) {
		this.setProperty("value", value);
		this.onChange(value);
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵSwitchValueAccessor_BaseFactory;
		return function SwitchValueAccessor_Factory(__ngFactoryType__) {
			return (ɵSwitchValueAccessor_BaseFactory || (ɵSwitchValueAccessor_BaseFactory = ɵɵgetInheritedFactory(SwitchValueAccessor)))(__ngFactoryType__ || SwitchValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: SwitchValueAccessor,
		selectors: [
			[
				"switch",
				"formControlName",
				""
			],
			[
				"switch",
				"formControl",
				""
			],
			[
				"switch",
				"ngModel",
				""
			]
		],
		hostVars: 2,
		hostBindings: function SwitchValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("bindchange", function SwitchValueAccessor_bindchange_HostBindingHandler($event) {
				return ctx.valueChange($event.detail.value);
			});
			if (rf & 2) ɵɵdomProperty("checked", ctx.value)("disabled", ctx.disabled);
		},
		standalone: false,
		features: [ɵɵProvidersFeature([SWITCH_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(SwitchValueAccessor, [{
		type: Directive,
		args: [{
			standalone: false,
			selector: "switch[formControlName],switch[formControl],switch[ngModel]",
			host: { "(bindchange)": "valueChange($event.detail.value)" },
			providers: [SWITCH_VALUE_ACCESSOR]
		}]
	}], null, {
		value: [{
			type: HostBinding,
			args: ["checked"]
		}],
		disabled: [{
			type: HostBinding,
			args: ["disabled"]
		}]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
var SHARED_FORM_DIRECTIVES = [
	ɵNgNoValidate,
	NgSelectOption,
	ɵNgSelectMultipleOption,
	DefaultValueAccessor,
	SliderValueAccessor,
	RangeValueAccessor,
	CheckboxControl,
	SelectControlValueAccessor,
	SelectMultipleControlValueAccessor,
	RadioControl,
	NgControlStatus,
	NgControlStatusGroup,
	RequiredValidator,
	MinLengthValidator,
	MaxLengthValidator,
	PatternValidator,
	CheckboxRequiredValidator,
	EmailValidator,
	MinValidator,
	MaxValidator,
	SwitchValueAccessor,
	PickerViewValueAccessor,
	PickerValueAccessor,
	RadioGroupValueAccessor,
	CheckBoxGroupValueAccessor
];
var TEMPLATE_DRIVEN_DIRECTIVES = [
	NgModel,
	NgModelGroup,
	NgForm
];
var REACTIVE_DRIVEN_DIRECTIVES = [
	FormControlDirective,
	FormGroupDirective,
	FormControlName,
	FormGroupName,
	FormArrayName
];
/**
* Internal module used for sharing directives between FormsModule and ReactiveFormsModule
*/
var ɵInternalFormsSharedModule = class ɵInternalFormsSharedModule {
	static ɵfac = function ɵInternalFormsSharedModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ɵInternalFormsSharedModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: ɵInternalFormsSharedModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [RadioControlRegistryModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(ɵInternalFormsSharedModule, [{
		type: NgModule,
		args: [{
			declarations: SHARED_FORM_DIRECTIVES,
			imports: [RadioControlRegistryModule],
			exports: SHARED_FORM_DIRECTIVES
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(ɵInternalFormsSharedModule, {
		declarations: [
			ɵNgNoValidate,
			NgSelectOption,
			ɵNgSelectMultipleOption,
			DefaultValueAccessor,
			SliderValueAccessor,
			RangeValueAccessor,
			CheckboxControl,
			SelectControlValueAccessor,
			SelectMultipleControlValueAccessor,
			RadioControl,
			NgControlStatus,
			NgControlStatusGroup,
			RequiredValidator,
			MinLengthValidator,
			MaxLengthValidator,
			PatternValidator,
			CheckboxRequiredValidator,
			EmailValidator,
			MinValidator,
			MaxValidator,
			SwitchValueAccessor,
			PickerViewValueAccessor,
			PickerValueAccessor,
			RadioGroupValueAccessor,
			CheckBoxGroupValueAccessor
		],
		imports: [RadioControlRegistryModule],
		exports: [
			ɵNgNoValidate,
			NgSelectOption,
			ɵNgSelectMultipleOption,
			DefaultValueAccessor,
			SliderValueAccessor,
			RangeValueAccessor,
			CheckboxControl,
			SelectControlValueAccessor,
			SelectMultipleControlValueAccessor,
			RadioControl,
			NgControlStatus,
			NgControlStatusGroup,
			RequiredValidator,
			MinLengthValidator,
			MaxLengthValidator,
			PatternValidator,
			CheckboxRequiredValidator,
			EmailValidator,
			MinValidator,
			MaxValidator,
			SwitchValueAccessor,
			PickerViewValueAccessor,
			PickerValueAccessor,
			RadioGroupValueAccessor,
			CheckBoxGroupValueAccessor
		]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var NUMBER_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => NumberValueAccessor),
	multi: true
};
/**
* @description
* The `ControlValueAccessor` for writing a number value and listening to number input changes.
* The value accessor is used by the `FormControlDirective`, `FormControlName`, and `NgModel`
* directives.
*
* @usageNotes
*
* ### Using a number input with a reactive form.
*
* The following example shows how to use a number input with a reactive form.
*
* ```ts
* const totalCountControl = new FormControl();
* ```
*
* ```html
* <input type="number" [formControl]="totalCountControl">
* ```
*
* @ngModule ReactiveFormsModule
* @ngModule FormsModule
* @publicApi
*/
var NumberValueAccessor = class NumberValueAccessor extends BuiltInControlValueAccessor {
	/**
	* Sets the "value" property on the input element.
	* @docs-private
	*/
	writeValue(value) {
		const normalizedValue = value == null ? "" : value;
		this.setProperty("value", normalizedValue);
	}
	/**
	* Registers a function called when the control value changes.
	* @docs-private
	*/
	registerOnChange(fn) {
		this.onChange = (value) => {
			fn(value == "" ? null : parseFloat(value));
		};
	}
	static ɵfac = /*@__PURE__*/ (() => {
		let ɵNumberValueAccessor_BaseFactory;
		return function NumberValueAccessor_Factory(__ngFactoryType__) {
			return (ɵNumberValueAccessor_BaseFactory || (ɵNumberValueAccessor_BaseFactory = ɵɵgetInheritedFactory(NumberValueAccessor)))(__ngFactoryType__ || NumberValueAccessor);
		};
	})();
	static ɵdir = /*@__PURE__*/ ɵɵdefineDirective({
		type: NumberValueAccessor,
		selectors: [
			[
				"input",
				"type",
				"number",
				"formControlName",
				"",
				3,
				"ngNoCva",
				""
			],
			[
				"input",
				"type",
				"number",
				"formControl",
				"",
				3,
				"ngNoCva",
				""
			],
			[
				"input",
				"type",
				"number",
				"ngModel",
				"",
				3,
				"ngNoCva",
				""
			]
		],
		hostBindings: function NumberValueAccessor_HostBindings(rf, ctx) {
			if (rf & 1) ɵɵlistener("input", function NumberValueAccessor_input_HostBindingHandler($event) {
				return ctx.onChange($event.target.value);
			})("blur", function NumberValueAccessor_blur_HostBindingHandler() {
				return ctx.onTouched();
			});
		},
		standalone: false,
		features: [ɵɵProvidersFeature([NUMBER_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature]
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(NumberValueAccessor, [{
		type: Directive,
		args: [{
			selector: "input[type=number]:not([ngNoCva])[formControlName],input[type=number]:not([ngNoCva])[formControl],input[type=number]:not([ngNoCva])[ngModel]",
			host: {
				"(input)": "onChange($any($event.target).value)",
				"(blur)": "onTouched()"
			},
			providers: [NUMBER_VALUE_ACCESSOR],
			standalone: false
		}]
	}], null, null);
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* Tracks the value and validity state of an array of `FormControl`,
* `FormGroup` or `FormArray` instances.
*
* A `FormArray` aggregates the values of each child `FormControl` into an array.
* It calculates its status by reducing the status values of its children. For example, if one of
* the controls in a `FormArray` is invalid, the entire array becomes invalid. Similarly, if all
* controls in a `FormArray` are disabled, the entire array becomes disabled.
*
* `FormArray` accepts one generic argument, which is the type of the controls inside.
* If you need a heterogenous array, use {@link UntypedFormArray}.
*
* `FormArray` is one of the four fundamental building blocks used to define forms in Angular,
* along with `FormControl`, `FormGroup`, and `FormRecord`.
*
* @usageNotes
*
* ### Create an array of form controls
*
* ```ts
* const arr = new FormArray([
*   new FormControl('Nancy', Validators.minLength(2)),
*   new FormControl('Drew'),
* ]);
*
* console.log(arr.value);   // ['Nancy', 'Drew']
* console.log(arr.status);  // 'VALID'
* ```
*
* ### Create a form array with array-level validators
*
* You include array-level validators and async validators. These come in handy
* when you want to perform validation that considers the value of more than one child
* control.
*
* The two types of validators are passed in separately as the second and third arg
* respectively, or together as part of an options object.
*
* ```ts
* const arr = new FormArray([
*   new FormControl('Nancy'),
*   new FormControl('Drew')
* ], {validators: myValidator, asyncValidators: myAsyncValidator});
* ```
*
* ### Set the updateOn property for all controls in a form array
*
* The options object is used to set a default value for each child
* control's `updateOn` property. If you set `updateOn` to `'blur'` at the
* array level, all child controls default to 'blur', unless the child
* has explicitly specified a different `updateOn` value.
*
* ```ts
* const arr = new FormArray([
*    new FormControl()
* ], {updateOn: 'blur'});
* ```
*
* ### Adding or removing controls from a form array
*
* To change the controls in the array, use the `push`, `insert`, `removeAt` or `clear` methods
* in `FormArray` itself. These methods ensure the controls are properly tracked in the
* form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
* the `FormArray` directly, as that result in strange and unexpected behavior such
* as broken change detection.
*
* @see [FormArray: Dynamic, Homogenous Collections](guide/forms/typed-forms#formarray-dynamic-homogenous-collections)
* @see [Creating dynamic forms](guide/forms/reactive-forms#creating-dynamic-forms)
*
* @publicApi
*/
var FormArray = class extends AbstractControl {
	/**
	* Creates a new `FormArray` instance.
	*
	* @param controls An array of child controls. Each child control is given an index
	* where it is registered.
	*
	* @param validatorOrOpts A synchronous validator function, or an array of
	* such functions, or an `AbstractControlOptions` object that contains validation functions
	* and a validation trigger.
	*
	* @param asyncValidator A single async validator or array of async validator functions
	*
	*/
	constructor(controls, validatorOrOpts, asyncValidator) {
		super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
		this.controls = controls;
		this._initObservables();
		this._setUpdateStrategy(validatorOrOpts);
		this._setUpControls();
		this.updateValueAndValidity({
			onlySelf: true,
			emitEvent: !!this.asyncValidator
		});
	}
	controls;
	/**
	* Get the `AbstractControl` at the given `index` in the array.
	*
	* @param index Index in the array to retrieve the control. If `index` is negative, it will wrap
	*     around from the back, and if index is greatly negative (less than `-length`), the result is
	* undefined. This behavior is the same as `Array.at(index)`.
	*/
	at(index) {
		return this.controls[this._adjustIndex(index)];
	}
	/**
	* Insert a new `AbstractControl` at the end of the array.
	*
	* @param control Form control to be inserted
	* @param options Specifies whether this FormArray instance should emit events after a new
	*     control is added.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges` observables emit events with the latest status and value when the control is
	* inserted. When false, no events are emitted.
	*
	* NOTE: Pushing to the FormArray will not mark it dirty. If you want to mark if dirty, call `markAsDirty()`.
	*/
	push(control, options = {}) {
		if (Array.isArray(control)) control.forEach((ctrl) => {
			this.controls.push(ctrl);
			this._registerControl(ctrl);
		});
		else {
			this.controls.push(control);
			this._registerControl(control);
		}
		this.updateValueAndValidity({ emitEvent: options.emitEvent });
		this._onCollectionChange();
	}
	/**
	* Insert a new `AbstractControl` at the given `index` in the array.
	*
	* @param index Index in the array to insert the control. If `index` is negative, wraps around
	*     from the back. If `index` is greatly negative (less than `-length`), prepends to the array.
	* This behavior is the same as `Array.splice(index, 0, control)`.
	* @param control Form control to be inserted
	* @param options Specifies whether this FormArray instance should emit events after a new
	*     control is inserted.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges` observables emit events with the latest status and value when the control is
	* inserted. When false, no events are emitted.
	*
	* NOTE: Inserting to the FormArray will not mark it dirty. If you want to mark if dirty, call `markAsDirty()`.
	*/
	insert(index, control, options = {}) {
		this.controls.splice(index, 0, control);
		this._registerControl(control);
		this.updateValueAndValidity({ emitEvent: options.emitEvent });
	}
	/**
	* Remove the control at the given `index` in the array.
	*
	* @param index Index in the array to remove the control.  If `index` is negative, wraps around
	*     from the back. If `index` is greatly negative (less than `-length`), removes the first
	*     element. This behavior is the same as `Array.splice(index, 1)`.
	* @param options Specifies whether this FormArray instance should emit events after a
	*     control is removed.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges` observables emit events with the latest status and value when the control is
	* removed. When false, no events are emitted.
	*
	* NOTE: Removing the FormArray will not mark it dirty. If you want to mark if dirty, call `markAsDirty()`.
	*/
	removeAt(index, options = {}) {
		let adjustedIndex = this._adjustIndex(index);
		if (adjustedIndex < 0) adjustedIndex = 0;
		if (this.controls[adjustedIndex]) this.controls[adjustedIndex]._registerOnCollectionChange(() => {});
		this.controls.splice(adjustedIndex, 1);
		this.updateValueAndValidity({ emitEvent: options.emitEvent });
	}
	/**
	* Replace an existing control.
	*
	* @param index Index in the array to replace the control. If `index` is negative, wraps around
	*     from the back. If `index` is greatly negative (less than `-length`), replaces the first
	*     element. This behavior is the same as `Array.splice(index, 1, control)`.
	* @param control The `AbstractControl` control to replace the existing control
	* @param options Specifies whether this FormArray instance should emit events after an
	*     existing control is replaced with a new one.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges` observables emit events with the latest status and value when the control is
	* replaced with a new one. When false, no events are emitted.
	*/
	setControl(index, control, options = {}) {
		let adjustedIndex = this._adjustIndex(index);
		if (adjustedIndex < 0) adjustedIndex = 0;
		if (this.controls[adjustedIndex]) this.controls[adjustedIndex]._registerOnCollectionChange(() => {});
		this.controls.splice(adjustedIndex, 1);
		if (control) {
			this.controls.splice(adjustedIndex, 0, control);
			this._registerControl(control);
		}
		this.updateValueAndValidity({ emitEvent: options.emitEvent });
		this._onCollectionChange();
	}
	/**
	* Length of the control array.
	*/
	get length() {
		return this.controls.length;
	}
	/**
	* Sets the value of the `FormArray`. It accepts an array that matches
	* the structure of the control.
	*
	* This method performs strict checks, and throws an error if you try
	* to set the value of a control that doesn't exist or if you exclude the
	* value of a control.
	*
	* @usageNotes
	* ### Set the values for the controls in the form array
	*
	* ```ts
	* const arr = new FormArray([
	*   new FormControl(),
	*   new FormControl()
	* ]);
	* console.log(arr.value);   // [null, null]
	*
	* arr.setValue(['Nancy', 'Drew']);
	* console.log(arr.value);   // ['Nancy', 'Drew']
	* ```
	*
	* @param value Array of values for the controls
	* @param options Configure options that determine how the control propagates changes and
	* emits events after the value changes
	*
	* * `onlySelf`: When true, each change only affects this control, and not its parent. Default
	* is false.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges`
	* observables emit events with the latest status and value when the control value is updated.
	* When false, no events are emitted.
	* The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	* updateValueAndValidity} method.
	*/
	setValue(value, options = {}) {
		untracked(() => {
			assertAllValuesPresent(this, false, value);
			value.forEach((newValue, index) => {
				assertControlPresent(this, false, index);
				this.at(index).setValue(newValue, {
					onlySelf: true,
					emitEvent: options.emitEvent
				});
			});
			this.updateValueAndValidity(options);
		});
	}
	/**
	* Patches the value of the `FormArray`. It accepts an array that matches the
	* structure of the control, and does its best to match the values to the correct
	* controls in the group.
	*
	* It accepts both super-sets and sub-sets of the array without throwing an error.
	*
	* @usageNotes
	* ### Patch the values for controls in a form array
	*
	* ```ts
	* const arr = new FormArray([
	*    new FormControl(),
	*    new FormControl()
	* ]);
	* console.log(arr.value);   // [null, null]
	*
	* arr.patchValue(['Nancy']);
	* console.log(arr.value);   // ['Nancy', null]
	* ```
	*
	* @param value Array of latest values for the controls
	* @param options Configure options that determine how the control propagates changes and
	* emits events after the value changes
	*
	* * `onlySelf`: When true, each change only affects this control, and not its parent. Default
	* is false.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges` observables emit events with the latest status and value when the control
	* value is updated. When false, no events are emitted. The configuration options are passed to
	* the {@link AbstractControl#updateValueAndValidity updateValueAndValidity} method.
	*/
	patchValue(value, options = {}) {
		if (value == null) return;
		value.forEach((newValue, index) => {
			if (this.at(index)) this.at(index).patchValue(newValue, {
				onlySelf: true,
				emitEvent: options.emitEvent
			});
		});
		this.updateValueAndValidity(options);
	}
	/**
	* Resets the `FormArray` and all descendants are marked `pristine` and `untouched`, and the
	* value of all descendants to null or null maps.
	*
	* You reset to a specific form state by passing in an array of states
	* that matches the structure of the control. The state is a standalone value
	* or a form state object with both a value and a disabled status.
	*
	* @usageNotes
	* ### Reset the values in a form array
	*
	* ```ts
	* const arr = new FormArray([
	*    new FormControl(),
	*    new FormControl()
	* ]);
	* arr.reset(['name', 'last name']);
	*
	* console.log(arr.value);  // ['name', 'last name']
	* ```
	*
	* ### Reset the values in a form array and the disabled status for the first control
	*
	* ```ts
	* arr.reset([
	*   {value: 'name', disabled: true},
	*   'last'
	* ]);
	*
	* console.log(arr.value);  // ['last']
	* console.log(arr.at(0).status);  // 'DISABLED'
	* ```
	*
	* @param value Array of values for the controls
	* @param options Configure options that determine how the control propagates changes and
	* emits events after the value changes
	*
	* * `onlySelf`: When true, each change only affects this control, and not its parent. Default
	* is false.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges`
	* observables emit events with the latest status and value when the control is reset.
	* When false, no events are emitted.
	* The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	* updateValueAndValidity} method.
	*/
	reset(value = [], options = {}) {
		this._forEachChild((control, index) => {
			control.reset(value[index], {
				...options,
				onlySelf: true
			});
		});
		this._updatePristine(options, this);
		this._updateTouched(options, this);
		this.updateValueAndValidity(options);
		if (options?.emitEvent !== false) this._events.next(new FormResetEvent(this));
	}
	/**
	* The aggregate value of the array, including any disabled controls.
	*
	* Reports all values regardless of disabled status.
	*/
	getRawValue() {
		return this.controls.map((control) => control.getRawValue());
	}
	/**
	* Remove all controls in the `FormArray`.
	*
	* @param options Specifies whether this FormArray instance should emit events after all
	*     controls are removed.
	* * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	* `valueChanges` observables emit events with the latest status and value when all controls
	* in this FormArray instance are removed. When false, no events are emitted.
	*
	* @usageNotes
	* ### Remove all elements from a FormArray
	*
	* ```ts
	* const arr = new FormArray([
	*    new FormControl(),
	*    new FormControl()
	* ]);
	* console.log(arr.length);  // 2
	*
	* arr.clear();
	* console.log(arr.length);  // 0
	* ```
	*
	* It's a simpler and more efficient alternative to removing all elements one by one:
	*
	* ```ts
	* const arr = new FormArray([
	*    new FormControl(),
	*    new FormControl()
	* ]);
	*
	* while (arr.length) {
	*    arr.removeAt(0);
	* }
	* ```
	*/
	clear(options = {}) {
		if (this.controls.length < 1) return;
		this._forEachChild((control) => control._registerOnCollectionChange(() => {}));
		this.controls.splice(0);
		this.updateValueAndValidity({ emitEvent: options.emitEvent });
	}
	/**
	* Adjusts a negative index by summing it with the length of the array. For very negative
	* indices, the result may remain negative.
	* @internal
	*/
	_adjustIndex(index) {
		return index < 0 ? index + this.length : index;
	}
	/** @internal */
	_syncPendingControls() {
		let subtreeUpdated = this.controls.reduce((updated, child) => {
			return child._syncPendingControls() ? true : updated;
		}, false);
		if (subtreeUpdated) this.updateValueAndValidity({ onlySelf: true });
		return subtreeUpdated;
	}
	/** @internal */
	_forEachChild(cb) {
		this.controls.forEach((control, index) => {
			cb(control, index);
		});
	}
	/** @internal */
	_updateValue() {
		this.value = this.controls.filter((control) => control.enabled || this.disabled).map((control) => control.value);
	}
	/** @internal */
	_anyControls(condition) {
		return this.controls.some((control) => control.enabled && condition(control));
	}
	/** @internal */
	_setUpControls() {
		this._forEachChild((control) => this._registerControl(control));
	}
	/** @internal */
	_allControlsDisabled() {
		for (const control of this.controls) if (control.enabled) return false;
		return this.controls.length > 0 || this.disabled;
	}
	_registerControl(control) {
		control.setParent(this);
		control._registerOnCollectionChange(this._onCollectionChange);
	}
	/** @internal */
	_find(name) {
		return this.at(name) ?? null;
	}
};
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
function isAbstractControlOptions(options) {
	return !!options && (options.asyncValidators !== void 0 || options.validators !== void 0 || options.updateOn !== void 0);
}
/**
* @description
* Creates an `AbstractControl` from a user-specified configuration.
*
* The `FormBuilder` provides syntactic sugar that shortens creating instances of a
* `FormControl`, `FormGroup`, or `FormArray`. It reduces the amount of boilerplate needed to
* build complex forms.
*
* @see [Reactive Forms Guide](guide/forms/reactive-forms)
*
* @publicApi
*/
var FormBuilder = class FormBuilder {
	useNonNullable = false;
	/**
	* @description
	* Returns a FormBuilder in which automatically constructed `FormControl` elements
	* have `{nonNullable: true}` and are non-nullable.
	*
	* **Constructing non-nullable controls**
	*
	* When constructing a control, it will be non-nullable, and will reset to its initial value.
	*
	* ```ts
	* let nnfb = new FormBuilder().nonNullable;
	* let name = nnfb.control('Alex'); // FormControl<string>
	* name.reset();
	* console.log(name); // 'Alex'
	* ```
	*
	* **Constructing non-nullable groups or arrays**
	*
	* When constructing a group or array, all automatically created inner controls will be
	* non-nullable, and will reset to their initial values.
	*
	* ```ts
	* let nnfb = new FormBuilder().nonNullable;
	* let name = nnfb.group({who: 'Alex'}); // FormGroup<{who: FormControl<string>}>
	* name.reset();
	* console.log(name); // {who: 'Alex'}
	* ```
	* **Constructing *nullable* fields on groups or arrays**
	*
	* It is still possible to have a nullable field. In particular, any `FormControl` which is
	* *already* constructed will not be altered. For example:
	*
	* ```ts
	* let nnfb = new FormBuilder().nonNullable;
	* // FormGroup<{who: FormControl<string|null>}>
	* let name = nnfb.group({who: new FormControl('Alex')});
	* name.reset(); console.log(name); // {who: null}
	* ```
	*
	* Because the inner control is constructed explicitly by the caller, the builder has
	* no control over how it is created, and cannot exclude the `null`.
	*/
	get nonNullable() {
		const nnfb = new FormBuilder();
		nnfb.useNonNullable = true;
		return nnfb;
	}
	group(controls, options = null) {
		const reducedControls = this._reduceControls(controls);
		let newOptions = {};
		if (isAbstractControlOptions(options)) newOptions = options;
		else if (options !== null) {
			newOptions.validators = options.validator;
			newOptions.asyncValidators = options.asyncValidator;
		}
		return new FormGroup(reducedControls, newOptions);
	}
	/**
	* @description
	* Constructs a new `FormRecord` instance. Accepts a single generic argument, which is an object
	* containing all the keys and corresponding inner control types.
	*
	* @param controls A collection of child controls. The key for each child is the name
	* under which it is registered.
	*
	* @param options Configuration options object for the `FormRecord`. The object should have the
	* `AbstractControlOptions` type and might contain the following fields:
	* * `validators`: A synchronous validator function, or an array of validator functions.
	* * `asyncValidators`: A single async validator or array of async validator functions.
	* * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur'
	* | submit').
	*/
	record(controls, options = null) {
		return new FormRecord(this._reduceControls(controls), options);
	}
	/**
	* @description
	* Constructs a new `FormControl` with the given state, validators and options. Sets
	* `{nonNullable: true}` in the options to get a non-nullable control. Otherwise, the
	* control will be nullable. Accepts a single generic argument, which is the type  of the
	* control's value.
	*
	* @param formState Initializes the control with an initial state value, or
	* with an object that contains both a value and a disabled status.
	*
	* @param validatorOrOpts A synchronous validator function, or an array of
	* such functions, or a `FormControlOptions` object that contains
	* validation functions and a validation trigger.
	*
	* @param asyncValidator A single async validator or array of async validator
	* functions.
	*
	* @usageNotes
	*
	* ### Initialize a control as disabled
	*
	* The following example returns a control with an initial value in a disabled state.
	*
	* {@example forms/ts/formBuilder/form_builder_example.ts region='disabled-control'}
	*/
	control(formState, validatorOrOpts, asyncValidator) {
		let newOptions = {};
		if (!this.useNonNullable) return new FormControl(formState, validatorOrOpts, asyncValidator);
		if (isAbstractControlOptions(validatorOrOpts)) newOptions = validatorOrOpts;
		else {
			newOptions.validators = validatorOrOpts;
			newOptions.asyncValidators = asyncValidator;
		}
		return new FormControl(formState, {
			...newOptions,
			nonNullable: true
		});
	}
	/**
	* Constructs a new `FormArray` from the given array of configurations,
	* validators and options. Accepts a single generic argument, which is the type of each control
	* inside the array.
	*
	* @param controls An array of child controls or control configs. Each child control is given an
	*     index when it is registered.
	*
	* @param validatorOrOpts A synchronous validator function, or an array of such functions, or an
	*     `AbstractControlOptions` object that contains
	* validation functions and a validation trigger.
	*
	* @param asyncValidator A single async validator or array of async validator functions.
	*/
	array(controls, validatorOrOpts, asyncValidator) {
		return new FormArray(controls.map((c) => this._createControl(c)), validatorOrOpts, asyncValidator);
	}
	/** @internal */
	_reduceControls(controls) {
		const createdControls = {};
		Object.keys(controls).forEach((controlName) => {
			createdControls[controlName] = this._createControl(controls[controlName]);
		});
		return createdControls;
	}
	/** @internal */
	_createControl(controls) {
		if (controls instanceof FormControl) return controls;
		else if (controls instanceof AbstractControl) return controls;
		else if (Array.isArray(controls)) {
			const value = controls[0];
			const validator = controls.length > 1 ? controls[1] : null;
			const asyncValidator = controls.length > 2 ? controls[2] : null;
			return this.control(value, validator, asyncValidator);
		} else return this.control(controls);
	}
	static ɵfac = function FormBuilder_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FormBuilder)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: FormBuilder,
		factory: FormBuilder.ɵfac
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(FormBuilder, [{ type: Service }], null, null);
})();
/**
* @description
* `NonNullableFormBuilder` is similar to {@link FormBuilder}, but automatically constructed
* {@link FormControl} elements have `{nonNullable: true}` and are non-nullable.
*
* @see [FormBuilder and NonNullableFormBuilder](guide/forms/typed-forms#formbuilder-and-nonnullableformbuilder)
*
* @publicApi
*/
var NonNullableFormBuilder = class NonNullableFormBuilder {
	static ɵfac = function NonNullableFormBuilder_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || NonNullableFormBuilder)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: NonNullableFormBuilder,
		factory: () => (() => inject(FormBuilder).nonNullable)()
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(NonNullableFormBuilder, [{
		type: Service,
		args: [{ factory: () => inject(FormBuilder).nonNullable }]
	}], null, null);
})();
/**
* UntypedFormBuilder is the same as `FormBuilder`, but it provides untyped controls.
*/
var UntypedFormBuilder = class UntypedFormBuilder extends FormBuilder {
	group(controlsConfig, options = null) {
		return super.group(controlsConfig, options);
	}
	/**
	* Like `FormBuilder#control`, except the resulting control is untyped.
	*/
	control(formState, validatorOrOpts, asyncValidator) {
		return super.control(formState, validatorOrOpts, asyncValidator);
	}
	/**
	* Like `FormBuilder#array`, except the resulting array is untyped.
	*/
	array(controlsConfig, validatorOrOpts, asyncValidator) {
		return super.array(controlsConfig, validatorOrOpts, asyncValidator);
	}
	static ɵfac = function UntypedFormBuilder_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || UntypedFormBuilder)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: UntypedFormBuilder,
		factory: UntypedFormBuilder.ɵfac
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(UntypedFormBuilder, [{ type: Service }], null, null);
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* Exports the required providers and directives for template-driven forms,
* making them available for import by NgModules that import this module.
*
* @see [Forms Overview](guide/forms)
* @see [Template-driven Forms Guide](guide/forms)
*
* @publicApi
*/
var FormsModule = class FormsModule {
	/**
	* @description
	* Provides options for configuring the forms module.
	*
	* @param opts An object of configuration options
	* * `callSetDisabledState` Configures whether to `always` call `setDisabledState`, which is more
	* correct, or to only call it `whenDisabled`, which is the legacy behavior.
	*/
	static withConfig(opts) {
		return {
			ngModule: FormsModule,
			providers: [{
				provide: CALL_SET_DISABLED_STATE,
				useValue: opts.callSetDisabledState ?? setDisabledStateDefault
			}]
		};
	}
	static ɵfac = function FormsModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || FormsModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: FormsModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [ɵInternalFormsSharedModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(FormsModule, [{
		type: NgModule,
		args: [{
			declarations: TEMPLATE_DRIVEN_DIRECTIVES,
			exports: [ɵInternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(FormsModule, {
		declarations: [
			NgModel,
			NgModelGroup,
			NgForm
		],
		exports: [
			ɵInternalFormsSharedModule,
			NgModel,
			NgModelGroup,
			NgForm
		]
	});
})();
/**
* Exports the required infrastructure and directives for reactive forms,
* making them available for import by NgModules that import this module.
*
* @see [Forms Overview](guide/forms)
* @see [Reactive Forms Guide](guide/forms/reactive-forms)
*
* @publicApi
*/
var ReactiveFormsModule = class ReactiveFormsModule {
	/**
	* @description
	* Provides options for configuring the reactive forms module.
	*
	* @param opts An object of configuration options
	* * `warnOnNgModelWithFormControl` Configures when to emit a warning when an `ngModel`
	* binding is used with reactive form directives.
	* * `callSetDisabledState` Configures whether to `always` call `setDisabledState`, which is more
	* correct, or to only call it `whenDisabled`, which is the legacy behavior.
	*/
	static withConfig(opts) {
		return {
			ngModule: ReactiveFormsModule,
			providers: [{
				provide: NG_MODEL_WITH_FORM_CONTROL_WARNING,
				useValue: opts.warnOnNgModelWithFormControl ?? "always"
			}, {
				provide: CALL_SET_DISABLED_STATE,
				useValue: opts.callSetDisabledState ?? setDisabledStateDefault
			}]
		};
	}
	static ɵfac = function ReactiveFormsModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ReactiveFormsModule)();
	};
	static ɵmod = /*@__PURE__*/ ɵɵdefineNgModule({ type: ReactiveFormsModule });
	static ɵinj = /*@__PURE__*/ ɵɵdefineInjector({ imports: [ɵInternalFormsSharedModule] });
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && setClassMetadata(ReactiveFormsModule, [{
		type: NgModule,
		args: [{
			declarations: [REACTIVE_DRIVEN_DIRECTIVES],
			exports: [ɵInternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
		}]
	}], null, null);
})();
(function() {
	(typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(ReactiveFormsModule, {
		declarations: [
			FormControlDirective,
			FormGroupDirective,
			FormControlName,
			FormGroupName,
			FormArrayName
		],
		exports: [
			ɵInternalFormsSharedModule,
			FormControlDirective,
			FormGroupDirective,
			FormControlName,
			FormGroupName,
			FormArrayName
		]
	});
})();
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-forms/base-forms.component.ts
var BaseFormsComponent = class BaseFormsComponent {
	value = "默认值";
	checked = ["1"];
	constructor() {}
	ngOnInit() {}
	modelChange(e) {
		console.log("数据变更", e);
	}
	checkboxChange(e) {
		console.log(e);
	}
	static ɵfac = function BaseFormsComponent_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BaseFormsComponent)();
	};
	static ɵcmp = /*@__PURE__*/ ɵɵdefineComponent({
		type: BaseFormsComponent,
		selectors: [["app-base-forms"]],
		decls: 3,
		vars: 3,
		consts: [
			[
				"type",
				"text",
				3,
				"ngModelChange",
				"ngModel"
			],
			[
				3,
				"ngModelChange",
				"ngModel"
			],
			[3, "value"]
		],
		template: function BaseFormsComponent_Template(rf, ctx) {
			if (rf & 1) {
				ɵɵelementStart(0, "input", 0);
				ɵɵtwoWayListener("ngModelChange", function BaseFormsComponent_Template_input_ngModelChange_0_listener($event) {
					ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
					return $event;
				});
				ɵɵlistener("ngModelChange", function BaseFormsComponent_Template_input_ngModelChange_0_listener($event) {
					return ctx.modelChange($event);
				});
				ɵɵelementEnd();
				ɵɵcontrolCreate();
				ɵɵelementStart(1, "checkbox-group", 1);
				ɵɵtwoWayListener("ngModelChange", function BaseFormsComponent_Template_checkbox_group_ngModelChange_1_listener($event) {
					ɵɵtwoWayBindingSet(ctx.checked, $event) || (ctx.checked = $event);
					return $event;
				});
				ɵɵlistener("ngModelChange", function BaseFormsComponent_Template_checkbox_group_ngModelChange_1_listener($event) {
					return ctx.checkboxChange($event);
				});
				ɵɵelement(2, "checkbox", 2);
				ɵɵelementEnd();
				ɵɵcontrolCreate();
			}
			if (rf & 2) {
				ɵɵtwoWayProperty("ngModel", ctx.value);
				ɵɵcontrol();
				ɵɵadvance();
				ɵɵtwoWayProperty("ngModel", ctx.checked);
				ɵɵcontrol();
				ɵɵadvance();
				ɵɵproperty("value", "1");
				propertyChange(ɵɵgetCurrentView());
			}
		},
		dependencies: [
			CommonModule,
			FormsModule,
			DefaultValueAccessor,
			CheckboxControl,
			NgControlStatus,
			CheckBoxGroupValueAccessor,
			NgModel
		],
		encapsulation: 2
	});
};
(() => {
	(typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && ɵsetClassDebugInfo(BaseFormsComponent, {
		className: "BaseFormsComponent",
		filePath: "test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-forms/base-forms.component.ts",
		lineNumber: 14
	});
})();
//#endregion
//#region test/test-project-host-hello-world-app-1mhotsy46c1/src/pages/base-forms/base-forms.entry.ts
bootstrapPage(BaseFormsComponent);
//#endregion
