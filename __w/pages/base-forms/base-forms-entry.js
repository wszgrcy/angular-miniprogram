"use strict";
(wx["webpackChunktest"] = wx["webpackChunktest"] || []).push([["base-forms-entry"],{

/***/ 6765
/*!******************************************************!*\
  !*** ./src/pages/base-forms/base-forms.component.ts ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseFormsComponent: () => (/* binding */ BaseFormsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram */ 241);
/* harmony import */ var angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! angular-miniprogram/common */ 9859);
/* harmony import */ var angular_miniprogram_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! angular-miniprogram/forms */ 7645);






class BaseFormsComponent {
  value = '默认值';
  checked = ['1'];
  constructor() {}
  ngOnInit() {}
  modelChange(e) {
    console.log('数据变更', e);
  }
  checkboxChange(e) {
    console.log(e);
  }
  static ɵfac = function BaseFormsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BaseFormsComponent)();
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
    type: BaseFormsComponent,
    selectors: [["app-base-forms"]],
    decls: 3,
    vars: 3,
    consts: [["type", "text", 3, "ngModelChange", "ngModel"], [3, "ngModelChange", "ngModel"], [3, "value"]],
    template: function BaseFormsComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "input", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtwoWayListener"]("ngModelChange", function BaseFormsComponent_Template_input_ngModelChange_0_listener($event) {
          _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtwoWayBindingSet"](ctx.value, $event) || (ctx.value = $event);
          return $event;
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngModelChange", function BaseFormsComponent_Template_input_ngModelChange_0_listener($event) {
          return ctx.modelChange($event);
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵcontrolCreate"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "checkbox-group", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtwoWayListener"]("ngModelChange", function BaseFormsComponent_Template_checkbox_group_ngModelChange_1_listener($event) {
          _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtwoWayBindingSet"](ctx.checked, $event) || (ctx.checked = $event);
          return $event;
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngModelChange", function BaseFormsComponent_Template_checkbox_group_ngModelChange_1_listener($event) {
          return ctx.checkboxChange($event);
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "checkbox", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵcontrolCreate"]();
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtwoWayProperty"]("ngModel", ctx.value);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵcontrol"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtwoWayProperty"]("ngModel", ctx.checked);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵcontrol"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("value", "1");;angular_miniprogram__WEBPACK_IMPORTED_MODULE_1__.propertyChange(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]());
      }
    },
    dependencies: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule, angular_miniprogram_forms__WEBPACK_IMPORTED_MODULE_3__.FormsModule, angular_miniprogram_forms__WEBPACK_IMPORTED_MODULE_3__.DefaultValueAccessor, angular_miniprogram_forms__WEBPACK_IMPORTED_MODULE_3__.CheckboxControl, angular_miniprogram_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatus, angular_miniprogram_forms__WEBPACK_IMPORTED_MODULE_3__.CheckBoxGroupValueAccessor, angular_miniprogram_forms__WEBPACK_IMPORTED_MODULE_3__.NgModel],
    encapsulation: 2
  });
}

/***/ },

/***/ 1382
/*!**************************************************!*\
  !*** ./src/pages/base-forms/base-forms.entry.ts ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var angular_miniprogram__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular-miniprogram */ 1403);
/* harmony import */ var _base_forms_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base-forms.component */ 6765);


(0,angular_miniprogram__WEBPACK_IMPORTED_MODULE_0__.bootstrapPage)(_base_forms_component__WEBPACK_IMPORTED_MODULE_1__.BaseFormsComponent);

/***/ },

/***/ 5596
/*!***************************************************************!*\
  !*** ../../dist/fesm2022/angular-miniprogram-common-http.mjs ***!
  \***************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FetchBackend: () => (/* binding */ FetchBackend),
/* harmony export */   HTTP_INTERCEPTORS: () => (/* binding */ HTTP_INTERCEPTORS),
/* harmony export */   HTTP_TRANSFER_CACHE_ORIGIN_MAP: () => (/* binding */ HTTP_TRANSFER_CACHE_ORIGIN_MAP),
/* harmony export */   HttpBackend: () => (/* binding */ HttpBackend),
/* harmony export */   HttpClient: () => (/* binding */ HttpClient),
/* harmony export */   HttpClientJsonpModule: () => (/* binding */ HttpClientJsonpModule),
/* harmony export */   HttpClientModule: () => (/* binding */ HttpClientModule),
/* harmony export */   HttpClientXsrfModule: () => (/* binding */ HttpClientXsrfModule),
/* harmony export */   HttpContext: () => (/* binding */ HttpContext),
/* harmony export */   HttpContextToken: () => (/* binding */ HttpContextToken),
/* harmony export */   HttpErrorResponse: () => (/* binding */ HttpErrorResponse),
/* harmony export */   HttpEventType: () => (/* binding */ HttpEventType),
/* harmony export */   HttpFeatureKind: () => (/* binding */ HttpFeatureKind),
/* harmony export */   HttpHandler: () => (/* binding */ HttpHandler),
/* harmony export */   HttpHeaderResponse: () => (/* binding */ HttpHeaderResponse),
/* harmony export */   HttpHeaders: () => (/* binding */ HttpHeaders),
/* harmony export */   HttpParams: () => (/* binding */ HttpParams),
/* harmony export */   HttpRequest: () => (/* binding */ HttpRequest),
/* harmony export */   HttpResponse: () => (/* binding */ HttpResponse),
/* harmony export */   HttpResponseBase: () => (/* binding */ HttpResponseBase),
/* harmony export */   HttpStatusCode: () => (/* binding */ HttpStatusCode),
/* harmony export */   HttpUrlEncodingCodec: () => (/* binding */ HttpUrlEncodingCodec),
/* harmony export */   HttpXhrBackend: () => (/* binding */ HttpXhrBackend),
/* harmony export */   HttpXsrfTokenExtractor: () => (/* binding */ HttpXsrfTokenExtractor),
/* harmony export */   JsonpClientBackend: () => (/* binding */ JsonpClientBackend),
/* harmony export */   JsonpInterceptor: () => (/* binding */ JsonpInterceptor),
/* harmony export */   httpResource: () => (/* binding */ httpResource),
/* harmony export */   provideHttpClient: () => (/* binding */ provideHttpClient),
/* harmony export */   withFetch: () => (/* binding */ withFetch),
/* harmony export */   withInterceptors: () => (/* binding */ withInterceptors),
/* harmony export */   withInterceptorsFromDi: () => (/* binding */ withInterceptorsFromDi),
/* harmony export */   withJsonpSupport: () => (/* binding */ withJsonpSupport),
/* harmony export */   withNoXsrfProtection: () => (/* binding */ withNoXsrfProtection),
/* harmony export */   withRequestsMadeViaParent: () => (/* binding */ withRequestsMadeViaParent),
/* harmony export */   withXhr: () => (/* binding */ withXhr),
/* harmony export */   withXsrfConfiguration: () => (/* binding */ withXsrfConfiguration),
/* harmony export */   "ɵHTTP_FETCH_MAX_RESPONSE_SIZE": () => (/* binding */ HTTP_FETCH_MAX_RESPONSE_SIZE),
/* harmony export */   "ɵHTTP_ROOT_INTERCEPTOR_FNS": () => (/* binding */ HTTP_ROOT_INTERCEPTOR_FNS),
/* harmony export */   "ɵHttpInterceptingHandler": () => (/* binding */ HttpInterceptorHandler),
/* harmony export */   "ɵREQUESTS_CONTRIBUTE_TO_STABILITY": () => (/* binding */ REQUESTS_CONTRIBUTE_TO_STABILITY),
/* harmony export */   "ɵwithHttpTransferCache": () => (/* binding */ withHttpTransferCache)
/* harmony export */ });
/* harmony import */ var _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/@babel/runtime/helpers/asyncToGenerator.js */ 9436);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! angular-miniprogram/common */ 9631);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 6631);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ 5157);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 6753);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ 6057);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs/operators */ 2525);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs/operators */ 3233);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/operators */ 7634);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs */ 9904);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs */ 5187);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! rxjs */ 6734);
/* harmony import */ var angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! angular-miniprogram/common */ 9859);








/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Represents the header configuration options for an HTTP request.
 * Instances are immutable. Modifying methods return a cloned
 * instance with the change. The original object is never changed.
 *
 * @see [Setting request headers](guide/http/making-requests#setting-request-headers)
 *
 * @publicApi
 */
class HttpHeaders {
  /**
   * Internal map of lowercase header names to values.
   */
  headers;
  /**
   * Internal map of lowercased header names to the normalized
   * form of the name (the form seen first).
   */
  normalizedNames = new Map();
  /**
   * Complete the lazy initialization of this object (needed before reading).
   */
  lazyInit;
  /**
   * Queued updates to be materialized the next initialization.
   */
  lazyUpdate = null;
  /**  Constructs a new HTTP header object with the given values.*/
  constructor(headers) {
    if (!headers) {
      this.headers = new Map();
    } else if (typeof headers === 'string') {
      this.lazyInit = () => {
        this.headers = new Map();
        headers.split('\n').forEach(line => {
          const index = line.indexOf(':');
          if (index > 0) {
            const name = line.slice(0, index);
            const value = line.slice(index + 1).trim();
            this.addHeaderEntry(name, value);
          }
        });
      };
    } else if (typeof Headers !== 'undefined' && headers instanceof Headers) {
      this.headers = new Map();
      headers.forEach((value, name) => {
        this.addHeaderEntry(name, value);
      });
    } else {
      this.lazyInit = () => {
        if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
          assertValidHeaders(headers);
        }
        this.headers = new Map();
        Object.entries(headers).forEach(([name, values]) => {
          this.setHeaderEntries(name, values);
        });
      };
    }
  }
  /**
   * Checks for existence of a given header.
   *
   * @param name The header name to check for existence.
   *
   * @returns True if the header exists, false otherwise.
   */
  has(name) {
    this.init();
    return this.headers.has(name.toLowerCase());
  }
  /**
   * Retrieves the first value of a given header.
   *
   * @param name The header name.
   *
   * @returns The value string if the header exists, null otherwise
   */
  get(name) {
    this.init();
    const values = this.headers.get(name.toLowerCase());
    return values && values.length > 0 ? values[0] : null;
  }
  /**
   * Retrieves the names of the headers.
   *
   * @returns A list of header names.
   */
  keys() {
    this.init();
    return Array.from(this.normalizedNames.values());
  }
  /**
   * Retrieves a list of values for a given header.
   *
   * @param name The header name from which to retrieve values.
   *
   * @returns A string of values if the header exists, null otherwise.
   */
  getAll(name) {
    this.init();
    return this.headers.get(name.toLowerCase()) || null;
  }
  /**
   * Appends a new value to the existing set of values for a header
   * and returns them in a clone of the original instance.
   *
   * @param name The header name for which to append the values.
   * @param value The value to append.
   *
   * @returns A clone of the HTTP headers object with the value appended to the given header.
   */
  append(name, value) {
    return this.clone({
      name,
      value,
      op: 'a'
    });
  }
  /**
   * Sets or modifies a value for a given header in a clone of the original instance.
   * If the header already exists, its value is replaced with the given value
   * in the returned object.
   *
   * @param name The header name.
   * @param value The value or values to set or override for the given header.
   *
   * @returns A clone of the HTTP headers object with the newly set header value.
   */
  set(name, value) {
    return this.clone({
      name,
      value,
      op: 's'
    });
  }
  /**
   * Deletes values for a given header in a clone of the original instance.
   *
   * @param name The header name.
   * @param value The value or values to delete for the given header.
   *
   * @returns A clone of the HTTP headers object with the given value deleted.
   */
  delete(name, value) {
    return this.clone({
      name,
      value,
      op: 'd'
    });
  }
  maybeSetNormalizedName(name, lcName) {
    if (!this.normalizedNames.has(lcName)) {
      this.normalizedNames.set(lcName, name);
    }
  }
  init() {
    if (!!this.lazyInit) {
      if (this.lazyInit instanceof HttpHeaders) {
        this.copyFrom(this.lazyInit);
      } else {
        this.lazyInit();
      }
      this.lazyInit = null;
      if (!!this.lazyUpdate) {
        this.lazyUpdate.forEach(update => this.applyUpdate(update));
        this.lazyUpdate = null;
      }
    }
  }
  copyFrom(other) {
    other.init();
    for (const [key, values] of other.headers.entries()) {
      this.headers.set(key, values);
      this.normalizedNames.set(key, other.normalizedNames.get(key));
    }
  }
  clone(update) {
    const clone = new HttpHeaders();
    clone.lazyInit = !!this.lazyInit && this.lazyInit instanceof HttpHeaders ? this.lazyInit : this;
    clone.lazyUpdate = (this.lazyUpdate || []).concat([update]);
    return clone;
  }
  applyUpdate(update) {
    const key = update.name.toLowerCase();
    switch (update.op) {
      case 'a':
      case 's':
        let value = update.value;
        if (typeof value === 'string') {
          value = [value];
        }
        if (value.length === 0) {
          return;
        }
        this.maybeSetNormalizedName(update.name, key);
        const base = update.op === 'a' ? (this.headers.get(key) || []).slice() : [];
        base.push(...value);
        this.headers.set(key, base);
        break;
      case 'd':
        const toDelete = update.value;
        if (toDelete === undefined) {
          this.headers.delete(key);
          this.normalizedNames.delete(key);
        } else {
          const valuesToDelete = Array.isArray(toDelete) ? toDelete : [toDelete];
          let existing = this.headers.get(key);
          if (!existing) {
            return;
          }
          existing = existing.filter(value => valuesToDelete.indexOf(value) === -1);
          if (existing.length === 0) {
            this.headers.delete(key);
            this.normalizedNames.delete(key);
          } else {
            this.headers.set(key, existing);
          }
        }
        break;
    }
  }
  addHeaderEntry(name, value) {
    const key = name.toLowerCase();
    this.maybeSetNormalizedName(name, key);
    if (this.headers.has(key)) {
      this.headers.get(key).push(value);
    } else {
      this.headers.set(key, [value]);
    }
  }
  setHeaderEntries(name, values) {
    const headerValues = (Array.isArray(values) ? values : [values]).map(value => value.toString());
    const key = name.toLowerCase();
    this.headers.set(key, headerValues);
    this.maybeSetNormalizedName(name, key);
  }
  /**
   * @internal
   */
  forEach(fn) {
    this.init();
    Array.from(this.normalizedNames.keys()).forEach(key => fn(this.normalizedNames.get(key), this.headers.get(key)));
  }
}
/**
 * Verifies that the headers object has the right shape: the values
 * must be either strings, numbers or arrays. Throws an error if an invalid
 * header value is present.
 */
function assertValidHeaders(headers) {
  for (const [key, value] of Object.entries(headers)) {
    if (!(typeof value === 'string' || typeof value === 'number') && !Array.isArray(value)) {
      throw new Error(`Unexpected value of the \`${key}\` header provided. ` + `Expecting either a string, a number or an array, but got: \`${value}\`.`);
    }
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
 * A token used to manipulate and access values stored in `HttpContext`.
 *
 * @see [Request and response metadata](guide/http/interceptors#request-and-response-metadata)
 *
 * @publicApi
 */
class HttpContextToken {
  defaultValue;
  constructor(defaultValue) {
    this.defaultValue = defaultValue;
  }
}
/**
 * Http context stores arbitrary user defined values and ensures type safety without
 * actually knowing the types. It is backed by a `Map` and guarantees that keys do not clash.
 *
 * This context is mutable and is shared between cloned requests unless explicitly specified.
 *
 * @usageNotes
 *
 * ### Usage Example
 *
 * ```ts
 * // inside cache.interceptors.ts
 * export const IS_CACHE_ENABLED = new HttpContextToken<boolean>(() => false);
 *
 * export class CacheInterceptor implements HttpInterceptor {
 *
 *   intercept(req: HttpRequest<any>, delegate: HttpHandler): Observable<HttpEvent<any>> {
 *     if (req.context.get(IS_CACHE_ENABLED) === true) {
 *       return ...;
 *     }
 *     return delegate.handle(req);
 *   }
 * }
 *
 * // inside a service
 *
 * this.httpClient.get('/api/weather', {
 *   context: new HttpContext().set(IS_CACHE_ENABLED, true)
 * }).subscribe(...);
 * ```
 *
 * @see [Request and response metadata](guide/http/interceptors#request-and-response-metadata)
 *
 * @publicApi
 */
class HttpContext {
  map = new Map();
  /**
   * Store a value in the context. If a value is already present it will be overwritten.
   *
   * @param token The reference to an instance of `HttpContextToken`.
   * @param value The value to store.
   *
   * @returns A reference to itself for easy chaining.
   */
  set(token, value) {
    this.map.set(token, value);
    return this;
  }
  /**
   * Retrieve the value associated with the given token.
   *
   * @param token The reference to an instance of `HttpContextToken`.
   *
   * @returns The stored value or default if one is defined.
   */
  get(token) {
    if (!this.map.has(token)) {
      this.map.set(token, token.defaultValue());
    }
    return this.map.get(token);
  }
  /**
   * Delete the value associated with the given token.
   *
   * @param token The reference to an instance of `HttpContextToken`.
   *
   * @returns A reference to itself for easy chaining.
   */
  delete(token) {
    this.map.delete(token);
    return this;
  }
  /**
   * Checks for existence of a given token.
   *
   * @param token The reference to an instance of `HttpContextToken`.
   *
   * @returns True if the token exists, false otherwise.
   */
  has(token) {
    return this.map.has(token);
  }
  /**
   * @returns a list of tokens currently stored in the context.
   */
  keys() {
    return this.map.keys();
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
 * Provides encoding and decoding of URL parameter and query-string values.
 *
 * Serializes and parses URL parameter keys and values to encode and decode them.
 * If you pass URL query parameters without encoding,
 * the query parameters can be misinterpreted at the receiving end.
 *
 *
 * @publicApi
 */
class HttpUrlEncodingCodec {
  /**
   * Encodes a key name for a URL parameter or query-string.
   * @param key The key name.
   * @returns The encoded key name.
   */
  encodeKey(key) {
    return standardEncoding(key);
  }
  /**
   * Encodes the value of a URL parameter or query-string.
   * @param value The value.
   * @returns The encoded value.
   */
  encodeValue(value) {
    return standardEncoding(value);
  }
  /**
   * Decodes an encoded URL parameter or query-string key.
   * @param key The encoded key name.
   * @returns The decoded key name.
   */
  decodeKey(key) {
    return decodeURIComponent(key);
  }
  /**
   * Decodes an encoded URL parameter or query-string value.
   * @param value The encoded value.
   * @returns The decoded value.
   */
  decodeValue(value) {
    return decodeURIComponent(value);
  }
}
function paramParser(rawParams, codec) {
  const map = new Map();
  if (rawParams.length > 0) {
    // The `window.location.search` can be used while creating an instance of the `HttpParams` class
    // (e.g. `new HttpParams({ fromString: window.location.search })`). The `window.location.search`
    // may start with the `?` char, so we strip it if it's present.
    const params = rawParams.replace(/^\?/, '').split('&');
    params.forEach(param => {
      const eqIdx = param.indexOf('=');
      const [key, val] = eqIdx == -1 ? [codec.decodeKey(param), ''] : [codec.decodeKey(param.slice(0, eqIdx)), codec.decodeValue(param.slice(eqIdx + 1))];
      const list = map.get(key) || [];
      list.push(val);
      map.set(key, list);
    });
  }
  return map;
}
/**
 * Encode input string with standard encodeURIComponent and then un-encode specific characters.
 */
const STANDARD_ENCODING_REGEX = /%(\d[a-f0-9])/gi;
const STANDARD_ENCODING_REPLACEMENTS = {
  '40': '@',
  '3A': ':',
  '24': '$',
  '2C': ',',
  '3B': ';',
  '3D': '=',
  '3F': '?',
  '2F': '/'
};
function standardEncoding(v) {
  return encodeURIComponent(v).replace(STANDARD_ENCODING_REGEX, (s, t) => STANDARD_ENCODING_REPLACEMENTS[t] ?? s);
}
function valueToString(value) {
  return `${value}`;
}
/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable; all mutation operations return a new instance.
 *
 * @see [Setting URL parameters](guide/http/making-requests#setting-url-parameters)
 *
 * @publicApi
 */
class HttpParams {
  map;
  encoder;
  updates = null;
  cloneFrom = null;
  constructor(options = {}) {
    this.encoder = options.encoder || new HttpUrlEncodingCodec();
    if (options.fromString) {
      if (options.fromObject) {
        throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2805 /* RuntimeErrorCode.CANNOT_SPECIFY_BOTH_FROM_STRING_AND_FROM_OBJECT */, wx.__global.ngDevMode && 'Cannot specify both fromString and fromObject.');
      }
      this.map = paramParser(options.fromString, this.encoder);
    } else if (!!options.fromObject) {
      this.map = new Map();
      Object.keys(options.fromObject).forEach(key => {
        const value = options.fromObject[key];
        // convert the values to strings
        const values = Array.isArray(value) ? value.map(valueToString) : [valueToString(value)];
        this.map.set(key, values);
      });
    } else {
      this.map = null;
    }
  }
  /**
   * Reports whether the body includes one or more values for a given parameter.
   * @param param The parameter name.
   * @returns True if the parameter has one or more values,
   * false if it has no value or is not present.
   */
  has(param) {
    this.init();
    return this.map.has(param);
  }
  /**
   * Retrieves the first value for a parameter.
   * @param param The parameter name.
   * @returns The first value of the given parameter,
   * or `null` if the parameter is not present.
   */
  get(param) {
    this.init();
    const res = this.map.get(param);
    return !!res ? res[0] : null;
  }
  /**
   * Retrieves all values for a  parameter.
   * @param param The parameter name.
   * @returns All values in a string array,
   * or `null` if the parameter not present.
   */
  getAll(param) {
    this.init();
    return this.map.get(param) || null;
  }
  /**
   * Retrieves all the parameters for this body.
   * @returns The parameter names in a string array.
   */
  keys() {
    this.init();
    return Array.from(this.map.keys());
  }
  /**
   * Appends a new value to existing values for a parameter.
   * @param param The parameter name.
   * @param value The new value to add.
   * @return A new body with the appended value.
   */
  append(param, value) {
    return this.clone({
      param,
      value,
      op: 'a'
    });
  }
  /**
   * Constructs a new body with appended values for the given parameter name.
   * @param params parameters and values
   * @return A new body with the new value.
   */
  appendAll(params) {
    const updates = [];
    Object.keys(params).forEach(param => {
      const value = params[param];
      if (Array.isArray(value)) {
        value.forEach(_value => {
          updates.push({
            param,
            value: _value,
            op: 'a'
          });
        });
      } else {
        updates.push({
          param,
          value: value,
          op: 'a'
        });
      }
    });
    return this.clone(updates);
  }
  /**
   * Replaces the value for a parameter.
   * @param param The parameter name.
   * @param value The new value.
   * @return A new body with the new value.
   */
  set(param, value) {
    return this.clone({
      param,
      value,
      op: 's'
    });
  }
  /**
   * Removes a given value or all values from a parameter.
   * @param param The parameter name.
   * @param value The value to remove, if provided.
   * @return A new body with the given value removed, or with all values
   * removed if no value is specified.
   */
  delete(param, value) {
    return this.clone({
      param,
      value,
      op: 'd'
    });
  }
  /**
   * Serializes the body to an encoded string, where key-value pairs (separated by `=`) are
   * separated by `&`s.
   */
  toString() {
    this.init();
    return this.keys().map(key => {
      const eKey = this.encoder.encodeKey(key);
      // `a: ['1']` produces `'a=1'`
      // `b: []` produces `''`
      // `c: ['1', '2']` produces `'c=1&c=2'`
      return this.map.get(key).map(value => eKey + '=' + this.encoder.encodeValue(value)).join('&');
    })
    // filter out empty values because `b: []` produces `''`
    // which results in `a=1&&c=1&c=2` instead of `a=1&c=1&c=2` if we don't
    .filter(param => param !== '').join('&');
  }
  clone(update) {
    const clone = new HttpParams({
      encoder: this.encoder
    });
    clone.cloneFrom = this.cloneFrom || this;
    clone.updates = (this.updates || []).concat(update);
    return clone;
  }
  init() {
    if (this.map === null) {
      this.map = new Map();
    }
    if (this.cloneFrom !== null) {
      this.cloneFrom.init();
      for (const [key, values] of this.cloneFrom.map.entries()) {
        this.map.set(key, values);
      }
      this.updates.forEach(update => {
        switch (update.op) {
          case 'a':
          case 's':
            const base = update.op === 'a' ? (this.map.get(update.param) || []).slice() : [];
            base.push(valueToString(update.value));
            this.map.set(update.param, base);
            break;
          case 'd':
            if (update.value !== undefined) {
              const base = (this.map.get(update.param) || []).slice();
              const idx = base.indexOf(valueToString(update.value));
              if (idx !== -1) {
                base.splice(idx, 1);
              }
              if (base.length > 0) {
                this.map.set(update.param, base);
              } else {
                this.map.delete(update.param);
              }
            } else {
              this.map.delete(update.param);
              break;
            }
        }
      });
      this.cloneFrom = this.updates = null;
    }
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
 * Determine whether the given HTTP method may include a body.
 */
function mightHaveBody(method) {
  switch (method) {
    case 'DELETE':
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
    case 'JSONP':
      return false;
    default:
      return true;
  }
}
/**
 * Safely assert whether the given value is an ArrayBuffer.
 *
 * In some execution environments ArrayBuffer is not defined.
 */
function isArrayBuffer(value) {
  return typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer;
}
/**
 * Safely assert whether the given value is a Blob.
 *
 * In some execution environments Blob is not defined.
 */
function isBlob(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}
/**
 * Safely assert whether the given value is a FormData instance.
 *
 * In some execution environments FormData is not defined.
 */
function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}
/**
 * Safely assert whether the given value is a URLSearchParams instance.
 *
 * In some execution environments URLSearchParams is not defined.
 */
function isUrlSearchParams(value) {
  return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
}
/**
 * `Content-Type` is an HTTP header used to indicate the media type
 * (also known as MIME type) of the resource being sent to the client
 * or received from the server.
 */
const CONTENT_TYPE_HEADER = 'Content-Type';
/**
 * The `Accept` header is an HTTP request header that indicates the media types
 * (or content types) the client is willing to receive from the server.
 */
const ACCEPT_HEADER = 'Accept';
/**
 * `text/plain` is a content type used to indicate that the content being
 * sent is plain text with no special formatting or structured data
 * like HTML, XML, or JSON.
 */
const TEXT_CONTENT_TYPE = 'text/plain';
/**
 * `application/json` is a content type used to indicate that the content
 * being sent is in the JSON format.
 */
const JSON_CONTENT_TYPE = 'application/json';
/**
 * `application/json, text/plain, *\/*` is a content negotiation string often seen in the
 * Accept header of HTTP requests. It indicates the types of content the client is willing
 * to accept from the server, with a preference for `application/json` and `text/plain`,
 * but also accepting any other type (*\/*).
 */
const ACCEPT_HEADER_VALUE = `${JSON_CONTENT_TYPE}, ${TEXT_CONTENT_TYPE}, */*`;
/**
 * An outgoing HTTP request with an optional typed body.
 *
 * `HttpRequest` represents an outgoing request, including URL, method,
 * headers, body, and other request configuration options. Instances should be
 * assumed to be immutable. To modify a `HttpRequest`, the `clone`
 * method should be used.
 *
 * @publicApi
 */
class HttpRequest {
  url;
  /**
   * The request body, or `null` if one isn't set.
   *
   * Bodies are not enforced to be immutable, as they can include a reference to any
   * user-defined data type. However, interceptors should take care to preserve
   * idempotence by treating them as such.
   */
  body = null;
  /**
   * Outgoing headers for this request.
   */
  headers;
  /**
   * Shared and mutable context that can be used by interceptors
   */
  context;
  /**
   * Whether this request should be made in a way that exposes progress events.
   *
   * Progress events are expensive (change detection runs on each event) and so
   * they should only be requested if the consumer intends to monitor them.
   *
   * Note: The default `HttpBackend` based on fetch, does not support progress report for uploads.
   * Set the `HttpXhrBackend` with `withXhr()` if you need this feature.
   *
   * @deprecated 22.0 Use `reportUploadProgress` and `reportDownloadProgress` instead
   */
  reportProgress = false;
  /**
   * When set to `true` a request emited against the `FetchBackend` will throw an error.
   */
  reportUploadProgress = false;
  reportDownloadProgress = false;
  /**
   * Whether this request should be sent with outgoing credentials (cookies).
   */
  withCredentials = false;
  /**
   *  The credentials mode of the request, which determines how cookies and HTTP authentication are handled.
   *  This can affect whether cookies are sent with the request, and how authentication is handled.
   */
  credentials;
  /**
   * When using the fetch implementation and set to `true`, the browser will not abort the associated request if the page that initiated it is unloaded before the request is complete.
   */
  keepalive = false;
  /**
   * Controls how the request will interact with the browser's HTTP cache.
   * This affects whether a response is retrieved from the cache, how it is stored, or if it bypasses the cache altogether.
   */
  cache;
  /**
   * Indicates the relative priority of the request. This may be used by the browser to decide the order in which requests are dispatched and resources fetched.
   */
  priority;
  /**
   * The mode of the request, which determines how the request will interact with the browser's security model.
   * This can affect things like CORS (Cross-Origin Resource Sharing) and same-origin policies.
   */
  mode;
  /**
   * The redirect mode of the request, which determines how redirects are handled.
   * This can affect whether the request follows redirects automatically, or if it fails when a redirect occurs.
   */
  redirect;
  /**
   * The referrer of the request, which can be used to indicate the origin of the request.
   * This is useful for security and analytics purposes.
   * Value is a same-origin URL, "about:client", or the empty string, to set request's referrer.
   */
  referrer;
  /**
   * The integrity metadata of the request, which can be used to ensure the request is made with the expected content.
   * A cryptographic hash of the resource to be fetched by request
   */
  integrity;
  /**
   * The referrer policy of the request, which can be used to specify the referrer information to be included with the request.
   * This can affect the amount of referrer information sent with the request, and can be used to enhance privacy and security.
   */
  referrerPolicy;
  /**
   * The expected response type of the server.
   *
   * This is used to parse the response appropriately before returning it to
   * the requestee.
   */
  responseType = 'json';
  /**
   * The outgoing HTTP request method.
   */
  method;
  /**
   * Outgoing URL parameters.
   *
   * To pass a string representation of HTTP parameters in the URL-query-string format,
   * the `HttpParamsOptions`' `fromString` may be used. For example:
   *
   * ```ts
   * new HttpParams({fromString: 'angular=awesome'})
   * ```
   */
  params;
  /**
   * The outgoing URL with all URL parameters set.
   */
  urlWithParams;
  /**
   * The HttpTransferCache option for the request
   */
  transferCache;
  /**
   * The timeout for the backend HTTP request in ms.
   */
  timeout;
  constructor(method, url, third, fourth) {
    this.url = url;
    this.method = method.toUpperCase();
    // Next, need to figure out which argument holds the HttpRequestOptions
    // options, if any.
    let options;
    // Check whether a body argument is expected. The only valid way to omit
    // the body argument is to use a known no-body method like GET.
    if (mightHaveBody(this.method) || !!fourth) {
      // Body is the third argument, options are the fourth.
      this.body = third !== undefined ? third : null;
      options = fourth;
    } else {
      // No body required, options are the third argument. The body stays null.
      options = third;
    }
    // If options have been passed, interpret them.
    if (options) {
      // Normalize progress and credential flags.
      this.reportProgress = !!options.reportProgress;
      this.reportUploadProgress = !!options.reportUploadProgress;
      this.reportDownloadProgress = !!options.reportDownloadProgress;
      this.withCredentials = !!options.withCredentials;
      this.keepalive = !!options.keepalive;
      // Override default response type of 'json' if one is provided.
      if (!!options.responseType) {
        this.responseType = options.responseType;
      }
      // Override headers if they're provided.
      if (options.headers) {
        this.headers = options.headers;
      }
      if (options.context) {
        this.context = options.context;
      }
      if (options.params) {
        this.params = options.params;
      }
      if (options.priority) {
        this.priority = options.priority;
      }
      if (options.cache) {
        this.cache = options.cache;
      }
      if (options.credentials) {
        this.credentials = options.credentials;
      }
      if (typeof options.timeout === 'number') {
        // XHR will ignore any value below 1. AbortSignals only accept unsigned integers.
        if (options.timeout < 1 || !Number.isInteger(options.timeout)) {
          throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2822 /* RuntimeErrorCode.INVALID_TIMEOUT_VALUE */, wx.__global.ngDevMode ? '`timeout` must be a positive integer value' : '');
        }
        this.timeout = options.timeout;
      }
      if (options.mode) {
        this.mode = options.mode;
      }
      if (options.redirect) {
        this.redirect = options.redirect;
      }
      if (options.integrity) {
        this.integrity = options.integrity;
      }
      if (options.referrer !== undefined) {
        this.referrer = options.referrer;
      }
      if (options.referrerPolicy) {
        this.referrerPolicy = options.referrerPolicy;
      }
      // We do want to assign transferCache even if it's falsy (false is valid value)
      this.transferCache = options.transferCache;
    }
    // If no headers have been passed in, construct a new HttpHeaders instance.
    this.headers ??= new HttpHeaders();
    // If no context have been passed in, construct a new HttpContext instance.
    this.context ??= new HttpContext();
    // If no parameters have been passed in, construct a new HttpUrlEncodedParams instance.
    if (!this.params) {
      this.params = new HttpParams();
      this.urlWithParams = url;
    } else {
      // Encode the parameters to a string in preparation for inclusion in the URL.
      const params = this.params.toString();
      if (params.length === 0) {
        // No parameters, the visible URL is just the URL given at creation time.
        this.urlWithParams = url;
      } else {
        // Strip the fragment (e.g. #bypass) from the URL before checking for existing query parameters.
        // This ensures that new query parameters are inserted before the fragment, preventing
        // situations where parameters are mistakenly appended after the fragment and thus
        // only exposed to the frontend, which could bypass security checks.
        let urlWithoutFragment = url;
        let fragment = '';
        const hashIdx = url.indexOf('#');
        if (hashIdx !== -1) {
          fragment = url.substring(hashIdx);
          urlWithoutFragment = url.substring(0, hashIdx);
        }
        // Does the URL already have query parameters? Look for '?'.
        const qIdx = urlWithoutFragment.indexOf('?');
        // There are 3 cases to handle:
        // 1) No existing parameters -> append '?' followed by params.
        // 2) '?' exists and is followed by existing query string ->
        //    append '&' followed by params.
        // 3) '?' exists at the end of the url -> append params directly.
        // This basically amounts to determining the character, if any, with
        // which to join the URL and parameters.
        const sep = qIdx === -1 ? '?' : qIdx < urlWithoutFragment.length - 1 ? '&' : '';
        this.urlWithParams = urlWithoutFragment + sep + params + fragment;
      }
    }
  }
  /**
   * Transform the free-form body into a serialized format suitable for
   * transmission to the server.
   */
  serializeBody() {
    // If no body is present, no need to serialize it.
    if (this.body === null) {
      return null;
    }
    // Check whether the body is already in a serialized form. If so,
    // it can just be returned directly.
    if (typeof this.body === 'string' || isArrayBuffer(this.body) || isBlob(this.body) || isFormData(this.body) || isUrlSearchParams(this.body)) {
      return this.body;
    }
    // Check whether the body is an instance of HttpUrlEncodedParams.
    if (this.body instanceof HttpParams) {
      return this.body.toString();
    }
    // Check whether the body is an object or array, and serialize with JSON if so.
    if (typeof this.body === 'object' || typeof this.body === 'boolean' || Array.isArray(this.body)) {
      return JSON.stringify(this.body);
    }
    // Fall back on toString() for everything else.
    return this.body.toString();
  }
  /**
   * Examine the body and attempt to infer an appropriate MIME type
   * for it.
   *
   * If no such type can be inferred, this method will return `null`.
   */
  detectContentTypeHeader() {
    // An empty body has no content type.
    if (this.body === null) {
      return null;
    }
    // FormData bodies rely on the browser's content type assignment.
    if (isFormData(this.body)) {
      return null;
    }
    // Blobs usually have their own content type. If it doesn't, then
    // no type can be inferred.
    if (isBlob(this.body)) {
      return this.body.type || null;
    }
    // Array buffers have unknown contents and thus no type can be inferred.
    if (isArrayBuffer(this.body)) {
      return null;
    }
    // Technically, strings could be a form of JSON data, but it's safe enough
    // to assume they're plain strings.
    if (typeof this.body === 'string') {
      return TEXT_CONTENT_TYPE;
    }
    // `HttpUrlEncodedParams` has its own content-type.
    if (this.body instanceof HttpParams) {
      return 'application/x-www-form-urlencoded;charset=UTF-8';
    }
    // Arrays, objects, boolean and numbers will be encoded as JSON.
    if (typeof this.body === 'object' || typeof this.body === 'number' || typeof this.body === 'boolean') {
      return JSON_CONTENT_TYPE;
    }
    // No type could be inferred.
    return null;
  }
  clone(update = {}) {
    // For method, url, and responseType, take the current value unless
    // it is overridden in the update hash.
    const method = update.method || this.method;
    const url = update.url || this.url;
    const responseType = update.responseType || this.responseType;
    const keepalive = update.keepalive ?? this.keepalive;
    const priority = update.priority || this.priority;
    const cache = update.cache || this.cache;
    const mode = update.mode || this.mode;
    const redirect = update.redirect || this.redirect;
    const credentials = update.credentials || this.credentials;
    const referrer = update.referrer ?? this.referrer;
    const integrity = update.integrity || this.integrity;
    const referrerPolicy = update.referrerPolicy || this.referrerPolicy;
    // Carefully handle the transferCache to differentiate between
    // `false` and `undefined` in the update args.
    const transferCache = update.transferCache ?? this.transferCache;
    const timeout = update.timeout ?? this.timeout;
    // The body is somewhat special - a `null` value in update.body means
    // whatever current body is present is being overridden with an empty
    // body, whereas an `undefined` value in update.body implies no
    // override.
    const body = update.body !== undefined ? update.body : this.body;
    // Carefully handle the boolean options to differentiate between
    // `false` and `undefined` in the update args.
    const withCredentials = update.withCredentials ?? this.withCredentials;
    const reportProgress = update.reportProgress ?? this.reportProgress;
    const reportUploadProgress = update.reportUploadProgress ?? this.reportUploadProgress;
    const reportDownloadProgress = update.reportDownloadProgress ?? this.reportDownloadProgress;
    // Headers and params may be appended to if `setHeaders` or
    // `setParams` are used.
    let headers = update.headers || this.headers;
    let params = update.params || this.params;
    // Pass on context if needed
    const context = update.context ?? this.context;
    // Check whether the caller has asked to add headers.
    if (update.setHeaders !== undefined) {
      // Set every requested header.
      headers = Object.keys(update.setHeaders).reduce((headers, name) => headers.set(name, update.setHeaders[name]), headers);
    }
    // Check whether the caller has asked to set params.
    if (update.setParams) {
      // Set every requested param.
      params = Object.keys(update.setParams).reduce((params, param) => params.set(param, update.setParams[param]), params);
    }
    // Finally, construct the new HttpRequest using the pieces from above.
    return new HttpRequest(method, url, body, {
      params,
      headers,
      context,
      reportProgress,
      reportUploadProgress,
      reportDownloadProgress,
      responseType,
      withCredentials,
      transferCache,
      keepalive,
      cache,
      priority,
      timeout,
      mode,
      redirect,
      credentials,
      referrer,
      integrity,
      referrerPolicy
    });
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
 * Type enumeration for the different kinds of `HttpEvent`.
 *
 * @see [Receiving raw progress event](guide/http/making-requests#receiving-raw-progress-events)
 *
 * @publicApi
 */
var HttpEventType;
(function (HttpEventType) {
  /**
   * The request was sent out over the wire.
   */
  HttpEventType[HttpEventType["Sent"] = 0] = "Sent";
  /**
   * An upload progress event was received.
   *
   * Note: The `FetchBackend` doesn't support progress report on uploads.
   */
  HttpEventType[HttpEventType["UploadProgress"] = 1] = "UploadProgress";
  /**
   * The response status code and headers were received.
   */
  HttpEventType[HttpEventType["ResponseHeader"] = 2] = "ResponseHeader";
  /**
   * A download progress event was received.
   */
  HttpEventType[HttpEventType["DownloadProgress"] = 3] = "DownloadProgress";
  /**
   * The full response including the body was received.
   */
  HttpEventType[HttpEventType["Response"] = 4] = "Response";
  /**
   * A custom event from an interceptor or a backend.
   */
  HttpEventType[HttpEventType["User"] = 5] = "User";
})(HttpEventType || (HttpEventType = {}));
/**
 * Base class for both `HttpResponse` and `HttpHeaderResponse`.
 *
 * @publicApi
 */
class HttpResponseBase {
  /**
   * All response headers.
   */
  headers;
  /**
   * Response status code.
   */
  status;
  /**
   * Textual description of response status code, defaults to OK.
   *
   * Do not depend on this.
   *
   * @deprecated With HTTP/2 and later versions, this will incorrectly remain set to 'OK' even when the status code of a response is not 200.
   */
  statusText;
  /**
   * URL of the resource retrieved, or null if not available.
   */
  url;
  /**
   * Whether the status code falls in the 2xx range.
   */
  ok;
  /**
   * Type of the response, narrowed to either the full response or the header.
   */
  type;
  /**
   * Indicates whether the HTTP response was redirected during the request.
   * This property is only available when using the Fetch API using `withFetch()`
   * When using the default XHR Request this property will be `undefined`
   */
  redirected;
  /**
   * Indicates the type of the HTTP response, based on how the request was made and how the browser handles the response.
   *
   * This corresponds to the `type` property of the Fetch API's `Response` object, which can indicate values such as:
   * - `'basic'`: A same-origin response, allowing full access to the body and headers.
   * - `'cors'`: A cross-origin response with CORS enabled, exposing only safe response headers.
   * - `'opaque'`: A cross-origin response made with `no-cors`, where the response body and headers are inaccessible.
   * - `'opaqueredirect'`: A response resulting from a redirect followed in `no-cors` mode.
   * - `'error'`: A response representing a network error or similar failure.
   *
   * This property is only available when using the Fetch-based backend (via `withFetch()`).
   * When using Angular's (XHR) backend, this value will be `undefined`.
   */
  responseType;
  /**
   * Super-constructor for all responses.
   *
   * The single parameter accepted is an initialization hash. Any properties
   * of the response passed there will override the default values.
   */
  constructor(init, defaultStatus = 200, defaultStatusText = 'OK') {
    // If the hash has values passed, use them to initialize the response.
    // Otherwise use the default values.
    this.headers = init.headers || new HttpHeaders();
    this.status = init.status !== undefined ? init.status : defaultStatus;
    this.statusText = init.statusText || defaultStatusText;
    this.url = init.url || null;
    this.redirected = init.redirected;
    this.responseType = init.responseType;
    // Cache the ok value to avoid defining a getter.
    this.ok = this.status >= 200 && this.status < 300;
  }
}
/**
 * A partial HTTP response which only includes the status and header data,
 * but no response body.
 *
 * `HttpHeaderResponse` is a `HttpEvent` available on the response
 * event stream, only when progress events are requested.
 *
 * @see [Receiving raw progress events](guide/http/making-requests#receiving-raw-progress-events)
 *
 * @publicApi
 */
class HttpHeaderResponse extends HttpResponseBase {
  /**
   * Create a new `HttpHeaderResponse` with the given parameters.
   */
  constructor(init = {}) {
    super(init);
  }
  type = HttpEventType.ResponseHeader;
  /**
   * Copy this `HttpHeaderResponse`, overriding its contents with the
   * given parameter hash.
   */
  clone(update = {}) {
    // Perform a straightforward initialization of the new HttpHeaderResponse,
    // overriding the current parameters with new ones if given.
    return new HttpHeaderResponse({
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined
    });
  }
}
/**
 * A full HTTP response, including a typed response body (which may be `null`
 * if one was not returned).
 *
 * `HttpResponse` is a `HttpEvent` available on the response event
 * stream.
 *
 * @see [Interacting with the server response events](guide/http/making-requests#interacting-with-the-server-response-events)
 *
 * @publicApi
 */
class HttpResponse extends HttpResponseBase {
  /**
   * The response body, or `null` if one was not returned.
   */
  body;
  /**
   * Construct a new `HttpResponse`.
   */
  constructor(init = {}) {
    super(init);
    this.body = init.body !== undefined ? init.body : null;
  }
  type = HttpEventType.Response;
  clone(update = {}) {
    return new HttpResponse({
      body: update.body !== undefined ? update.body : this.body,
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined,
      redirected: update.redirected ?? this.redirected,
      responseType: update.responseType ?? this.responseType
    });
  }
}
/**
 * A response that represents an error or failure, either from a
 * non-successful HTTP status, an error while executing the request,
 * or some other failure which occurred during the parsing of the response.
 *
 * Any error returned on the `Observable` response stream will be
 * wrapped in an `HttpErrorResponse` to provide additional context about
 * the state of the HTTP layer when the error occurred. The error property
 * will contain either a wrapped Error object or the error response returned
 * from the server.
 *
 * @see [Handling request failure](guide/http/making-requests#handling-request-failure)
 *
 * @publicApi
 */
class HttpErrorResponse extends HttpResponseBase {
  name = 'HttpErrorResponse';
  message;
  error;
  /**
   * Errors are never okay, even when the status code is in the 2xx success range.
   */
  ok = false;
  constructor(init) {
    // Initialize with a default status of 0 / Unknown Error.
    super(init, 0, 'Unknown Error');
    // If the response was successful, then this was a parse error. Otherwise, it was
    // a protocol-level failure of some sort. Either the request failed in transit
    // or the server returned an unsuccessful status code.
    if (this.status >= 200 && this.status < 300) {
      this.message = `Http failure during parsing for ${init.url || '(unknown url)'}`;
    } else {
      // TODO: Cleanup G3 to update the tests that rely on having the status text in the Error message.
      this.message = `Http failure response for ${init.url || '(unknown url)'}: ${init.status} ${init.statusText}`;
    }
    this.error = init.error || null;
  }
}
/**
 * We use these constant to prevent pulling the whole HttpStatusCode enum
 * Those are the only ones referenced directly by the framework
 */
const HTTP_STATUS_CODE_OK = 200;
const HTTP_STATUS_CODE_NO_CONTENT = 204;
/**
 * Http status codes.
 * As per https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
 * @publicApi
 */
var HttpStatusCode;
(function (HttpStatusCode) {
  HttpStatusCode[HttpStatusCode["Continue"] = 100] = "Continue";
  HttpStatusCode[HttpStatusCode["SwitchingProtocols"] = 101] = "SwitchingProtocols";
  HttpStatusCode[HttpStatusCode["Processing"] = 102] = "Processing";
  HttpStatusCode[HttpStatusCode["EarlyHints"] = 103] = "EarlyHints";
  HttpStatusCode[HttpStatusCode["Ok"] = 200] = "Ok";
  HttpStatusCode[HttpStatusCode["Created"] = 201] = "Created";
  HttpStatusCode[HttpStatusCode["Accepted"] = 202] = "Accepted";
  HttpStatusCode[HttpStatusCode["NonAuthoritativeInformation"] = 203] = "NonAuthoritativeInformation";
  HttpStatusCode[HttpStatusCode["NoContent"] = 204] = "NoContent";
  HttpStatusCode[HttpStatusCode["ResetContent"] = 205] = "ResetContent";
  HttpStatusCode[HttpStatusCode["PartialContent"] = 206] = "PartialContent";
  HttpStatusCode[HttpStatusCode["MultiStatus"] = 207] = "MultiStatus";
  HttpStatusCode[HttpStatusCode["AlreadyReported"] = 208] = "AlreadyReported";
  HttpStatusCode[HttpStatusCode["ImUsed"] = 226] = "ImUsed";
  HttpStatusCode[HttpStatusCode["MultipleChoices"] = 300] = "MultipleChoices";
  HttpStatusCode[HttpStatusCode["MovedPermanently"] = 301] = "MovedPermanently";
  HttpStatusCode[HttpStatusCode["Found"] = 302] = "Found";
  HttpStatusCode[HttpStatusCode["SeeOther"] = 303] = "SeeOther";
  HttpStatusCode[HttpStatusCode["NotModified"] = 304] = "NotModified";
  HttpStatusCode[HttpStatusCode["UseProxy"] = 305] = "UseProxy";
  HttpStatusCode[HttpStatusCode["Unused"] = 306] = "Unused";
  HttpStatusCode[HttpStatusCode["TemporaryRedirect"] = 307] = "TemporaryRedirect";
  HttpStatusCode[HttpStatusCode["PermanentRedirect"] = 308] = "PermanentRedirect";
  HttpStatusCode[HttpStatusCode["BadRequest"] = 400] = "BadRequest";
  HttpStatusCode[HttpStatusCode["Unauthorized"] = 401] = "Unauthorized";
  HttpStatusCode[HttpStatusCode["PaymentRequired"] = 402] = "PaymentRequired";
  HttpStatusCode[HttpStatusCode["Forbidden"] = 403] = "Forbidden";
  HttpStatusCode[HttpStatusCode["NotFound"] = 404] = "NotFound";
  HttpStatusCode[HttpStatusCode["MethodNotAllowed"] = 405] = "MethodNotAllowed";
  HttpStatusCode[HttpStatusCode["NotAcceptable"] = 406] = "NotAcceptable";
  HttpStatusCode[HttpStatusCode["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
  HttpStatusCode[HttpStatusCode["RequestTimeout"] = 408] = "RequestTimeout";
  HttpStatusCode[HttpStatusCode["Conflict"] = 409] = "Conflict";
  HttpStatusCode[HttpStatusCode["Gone"] = 410] = "Gone";
  HttpStatusCode[HttpStatusCode["LengthRequired"] = 411] = "LengthRequired";
  HttpStatusCode[HttpStatusCode["PreconditionFailed"] = 412] = "PreconditionFailed";
  HttpStatusCode[HttpStatusCode["PayloadTooLarge"] = 413] = "PayloadTooLarge";
  HttpStatusCode[HttpStatusCode["UriTooLong"] = 414] = "UriTooLong";
  HttpStatusCode[HttpStatusCode["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
  HttpStatusCode[HttpStatusCode["RangeNotSatisfiable"] = 416] = "RangeNotSatisfiable";
  HttpStatusCode[HttpStatusCode["ExpectationFailed"] = 417] = "ExpectationFailed";
  HttpStatusCode[HttpStatusCode["ImATeapot"] = 418] = "ImATeapot";
  HttpStatusCode[HttpStatusCode["MisdirectedRequest"] = 421] = "MisdirectedRequest";
  HttpStatusCode[HttpStatusCode["UnprocessableEntity"] = 422] = "UnprocessableEntity";
  HttpStatusCode[HttpStatusCode["Locked"] = 423] = "Locked";
  HttpStatusCode[HttpStatusCode["FailedDependency"] = 424] = "FailedDependency";
  HttpStatusCode[HttpStatusCode["TooEarly"] = 425] = "TooEarly";
  HttpStatusCode[HttpStatusCode["UpgradeRequired"] = 426] = "UpgradeRequired";
  HttpStatusCode[HttpStatusCode["PreconditionRequired"] = 428] = "PreconditionRequired";
  HttpStatusCode[HttpStatusCode["TooManyRequests"] = 429] = "TooManyRequests";
  HttpStatusCode[HttpStatusCode["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
  HttpStatusCode[HttpStatusCode["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
  HttpStatusCode[HttpStatusCode["InternalServerError"] = 500] = "InternalServerError";
  HttpStatusCode[HttpStatusCode["NotImplemented"] = 501] = "NotImplemented";
  HttpStatusCode[HttpStatusCode["BadGateway"] = 502] = "BadGateway";
  HttpStatusCode[HttpStatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
  HttpStatusCode[HttpStatusCode["GatewayTimeout"] = 504] = "GatewayTimeout";
  HttpStatusCode[HttpStatusCode["HttpVersionNotSupported"] = 505] = "HttpVersionNotSupported";
  HttpStatusCode[HttpStatusCode["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
  HttpStatusCode[HttpStatusCode["InsufficientStorage"] = 507] = "InsufficientStorage";
  HttpStatusCode[HttpStatusCode["LoopDetected"] = 508] = "LoopDetected";
  HttpStatusCode[HttpStatusCode["NotExtended"] = 510] = "NotExtended";
  HttpStatusCode[HttpStatusCode["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(HttpStatusCode || (HttpStatusCode = {}));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const XSSI_PREFIX$1 = /^\)\]\}',?\n/;
let uploadProgressWarningLogged = false;
// 1 MB by default
const DEFAULT_SSR_MAX_RESPONSE_BODY_SIZE = 1024 * 1024;
/**
 * Configures the maximum buffered response body size for `FetchBackend`.
 *
 * The limit is only enabled by default in SSR mode to prevent unbounded buffering
 * when a response stream never terminates.
 *
 * Set to `null` to disable the limit.
 */
const HTTP_FETCH_MAX_RESPONSE_SIZE = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'HTTP_FETCH_MAX_RESPONSE_SIZE' : '', {
  factory: () => typeof ngServerMode !== 'undefined' && ngServerMode ? DEFAULT_SSR_MAX_RESPONSE_BODY_SIZE : null
});
/**
 * Uses `fetch` to send requests to a backend server.
 *
 * This `FetchBackend` requires the support of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) which is available on all
 * supported browsers and on Node.js v18 or later.
 *
 * @see {@link HttpHandler}
 *
 * @publicApi
 */
class FetchBackend {
  // We use an arrow function to always reference the current global implementation of `fetch`.
  // This is helpful for cases when the global `fetch` implementation is modified by external code,
  // see https://github.com/angular/angular/issues/57527.
  fetchImpl = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(FetchFactory, {
    optional: true
  })?.fetch ?? ((...args) => wx.__window.fetch(...args));
  ngZone = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.NgZone);
  destroyRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.DestroyRef);
  maxResponseSize = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(HTTP_FETCH_MAX_RESPONSE_SIZE);
  handle(request) {
    return new rxjs__WEBPACK_IMPORTED_MODULE_10__.Observable(observer => {
      const aborter = new AbortController();
      let done = false;
      const wrappedObserver = {
        next: val => {
          if (val.type === HttpEventType.Response) {
            done = true;
          }
          observer.next(val);
        },
        error: err => {
          done = true;
          observer.error(err);
        },
        complete: () => {
          done = true;
          observer.complete();
        }
      };
      this.doRequest(request, aborter.signal, wrappedObserver).then(noop, error => wrappedObserver.error(new HttpErrorResponse({
        error
      })));
      let timeoutId;
      if (request.timeout) {
        // TODO: Replace with AbortSignal.any([aborter.signal, AbortSignal.timeout(request.timeout)])
        // when AbortSignal.any support is Baseline widely available (NET nov. 2026)
        timeoutId = this.ngZone.runOutsideAngular(() => wx.__window.setTimeout(() => {
          if (!aborter.signal.aborted) {
            aborter.abort(new DOMException('signal timed out', 'TimeoutError'));
          }
        }, request.timeout));
      }
      return () => {
        if (timeoutId !== undefined) {
          wx.__window.clearTimeout(timeoutId);
        }
        if (!done && !aborter.signal.aborted) {
          aborter.abort();
        }
      };
    });
  }
  doRequest(request, signal, observer) {
    var _this = this;
    return _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
      const init = _this.createRequestInit(request);
      let response;
      try {
        // Run fetch outside of Angular zone.
        // This is due to Node.js fetch implementation (Undici) which uses a number of setTimeouts to check if
        // the response should eventually timeout which causes extra CD cycles every 500ms
        const fetchPromise = _this.ngZone.runOutsideAngular(() => _this.fetchImpl(request.urlWithParams, {
          signal,
          ...init
        }));
        // Make sure Zone.js doesn't trigger false-positive unhandled promise
        // error in case the Promise is rejected synchronously. See function
        // description for additional information.
        silenceSuperfluousUnhandledPromiseRejection(fetchPromise);
        // Send the `Sent` event before awaiting the response.
        observer.next({
          type: HttpEventType.Sent
        });
        response = yield fetchPromise;
      } catch (error) {
        observer.error(new HttpErrorResponse({
          error,
          status: error.status ?? 0,
          statusText: error.statusText,
          url: request.urlWithParams,
          headers: error.headers
        }));
        return;
      }
      const headers = new HttpHeaders(response.headers);
      const statusText = response.statusText;
      const url = response.url || request.urlWithParams;
      let status = response.status;
      let body = null;
      const reportDownloadProgress = request.reportProgress || request.reportDownloadProgress;
      if (reportDownloadProgress) {
        observer.next(new HttpHeaderResponse({
          headers,
          status,
          statusText,
          url
        }));
      }
      if (response.body) {
        const contentType = response.headers.get(CONTENT_TYPE_HEADER) ?? '';
        // Read Progress
        const contentLength = response.headers.get('content-length');
        const contentLengthValue = contentLength !== null ? Number(contentLength) : NaN;
        if (_this.maxResponseSize !== null && Number.isFinite(contentLengthValue) && contentLengthValue > _this.maxResponseSize) {
          yield response.body.cancel();
          throwBodyTooLargeError(_this.maxResponseSize);
        }
        const chunks = [];
        const reader = response.body.getReader();
        let receivedLength = 0;
        let decoder;
        let partialText;
        // 已迁移 zoneless：不存在 Zone，进度回调直接执行
        const reqZone = undefined;
        let canceled = false;
        // Perform response processing outside of Angular zone to
        // ensure no excessive change detection runs are executed
        // Here calling the async ReadableStreamDefaultReader.read() is responsible for triggering CD
        yield _this.ngZone.runOutsideAngular(/*#__PURE__*/_workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
          while (true) {
            // Prevent reading chunks if the app is destroyed. Otherwise, we risk doing
            // unnecessary work or triggering side effects after teardown.
            // This may happen if the app was explicitly destroyed before
            // the response returned entirely.
            if (_this.destroyRef.destroyed) {
              // Streams left in a pending state (due to `break` without cancel) may
              // continue consuming or holding onto data behind the scenes.
              // Calling `reader.cancel()` allows the browser or the underlying
              // system to release any network or memory resources associated with the stream.
              yield reader.cancel();
              canceled = true;
              break;
            }
            const {
              done,
              value
            } = yield reader.read();
            if (done) {
              break;
            }
            chunks.push(value);
            receivedLength += value.length;
            if (_this.maxResponseSize !== null && receivedLength > _this.maxResponseSize) {
              yield reader.cancel();
              throwBodyTooLargeError(_this.maxResponseSize);
            }
            if (reportDownloadProgress) {
              partialText = request.responseType === 'text' ? (partialText ?? '') + (decoder ??= getTextDecoder(contentType)).decode(value, {
                stream: true
              }) : undefined;
              const reportProgress = () => observer.next({
                type: HttpEventType.DownloadProgress,
                total: Number.isFinite(contentLengthValue) ? contentLengthValue : undefined,
                loaded: receivedLength,
                partialText
              });
              reqZone ? reqZone.run(reportProgress) : reportProgress();
            }
          }
        }));
        // We need to manage the canceled state — because the Streams API does not
        // expose a direct `.state` property on the reader.
        // We need to `return` because `parseBody` may not be able to parse chunks
        // that were only partially read (due to cancellation caused by app destruction).
        if (canceled) {
          observer.complete();
          return;
        }
        // Combine all chunks.
        const chunksAll = _this.concatChunks(chunks, receivedLength);
        try {
          body = _this.parseBody(request, chunksAll, contentType, status);
        } catch (error) {
          // Body loading or parsing failed
          observer.error(new HttpErrorResponse({
            error,
            headers: new HttpHeaders(response.headers),
            status: response.status,
            statusText: response.statusText,
            url: response.url || request.urlWithParams
          }));
          return;
        }
      }
      // Same behavior as the XhrBackend
      if (status === 0) {
        status = body ? HTTP_STATUS_CODE_OK : 0;
      }
      // ok determines whether the response will be transmitted on the event or
      // error channel. Unsuccessful status codes (not 2xx) will always be errors,
      // but a successful status code can still result in an error if the user
      // asked for JSON data and the body cannot be parsed as such.
      const ok = status >= 200 && status < 300;
      const redirected = response.redirected;
      const responseType = response.type;
      if (ok) {
        observer.next(new HttpResponse({
          body,
          headers,
          status,
          statusText,
          url,
          redirected,
          responseType
        }));
        // The full body has been received and delivered, no further events
        // are possible. This request is complete.
        observer.complete();
      } else {
        observer.error(new HttpErrorResponse({
          error: body,
          headers,
          status,
          statusText,
          url,
          redirected,
          responseType
        }));
      }
    })();
  }
  parseBody(request, binContent, contentType, status) {
    switch (request.responseType) {
      case 'json':
        // stripping the XSSI when present
        const text = new TextDecoder().decode(binContent).replace(XSSI_PREFIX$1, '');
        if (text === '') {
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          // Allow handling non-JSON errors (!) as plain text, same as the XHR
          // backend. Without this special sauce, any non-JSON error would be
          // completely inaccessible downstream as the `HttpErrorResponse.error`
          // would be set to the `SyntaxError` from then failing `JSON.parse`.
          if (status < 200 || status >= 300) {
            return text;
          }
          throw e;
        }
      case 'text':
        return getTextDecoder(contentType).decode(binContent);
      case 'blob':
        return new Blob([binContent], {
          type: contentType
        });
      case 'arraybuffer':
        return binContent.buffer;
    }
  }
  createRequestInit(req) {
    if (req.reportUploadProgress) {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2824 /* RuntimeErrorCode.FETCH_UPLOAD_PROGRESS_NOT_SUPPORTED */, wx.__global.ngDevMode && 'The FetchBackend does not support upload progress reporting. Please use `withXhr()` on your `provideHttpClient()` configuration if you want to report upload progress.');
    }
    // We could share some of this logic with the XhrBackend
    const headers = {};
    let credentials;
    // If the request has a credentials property, use it.
    // Otherwise, if the request has withCredentials set to true, use 'include'.
    credentials = req.credentials;
    // If withCredentials is true should be set to 'include', for compatibility
    if (req.withCredentials) {
      // A warning is logged in development mode if the request has both
      (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && warningOptionsMessage(req);
      credentials = 'include';
    }
    // Setting all the requested headers.
    req.headers.forEach((name, values) => headers[name] = values.join(','));
    // Add an Accept header if one isn't present already.
    if (!req.headers.has(ACCEPT_HEADER)) {
      headers[ACCEPT_HEADER] = ACCEPT_HEADER_VALUE;
    }
    // Auto-detect the Content-Type header if one isn't present already.
    if (!req.headers.has(CONTENT_TYPE_HEADER)) {
      const detectedType = req.detectContentTypeHeader();
      // Sometimes Content-Type detection fails.
      if (detectedType !== null) {
        headers[CONTENT_TYPE_HEADER] = detectedType;
      }
    }
    return {
      body: req.serializeBody(),
      method: req.method,
      headers,
      credentials,
      keepalive: req.keepalive,
      cache: req.cache,
      priority: req.priority,
      mode: req.mode,
      redirect: req.redirect,
      referrer: req.referrer,
      integrity: req.integrity,
      referrerPolicy: req.referrerPolicy
    };
  }
  concatChunks(chunks, totalLength) {
    const chunksAll = new Uint8Array(totalLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
    return chunksAll;
  }
  static ɵfac = function FetchBackend_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FetchBackend)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineService"]({
    token: FetchBackend,
    factory: FetchBackend.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(FetchBackend, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Service
  }], null, null);
})();
/**
 * Abstract class to provide a mocked implementation of `fetch()`
 */
class FetchFactory {}
function noop() {}
function warningOptionsMessage(req) {
  if (req.credentials && req.withCredentials) {
    console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.formatRuntimeError)(2819 /* RuntimeErrorCode.WITH_CREDENTIALS_OVERRIDES_EXPLICIT_CREDENTIALS */, `Angular detected that a \`HttpClient\` request has both \`withCredentials: true\` and \`credentials: '${req.credentials}'\` options. The \`withCredentials\` option is overriding the explicit \`credentials\` setting to 'include'. Consider removing \`withCredentials\` and using \`credentials: '${req.credentials}'\` directly for clarity.`));
  }
}
/**
 * Zone.js treats a rejected promise that has not yet been awaited
 * as an unhandled error. This function adds a noop `.then` to make
 * sure that Zone.js doesn't throw an error if the Promise is rejected
 * synchronously.
 */
function silenceSuperfluousUnhandledPromiseRejection(promise) {
  promise.then(noop, noop);
}
function throwBodyTooLargeError(maxResponseSize) {
  throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(-2825 /* RuntimeErrorCode.FETCH_RESPONSE_BODY_TOO_LARGE */, wx.__global.ngDevMode && `Fetch response body exceeded the configured buffer limit (${maxResponseSize} bytes).`);
}
const CHARSET_REGEX = /charset=\s*["']?([^;"'\s]+)["']?/i;
/**
 * Creates a `TextDecoder` instance using the charset extracted from the `Content-Type` header,
 * falling back to the default (`utf-8`) if no valid charset is specified or supported.
 */
function getTextDecoder(contentType) {
  const match = contentType.match(CHARSET_REGEX);
  if (match !== null) {
    try {
      return new TextDecoder(match[1]);
    } catch {
      // Catching `RangeError` thrown by `new TextDecoder(...)` when the encoding label is invalid or
      // unsupported. There is no synchronous inspection API on `TextDecoder` to verify whether an
      // encoding is supported without executing the constructor, so catching the error is required
      // before falling back to default UTF-8.
    }
  }
  return new TextDecoder();
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const XSRF_ENABLED = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'XSRF_ENABLED' : '', {
  factory: () => true
});
const XSRF_DEFAULT_COOKIE_NAME = 'XSRF-TOKEN';
const XSRF_COOKIE_NAME = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'XSRF_COOKIE_NAME' : '', {
  // Providing a factory implies that the token is provided in root by default
  factory: () => XSRF_DEFAULT_COOKIE_NAME
});
const XSRF_DEFAULT_HEADER_NAME = 'X-XSRF-TOKEN';
const XSRF_HEADER_NAME = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'XSRF_HEADER_NAME' : '', {
  factory: () => XSRF_DEFAULT_HEADER_NAME
});
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
class HttpXsrfCookieExtractor {
  cookieName = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(XSRF_COOKIE_NAME);
  doc = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.DOCUMENT);
  lastCookieString = '';
  lastToken = null;
  /**
   * @internal for testing
   */
  parseCount = 0;
  getToken() {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      return null;
    }
    const cookieString = this.doc.cookie || '';
    if (cookieString !== this.lastCookieString) {
      this.parseCount++;
      this.lastToken = (0,angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_13__["ɵparseCookieValue"])(cookieString, this.cookieName);
      this.lastCookieString = cookieString;
    }
    return this.lastToken;
  }
  static ɵfac = function HttpXsrfCookieExtractor_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpXsrfCookieExtractor)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineService"]({
    token: HttpXsrfCookieExtractor,
    factory: HttpXsrfCookieExtractor.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpXsrfCookieExtractor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Service
  }], null, null);
})();
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
class HttpXsrfTokenExtractor {
  static ɵfac = function HttpXsrfTokenExtractor_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpXsrfTokenExtractor)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: HttpXsrfTokenExtractor,
    factory: function HttpXsrfTokenExtractor_Factory(__ngFactoryType__) {
      let __ngConditionalFactory__ = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new (__ngFactoryType__ || HttpXsrfTokenExtractor)();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](HttpXsrfCookieExtractor);
      }
      return __ngConditionalFactory__;
    },
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpXsrfTokenExtractor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable,
    args: [{
      providedIn: 'root',
      useExisting: HttpXsrfCookieExtractor
    }]
  }], null, null);
})();
function xsrfInterceptorFn(req, next) {
  // Skip both non-mutating requests
  // Non-mutating requests generally don't require a token.
  if (!(0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(XSRF_ENABLED) || req.method === 'GET' || req.method === 'HEAD') {
    return next(req);
  }
  try {
    const locationHref = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_13__.PlatformLocation).href;
    const {
      origin: locationOrigin
    } = new URL(locationHref);
    // We can use `new URL` to normalize a relative URL like '//something.com' to
    // 'https://something.com' in order to make consistent same-origin comparisons.
    const {
      origin: requestOrigin
    } = new URL(req.url, locationOrigin);
    if (locationOrigin !== requestOrigin) {
      return next(req);
    }
  } catch {
    // Handle invalid URLs gracefully.
    return next(req);
  }
  const token = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(HttpXsrfTokenExtractor).getToken();
  const headerName = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(XSRF_HEADER_NAME);
  // Be careful not to overwrite an existing header of the same name.
  if (token != null && !req.headers.has(headerName)) {
    req = req.clone({
      headers: req.headers.set(headerName, token)
    });
  }
  return next(req);
}
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
class HttpXsrfInterceptor {
  injector = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.EnvironmentInjector);
  intercept(initialRequest, next) {
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.runInInjectionContext)(this.injector, () => xsrfInterceptorFn(initialRequest, downstreamRequest => next.handle(downstreamRequest)));
  }
  static ɵfac = function HttpXsrfInterceptor_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpXsrfInterceptor)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: HttpXsrfInterceptor,
    factory: HttpXsrfInterceptor.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpXsrfInterceptor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable
  }], null, null);
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
function interceptorChainEndFn(req, finalHandlerFn) {
  return finalHandlerFn(req);
}
/**
 * Constructs a `ChainedInterceptorFn` which adapts a legacy `HttpInterceptor` to the
 * `ChainedInterceptorFn` interface.
 */
function adaptLegacyInterceptorToChain(chainTailFn, interceptor) {
  return (initialRequest, finalHandlerFn) => interceptor.intercept(initialRequest, {
    handle: downstreamRequest => chainTailFn(downstreamRequest, finalHandlerFn)
  });
}
/**
 * Constructs a `ChainedInterceptorFn` which wraps and invokes a functional interceptor in the given
 * injector.
 */
function chainedInterceptorFn(chainTailFn, interceptorFn, injector) {
  return (initialRequest, finalHandlerFn) => (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.runInInjectionContext)(injector, () => interceptorFn(initialRequest, downstreamRequest => chainTailFn(downstreamRequest, finalHandlerFn)));
}
/**
 * A multi-provider token that represents the array of registered
 * `HttpInterceptor` objects.
 *
 * @see [HTTP Guide](guide/http/interceptors)
 *
 * @publicApi
 */
const HTTP_INTERCEPTORS = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'HTTP_INTERCEPTORS' : '');
/**
 * A multi-provided token of `HttpInterceptorFn`s.
 */
const HTTP_INTERCEPTOR_FNS = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'HTTP_INTERCEPTOR_FNS' : '', {
  factory: () => [xsrfInterceptorFn]
});
/**
 * A multi-provided token of `HttpInterceptorFn`s that are only set in root.
 */
const HTTP_ROOT_INTERCEPTOR_FNS = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'HTTP_ROOT_INTERCEPTOR_FNS' : '');
// TODO(atscott): We need a larger discussion about stability and what should contribute to stability.
// Should the whole interceptor chain contribute to stability or just the backend request #55075?
// Should HttpClient contribute to stability automatically at all?
const REQUESTS_CONTRIBUTE_TO_STABILITY = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'REQUESTS_CONTRIBUTE_TO_STABILITY' : '',
// Providing a factory implies that the token is provided in root by default
{
  factory: () => true
});
/**
 * Creates an `HttpInterceptorFn` which lazily initializes an interceptor chain from the legacy
 * class-based interceptors and runs the request through it.
 */
function legacyInterceptorFnFactory() {
  let chain = null;
  return (req, handler) => {
    if (chain === null) {
      const interceptors = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(HTTP_INTERCEPTORS, {
        optional: true
      }) ?? [];
      // Note: interceptors are wrapped right-to-left so that final execution order is
      // left-to-right. That is, if `interceptors` is the array `[a, b, c]`, we want to
      // produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside
      // out.
      chain = interceptors.reduceRight(adaptLegacyInterceptorToChain, interceptorChainEndFn);
    }
    const pendingTasks = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.PendingTasks);
    const contributeToStability = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(REQUESTS_CONTRIBUTE_TO_STABILITY);
    if (contributeToStability) {
      const removeTask = pendingTasks.add();
      return chain(req, handler).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.finalize)(removeTask));
    } else {
      return chain(req, handler);
    }
  };
}

/**
 * A final `HttpHandler` which will dispatch the request via browser HTTP APIs to a backend.
 *
 * Interceptors sit between the `HttpClient` interface and the `HttpBackend`.
 *
 * When injected, `HttpBackend` dispatches requests directly to the backend, without going
 * through the interceptor chain.
 *
 * @publicApi
 */
class HttpBackend {
  static ɵfac = function HttpBackend_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpBackend)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: HttpBackend,
    factory: function HttpBackend_Factory(__ngFactoryType__) {
      let __ngConditionalFactory__ = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new (__ngFactoryType__ || HttpBackend)();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](FetchBackend);
      }
      return __ngConditionalFactory__;
    },
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpBackend, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable,
    args: [{
      providedIn: 'root',
      useExisting: FetchBackend
    }]
  }], null, null);
})();
let fetchBackendWarningDisplayed = false;
/** Internal function to reset the flag in tests */
function resetFetchBackendWarningFlag() {
  fetchBackendWarningDisplayed = false;
}
class HttpInterceptorHandler {
  backend;
  injector;
  chain = null;
  pendingTasks = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.PendingTasks);
  contributeToStability = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(REQUESTS_CONTRIBUTE_TO_STABILITY);
  constructor(backend, injector) {
    this.backend = backend;
    this.injector = injector;
    // We strongly recommend using fetch backend for HTTP calls when SSR is used
    // for an application. The logic below checks if that's the case and produces
    // a warning otherwise.
    if ((typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && !fetchBackendWarningDisplayed) {
      // This flag is necessary because provideHttpClientTesting() overrides the backend
      // even if `withFetch()` is used within the test. When the testing HTTP backend is provided,
      // no HTTP calls are actually performed during the test, so producing a warning would be
      // misleading.
      const isTestingBackend = this.backend.isTestingBackend;
      if (typeof ngServerMode !== 'undefined' && ngServerMode && !(this.backend instanceof FetchBackend) && !isTestingBackend) {
        fetchBackendWarningDisplayed = true;
        injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_2__.Console).warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.formatRuntimeError)(2801 /* RuntimeErrorCode.NOT_USING_FETCH_BACKEND_IN_SSR */, 'Angular detected that `HttpClient` is not configured ' + "to use `fetch` APIs. It's strongly recommended to " + 'enable `fetch` for applications that use Server-Side Rendering ' + 'for better performance and compatibility. ' + 'To enable `fetch`, remove the `withXhr()` feature from the `provideHttpClient()` call'));
      }
    }
  }
  handle(initialRequest) {
    if (this.chain === null) {
      const parentHandler = this.injector.get(HttpHandler, null, {
        skipSelf: true
      });
      const isDelegating = parentHandler !== null && this.backend === parentHandler;
      const rootInterceptorFns = this.injector.get(HTTP_ROOT_INTERCEPTOR_FNS, [], isDelegating ? {
        self: true
      } : undefined);
      const dedupedInterceptorFns = Array.from(new Set([...this.injector.get(HTTP_INTERCEPTOR_FNS), ...rootInterceptorFns]));
      // Note: interceptors are wrapped right-to-left so that final execution order is
      // left-to-right. That is, if `dedupedInterceptorFns` is the array `[a, b, c]`, we want to
      // produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside
      // out.
      this.chain = dedupedInterceptorFns.reduceRight((nextSequencedFn, interceptorFn) => chainedInterceptorFn(nextSequencedFn, interceptorFn, this.injector), interceptorChainEndFn);
    }
    const chain = this.chain;
    if (this.contributeToStability) {
      const removeTask = this.pendingTasks.add();
      return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => chain(initialRequest, downstreamRequest => this.backend.handle(downstreamRequest))).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.finalize)(removeTask));
    } else {
      return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => chain(initialRequest, downstreamRequest => this.backend.handle(downstreamRequest)));
    }
  }
  static ɵfac = function HttpInterceptorHandler_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || HttpInterceptorHandler)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](HttpBackend), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.EnvironmentInjector));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: HttpInterceptorHandler,
    factory: HttpInterceptorHandler.ɵfac,
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpInterceptorHandler, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable,
    args: [{
      providedIn: 'root'
    }]
  }], () => [{
    type: HttpBackend
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.EnvironmentInjector
  }], null);
})();
/**
 * Transforms an `HttpRequest` into a stream of `HttpEvent`s, one of which will likely be a
 * `HttpResponse`.
 *
 * `HttpHandler` is injectable. When injected, the handler instance dispatches requests to the
 * first interceptor in the chain, which dispatches to the second, etc, eventually reaching the
 * `HttpBackend`.
 *
 * In an `HttpInterceptor`, the `HttpHandler` parameter is the next interceptor in the chain.
 *
 * @publicApi
 */
class HttpHandler {
  static ɵfac = function HttpHandler_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpHandler)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: HttpHandler,
    factory: function HttpHandler_Factory(__ngFactoryType__) {
      let __ngConditionalFactory__ = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new (__ngFactoryType__ || HttpHandler)();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](HttpInterceptorHandler);
      }
      return __ngConditionalFactory__;
    },
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpHandler, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable,
    args: [{
      providedIn: 'root',
      useExisting: HttpInterceptorHandler
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
 * Constructs an instance of `HttpRequestOptions<T>` from a source `HttpMethodOptions` and
 * the given `body`. This function clones the object and adds the body.
 *
 * Note that the `responseType` *options* value is a String that identifies the
 * single data type of the response.
 * A single overload version of the method handles each response type.
 * The value of `responseType` cannot be a union, as the combined signature could imply.
 *
 */
function addBody(options, body) {
  return {
    body,
    ...options
  };
}
/**
 * Performs HTTP requests.
 * This service is available as an injectable class, with methods to perform HTTP requests.
 * Each request method has multiple signatures, and the return type varies based on
 * the signature that is called (mainly the values of `observe` and `responseType`).
 *
 * Note that the `responseType` *options* value is a String that identifies the
 * single data type of the response.
 * A single overload version of the method handles each response type.
 * The value of `responseType` cannot be a union, as the combined signature could imply.
 *
 * @usageNotes
 *
 * ### HTTP Request Example
 *
 * ```ts
 *  // GET heroes whose name contains search term
 * searchHeroes(term: string): observable<Hero[]>{
 *
 *  const params = new HttpParams({fromString: 'name=term'});
 *    return this.httpClient.request('GET', this.heroesUrl, {responseType:'json', params});
 * }
 * ```
 *
 * Alternatively, the parameter string can be used without invoking HttpParams
 * by directly joining to the URL.
 * ```ts
 * this.httpClient.request('GET', this.heroesUrl + '?' + 'name=term', {responseType:'json'});
 * ```
 *
 * ### PATCH Example
 * ```ts
 * // PATCH one of the heroes' name
 * patchHero (id: number, heroName: string): Observable<{}> {
 * const url = `${this.heroesUrl}/${id}`;   // PATCH api/heroes/42
 *  return this.httpClient.patch(url, {name: heroName}, httpOptions)
 *    .pipe(catchError(this.handleError('patchHero')));
 * }
 * ```
 *
 * @see [HTTP Guide](guide/http)
 * @see [HTTP Request](api/common/http/HttpRequest)
 *
 * @publicApi
 */
class HttpClient {
  handler;
  constructor(handler) {
    this.handler = handler;
  }
  /**
   * Constructs an observable for a generic HTTP request that, when subscribed,
   * fires the request through the chain of registered interceptors and on to the
   * server.
   *
   * You can pass an `HttpRequest` directly as the only parameter. In this case,
   * the call returns an observable of the raw `HttpEvent` stream.
   *
   * Alternatively you can pass an HTTP method as the first parameter,
   * a URL string as the second, and an options hash containing the request body as the third.
   * See `addBody()`. In this case, the specified `responseType` and `observe` options determine the
   * type of returned observable.
   *   * The `responseType` value determines how a successful response body is parsed.
   *   * If `responseType` is the default `json`, you can pass a type interface for the resulting
   * object as a type parameter to the call.
   *
   * The `observe` value determines the return type, according to what you are interested in
   * observing.
   *   * An `observe` value of events returns an observable of the raw `HttpEvent` stream, including
   * progress events by default.
   *   * An `observe` value of response returns an observable of `HttpResponse<T>`,
   * where the `T` parameter depends on the `responseType` and any optionally provided type
   * parameter.
   *   * An `observe` value of body returns an observable of `<T>` with the same `T` body type.
   *
   */
  request(first, url, options = {}) {
    let req;
    // First, check whether the primary argument is an instance of `HttpRequest`.
    if (first instanceof HttpRequest) {
      // It is. The other arguments must be undefined (per the signatures) and can be
      // ignored.
      req = first;
    } else {
      // It's a string, so it represents a URL. Construct a request based on it,
      // and incorporate the remaining arguments (assuming `GET` unless a method is
      // provided.
      // Figure out the headers.
      let headers = undefined;
      if (options.headers instanceof HttpHeaders) {
        headers = options.headers;
      } else {
        headers = new HttpHeaders(options.headers);
      }
      // Sort out parameters.
      let params = undefined;
      if (!!options.params) {
        if (options.params instanceof HttpParams) {
          params = options.params;
        } else {
          params = new HttpParams({
            fromObject: options.params
          });
        }
      }
      // Construct the request.
      req = new HttpRequest(first, url, options.body !== undefined ? options.body : null, {
        headers,
        context: options.context,
        params,
        reportProgress: options.reportProgress,
        reportUploadProgress: options.reportUploadProgress,
        reportDownloadProgress: options.reportDownloadProgress,
        // By default, JSON is assumed to be returned for all calls.
        responseType: options.responseType || 'json',
        withCredentials: options.withCredentials,
        transferCache: options.transferCache,
        keepalive: options.keepalive,
        priority: options.priority,
        cache: options.cache,
        mode: options.mode,
        redirect: options.redirect,
        credentials: options.credentials,
        referrer: options.referrer,
        referrerPolicy: options.referrerPolicy,
        integrity: options.integrity,
        timeout: options.timeout
      });
    }
    // Start with an Observable.of() the initial request, and run the handler (which
    // includes all interceptors) inside a concatMap(). This way, the handler runs
    // inside an Observable chain, which causes interceptors to be re-run on every
    // subscription (this also makes retries re-run the handler, including interceptors).
    const events$ = (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.of)(req).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.concatMap)(req => this.handler.handle(req)));
    // If coming via the API signature which accepts a previously constructed HttpRequest,
    // the only option is to get the event stream. Otherwise, return the event stream if
    // that is what was requested.
    if (first instanceof HttpRequest || options.observe === 'events') {
      return events$;
    }
    // The requested stream contains either the full response or the body. In either
    // case, the first step is to filter the event stream to extract a stream of
    // responses(s).
    const res$ = events$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.filter)(event => event instanceof HttpResponse));
    // Decide which stream to return.
    switch (options.observe || 'body') {
      case 'body':
        // The requested stream is the body. Map the response stream to the response
        // body. This could be done more simply, but a misbehaving interceptor might
        // transform the response body into a different format and ignore the requested
        // responseType. Guard against this by validating that the response is of the
        // requested type.
        switch (req.responseType) {
          case 'arraybuffer':
            return res$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_7__.map)(res => {
              // Validate that the body is an ArrayBuffer.
              if (res.body !== null && !(res.body instanceof ArrayBuffer)) {
                throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2806 /* RuntimeErrorCode.RESPONSE_IS_NOT_AN_ARRAY_BUFFER */, wx.__global.ngDevMode && 'Response is not an ArrayBuffer.');
              }
              return res.body;
            }));
          case 'blob':
            return res$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_7__.map)(res => {
              // Validate that the body is a Blob.
              if (res.body !== null && !(res.body instanceof Blob)) {
                throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2807 /* RuntimeErrorCode.RESPONSE_IS_NOT_A_BLOB */, wx.__global.ngDevMode && 'Response is not a Blob.');
              }
              return res.body;
            }));
          case 'text':
            return res$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_7__.map)(res => {
              // Validate that the body is a string.
              if (res.body !== null && typeof res.body !== 'string') {
                throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2808 /* RuntimeErrorCode.RESPONSE_IS_NOT_A_STRING */, wx.__global.ngDevMode && 'Response is not a string.');
              }
              return res.body;
            }));
          case 'json':
          default:
            // No validation needed for JSON responses, as they can be of any type.
            return res$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_7__.map)(res => res.body));
        }
      case 'response':
        // The response stream was requested directly, so return it.
        return res$;
      default:
        // Guard against new future observe types being added.
        throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2809 /* RuntimeErrorCode.UNHANDLED_OBSERVE_TYPE */, wx.__global.ngDevMode && `Unreachable: unhandled observe type ${options.observe}}`);
    }
  }
  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `DELETE` request to execute on the server. See the individual overloads for
   * details on the return type.
   *
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   */
  delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }
  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `GET` request to execute on the server. See the individual overloads for
   * details on the return type.
   */
  get(url, options = {}) {
    return this.request('GET', url, options);
  }
  /**
   * Constructs an observable that, when subscribed, causes the configured
   * \`HEAD\` request to execute on the server. The \`HEAD\` method returns
   * meta information about the resource without transferring the
   * resource itself. See the individual overloads for
   * details on the return type.
   */
  head(url, options = {}) {
    return this.request('HEAD', url, options);
  }
  /**
   * Constructs an `Observable` that, when subscribed, causes a request with the special method
   * `JSONP` to be dispatched via the interceptor pipeline.
   * The [JSONP pattern](https://en.wikipedia.org/wiki/JSONP) works around limitations of certain
   * API endpoints that don't support newer,
   * and preferable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) protocol.
   * JSONP treats the endpoint API as a JavaScript file and tricks the browser to process the
   * requests even if the API endpoint is not located on the same domain (origin) as the client-side
   * application making the request.
   * The endpoint API must support JSONP callback for JSONP requests to work.
   * The resource API returns the JSON response wrapped in a callback function.
   * You can pass the callback function name as one of the query parameters.
   * Note that JSONP requests can only be used with `GET` requests.
   *
   * @param url The resource URL.
   * @param callbackParam The callback function name.
   * @deprecated 22.1 JSONP is deprecated as it can cause XSS vulnerabilities. Use standard HTTP requests instead. Intent to remove in future versions of Angular.
   */
  jsonp(url, callbackParam) {
    return this.request('JSONP', url, {
      params: new HttpParams().append(callbackParam, 'JSONP_CALLBACK'),
      observe: 'body',
      responseType: 'json'
    });
  }
  /**
   * Constructs an \`Observable\` that, when subscribed, causes the configured
   * \`OPTIONS\` request to execute on the server. This method allows the client
   * to determine the supported HTTP methods and other capabilities of an endpoint,
   * without implying a resource action. See the individual overloads for
   * details on the return type.
   */
  options(url, options = {}) {
    return this.request('OPTIONS', url, options);
  }
  /**
   * Constructs an observable that, when subscribed, causes the configured
   * \`PATCH\` request to execute on the server. See the individual overloads for
   * details on the return type.
   */
  patch(url, body, options = {}) {
    return this.request('PATCH', url, addBody(options, body));
  }
  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `POST` request to execute on the server. The server responds with the location of
   * the replaced resource. See the individual overloads for
   * details on the return type.
   */
  post(url, body, options = {}) {
    return this.request('POST', url, addBody(options, body));
  }
  /**
   * Constructs an observable that, when subscribed, causes the configured
   * `PUT` request to execute on the server. The `PUT` method replaces an existing resource
   * with a new set of values.
   * See the individual overloads for details on the return type.
   */
  put(url, body, options = {}) {
    return this.request('PUT', url, addBody(options, body));
  }
  static ɵfac = function HttpClient_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || HttpClient)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](HttpHandler));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: HttpClient,
    factory: HttpClient.ɵfac,
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpClient, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable,
    args: [{
      providedIn: 'root'
    }]
  }], () => [{
    type: HttpHandler
  }], null);
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Every request made through JSONP needs a callback name that's unique across the
// whole page. Each request is assigned an id and the callback name is constructed
// from that. The next id to be assigned is tracked in a global variable here that
// is shared among all applications on the page.
let nextRequestId = 0;
/**
 * When a pending <script> is unsubscribed we'll move it to this document, so it won't be
 * executed.
 */
let foreignDocument;
// Error text given when a JSONP script is injected, but doesn't invoke the callback
// passed in its URL.
const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
// Error text given when a request is passed to the JsonpClientBackend that doesn't
// have a request method JSONP.
const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';
const JSONP_ERR_WRONG_RESPONSE_TYPE = 'JSONP requests must use Json response type.';
// Error text given when a request is passed to the JsonpClientBackend that has
// headers set
const JSONP_ERR_HEADERS_NOT_SUPPORTED = 'JSONP requests do not support headers.';
// Error text given when a JSONP request URL is not absolute HTTP(S).
const JSONP_ERR_UNSAFE_URL = 'JSONP requests only support absolute URLs with HTTP(S) protocols.';
/**
 * DI token/abstract type representing a map of JSONP callbacks.
 *
 * In the browser, this should always be the `window` object.
 *
 * @deprecated 22.1 JSONP is deprecated as it can cause XSS vulnerabilities. Use standard HTTP requests instead. Intent to remove in future versions of Angular.
 */
class JsonpCallbackContext {}
/**
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 * @deprecated 22.1 JSONP is deprecated as it can cause XSS vulnerabilities. Use standard HTTP requests instead. Intent to remove in future versions of Angular.
 */
function jsonpCallbackContext() {
  if (typeof wx.__window === 'object') {
    return wx.__window;
  }
  return {};
}
/**
 * Processes an `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
 * @see {@link HttpHandler}
 * @see {@link HttpXhrBackend}
 *
 * @publicApi
 * @deprecated 22.1 JSONP is deprecated as it can cause XSS vulnerabilities. Use standard HTTP requests instead. Intent to remove in future versions of Angular.
 */
class JsonpClientBackend {
  callbackMap;
  document;
  /**
   * A resolved promise that can be used to schedule microtasks in the event handlers.
   */
  resolvedPromise = wx.__window.Promise.resolve();
  nonce = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.CSP_NONCE, {
    optional: true
  });
  constructor(callbackMap, document) {
    this.callbackMap = callbackMap;
    this.document = document;
    if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
      console.warn('JSONP support is deprecated as it can cause XSS vulnerabilities, and will be removed ' + 'in a future version of Angular. Please use standard HTTP requests instead.');
    }
  }
  /**
   * Get the name of the next callback method, by incrementing the global `nextRequestId`.
   */
  nextCallback() {
    return `ng_jsonp_callback_${nextRequestId++}`;
  }
  /**
   * Processes a JSONP request and returns an event stream of the results.
   * @param req The request object.
   * @returns An observable of the response events.
   *
   */
  handle(req) {
    // Firstly, check both the method and response type. If either doesn't match
    // then the request was improperly routed here and cannot be handled.
    if (req.method !== 'JSONP') {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2810 /* RuntimeErrorCode.JSONP_WRONG_METHOD */, wx.__global.ngDevMode && JSONP_ERR_WRONG_METHOD);
    } else if (req.responseType !== 'json') {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2811 /* RuntimeErrorCode.JSONP_WRONG_RESPONSE_TYPE */, wx.__global.ngDevMode && JSONP_ERR_WRONG_RESPONSE_TYPE);
    }
    // Check the request headers. JSONP doesn't support headers and
    // cannot set any that were supplied.
    if (req.headers.keys().length > 0) {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2812 /* RuntimeErrorCode.JSONP_HEADERS_NOT_SUPPORTED */, wx.__global.ngDevMode && JSONP_ERR_HEADERS_NOT_SUPPORTED);
    }
    if (!this.isAllowedJsonpUrl(req.urlWithParams)) {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2826 /* RuntimeErrorCode.JSONP_UNSAFE_URL */, wx.__global.ngDevMode && JSONP_ERR_UNSAFE_URL);
    }
    // Everything else happens inside the Observable boundary.
    return new rxjs__WEBPACK_IMPORTED_MODULE_10__.Observable(observer => {
      // The first step to make a request is to generate the callback name, and replace the
      // callback placeholder in the URL with the name. Care has to be taken here to ensure
      // a trailing &, if matched, gets inserted back into the URL in the correct place.
      const callback = this.nextCallback();
      const url = req.urlWithParams.replace(/=JSONP_CALLBACK(&|$)/, `=${callback}$1`);
      // Construct the <script> tag and point it at the URL.
      const node = this.document.createElement('script');
      node.src = url;
      // Set the nonce for Content Security Policy compatibility. Without this,
      // JSONP requests will be blocked by strict-dynamic CSP policies.
      if (this.nonce) {
        node.setAttribute('nonce', this.nonce);
      }
      // A JSONP request requires waiting for multiple callbacks. These variables
      // are closed over and track state across those callbacks.
      // The response object, if one has been received, or null otherwise.
      let body = null;
      // Whether the response callback has been called.
      let finished = false;
      // Set the response callback in this.callbackMap (which will be the window
      // object in the browser. The script being loaded via the <script> tag will
      // eventually call this callback.
      this.callbackMap[callback] = data => {
        // Data has been received from the JSONP script. Firstly, delete this callback.
        delete this.callbackMap[callback];
        // Set state to indicate data was received.
        body = data;
        finished = true;
      };
      // cleanup() is a utility closure that removes the <script> from the page and
      // the response callback from the window. This logic is used in both the
      // success, error, and cancellation paths, so it's extracted out for convenience.
      const cleanup = () => {
        node.removeEventListener('load', onLoad);
        node.removeEventListener('error', onError);
        // Remove the <script> tag if it's still on the page.
        node.remove();
        // Remove the response callback from the callbackMap (window object in the
        // browser).
        delete this.callbackMap[callback];
      };
      // onLoad() is the success callback which runs after the response callback
      // if the JSONP script loads successfully. The event itself is unimportant.
      // If something went wrong, onLoad() may run without the response callback
      // having been invoked.
      const onLoad = () => {
        // We wrap it in an extra Promise, to ensure the microtask
        // is scheduled after the loaded endpoint has executed any potential microtask itself,
        // which is not guaranteed in Internet Explorer and EdgeHTML. See issue #39496
        this.resolvedPromise.then(() => {
          // Cleanup the page.
          cleanup();
          // Check whether the response callback has run.
          if (!finished) {
            // It hasn't, something went wrong with the request. Return an error via
            // the Observable error path. All JSONP errors have status 0.
            observer.error(new HttpErrorResponse({
              url,
              status: 0,
              statusText: 'JSONP Error',
              error: new Error(JSONP_ERR_NO_CALLBACK)
            }));
            return;
          }
          // Success. body either contains the response body or null if none was
          // returned.
          observer.next(new HttpResponse({
            body,
            status: HTTP_STATUS_CODE_OK,
            statusText: 'OK',
            url
          }));
          // Complete the stream, the response is over.
          observer.complete();
        });
      };
      // onError() is the error callback, which runs if the script returned generates
      // a Javascript error. It emits the error via the Observable error channel as
      // a HttpErrorResponse.
      const onError = error => {
        cleanup();
        // Wrap the error in a HttpErrorResponse.
        observer.error(new HttpErrorResponse({
          error,
          status: 0,
          statusText: 'JSONP Error',
          url
        }));
      };
      // Subscribe to both the success (load) and error events on the <script> tag,
      // and add it to the page.
      node.addEventListener('load', onLoad);
      node.addEventListener('error', onError);
      this.document.body.appendChild(node);
      // The request has now been successfully sent.
      observer.next({
        type: HttpEventType.Sent
      });
      // Cancellation handler.
      return () => {
        if (!finished) {
          this.removeListeners(node);
        }
        // And finally, clean up the page.
        cleanup();
      };
    });
  }
  removeListeners(script) {
    // Issue #34818
    // Changing <script>'s ownerDocument will prevent it from execution.
    // https://html.spec.whatwg.org/multipage/scripting.html#execute-the-script-block
    foreignDocument ??= this.document.implementation.createHTMLDocument();
    foreignDocument.adoptNode(script);
  }
  isAllowedJsonpUrl(url) {
    return /^https?:\/\//i.test(url);
  }
  static ɵfac = function JsonpClientBackend_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || JsonpClientBackend)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](JsonpCallbackContext), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.DOCUMENT));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: JsonpClientBackend,
    factory: JsonpClientBackend.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(JsonpClientBackend, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable
  }], () => [{
    type: JsonpCallbackContext
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [_angular_core__WEBPACK_IMPORTED_MODULE_1__.DOCUMENT]
    }]
  }], null);
})();
/**
 * Identifies requests with the method JSONP and shifts them to the `JsonpClientBackend`.
 *
 * @deprecated 22.1 JSONP is deprecated as it can cause XSS vulnerabilities. Use standard HTTP requests instead. Intent to remove in future versions of Angular.
 */
function jsonpInterceptorFn(req, next) {
  if (req.method === 'JSONP') {
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(JsonpClientBackend).handle(req);
  }
  // Fall through for normal HTTP requests.
  return next(req);
}
/**
 * Identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 * @see {@link HttpInterceptor}
 *
 * @publicApi
 * @deprecated 22.1 JSONP is deprecated as it can cause XSS vulnerabilities. Use standard HTTP requests instead. Intent to remove in future versions of Angular.
 */
class JsonpInterceptor {
  injector;
  constructor(injector) {
    this.injector = injector;
  }
  /**
   * Identifies and handles a given JSONP request.
   * @param initialRequest The outgoing request object to handle.
   * @param next The next interceptor in the chain, or the backend
   * if no interceptors remain in the chain.
   * @returns An observable of the event stream.
   */
  intercept(initialRequest, next) {
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.runInInjectionContext)(this.injector, () => jsonpInterceptorFn(initialRequest, downstreamRequest => next.handle(downstreamRequest)));
  }
  static ɵfac = function JsonpInterceptor_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || JsonpInterceptor)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.EnvironmentInjector));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: JsonpInterceptor,
    factory: JsonpInterceptor.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(JsonpInterceptor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.EnvironmentInjector
  }], null);
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const XSSI_PREFIX = /^\)\]\}',?\n/;
/**
 * Validates whether the request is compatible with the XHR backend.
 * Show a warning if the request contains options that are not supported by XHR.
 */
function validateXhrCompatibility(req) {
  const unsupportedOptions = [{
    property: 'keepalive',
    errorCode: 2813 /* RuntimeErrorCode.KEEPALIVE_NOT_SUPPORTED_WITH_XHR */
  }, {
    property: 'cache',
    errorCode: 2814 /* RuntimeErrorCode.CACHE_NOT_SUPPORTED_WITH_XHR */
  }, {
    property: 'priority',
    errorCode: 2815 /* RuntimeErrorCode.PRIORITY_NOT_SUPPORTED_WITH_XHR */
  }, {
    property: 'mode',
    errorCode: 2816 /* RuntimeErrorCode.MODE_NOT_SUPPORTED_WITH_XHR */
  }, {
    property: 'redirect',
    errorCode: 2817 /* RuntimeErrorCode.REDIRECT_NOT_SUPPORTED_WITH_XHR */
  }, {
    property: 'credentials',
    errorCode: 2818 /* RuntimeErrorCode.CREDENTIALS_NOT_SUPPORTED_WITH_XHR */
  }, {
    property: 'integrity',
    errorCode: 2820 /* RuntimeErrorCode.INTEGRITY_NOT_SUPPORTED_WITH_XHR */
  }, {
    property: 'referrer',
    errorCode: 2821 /* RuntimeErrorCode.REFERRER_NOT_SUPPORTED_WITH_XHR */
  }, {
    property: 'referrerPolicy',
    errorCode: 2823 /* RuntimeErrorCode.REFERRER_POLICY_NOT_SUPPORTED_WITH_XHR */
  }];
  // Check each unsupported option and warn if present
  for (const {
    property,
    errorCode
  } of unsupportedOptions) {
    if (req[property]) {
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.formatRuntimeError)(errorCode, `Angular detected that a \`HttpClient\` request with the \`${property}\` option was sent using XHR, which does not support it. To use the \`${property}\` option, use the Fetch API by removing \`withXhr()\` from the \`provideHttpClient()\` call.`));
    }
  }
}
/**
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see {@link HttpHandler}
 * @see {@link JsonpClientBackend}
 *
 * @publicApi
 */
class HttpXhrBackend {
  xhrFactory;
  tracingService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.TracingService, {
    optional: true
  });
  constructor(xhrFactory) {
    this.xhrFactory = xhrFactory;
  }
  maybePropagateTrace(fn) {
    return this.tracingService?.propagate ? this.tracingService.propagate(fn) : fn;
  }
  /**
   * Processes a request and returns a stream of response events.
   * @param req The request object.
   * @returns An observable of the response events.
   */
  handle(req) {
    // Quick check to give a better error message when a user attempts to use
    // HttpClient.jsonp() without installing the HttpClientJsonpModule
    if (req.method === 'JSONP') {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(-2800 /* RuntimeErrorCode.MISSING_JSONP_MODULE */, (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && `Cannot make a JSONP request without JSONP support. To fix the problem, either add the \`withJsonpSupport()\` call (if \`provideHttpClient()\` is used) or import the \`HttpClientJsonpModule\` in the root NgModule.`);
    }
    // Validate that the request is compatible with the XHR backend.
    wx.__global.ngDevMode && validateXhrCompatibility(req);
    // Check whether this factory has a special function to load an XHR implementation
    // for various non-browser environments. We currently limit it to only `ServerXhr`
    // class, which needs to load an XHR implementation.
    const xhrFactory = this.xhrFactory;
    const source =
    // Note that `ɵloadImpl` is never defined in client bundles and can be
    // safely dropped whenever we're running in the browser.
    // This branching is redundant.
    // The `ngServerMode` guard also enables tree-shaking of the `from()`
    // function from the common bundle, as it's only used in server code.
    typeof ngServerMode !== 'undefined' && ngServerMode && xhrFactory.ɵloadImpl ? (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.from)(xhrFactory.ɵloadImpl()) : (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.of)(null);
    return source.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_8__.switchMap)(() => {
      // Everything happens on Observable subscription.
      return new rxjs__WEBPACK_IMPORTED_MODULE_10__.Observable(observer => {
        // Start by setting up the XHR object with request method, URL, and withCredentials
        // flag.
        const xhr = xhrFactory.build();
        xhr.open(req.method, req.urlWithParams);
        if (req.withCredentials) {
          xhr.withCredentials = true;
        }
        // Add all the requested headers.
        req.headers.forEach((name, values) => xhr.setRequestHeader(name, values.join(',')));
        // Add an Accept header if one isn't present already.
        if (!req.headers.has(ACCEPT_HEADER)) {
          xhr.setRequestHeader(ACCEPT_HEADER, ACCEPT_HEADER_VALUE);
        }
        // Auto-detect the Content-Type header if one isn't present already.
        if (!req.headers.has(CONTENT_TYPE_HEADER)) {
          const detectedType = req.detectContentTypeHeader();
          // Sometimes Content-Type detection fails.
          if (detectedType !== null) {
            xhr.setRequestHeader(CONTENT_TYPE_HEADER, detectedType);
          }
        }
        if (req.timeout) {
          xhr.timeout = req.timeout;
        }
        // Set the responseType if one was requested.
        if (req.responseType) {
          const responseType = req.responseType.toLowerCase();
          // JSON responses need to be processed as text. This is because if the server
          // returns an XSSI-prefixed JSON response, the browser will fail to parse it,
          // xhr.response will be null, and xhr.responseText cannot be accessed to
          // retrieve the prefixed JSON data in order to strip the prefix. Thus, all JSON
          // is parsed by first requesting text and then applying JSON.parse.
          xhr.responseType = responseType !== 'json' ? responseType : 'text';
        }
        // Serialize the request body if one is present. If not, this will be set to null.
        const reqBody = req.serializeBody();
        // If progress events are enabled, response headers will be delivered
        // in two events - the HttpHeaderResponse event and the full HttpResponse
        // event. However, since response headers don't change in between these
        // two events, it doesn't make sense to parse them twice. So headerResponse
        // caches the data extracted from the response whenever it's first parsed,
        // to ensure parsing isn't duplicated.
        let headerResponse = null;
        // partialFromXhr extracts the HttpHeaderResponse from the current XMLHttpRequest
        // state, and memoizes it into headerResponse.
        const partialFromXhr = () => {
          if (headerResponse !== null) {
            return headerResponse;
          }
          const statusText = xhr.statusText || 'OK';
          // Parse headers from XMLHttpRequest - this step is lazy.
          const headers = new HttpHeaders(xhr.getAllResponseHeaders());
          // Read the response URL from the XMLHttpResponse instance and fall back on the
          // request URL.
          const url = xhr.responseURL || req.url;
          // Construct the HttpHeaderResponse and memoize it.
          headerResponse = new HttpHeaderResponse({
            headers,
            status: xhr.status,
            statusText,
            url
          });
          return headerResponse;
        };
        // Next, a few closures are defined for the various events which XMLHttpRequest can
        // emit. This allows them to be unregistered as event listeners later.
        // First up is the load event, which represents a response being fully available.
        const onLoad = this.maybePropagateTrace(() => {
          // Read response state from the memoized partial data.
          let {
            headers,
            status,
            statusText,
            url
          } = partialFromXhr();
          // The body will be read out if present.
          let body = null;
          if (status !== HTTP_STATUS_CODE_NO_CONTENT) {
            // Use XMLHttpRequest.response if set, responseText otherwise.
            body = typeof xhr.response === 'undefined' ? xhr.responseText : xhr.response;
          }
          // Normalize another potential bug (this one comes from CORS).
          if (status === 0) {
            status = !!body ? HTTP_STATUS_CODE_OK : 0;
          }
          // ok determines whether the response will be transmitted on the event or
          // error channel. Unsuccessful status codes (not 2xx) will always be errors,
          // but a successful status code can still result in an error if the user
          // asked for JSON data and the body cannot be parsed as such.
          let ok = status >= 200 && status < 300;
          // Check whether the body needs to be parsed as JSON (in many cases the browser
          // will have done that already).
          if (req.responseType === 'json' && typeof body === 'string') {
            // Save the original body, before attempting XSSI prefix stripping.
            const originalBody = body;
            body = body.replace(XSSI_PREFIX, '');
            try {
              // Attempt the parse. If it fails, a parse error should be delivered to the
              // user.
              body = body !== '' ? JSON.parse(body) : null;
            } catch (error) {
              // Since the JSON.parse failed, it's reasonable to assume this might not have
              // been a JSON response. Restore the original body (including any XSSI prefix)
              // to deliver a better error response.
              body = originalBody;
              // If this was an error request to begin with, leave it as a string, it
              // probably just isn't JSON. Otherwise, deliver the parsing error to the user.
              if (ok) {
                // Even though the response status was 2xx, this is still an error.
                ok = false;
                // The parse error contains the text of the body that failed to parse.
                body = {
                  error,
                  text: body
                };
              }
            }
          }
          if (ok) {
            // A successful response is delivered on the event stream.
            observer.next(new HttpResponse({
              body,
              headers,
              status,
              statusText,
              url: url || undefined
            }));
            // The full body has been received and delivered, no further events
            // are possible. This request is complete.
            observer.complete();
          } else {
            // An unsuccessful request is delivered on the error channel.
            observer.error(new HttpErrorResponse({
              // The error in this case is the response body (error from the server).
              error: body,
              headers,
              status,
              statusText,
              url: url || undefined
            }));
          }
        });
        // The onError callback is called when something goes wrong at the network level.
        // Connection timeout, DNS error, offline, etc. These are actual errors, and are
        // transmitted on the error channel.
        const onError = this.maybePropagateTrace(error => {
          const {
            url
          } = partialFromXhr();
          const res = new HttpErrorResponse({
            error,
            status: xhr.status || 0,
            statusText: xhr.statusText || 'Unknown Error',
            url: url || undefined
          });
          observer.error(res);
        });
        let onTimeout = onError;
        if (req.timeout) {
          onTimeout = this.maybePropagateTrace(_ => {
            const {
              url
            } = partialFromXhr();
            const res = new HttpErrorResponse({
              error: new DOMException('Request timed out', 'TimeoutError'),
              status: xhr.status || 0,
              statusText: xhr.statusText || 'Request timeout',
              url: url || undefined
            });
            observer.error(res);
          });
        }
        // The sentHeaders flag tracks whether the HttpResponseHeaders event
        // has been sent on the stream. This is necessary to track if progress
        // is enabled since the event will be sent on only the first download
        // progress event.
        let sentHeaders = false;
        // The download progress event handler, which is only registered if
        // progress events are enabled.
        const onDownProgress = this.maybePropagateTrace(event => {
          // Send the HttpResponseHeaders event if it hasn't been sent already.
          if (!sentHeaders) {
            observer.next(partialFromXhr());
            sentHeaders = true;
          }
          // Start building the download progress event to deliver on the response
          // event stream.
          let progressEvent = {
            type: HttpEventType.DownloadProgress,
            loaded: event.loaded
          };
          // Set the total number of bytes in the event if it's available.
          if (event.lengthComputable) {
            progressEvent.total = event.total;
          }
          // If the request was for text content and a partial response is
          // available on XMLHttpRequest, include it in the progress event
          // to allow for streaming reads.
          if (req.responseType === 'text' && !!xhr.responseText) {
            progressEvent.partialText = xhr.responseText;
          }
          // Finally, fire the event.
          observer.next(progressEvent);
        });
        // The upload progress event handler, which is only registered if
        // progress events are enabled.
        const onUpProgress = this.maybePropagateTrace(event => {
          // Upload progress events are simpler. Begin building the progress
          // event.
          let progress = {
            type: HttpEventType.UploadProgress,
            loaded: event.loaded
          };
          // If the total number of bytes being uploaded is available, include
          // it.
          if (event.lengthComputable) {
            progress.total = event.total;
          }
          // Send the event.
          observer.next(progress);
        });
        // By default, register for load and error events.
        xhr.addEventListener('load', onLoad);
        xhr.addEventListener('error', onError);
        xhr.addEventListener('timeout', onTimeout);
        xhr.addEventListener('abort', onError);
        const reportUploadProgress = req.reportProgress || req.reportUploadProgress;
        const reportDownloadProgress = req.reportProgress || req.reportDownloadProgress;
        // Progress events are only enabled if requested.
        if (reportDownloadProgress) {
          // Download progress is always enabled if requested.
          xhr.addEventListener('progress', onDownProgress);
        }
        // Upload progress depends on whether there is a body to upload.
        if (reportUploadProgress && reqBody !== null && xhr.upload) {
          xhr.upload.addEventListener('progress', onUpProgress);
        }
        // Fire the request, and notify the event stream that it was fired.
        xhr.send(reqBody);
        observer.next({
          type: HttpEventType.Sent
        });
        // This is the return from the Observable function, which is the
        // request cancellation handler.
        return () => {
          // On a cancellation, remove all registered event listeners.
          xhr.removeEventListener('error', onError);
          xhr.removeEventListener('abort', onError);
          xhr.removeEventListener('load', onLoad);
          xhr.removeEventListener('timeout', onTimeout);
          if (reportDownloadProgress) {
            xhr.removeEventListener('progress', onDownProgress);
          }
          if (reportUploadProgress && reqBody !== null && xhr.upload) {
            xhr.upload.removeEventListener('progress', onUpProgress);
          }
          // Finally, abort the in-flight request.
          if (xhr.readyState !== xhr.DONE) {
            xhr.abort();
          }
        };
      });
    }));
  }
  static ɵfac = function HttpXhrBackend_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || HttpXhrBackend)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_13__.XhrFactory));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: HttpXhrBackend,
    factory: HttpXhrBackend.ɵfac,
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpXhrBackend, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable,
    args: [{
      providedIn: 'root'
    }]
  }], () => [{
    type: angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_13__.XhrFactory
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
 * Identifies a particular kind of `HttpFeature`.
 *
 * @publicApi
 */
var HttpFeatureKind;
(function (HttpFeatureKind) {
  HttpFeatureKind[HttpFeatureKind["Interceptors"] = 0] = "Interceptors";
  HttpFeatureKind[HttpFeatureKind["LegacyInterceptors"] = 1] = "LegacyInterceptors";
  HttpFeatureKind[HttpFeatureKind["CustomXsrfConfiguration"] = 2] = "CustomXsrfConfiguration";
  HttpFeatureKind[HttpFeatureKind["NoXsrfProtection"] = 3] = "NoXsrfProtection";
  HttpFeatureKind[HttpFeatureKind["JsonpSupport"] = 4] = "JsonpSupport";
  HttpFeatureKind[HttpFeatureKind["RequestsMadeViaParent"] = 5] = "RequestsMadeViaParent";
  HttpFeatureKind[HttpFeatureKind["Fetch"] = 6] = "Fetch";
  HttpFeatureKind[HttpFeatureKind["Xhr"] = 7] = "Xhr";
})(HttpFeatureKind || (HttpFeatureKind = {}));
function makeHttpFeature(kind, providers) {
  return {
    ɵkind: kind,
    ɵproviders: providers
  };
}
/**
 * Configures Angular's `HttpClient` service to be available for injection.
 *
 * The `HttpClient` service is provided in the root by default.
 *
 * By default, `HttpClient` will be configured for injection with its default options for XSRF
 * protection of outgoing requests. Additional configuration options can be provided by passing
 * feature functions to `provideHttpClient`. For example, HTTP interceptors can be added using the
 * `withInterceptors(...)` feature.
 *
 * <div class="docs-alert docs-alert-helpful">
 *
 * By default, `HttpClient` uses the
 * [`fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make requests.
 * This is strongly recommended for applications that use
 * Server-Side Rendering for better performance and compatibility.
 * To use the `XMLHttpRequest` API instead, add the {@link withXhr} feature:
 *
 * ```ts
 * provideHttpClient(withXhr());
 * ```
 *
 * </div>
 *
 * @see [HTTP Client](guide/http/setup)
 * @see {@link withInterceptors}
 * @see {@link withInterceptorsFromDi}
 * @see {@link withXsrfConfiguration}
 * @see {@link withNoXsrfProtection}
 * @see {@link withJsonpSupport}
 * @see {@link withRequestsMadeViaParent}
 * @see {@link withXhr}
 */
function provideHttpClient(...features) {
  if (wx.__global.ngDevMode) {
    const featureKinds = new Set(features.map(f => f.ɵkind));
    if (featureKinds.has(HttpFeatureKind.NoXsrfProtection) && featureKinds.has(HttpFeatureKind.CustomXsrfConfiguration)) {
      throw new Error(`Configuration error: found both withXsrfConfiguration() and withNoXsrfProtection() in the same call to provideHttpClient(), which is a contradiction.`);
    }
    const hasBackendOverride = featureKinds.has(HttpFeatureKind.Fetch) || featureKinds.has(HttpFeatureKind.Xhr);
    if (featureKinds.has(HttpFeatureKind.RequestsMadeViaParent) && hasBackendOverride) {
      throw new Error(`Configuration error: withRequestsMadeViaParent() cannot be combined with withFetch() or withXhr() in the same call to provideHttpClient().`);
    }
  }
  const providers = [HttpClient, FetchBackend, HttpInterceptorHandler, {
    provide: HttpHandler,
    useExisting: HttpInterceptorHandler
  }, {
    provide: HttpBackend,
    useFactory: () => {
      return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(FetchBackend);
    }
  }, {
    provide: HTTP_INTERCEPTOR_FNS,
    useValue: xsrfInterceptorFn,
    multi: true
  }];
  for (const feature of features) {
    providers.push(...feature.ɵproviders);
  }
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.makeEnvironmentProviders)(providers);
}
/**
 * Adds one or more functional-style HTTP interceptors to the configuration of the `HttpClient`
 * instance.
 *
 * @see {@link HttpInterceptorFn}
 * @see {@link provideHttpClient}
 * @publicApi
 */
function withInterceptors(interceptorFns) {
  return makeHttpFeature(HttpFeatureKind.Interceptors, interceptorFns.map(interceptorFn => {
    return {
      provide: HTTP_INTERCEPTOR_FNS,
      useValue: interceptorFn,
      multi: true
    };
  }));
}
const LEGACY_INTERCEPTOR_FN = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'LEGACY_INTERCEPTOR_FN' : '');
/**
 * Includes class-based interceptors configured using a multi-provider in the current injector into
 * the configured `HttpClient` instance.
 *
 * Prefer `withInterceptors` and functional interceptors instead, as support for DI-provided
 * interceptors may be phased out in a later release.
 *
 * @see {@link HttpInterceptor}
 * @see {@link HTTP_INTERCEPTORS}
 * @see {@link provideHttpClient}
 */
function withInterceptorsFromDi() {
  // Note: the legacy interceptor function is provided here via an intermediate token
  // (`LEGACY_INTERCEPTOR_FN`), using a pattern which guarantees that if these providers are
  // included multiple times, all of the multi-provider entries will have the same instance of the
  // interceptor function. That way, the `HttpINterceptorHandler` will dedup them and legacy
  // interceptors will not run multiple times.
  return makeHttpFeature(HttpFeatureKind.LegacyInterceptors, [{
    provide: LEGACY_INTERCEPTOR_FN,
    useFactory: legacyInterceptorFnFactory
  }, {
    provide: HTTP_INTERCEPTOR_FNS,
    useExisting: LEGACY_INTERCEPTOR_FN,
    multi: true
  }]);
}
/**
 * Customizes the XSRF protection for the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withNoXsrfProtection` feature.
 *
 * @see {@link provideHttpClient}
 */
function withXsrfConfiguration({
  cookieName,
  headerName
}) {
  const providers = [];
  if (cookieName !== undefined) {
    providers.push({
      provide: XSRF_COOKIE_NAME,
      useValue: cookieName
    });
  }
  if (headerName !== undefined) {
    providers.push({
      provide: XSRF_HEADER_NAME,
      useValue: headerName
    });
  }
  return makeHttpFeature(HttpFeatureKind.CustomXsrfConfiguration, providers);
}
/**
 * Disables XSRF protection in the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withXsrfConfiguration` feature.
 *
 * @see {@link provideHttpClient}
 */
function withNoXsrfProtection() {
  return makeHttpFeature(HttpFeatureKind.NoXsrfProtection, [{
    provide: XSRF_ENABLED,
    useValue: false
  }]);
}
/**
 * Add JSONP support to the configuration of the current `HttpClient` instance.
 *
 * @see {@link provideHttpClient}
 * @deprecated 22.1 JSONP is deprecated as it can cause XSS vulnerabilities. Use standard HTTP requests instead. Intent to remove in future versions of Angular.
 */
function withJsonpSupport() {
  return makeHttpFeature(HttpFeatureKind.JsonpSupport, [JsonpClientBackend, {
    provide: JsonpCallbackContext,
    useFactory: jsonpCallbackContext
  }, {
    provide: HTTP_INTERCEPTOR_FNS,
    useValue: jsonpInterceptorFn,
    multi: true
  }]);
}
/**
 * Configures the current `HttpClient` instance to make requests via the parent injector's
 * `HttpClient` instead of directly.
 *
 * By default, `provideHttpClient` configures `HttpClient` in its injector to be an independent
 * instance. For example, even if `HttpClient` is configured in the parent injector with
 * one or more interceptors, they will not intercept requests made via this instance.
 *
 * With this option enabled, once the request has passed through the current injector's
 * interceptors, it will be delegated to the parent injector's `HttpClient` chain instead of
 * dispatched directly, and interceptors in the parent configuration will be applied to the request.
 *
 * If there are several `HttpClient` instances in the injector hierarchy, it's possible for
 * `withRequestsMadeViaParent` to be used at multiple levels, which will cause the request to
 * "bubble up" until either reaching the root level or an `HttpClient` which was not configured with
 * this option.
 *
 * This feature cannot be combined with `withFetch` or `withXhr` in the same
 * `provideHttpClient()` call.
 *
 * @see [HTTP client setup](guide/http/setup#withrequestsmadeviaparent)
 * @see {@link provideHttpClient}
 * @publicApi 19.0
 */
function withRequestsMadeViaParent() {
  return makeHttpFeature(HttpFeatureKind.RequestsMadeViaParent, [{
    provide: HttpBackend,
    useFactory: () => {
      const handlerFromParent = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(HttpHandler, {
        skipSelf: true,
        optional: true
      });
      if (wx.__global.ngDevMode && handlerFromParent === null) {
        throw new Error('withRequestsMadeViaParent() can only be used when the parent injector also configures HttpClient');
      }
      return handlerFromParent;
    }
  }]);
}
/**
 * Configures the current `HttpClient` instance to make requests using the fetch API.
 *
 * Note: The Fetch API doesn't support progress report on uploads.
 *
 * @see [Advanced fetch Options](guide/http/making-requests#advanced-fetch-options)
 *
 * @publicApi
 * @deprecated `withFetch` is not required anymore. `FetchBackend` is the default `HttpBackend`.
 */
function withFetch() {
  return makeHttpFeature(HttpFeatureKind.Fetch, [FetchBackend, {
    provide: HttpBackend,
    useExisting: FetchBackend
  }]);
}
/**
 * Configures the current `HttpClient` instance to make requests using the Xhr API.
 *
 * Use this feature if you want to report progress on uploads as the Xhr API supports it.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * Do not use {@link withXhr} in server-side rendering (SSR) environments. XHR support on the
 * server is **deprecated** and is intended to be removed in Angular 23 because the underlying `xhr2`
 * library does not safely handle redirects (e.g. it can forward `Authorization` headers on
 * cross-origin redirects and is susceptible to denial-of-service via redirect loops).
 *
 * </div>
 *
 * @see {@link provideHttpClient}
 * @publicApi
 */
function withXhr() {
  return makeHttpFeature(HttpFeatureKind.Xhr, [HttpXhrBackend, {
    provide: HttpBackend,
    useExisting: HttpXhrBackend
  }]);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Configures XSRF protection support for outgoing requests.
 *
 * For a server that supports a cookie-based XSRF protection system,
 * use directly to configure XSRF protection with the correct
 * cookie and header names.
 *
 * If no names are supplied, the default cookie name is `XSRF-TOKEN`
 * and the default header name is `X-XSRF-TOKEN`.
 *
 * @publicApi
 * @deprecated Use withXsrfConfiguration({cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN'}) as
 *     providers instead or `withNoXsrfProtection` if you want to disabled XSRF protection.
 */
class HttpClientXsrfModule {
  /**
   * Disable the default XSRF protection.
   */
  static disable() {
    return {
      ngModule: HttpClientXsrfModule,
      providers: [withNoXsrfProtection().ɵproviders]
    };
  }
  /**
   * Configure XSRF protection.
   * @param options An object that can specify either or both
   * cookie name or header name.
   * - Cookie name default is `XSRF-TOKEN`.
   * - Header name default is `X-XSRF-TOKEN`.
   *
   */
  static withOptions(options = {}) {
    return {
      ngModule: HttpClientXsrfModule,
      providers: withXsrfConfiguration(options).ɵproviders
    };
  }
  static ɵfac = function HttpClientXsrfModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpClientXsrfModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({
    type: HttpClientXsrfModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({
    providers: [HttpXsrfInterceptor, {
      provide: HTTP_INTERCEPTORS,
      useExisting: HttpXsrfInterceptor,
      multi: true
    }, {
      provide: HttpXsrfTokenExtractor,
      useClass: HttpXsrfCookieExtractor
    }, withXsrfConfiguration({
      cookieName: XSRF_DEFAULT_COOKIE_NAME,
      headerName: XSRF_DEFAULT_HEADER_NAME
    }).ɵproviders, {
      provide: XSRF_ENABLED,
      useValue: true
    }]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpClientXsrfModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule,
    args: [{
      providers: [HttpXsrfInterceptor, {
        provide: HTTP_INTERCEPTORS,
        useExisting: HttpXsrfInterceptor,
        multi: true
      }, {
        provide: HttpXsrfTokenExtractor,
        useClass: HttpXsrfCookieExtractor
      }, withXsrfConfiguration({
        cookieName: XSRF_DEFAULT_COOKIE_NAME,
        headerName: XSRF_DEFAULT_HEADER_NAME
      }).ɵproviders, {
        provide: XSRF_ENABLED,
        useValue: true
      }]
    }]
  }], null, null);
})();
/**
 * Configures the dependency injector for `HttpClient`
 * with supporting services for XSRF. Automatically imported by `HttpClientModule`.
 *
 * You can add interceptors to the chain behind `HttpClient` by binding them to the
 * multiprovider for built-in DI token `HTTP_INTERCEPTORS`.
 *
 * When importing the `HttpClientModule`, the `HttpBackend` is set to using the `HttpXhrBackend`.
 * If you want to use the `FetchBackend`, use `provideHttpClient` instead.
 *
 * @publicApi
 * @deprecated use `provideHttpClient(withInterceptorsFromDi())` as providers instead
 */
class HttpClientModule {
  static ɵfac = function HttpClientModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpClientModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({
    type: HttpClientModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({
    providers: [provideHttpClient(withInterceptorsFromDi(), withXhr())]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpClientModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule,
    args: [{
      /**
       * Configures the dependency injector where it is imported
       * with supporting services for HTTP communications.
       */
      providers: [provideHttpClient(withInterceptorsFromDi(), withXhr())]
    }]
  }], null, null);
})();
/**
 * Configures the dependency injector for `HttpClient`
 * with supporting services for JSONP.
 * Without this module, Jsonp requests reach the backend
 * with method JSONP, where they are rejected.
 *
 * @publicApi
 * @deprecated 22.1 JSONP is deprecated as it can cause XSS vulnerabilities. Intent to remove in future versions of Angular.
 */
class HttpClientJsonpModule {
  static ɵfac = function HttpClientJsonpModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpClientJsonpModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({
    type: HttpClientJsonpModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({
    providers: [withJsonpSupport().ɵproviders]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(HttpClientJsonpModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule,
    args: [{
      providers: [withJsonpSupport().ɵproviders]
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
 * If your application uses different HTTP origins to make API calls (via `HttpClient`) on the server and
 * on the client, the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token allows you to establish a mapping
 * between those origins, so that `HttpTransferCache` feature can recognize those requests as the same
 * ones and reuse the data cached on the server during hydration on the client.
 *
 * IMPORTANT: The `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token should *only* be provided in
 * the *server* code of your application (typically in the `app.server.config.ts` script). Angular throws an
 * error if it detects that the token is defined while running on the client.
 *
 * @usageNotes
 *
 * When the same API endpoint is accessed via `http://internal-domain.com:8080` on the server and
 * via `https://external-domain.com` on the client, you can use the following configuration:
 * ```ts
 * // in app.server.config.ts
 * {
 *     provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
 *     useValue: {
 *         'http://internal-domain.com:8080': 'https://external-domain.com'
 *     }
 * }
 * ```
 *
 * @publicApi
 */
const HTTP_TRANSFER_CACHE_ORIGIN_MAP = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'HTTP_TRANSFER_CACHE_ORIGIN_MAP' : '');
/**
 * Keys within cached response data structure.
 */
const BODY = 'b';
const HEADERS = 'h';
const STATUS = 's';
const STATUS_TEXT = 'st';
const REQ_URL = 'u';
const RESPONSE_TYPE = 'rt';
const CACHE_OPTIONS = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '');
/**
 * A list of allowed HTTP methods to cache.
 */
const ALLOWED_METHODS = ['GET', 'HEAD'];
function canUseOrCacheRequest(req, options) {
  const {
    isCacheActive,
    filter,
    includePostRequests,
    includeRequestsWithAuthHeaders,
    includeRequestsWithCredentials,
    includeNonCacheableRequests
  } = options;
  const {
    transferCache: requestOptions,
    method: requestMethod
  } = req;
  if (!isCacheActive || requestOptions === false ||
  // POST requests are allowed either globally or at request level
  requestMethod === 'POST' && !includePostRequests && !requestOptions || requestMethod !== 'POST' && !ALLOWED_METHODS.includes(requestMethod) ||
  // Do not cache requests with authentication or cookie headers unless explicitly enabled.
  !includeRequestsWithAuthHeaders && hasAuthHeaders(req) ||
  // Do not cache requests sent with credentials unless explicitly enabled.
  !includeRequestsWithCredentials && hasOutgoingCredentials(req) ||
  // Do not cache requests that explicitly forbid caching via Cache-Control
  // or Fetch API cache mode unless explicitly enabled.
  !includeNonCacheableRequests && (hasUncacheableCacheControl(req.headers) || isNonCacheableRequest(req.cache)) || filter?.(req) === false) {
    return false;
  }
  return true;
}
function getHeadersToInclude(options, requestOptions) {
  // Request-specific config takes precedence over the global config.
  return typeof requestOptions === 'object' && requestOptions.includeHeaders ? requestOptions.includeHeaders : options.includeHeaders;
}
/**
 * Retrieves the cached response for a given request.
 * @param req The request to retrieve the cached response for.
 * @param options The caching options.
 * @param transferState The transfer state to retrieve the cached response from.
 * @param originMap The origin map to map the request URL to the origin. (Not needed when `storeKey` is provided).
 * @param storeKey The key to use to store the cached response in the transfer state. (If not provided, it will be computed from the request and originMap).
 * @param skipUseCacheChecks Whether to skip the use cache checks. (Only disable when the checks have been performed beforehand).
 */
function retrieveStateFromCache(req, options, transferState, originMap, storeKey, skipUseCacheChecks = false) {
  if (!skipUseCacheChecks && !canUseOrCacheRequest(req, options)) {
    return null;
  }
  if (typeof ngServerMode !== 'undefined' && !ngServerMode && originMap) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2803 /* RuntimeErrorCode.HTTP_ORIGIN_MAP_USED_IN_CLIENT */, wx.__global.ngDevMode && 'Angular detected that the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token is configured and ' + 'present in the client side code. Please ensure that this token is only provided in the ' + 'server code of the application.');
  }
  if (!storeKey) {
    const requestUrl = typeof ngServerMode !== 'undefined' && ngServerMode && originMap ? mapRequestOriginUrl(req.url, originMap) : req.url;
    storeKey = makeCacheKey(req, requestUrl);
  }
  const response = transferState.get(storeKey, null);
  if (!response) {
    return null;
  }
  const {
    [BODY]: undecodedBody,
    [RESPONSE_TYPE]: responseType,
    [HEADERS]: httpHeaders,
    [STATUS]: status,
    [STATUS_TEXT]: statusText,
    [REQ_URL]: url
  } = response;
  // Request found in cache. Respond using it.
  let body = undecodedBody;
  switch (responseType) {
    case 'arraybuffer':
      body = fromBase64(undecodedBody);
      break;
    case 'blob':
      body = new Blob([fromBase64(undecodedBody)]);
      break;
  }
  // We want to warn users accessing a header provided from the cache
  // That HttpTransferCache alters the headers
  // The warning will be logged a single time by HttpHeaders instance
  let headers = new HttpHeaders(httpHeaders);
  if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
    // Append extra logic in dev mode to produce a warning when a header
    // that was not transferred to the client is accessed in the code via `get`
    // and `has` calls.
    const {
      transferCache: requestOptions
    } = req;
    const headersToInclude = getHeadersToInclude(options, requestOptions);
    headers = appendMissingHeadersDetection(req.url, headers, headersToInclude ?? []);
  }
  return new HttpResponse({
    body,
    headers,
    status,
    statusText,
    url
  });
}
function transferCacheInterceptorFn(req, next) {
  const options = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(CACHE_OPTIONS);
  if (!canUseOrCacheRequest(req, options)) {
    return next(req);
  }
  const transferState = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.TransferState);
  const originMap = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(HTTP_TRANSFER_CACHE_ORIGIN_MAP, {
    optional: true
  });
  const requestUrl = typeof ngServerMode !== 'undefined' && ngServerMode && originMap ? mapRequestOriginUrl(req.url, originMap) : req.url;
  const storeKey = makeCacheKey(req, requestUrl);
  const cachedResponse = retrieveStateFromCache(req, options, transferState, /** originMap */null, storeKey, /** skipUseCacheChecks */true);
  if (cachedResponse) {
    return (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.of)(cachedResponse);
  }
  const event$ = next(req);
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // Request not found in cache. Make the request and cache it if on the server.
    return event$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_9__.tap)(event => {
      if (event instanceof HttpResponse) {
        const {
          headers,
          body,
          status,
          statusText
        } = event;
        // Only cache successful HTTP responses that are not non-cacheable.
        if (!options.includeNonCacheableRequests && (hasUncacheableCacheControl(headers) || hasSetCookieHeader(headers))) {
          return;
        }
        const {
          transferCache: requestOptions,
          responseType
        } = req;
        const headersToInclude = getHeadersToInclude(options, requestOptions);
        transferState.set(storeKey, {
          [BODY]: responseType === 'arraybuffer' || responseType === 'blob' ? toBase64(body) : body,
          [HEADERS]: getFilteredHeaders(headers, headersToInclude),
          [STATUS]: status,
          [STATUS_TEXT]: statusText,
          [REQ_URL]: requestUrl,
          [RESPONSE_TYPE]: responseType
        });
      }
    }));
  }
  return event$;
}
/** @returns true when the request contains authentication or cookie headers. */
function hasAuthHeaders(req) {
  const headers = req.headers;
  return headers.has('authorization') || headers.has('proxy-authorization') || headers.has('cookie');
}
const UNCACHEABLE_CACHE_CONTROL_DIRECTIVES = new Set(['no-store', 'private', 'no-cache']);
function hasUncacheableCacheControl(headers) {
  const cacheControl = headers.get('cache-control');
  if (!cacheControl) {
    return false;
  }
  return cacheControl.split(',').some(directive => {
    const directiveName = directive.split('=', 1)[0].trim().toLowerCase();
    return UNCACHEABLE_CACHE_CONTROL_DIRECTIVES.has(directiveName);
  });
}
function hasSetCookieHeader(headers) {
  return headers.has('set-cookie');
}
function isNonCacheableRequest(cache) {
  return cache === 'no-cache' || cache === 'no-store';
}
function hasOutgoingCredentials(req) {
  const {
    withCredentials,
    credentials
  } = req;
  return withCredentials || credentials === 'include' || credentials === 'same-origin';
}
function getFilteredHeaders(headers, includeHeaders) {
  if (!includeHeaders) {
    return {};
  }
  const headersMap = {};
  for (const key of includeHeaders) {
    const values = headers.getAll(key);
    if (values !== null) {
      headersMap[key] = values;
    }
  }
  return headersMap;
}
function sortAndConcatParams(params) {
  const searchParams = new URLSearchParams(params instanceof URLSearchParams ? params : params.toString());
  searchParams.sort();
  return searchParams.toString();
}
function makeCacheKey(request, mappedRequestUrl) {
  const {
    params,
    method,
    responseType
  } = request;
  const encodedParams = sortAndConcatParams(params);
  let serializedBody = request.serializeBody();
  if (serializedBody instanceof URLSearchParams) {
    serializedBody = sortAndConcatParams(serializedBody);
  } else if (typeof serializedBody !== 'string') {
    serializedBody = '';
  }
  // Joining with `|` lets a shifted field boundary (url `/a` + body `b|c` vs url `/a|b` + body `c`)
  // collapse to the same string and thus the same hash. `\0` cannot occur in a valid url or in
  // encoded params, so the field boundaries can't be forged by field content.
  const key = [method, responseType, mappedRequestUrl, serializedBody, encodedParams].join('\0');
  const hash = generateHash(key);
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.makeStateKey)(hash);
}
function toBase64(buffer) {
  //TODO: replace with when is Baseline widely available
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 0x8000; // 32,768 bytes (~32 KB) per chunk, to avoid stack overflow
  let binaryString = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binaryString += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binaryString);
}
function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return bytes.buffer;
}
/**
 * Returns the DI providers needed to enable HTTP transfer cache.
 *
 * By default, when using server rendering, requests are performed twice: once on the server and
 * other one on the browser.
 *
 * When these providers are added, requests performed on the server are cached and reused during the
 * bootstrapping of the application in the browser thus avoiding duplicate requests and reducing
 * load time.
 *
 * @see [Caching data when using HttpClient](guide/ssr#configuring-the-caching-options)
 *
 */
function withHttpTransferCache(cacheOptions) {
  return [{
    provide: CACHE_OPTIONS,
    useFactory: () => {
      ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.performanceMarkFeature)('NgHttpTransferCache');
      return {
        isCacheActive: true,
        ...cacheOptions
      };
    }
  }, {
    provide: HTTP_ROOT_INTERCEPTOR_FNS,
    useValue: transferCacheInterceptorFn,
    multi: true
  }, {
    provide: _angular_core__WEBPACK_IMPORTED_MODULE_2__.APP_BOOTSTRAP_LISTENER,
    multi: true,
    useFactory: () => {
      const appRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationRef);
      const cacheState = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(CACHE_OPTIONS);
      return () => {
        appRef.whenStable().then(() => {
          cacheState.isCacheActive = false;
        });
      };
    }
  }];
}
/**
 * This function will add a proxy to an HttpHeader to intercept calls to get/has
 * and log a warning if the header entry requested has been removed
 */
function appendMissingHeadersDetection(url, headers, headersToInclude) {
  const warningProduced = new Set();
  return new Proxy(headers, {
    get(target, prop) {
      const value = wx.__window.Reflect.get(target, prop);
      const methods = new Set(['get', 'has', 'getAll']);
      if (typeof value !== 'function' || !methods.has(prop)) {
        return value;
      }
      return headerName => {
        // We log when the key has been removed and a warning hasn't been produced for the header
        const key = (prop + ':' + headerName).toLowerCase(); // e.g. `get:cache-control`
        if (!headersToInclude.includes(headerName) && !warningProduced.has(key)) {
          warningProduced.add(key);
          const truncatedUrl = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.truncateMiddle)(url);
          console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.formatRuntimeError)(-2802 /* RuntimeErrorCode.HEADERS_ALTERED_BY_TRANSFER_CACHE */, `Angular detected that the \`${headerName}\` header is accessed, but the value of the header ` + `was not transferred from the server to the client by the HttpTransferCache. ` + `To include the value of the \`${headerName}\` header for the \`${truncatedUrl}\` request, ` + `use the \`includeHeaders\` list. The \`includeHeaders\` can be defined either ` + `on a request level by adding the \`transferCache\` parameter, or on an application ` + `level by adding the \`httpCacheTransfer.includeHeaders\` argument to the ` + `\`provideClientHydration()\` call. `));
        }
        // invoking the original method
        return value.apply(target, [headerName]);
      };
    }
  });
}
function mapRequestOriginUrl(url, originMap) {
  const origin = new URL(url, 'resolve://').origin;
  const mappedOrigin = originMap[origin];
  if (!mappedOrigin) {
    return url;
  }
  if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
    verifyMappedOrigin(mappedOrigin);
  }
  return url.replace(origin, mappedOrigin);
}
function verifyMappedOrigin(url) {
  if (new URL(url, 'resolve://').pathname !== '/') {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(2804 /* RuntimeErrorCode.HTTP_ORIGIN_MAP_CONTAINS_PATH */, 'Angular detected a URL with a path segment in the value provided for the ' + `\`HTTP_TRANSFER_CACHE_ORIGIN_MAP\` token: ${url}. The map should only contain origins ` + 'without any other segments.');
  }
}
/**
 * SHA-256 Constants (first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311):
 */
const SHA256_ROUND_CONSTANTS = /* @__PURE__ */new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
let textEncoder;
/**
 * Generates a SHA-256 hash representation of a string.
 *
 * Note: A custom synchronous SHA-256 implementation is used here because the Web Crypto API
 * (`crypto.subtle.digest`) is strictly asynchronous (Promise-based), whereas the transfer cache
 * state lookup and interceptor flow must operate synchronously due to the HttpResource API.
 *
 * The previous DJB2 hashing logic was vulnerable to pre-image and second-preimage attacks due to
 * its small 64-bit keyspace and mathematical simplicity. An attacker could craft colliding request
 * inputs to poison the cache, potentially causing a CDN or the application to serve the wrong
 * cached response to legitimate users. SHA-256 provides strong cryptographic collision resistance,
 * preventing cache key collision attacks.
 */
function generateHash(value) {
  textEncoder ??= new TextEncoder();
  const inputBytes = textEncoder.encode(value);
  // Initial hash values (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
  let hashState0 = 0x6a09e667;
  let hashState1 = 0xbb67ae85;
  let hashState2 = 0x3c6ef372;
  let hashState3 = 0xa54ff53a;
  let hashState4 = 0x510e527f;
  let hashState5 = 0x9b05688c;
  let hashState6 = 0x1f83d9ab;
  let hashState7 = 0x5be0cd19;
  // Pre-processing (Padding):
  const messageLengthInBits = inputBytes.length * 8;
  // The total length of the padded message must be a multiple of 64 bytes (512 bits)
  const paddedLengthInBytes = (inputBytes.length + 8 >> 6) + 1 << 6;
  const paddedBytes = new Uint8Array(paddedLengthInBytes);
  paddedBytes.set(inputBytes);
  paddedBytes[inputBytes.length] = 0x80; // Append a single '1' bit (0x80 byte)
  const paddedBytesView = new DataView(paddedBytes.buffer);
  const lowBits = messageLengthInBits >>> 0;
  const highBits = messageLengthInBits / 0x100000000 >>> 0;
  paddedBytesView.setUint32(paddedLengthInBytes - 8, highBits, false);
  paddedBytesView.setUint32(paddedLengthInBytes - 4, lowBits, false);
  // Process the message in successive 64-byte chunks:
  const messageSchedule = new Uint32Array(64);
  for (let chunkOffset = 0; chunkOffset < paddedLengthInBytes; chunkOffset += 64) {
    // Initialize first 16 words of the message schedule:
    for (let i = 0; i < 16; i++) {
      messageSchedule[i] = paddedBytesView.getUint32(chunkOffset + i * 4, false);
    }
    // Extend to 64 words:
    for (let i = 16; i < 64; i++) {
      const prevWord15 = messageSchedule[i - 15];
      const sigma0 = ((prevWord15 >>> 7 | prevWord15 << 25) ^ (prevWord15 >>> 18 | prevWord15 << 14) ^ prevWord15 >>> 3) >>> 0;
      const prevWord2 = messageSchedule[i - 2];
      const sigma1 = ((prevWord2 >>> 17 | prevWord2 << 15) ^ (prevWord2 >>> 19 | prevWord2 << 13) ^ prevWord2 >>> 10) >>> 0;
      messageSchedule[i] = messageSchedule[i - 16] + sigma0 + messageSchedule[i - 7] + sigma1 >>> 0;
    }
    // Initialize working variables to current hash values:
    let workingStateA = hashState0;
    let workingStateB = hashState1;
    let workingStateC = hashState2;
    let workingStateD = hashState3;
    let workingStateE = hashState4;
    let workingStateF = hashState5;
    let workingStateG = hashState6;
    let workingStateH = hashState7;
    // Compression function main loop:
    for (let i = 0; i < 64; i++) {
      const capitalSigma1 = ((workingStateE >>> 6 | workingStateE << 26) ^ (workingStateE >>> 11 | workingStateE << 21) ^ (workingStateE >>> 25 | workingStateE << 7)) >>> 0;
      const chFunction = (workingStateE & workingStateF ^ ~workingStateE & workingStateG) >>> 0;
      const temp1 = workingStateH + capitalSigma1 + chFunction + SHA256_ROUND_CONSTANTS[i] + messageSchedule[i] >>> 0;
      const capitalSigma0 = ((workingStateA >>> 2 | workingStateA << 30) ^ (workingStateA >>> 13 | workingStateA << 19) ^ (workingStateA >>> 22 | workingStateA << 10)) >>> 0;
      const majFunction = (workingStateA & workingStateB ^ workingStateA & workingStateC ^ workingStateB & workingStateC) >>> 0;
      const temp2 = capitalSigma0 + majFunction >>> 0;
      workingStateH = workingStateG;
      workingStateG = workingStateF;
      workingStateF = workingStateE;
      workingStateE = workingStateD + temp1 >>> 0;
      workingStateD = workingStateC;
      workingStateC = workingStateB;
      workingStateB = workingStateA;
      workingStateA = temp1 + temp2 >>> 0;
    }
    // Update intermediate hash state:
    hashState0 = hashState0 + workingStateA >>> 0;
    hashState1 = hashState1 + workingStateB >>> 0;
    hashState2 = hashState2 + workingStateC >>> 0;
    hashState3 = hashState3 + workingStateD >>> 0;
    hashState4 = hashState4 + workingStateE >>> 0;
    hashState5 = hashState5 + workingStateF >>> 0;
    hashState6 = hashState6 + workingStateG >>> 0;
    hashState7 = hashState7 + workingStateH >>> 0;
  }
  // Produce the final 64-character hexadecimal hash:
  return [hashState0, hashState1, hashState2, hashState3, hashState4, hashState5, hashState6, hashState7].map(x => x.toString(16).padStart(8, '0')).join('');
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * `httpResource` makes a reactive HTTP request and exposes the request status and response value as
 * a `WritableResource`. By default, it assumes that the backend will return JSON data. To make a
 * request that expects a different kind of data, you can use a sub-constructor of `httpResource`,
 * such as `httpResource.text`.
 *
 * @publicApi 22.0
 * @initializerApiFunction
 */
const httpResource = (() => {
  const jsonFn = makeHttpResourceFn('json');
  jsonFn.arrayBuffer = makeHttpResourceFn('arraybuffer');
  jsonFn.blob = makeHttpResourceFn('blob');
  jsonFn.text = makeHttpResourceFn('text');
  return jsonFn;
})();
function makeHttpResourceFn(responseType) {
  return function httpResource(request, options) {
    if (wx.__global.ngDevMode && !options?.injector) {
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.assertInInjectionContext)(httpResource);
    }
    const injector = options?.injector ?? (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector);
    const cacheOptions = injector.get(CACHE_OPTIONS, null, {
      optional: true
    });
    const transferState = injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_1__.TransferState, null, {
      optional: true
    });
    const originMap = injector.get(HTTP_TRANSFER_CACHE_ORIGIN_MAP, null, {
      optional: true
    });
    const getInitialStream = req => {
      if (cacheOptions && transferState && req) {
        const cachedResponse = retrieveStateFromCache(req, cacheOptions, transferState, originMap);
        if (cachedResponse) {
          try {
            const body = cachedResponse.body;
            const parsed = options?.parse ? options.parse(body) : body;
            return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)({
              value: parsed
            });
          } catch (e) {
            if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
              console.warn(`Angular detected an error while parsing the cached response for the httpResource at \`${req.url}\`. ` + `The resource will fall back to its default value and try again asynchronously.`, e);
            }
          }
        }
      }
      return undefined;
    };
    return new HttpResourceImpl(injector, ctx => normalizeRequest(ctx, request, responseType), options?.defaultValue, options?.debugName, options?.parse, options?.equal, getInitialStream);
  };
}
function normalizeRequest(ctx, request, responseType) {
  let unwrappedRequest = typeof request === 'function' ? request(ctx) : request;
  if (unwrappedRequest === undefined) {
    return undefined;
  } else if (typeof unwrappedRequest === 'string') {
    unwrappedRequest = {
      url: unwrappedRequest
    };
  }
  const headers = unwrappedRequest.headers instanceof HttpHeaders ? unwrappedRequest.headers : new HttpHeaders(unwrappedRequest.headers);
  const params = unwrappedRequest.params instanceof HttpParams ? unwrappedRequest.params : new HttpParams({
    fromObject: unwrappedRequest.params
  });
  return new HttpRequest(unwrappedRequest.method ?? 'GET', unwrappedRequest.url, unwrappedRequest.body ?? null, {
    headers,
    params,
    reportProgress: unwrappedRequest.reportProgress,
    withCredentials: unwrappedRequest.withCredentials,
    keepalive: unwrappedRequest.keepalive,
    cache: unwrappedRequest.cache,
    priority: unwrappedRequest.priority,
    mode: unwrappedRequest.mode,
    redirect: unwrappedRequest.redirect,
    responseType,
    context: unwrappedRequest.context,
    transferCache: unwrappedRequest.transferCache,
    credentials: unwrappedRequest.credentials,
    referrer: unwrappedRequest.referrer,
    referrerPolicy: unwrappedRequest.referrerPolicy,
    integrity: unwrappedRequest.integrity,
    timeout: unwrappedRequest.timeout
  });
}
class HttpResourceImpl extends _angular_core__WEBPACK_IMPORTED_MODULE_3__.ResourceImpl {
  client;
  _headers = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.linkedSignal)({
    ...(wx.__global.ngDevMode ? {
      debugName: "_headers"
    } : /* istanbul ignore next */{}),
    source: this.extRequest,
    computation: () => undefined
  });
  _progress = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.linkedSignal)({
    ...(wx.__global.ngDevMode ? {
      debugName: "_progress"
    } : /* istanbul ignore next */{}),
    source: this.extRequest,
    computation: () => undefined
  });
  _statusCode = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.linkedSignal)({
    ...(wx.__global.ngDevMode ? {
      debugName: "_statusCode"
    } : /* istanbul ignore next */{}),
    source: this.extRequest,
    computation: () => undefined
  });
  headers = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.status() === 'resolved' || this.status() === 'error' ? this._headers() : undefined, /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "headers"
  }] : /* istanbul ignore next */[]));
  progress = this._progress.asReadonly();
  statusCode = this._statusCode.asReadonly();
  constructor(injector, request, defaultValue, debugName, parse, equal, getInitialStream) {
    super(request, ({
      params: request,
      abortSignal
    }) => {
      let sub;
      // In the unlikely case the request returns synchronously we want to make sure the observable
      // is subscribe even if it isn't initialized yet.
      let aborted = false;
      // Track the abort listener so it can be removed if the Observable completes (as a memory
      // optimization).
      const onAbort = () => {
        aborted = true;
        sub?.unsubscribe();
      };
      abortSignal.addEventListener('abort', onAbort);
      // Start off stream as undefined.
      const stream = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)({
        value: undefined
      }, /* @ts-ignore */
      ...(wx.__global.ngDevMode ? [{
        debugName: "stream"
      }] : /* istanbul ignore next */[]));
      let resolve;
      const promise = new wx.__window.Promise(r => resolve = r);
      const send = value => {
        stream.set(value);
        resolve?.(stream);
        resolve = undefined;
      };
      sub = this.client.request(request).subscribe({
        next: event => {
          switch (event.type) {
            case HttpEventType.Response:
              this._headers.set(event.headers);
              this._statusCode.set(event.status);
              try {
                send({
                  value: parse ? parse(event.body) : event.body
                });
              } catch (error) {
                send({
                  error: (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.encapsulateResourceError)(error)
                });
              }
              break;
            case HttpEventType.DownloadProgress:
              this._progress.set(event);
              break;
          }
        },
        error: error => {
          if (error instanceof HttpErrorResponse) {
            this._headers.set(error.headers);
            this._statusCode.set(error.status);
          }
          send({
            error
          });
          abortSignal.removeEventListener('abort', onAbort);
        },
        complete: () => {
          if (resolve) {
            send({
              error: new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(-991 /* ɵRuntimeErrorCode.RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE */, wx.__global.ngDevMode && 'Resource completed before producing a value')
            });
          }
          abortSignal.removeEventListener('abort', onAbort);
        }
      });
      if (aborted) {
        sub.unsubscribe();
      }
      return promise;
    }, defaultValue, equal, debugName, injector, undefined, getInitialStream);
    this.client = injector.get(HttpClient);
  }
  set(value) {
    super.set(value);
    this._headers.set(undefined);
    this._progress.set(undefined);
    this._statusCode.set(undefined);
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
// This file is not used to build this module. It is only used during editing
// by the TypeScript language service and during build for verification. `ngc`
// replaces this file with production index.ts when it rewrites private symbol
// names.

/**
 * Generated bundle index. Do not edit.
 */
;

//# sourceMappingURL=angular-miniprogram-common-http.mjs.map

/***/ },

/***/ 9859
/*!**********************************************************!*\
  !*** ../../dist/fesm2022/angular-miniprogram-common.mjs ***!
  \**********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APP_BASE_HREF: () => (/* binding */ APP_BASE_HREF),
/* harmony export */   AsyncPipe: () => (/* binding */ AsyncPipe),
/* harmony export */   BrowserPlatformLocation: () => (/* binding */ BrowserPlatformLocation),
/* harmony export */   CommonModule: () => (/* binding */ CommonModule),
/* harmony export */   CurrencyPipe: () => (/* binding */ CurrencyPipe),
/* harmony export */   DATE_PIPE_DEFAULT_OPTIONS: () => (/* binding */ DATE_PIPE_DEFAULT_OPTIONS),
/* harmony export */   DATE_PIPE_DEFAULT_TIMEZONE: () => (/* binding */ DATE_PIPE_DEFAULT_TIMEZONE),
/* harmony export */   DOCUMENT: () => (/* reexport safe */ _angular_core__WEBPACK_IMPORTED_MODULE_2__.DOCUMENT),
/* harmony export */   DatePipe: () => (/* binding */ DatePipe),
/* harmony export */   DecimalPipe: () => (/* binding */ DecimalPipe),
/* harmony export */   HashLocationStrategy: () => (/* binding */ HashLocationStrategy),
/* harmony export */   IMAGE_CONFIG: () => (/* reexport safe */ _angular_core__WEBPACK_IMPORTED_MODULE_2__.IMAGE_CONFIG),
/* harmony export */   IMAGE_LOADER: () => (/* binding */ IMAGE_LOADER),
/* harmony export */   JsonPipe: () => (/* binding */ JsonPipe),
/* harmony export */   KeyValuePipe: () => (/* binding */ KeyValuePipe),
/* harmony export */   LOCATION_INITIALIZED: () => (/* binding */ LOCATION_INITIALIZED),
/* harmony export */   Location: () => (/* binding */ Location),
/* harmony export */   LocationStrategy: () => (/* binding */ LocationStrategy),
/* harmony export */   LowerCasePipe: () => (/* binding */ LowerCasePipe),
/* harmony export */   NgClass: () => (/* binding */ NgClass),
/* harmony export */   NgFor: () => (/* binding */ NgForOf),
/* harmony export */   NgForOf: () => (/* binding */ NgForOf),
/* harmony export */   NgForOfContext: () => (/* binding */ NgForOfContext),
/* harmony export */   NgIf: () => (/* binding */ NgIf),
/* harmony export */   NgIfContext: () => (/* binding */ NgIfContext),
/* harmony export */   NgOptimizedImage: () => (/* binding */ NgOptimizedImage),
/* harmony export */   NgPlural: () => (/* binding */ NgPlural),
/* harmony export */   NgPluralCase: () => (/* binding */ NgPluralCase),
/* harmony export */   NgStyle: () => (/* binding */ NgStyle),
/* harmony export */   NgSwitch: () => (/* binding */ NgSwitch),
/* harmony export */   NgSwitchCase: () => (/* binding */ NgSwitchCase),
/* harmony export */   NgSwitchDefault: () => (/* binding */ NgSwitchDefault),
/* harmony export */   NgTemplateOutlet: () => (/* binding */ NgTemplateOutlet),
/* harmony export */   NoTrailingSlashPathLocationStrategy: () => (/* binding */ NoTrailingSlashPathLocationStrategy),
/* harmony export */   PRECONNECT_CHECK_BLOCKLIST: () => (/* binding */ PRECONNECT_CHECK_BLOCKLIST),
/* harmony export */   PathLocationStrategy: () => (/* binding */ PathLocationStrategy),
/* harmony export */   PercentPipe: () => (/* binding */ PercentPipe),
/* harmony export */   PlatformLocation: () => (/* binding */ PlatformLocation),
/* harmony export */   PlatformNavigation: () => (/* binding */ PlatformNavigation),
/* harmony export */   SlicePipe: () => (/* binding */ SlicePipe),
/* harmony export */   TitleCasePipe: () => (/* binding */ TitleCasePipe),
/* harmony export */   TrailingSlashPathLocationStrategy: () => (/* binding */ TrailingSlashPathLocationStrategy),
/* harmony export */   UpperCasePipe: () => (/* binding */ UpperCasePipe),
/* harmony export */   VERSION: () => (/* binding */ VERSION),
/* harmony export */   ViewportScroller: () => (/* binding */ ViewportScroller),
/* harmony export */   XhrFactory: () => (/* binding */ XhrFactory),
/* harmony export */   isPlatformBrowser: () => (/* binding */ isPlatformBrowser),
/* harmony export */   isPlatformServer: () => (/* binding */ isPlatformServer),
/* harmony export */   provideCloudflareLoader: () => (/* binding */ provideCloudflareLoader),
/* harmony export */   provideCloudinaryLoader: () => (/* binding */ provideCloudinaryLoader),
/* harmony export */   provideImageKitLoader: () => (/* binding */ provideImageKitLoader),
/* harmony export */   provideImgixLoader: () => (/* binding */ provideImgixLoader),
/* harmony export */   provideNetlifyLoader: () => (/* binding */ provideNetlifyLoader),
/* harmony export */   "ɵDomAdapter": () => (/* binding */ DomAdapter),
/* harmony export */   "ɵNavigationAdapterForLocation": () => (/* binding */ NavigationAdapterForLocation),
/* harmony export */   "ɵNullViewportScroller": () => (/* binding */ NullViewportScroller),
/* harmony export */   "ɵPLATFORM_BROWSER_ID": () => (/* binding */ PLATFORM_BROWSER_ID),
/* harmony export */   "ɵPLATFORM_SERVER_ID": () => (/* binding */ PLATFORM_SERVER_ID),
/* harmony export */   "ɵPRECOMMIT_HANDLER_SUPPORTED": () => (/* binding */ PRECOMMIT_HANDLER_SUPPORTED),
/* harmony export */   "ɵgetDOM": () => (/* binding */ getDOM),
/* harmony export */   "ɵnormalizeQueryParams": () => (/* binding */ normalizeQueryParams),
/* harmony export */   "ɵparseCookieValue": () => (/* binding */ parseCookieValue),
/* harmony export */   "ɵsetRootDomAdapter": () => (/* binding */ setRootDomAdapter)
/* harmony export */ });
/* harmony import */ var _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/@babel/runtime/helpers/asyncToGenerator.js */ 9436);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 9733);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 9631);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 6631);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 8841);






/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
let _DOM = null;
function getDOM() {
  return _DOM;
}
function setRootDomAdapter(adapter) {
  _DOM ??= adapter;
}
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
class DomAdapter {}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigationPrecommitController
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigateEvent/intercept#precommithandler
 */
const PRECOMMIT_HANDLER_SUPPORTED = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.InjectionToken('', {
  factory: () => {
    return typeof wx.__window !== 'undefined' && typeof wx.__window.NavigationPrecommitController !== 'undefined';
  }
});
/**
 * This class wraps the platform Navigation API which allows server-specific and test
 * implementations.
 *
 * Browser support is limited, so this API may not be available in all environments,
 * may contain bugs, and is experimental.
 *
 * @experimental 21.0.0
 */
class PlatformNavigation {
  static ɵfac = function PlatformNavigation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PlatformNavigation)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: PlatformNavigation,
    factory: () => (() => wx.__window.navigation)(),
    providedIn: 'platform'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(PlatformNavigation, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'platform',
      useFactory: () => wx.__window.navigation
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
 * Joins two parts of a URL with a slash if needed.
 *
 * @param start  URL string
 * @param end    URL string
 *
 *
 * @returns The joined URL string.
 */
function joinWithSlash(start, end) {
  // If `start` is an empty string, return `end` as the result.
  if (!start) return end;
  // If `end` is an empty string, return `start` as the result.
  if (!end) return start;
  // If `start` ends with a slash, remove the leading slash from `end`.
  if (start.endsWith('/')) {
    return end.startsWith('/') ? start + end.slice(1) : start + end;
  }
  // If `start` doesn't end with a slash, add one if `end` doesn't start with a slash.
  return end.startsWith('/') ? start + end : `${start}/${end}`;
}
/**
 * Removes a trailing slash from a URL string if needed.
 * Looks for the first occurrence of either `#`, `?`, or the end of the
 * line as `/` characters and removes the trailing slash if one exists.
 *
 * @param url URL string.
 *
 * @returns The URL string, modified if needed.
 */
function stripTrailingSlash(url) {
  // Find the index of the first occurrence of `#`, `?`, or the end of the string.
  // This marks the start of the query string, fragment, or the end of the URL path.
  const pathEndIdx = url.search(/#|\?|$/);
  // Check if the character before `pathEndIdx` is a trailing slash.
  // If it is, remove the trailing slash and return the modified URL.
  // Otherwise, return the URL as is.
  return url[pathEndIdx - 1] === '/' ? url.slice(0, pathEndIdx - 1) + url.slice(pathEndIdx) : url;
}
/**
 * Normalizes URL parameters by prepending with `?` if needed.
 *
 * @param  params String of URL parameters.
 *
 * @returns The normalized URL parameters string.
 */
function normalizeQueryParams(params) {
  return params && params[0] !== '?' ? `?${params}` : params;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * `PlatformLocation` encapsulates all calls to DOM APIs, which allows the Router to be
 * platform-agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms that Angular supports. For example, `@angular/platform-browser` provides an
 * implementation specific to the browser environment, while `@angular/platform-server` provides
 * one suitable for use with server-side rendering.
 *
 * The `PlatformLocation` class is used directly by all implementations of {@link LocationStrategy}
 * when they need to interact with the DOM APIs like pushState, popState, etc.
 *
 * {@link LocationStrategy} in turn is used by the {@link Location} service which is used directly
 * by the {@link /api/router/Router Router} in order to navigate between routes. Since all interactions between
 * {@link /api/router/Router Router} /
 * {@link Location} / {@link LocationStrategy} and DOM APIs flow through the `PlatformLocation`
 * class, they are all platform-agnostic.
 *
 * @publicApi
 */
class PlatformLocation {
  historyGo(relativePosition) {
    throw new Error(wx.__global.ngDevMode ? 'Not implemented' : '');
  }
  static ɵfac = function PlatformLocation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PlatformLocation)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: PlatformLocation,
    factory: () => (() => (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(BrowserPlatformLocation))(),
    providedIn: 'platform'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(PlatformLocation, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'platform',
      useFactory: () => (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(BrowserPlatformLocation)
    }]
  }], null, null);
})();
/**
 * @description
 * Indicates when a location is initialized.
 *
 * @publicApi
 */
const LOCATION_INITIALIZED = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'Location Initialized' : '');
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * @publicApi
 */
class BrowserPlatformLocation extends PlatformLocation {
  _location;
  _history;
  _doc = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.DOCUMENT);
  constructor() {
    super();
    this._location = wx.__window.location;
    this._history = wx.__window.history;
  }
  getBaseHrefFromDOM() {
    return getDOM().getBaseHref(this._doc);
  }
  onPopState(fn) {
    const window = getDOM().getGlobalEventTarget(this._doc, 'window');
    window.addEventListener('popstate', fn, false);
    return () => window.removeEventListener('popstate', fn);
  }
  onHashChange(fn) {
    const window = getDOM().getGlobalEventTarget(this._doc, 'window');
    window.addEventListener('hashchange', fn, false);
    return () => window.removeEventListener('hashchange', fn);
  }
  get href() {
    return this._location.href;
  }
  get protocol() {
    return this._location.protocol;
  }
  get hostname() {
    return this._location.hostname;
  }
  get port() {
    return this._location.port;
  }
  get pathname() {
    return this._location.pathname;
  }
  get search() {
    return this._location.search;
  }
  get hash() {
    return this._location.hash;
  }
  set pathname(newPath) {
    this._location.pathname = newPath;
  }
  pushState(state, title, url) {
    this._history.pushState(state, title, url);
  }
  replaceState(state, title, url) {
    this._history.replaceState(state, title, url);
  }
  forward() {
    this._history.forward();
  }
  back() {
    this._history.back();
  }
  historyGo(relativePosition = 0) {
    this._history.go(relativePosition);
  }
  getState() {
    return this._history.state;
  }
  static ɵfac = function BrowserPlatformLocation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BrowserPlatformLocation)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: BrowserPlatformLocation,
    factory: () => (() => new BrowserPlatformLocation())(),
    providedIn: 'platform'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(BrowserPlatformLocation, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'platform',
      useFactory: () => new BrowserPlatformLocation()
    }]
  }], () => [], null);
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Enables the `Location` service to read route state from the browser's URL.
 * Angular provides two strategies:
 * `HashLocationStrategy` and `PathLocationStrategy`.
 *
 * Applications should use the `Router` or `Location` services to
 * interact with application route state.
 *
 * For instance, `HashLocationStrategy` produces URLs like
 * <code class="no-auto-link">http://example.com/#/foo</code>,
 * and `PathLocationStrategy` produces
 * <code class="no-auto-link">http://example.com/foo</code> as an equivalent URL.
 *
 * See these two classes for more.
 *
 * @publicApi
 */
class LocationStrategy {
  historyGo(relativePosition) {
    throw new Error(wx.__global.ngDevMode ? 'Not implemented' : '');
  }
  static ɵfac = function LocationStrategy_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LocationStrategy)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: LocationStrategy,
    factory: () => (() => (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(PathLocationStrategy))(),
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(LocationStrategy, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'root',
      useFactory: () => (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(PathLocationStrategy)
    }]
  }], null, null);
})();
/**
 * A predefined DI token for the base href
 * to be used with the `PathLocationStrategy`.
 * The base href is the URL prefix that should be preserved when generating
 * and recognizing URLs.
 *
 * @usageNotes
 *
 * The following example shows how to use this token to configure the root app injector
 * with a base href value, so that the DI framework can supply the dependency anywhere in the app.
 *
 * ```ts
 * import {NgModule} from '@angular/core';
 * import {APP_BASE_HREF} from 'angular-miniprogram/common';
 *
 * @NgModule({
 *   providers: [{provide: APP_BASE_HREF, useValue: '/my/app'}]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
const APP_BASE_HREF = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'appBaseHref' : '');
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you may provide a {@link APP_BASE_HREF}
 * or add a `<base href>` element to the document to override the default.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app/'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`. To ensure all relative URIs resolve correctly,
 * the `<base href>` and/or `APP_BASE_HREF` should end with a `/`.
 *
 * Similarly, if you add `<base href='/my/app/'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * Note that when using `PathLocationStrategy`, neither the query nor
 * the fragment in the `<base href>` will be preserved, as outlined
 * by the [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2).
 *
 * To ensure that trailing slashes are always present or never present in the URL, use
 * {@link TrailingSlashPathLocationStrategy} or {@link NoTrailingSlashPathLocationStrategy}.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
class PathLocationStrategy extends LocationStrategy {
  _platformLocation;
  _baseHref;
  _removeListenerFns = [];
  constructor(_platformLocation, href) {
    super();
    this._platformLocation = _platformLocation;
    this._baseHref = href ?? this._platformLocation.getBaseHrefFromDOM() ?? (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.DOCUMENT).location?.origin ?? '';
  }
  /** @docs-private */
  ngOnDestroy() {
    while (this._removeListenerFns.length) {
      this._removeListenerFns.pop()();
    }
  }
  onPopState(fn) {
    this._removeListenerFns.push(this._platformLocation.onPopState(fn), this._platformLocation.onHashChange(fn));
  }
  getBaseHref() {
    return this._baseHref;
  }
  prepareExternalUrl(internal) {
    return joinWithSlash(this._baseHref, internal);
  }
  path(includeHash = false) {
    const pathname = this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
    const hash = this._platformLocation.hash;
    return hash && includeHash ? `${pathname}${hash}` : pathname;
  }
  pushState(state, title, url, queryParams) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.pushState(state, title, externalUrl);
  }
  replaceState(state, title, url, queryParams) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.replaceState(state, title, externalUrl);
  }
  forward() {
    this._platformLocation.forward();
  }
  back() {
    this._platformLocation.back();
  }
  getState() {
    return this._platformLocation.getState();
  }
  historyGo(relativePosition = 0) {
    this._platformLocation.historyGo?.(relativePosition);
  }
  static ɵfac = function PathLocationStrategy_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || PathLocationStrategy)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](PlatformLocation), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](APP_BASE_HREF, 8));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: PathLocationStrategy,
    factory: PathLocationStrategy.ɵfac,
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(PathLocationStrategy, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'root'
    }]
  }], () => [{
    type: PlatformLocation
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [APP_BASE_HREF]
    }]
  }], null);
})();
/**
 * A `LocationStrategy` that ensures URLs never have a trailing slash.
 * This strategy only affects the URL written to the browser.
 * `Location.path()` and `Location.normalize()` will continue to strip trailing slashes when reading the URL.
 *
 * @publicApi
 */
class NoTrailingSlashPathLocationStrategy extends PathLocationStrategy {
  prepareExternalUrl(internal) {
    const path = extractUrlPath(internal);
    if (path.endsWith('/') && path.length > 1) {
      internal = path.slice(0, -1) + internal.slice(path.length);
    }
    return super.prepareExternalUrl(internal);
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵNoTrailingSlashPathLocationStrategy_BaseFactory;
    return function NoTrailingSlashPathLocationStrategy_Factory(__ngFactoryType__) {
      return (ɵNoTrailingSlashPathLocationStrategy_BaseFactory || (ɵNoTrailingSlashPathLocationStrategy_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetInheritedFactory"](NoTrailingSlashPathLocationStrategy)))(__ngFactoryType__ || NoTrailingSlashPathLocationStrategy);
    };
  })();
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: NoTrailingSlashPathLocationStrategy,
    factory: NoTrailingSlashPathLocationStrategy.ɵfac,
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NoTrailingSlashPathLocationStrategy, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'root'
    }]
  }], null, null);
})();
/**
 * A `LocationStrategy` that ensures URLs always have a trailing slash.
 * This strategy only affects the URL written to the browser.
 * `Location.path()` and `Location.normalize()` will continue to strip trailing slashes when reading the URL.
 *
 * @publicApi
 */
class TrailingSlashPathLocationStrategy extends PathLocationStrategy {
  prepareExternalUrl(internal) {
    const path = extractUrlPath(internal);
    if (!path.endsWith('/')) {
      internal = path + '/' + internal.slice(path.length);
    }
    return super.prepareExternalUrl(internal);
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵTrailingSlashPathLocationStrategy_BaseFactory;
    return function TrailingSlashPathLocationStrategy_Factory(__ngFactoryType__) {
      return (ɵTrailingSlashPathLocationStrategy_BaseFactory || (ɵTrailingSlashPathLocationStrategy_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetInheritedFactory"](TrailingSlashPathLocationStrategy)))(__ngFactoryType__ || TrailingSlashPathLocationStrategy);
    };
  })();
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: TrailingSlashPathLocationStrategy,
    factory: TrailingSlashPathLocationStrategy.ɵfac,
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(TrailingSlashPathLocationStrategy, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'root'
    }]
  }], null, null);
})();
function extractUrlPath(url) {
  const questionMarkOrHashIndex = url.search(/[?#]/);
  const pathEnd = questionMarkOrHashIndex > -1 ? questionMarkOrHashIndex : url.length;
  return url.slice(0, pathEnd);
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
 * A service that applications can use to interact with a browser's URL.
 *
 * Depending on the `LocationStrategy` used, `Location` persists
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
 *
 * It's better to use the `Router.navigate()` service to trigger route changes. Use
 * `Location` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `Location` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
class Location {
  /** @internal */
  _subject = new rxjs__WEBPACK_IMPORTED_MODULE_5__.Subject();
  /** @internal */
  _basePath;
  /** @internal */
  _locationStrategy;
  /** @internal */
  _urlChangeListeners = [];
  /** @internal */
  _urlChangeSubscription = null;
  constructor(locationStrategy) {
    this._locationStrategy = locationStrategy;
    const baseHref = this._locationStrategy.getBaseHref();
    // Note: This class's interaction with base HREF does not fully follow the rules
    // outlined in the spec https://www.freesoft.org/CIE/RFC/1808/18.htm.
    // Instead of trying to fix individual bugs with more and more code, we should
    // investigate using the URL constructor and providing the base as a second
    // argument.
    // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#parameters
    this._basePath = _stripOrigin(stripTrailingSlash(_stripIndexHtml(baseHref)));
    this._locationStrategy.onPopState(ev => {
      const popStateEvent = {
        'url': this.path(true),
        'pop': true,
        'state': ev.state,
        'type': ev.type
      };
      if (ev.hasUAVisualTransition) {
        popStateEvent.hasUAVisualTransition = true;
      }
      this._subject.next(popStateEvent);
    });
  }
  /** @docs-private */
  ngOnDestroy() {
    this._urlChangeSubscription?.unsubscribe();
    this._urlChangeListeners = [];
  }
  /**
   * Normalizes the URL path for this location.
   *
   * @param includeHash True to include an anchor fragment in the path.
   *
   * @returns The normalized URL path.
   */
  // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
  // removed.
  path(includeHash = false) {
    return this.normalize(this._locationStrategy.path(includeHash));
  }
  /**
   * Reports the current state of the location history.
   * @returns The current value of the `history.state` object.
   */
  getState() {
    return this._locationStrategy.getState();
  }
  /**
   * Normalizes the given path and compares to the current normalized path.
   *
   * @param path The given URL path.
   * @param query Query parameters.
   *
   * @returns True if the given URL path is equal to the current normalized path, false
   * otherwise.
   */
  isCurrentPathEqualTo(path, query = '') {
    return this.path() == this.normalize(path + normalizeQueryParams(query));
  }
  /**
   * Normalizes a URL path by stripping any trailing slashes.
   *
   * @param url String representing a URL.
   *
   * @returns The normalized URL string.
   */
  normalize(url) {
    return Location.stripTrailingSlash(_stripBasePath(this._basePath, _stripIndexHtml(url)));
  }
  /**
   * Normalizes an external URL path.
   * If the given URL doesn't begin with a leading slash (`'/'`), adds one
   * before normalizing. Adds a hash if `HashLocationStrategy` is
   * in use, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
   *
   * @param url String representing a URL.
   *
   * @returns  A normalized platform-specific URL.
   */
  prepareExternalUrl(url) {
    if (url && url[0] !== '/') {
      url = '/' + url;
    }
    return this._locationStrategy.prepareExternalUrl(url);
  }
  // TODO: rename this method to pushState
  /**
   * Changes the browser's URL to a normalized version of a given URL, and pushes a
   * new item onto the platform's history.
   *
   * @param path  URL path to normalize.
   * @param query Query parameters.
   * @param state Location history state.
   *
   */
  go(path, query = '', state = null) {
    this._locationStrategy.pushState(state, '', path, query);
    this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
  }
  /**
   * Changes the browser's URL to a normalized version of the given URL, and replaces
   * the top item on the platform's history stack.
   *
   * @param path  URL path to normalize.
   * @param query Query parameters.
   * @param state Location history state.
   */
  replaceState(path, query = '', state = null) {
    this._locationStrategy.replaceState(state, '', path, query);
    this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
  }
  /**
   * Navigates forward in the platform's history.
   */
  forward() {
    this._locationStrategy.forward();
  }
  /**
   * Navigates back in the platform's history.
   */
  back() {
    this._locationStrategy.back();
  }
  /**
   * Navigate to a specific page from session history, identified by its relative position to the
   * current page.
   *
   * @param relativePosition  Position of the target page in the history relative to the current
   *     page.
   * A negative value moves backwards, a positive value moves forwards, e.g. `location.historyGo(2)`
   * moves forward two pages and `location.historyGo(-2)` moves back two pages. When we try to go
   * beyond what's stored in the history session, we stay in the current page. Same behaviour occurs
   * when `relativePosition` equals 0.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/History_API#Moving_to_a_specific_point_in_history
   */
  historyGo(relativePosition = 0) {
    this._locationStrategy.historyGo?.(relativePosition);
  }
  /**
   * Registers a URL change listener. Use to catch updates performed by the Angular
   * framework that are not detectible through "popstate" or "hashchange" events.
   *
   * @param fn The change handler function, which take a URL and a location history state.
   * @returns A function that, when executed, unregisters a URL change listener.
   */
  onUrlChange(fn) {
    this._urlChangeListeners.push(fn);
    this._urlChangeSubscription ??= this.subscribe(v => {
      this._notifyUrlChangeListeners(v.url, v.state);
    });
    return () => {
      const fnIndex = this._urlChangeListeners.indexOf(fn);
      this._urlChangeListeners.splice(fnIndex, 1);
      if (this._urlChangeListeners.length === 0) {
        this._urlChangeSubscription?.unsubscribe();
        this._urlChangeSubscription = null;
      }
    };
  }
  /** @internal */
  _notifyUrlChangeListeners(url = '', state) {
    this._urlChangeListeners.forEach(fn => fn(url, state));
  }
  /**
   * Subscribes to the platform's `popState` events.
   *
   * Note: `Location.go()` does not trigger the `popState` event in the browser. Use
   * `Location.onUrlChange()` to subscribe to URL changes instead.
   *
   * @param value Event that is triggered when the state history changes.
   * @param exception The exception to throw.
   *
   * @see [onpopstate](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate)
   *
   * @returns Subscribed events.
   */
  subscribe(onNext, onThrow, onReturn) {
    return this._subject.subscribe({
      next: onNext,
      error: onThrow ?? undefined,
      complete: onReturn ?? undefined
    });
  }
  /**
   * Normalizes URL parameters by prepending with `?` if needed.
   *
   * @param  params String of URL parameters.
   *
   * @returns The normalized URL parameters string.
   */
  static normalizeQueryParams = normalizeQueryParams;
  /**
   * Joins two parts of a URL with a slash if needed.
   *
   * @param start  URL string
   * @param end    URL string
   *
   *
   * @returns The joined URL string.
   */
  static joinWithSlash = joinWithSlash;
  /**
   * Removes a trailing slash from a URL string if needed.
   * Looks for the first occurrence of either `#`, `?`, or the end of the
   * line as `/` characters and removes the trailing slash if one exists.
   *
   * @param url URL string.
   *
   * @returns The URL string, modified if needed.
   */
  static stripTrailingSlash = stripTrailingSlash;
  static ɵfac = function Location_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || Location)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](LocationStrategy));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: Location,
    factory: () => createLocation(),
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(Location, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'root',
      // See #23917
      useFactory: createLocation
    }]
  }], () => [{
    type: LocationStrategy
  }], null);
})();
function createLocation() {
  return new Location((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"])(LocationStrategy));
}
function _stripBasePath(basePath, url) {
  if (!basePath || !url.startsWith(basePath)) {
    return url;
  }
  const strippedUrl = url.substring(basePath.length);
  if (strippedUrl === '' || ['/', ';', '?', '#'].includes(strippedUrl[0])) {
    return strippedUrl;
  }
  return url;
}
function _stripIndexHtml(url) {
  return url.replace(/\/index\.html$/, '');
}
function _stripOrigin(baseHref) {
  // DO NOT REFACTOR! Previously, this check looked like this:
  // `/^(https?:)?\/\//.test(baseHref)`, but that resulted in
  // syntactically incorrect code after Closure Compiler minification.
  // This was likely caused by a bug in Closure Compiler, but
  // for now, the check is rewritten to use `new RegExp` instead.
  const isAbsoluteUrl = new RegExp('^(https?:)?//').test(baseHref);
  if (isAbsoluteUrl) {
    const [, pathname] = baseHref.split(/\/\/[^\/]+/);
    return pathname;
  }
  return baseHref;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A `Location` implementation that uses the browser's `Navigation` API.
 *
 * This class is an adapter that maps the methods of the `Location` service to the newer
 * browser `Navigation` API. It is used when the `Navigation` API is available.
 *
 * This adapter uses `navigation.navigate()` for `go` and `replaceState` to ensure a single source
 * of truth for the navigation state. The Navigation API's state and `history.state` are separate.
 *
 * Note that `navigation.back()` and `navigation.forward()` can differ from the traditional
 * `history` API in how they traverse the joint session history.
 *
 * @see {@link Location}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
 */
class NavigationAdapterForLocation extends Location {
  navigation = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(PlatformNavigation);
  destroyRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.DestroyRef);
  constructor() {
    super((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(LocationStrategy));
    this.registerNavigationListeners();
  }
  registerNavigationListeners() {
    const currentEntryChangeListener = () => {
      this._notifyUrlChangeListeners(this.path(true), this.getState());
    };
    this.navigation.addEventListener('currententrychange', currentEntryChangeListener);
    this.destroyRef.onDestroy(() => {
      this.navigation.removeEventListener('currententrychange', currentEntryChangeListener);
    });
  }
  getState() {
    return this.navigation.currentEntry?.getState();
  }
  replaceState(path, query = '', state = null) {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(query));
    // Use navigation API consistently for navigations. The "navigation API state"
    // field has no interaction with the existing "serialized state" field, which is what backs history.state
    this.navigation.navigate(url, {
      state,
      history: 'replace'
    });
  }
  go(path, query = '', state = null) {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(query));
    // Use navigation API consistently for navigations. The "navigation API state"
    // field has no interaction with the existing "serialized state" field, which is what backs history.state
    this.navigation.navigate(url, {
      state,
      history: 'push'
    });
  }
  // Navigation.back/forward differs from history in how it traverses the joint session history
  // https://github.com/WICG/navigation-api?tab=readme-ov-file#correspondence-with-the-joint-session-history
  back() {
    this.navigation.back();
  }
  forward() {
    this.navigation.forward();
  }
  onUrlChange(fn) {
    this._urlChangeListeners.push(fn);
    return () => {
      const fnIndex = this._urlChangeListeners.indexOf(fn);
      this._urlChangeListeners.splice(fnIndex, 1);
    };
  }
  static ɵfac = function NavigationAdapterForLocation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NavigationAdapterForLocation)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: NavigationAdapterForLocation,
    factory: NavigationAdapterForLocation.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NavigationAdapterForLocation, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable
  }], () => [], null);
})();

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
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/hash_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
class HashLocationStrategy extends LocationStrategy {
  _platformLocation;
  _baseHref = '';
  _removeListenerFns = [];
  constructor(_platformLocation, _baseHref) {
    super();
    this._platformLocation = _platformLocation;
    if (_baseHref != null) {
      this._baseHref = _baseHref;
    }
  }
  /** @docs-private */
  ngOnDestroy() {
    while (this._removeListenerFns.length) {
      this._removeListenerFns.pop()();
    }
  }
  onPopState(fn) {
    this._removeListenerFns.push(this._platformLocation.onPopState(fn), this._platformLocation.onHashChange(fn));
  }
  getBaseHref() {
    return this._baseHref;
  }
  path(includeHash = false) {
    // the hash value is always prefixed with a `#`
    // and if it is empty then it will stay empty
    const path = this._platformLocation.hash ?? '#';
    return path.length > 0 ? path.substring(1) : path;
  }
  prepareExternalUrl(internal) {
    const url = joinWithSlash(this._baseHref, internal);
    return url.length > 0 ? '#' + url : url;
  }
  pushState(state, title, path, queryParams) {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams)) || this._platformLocation.pathname;
    this._platformLocation.pushState(state, title, url);
  }
  replaceState(state, title, path, queryParams) {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams)) || this._platformLocation.pathname;
    this._platformLocation.replaceState(state, title, url);
  }
  forward() {
    this._platformLocation.forward();
  }
  back() {
    this._platformLocation.back();
  }
  getState() {
    return this._platformLocation.getState();
  }
  historyGo(relativePosition = 0) {
    this._platformLocation.historyGo?.(relativePosition);
  }
  static ɵfac = function HashLocationStrategy_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || HashLocationStrategy)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](PlatformLocation), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](APP_BASE_HREF, 8));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: HashLocationStrategy,
    factory: HashLocationStrategy.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(HashLocationStrategy, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable
  }], () => [{
    type: PlatformLocation
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [APP_BASE_HREF]
    }]
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
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
function parseCookieValue(cookieStr, name) {
  name = encodeURIComponent(name);
  for (const cookie of cookieStr.split(';')) {
    const eqIndex = cookie.indexOf('=');
    const [cookieName, cookieValue] = eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
    if (cookieName.trim() !== name) {
      continue;
    }
    let value = cookieValue;
    try {
      value = decodeURIComponent(cookieValue);
    } catch {
      // Fall back to raw cookie value if decoding fails (e.g. malformed percent-encoding).
    }
    if (value.length > 1 && value[0] === '"' && value[value.length - 1] === '"') {
      value = value.slice(1, -1);
    }
    return value;
  }
  return null;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const WS_REGEXP = /\s+/;
const EMPTY_ARRAY = [];
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```html
 * <some-element [ngClass]="stringExp|arrayExp|objExp|Set">...</some-element>
 *
 * <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * For more simple use cases you can use the [class bindings](/guide/templates/binding#css-class-and-style-property-bindings) directly.
 * It doesn't require importing a directive.
 *
 * ```html
 * <some-element [class]="'first second'">...</some-element>
 *
 * <some-element [class.expanded]="isExpanded">...</some-element>
 *
 * <some-element [class]="['first', 'second']">...</some-element>
 *
 * <some-element [class]="{'first': true, 'second': true, 'third': false}">...</some-element>
 * ```
 * @description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 *
 * @see [Class bindings](/guide/templates/binding#css-class-and-style-property-bindings)
 *
 * @publicApi
 */
class NgClass {
  _ngEl;
  _renderer;
  initialClasses = EMPTY_ARRAY;
  rawClass;
  stateMap = new Map();
  constructor(_ngEl, _renderer) {
    this._ngEl = _ngEl;
    this._renderer = _renderer;
  }
  set klass(value) {
    this.initialClasses = value != null ? value.trim().split(WS_REGEXP) : EMPTY_ARRAY;
  }
  set ngClass(value) {
    this.rawClass = typeof value === 'string' ? value.trim().split(WS_REGEXP) : value;
  }
  /*
  The NgClass directive uses the custom change detection algorithm for its inputs. The custom
  algorithm is necessary since inputs are represented as complex object or arrays that need to be
  deeply-compared.
     This algorithm is perf-sensitive since NgClass is used very frequently and its poor performance
  might negatively impact runtime performance of the entire change detection cycle. The design of
  this algorithm is making sure that:
  - there is no unnecessary DOM manipulation (CSS classes are added / removed from the DOM only when
  needed), even if references to bound objects change;
  - there is no memory allocation if nothing changes (even relatively modest memory allocation
  during the change detection cycle can result in GC pauses for some of the CD cycles).
     The algorithm works by iterating over the set of bound classes, staring with [class] binding and
  then going over [ngClass] binding. For each CSS class name:
  - check if it was seen before (this information is tracked in the state map) and if its value
  changed;
  - mark it as "touched" - names that are not marked are not present in the latest set of binding
  and we can remove such class name from the internal data structures;
     After iteration over all the CSS class names we've got data structure with all the information
  necessary to synchronize changes to the DOM - it is enough to iterate over the state map, flush
  changes to the DOM and reset internal data structures so those are ready for the next change
  detection cycle.
   */
  ngDoCheck() {
    // classes from the [class] binding
    for (const klass of this.initialClasses) {
      this._updateState(klass, true);
    }
    // classes from the [ngClass] binding
    const rawClass = this.rawClass;
    if (Array.isArray(rawClass) || rawClass instanceof Set) {
      for (const klass of rawClass) {
        this._updateState(klass, true);
      }
    } else if (rawClass != null) {
      for (const klass of Object.keys(rawClass)) {
        this._updateState(klass, Boolean(rawClass[klass]));
      }
    }
    this._applyStateDiff();
  }
  _updateState(klass, nextEnabled) {
    const state = this.stateMap.get(klass);
    if (state !== undefined) {
      if (state.enabled !== nextEnabled) {
        state.changed = true;
        state.enabled = nextEnabled;
      }
      state.touched = true;
    } else {
      this.stateMap.set(klass, {
        enabled: nextEnabled,
        changed: true,
        touched: true
      });
    }
  }
  _applyStateDiff() {
    for (const stateEntry of this.stateMap) {
      const klass = stateEntry[0];
      const state = stateEntry[1];
      if (state.changed) {
        this._toggleClass(klass, state.enabled);
        state.changed = false;
      } else if (!state.touched) {
        // A class that was previously active got removed from the new collection of classes -
        // remove from the DOM as well.
        if (state.enabled) {
          this._toggleClass(klass, false);
        }
        this.stateMap.delete(klass);
      }
      state.touched = false;
    }
  }
  _toggleClass(klass, enabled) {
    if (wx.__global.ngDevMode) {
      if (typeof klass !== 'string') {
        throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${(0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.stringify)(klass)}`);
      }
    }
    klass = klass.trim();
    if (klass.length > 0) {
      klass.split(WS_REGEXP).forEach(klass => {
        if (enabled) {
          this._renderer.addClass(this._ngEl.nativeElement, klass);
        } else {
          this._renderer.removeClass(this._ngEl.nativeElement, klass);
        }
      });
    }
  }
  static ɵfac = function NgClass_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgClass)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ElementRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.Renderer2));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgClass,
    selectors: [["", "ngClass", ""]],
    inputs: {
      klass: [0, "class", "klass"],
      ngClass: "ngClass"
    }
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgClass, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngClass]'
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.ElementRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Renderer2
  }], {
    klass: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: ['class']
    }],
    ngClass: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: ['ngClass']
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
/**
 * @publicApi
 *
 * @deprecated 20.0
 * The `ngFor` directive is deprecated. Use the `@for` block instead.
 */
class NgForOfContext {
  $implicit;
  ngForOf;
  index;
  count;
  __templateName;
  constructor(/** Reference to the current item from the collection. */
  $implicit,
  /**
   * The value of the iterable expression. Useful when the expression is
   * more complex then a property access, for example when using the async pipe
   * (`userStreams | async`).
   */
  ngForOf, /** Returns an index of the current item in the collection. */
  index, /** Returns total amount of items in the collection. */
  count, __templateName) {
    this.$implicit = $implicit;
    this.ngForOf = ngForOf;
    this.index = index;
    this.count = count;
    this.__templateName = __templateName;
  }
  // Indicates whether this is the first item in the collection.
  get first() {
    return this.index === 0;
  }
  // Indicates whether this is the last item in the collection.
  get last() {
    return this.index === this.count - 1;
  }
  // Indicates whether an index of this item in the collection is even.
  get even() {
    return this.index % 2 === 0;
  }
  // Indicates whether an index of this item in the collection is odd.
  get odd() {
    return !this.even;
  }
}
/**
 * A [structural directive](guide/directives/structural-directives) that renders
 * a template for each item in a collection.
 * The directive is placed on an element, which becomes the parent
 * of the cloned templates.
 *
 * The `ngForOf` directive is generally used in the
 * [shorthand form](guide/directives/structural-directives#structural-directive-shorthand) `*ngFor`.
 * In this form, the template to be rendered for each iteration is the content
 * of an anchor element containing the directive.
 *
 * The following example shows the shorthand syntax with some options,
 * contained in an `<li>` element.
 *
 * ```html
 * <li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>
 * ```
 *
 * The shorthand form expands into a long form that uses the `ngForOf` selector
 * on an `<ng-template>` element.
 * The content of the `<ng-template>` element is the `<li>` element that held the
 * short-form directive.
 *
 * Here is the expanded version of the short-form example.
 *
 * ```html
 * <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
 *   <li>...</li>
 * </ng-template>
 * ```
 *
 * Angular automatically expands the shorthand syntax as it compiles the template.
 * The context for each embedded view is logically merged to the current component
 * context according to its lexical position.
 *
 * When using the shorthand syntax, Angular allows only [one structural directive
 * on an element](guide/directives/structural-directives#one-structural-directive-per-element).
 * If you want to iterate conditionally, for example,
 * put the `*ngIf` on a container element that wraps the `*ngFor` element.
 * For further discussion, see
 * [Structural Directives](guide/directives/structural-directives#one-structural-directive-per-element).
 *
 * @usageNotes
 *
 * ### Local variables
 *
 * `NgForOf` provides exported values that can be aliased to local variables.
 * For example:
 *
 *  ```html
 * <li *ngFor="let user of users; index as i; first as isFirst">
 *    {{i}}/{{users.length}}. {{user}} <span *ngIf="isFirst">default</span>
 * </li>
 * ```
 *
 * The following exported values can be aliased to local variables:
 *
 * - `$implicit: T`: The value of the individual items in the iterable (`ngForOf`).
 * - `ngForOf: NgIterable<T>`: The value of the iterable expression. Useful when the expression is
 * more complex then a property access, for example when using the async pipe (`userStreams |
 * async`).
 * - `index: number`: The index of the current item in the iterable.
 * - `count: number`: The length of the iterable.
 * - `first: boolean`: True when the item is the first item in the iterable.
 * - `last: boolean`: True when the item is the last item in the iterable.
 * - `even: boolean`: True when the item has an even index in the iterable.
 * - `odd: boolean`: True when the item has an odd index in the iterable.
 *
 * ### Change propagation
 *
 * When the contents of the iterator changes, `NgForOf` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls that are present, such as `<input>` elements that accept user input. Inserted rows can
 * be animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state
 * such as user input.
 * For more on animations, see [Transitions and Triggers](guide/legacy-animations/transition-and-triggers).
 *
 * The identities of elements in the iterator can change while the data does not.
 * This can happen, for example, if the iterator is produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response produces objects with
 * different identities, and Angular must tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted).
 *
 * To avoid this expensive operation, you can customize the default tracking algorithm.
 * by supplying the `trackBy` option to `NgForOf`.
 * `trackBy` takes a function that has two arguments: `index` and `item`.
 * If `trackBy` is given, Angular tracks changes by the return value of the function.
 *
 * @see [Structural Directives](guide/directives/structural-directives)
 * @ngModule CommonModule
 * @publicApi
 *
 * @deprecated 20.0
 * Use the `@for` block instead. Intent to remove in a future major release
 */
class NgForOf {
  _viewContainer;
  _template;
  _differs;
  /**
   * The value of the iterable expression, which can be used as a
   * [template input variable](guide/directives/structural-directives#structural-directive-shorthand).
   * @deprecated The `ngFor` directive is deprecated. Use the `@for` block instead.
   */
  set ngForOf(ngForOf) {
    this._ngForOf = ngForOf;
    this._ngForOfDirty = true;
  }
  /**
   * Specifies a custom `TrackByFunction` to compute the identity of items in an iterable.
   *
   * If a custom `TrackByFunction` is not provided, `NgForOf` will use the item's [object
   * identity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
   * as the key.
   *
   * `NgForOf` uses the computed key to associate items in an iterable with DOM elements
   * it produces for these items.
   *
   * A custom `TrackByFunction` is useful to provide good user experience in cases when items in an
   * iterable rendered using `NgForOf` have a natural identifier (for example, custom ID or a
   * primary key), and this iterable could be updated with new object instances that still
   * represent the same underlying entity (for example, when data is re-fetched from the server,
   * and the iterable is recreated and re-rendered, but most of the data is still the same).
   *
   * @see {@link TrackByFunction}
   * @deprecated The `ngFor` directive is deprecated. Use the `@for` block instead.
   */
  set ngForTrackBy(fn) {
    if ((typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && fn != null && typeof fn !== 'function') {
      console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` + `See https://angular.dev/api/common/NgForOf#change-propagation for more information.`);
    }
    this._trackByFn = fn;
  }
  get ngForTrackBy() {
    return this._trackByFn;
  }
  _ngForOf = null;
  _ngForOfDirty = true;
  _differ = null;
  // waiting for microsoft/typescript#43662 to allow the return type `TrackByFunction|undefined` for
  // the getter
  _trackByFn;
  constructor(_viewContainer, _template, _differs) {
    this._viewContainer = _viewContainer;
    this._template = _template;
    this._differs = _differs;
  }
  /**
   * A reference to the template that is stamped out for each item in the iterable.
   * @see [template reference variable](guide/templates/variables#template-reference-variables)
   * @deprecated The `ngFor` directive is deprecated. Use the `@for` block instead.
   */
  set ngForTemplate(value) {
    // The current type is too restrictive; a template that just uses index, for example,
    // should be acceptable.
    if (value) {
      this._template = value;
    }
  }
  /**
   * Applies the changes when needed.
   * @docs-private
   */
  ngDoCheck() {
    if (this._ngForOfDirty) {
      this._ngForOfDirty = false;
      // React on ngForOf changes only once all inputs have been initialized
      const value = this._ngForOf;
      if (!this._differ && value) {
        if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
          try {
            // CAUTION: this logic is duplicated for production mode below, as the try-catch
            // is only present in development builds.
            this._differ = this._differs.find(value).create(this.ngForTrackBy);
          } catch {
            let errorMessage = `Cannot find a differ supporting object '${value}' of type '` + `${getTypeName(value)}'. NgFor only supports binding to Iterables, such as Arrays.`;
            if (typeof value === 'object') {
              errorMessage += ' Did you mean to use the keyvalue pipe?';
            }
            throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(-2200 /* RuntimeErrorCode.NG_FOR_MISSING_DIFFER */, errorMessage);
          }
        } else {
          // CAUTION: this logic is duplicated for development mode above, as the try-catch
          // is only present in development builds.
          this._differ = this._differs.find(value).create(this.ngForTrackBy);
        }
      }
    }
    if (this._differ) {
      const changes = this._differ.diff(this._ngForOf);
      if (changes) this._applyChanges(changes);
    }
  }
  _applyChanges(changes) {
    const viewContainer = this._viewContainer;
    changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
      if (item.previousIndex == null) {
        // NgForOf is never "null" or "undefined" here because the differ detected
        // that a new item needs to be inserted from the iterable. This implies that
        // there is an iterable value for "_ngForOf".
        viewContainer.createEmbeddedView(this._template, new NgForOfContext(item.item, this._ngForOf, -1, -1, this._template._declarationTContainer.localNames ? this._template._declarationTContainer.localNames[0] : null), currentIndex === null ? undefined : currentIndex);
      } else if (currentIndex == null) {
        viewContainer.remove(adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex);
      } else if (adjustedPreviousIndex !== null) {
        const view = viewContainer.get(adjustedPreviousIndex);
        viewContainer.move(view, currentIndex);
        applyViewChange(view, item);
      }
    });
    for (let i = 0, ilen = viewContainer.length; i < ilen; i++) {
      const viewRef = viewContainer.get(i);
      const context = viewRef.context;
      context.index = i;
      context.count = ilen;
      context.ngForOf = this._ngForOf;
    }
    changes.forEachIdentityChange(record => {
      const viewRef = viewContainer.get(record.currentIndex);
      applyViewChange(viewRef, record);
    });
  }
  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard(dir, ctx) {
    return true;
  }
  static ɵfac = function NgForOf_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgForOf)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.IterableDiffers));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgForOf,
    selectors: [["", "ngFor", "", "ngForOf", ""]],
    inputs: {
      ngForOf: "ngForOf",
      ngForTrackBy: "ngForTrackBy",
      ngForTemplate: "ngForTemplate"
    }
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgForOf, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngFor][ngForOf]'
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.IterableDiffers
  }], {
    ngForOf: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    ngForTrackBy: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    ngForTemplate: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }]
  });
})();
function applyViewChange(view, record) {
  view.context.$implicit = record.item;
}
function getTypeName(type) {
  return type['name'] || typeof type;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A structural directive that conditionally includes a template based on the value of
 * an expression coerced to Boolean.
 * When the expression evaluates to true, Angular renders the template
 * provided in a `then` clause, and when  false or null,
 * Angular renders the template provided in an optional `else` clause. The default
 * template for the `else` clause is blank.
 *
 * A [shorthand form](guide/directives/structural-directives#structural-directive-shorthand) of the directive,
 * `*ngIf="condition"`, is generally used, provided
 * as an attribute of the anchor element for the inserted template.
 * Angular expands this into a more explicit version, in which the anchor element
 * is contained in an `<ng-template>` element.
 *
 * Simple form with shorthand syntax:
 *
 * ```html
 * <div *ngIf="condition">Content to render when condition is true.</div>
 * ```
 *
 * Simple form with expanded syntax:
 *
 * ```html
 * <ng-template [ngIf]="condition"><div>Content to render when condition is
 * true.</div></ng-template>
 * ```
 *
 * Form with an "else" block:
 *
 * ```html
 * <div *ngIf="condition; else elseBlock">Content to render when condition is true.</div>
 * <ng-template #elseBlock>Content to render when condition is false.</ng-template>
 * ```
 *
 * Shorthand form with "then" and "else" blocks:
 *
 * ```html
 * <div *ngIf="condition; then thenBlock else elseBlock"></div>
 * <ng-template #thenBlock>Content to render when condition is true.</ng-template>
 * <ng-template #elseBlock>Content to render when condition is false.</ng-template>
 * ```
 *
 * Form with storing the value locally:
 *
 * ```html
 * <div *ngIf="condition as value; else elseBlock">{{value}}</div>
 * <ng-template #elseBlock>Content to render when value is null.</ng-template>
 * ```
 *
 * @usageNotes
 *
 * The `*ngIf` directive is most commonly used to conditionally show an inline template,
 * as seen in the following  example.
 * The default `else` template is blank.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfSimple'}
 *
 * ### Showing an alternative template using `else`
 *
 * To display a template when `expression` evaluates to false, use an `else` template
 * binding as shown in the following example.
 * The `else` binding points to an `<ng-template>`  element labeled `#elseBlock`.
 * The template can be defined anywhere in the component view, but is typically placed right after
 * `ngIf` for readability.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfElse'}
 *
 * ### Using an external `then` template
 *
 * In the previous example, the then-clause template is specified inline, as the content of the
 * tag that contains the `ngIf` directive. You can also specify a template that is defined
 * externally, by referencing a labeled `<ng-template>` element. When you do this, you can
 * change which template to use at runtime, as shown in the following example.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfThenElse'}
 *
 * ### Storing a conditional result in a variable
 *
 * You might want to show a set of properties from the same object. If you are waiting
 * for asynchronous data, the object can be undefined.
 * In this case, you can use `ngIf` and store the result of the condition in a local
 * variable as shown in the following example.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfAs'}
 *
 * This code uses only one `AsyncPipe`, so only one subscription is created.
 * The conditional statement stores the result of `userStream|async` in the local variable `user`.
 * You can then bind the local `user` repeatedly.
 *
 * The conditional displays the data only if `userStream` returns a value,
 * so you don't need to use the
 * safe-navigation-operator (`?.`)
 * to guard against null values when accessing properties.
 * You can display an alternative template while waiting for the data.
 *
 * ### Shorthand syntax
 *
 * The shorthand syntax `*ngIf` expands into two separate template specifications
 * for the "then" and "else" clauses. For example, consider the following shorthand statement,
 * that is meant to show a loading page while waiting for data to be loaded.
 *
 * ```html
 * <div class="hero-list" *ngIf="heroes else loading">
 *  ...
 * </div>
 *
 * <ng-template #loading>
 *  <div>Loading...</div>
 * </ng-template>
 * ```
 *
 * You can see that the "else" clause references the `<ng-template>`
 * with the `#loading` label, and the template for the "then" clause
 * is provided as the content of the anchor element.
 *
 * However, when Angular expands the shorthand syntax, it creates
 * another `<ng-template>` tag, with `ngIf` and `ngIfElse` directives.
 * The anchor element containing the template for the "then" clause becomes
 * the content of this unlabeled `<ng-template>` tag.
 *
 * ```html
 * <ng-template [ngIf]="heroes" [ngIfElse]="loading">
 *  <div class="hero-list">
 *   ...
 *  </div>
 * </ng-template>
 *
 * <ng-template #loading>
 *  <div>Loading...</div>
 * </ng-template>
 * ```
 *
 * The presence of the implicit template object has implications for the nesting of
 * structural directives. For more on this subject, see
 * [Structural Directives](guide/directives/structural-directives#one-structural-directive-per-element).
 *
 * @ngModule CommonModule
 * @publicApi
 *
 * @deprecated 20.0
 * Use the `@if` block instead. Intent to remove in a future major release
 */
class NgIf {
  _viewContainer;
  _context = new NgIfContext();
  _thenTemplateRef = null;
  _elseTemplateRef = null;
  _thenViewRef = null;
  _elseViewRef = null;
  constructor(_viewContainer, templateRef) {
    this._viewContainer = _viewContainer;
    this._thenTemplateRef = templateRef;
  }
  /**
   * The Boolean expression to evaluate as the condition for showing a template.
   * @deprecated Use the `@if` block instead. Intent to remove in a future major release
   */
  set ngIf(condition) {
    this._context.$implicit = this._context.ngIf = condition;
    this._updateView();
  }
  /**
   * A template to show if the condition expression evaluates to true.
   * @deprecated Use the `@if` block instead. Intent to remove in a future major release
   */
  set ngIfThen(templateRef) {
    assertTemplate(templateRef, (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && 'ngIfThen');
    this._thenTemplateRef = templateRef;
    this._thenViewRef = null; // clear previous view if any.
    this._updateView();
  }
  /**
   * A template to show if the condition expression evaluates to false.
   * @deprecated Use the `@if` block instead. Intent to remove in a future major release
   */
  set ngIfElse(templateRef) {
    assertTemplate(templateRef, (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && 'ngIfElse');
    this._elseTemplateRef = templateRef;
    this._elseViewRef = null; // clear previous view if any.
    this._updateView();
  }
  _updateView() {
    if (this._context.$implicit) {
      if (!this._thenViewRef) {
        this._viewContainer.clear();
        this._elseViewRef = null;
        if (this._thenTemplateRef) {
          this._thenViewRef = this._viewContainer.createEmbeddedView(this._thenTemplateRef, {
            ...this._context,
            __templateName: this._thenTemplateRef._declarationTContainer.localNames ? this._thenTemplateRef._declarationTContainer.localNames[0] : null
          });
        }
      }
    } else {
      if (!this._elseViewRef) {
        this._viewContainer.clear();
        this._thenViewRef = null;
        if (this._elseTemplateRef) {
          this._elseViewRef = this._viewContainer.createEmbeddedView(this._elseTemplateRef, {
            ...this._context,
            __templateName: this._elseTemplateRef._declarationTContainer.localNames ? this._elseTemplateRef._declarationTContainer.localNames[0] : null
          });
        }
      }
    }
  }
  /** @internal */
  static ngIfUseIfTypeGuard;
  /**
   * Assert the correct type of the expression bound to the `ngIf` input within the template.
   *
   * The presence of this static field is a signal to the Ivy template type check compiler that
   * when the `NgIf` structural directive renders its template, the type of the expression bound
   * to `ngIf` should be narrowed in some way. For `NgIf`, the binding expression itself is used to
   * narrow its type, which allows the strictNullChecks feature of TypeScript to work with `NgIf`.
   */
  static ngTemplateGuard_ngIf;
  /**
   * Asserts the correct type of the context for the template that `NgIf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgIf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard(dir, ctx) {
    return true;
  }
  static ɵfac = function NgIf_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgIf)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgIf,
    selectors: [["", "ngIf", ""]],
    inputs: {
      ngIf: "ngIf",
      ngIfThen: "ngIfThen",
      ngIfElse: "ngIfElse"
    }
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgIf, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngIf]'
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef
  }], {
    ngIf: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    ngIfThen: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    ngIfElse: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }]
  });
})();
/**
 * @publicApi
 *
 * @deprecated 20.0
 * The ngIf directive is deprecated in favor of the @if block instead.
 */
class NgIfContext {
  $implicit = null;
  ngIf = null;
  __templateName;
}
function assertTemplate(templateRef, property) {
  if (templateRef && !templateRef.createEmbeddedView) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2020 /* RuntimeErrorCode.NG_IF_NOT_A_TEMPLATE_REF */, (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && `${property} must be a TemplateRef, but received '${(0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.stringify)(templateRef)}'.`);
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/** @internal */
const CURRENCIES_EN = {
  "ADP": [undefined, undefined, 0],
  "AFN": [undefined, "؋", 0],
  "ALL": [undefined, undefined, 0],
  "AMD": [undefined, "֏", 2],
  "AOA": [undefined, "Kz"],
  "ARS": [undefined, "$"],
  "AUD": ["A$", "$"],
  "AZN": [undefined, "₼"],
  "BAM": [undefined, "KM"],
  "BBD": [undefined, "$"],
  "BDT": [undefined, "৳"],
  "BHD": [undefined, undefined, 3],
  "BIF": [undefined, undefined, 0],
  "BMD": [undefined, "$"],
  "BND": [undefined, "$"],
  "BOB": [undefined, "Bs"],
  "BRL": ["R$"],
  "BSD": [undefined, "$"],
  "BWP": [undefined, "P"],
  "BYN": [undefined, undefined, 2],
  "BYR": [undefined, undefined, 0],
  "BZD": [undefined, "$"],
  "CAD": ["CA$", "$", 2],
  "CHF": [undefined, undefined, 2],
  "CLF": [undefined, undefined, 4],
  "CLP": [undefined, "$", 0],
  "CNY": ["CN¥", "¥"],
  "COP": [undefined, "$", 2],
  "CRC": [undefined, "₡", 2],
  "CUC": [undefined, "$"],
  "CUP": [undefined, "$"],
  "CZK": [undefined, "Kč", 2],
  "DJF": [undefined, undefined, 0],
  "DKK": [undefined, "kr", 2],
  "DOP": [undefined, "$"],
  "EGP": [undefined, "E£"],
  "ESP": [undefined, "₧", 0],
  "EUR": ["€"],
  "FJD": [undefined, "$"],
  "FKP": [undefined, "£"],
  "GBP": ["£"],
  "GEL": [undefined, "₾"],
  "GHS": [undefined, "GH₵"],
  "GIP": [undefined, "£"],
  "GNF": [undefined, "FG", 0],
  "GTQ": [undefined, "Q"],
  "GYD": [undefined, "$", 2],
  "HKD": ["HK$", "$"],
  "HNL": [undefined, "L"],
  "HRK": [undefined, "kn"],
  "HUF": [undefined, "Ft", 2],
  "IDR": [undefined, "Rp", 2],
  "ILS": ["₪"],
  "INR": ["₹"],
  "IQD": [undefined, undefined, 0],
  "IRR": [undefined, undefined, 0],
  "ISK": [undefined, "kr", 0],
  "ITL": [undefined, undefined, 0],
  "JMD": [undefined, "$"],
  "JOD": [undefined, undefined, 3],
  "JPY": ["¥", undefined, 0],
  "KGS": [undefined, "⃀"],
  "KHR": [undefined, "៛"],
  "KMF": [undefined, "CF", 0],
  "KPW": [undefined, "₩", 0],
  "KRW": ["₩", undefined, 0],
  "KWD": [undefined, undefined, 3],
  "KYD": [undefined, "$"],
  "KZT": [undefined, "₸"],
  "LAK": [undefined, "₭", 0],
  "LBP": [undefined, "L£", 0],
  "LKR": [undefined, "Rs"],
  "LRD": [undefined, "$"],
  "LTL": [undefined, "Lt"],
  "LUF": [undefined, undefined, 0],
  "LVL": [undefined, "Ls"],
  "LYD": [undefined, undefined, 3],
  "MGA": [undefined, "Ar", 0],
  "MGF": [undefined, undefined, 0],
  "MMK": [undefined, "K", 0],
  "MNT": [undefined, "₮", 2],
  "MRO": [undefined, undefined, 0],
  "MUR": [undefined, "Rs", 2],
  "MXN": ["MX$", "$"],
  "MYR": [undefined, "RM"],
  "NAD": [undefined, "$"],
  "NGN": [undefined, "₦"],
  "NIO": [undefined, "C$"],
  "NOK": [undefined, "kr", 2],
  "NPR": [undefined, "Rs"],
  "NZD": ["NZ$", "$"],
  "OMR": [undefined, undefined, 3],
  "PHP": ["₱"],
  "PKR": [undefined, "Rs", 2],
  "PLN": [undefined, "zł"],
  "PYG": [undefined, "₲", 0],
  "RON": [undefined, "lei"],
  "RSD": [undefined, undefined, 0],
  "RUB": [undefined, "₽"],
  "RWF": [undefined, "RF", 0],
  "SBD": [undefined, "$"],
  "SEK": [undefined, "kr", 2],
  "SGD": [undefined, "$"],
  "SHP": [undefined, "£"],
  "SLE": [undefined, undefined, 2],
  "SLL": [undefined, undefined, 0],
  "SOS": [undefined, undefined, 0],
  "SRD": [undefined, "$"],
  "SSP": [undefined, "£"],
  "STD": [undefined, undefined, 0],
  "STN": [undefined, "Db"],
  "SYP": [undefined, "£", 0],
  "THB": [undefined, "฿"],
  "TMM": [undefined, undefined, 0],
  "TND": [undefined, undefined, 3],
  "TOP": [undefined, "T$"],
  "TRL": [undefined, undefined, 0],
  "TRY": [undefined, "₺"],
  "TTD": [undefined, "$"],
  "TWD": ["NT$", "$", 2],
  "TZS": [undefined, undefined, 2],
  "UAH": [undefined, "₴"],
  "UGX": [undefined, undefined, 0],
  "USD": ["$"],
  "UYI": [undefined, undefined, 0],
  "UYU": [undefined, "$"],
  "UYW": [undefined, undefined, 4],
  "UZS": [undefined, undefined, 2],
  "VEF": [undefined, "Bs", 2],
  "VND": ["₫", undefined, 0],
  "VUV": [undefined, undefined, 0],
  "XAF": ["FCFA", undefined, 0],
  "XCD": ["EC$", "$"],
  "XCG": ["Cg."],
  "XOF": ["F CFA", undefined, 0],
  "XPF": ["CFPF", undefined, 0],
  "XXX": ["¤"],
  "YER": [undefined, undefined, 0],
  "ZAR": [undefined, "R"],
  "ZMK": [undefined, undefined, 0],
  "ZMW": [undefined, "ZK"],
  "ZWD": [undefined, undefined, 0]
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Format styles that can be used to represent numbers.
 * @see {@link getLocaleNumberFormat}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * `getLocaleNumberFormat` is deprecated
 */
var NumberFormatStyle;
(function (NumberFormatStyle) {
  NumberFormatStyle[NumberFormatStyle["Decimal"] = 0] = "Decimal";
  NumberFormatStyle[NumberFormatStyle["Percent"] = 1] = "Percent";
  NumberFormatStyle[NumberFormatStyle["Currency"] = 2] = "Currency";
  NumberFormatStyle[NumberFormatStyle["Scientific"] = 3] = "Scientific";
})(NumberFormatStyle || (NumberFormatStyle = {}));
/**
 * Plurality cases used for translating plurals to different languages.
 *
 * @see {@link NgPlural}
 * @see {@link NgPluralCase}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * `getLocalePluralCase` is deprecated
 */
var Plural;
(function (Plural) {
  Plural[Plural["Zero"] = 0] = "Zero";
  Plural[Plural["One"] = 1] = "One";
  Plural[Plural["Two"] = 2] = "Two";
  Plural[Plural["Few"] = 3] = "Few";
  Plural[Plural["Many"] = 4] = "Many";
  Plural[Plural["Other"] = 5] = "Other";
})(Plural || (Plural = {}));
/**
 * Context-dependant translation forms for strings.
 * Typically the standalone version is for the nominative form of the word,
 * and the format version is used for the genitive case.
 * @see [CLDR website](http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles)
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * locale data getters are deprecated
 */
var FormStyle;
(function (FormStyle) {
  FormStyle[FormStyle["Format"] = 0] = "Format";
  FormStyle[FormStyle["Standalone"] = 1] = "Standalone";
})(FormStyle || (FormStyle = {}));
/**
 * String widths available for translations.
 * The specific character widths are locale-specific.
 * Examples are given for the word "Sunday" in English.
 *
 * @publicApi
 *
 * @deprecated 18.0
 * locale data getters are deprecated
 */
var TranslationWidth;
(function (TranslationWidth) {
  /** 1 character for `en-US`. For example: 'S' */
  TranslationWidth[TranslationWidth["Narrow"] = 0] = "Narrow";
  /** 3 characters for `en-US`. For example: 'Sun' */
  TranslationWidth[TranslationWidth["Abbreviated"] = 1] = "Abbreviated";
  /** Full length for `en-US`. For example: "Sunday" */
  TranslationWidth[TranslationWidth["Wide"] = 2] = "Wide";
  /** 2 characters for `en-US`, For example: "Su" */
  TranslationWidth[TranslationWidth["Short"] = 3] = "Short";
})(TranslationWidth || (TranslationWidth = {}));
/**
 * String widths available for date-time formats.
 * The specific character widths are locale-specific.
 * Examples are given for `en-US`.
 *
 * @see {@link getLocaleDateFormat}
 * @see {@link getLocaleTimeFormat}
 * @see {@link getLocaleDateTimeFormat}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 * @publicApi
 *
 * @deprecated 18.0
 * Date locale data getters are deprecated
 */
var FormatWidth;
(function (FormatWidth) {
  /**
   * For `en-US`, `'M/d/yy, h:mm a'`
   * (Example: `6/15/15, 9:03 AM`)
   */
  FormatWidth[FormatWidth["Short"] = 0] = "Short";
  /**
   * For `en-US`, `'MMM d, y, h:mm:ss a'`
   * (Example: `Jun 15, 2015, 9:03:01 AM`)
   */
  FormatWidth[FormatWidth["Medium"] = 1] = "Medium";
  /**
   * For `en-US`, `'MMMM d, y, h:mm:ss a z'`
   * (Example: `June 15, 2015 at 9:03:01 AM GMT+1`)
   */
  FormatWidth[FormatWidth["Long"] = 2] = "Long";
  /**
   * For `en-US`, `'EEEE, MMMM d, y, h:mm:ss a zzzz'`
   * (Example: `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00`)
   */
  FormatWidth[FormatWidth["Full"] = 3] = "Full";
})(FormatWidth || (FormatWidth = {}));
// This needs to be an object literal, rather than an enum, because TypeScript 5.4+
// doesn't allow numeric keys and we have `Infinity` and `NaN`.
/**
 * Symbols that can be used to replace placeholders in number patterns.
 * Examples are based on `en-US` values.
 *
 * @see {@link getLocaleNumberSymbol}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * `getLocaleNumberSymbol` is deprecated
 *
 * @object-literal-as-enum
 */
const NumberSymbol = {
  /**
   * Decimal separator.
   * For `en-US`, the dot character.
   * Example: 2,345`.`67
   */
  Decimal: 0,
  /**
   * Grouping separator, typically for thousands.
   * For `en-US`, the comma character.
   * Example: 2`,`345.67
   */
  Group: 1,
  /**
   * List-item separator.
   * Example: "one, two, and three"
   */
  List: 2,
  /**
   * Sign for percentage (out of 100).
   * Example: 23.4%
   */
  PercentSign: 3,
  /**
   * Sign for positive numbers.
   * Example: +23
   */
  PlusSign: 4,
  /**
   * Sign for negative numbers.
   * Example: -23
   */
  MinusSign: 5,
  /**
   * Computer notation for exponential value (n times a power of 10).
   * Example: 1.2E3
   */
  Exponential: 6,
  /**
   * Human-readable format of exponential.
   * Example: 1.2x103
   */
  SuperscriptingExponent: 7,
  /**
   * Sign for permille (out of 1000).
   * Example: 23.4‰
   */
  PerMille: 8,
  /**
   * Infinity, can be used with plus and minus.
   * Example: ∞, +∞, -∞
   */
  Infinity: 9,
  /**
   * Not a number.
   * Example: NaN
   */
  NaN: 10,
  /**
   * Symbol used between time units.
   * Example: 10:52
   */
  TimeSeparator: 11,
  /**
   * Decimal separator for currency values (fallback to `Decimal`).
   * Example: $2,345.67
   */
  CurrencyDecimal: 12,
  /**
   * Group separator for currency values (fallback to `Group`).
   * Example: $2,345.67
   */
  CurrencyGroup: 13
};
/**
 * The value for each day of the week, based on the `en-US` locale
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Week locale getters are deprecated
 */
var WeekDay;
(function (WeekDay) {
  WeekDay[WeekDay["Sunday"] = 0] = "Sunday";
  WeekDay[WeekDay["Monday"] = 1] = "Monday";
  WeekDay[WeekDay["Tuesday"] = 2] = "Tuesday";
  WeekDay[WeekDay["Wednesday"] = 3] = "Wednesday";
  WeekDay[WeekDay["Thursday"] = 4] = "Thursday";
  WeekDay[WeekDay["Friday"] = 5] = "Friday";
  WeekDay[WeekDay["Saturday"] = 6] = "Saturday";
})(WeekDay || (WeekDay = {}));
/**
 * Retrieves the locale ID from the currently loaded locale.
 * The loaded locale could be, for example, a global one rather than a regional one.
 * @param locale A locale code, such as `fr-FR`.
 * @returns The locale code. For example, `fr`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * This function serves no purpose when relying on the `Intl` API.
 */
function getLocaleId(locale) {
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale)[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.LocaleId];
}
/**
 * Retrieves day period strings for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized period strings. For example, `[AM, PM]` for `en-US`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
function getLocaleDayPeriods(locale, formStyle, width) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  const amPmData = [data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.DayPeriodsFormat], data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.DayPeriodsStandalone]];
  const amPm = getLastDefinedValue(amPmData, formStyle);
  return getLastDefinedValue(amPm, width);
}
/**
 * Retrieves days of the week for the given locale, using the Gregorian calendar.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized name strings.
 * For example,`[Sunday, Monday, ... Saturday]` for `en-US`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
function getLocaleDayNames(locale, formStyle, width) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  const daysData = [data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.DaysFormat], data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.DaysStandalone]];
  const days = getLastDefinedValue(daysData, formStyle);
  return getLastDefinedValue(days, width);
}
/**
 * Retrieves months of the year for the given locale, using the Gregorian calendar.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized name strings.
 * For example,  `[January, February, ...]` for `en-US`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
function getLocaleMonthNames(locale, formStyle, width) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  const monthsData = [data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.MonthsFormat], data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.MonthsStandalone]];
  const months = getLastDefinedValue(monthsData, formStyle);
  return getLastDefinedValue(months, width);
}
/**
 * Retrieves Gregorian-calendar eras for the given locale.
 * @param locale A locale code for the locale format rules to use.
 * @param width The required character width.

 * @returns An array of localized era strings.
 * For example, `[AD, BC]` for `en-US`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
function getLocaleEraNames(locale, width) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  const erasData = data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.Eras];
  return getLastDefinedValue(erasData, width);
}
/**
 * Retrieves the first day of the week for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns A day index number, using the 0-based week-day index for `en-US`
 * (Sunday = 0, Monday = 1, ...).
 * For example, for `fr-FR`, returns 1 to indicate that the first day is Monday.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Intl's [`getWeekInfo`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) has partial support (Chromium M99 & Safari 17).
 * You may want to rely on the following alternatives:
 * - Libraries like [`Luxon`](https://moment.github.io/luxon/#/) rely on `Intl` but fallback on the ISO 8601 definition (monday) if `getWeekInfo` is not supported.
 * - Other librairies like [`date-fns`](https://date-fns.org/), [`day.js`](https://day.js.org/en/) or [`weekstart`](https://www.npmjs.com/package/weekstart) library provide their own locale based data for the first day of the week.
 */
function getLocaleFirstDayOfWeek(locale) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.FirstDayOfWeek];
}
/**
 * Range of week days that are considered the week-end for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The range of day values, `[startDay, endDay]`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Intl's [`getWeekInfo`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) has partial support (Chromium M99 & Safari 17).
 * Libraries like [`Luxon`](https://moment.github.io/luxon/#/) rely on `Intl` but fallback on the ISO 8601 definition (Saturday+Sunday) if `getWeekInfo` is not supported .
 */
function getLocaleWeekEndRange(locale) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.WeekendRange];
}
/**
 * Retrieves a localized date-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
function getLocaleDateFormat(locale, width) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return getLastDefinedValue(data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.DateFormat], width);
}
/**
 * Retrieves a localized time-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](guide/i18n)

 * @publicApi
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
function getLocaleTimeFormat(locale, width) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return getLastDefinedValue(data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.TimeFormat], width);
}
/**
 * Retrieves a localized date-time formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
function getLocaleDateTimeFormat(locale, width) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  const dateTimeFormatData = data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.DateTimeFormat];
  return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Retrieves a localized number symbol that can be used to replace placeholders in number formats.
 * @param locale The locale code.
 * @param symbol The symbol to localize. Must be one of `NumberSymbol`.
 * @returns The character for the localized symbol.
 * @see {@link NumberSymbol}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.NumberFormat` to format numbers instead.
 */
function getLocaleNumberSymbol(locale, symbol) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  const res = data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.NumberSymbols][symbol];
  if (typeof res === 'undefined') {
    if (symbol === NumberSymbol.CurrencyDecimal) {
      return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.NumberSymbols][NumberSymbol.Decimal];
    } else if (symbol === NumberSymbol.CurrencyGroup) {
      return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.NumberSymbols][NumberSymbol.Group];
    }
  }
  return res;
}
/**
 * Retrieves a number format for a given locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,678". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders
 * that stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders. For example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the appropriate `NumberSymbol` for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | Replaced by a currency symbol, such as $ or USD. |
 * | % | Marks a percent format. The % symbol may change position, but must be retained. |
 * | E | Marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * @param locale A locale code for the locale format rules to use.
 * @param type The type of numeric value to be formatted (such as `Decimal` or `Currency`.)
 * @returns The localized format string.
 * @see {@link NumberFormatStyle}
 * @see [CLDR website](http://cldr.unicode.org/translation/number-patterns)
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Let `Intl.NumberFormat` determine the number format instead
 */
function getLocaleNumberFormat(locale, type) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.NumberFormats][type];
}
/**
 * Retrieves the symbol used to represent the currency for the main country
 * corresponding to a given locale. For example, '$' for `en-US`.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The localized symbol character,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Use the `Intl` API to format a currency with from currency code
 */
function getLocaleCurrencySymbol(locale) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.CurrencySymbol] || null;
}
/**
 * Retrieves the name of the currency for the main country corresponding
 * to a given locale. For example, 'US Dollar' for `en-US`.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency name,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Use the `Intl` API to format a currency with from currency code
 */
function getLocaleCurrencyName(locale) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.CurrencyName] || null;
}
/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * @param locale The code of the locale whose currency code we want.
 * @returns The code of the default currency for the given locale.
 *
 * @publicApi
 *
 * @deprecated 18.0
 * We recommend you create a map of locale to ISO 4217 currency codes.
 * Time relative currency data is provided by the CLDR project. See https://www.unicode.org/cldr/charts/44/supplemental/detailed_territory_currency_information.html
 */
function getLocaleCurrencyCode(locale) {
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.getLocaleCurrencyCode)(locale);
}
/**
 * Retrieves the currency values for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency values.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 */
function getLocaleCurrencies(locale) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.Currencies];
}
/**
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.PluralRules` instead
 */
const getLocalePluralCase = _angular_core__WEBPACK_IMPORTED_MODULE_3__.getLocalePluralCase;
function checkFullData(data) {
  if (!data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.ExtraData]) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2303 /* RuntimeErrorCode.MISSING_EXTRA_LOCALE_DATA_FOR_LOCALE */, wx.__global.ngDevMode && `Missing extra locale data for the locale "${data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
  }
}
/**
 * Retrieves locale-specific rules used to determine which day period to use
 * when more than one period is defined for a locale.
 *
 * There is a rule for each defined day period. The
 * first rule is applied to the first day period and so on.
 * Fall back to AM/PM when no rules are available.
 *
 * A rule can specify a period as time range, or as a single time value.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n/format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The rules for the locale, a single time value or array of *from-time, to-time*,
 * or null if no periods are available.
 *
 * @see {@link getLocaleExtraDayPeriods}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * Let `Intl.DateTimeFormat` determine the day period instead.
 */
function getLocaleExtraDayPeriodRules(locale) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  checkFullData(data);
  const rules = data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.ExtraData][2 /* ɵExtraLocaleDataIndex.ExtraDayPeriodsRules */] || [];
  return rules.map(rule => {
    if (typeof rule === 'string') {
      return extractTime(rule);
    }
    return [extractTime(rule[0]), extractTime(rule[1])];
  });
}
/**
 * Retrieves locale-specific day periods, which indicate roughly how a day is broken up
 * in different languages.
 * For example, for `en-US`, periods are morning, noon, afternoon, evening, and midnight.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n/format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns The translated day-period strings.
 * @see {@link getLocaleExtraDayPeriodRules}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * To extract a day period use `Intl.DateTimeFormat` with the `dayPeriod` option instead.
 */
function getLocaleExtraDayPeriods(locale, formStyle, width) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  checkFullData(data);
  const dayPeriodsData = [data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.ExtraData][0 /* ɵExtraLocaleDataIndex.ExtraDayPeriodFormats */], data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.ExtraData][1 /* ɵExtraLocaleDataIndex.ExtraDayPeriodStandalone */]];
  const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
  return getLastDefinedValue(dayPeriods, width) || [];
}
/**
 * Retrieves the writing direction of a specified locale
 * @param locale A locale code for the locale format rules to use.
 * @publicApi
 * @returns 'rtl' or 'ltr'
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * For dates and numbers, let `Intl.DateTimeFormat()` and `Intl.NumberFormat()` determine the writing direction.
 * The `Intl` alternative [`getTextInfo`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo).
 * has only partial support (Chromium M99 & Safari 17).
 * 3rd party alternatives like [`rtl-detect`](https://www.npmjs.com/package/rtl-detect) can work around this issue.
 */
function getLocaleDirection(locale) {
  const data = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.findLocaleData)(locale);
  return data[_angular_core__WEBPACK_IMPORTED_MODULE_3__.LocaleDataIndex.Directionality];
}
/**
 * Retrieves the first value that is defined in an array, going backwards from an index position.
 *
 * To avoid repeating the same data (as when the "format" and "standalone" forms are the same)
 * add the first value to the locale data arrays, and add other values only if they are different.
 *
 * @param data The data array to retrieve from.
 * @param index A 0-based index into the array to start from.
 * @returns The value immediately before the given index position.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 */
function getLastDefinedValue(data, index) {
  for (let i = index; i > -1; i--) {
    if (typeof data[i] !== 'undefined') {
      return data[i];
    }
  }
  throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2304 /* RuntimeErrorCode.LOCALE_DATA_UNDEFINED */, wx.__global.ngDevMode && 'Locale data API: locale data undefined');
}
/**
 * Extracts the hours and minutes from a string like "15:45"
 */
function extractTime(time) {
  const [h, m] = time.split(':');
  return {
    hours: +h,
    minutes: +m
  };
}
/**
 * Retrieves the currency symbol for a given currency code.
 *
 * For example, for the default `en-US` locale, the code `USD` can
 * be represented by the narrow symbol `$` or the wide symbol `US$`.
 *
 * @param code The currency code.
 * @param format The format, `wide` or `narrow`.
 * @param locale A locale code for the locale format rules to use.
 *
 * @returns The symbol, or the currency code if no symbol is available.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * You can use `Intl.NumberFormat().formatToParts()` to extract the currency symbol.
 * For example: `Intl.NumberFormat('en', {style:'currency', currency: 'USD'}).formatToParts().find(part => part.type === 'currency').value`
 * returns `$` for USD currency code in the `en` locale.
 * Note: `US$` is a currency symbol for the `en-ca` locale but not the `en-us` locale.
 */
function getCurrencySymbol(code, format, locale = 'en') {
  const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
  const symbolNarrow = currency[1 /* ɵCurrencyIndex.SymbolNarrow */];
  if (format === 'narrow' && typeof symbolNarrow === 'string') {
    return symbolNarrow;
  }
  return currency[0 /* ɵCurrencyIndex.Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Reports the number of decimal digits for a given currency.
 * The value depends upon the presence of cents in that particular currency.
 *
 * @param code The currency code.
 * @returns The number of decimal digits, typically 0 or 2.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated 18.0
 * Angular recommends relying on the `Intl` API for i18n.
 * This function should not be used anymore. Let `Intl.NumberFormat` determine the number of digits to display for the currency
 */
function getNumberOfCurrencyDigits(code) {
  let digits;
  const currency = CURRENCIES_EN[code];
  if (currency) {
    digits = currency[2 /* ɵCurrencyIndex.NbOfDigits */];
  }
  return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @publicApi
 */
class NgLocalization {
  static ɵfac = function NgLocalization_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NgLocalization)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineService"]({
    token: NgLocalization,
    factory: () => (() => new NgLocaleLocalization((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID)))()
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgLocalization, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Service,
    args: [{
      factory: () => new NgLocaleLocalization((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID))
    }]
  }], null, null);
})();
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
function getPluralCategory(value, cases, ngLocalization, locale) {
  let key = `=${value}`;
  if (cases.indexOf(key) > -1) {
    return key;
  }
  key = ngLocalization.getPluralCategory(value, locale);
  if (cases.indexOf(key) > -1) {
    return key;
  }
  if (cases.indexOf('other') > -1) {
    return 'other';
  }
  throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2308 /* RuntimeErrorCode.NO_PLURAL_MESSAGE_FOUND */, wx.__global.ngDevMode && `No plural message found for value "${value}"`);
}
/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
class NgLocaleLocalization extends NgLocalization {
  locale;
  constructor(locale) {
    super();
    this.locale = locale;
  }
  getPluralCategory(value, locale) {
    const plural = getLocalePluralCase(locale || this.locale)(value);
    switch (plural) {
      case Plural.Zero:
        return 'zero';
      case Plural.One:
        return 'one';
      case Plural.Two:
        return 'two';
      case Plural.Few:
        return 'few';
      case Plural.Many:
        return 'many';
      default:
        return 'other';
    }
  }
  static ɵfac = function NgLocaleLocalization_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgLocaleLocalization)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: NgLocaleLocalization,
    factory: NgLocaleLocalization.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgLocaleLocalization, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID]
    }]
  }], null);
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
class SwitchView {
  _viewContainerRef;
  _templateRef;
  _created = false;
  constructor(_viewContainerRef, _templateRef) {
    this._viewContainerRef = _viewContainerRef;
    this._templateRef = _templateRef;
  }
  create() {
    this._created = true;
    this._viewContainerRef.createEmbeddedView(this._templateRef, {
      __templateName: this._templateRef._declarationTContainer.localNames ? this._templateRef._declarationTContainer.localNames[0] : null
    });
  }
  destroy() {
    this._created = false;
    this._viewContainerRef.clear();
  }
  enforceState(created) {
    if (created && !this._created) {
      this.create();
    } else if (!created && this._created) {
      this.destroy();
    }
  }
}
/**
 * @ngModule CommonModule
 *
 * @description
 * The `[ngSwitch]` directive on a container specifies an expression to match against.
 * The expressions to match are provided by `ngSwitchCase` directives on views within the container.
 * - Every view that matches is rendered.
 * - If there are no matches, a view with the `ngSwitchDefault` directive is rendered.
 * - Elements within the `[NgSwitch]` statement but outside of any `NgSwitchCase`
 * or `ngSwitchDefault` directive are preserved at the location.
 *
 * @usageNotes
 * Define a container element for the directive, and specify the switch expression
 * to match against as an attribute:
 *
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 * ```
 *
 * Within the container, `*ngSwitchCase` statements specify the match expressions
 * as attributes. Include `*ngSwitchDefault` as the final case.
 *
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 *    <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * ...
 *    <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * ### Usage Examples
 *
 * The following example shows how to use more than one case to display the same view:
 *
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 *   <!-- the same view can be shown in more than one case -->
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *   <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *   <!--default case when there are no matches -->
 *   <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * The following example shows how cases can be nested:
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 *       <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *       <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *       <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *       <ng-container *ngSwitchCase="match_expression_3">
 *         <!-- use a ng-container to group multiple root nodes -->
 *         <inner-element></inner-element>
 *         <inner-other-element></inner-other-element>
 *       </ng-container>
 *       <some-element *ngSwitchDefault>...</some-element>
 *     </container-element>
 * ```
 *
 * @publicApi
 * @see {@link NgSwitchCase}
 * @see {@link NgSwitchDefault}
 * @see [Structural Directives](guide/directives/structural-directives)
 *
 * @deprecated 20.0
 * Use the `@switch` block instead. Intent to remove in a future major release
 */
class NgSwitch {
  _defaultViews = [];
  _defaultUsed = false;
  _caseCount = 0;
  _lastCaseCheckIndex = 0;
  _lastCasesMatched = false;
  _ngSwitch;
  /** @deprecated Use the `@switch` block instead. Intent to remove in a future major release */
  set ngSwitch(newValue) {
    this._ngSwitch = newValue;
    if (this._caseCount === 0) {
      this._updateDefaultCases(true);
    }
  }
  /** @internal */
  _addCase() {
    return this._caseCount++;
  }
  /** @internal */
  _addDefault(view) {
    this._defaultViews.push(view);
  }
  /** @internal */
  _matchCase(value) {
    const matched = value === this._ngSwitch;
    this._lastCasesMatched ||= matched;
    this._lastCaseCheckIndex++;
    if (this._lastCaseCheckIndex === this._caseCount) {
      this._updateDefaultCases(!this._lastCasesMatched);
      this._lastCaseCheckIndex = 0;
      this._lastCasesMatched = false;
    }
    return matched;
  }
  _updateDefaultCases(useDefault) {
    if (this._defaultViews.length > 0 && useDefault !== this._defaultUsed) {
      this._defaultUsed = useDefault;
      for (const defaultView of this._defaultViews) {
        defaultView.enforceState(useDefault);
      }
    }
  }
  static ɵfac = function NgSwitch_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NgSwitch)();
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgSwitch,
    selectors: [["", "ngSwitch", ""]],
    inputs: {
      ngSwitch: "ngSwitch"
    }
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgSwitch, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngSwitch]'
    }]
  }], null, {
    ngSwitch: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }]
  });
})();
/**
 * @ngModule CommonModule
 *
 * @description
 * Provides a switch case expression to match against an enclosing `ngSwitch` expression.
 * When the expressions match, the given `NgSwitchCase` template is rendered.
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * @usageNotes
 *
 * Within a switch container, `*ngSwitchCase` statements specify the match expressions
 * as attributes. Include `*ngSwitchDefault` as the final case.
 *
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   ...
 *   <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * Each switch-case statement contains an in-line HTML template or template reference
 * that defines the subtree to be selected if the value of the match expression
 * matches the value of the switch expression.
 *
 * As of Angular v17 the NgSwitch directive uses strict equality comparison (`===`) instead of
 * loose equality (`==`) to match different cases.
 *
 * @publicApi
 * @see {@link NgSwitch}
 * @see {@link NgSwitchDefault}
 *
 * @deprecated 20.0
 * Use the `@case` block within a `@switch` block instead. Intent to remove in a future major release
 */
class NgSwitchCase {
  ngSwitch;
  _view;
  /**
   * Stores the HTML template to be selected on match.
   * @deprecated Use the `@case` block within a `@switch` block instead. Intent to remove in a future major release
   */
  ngSwitchCase;
  constructor(viewContainer, templateRef, ngSwitch) {
    this.ngSwitch = ngSwitch;
    if ((typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && !ngSwitch) {
      throwNgSwitchProviderNotFoundError('ngSwitchCase', 'NgSwitchCase');
    }
    ngSwitch._addCase();
    this._view = new SwitchView(viewContainer, templateRef);
  }
  /**
   * Performs case matching. For internal use only.
   * @docs-private
   */
  ngDoCheck() {
    this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase));
  }
  static ɵfac = function NgSwitchCase_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgSwitchCase)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](NgSwitch, 9));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgSwitchCase,
    selectors: [["", "ngSwitchCase", ""]],
    inputs: {
      ngSwitchCase: "ngSwitchCase"
    }
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgSwitchCase, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngSwitchCase]'
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef
  }, {
    type: NgSwitch,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Host
    }]
  }], {
    ngSwitchCase: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }]
  });
})();
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Creates a view that is rendered when no `NgSwitchCase` expressions
 * match the `NgSwitch` expression.
 * This statement should be the final case in an `NgSwitch`.
 *
 * @publicApi
 * @see {@link NgSwitch}
 * @see {@link NgSwitchCase}
 *
 * @deprecated 20.0
 * Use the `@default` block within a `@switch` block instead. Intent to remove in a future major release
 */
class NgSwitchDefault {
  constructor(viewContainer, templateRef, ngSwitch) {
    if ((typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && !ngSwitch) {
      throwNgSwitchProviderNotFoundError('ngSwitchDefault', 'NgSwitchDefault');
    }
    ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
  }
  static ɵfac = function NgSwitchDefault_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgSwitchDefault)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](NgSwitch, 9));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgSwitchDefault,
    selectors: [["", "ngSwitchDefault", ""]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgSwitchDefault, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngSwitchDefault]'
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef
  }, {
    type: NgSwitch,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Host
    }]
  }], null);
})();
function throwNgSwitchProviderNotFoundError(attrName, directiveName) {
  throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2000 /* RuntimeErrorCode.PARENT_NG_SWITCH_NOT_FOUND */, `An element with the "${attrName}" attribute ` + `(matching the "${directiveName}" directive) must be located inside an element with the "ngSwitch" attribute ` + `(matching "NgSwitch" directive)`);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```html
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">there is nothing</ng-template>
 *   <ng-template ngPluralCase="=1">there is one</ng-template>
 *   <ng-template ngPluralCase="few">there are a few</ng-template>
 * </some-element>
 * ```
 *
 * @description
 *
 * Adds / removes DOM sub-trees based on a numeric value. Tailored for pluralization.
 *
 * Displays DOM sub-trees that match the switch expression value, or failing that, DOM sub-trees
 * that match the switch expression's pluralization category.
 *
 * To use this directive you must provide a container element that sets the `[ngPlural]` attribute
 * to a switch expression. Inner elements with a `[ngPluralCase]` will display based on their
 * expression:
 * - if `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 *   matches the switch expression exactly,
 * - otherwise, the view will be treated as a "category match", and will only display if exact
 *   value matches aren't found and the value maps to its category for the defined locale.
 *
 * See http://cldr.unicode.org/index/cldr-spec/plural-rules
 *
 * @publicApi
 */
class NgPlural {
  _localization;
  _activeView;
  _caseViews = {};
  constructor(_localization) {
    this._localization = _localization;
  }
  set ngPlural(value) {
    this._updateView(value);
  }
  addCase(value, switchView) {
    this._caseViews[value] = switchView;
  }
  _updateView(switchValue) {
    this._clearViews();
    const cases = Object.keys(this._caseViews);
    const key = getPluralCategory(switchValue, cases, this._localization);
    this._activateView(this._caseViews[key]);
  }
  _clearViews() {
    if (this._activeView) this._activeView.destroy();
  }
  _activateView(view) {
    if (view) {
      this._activeView = view;
      this._activeView.create();
    }
  }
  static ɵfac = function NgPlural_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgPlural)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](NgLocalization));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgPlural,
    selectors: [["", "ngPlural", ""]],
    inputs: {
      ngPlural: "ngPlural"
    }
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgPlural, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngPlural]'
    }]
  }], () => [{
    type: NgLocalization
  }], {
    ngPlural: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }]
  });
})();
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Creates a view that will be added/removed from the parent {@link NgPlural} when the
 * given expression matches the plural expression according to CLDR rules.
 *
 * @usageNotes
 * ```html
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">...</ng-template>
 *   <ng-template ngPluralCase="other">...</ng-template>
 * </some-element>
 *```
 *
 * See {@link NgPlural} for more details and example.
 *
 * @publicApi
 */
class NgPluralCase {
  value;
  constructor(value, template, viewContainer, ngPlural) {
    this.value = value;
    const isANumber = !isNaN(Number(value));
    ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
  }
  static ɵfac = function NgPluralCase_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgPluralCase)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinjectAttribute"]('ngPluralCase'), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](NgPlural, 1));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgPluralCase,
    selectors: [["", "ngPluralCase", ""]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgPluralCase, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngPluralCase]'
    }]
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Attribute,
      args: ['ngPluralCase']
    }]
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.TemplateRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef
  }, {
    type: NgPlural,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Host
    }]
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
 * @ngModule CommonModule
 *
 * @usageNotes
 *
 * Set the width of the containing element to a pixel value returned by an expression.
 *
 * ```html
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 * ```
 *
 * Set a collection of style values using an expression that returns key-value pairs.
 *
 * ```html
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * For more simple use cases you can use the [style bindings](/guide/templates/binding#css-class-and-style-property-bindings) directly.
 * It doesn't require importing a directive.
 *
 * Set the font of the containing element to the result of an expression.
 *
 * ```html
 * <some-element [style]="{'font-style': styleExp}">...</some-element>
 * ```
 *
 * @description
 *
 * An attribute directive that updates styles for the containing HTML element.
 * Sets one or more style properties, specified as colon-separated key-value pairs.
 * The key is a style name, with an optional `.<unit>` suffix
 * (such as 'top.px', 'font-style.em').
 * The value is an expression to be evaluated.
 * The resulting non-null value, expressed in the given unit,
 * is assigned to the given style property.
 * If the result of evaluation is null, the corresponding style is removed.
 *
 * @see [Style bindings](/guide/templates/binding#css-class-and-style-property-bindings)
 *
 * @publicApi
 */
class NgStyle {
  _ngEl;
  _differs;
  _renderer;
  _ngStyle = null;
  _differ = null;
  constructor(_ngEl, _differs, _renderer) {
    this._ngEl = _ngEl;
    this._differs = _differs;
    this._renderer = _renderer;
  }
  set ngStyle(values) {
    this._ngStyle = values;
    if (!this._differ && values) {
      this._differ = this._differs.find(values).create();
    }
  }
  ngDoCheck() {
    if (this._differ) {
      const changes = this._differ.diff(this._ngStyle);
      if (changes) {
        this._applyChanges(changes);
      }
    }
  }
  _setStyle(nameAndUnit, value) {
    const [name, unit] = nameAndUnit.split('.');
    const flags = name.indexOf('-') === -1 ? undefined : _angular_core__WEBPACK_IMPORTED_MODULE_3__.RendererStyleFlags2.DashCase;
    if (value != null) {
      this._renderer.setStyle(this._ngEl.nativeElement, name, unit ? `${value}${unit}` : value, flags);
    } else {
      this._renderer.removeStyle(this._ngEl.nativeElement, name, flags);
    }
  }
  _applyChanges(changes) {
    changes.forEachRemovedItem(record => this._setStyle(record.key, null));
    changes.forEachAddedItem(record => this._setStyle(record.key, record.currentValue));
    changes.forEachChangedItem(record => this._setStyle(record.key, record.currentValue));
  }
  static ɵfac = function NgStyle_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgStyle)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ElementRef), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.KeyValueDiffers), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.Renderer2));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgStyle,
    selectors: [["", "ngStyle", ""]],
    inputs: {
      ngStyle: "ngStyle"
    }
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgStyle, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngStyle]'
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.ElementRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.KeyValueDiffers
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Renderer2
  }], {
    ngStyle: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: ['ngStyle']
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
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Inserts an embedded view from a prepared `TemplateRef`.
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * @usageNotes
 * ```html
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * Using the key `$implicit` in the context object will set its value as default.
 *
 * ### Example
 *
 * {@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * @publicApi
 *
 * @see [Using NgTemplateOutlet](guide/templates/ng-template#using-ngtemplateoutlet)
 */
class NgTemplateOutlet {
  _viewContainerRef;
  _viewRef = null;
  /**
   * A context object to attach to the {@link EmbeddedViewRef}. This should be an
   * object, the object's keys will be available for binding by the local template `let`
   * declarations.
   * Using the key `$implicit` in the context object will set its value as default.
   */
  ngTemplateOutletContext = null;
  /**
   * A string defining the template reference and optionally the context object for the template.
   */
  ngTemplateOutlet = null;
  /**
   * Injector to be used within the embedded view. A value of "outlet" can be used to indicate
   * that the injector should be inherited from the template outlet's location in the instantiated DOM.
   */
  ngTemplateOutletInjector = null;
  injector = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.Injector);
  constructor(_viewContainerRef) {
    this._viewContainerRef = _viewContainerRef;
  }
  ngOnChanges(changes) {
    if (this._shouldRecreateView(changes)) {
      const viewContainerRef = this._viewContainerRef;
      if (this._viewRef) {
        viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
      }
      // If there is no outlet, clear the destroyed view ref.
      if (!this.ngTemplateOutlet) {
        this._viewRef = null;
        return;
      }
      // Create a context forward `Proxy` that will always bind to the user-specified context,
      // without having to destroy and re-create views whenever the context changes.
      const viewContext = this._createContextForwardProxy();
      this._viewRef = viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, {
        ...viewContext,
        __templateName: this.ngTemplateOutlet._declarationTContainer.localNames ? this.ngTemplateOutlet._declarationTContainer.localNames[0] : null
      }, {
        injector: this._getInjector()
      });
    }
  }
  /**
   * Gets the injector to use for the template outlet based on ngTemplateOutletInjector.
   */
  _getInjector() {
    if (this.ngTemplateOutletInjector === 'outlet') {
      return this.injector;
    }
    return this.ngTemplateOutletInjector ?? undefined;
  }
  /**
   * We need to re-create existing embedded view if either is true:
   * - the outlet changed.
   * - the injector changed.
   */
  _shouldRecreateView(changes) {
    return !!changes['ngTemplateOutlet'] || !!changes['ngTemplateOutletInjector'];
  }
  /**
   * For a given outlet instance, we create a proxy object that delegates
   * to the user-specified context. This allows changing, or swapping out
   * the context object completely without having to destroy/re-create the view.
   */
  _createContextForwardProxy() {
    return new Proxy({}, {
      set: (_target, prop, newValue) => {
        if (!this.ngTemplateOutletContext) {
          return false;
        }
        return wx.__window.Reflect.set(this.ngTemplateOutletContext, prop, newValue);
      },
      get: (_target, prop, receiver) => {
        if (!this.ngTemplateOutletContext) {
          return undefined;
        }
        return wx.__window.Reflect.get(this.ngTemplateOutletContext, prop, receiver);
      }
    });
  }
  static ɵfac = function NgTemplateOutlet_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgTemplateOutlet)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgTemplateOutlet,
    selectors: [["", "ngTemplateOutlet", ""]],
    inputs: {
      ngTemplateOutletContext: "ngTemplateOutletContext",
      ngTemplateOutlet: "ngTemplateOutlet",
      ngTemplateOutletInjector: "ngTemplateOutletInjector"
    },
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵNgOnChangesFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgTemplateOutlet, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: '[ngTemplateOutlet]'
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.ViewContainerRef
  }], {
    ngTemplateOutletContext: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    ngTemplateOutlet: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    ngTemplateOutletInjector: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
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
/**
 * A collection of Angular directives that are likely to be used in each and every Angular
 * application.
 */
const COMMON_DIRECTIVES = [NgClass, NgForOf, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
function invalidPipeArgumentError(type, value) {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2100 /* RuntimeErrorCode.INVALID_PIPE_ARGUMENT */, wx.__global.ngDevMode && `InvalidPipeArgument: '${value}' for pipe '${(0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.stringify)(type)}'`);
}
function warnIfSignal(pipeName, value) {
  if ((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.isSignal)(value)) {
    console.warn(`The ${pipeName} does not unwrap signals. Received a signal with value:`, value());
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
class SubscribableStrategy {
  createSubscription(async, updateLatestValue, onError) {
    // Subscription can be side-effectful, and we don't want any signal reads which happen in the
    // side effect of the subscription to be tracked by a component's template when that
    // subscription is triggered via the async pipe. So we wrap the subscription in `untracked` to
    // decouple from the current reactive context.
    //
    // `untracked` also prevents signal _writes_ which happen in the subscription side effect from
    // being treated as signal writes during the template evaluation (which throws errors).
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.untracked)(() => async.subscribe({
      next: updateLatestValue,
      error: onError
    }));
  }
  dispose(subscription) {
    // See the comment in `createSubscription` above on the use of `untracked`.
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.untracked)(() => subscription.unsubscribe());
  }
}
class PromiseStrategy {
  createSubscription(async, updateLatestValue, onError) {
    // According to the promise specification, promises are not cancellable by default.
    // Once a promise is created, it will either resolve or reject, and it doesn't
    // provide a built-in mechanism to cancel it.
    // There may be situations where a promise is provided, and it either resolves after
    // the pipe has been destroyed or never resolves at all. If the promise never
    // resolves — potentially due to factors beyond our control, such as third-party
    // libraries — this can lead to a memory leak.
    // When we use `async.then(updateLatestValue)`, the engine captures a reference to the
    // `updateLatestValue` function. This allows the promise to invoke that function when it
    // resolves. In this case, the promise directly captures a reference to the
    // `updateLatestValue` function. If the promise resolves later, it retains a reference
    // to the original `updateLatestValue`, meaning that even if the context where
    // `updateLatestValue` was defined has been destroyed, the function reference remains in memory.
    // This can lead to memory leaks if `updateLatestValue` is no longer needed or if it holds
    // onto resources that should be released.
    // When we do `async.then(v => ...)` the promise captures a reference to the lambda
    // function (the arrow function).
    // When we assign `updateLatestValue = null` within the context of an `unsubscribe` function,
    // we're changing the reference of `updateLatestValue` in the current scope to `null`.
    // The lambda will no longer have access to it after the assignment, effectively
    // preventing any further calls to the original function and allowing it to be garbage collected.
    async.then(
    // Using optional chaining because we may have set it to `null`; since the promise
    // is async, the view might be destroyed by the time the promise resolves.
    v => updateLatestValue?.(v), e => onError?.(e));
    return {
      unsubscribe: () => {
        updateLatestValue = null;
        onError = null;
      }
    };
  }
  dispose(subscription) {
    subscription.unsubscribe();
  }
}
const _promiseStrategy = new PromiseStrategy();
const _subscribableStrategy = new SubscribableStrategy();
/**
 * @ngModule CommonModule
 * @description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks. When the reference of the expression changes, the `async` pipe
 * automatically unsubscribes from the old `Observable` or `Promise` and subscribes to the new one.
 *
 * @usageNotes
 *
 * ### Examples
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the
 * promise.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipePromise'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. The Observable continuously updates the view with the current time.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipeObservable'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @publicApi
 */
class AsyncPipe {
  _ref;
  _latestValue = null;
  markForCheckOnValueUpdate = true;
  _subscription = null;
  _obj = null;
  _strategy = null;
  applicationErrorHandler = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.INTERNAL_APPLICATION_ERROR_HANDLER);
  constructor(ref) {
    // Assign `ref` into `this._ref` manually instead of declaring `_ref` in the constructor
    // parameter list, as the type of `this._ref` includes `null` unlike the type of `ref`.
    this._ref = ref;
  }
  ngOnDestroy() {
    if (this._subscription) {
      this._dispose();
    }
    // Clear the `ChangeDetectorRef` and its association with the view data, to mitigate
    // potential memory leaks in Observables that could otherwise cause the view data to
    // be retained.
    // https://github.com/angular/angular/issues/17624
    this._ref = null;
  }
  transform(obj) {
    if (!this._obj) {
      if (obj) {
        try {
          // Only call `markForCheck` if the value is updated asynchronously.
          // Synchronous updates _during_ subscription should not wastefully mark for check -
          // this value is already going to be returned from the transform function.
          this.markForCheckOnValueUpdate = false;
          this._subscribe(obj);
        } finally {
          this.markForCheckOnValueUpdate = true;
        }
      }
      return this._latestValue;
    }
    if (obj !== this._obj) {
      this._dispose();
      return this.transform(obj);
    }
    return this._latestValue;
  }
  _subscribe(obj) {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription = this._strategy.createSubscription(obj, value => this._updateLatestValue(obj, value), e => this.applicationErrorHandler(e));
  }
  _selectStrategy(obj) {
    if ((0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.isPromise)(obj)) {
      return _promiseStrategy;
    }
    if ((0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.isSubscribable)(obj)) {
      return _subscribableStrategy;
    }
    throw invalidPipeArgumentError(AsyncPipe, obj);
  }
  _dispose() {
    // Note: `dispose` is only called if a subscription has been initialized before, indicating
    // that `this._strategy` is also available.
    this._strategy.dispose(this._subscription);
    this._latestValue = null;
    this._subscription = null;
    this._obj = null;
  }
  _updateLatestValue(async, value) {
    if (async === this._obj) {
      this._latestValue = value;
      if (this.markForCheckOnValueUpdate) {
        this._ref?.markForCheck();
      }
    }
  }
  static ɵfac = function AsyncPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || AsyncPipe)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.ChangeDetectorRef, 16));
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "async",
    type: AsyncPipe,
    pure: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(AsyncPipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'async',
      pure: false
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.ChangeDetectorRef
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
 * Transforms text to all lower case.
 *
 * @see {@link UpperCasePipe}
 * @see {@link TitleCasePipe}
 * @usageNotes
 *
 * The following example defines a view that allows the user to enter
 * text, and then uses the pipe to convert the input text to all lower case.
 *
 * {@example common/pipes/ts/lowerupper_pipe.ts region='LowerUpperPipe'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @ngModule CommonModule
 * @publicApi
 */
class LowerCasePipe {
  transform(value) {
    if (value == null) return null;
    assertPipeArgument(LowerCasePipe, value);
    return value.toLowerCase();
  }
  static ɵfac = function LowerCasePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LowerCasePipe)();
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "lowercase",
    type: LowerCasePipe,
    pure: true
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(LowerCasePipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'lowercase'
    }]
  }], null, null);
})();
//
// Regex below matches any Unicode word and number compatible with ES5. In ES2018 the same result
// can be achieved by using /[0-9\p{L}]\S*/gu and also known as Unicode Property Escapes
// (https://2ality.com/2017/07/regexp-unicode-property-escapes.html). Since there is no
// transpilation of this functionality down to ES5 without external tool, the only solution is
// to use already transpiled form. Example can be found here -
// https://mothereff.in/regexpu#input=var+regex+%3D+%2F%5B0-9%5Cp%7BL%7D%5D%5CS*%2Fgu%3B%0A%0A&unicodePropertyEscape=1
//
const unicodeWordMatch = /(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])\S*/g;
/**
 * Transforms text to title case.
 * Capitalizes the first letter of each word and transforms the
 * rest of the word to lower case.
 * Words are delimited by any whitespace character, such as a space, tab, or line-feed character.
 *
 * @see {@link LowerCasePipe}
 * @see {@link UpperCasePipe}
 *
 * @usageNotes
 * The following example shows the result of transforming various strings into title case.
 *
 * {@example common/pipes/ts/titlecase_pipe.ts region='TitleCasePipe'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @ngModule CommonModule
 * @publicApi
 */
class TitleCasePipe {
  transform(value) {
    if (value == null) return null;
    assertPipeArgument(TitleCasePipe, value);
    return value.replace(unicodeWordMatch, txt => txt[0].toUpperCase() + txt.slice(1).toLowerCase());
  }
  static ɵfac = function TitleCasePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TitleCasePipe)();
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "titlecase",
    type: TitleCasePipe,
    pure: true
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(TitleCasePipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'titlecase'
    }]
  }], null, null);
})();
/**
 * Transforms text to all upper case.
 * @see {@link LowerCasePipe}
 * @see {@link TitleCasePipe}
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @ngModule CommonModule
 * @publicApi
 */
class UpperCasePipe {
  transform(value) {
    if (value == null) return null;
    assertPipeArgument(UpperCasePipe, value);
    return value.toUpperCase();
  }
  static ɵfac = function UpperCasePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || UpperCasePipe)();
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "uppercase",
    type: UpperCasePipe,
    pure: true
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(UpperCasePipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'uppercase'
    }]
  }], null, null);
})();
function assertPipeArgument(pipe, value) {
  if (typeof value !== 'string') {
    throw invalidPipeArgumentError(pipe, value);
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const ISO8601_DATE_REGEX = /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
// tslint:disable-next-line:no-toplevel-property-access
const NAMED_FORMATS = Object.create(null);
const DATE_FORMATS_SPLIT = /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
const MAX_DATE_FORMAT_LENGTH = 256;
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date according to locale rules.
 *
 * @param value The date to format, as a Date, or a number (milliseconds since UTC epoch)
 * or an [ISO date-time string](https://www.w3.org/TR/NOTE-datetime).
 * @param format The date-time components to include. See `DatePipe` for details.
 * @param locale A locale code for the locale format rules to use.
 * @param timezone The time zone. A time zone offset from GMT (such as `'+0430'`).
 * If not specified, uses host system settings.
 *
 * @returns The formatted date string.
 *
 * @see {@link DatePipe}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 */
function formatDate(value, format, locale, timezone) {
  let date = toDate(value);
  assertValidDateFormatLength(format);
  const namedFormat = getNamedFormat(locale, format);
  format = namedFormat || format;
  let parts = [];
  let match;
  while (format) {
    match = DATE_FORMATS_SPLIT.exec(format);
    if (match) {
      parts = parts.concat(match.slice(1));
      const part = parts.pop();
      if (!part) {
        break;
      }
      format = part;
    } else {
      parts.push(format);
      break;
    }
  }
  if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
    assertValidDateFormat(parts);
  }
  let dateTimezoneOffset = date.getTimezoneOffset();
  if (timezone) {
    dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    date = convertTimezoneToLocal(date, timezone, true);
  }
  let text = '';
  parts.forEach(value => {
    const dateFormatter = getDateFormatter(value);
    text += dateFormatter ? dateFormatter(date, locale, dateTimezoneOffset) : value === "''" ? "'" : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
  });
  return text;
}
function assertValidDateFormatLength(format) {
  if (format.length > MAX_DATE_FORMAT_LENGTH) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2300 /* RuntimeErrorCode.SUSPICIOUS_DATE_FORMAT */, wx.__global.ngDevMode && `Date format is too long. Exceeded maximum length of ${MAX_DATE_FORMAT_LENGTH} characters.`);
  }
}
/**
 * Asserts that the given date format is free from common mistakes.  Throws an
 * error if one is found (except for the case of all "Y", in which case we just
 * log a warning).  This should only be called in development mode.
 */
function assertValidDateFormat(parts) {
  if (parts.some(part => /^Y+$/.test(part)) && !parts.some(part => /^w+$/.test(part))) {
    // "Y" indicates "week-based year", which differs from the actual calendar
    // year for a few days around Jan 1 most years.  Unless "w" is also
    // present (e.g. a date like "2024-W52") this is likely a mistake.  Users
    // probably meant "y" instead.
    const message = `Suspicious use of week-based year "Y" in date pattern "${parts.join('')}". Did you mean to use calendar year "y" instead?`;
    if (parts.length === 1) {
      // NOTE: allow "YYYY" with just a warning, since it's used in tests.
      console.error((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2300 /* RuntimeErrorCode.SUSPICIOUS_DATE_FORMAT */, message));
    } else {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2300 /* RuntimeErrorCode.SUSPICIOUS_DATE_FORMAT */, message);
    }
  }
}
/**
 * Create a new Date object with the given date value, and the time set to midnight.
 *
 * We cannot use `new Date(year, month, date)` because it maps years between 0 and 99 to 1900-1999.
 * See: https://github.com/angular/angular/issues/40377
 *
 * Note that this function returns a Date object whose time is midnight in the current locale's
 * timezone. In the future we might want to change this to be midnight in UTC, but this would be a
 * considerable breaking change.
 */
function createDate(year, month, date) {
  // The `newDate` is set to midnight (UTC) on January 1st 1970.
  // - In PST this will be December 31st 1969 at 4pm.
  // - In GMT this will be January 1st 1970 at 1am.
  // Note that they even have different years, dates and months!
  const newDate = new Date(0);
  // `setFullYear()` allows years like 0001 to be set correctly. This function does not
  // change the internal time of the date.
  // Consider calling `setFullYear(2019, 8, 20)` (September 20, 2019).
  // - In PST this will now be September 20, 2019 at 4pm
  // - In GMT this will now be September 20, 2019 at 1am
  newDate.setFullYear(year, month, date);
  // We want the final date to be at local midnight, so we reset the time.
  // - In PST this will now be September 20, 2019 at 12am
  // - In GMT this will now be September 20, 2019 at 12am
  newDate.setHours(0, 0, 0);
  return newDate;
}
function getNamedFormat(locale, format) {
  const localeId = getLocaleId(locale);
  NAMED_FORMATS[localeId] ??= Object.create(null);
  if (NAMED_FORMATS[localeId][format]) {
    return NAMED_FORMATS[localeId][format];
  }
  let formatValue = '';
  switch (format) {
    case 'shortDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Short);
      break;
    case 'mediumDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Medium);
      break;
    case 'longDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Long);
      break;
    case 'fullDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Full);
      break;
    case 'shortTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Short);
      break;
    case 'mediumTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Medium);
      break;
    case 'longTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Long);
      break;
    case 'fullTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Full);
      break;
    case 'short':
      const shortTime = getNamedFormat(locale, 'shortTime');
      const shortDate = getNamedFormat(locale, 'shortDate');
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [shortTime, shortDate]);
      break;
    case 'medium':
      const mediumTime = getNamedFormat(locale, 'mediumTime');
      const mediumDate = getNamedFormat(locale, 'mediumDate');
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [mediumTime, mediumDate]);
      break;
    case 'long':
      const longTime = getNamedFormat(locale, 'longTime');
      const longDate = getNamedFormat(locale, 'longDate');
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
      break;
    case 'full':
      const fullTime = getNamedFormat(locale, 'fullTime');
      const fullDate = getNamedFormat(locale, 'fullDate');
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [fullTime, fullDate]);
      break;
  }
  if (formatValue) {
    NAMED_FORMATS[localeId][format] = formatValue;
  }
  return formatValue;
}
function formatDateTime(str, opt_values) {
  if (opt_values) {
    str = str.replace(/\{([^}]+)}/g, function (match, key) {
      return Object.hasOwn(opt_values, key) ? opt_values[key] : match;
    });
  }
  return str;
}
function padNumber(num, digits, minusSign = '-', trim, negWrap) {
  let neg = '';
  if (num < 0 || negWrap && num <= 0) {
    if (negWrap) {
      num = -num + 1;
    } else {
      num = -num;
      neg = minusSign;
    }
  }
  let strNum = String(num);
  while (strNum.length < digits) {
    strNum = '0' + strNum;
  }
  if (trim) {
    strNum = strNum.slice(strNum.length - digits);
  }
  return neg + strNum;
}
function formatFractionalSeconds(milliseconds, digits) {
  const strMs = padNumber(milliseconds, 3);
  return strMs.substring(0, digits);
}
/**
 * Returns a date formatter that transforms a date into its locale digit representation
 */
function dateGetter(name, size, offset = 0, trim = false, negWrap = false) {
  return function (date, locale) {
    let part = getDatePart(name, date);
    if (offset > 0 || part > -offset) {
      part += offset;
    }
    if (name === 3 /* DateType.Hours */) {
      if (part === 0 && offset === -12) {
        part = 12;
      }
    } else if (name === 6 /* DateType.FractionalSeconds */) {
      return formatFractionalSeconds(part, size);
    }
    const localeMinus = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
    return padNumber(part, size, localeMinus, trim, negWrap);
  };
}
function getDatePart(part, date) {
  switch (part) {
    case 0 /* DateType.FullYear */:
      return date.getFullYear();
    case 1 /* DateType.Month */:
      return date.getMonth();
    case 2 /* DateType.Date */:
      return date.getDate();
    case 3 /* DateType.Hours */:
      return date.getHours();
    case 4 /* DateType.Minutes */:
      return date.getMinutes();
    case 5 /* DateType.Seconds */:
      return date.getSeconds();
    case 6 /* DateType.FractionalSeconds */:
      return date.getMilliseconds();
    case 7 /* DateType.Day */:
      return date.getDay();
    default:
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2301 /* RuntimeErrorCode.UNKNOWN_DATE_TYPE_VALUE */, wx.__global.ngDevMode && `Unknown DateType value "${part}".`);
  }
}
/**
 * Returns a date formatter that transforms a date into its locale string representation
 */
function dateStrGetter(name, width, form = FormStyle.Format, extended = false) {
  return function (date, locale) {
    return getDateTranslation(date, locale, name, width, form, extended);
  };
}
/**
 * Returns the locale translation of a date for a given form, type and width
 */
function getDateTranslation(date, locale, name, width, form, extended) {
  switch (name) {
    case 2 /* TranslationType.Months */:
      return getLocaleMonthNames(locale, form, width)[date.getMonth()];
    case 1 /* TranslationType.Days */:
      return getLocaleDayNames(locale, form, width)[date.getDay()];
    case 0 /* TranslationType.DayPeriods */:
      const currentHours = date.getHours();
      const currentMinutes = date.getMinutes();
      if (extended) {
        const rules = getLocaleExtraDayPeriodRules(locale);
        const dayPeriods = getLocaleExtraDayPeriods(locale, form, width);
        const index = rules.findIndex(rule => {
          if (Array.isArray(rule)) {
            // morning, afternoon, evening, night
            const [from, to] = rule;
            const afterFrom = currentHours >= from.hours && currentMinutes >= from.minutes;
            const beforeTo = currentHours < to.hours || currentHours === to.hours && currentMinutes < to.minutes;
            // We must account for normal rules that span a period during the day (e.g. 6am-9am)
            // where `from` is less (earlier) than `to`. But also rules that span midnight (e.g.
            // 10pm - 5am) where `from` is greater (later!) than `to`.
            //
            // In the first case the current time must be BOTH after `from` AND before `to`
            // (e.g. 8am is after 6am AND before 10am).
            //
            // In the second case the current time must be EITHER after `from` OR before `to`
            // (e.g. 4am is before 5am but not after 10pm; and 11pm is not before 5am but it is
            // after 10pm).
            if (from.hours < to.hours) {
              if (afterFrom && beforeTo) {
                return true;
              }
            } else if (afterFrom || beforeTo) {
              return true;
            }
          } else {
            // noon or midnight
            if (rule.hours === currentHours && rule.minutes === currentMinutes) {
              return true;
            }
          }
          return false;
        });
        if (index !== -1) {
          return dayPeriods[index];
        }
      }
      // if no rules for the day periods, we use am/pm by default
      return getLocaleDayPeriods(locale, form, width)[currentHours < 12 ? 0 : 1];
    case 3 /* TranslationType.Eras */:
      return getLocaleEraNames(locale, width)[date.getFullYear() <= 0 ? 0 : 1];
    default:
      // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
      // However Closure Compiler does not understand that and reports an error in typed mode.
      // The `throw new Error` below works around the problem, and the unexpected: never variable
      // makes sure tsc still checks this code is unreachable.
      const unexpected = name;
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2302 /* RuntimeErrorCode.UNEXPECTED_TRANSLATION_TYPE */, wx.__global.ngDevMode && `unexpected translation type ${unexpected}`);
  }
}
/**
 * Returns a date formatter that transforms a date and an offset into a timezone with ISO8601 or
 * GMT format depending on the width (eg: short = +0430, short:GMT = GMT+4, long = GMT+04:30,
 * extended = +04:30)
 */
function timeZoneGetter(width) {
  return function (date, locale, offset) {
    const zone = -1 * offset;
    const minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
    const hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
    switch (width) {
      case 0 /* ZoneWidth.Short */:
        return (zone >= 0 ? '+' : '') + padNumber(hours, 2, minusSign) + padNumber(Math.abs(zone % 60), 2, minusSign);
      case 1 /* ZoneWidth.ShortGMT */:
        return 'GMT' + (zone >= 0 ? '+' : '') + padNumber(hours, 1, minusSign);
      case 2 /* ZoneWidth.Long */:
        return 'GMT' + (zone >= 0 ? '+' : '') + padNumber(hours, 2, minusSign) + ':' + padNumber(Math.abs(zone % 60), 2, minusSign);
      case 3 /* ZoneWidth.Extended */:
        if (offset === 0) {
          return 'Z';
        } else {
          return (zone >= 0 ? '+' : '') + padNumber(hours, 2, minusSign) + ':' + padNumber(Math.abs(zone % 60), 2, minusSign);
        }
      default:
        throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2310 /* RuntimeErrorCode.UNKNOWN_ZONE_WIDTH */, wx.__global.ngDevMode && `Unknown zone width "${width}"`);
    }
  };
}
const JANUARY = 0;
const THURSDAY = 4;
function getFirstThursdayOfYear(year) {
  const firstDayOfYear = createDate(year, JANUARY, 1).getDay();
  return createDate(year, 0, 1 + (firstDayOfYear <= THURSDAY ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
/**
 *  ISO Week starts on day 1 (Monday) and ends with day 0 (Sunday)
 */
function getThursdayThisIsoWeek(datetime) {
  // getDay returns 0-6 range with sunday as 0.
  const currentDay = datetime.getDay();
  // On a Sunday, read the previous Thursday since ISO weeks start on Monday.
  const deltaToThursday = currentDay === 0 ? -3 : THURSDAY - currentDay;
  return createDate(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + deltaToThursday);
}
function weekGetter(size, monthBased = false) {
  return function (date, locale) {
    let result;
    if (monthBased) {
      const nbDaysBefore1stDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
      const today = date.getDate();
      result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
    } else {
      const thisThurs = getThursdayThisIsoWeek(date);
      // Some days of a year are part of next year according to ISO 8601.
      // Compute the firstThurs from the year of this week's Thursday
      const firstThurs = getFirstThursdayOfYear(thisThurs.getFullYear());
      const diff = thisThurs.getTime() - firstThurs.getTime();
      result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week
    }
    return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  };
}
/**
 * Returns a date formatter that provides the week-numbering year for the input date.
 */
function weekNumberingYearGetter(size, trim = false) {
  return function (date, locale) {
    const thisThurs = getThursdayThisIsoWeek(date);
    const weekNumberingYear = thisThurs.getFullYear();
    return padNumber(weekNumberingYear, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim);
  };
}
// tslint:disable-next-line:no-toplevel-property-access
const DATE_FORMATS = Object.create(null);
// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: U, Q, D, F, e, j, J, C, A, v, V, X, x
function getDateFormatter(format) {
  if (DATE_FORMATS[format]) {
    return DATE_FORMATS[format];
  }
  let formatter;
  switch (format) {
    // Era name (AD/BC)
    case 'G':
    case 'GG':
    case 'GGG':
      formatter = dateStrGetter(3 /* TranslationType.Eras */, TranslationWidth.Abbreviated);
      break;
    case 'GGGG':
      formatter = dateStrGetter(3 /* TranslationType.Eras */, TranslationWidth.Wide);
      break;
    case 'GGGGG':
      formatter = dateStrGetter(3 /* TranslationType.Eras */, TranslationWidth.Narrow);
      break;
    // 1 digit representation of the year, e.g. (AD 1 => 1, AD 199 => 199)
    case 'y':
      formatter = dateGetter(0 /* DateType.FullYear */, 1, 0, false, true);
      break;
    // 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
    case 'yy':
      formatter = dateGetter(0 /* DateType.FullYear */, 2, 0, true, true);
      break;
    // 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
    case 'yyy':
      formatter = dateGetter(0 /* DateType.FullYear */, 3, 0, false, true);
      break;
    // 4 digit representation of the year (e.g. AD 1 => 0001, AD 2010 => 2010)
    case 'yyyy':
      formatter = dateGetter(0 /* DateType.FullYear */, 4, 0, false, true);
      break;
    // 1 digit representation of the week-numbering year, e.g. (AD 1 => 1, AD 199 => 199)
    case 'Y':
      formatter = weekNumberingYearGetter(1);
      break;
    // 2 digit representation of the week-numbering year, padded (00-99). (e.g. AD 2001 => 01, AD
    // 2010 => 10)
    case 'YY':
      formatter = weekNumberingYearGetter(2, true);
      break;
    // 3 digit representation of the week-numbering year, padded (000-999). (e.g. AD 1 => 001, AD
    // 2010 => 2010)
    case 'YYY':
      formatter = weekNumberingYearGetter(3);
      break;
    // 4 digit representation of the week-numbering year (e.g. AD 1 => 0001, AD 2010 => 2010)
    case 'YYYY':
      formatter = weekNumberingYearGetter(4);
      break;
    // Month of the year (1-12), numeric
    case 'M':
    case 'L':
      formatter = dateGetter(1 /* DateType.Month */, 1, 1);
      break;
    case 'MM':
    case 'LL':
      formatter = dateGetter(1 /* DateType.Month */, 2, 1);
      break;
    // Month of the year (January, ...), string, format
    case 'MMM':
      formatter = dateStrGetter(2 /* TranslationType.Months */, TranslationWidth.Abbreviated);
      break;
    case 'MMMM':
      formatter = dateStrGetter(2 /* TranslationType.Months */, TranslationWidth.Wide);
      break;
    case 'MMMMM':
      formatter = dateStrGetter(2 /* TranslationType.Months */, TranslationWidth.Narrow);
      break;
    // Month of the year (January, ...), string, standalone
    case 'LLL':
      formatter = dateStrGetter(2 /* TranslationType.Months */, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case 'LLLL':
      formatter = dateStrGetter(2 /* TranslationType.Months */, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case 'LLLLL':
      formatter = dateStrGetter(2 /* TranslationType.Months */, TranslationWidth.Narrow, FormStyle.Standalone);
      break;
    // Week of the year (1, ... 52)
    case 'w':
      formatter = weekGetter(1);
      break;
    case 'ww':
      formatter = weekGetter(2);
      break;
    // Week of the month (1, ...)
    case 'W':
      formatter = weekGetter(1, true);
      break;
    // Day of the month (1-31)
    case 'd':
      formatter = dateGetter(2 /* DateType.Date */, 1);
      break;
    case 'dd':
      formatter = dateGetter(2 /* DateType.Date */, 2);
      break;
    // Day of the Week StandAlone (1, 1, Mon, Monday, M, Mo)
    case 'c':
    case 'cc':
      formatter = dateGetter(7 /* DateType.Day */, 1);
      break;
    case 'ccc':
      formatter = dateStrGetter(1 /* TranslationType.Days */, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case 'cccc':
      formatter = dateStrGetter(1 /* TranslationType.Days */, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case 'ccccc':
      formatter = dateStrGetter(1 /* TranslationType.Days */, TranslationWidth.Narrow, FormStyle.Standalone);
      break;
    case 'cccccc':
      formatter = dateStrGetter(1 /* TranslationType.Days */, TranslationWidth.Short, FormStyle.Standalone);
      break;
    // Day of the Week
    case 'E':
    case 'EE':
    case 'EEE':
      formatter = dateStrGetter(1 /* TranslationType.Days */, TranslationWidth.Abbreviated);
      break;
    case 'EEEE':
      formatter = dateStrGetter(1 /* TranslationType.Days */, TranslationWidth.Wide);
      break;
    case 'EEEEE':
      formatter = dateStrGetter(1 /* TranslationType.Days */, TranslationWidth.Narrow);
      break;
    case 'EEEEEE':
      formatter = dateStrGetter(1 /* TranslationType.Days */, TranslationWidth.Short);
      break;
    // Generic period of the day (am-pm)
    case 'a':
    case 'aa':
    case 'aaa':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Abbreviated);
      break;
    case 'aaaa':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Wide);
      break;
    case 'aaaaa':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Narrow);
      break;
    // Extended period of the day (midnight, at night, ...), standalone
    case 'b':
    case 'bb':
    case 'bbb':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
      break;
    case 'bbbb':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Wide, FormStyle.Standalone, true);
      break;
    case 'bbbbb':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Narrow, FormStyle.Standalone, true);
      break;
    // Extended period of the day (midnight, night, ...), standalone
    case 'B':
    case 'BB':
    case 'BBB':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Abbreviated, FormStyle.Format, true);
      break;
    case 'BBBB':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Wide, FormStyle.Format, true);
      break;
    case 'BBBBB':
      formatter = dateStrGetter(0 /* TranslationType.DayPeriods */, TranslationWidth.Narrow, FormStyle.Format, true);
      break;
    // Hour in AM/PM, (1-12)
    case 'h':
      formatter = dateGetter(3 /* DateType.Hours */, 1, -12);
      break;
    case 'hh':
      formatter = dateGetter(3 /* DateType.Hours */, 2, -12);
      break;
    // Hour of the day (0-23)
    case 'H':
      formatter = dateGetter(3 /* DateType.Hours */, 1);
      break;
    // Hour in day, padded (00-23)
    case 'HH':
      formatter = dateGetter(3 /* DateType.Hours */, 2);
      break;
    // Minute of the hour (0-59)
    case 'm':
      formatter = dateGetter(4 /* DateType.Minutes */, 1);
      break;
    case 'mm':
      formatter = dateGetter(4 /* DateType.Minutes */, 2);
      break;
    // Second of the minute (0-59)
    case 's':
      formatter = dateGetter(5 /* DateType.Seconds */, 1);
      break;
    case 'ss':
      formatter = dateGetter(5 /* DateType.Seconds */, 2);
      break;
    // Fractional second
    case 'S':
      formatter = dateGetter(6 /* DateType.FractionalSeconds */, 1);
      break;
    case 'SS':
      formatter = dateGetter(6 /* DateType.FractionalSeconds */, 2);
      break;
    case 'SSS':
      formatter = dateGetter(6 /* DateType.FractionalSeconds */, 3);
      break;
    // Timezone ISO8601 short format (-0430)
    case 'Z':
    case 'ZZ':
    case 'ZZZ':
      formatter = timeZoneGetter(0 /* ZoneWidth.Short */);
      break;
    // Timezone ISO8601 extended format (-04:30)
    case 'ZZZZZ':
      formatter = timeZoneGetter(3 /* ZoneWidth.Extended */);
      break;
    // Timezone GMT short format (GMT+4)
    case 'O':
    case 'OO':
    case 'OOO':
    // Should be location, but fallback to format O instead because we don't have the data yet
    case 'z':
    case 'zz':
    case 'zzz':
      formatter = timeZoneGetter(1 /* ZoneWidth.ShortGMT */);
      break;
    // Timezone GMT long format (GMT+0430)
    case 'OOOO':
    case 'ZZZZ':
    // Should be location, but fallback to format O instead because we don't have the data yet
    case 'zzzz':
      formatter = timeZoneGetter(2 /* ZoneWidth.Long */);
      break;
    default:
      return null;
  }
  DATE_FORMATS[format] = formatter;
  return formatter;
}
function timezoneToOffset(timezone, fallback) {
  // Support: IE 11 only, Edge 13-15+
  // IE/Edge do not "understand" colon (`:`) in timezone
  timezone = timezone.replace(/:/g, '');
  const requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
  return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}
function addDateMinutes(date, minutes) {
  date = new Date(date.getTime());
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}
function convertTimezoneToLocal(date, timezone, reverse) {
  const reverseValue = reverse ? -1 : 1;
  const dateTimezoneOffset = date.getTimezoneOffset();
  const timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
  return addDateMinutes(date, reverseValue * (timezoneOffset - dateTimezoneOffset));
}
/**
 * Converts a value to date.
 *
 * Supported input formats:
 * - `Date`
 * - number: timestamp
 * - string: numeric (e.g. "1234"), ISO and date strings in a format supported by
 *   [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
 *   Note: ISO strings without time return a date without timeoffset.
 *
 * Throws if unable to convert to a date.
 */
function toDate(value) {
  if (isDate(value)) {
    return value;
  }
  if (typeof value === 'number' && !isNaN(value)) {
    return new Date(value);
  }
  if (typeof value === 'string') {
    value = value.trim();
    if (/^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(value)) {
      /* For ISO Strings without time the day, month and year must be extracted from the ISO String
      before Date creation to avoid time offset and errors in the new Date.
      If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
      date, some browsers (e.g. IE 9) will throw an invalid Date error.
      If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
      is applied.
      Note: ISO months are 0 for January, 1 for February, ... */
      const [y, m = 1, d = 1] = value.split('-').map(val => +val);
      return createDate(y, m - 1, d);
    }
    const parsedNb = parseFloat(value);
    // any string that only contains numbers, like "1234" but not like "1234hello"
    if (!isNaN(value - parsedNb)) {
      return new Date(parsedNb);
    }
    let match;
    if (match = value.match(ISO8601_DATE_REGEX)) {
      return isoStringToDate(match);
    }
  }
  const date = new Date(value);
  if (!isDate(date)) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2311 /* RuntimeErrorCode.INVALID_TO_DATE_CONVERSION */, wx.__global.ngDevMode && `Unable to convert "${value}" into a date`);
  }
  return date;
}
/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 */
function isoStringToDate(match) {
  const date = new Date(0);
  let tzHour = 0;
  let tzMin = 0;
  // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
  const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
  const timeSetter = match[8] ? date.setUTCHours : date.setHours;
  // if there is a timezone defined like "+01:00" or "+0100"
  if (match[9]) {
    tzHour = Number(match[9] + match[10]);
    tzMin = Number(match[9] + match[11]);
  }
  dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const h = Number(match[4] || 0) - tzHour;
  const m = Number(match[5] || 0) - tzMin;
  const s = Number(match[6] || 0);
  // The ECMAScript specification (https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.11)
  // defines that `DateTime` milliseconds should always be rounded down, so that `999.9ms`
  // becomes `999ms`.
  const ms = Math.floor(parseFloat('0.' + (match[7] || 0)) * 1000);
  timeSetter.call(date, h, m, s, ms);
  return date;
}
function isDate(value) {
  return value instanceof Date && !isNaN(value.valueOf());
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * The default date format of Angular date pipe, which corresponds to the following format:
 * `'MMM d,y'` (e.g. `Jun 15, 2015`)
 */
const DEFAULT_DATE_FORMAT = 'mediumDate';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Optionally-provided default timezone to use for all instances of `DatePipe` (such as `'+0430'`).
 * If the value isn't provided, the `DatePipe` will use the end-user's local system timezone.
 *
 * @deprecated use DATE_PIPE_DEFAULT_OPTIONS token to configure DatePipe
 */
const DATE_PIPE_DEFAULT_TIMEZONE = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'DATE_PIPE_DEFAULT_TIMEZONE' : '');
/**
 * DI token that allows to provide default configuration for the `DatePipe` instances in an
 * application. The value is an object which can include the following fields:
 * - `dateFormat`: configures the default date format. If not provided, the `DatePipe`
 * will use the 'mediumDate' as a value.
 * - `timezone`: configures the default timezone. If not provided, the `DatePipe` will
 * use the end-user's local system timezone.
 *
 * @see {@link DatePipeConfig}
 *
 * @usageNotes
 *
 * Various date pipe default values can be overwritten by providing this token with
 * the value that has this interface.
 *
 * For example:
 *
 * Override the default date format by providing a value using the token:
 * ```ts
 * providers: [
 *   {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {dateFormat: 'shortDate'}}
 * ]
 * ```
 *
 * Override the default timezone by providing a value using the token:
 * ```ts
 * providers: [
 *   {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {timezone: '-1200'}}
 * ]
 * ```
 */
const DATE_PIPE_DEFAULT_OPTIONS = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'DATE_PIPE_DEFAULT_OPTIONS' : '');
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date value according to locale rules.
 *
 * `DatePipe` is executed only when it detects a pure change to the input value.
 * A pure change is either a change to a primitive input value
 * (such as `String`, `Number`, `Boolean`, or `Symbol`),
 * or a changed object reference (such as `Date`, `Array`, `Function`, or `Object`).
 *
 * Note that mutating a `Date` object does not cause the pipe to be rendered again.
 * To ensure that the pipe is executed, you must create a new `Date` object.
 *
 * Only the `en-US` locale data comes with Angular. To localize dates
 * in another language, you must import the corresponding locale data.
 * See the [I18n guide](guide/i18n/format-data-locale) for more information.
 *
 * The time zone of the formatted value can be specified either by passing it in as the second
 * parameter of the pipe, or by setting the default through the `DATE_PIPE_DEFAULT_OPTIONS`
 * injection token. The value that is passed in as the second parameter takes precedence over
 * the one defined using the injection token.
 *
 * @see {@link formatDate}
 *
 *
 * @usageNotes
 *
 * The result of this pipe is not reevaluated when the input is mutated. To avoid the need to
 * reformat the date on every change-detection cycle, treat the date as an immutable object
 * and change the reference when the pipe needs to run again.
 *
 * ### Pre-defined format options
 *
 * | Option        | Equivalent to                       | Examples (given in `en-US` locale)              |
 * |---------------|-------------------------------------|-------------------------------------------------|
 * | `'short'`     | `'M/d/yy, h:mm a'`                  | `6/15/15, 9:03 AM`                              |
 * | `'medium'`    | `'MMM d, y, h:mm:ss a'`             | `Jun 15, 2015, 9:03:01 AM`                      |
 * | `'long'`      | `'MMMM d, y, h:mm:ss a z'`          | `June 15, 2015 at 9:03:01 AM GMT+1`             |
 * | `'full'`      | `'EEEE, MMMM d, y, h:mm:ss a zzzz'` | `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00` |
 * | `'shortDate'` | `'M/d/yy'`                          | `6/15/15`                                       |
 * | `'mediumDate'`| `'MMM d, y'`                        | `Jun 15, 2015`                                  |
 * | `'longDate'`  | `'MMMM d, y'`                       | `June 15, 2015`                                 |
 * | `'fullDate'`  | `'EEEE, MMMM d, y'`                 | `Monday, June 15, 2015`                         |
 * | `'shortTime'` | `'h:mm a'`                          | `9:03 AM`                                       |
 * | `'mediumTime'`| `'h:mm:ss a'`                       | `9:03:01 AM`                                    |
 * | `'longTime'`  | `'h:mm:ss a z'`                     | `9:03:01 AM GMT+1`                              |
 * | `'fullTime'`  | `'h:mm:ss a zzzz'`                  | `9:03:01 AM GMT+01:00`                          |
 *
 * ### Custom format options
 *
 * You can construct a format string using symbols to specify the components
 * of a date-time value, as described in the following table.
 * Format details depend on the locale.
 * Fields marked with (*) are only available in the extra data set for the given locale.
 *
 *  | Field type              | Format      | Description                                                   | Example Value                                              |
 *  |-------------------------|-------------|---------------------------------------------------------------|------------------------------------------------------------|
 *  | Era                     | G, GG & GGG | Abbreviated                                                   | AD                                                         |
 *  |                         | GGGG        | Wide                                                          | Anno Domini                                                |
 *  |                         | GGGGG       | Narrow                                                        | A                                                          |
 *  | Year                    | y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                         | yy          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                         | yyy         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                         | yyyy        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | ISO Week-numbering year | Y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                         | YY          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                         | YYY         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                         | YYYY        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | Month                   | M           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                         | MM          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                         | MMM         | Abbreviated                                                   | Sep                                                        |
 *  |                         | MMMM        | Wide                                                          | September                                                  |
 *  |                         | MMMMM       | Narrow                                                        | S                                                          |
 *  | Month standalone        | L           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                         | LL          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                         | LLL         | Abbreviated                                                   | Sep                                                        |
 *  |                         | LLLL        | Wide                                                          | September                                                  |
 *  |                         | LLLLL       | Narrow                                                        | S                                                          |
 *  | ISO Week of year        | w           | Numeric: minimum digits                                       | 1... 53                                                    |
 *  |                         | ww          | Numeric: 2 digits + zero padded                               | 01... 53                                                   |
 *  | Week of month           | W           | Numeric: 1 digit                                              | 1... 5                                                     |
 *  | Day of month            | d           | Numeric: minimum digits                                       | 1                                                          |
 *  |                         | dd          | Numeric: 2 digits + zero padded                               | 01                                                         |
 *  | Week day                | E, EE & EEE | Abbreviated                                                   | Tue                                                        |
 *  |                         | EEEE        | Wide                                                          | Tuesday                                                    |
 *  |                         | EEEEE       | Narrow                                                        | T                                                          |
 *  |                         | EEEEEE      | Short                                                         | Tu                                                         |
 *  | Week day standalone     | c, cc       | Numeric: 1 digit                                              | 2                                                          |
 *  |                         | ccc         | Abbreviated                                                   | Tue                                                        |
 *  |                         | cccc        | Wide                                                          | Tuesday                                                    |
 *  |                         | ccccc       | Narrow                                                        | T                                                          |
 *  |                         | cccccc      | Short                                                         | Tu                                                         |
 *  | Period                  | a, aa & aaa | Abbreviated                                                   | am/pm or AM/PM                                             |
 *  |                         | aaaa        | Wide (fallback to `a` when missing)                           | ante meridiem/post meridiem                                |
 *  |                         | aaaaa       | Narrow                                                        | a/p                                                        |
 *  | Period*                 | B, BB & BBB | Abbreviated                                                   | mid.                                                       |
 *  |                         | BBBB        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                         | BBBBB       | Narrow                                                        | md                                                         |
 *  | Period standalone*      | b, bb & bbb | Abbreviated                                                   | mid.                                                       |
 *  |                         | bbbb        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                         | bbbbb       | Narrow                                                        | md                                                         |
 *  | Hour 1-12               | h           | Numeric: minimum digits                                       | 1, 12                                                      |
 *  |                         | hh          | Numeric: 2 digits + zero padded                               | 01, 12                                                     |
 *  | Hour 0-23               | H           | Numeric: minimum digits                                       | 0, 23                                                      |
 *  |                         | HH          | Numeric: 2 digits + zero padded                               | 00, 23                                                     |
 *  | Minute                  | m           | Numeric: minimum digits                                       | 8, 59                                                      |
 *  |                         | mm          | Numeric: 2 digits + zero padded                               | 08, 59                                                     |
 *  | Second                  | s           | Numeric: minimum digits                                       | 0... 59                                                    |
 *  |                         | ss          | Numeric: 2 digits + zero padded                               | 00... 59                                                   |
 *  | Fractional seconds      | S           | Numeric: 1 digit                                              | 0... 9                                                     |
 *  |                         | SS          | Numeric: 2 digits + zero padded                               | 00... 99                                                   |
 *  |                         | SSS         | Numeric: 3 digits + zero padded (= milliseconds)              | 000... 999                                                 |
 *  | Zone                    | z, zz & zzz | Short specific non location format (fallback to O)            | GMT-8                                                      |
 *  |                         | zzzz        | Long specific non location format (fallback to OOOO)          | GMT-08:00                                                  |
 *  |                         | Z, ZZ & ZZZ | ISO8601 basic format                                          | -0800                                                      |
 *  |                         | ZZZZ        | Long localized GMT format                                     | GMT-8:00                                                   |
 *  |                         | ZZZZZ       | ISO8601 extended format + Z indicator for offset 0 (= XXXXX)  | -08:00                                                     |
 *  |                         | O, OO & OOO | Short localized GMT format                                    | GMT-8                                                      |
 *  |                         | OOOO        | Long localized GMT format                                     | GMT-08:00                                                  |
 *
 *
 * ### Format examples
 *
 * These examples transform a date into various formats,
 * assuming that `dateObj` is a JavaScript `Date` object for
 * year: 2015, month: 6, day: 15, hour: 21, minute: 43, second: 11,
 * given in the local time for the `en-US` locale.
 *
 * ```
 * {{ dateObj | date }}               // output is 'Jun 15, 2015'
 * {{ dateObj | date:'medium' }}      // output is 'Jun 15, 2015, 9:43:11 PM'
 * {{ dateObj | date:'shortTime' }}   // output is '9:43 PM'
 * {{ dateObj | date:'mm:ss' }}       // output is '43:11'
 * {{ dateObj | date:"MMM dd, yyyy 'at' hh:mm a" }}  // output is 'Jun 15, 2015 at 09:43 PM'
 * ```
 *
 * ### Usage example
 *
 * The following component uses a date pipe to display the current date in different formats.
 *
 * ```angular-ts
 * @Component({
 *  selector: 'date-pipe',
 *  template: `<div>
 *    <p>Today is {{today | date}}</p>
 *    <p>Or if you prefer, {{today | date:'fullDate'}}</p>
 *    <p>The time is {{today | date:'h:mm a z'}}</p>
 *  </div>`
 * })
 * // Get the current date and time as a date-time value.
 * export class DatePipeComponent {
 *   today: number = Date.now();
 * }
 * ```
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @publicApi
 */
class DatePipe {
  locale;
  defaultTimezone;
  defaultOptions;
  constructor(locale, defaultTimezone, defaultOptions) {
    this.locale = locale;
    this.defaultTimezone = defaultTimezone;
    this.defaultOptions = defaultOptions;
  }
  transform(value, format, timezone, locale) {
    if (value == null || value === '' || value !== value) return null;
    try {
      const _format = format ?? this.defaultOptions?.dateFormat ?? DEFAULT_DATE_FORMAT;
      const _timezone = timezone ?? this.defaultOptions?.timezone ?? this.defaultTimezone ?? undefined;
      return formatDate(value, _format, locale || this.locale, _timezone);
    } catch (error) {
      throw invalidPipeArgumentError(DatePipe, error.message);
    }
  }
  static ɵfac = function DatePipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || DatePipe)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID, 16), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](DATE_PIPE_DEFAULT_TIMEZONE, 24), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](DATE_PIPE_DEFAULT_OPTIONS, 24));
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "date",
    type: DatePipe,
    pure: true
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(DatePipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'date'
    }]
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [DATE_PIPE_DEFAULT_TIMEZONE]
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Optional
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [DATE_PIPE_DEFAULT_OPTIONS]
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Optional
    }]
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
 * @ngModule CommonModule
 * @description
 *
 * Converts a value into its JSON-format representation.  Useful for debugging.
 *
 * @usageNotes
 *
 * The following component uses a JSON pipe to convert an object
 * to JSON format, and displays the string in both formats for comparison.
 *
 * {@example common/pipes/ts/json_pipe.ts region='JsonPipe'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @publicApi
 */
class JsonPipe {
  /**
   * @param value A value of any type to convert into a JSON-format string.
   */
  transform(value) {
    wx.__global.ngDevMode && warnIfSignal('JsonPipe', value);
    return JSON.stringify(value, null, 2);
  }
  static ɵfac = function JsonPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || JsonPipe)();
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "json",
    type: JsonPipe,
    pure: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(JsonPipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'json',
      pure: false
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
function makeKeyValuePair(key, value) {
  return {
    key: key,
    value: value
  };
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms Object or Map into an array of key value pairs.
 *
 * The output array will be ordered by keys.
 * By default the comparator will be by Unicode point value.
 * You can optionally pass a compareFn if your keys are complex types.
 * Passing `null` as the compareFn will use natural ordering of the input.
 *
 * @usageNotes
 * ### Examples
 *
 * This examples show how an Object or a Map can be iterated by ngFor with the use of this
 * keyvalue pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @publicApi
 */
class KeyValuePipe {
  differs;
  constructor(differs) {
    this.differs = differs;
  }
  differ;
  keyValues = [];
  compareFn = defaultComparator;
  transform(input, compareFn = defaultComparator) {
    wx.__global.ngDevMode && warnIfSignal('KeyValuePipe', input);
    if (!input || !(input instanceof Map) && typeof input !== 'object') {
      return null;
    }
    // make a differ for whatever type we've been passed in
    this.differ ??= this.differs.find(input).create();
    const differChanges = this.differ.diff(input);
    const compareFnChanged = compareFn !== this.compareFn;
    if (differChanges) {
      this.keyValues = [];
      differChanges.forEachItem(r => {
        this.keyValues.push(makeKeyValuePair(r.key, r.currentValue));
      });
    }
    if (differChanges || compareFnChanged) {
      if (compareFn) {
        this.keyValues.sort(compareFn);
      }
      this.compareFn = compareFn;
    }
    return this.keyValues;
  }
  static ɵfac = function KeyValuePipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || KeyValuePipe)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.KeyValueDiffers, 16));
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "keyvalue",
    type: KeyValuePipe,
    pure: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(KeyValuePipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'keyvalue',
      pure: false
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.KeyValueDiffers
  }], null);
})();
function defaultComparator(keyValueA, keyValueB) {
  const a = keyValueA.key;
  const b = keyValueB.key;
  // If both keys are the same, return 0 (no sorting needed).
  if (a === b) return 0;
  // If one of the keys is `null` or `undefined`, place it at the end of the sort.
  if (a == null) return 1; // `a` comes after `b`.
  if (b == null) return -1; // `b` comes after `a`.
  // If both keys are strings, compare them lexicographically.
  if (typeof a == 'string' && typeof b == 'string') {
    return a < b ? -1 : 1;
  }
  // If both keys are numbers, sort them numerically.
  if (typeof a == 'number' && typeof b == 'number') {
    return a - b;
  }
  // If both keys are booleans, sort `false` before `true`.
  if (typeof a == 'boolean' && typeof b == 'boolean') {
    return a < b ? -1 : 1;
  }
  // Fallback case: if keys are of different types, compare their string representations.
  const aString = String(a);
  const bString = String(b);
  // Compare the string representations lexicographically.
  return aString == bString ? 0 : aString < bString ? -1 : 1;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
const MAX_DIGITS = 22;
const DECIMAL_SEP = '.';
const ZERO_CHAR = '0';
const PATTERN_SEP = ';';
const GROUP_SEP = ',';
const DIGIT_CHAR = '#';
const CURRENCY_CHAR = '¤';
const PERCENT_CHAR = '%';
/**
 * Transforms a number to a locale string based on a style and a format.
 */
function formatNumberToLocaleString(value, pattern, locale, groupSymbol, decimalSymbol, digitsInfo, isPercent = false) {
  let formattedText = '';
  let isZero = false;
  if (!isFinite(value)) {
    // `Number.isNaN` (not `!isFinite`) so NaN uses the locale NaN symbol, not Infinity.
    formattedText = getLocaleNumberSymbol(locale, Number.isNaN(value) ? NumberSymbol.NaN : NumberSymbol.Infinity);
  } else {
    let parsedNumber = parseNumber(value);
    if (isPercent) {
      parsedNumber = toPercent(parsedNumber);
    }
    let minInt = pattern.minInt;
    let minFraction = pattern.minFrac;
    let maxFraction = pattern.maxFrac;
    if (digitsInfo) {
      const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
      if (parts === null) {
        throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2306 /* RuntimeErrorCode.INVALID_DIGIT_INFO */, wx.__global.ngDevMode && `${digitsInfo} is not a valid digit info`);
      }
      const minIntPart = parts[1];
      const minFractionPart = parts[3];
      const maxFractionPart = parts[5];
      if (minIntPart != null) {
        minInt = parseIntAutoRadix(minIntPart);
      }
      if (minFractionPart != null) {
        minFraction = parseIntAutoRadix(minFractionPart);
      }
      if (maxFractionPart != null) {
        maxFraction = parseIntAutoRadix(maxFractionPart);
      } else if (minFractionPart != null && minFraction > maxFraction) {
        maxFraction = minFraction;
      }
      // Prevent DoS via resource exhaustion by capping the maximum padding iterations
      const MAX_ALLOWED_DIGITS = 100;
      if (minInt > MAX_ALLOWED_DIGITS || minFraction > MAX_ALLOWED_DIGITS || maxFraction > MAX_ALLOWED_DIGITS) {
        throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2306 /* RuntimeErrorCode.INVALID_DIGIT_INFO */, wx.__global.ngDevMode && `${digitsInfo} is not a valid digit info. Exceeded maximum limits of ${MAX_ALLOWED_DIGITS} digits.`);
      }
    }
    roundNumber(parsedNumber, minFraction, maxFraction);
    let digits = parsedNumber.digits;
    let integerLen = parsedNumber.integerLen;
    const exponent = parsedNumber.exponent;
    let decimals = [];
    isZero = digits.every(d => !d);
    // pad zeros for small numbers
    for (; integerLen < minInt; integerLen++) {
      digits.unshift(0);
    }
    // pad zeros for small numbers
    for (; integerLen < 0; integerLen++) {
      digits.unshift(0);
    }
    // extract decimals digits
    if (integerLen > 0) {
      decimals = digits.splice(integerLen, digits.length);
    } else {
      decimals = digits;
      digits = [0];
    }
    // format the integer digits with grouping separators
    const groups = [];
    if (digits.length >= pattern.lgSize) {
      groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(''));
    }
    while (digits.length > pattern.gSize) {
      groups.unshift(digits.splice(-pattern.gSize, digits.length).join(''));
    }
    if (digits.length) {
      groups.unshift(digits.join(''));
    }
    formattedText = groups.join(getLocaleNumberSymbol(locale, groupSymbol));
    // append the decimal digits
    if (decimals.length) {
      formattedText += getLocaleNumberSymbol(locale, decimalSymbol) + decimals.join('');
    }
    if (exponent) {
      formattedText += getLocaleNumberSymbol(locale, NumberSymbol.Exponential) + '+' + exponent;
    }
  }
  if (value < 0 && !isZero) {
    formattedText = pattern.negPre + formattedText + pattern.negSuf;
  } else {
    formattedText = pattern.posPre + formattedText + pattern.posSuf;
  }
  return formattedText;
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param currency A string containing the currency symbol or its name,
 * such as "$" or "Canadian Dollar". Used in output string, but does not affect the operation
 * of the function.
 * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
 * currency code, such as `USD` for the US dollar and `EUR` for the euro.
 * Used to determine the number of digits in the decimal part.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted currency value.
 *
 * @see {@link formatNumber}
 * @see {@link DecimalPipe}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 */
function formatCurrency(value, locale, currency, currencyCode, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  pattern.minFrac = getNumberOfCurrencyDigits(currencyCode);
  pattern.maxFrac = pattern.minFrac;
  const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
  return res.replace(CURRENCY_CHAR, currency)
  // if we have 2 time the currency character, the second one is ignored
  .replace(CURRENCY_CHAR, '')
  // If there is a spacing between currency character and the value and
  // the currency character is suppressed by passing an empty string, the
  // spacing character would remain as part of the string. Then we
  // should remove it.
  .trim();
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as a percentage according to locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted percentage value.
 *
 * @see {@link formatNumber}
 * @see {@link DecimalPipe}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 * @publicApi
 *
 */
function formatPercent(value, locale, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
  return res.replace(new RegExp(PERCENT_CHAR, 'g'), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as text, with group sizing, separator, and other
 * parameters based on the locale.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted text string.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 */
function formatNumber(value, locale, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  return formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}
function parseNumberFormat(format, minusSign = '-') {
  const p = {
    minInt: 1,
    minFrac: 0,
    maxFrac: 0,
    posPre: '',
    posSuf: '',
    negPre: '',
    negSuf: '',
    gSize: 0,
    lgSize: 0
  };
  const patternParts = format.split(PATTERN_SEP);
  const positive = patternParts[0];
  const negative = patternParts[1];
  const positiveParts = positive.indexOf(DECIMAL_SEP) !== -1 ? positive.split(DECIMAL_SEP) : [positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1), positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1)],
    integer = positiveParts[0],
    fraction = positiveParts[1] || '';
  p.posPre = integer.substring(0, integer.indexOf(DIGIT_CHAR));
  for (let i = 0; i < fraction.length; i++) {
    const ch = fraction.charAt(i);
    if (ch === ZERO_CHAR) {
      p.minFrac = p.maxFrac = i + 1;
    } else if (ch === DIGIT_CHAR) {
      p.maxFrac = i + 1;
    } else {
      p.posSuf += ch;
    }
  }
  const groups = integer.split(GROUP_SEP);
  p.gSize = groups[1] ? groups[1].length : 0;
  p.lgSize = groups[2] || groups[1] ? (groups[2] || groups[1]).length : 0;
  if (negative) {
    const trunkLen = positive.length - p.posPre.length - p.posSuf.length,
      pos = negative.indexOf(DIGIT_CHAR);
    p.negPre = negative.substring(0, pos).replace(/'/g, '');
    p.negSuf = negative.slice(pos + trunkLen).replace(/'/g, '');
  } else {
    p.negPre = minusSign + p.posPre;
    p.negSuf = p.posSuf;
  }
  return p;
}
// Transforms a parsed number into a percentage by multiplying it by 100
function toPercent(parsedNumber) {
  // if the number is 0, don't do anything
  if (parsedNumber.digits[0] === 0) {
    return parsedNumber;
  }
  // Getting the current number of decimals
  const fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
  if (parsedNumber.exponent) {
    parsedNumber.exponent += 2;
  } else {
    if (fractionLen === 0) {
      parsedNumber.digits.push(0, 0);
    } else if (fractionLen === 1) {
      parsedNumber.digits.push(0);
    }
    parsedNumber.integerLen += 2;
  }
  return parsedNumber;
}
/**
 * Parses a number.
 * Significant bits of this parse algorithm came from https://github.com/MikeMcl/big.js/
 */
function parseNumber(num) {
  let numStr = Math.abs(num) + '';
  let exponent = 0,
    digits,
    integerLen;
  let i, j, zeros;
  // Decimal point?
  if ((integerLen = numStr.indexOf(DECIMAL_SEP)) > -1) {
    numStr = numStr.replace(DECIMAL_SEP, '');
  }
  // Exponential form?
  if ((i = numStr.search(/e/i)) > 0) {
    // Work out the exponent.
    if (integerLen < 0) integerLen = i;
    integerLen += +numStr.slice(i + 1);
    numStr = numStr.substring(0, i);
  } else if (integerLen < 0) {
    // There was no decimal point or exponent so it is an integer.
    integerLen = numStr.length;
  }
  // Count the number of leading zeros.
  for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) {
    /* empty */
  }
  if (i === (zeros = numStr.length)) {
    // The digits are all zero.
    digits = [0];
    integerLen = 1;
  } else {
    // Count the number of trailing zeros
    zeros--;
    while (numStr.charAt(zeros) === ZERO_CHAR) zeros--;
    // Trailing zeros are insignificant so ignore them
    integerLen -= i;
    digits = [];
    // Convert string to array of digits without leading/trailing zeros.
    for (j = 0; i <= zeros; i++, j++) {
      digits[j] = Number(numStr.charAt(i));
    }
  }
  // If the number overflows the maximum allowed digits then use an exponent.
  if (integerLen > MAX_DIGITS) {
    digits = digits.splice(0, MAX_DIGITS - 1);
    exponent = integerLen - 1;
    integerLen = 1;
  }
  return {
    digits,
    exponent,
    integerLen
  };
}
/**
 * Round the parsed number to the specified number of decimal places
 * This function changes the parsedNumber in-place
 */
function roundNumber(parsedNumber, minFrac, maxFrac) {
  if (minFrac > maxFrac) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2307 /* RuntimeErrorCode.INVALID_NUMBER_OF_DIGITS_AFTER_FRACTION */, wx.__global.ngDevMode && `The minimum number of digits after fraction (${minFrac}) is higher than the maximum (${maxFrac}).`);
  }
  let digits = parsedNumber.digits;
  let fractionLen = digits.length - parsedNumber.integerLen;
  const fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
  // The index of the digit to where rounding is to occur
  let roundAt = fractionSize + parsedNumber.integerLen;
  let digit = digits[roundAt];
  if (roundAt > 0) {
    // Drop fractional digits beyond `roundAt`
    digits.splice(Math.max(parsedNumber.integerLen, roundAt));
    // Set non-fractional digits beyond `roundAt` to 0
    for (let j = roundAt; j < digits.length; j++) {
      digits[j] = 0;
    }
  } else {
    // We rounded to zero so reset the parsedNumber
    fractionLen = Math.max(0, fractionLen);
    parsedNumber.integerLen = 1;
    digits.length = Math.max(1, roundAt = fractionSize + 1);
    digits[0] = 0;
    for (let i = 1; i < roundAt; i++) digits[i] = 0;
  }
  if (digit >= 5) {
    if (roundAt - 1 < 0) {
      for (let k = 0; k > roundAt; k--) {
        digits.unshift(0);
        parsedNumber.integerLen++;
      }
      digits.unshift(1);
      parsedNumber.integerLen++;
    } else {
      digits[roundAt - 1]++;
    }
  }
  // Pad out with zeros to get the required fraction length
  for (; fractionLen < Math.max(0, fractionSize); fractionLen++) digits.push(0);
  let dropTrailingZeros = fractionSize !== 0;
  // Minimal length = nb of decimals required + current nb of integers
  // Any number besides that is optional and can be removed if it's a trailing 0
  const minLen = minFrac + parsedNumber.integerLen;
  // Do any carrying, e.g. a digit was rounded up to 10
  const carry = digits.reduceRight(function (carry, d, i, digits) {
    d = d + carry;
    digits[i] = d < 10 ? d : d - 10; // d % 10
    if (dropTrailingZeros) {
      // Do not keep meaningless fractional trailing zeros (e.g. 15.52000 --> 15.52)
      if (digits[i] === 0 && i >= minLen) {
        digits.pop();
      } else {
        dropTrailingZeros = false;
      }
    }
    return d >= 10 ? 1 : 0; // Math.floor(d / 10);
  }, 0);
  if (carry) {
    digits.unshift(carry);
    parsedNumber.integerLen++;
  }
}
function parseIntAutoRadix(text) {
  const result = parseInt(text);
  if (isNaN(result)) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2305 /* RuntimeErrorCode.INVALID_INTEGER_LITERAL */, wx.__global.ngDevMode && 'Invalid integer literal when parsing ' + text);
  }
  return result;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a value according to digit options and locale rules.
 * Locale determines group sizing and separator,
 * decimal point character, and other locale-specific configurations.
 *
 * @see {@link formatNumber}
 *
 * @usageNotes
 *
 * ### digitsInfo
 *
 * The value's decimal representation is specified by the `digitsInfo`
 * parameter, written in the following format:<br>
 *
 * ```
 * {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
 * ```
 *
 *  - `minIntegerDigits`:
 * The minimum number of integer digits before the decimal point.
 * Default is 1.
 *
 * - `minFractionDigits`:
 * The minimum number of digits after the decimal point.
 * Default is 0.
 *
 *  - `maxFractionDigits`:
 * The maximum number of digits after the decimal point.
 * Default is 3.
 *
 * If the formatted value is truncated it will be rounded using the "to-nearest" method:
 *
 * ```
 * {{3.6 | number: '1.0-0'}}
 * <!--will output '4'-->
 *
 * {{-3.6 | number:'1.0-0'}}
 * <!--will output '-4'-->
 * ```
 *
 * ### locale
 *
 * `locale` will format a value according to locale rules.
 * Locale determines group sizing and separator,
 * decimal point character, and other locale-specific configurations.
 *
 * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
 *
 * See [Setting your app locale](guide/i18n/locale-id).
 *
 * ### Example
 *
 * The following code shows how the pipe transforms values
 * according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * {@example common/pipes/ts/number_pipe.ts region='NumberPipe'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @publicApi
 */
class DecimalPipe {
  _locale;
  constructor(_locale) {
    this._locale = _locale;
  }
  transform(value, digitsInfo, locale) {
    if (!isValue(value)) return null;
    locale ||= this._locale;
    try {
      const num = strToNumber(value);
      return formatNumber(num, locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(DecimalPipe, error.message);
    }
  }
  static ɵfac = function DecimalPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || DecimalPipe)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID, 16));
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "number",
    type: DecimalPipe,
    pure: true
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(DecimalPipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'number'
    }]
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID]
    }]
  }], null);
})();
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms a number to a percentage
 * string, formatted according to locale rules that determine group sizing and
 * separator, decimal-point character, and other locale-specific
 * configurations.
 *
 * @see {@link formatPercent}
 *
 * @usageNotes
 * The following code shows how the pipe transforms numbers
 * into text strings, according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * {@example common/pipes/ts/percent_pipe.ts region='PercentPipe'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @publicApi
 */
class PercentPipe {
  _locale;
  constructor(_locale) {
    this._locale = _locale;
  }
  /**
   *
   * @param value The number to be formatted as a percentage.
   * @param digitsInfo Decimal representation options, specified by a string
   * in the following format:<br>
   * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
   *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
   * Default is `1`.
   *   - `minFractionDigits`: The minimum number of digits after the decimal point.
   * Default is `0`.
   *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
   * Default is `0`.
   * @param locale A locale code for the locale format rules to use.
   * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
   * See [Setting your app locale](guide/i18n/locale-id).
   */
  transform(value, digitsInfo, locale) {
    if (!isValue(value)) return null;
    locale ||= this._locale;
    try {
      const num = strToNumber(value);
      return formatPercent(num, locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(PercentPipe, error.message);
    }
  }
  static ɵfac = function PercentPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || PercentPipe)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID, 16));
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "percent",
    type: PercentPipe,
    pure: true
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(PercentPipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'percent'
    }]
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID]
    }]
  }], null);
})();
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms a number to a currency string, formatted according to locale rules
 * that determine group sizing and separator, decimal-point character,
 * and other locale-specific configurations.
 *
 *
 * @see {@link getCurrencySymbol}
 * @see {@link formatCurrency}
 *
 * @usageNotes
 * The following code shows how the pipe transforms numbers
 * into text strings, according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * {@example common/pipes/ts/currency_pipe.ts region='CurrencyPipe'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @publicApi
 */
class CurrencyPipe {
  _locale;
  _defaultCurrencyCode;
  constructor(_locale, _defaultCurrencyCode = 'USD') {
    this._locale = _locale;
    this._defaultCurrencyCode = _defaultCurrencyCode;
  }
  transform(value, currencyCode = this._defaultCurrencyCode, display = 'symbol', digitsInfo, locale) {
    if (!isValue(value)) return null;
    locale ||= this._locale;
    if (typeof display === 'boolean') {
      if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
        console.warn(`Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`);
      }
      display = display ? 'symbol' : 'code';
    }
    let currency = currencyCode || this._defaultCurrencyCode;
    if (display !== 'code') {
      if (display === 'symbol' || display === 'symbol-narrow') {
        currency = getCurrencySymbol(currency, display === 'symbol' ? 'wide' : 'narrow', locale);
      } else {
        currency = display;
      }
    }
    try {
      const num = strToNumber(value);
      return formatCurrency(num, locale, currency, currencyCode, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(CurrencyPipe, error.message);
    }
  }
  static ɵfac = function CurrencyPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || CurrencyPipe)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID, 16), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.DEFAULT_CURRENCY_CODE, 16));
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "currency",
    type: CurrencyPipe,
    pure: true
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(CurrencyPipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'currency'
    }]
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [_angular_core__WEBPACK_IMPORTED_MODULE_3__.LOCALE_ID]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Inject,
      args: [_angular_core__WEBPACK_IMPORTED_MODULE_3__.DEFAULT_CURRENCY_CODE]
    }]
  }], null);
})();
function isValue(value) {
  return !(value == null || value === '' || value !== value);
}
/**
 * Transforms a string into a number (if needed).
 */
function strToNumber(value) {
  // Convert strings to numbers
  if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
    return Number(value);
  }
  if (typeof value !== 'number') {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2309 /* RuntimeErrorCode.VALUE_NOT_A_NUMBER */, wx.__global.ngDevMode && `${value} is not a number`);
  }
  return value;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @ngModule CommonModule
 * @description
 *
 * Creates a new `Array` or `String` containing a subset (slice) of the elements.
 *
 * @usageNotes
 *
 * All behavior is based on the expected behavior of the JavaScript API `Array.prototype.slice()`
 * and `String.prototype.slice()`.
 *
 * When operating on an `Array`, the returned `Array` is always a copy even when all
 * the elements are being returned.
 *
 * When operating on a blank value, the pipe returns the blank value.
 *
 * ### List Example
 *
 * This `ngFor` example:
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_list'}
 *
 * produces the following:
 *
 * ```html
 * <li>b</li>
 * <li>c</li>
 * ```
 *
 * ### String Examples
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_string'}
 *
 * @see [Built-in Pipes](guide/templates/pipes#built-in-pipes)
 *
 * @publicApi
 */
class SlicePipe {
  transform(value, start, end) {
    if (value == null) return null;
    const supports = typeof value === 'string' || Array.isArray(value);
    if (!supports) {
      throw invalidPipeArgumentError(SlicePipe, value);
    }
    return value.slice(start, end);
  }
  static ɵfac = function SlicePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SlicePipe)();
  };
  static ɵpipe = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefinePipe"]({
    name: "slice",
    type: SlicePipe,
    pure: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(SlicePipe, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Pipe,
    args: [{
      name: 'slice',
      pure: false
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
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
/**
 * A collection of Angular pipes that are likely to be used in each and every application.
 */
const COMMON_PIPES = [AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, KeyValuePipe];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
/**
 * Exports all the basic Angular directives and pipes,
 * such as `NgIf`, `NgForOf`, `DecimalPipe`, and so on.
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command.
 *
 * @publicApi
 */
class CommonModule {
  static ɵfac = function CommonModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || CommonModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({
    type: CommonModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjector"]({});
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(CommonModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.NgModule,
    args: [{
      imports: [COMMON_DIRECTIVES, COMMON_PIPES],
      exports: [COMMON_DIRECTIVES, COMMON_PIPES]
    }]
  }], null, null);
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsetNgModuleScope"](CommonModule, {
    imports: [NgClass, NgForOf, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase, AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, KeyValuePipe],
    exports: [NgClass, NgForOf, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase, AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, KeyValuePipe]
  });
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const PLATFORM_BROWSER_ID = 'browser';
const PLATFORM_SERVER_ID = 'server';
/**
 * Returns whether a platform id represents a browser platform.
 * @publicApi
 */
function isPlatformBrowser(platformId) {
  return platformId === PLATFORM_BROWSER_ID;
}
/**
 * Returns whether a platform id represents a server platform.
 * @publicApi
 */
function isPlatformServer(platformId) {
  return platformId === PLATFORM_SERVER_ID;
}

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
 * Entry point for all public APIs of the common package.
 */
/**
 * @publicApi
 */
const VERSION = /* @__PURE__ */new _angular_core__WEBPACK_IMPORTED_MODULE_2__.Version('0.0.0-PLACEHOLDER');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
class ViewportScroller {
  // De-sugared tree-shakable injection
  // See #23917
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */(0,_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"])({
    token: ViewportScroller,
    providedIn: 'root',
    factory: () => typeof ngServerMode !== 'undefined' && ngServerMode ? new NullViewportScroller() : new BrowserViewportScroller((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.DOCUMENT), wx.__window)
  });
}
/**
 * Manages the scroll position for a browser window.
 */
class BrowserViewportScroller {
  document;
  window;
  offset = () => [0, 0];
  constructor(document, window) {
    this.document = document;
    this.window = window;
  }
  /**
   * Configures the top offset used when scrolling to an anchor.
   * @param offset A position in screen coordinates (a tuple with x and y values)
   * or a function that returns the top offset position.
   *
   */
  setOffset(offset) {
    if (Array.isArray(offset)) {
      this.offset = () => offset;
    } else {
      this.offset = offset;
    }
  }
  /**
   * Retrieves the current scroll position.
   * @returns The position in screen coordinates.
   */
  getScrollPosition() {
    return [this.window.scrollX, this.window.scrollY];
  }
  /**
   * Sets the scroll position.
   * @param position The new position in screen coordinates.
   */
  scrollToPosition(position, options) {
    this.window.scrollTo({
      ...options,
      left: position[0],
      top: position[1]
    });
  }
  /**
   * Scrolls to an element and attempts to focus the element.
   *
   * Note that the function name here is misleading in that the target string may be an ID for a
   * non-anchor element.
   *
   * @param target The ID of an element or name of the anchor.
   *
   * @see https://html.spec.whatwg.org/#the-indicated-part-of-the-document
   * @see https://html.spec.whatwg.org/#scroll-to-fragid
   */
  scrollToAnchor(target, options) {
    const elSelected = findAnchorFromDocument(this.document, target);
    if (elSelected) {
      this.scrollToElement(elSelected, options);
      // After scrolling to the element, the spec dictates that we follow the focus steps for the
      // target. Rather than following the robust steps, simply attempt focus.
      // Use `preventScroll: true` to avoid extra scroll that breaks smooth scrolling.
      // @see https://html.spec.whatwg.org/#get-the-focusable-area
      // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus
      // @see https://html.spec.whatwg.org/#focusable-area
      // @see https://www.yanandcoffee.com/2020/05/08/accessible-smooth-scrolling-and-focus-management-solutions/
      elSelected.focus({
        preventScroll: true
      });
    }
  }
  /**
   * Disables automatic scroll restoration provided by the browser.
   */
  setHistoryScrollRestoration(scrollRestoration) {
    try {
      this.window.history.scrollRestoration = scrollRestoration;
    } catch {
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2400 /* RuntimeErrorCode.SCROLL_RESTORATION_UNSUPPORTED */, wx.__global.ngDevMode && 'Failed to set `window.history.scrollRestoration`. ' + 'This may occur when:\n' + '• The script is running inside a sandboxed iframe\n' + '• The window is partially navigated or inactive\n' + '• The script is executed in an untrusted or special context (e.g., test runners, browser extensions, or content previews)\n' + 'Scroll position may not be preserved across navigation.'));
    }
  }
  /**
   * Scrolls to an element using the native offset and the specified offset set on this scroller.
   *
   * The offset can be used when we know that there is a floating header and scrolling naively to an
   * element (ex: `scrollIntoView`) leaves the element hidden behind the floating header.
   */
  scrollToElement(el, options) {
    const rect = el.getBoundingClientRect();
    const left = rect.left + this.window.pageXOffset;
    const top = rect.top + this.window.pageYOffset;
    const offset = this.offset();
    this.window.scrollTo({
      ...options,
      left: left - offset[0],
      top: top - offset[1]
    });
  }
}
function findAnchorFromDocument(document, target) {
  const documentResult = document.getElementById(target) || document.getElementsByName(target)[0];
  if (documentResult) {
    return documentResult;
  }
  // `getElementById` and `getElementsByName` won't pierce through the shadow DOM so we
  // have to traverse the DOM manually and do the lookup through the shadow roots.
  if (typeof document.createTreeWalker === 'function' && document.body && typeof document.body.attachShadow === 'function') {
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let currentNode = treeWalker.currentNode;
    while (currentNode) {
      const shadowRoot = currentNode.shadowRoot;
      if (shadowRoot) {
        // Note that `ShadowRoot` doesn't support `getElementsByName`
        // so we have to fall back to `querySelector`.
        const result = shadowRoot.getElementById(target) || shadowRoot.querySelector(`[name="${CSS.escape(target)}"]`);
        if (result) {
          return result;
        }
      }
      currentNode = treeWalker.nextNode();
    }
  }
  return null;
}
/**
 * Provides an empty implementation of the viewport scroller.
 */
class NullViewportScroller {
  /**
   * Empty implementation
   */
  setOffset(offset) {}
  /**
   * Empty implementation
   */
  getScrollPosition() {
    return [0, 0];
  }
  /**
   * Empty implementation
   */
  scrollToPosition(position) {}
  /**
   * Empty implementation
   */
  scrollToAnchor(anchor, options) {}
  /**
   * Empty implementation
   */
  setHistoryScrollRestoration(scrollRestoration) {}
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
 */
class BrowserXhr {
  build() {
    return new XMLHttpRequest();
  }
  static ɵfac = function BrowserXhr_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BrowserXhr)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineService"]({
    token: BrowserXhr,
    factory: BrowserXhr.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(BrowserXhr, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Service
  }], null, null);
})();
/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
class XhrFactory {
  static ɵfac = function XhrFactory_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || XhrFactory)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
    token: XhrFactory,
    factory: function XhrFactory_Factory(__ngFactoryType__) {
      let __ngConditionalFactory__ = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new (__ngFactoryType__ || XhrFactory)();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](BrowserXhr);
      }
      return __ngConditionalFactory__;
    },
    providedIn: 'root'
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(XhrFactory, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Injectable,
    args: [{
      providedIn: 'root',
      useExisting: BrowserXhr
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
 * Value (out of 100) of the requested quality for placeholder images.
 */
const PLACEHOLDER_QUALITY = '20';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Converts a string that represents a URL into a URL class instance.
function getUrl(src, win) {
  // Don't use a base URL is the URL is absolute.
  return isAbsoluteUrl(src) ? new URL(src) : new URL(src, win.location.href);
}
// Checks whether a URL is absolute (i.e. starts with `http://` or `https://`).
function isAbsoluteUrl(src) {
  return /^https?:\/\//.test(src);
}
// Given a URL, extract the hostname part.
// If a URL is a relative one - the URL is returned as is.
function extractHostname(url) {
  return isAbsoluteUrl(url) ? new URL(url).hostname : url;
}
function isValidPath(path) {
  const isString = typeof path === 'string';
  if (!isString || path.trim() === '') {
    return false;
  }
  // Calling new URL() will throw if the path string is malformed
  try {
    const url = new URL(path);
    return true;
  } catch {
    return false;
  }
}
function normalizePath(path) {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}
function normalizeSrc(src) {
  return src.startsWith('/') ? src.slice(1) : src;
}
function escapeCssUrl(input) {
  return input
  // Backslash first — later replacements must not have their own \ escaped again.
  .replace(/\\/g, '\\\\')
  // \n, \r, \f and null terminate a CSS string (CSS Syntax 3 §4.3.5,
  // https://www.w3.org/TR/css-syntax-3/#consume-string-token) and are also
  // invalid in URLs, so stripping them is safe.
  .replace(/[\n\r\f\0]/g, '')
  // A bare " would close the url("...") wrapper early.
  .replace(/"/g, '\\"');
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 */
const noopImageLoader = config => config.src;
/**
 * Injection token that configures the image loader function.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 * @publicApi
 */
const IMAGE_LOADER = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'ImageLoader' : '', {
  factory: () => noopImageLoader
});
/**
 * Internal helper function that makes it easier to introduce custom image loaders for the
 * `NgOptimizedImage` directive. It is enough to specify a URL builder function to obtain full DI
 * configuration for a given loader: a DI token corresponding to the actual loader function, plus DI
 * tokens managing preconnect check functionality.
 * @param buildUrlFn a function returning a full URL based on loader's configuration
 * @param exampleUrls example of full URLs for a given loader (used in error messages)
 * @returns a set of DI providers corresponding to the configured image loader
 */
function createImageLoader(buildUrlFn, exampleUrls) {
  return function provideImageLoader(path) {
    if (!isValidPath(path)) {
      throwInvalidPathError(path, exampleUrls || []);
    }
    // The trailing / is stripped (if provided) to make URL construction (concatenation) easier in
    // the individual loader functions.
    path = normalizePath(path);
    const loaderFn = config => {
      if (isAbsoluteUrl(config.src)) {
        // Image loader functions expect an image file name (e.g. `my-image.png`)
        // or a relative path + a file name (e.g. `/a/b/c/my-image.png`) as an input,
        // so the final absolute URL can be constructed.
        // When an absolute URL is provided instead - the loader can not
        // build a final URL, thus the error is thrown to indicate that.
        throwUnexpectedAbsoluteUrlError(path, config.src);
      }
      return buildUrlFn(path, {
        ...config,
        src: normalizeSrc(config.src)
      });
    };
    const providers = [{
      provide: IMAGE_LOADER,
      useValue: loaderFn
    }];
    return providers;
  };
}
function throwInvalidPathError(path, exampleUrls) {
  throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, wx.__global.ngDevMode && `Image loader has detected an invalid path (\`${path}\`). ` + `To fix this, supply a path using one of the following formats: ${exampleUrls.join(' or ')}`);
}
function throwUnexpectedAbsoluteUrlError(path, url) {
  throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, wx.__global.ngDevMode && `Image loader has detected a \`<img>\` tag with an invalid \`ngSrc\` attribute: ${url}. ` + `This image loader expects \`ngSrc\` to be a relative URL - ` + `however the provided value is an absolute URL. ` + `To fix this, provide \`ngSrc\` as a path relative to the base URL ` + `configured for this loader (\`${path}\`).`);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Converts transform parameter to URL parameter string.
 * @param transform The transform parameter as string or object
 * @param separator The separator between key and value ('_' for Cloudinary, '=' for Cloudflare/Imgix , '-' for ImageKit)
 */
function normalizeLoaderTransform(transform, separator) {
  if (typeof transform === 'string') {
    return transform;
  }
  return Object.entries(transform).map(([key, value]) => `${key}${separator}${value}`).join(',');
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Function that generates an ImageLoader for [Cloudflare Image
 * Resizing](https://developers.cloudflare.com/images/image-resizing/) and turns it into an Angular
 * provider. Note: Cloudflare has multiple image products - this provider is specifically for
 * Cloudflare Image Resizing; it will not work with Cloudflare Images or Cloudflare Polish.
 *
 * @param path Your domain name, e.g. https://mysite.com
 * @returns Provider that provides an ImageLoader function
 *
 * @see [Image Optimization Guide](guide/image-optimization)
 * @publicApi
 */
const provideCloudflareLoader = createImageLoader(createCloudflareUrl, wx.__global.ngDevMode ? ['https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>'] : undefined);
function createCloudflareUrl(path, config) {
  let params = `format=auto`;
  if (config.width) {
    params += `,width=${config.width}`;
  }
  if (config.height) {
    params += `,height=${config.height}`;
  }
  // When requesting a placeholder image we ask for a low quality image to reduce the load time.
  if (config.isPlaceholder) {
    params += `,quality=${PLACEHOLDER_QUALITY}`;
  }
  // Support custom transformation parameters
  if (config.loaderParams?.['transform']) {
    const transformStr = normalizeLoaderTransform(config.loaderParams['transform'], '=');
    params += `,${transformStr}`;
  }
  // Cloudflare image URLs format:
  // https://developers.cloudflare.com/images/image-resizing/url-format/
  return `${path}/cdn-cgi/image/${params}/${config.src}`;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Name and URL tester for Cloudinary.
 */
const cloudinaryLoaderInfo = {
  name: 'Cloudinary',
  testUrl: isCloudinaryUrl
};
const CLOUDINARY_LOADER_REGEX = /https?\:\/\/[^\/]+\.cloudinary\.com\/.+/;
/**
 * Tests whether a URL is from Cloudinary CDN.
 */
function isCloudinaryUrl(url) {
  return CLOUDINARY_LOADER_REGEX.test(url);
}
/**
 * Function that generates an ImageLoader for Cloudinary and turns it into an Angular provider.
 *
 * @param path Base URL of your Cloudinary images
 * This URL should match one of the following formats:
 * https://res.cloudinary.com/mysite
 * https://mysite.cloudinary.com
 * https://subdomain.mysite.com
 * @returns Set of providers to configure the Cloudinary loader.
 *
 * @see [Image Optimization Guide](guide/image-optimization)
 * @publicApi
 */
const provideCloudinaryLoader = createImageLoader(createCloudinaryUrl, wx.__global.ngDevMode ? ['https://res.cloudinary.com/mysite', 'https://mysite.cloudinary.com', 'https://subdomain.mysite.com'] : undefined);
function createCloudinaryUrl(path, config) {
  // Cloudinary image URLformat:
  // https://cloudinary.com/documentation/image_transformations#transformation_url_structure
  // Example of a Cloudinary image URL:
  // https://res.cloudinary.com/mysite/image/upload/c_scale,f_auto,q_auto,w_600/marketing/tile-topics-m.png
  // For a placeholder image, we use the lowest image setting available to reduce the load time
  // else we use the auto size
  const quality = config.isPlaceholder ? 'q_auto:low' : 'q_auto';
  let params = `f_auto,${quality}`;
  if (config.width) {
    params += `,w_${config.width}`;
  }
  if (config.height) {
    params += `,h_${config.height}`;
  }
  if (config.loaderParams?.['rounded']) {
    params += `,r_max`;
  }
  // Allows users to add any Cloudinary transformation parameters as a string or object
  if (config.loaderParams?.['transform']) {
    const transformStr = normalizeLoaderTransform(config.loaderParams['transform'], '_');
    params += `,${transformStr}`;
  }
  return `${path}/image/upload/${params}/${config.src}`;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Name and URL tester for ImageKit.
 */
const imageKitLoaderInfo = {
  name: 'ImageKit',
  testUrl: isImageKitUrl
};
const IMAGE_KIT_LOADER_REGEX = /https?\:\/\/[^\/]+\.imagekit\.io\/.+/;
/**
 * Tests whether a URL is from ImageKit CDN.
 */
function isImageKitUrl(url) {
  return IMAGE_KIT_LOADER_REGEX.test(url);
}
/**
 * Function that generates an ImageLoader for ImageKit and turns it into an Angular provider.
 *
 * @param path Base URL of your ImageKit images
 * This URL should match one of the following formats:
 * https://ik.imagekit.io/myaccount
 * https://subdomain.mysite.com
 * @returns Set of providers to configure the ImageKit loader.
 *
 * @see [Image Optimization Guide](guide/image-optimization)
 * @publicApi
 */
const provideImageKitLoader = createImageLoader(createImagekitUrl, wx.__global.ngDevMode ? ['https://ik.imagekit.io/mysite', 'https://subdomain.mysite.com'] : undefined);
function createImagekitUrl(path, config) {
  // Example of an ImageKit image URL:
  // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
  const {
    src,
    width
  } = config;
  const params = [];
  if (width) {
    params.push(`w-${width}`);
  }
  if (config.height) {
    params.push(`h-${config.height}`);
  }
  // When requesting a placeholder image we ask for a low quality image to reduce the load time.
  if (config.isPlaceholder) {
    params.push(`q-${PLACEHOLDER_QUALITY}`);
  }
  // Allows users to add any ImageKit transformation parameters as a string or object
  if (config.loaderParams?.['transform']) {
    const transformStr = normalizeLoaderTransform(config.loaderParams['transform'], '-');
    params.push(transformStr);
  }
  const urlSegments = params.length ? [path, `tr:${params.join(',')}`, src] : [path, src];
  const url = new URL(urlSegments.join('/'));
  return url.href;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Name and URL tester for Imgix.
 */
const imgixLoaderInfo = {
  name: 'Imgix',
  testUrl: isImgixUrl
};
const IMGIX_LOADER_REGEX = /https?\:\/\/[^\/]+\.imgix\.net\/.+/;
/**
 * Tests whether a URL is from Imgix CDN.
 */
function isImgixUrl(url) {
  return IMGIX_LOADER_REGEX.test(url);
}
/**
 * Function that generates an ImageLoader for Imgix and turns it into an Angular provider.
 *
 * @param path path to the desired Imgix origin,
 * e.g. https://somepath.imgix.net or https://images.mysite.com
 * @returns Set of providers to configure the Imgix loader.
 *
 * @see [Image Optimization Guide](guide/image-optimization)
 * @publicApi
 */
const provideImgixLoader = createImageLoader(createImgixUrl, wx.__global.ngDevMode ? ['https://somepath.imgix.net/'] : undefined);
function createImgixUrl(path, config) {
  const params = [];
  // This setting ensures the smallest allowable format is set.
  params.push('auto=format');
  if (config.width) {
    params.push(`w=${config.width}`);
  }
  if (config.height) {
    params.push(`h=${config.height}`);
  }
  // When requesting a placeholder image we ask a low quality image to reduce the load time.
  if (config.isPlaceholder) {
    params.push(`q=${PLACEHOLDER_QUALITY}`);
  }
  // Allows users to add any Imgix transformation parameters as a string or object
  if (config.loaderParams?.['transform']) {
    const transform = normalizeLoaderTransform(config.loaderParams['transform'], '=').split(',');
    params.push(...transform);
  }
  const url = new URL(`${path}/${config.src}`);
  url.search = params.join('&');
  return url.href;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Name and URL tester for Netlify.
 */
const netlifyLoaderInfo = {
  name: 'Netlify',
  testUrl: isNetlifyUrl
};
const NETLIFY_LOADER_REGEX = /https?\:\/\/[^\/]+\.netlify\.app\/.+/;
/**
 * Tests whether a URL is from a Netlify site. This won't catch sites with a custom domain,
 * but it's a good start for sites in development. This is only used to warn users who haven't
 * configured an image loader.
 */
function isNetlifyUrl(url) {
  return NETLIFY_LOADER_REGEX.test(url);
}
/**
 * Function that generates an ImageLoader for Netlify and turns it into an Angular provider.
 *
 * @param path optional URL of the desired Netlify site. Defaults to the current site.
 * @returns Set of providers to configure the Netlify loader.
 *
 * @publicApi
 */
function provideNetlifyLoader(path) {
  if (path && !isValidPath(path)) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, wx.__global.ngDevMode && `Image loader has detected an invalid path (\`${path}\`). ` + `To fix this, supply either the full URL to the Netlify site, or leave it empty to use the current site.`);
  }
  if (path) {
    const url = new URL(path);
    path = url.origin;
  }
  const loaderFn = config => {
    return createNetlifyUrl(config, path);
  };
  const providers = [{
    provide: IMAGE_LOADER,
    useValue: loaderFn
  }];
  return providers;
}
const validParams = new Map([['height', 'h'], ['fit', 'fit'], ['quality', 'q'], ['q', 'q'], ['position', 'position']]);
function createNetlifyUrl(config, path) {
  // Note: `path` can be undefined, in which case we use a fake one to construct a `URL` instance.
  const url = new URL(path ?? 'https://a/');
  url.pathname = '/.netlify/images';
  if (!isAbsoluteUrl(config.src) && !config.src.startsWith('/')) {
    config.src = '/' + config.src;
  }
  url.searchParams.set('url', config.src);
  if (config.width) {
    url.searchParams.set('w', config.width.toString());
  }
  if (config.height) {
    url.searchParams.set('h', config.height.toString());
  }
  // When requesting a placeholder image we ask for a low quality image to reduce the load time.
  // If the quality is specified in the loader config - always use provided value.
  const configQuality = config.loaderParams?.['quality'] ?? config.loaderParams?.['q'];
  if (config.isPlaceholder && !configQuality) {
    url.searchParams.set('q', PLACEHOLDER_QUALITY);
  }
  for (const [param, value] of Object.entries(config.loaderParams ?? {})) {
    if (validParams.has(param)) {
      url.searchParams.set(validParams.get(param), value.toString());
    } else {
      if (wx.__global.ngDevMode) {
        console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, `The Netlify image loader has detected an \`<img>\` tag with the unsupported attribute "\`${param}\`".`));
      }
    }
  }
  // The "a" hostname is used for relative URLs, so we can remove it from the final URL.
  return url.hostname === 'a' ? url.href.replace(url.origin, '') : url.href;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Assembles directive details string, useful for error messages.
function imgDirectiveDetails(ngSrc, includeNgSrc = true) {
  const ngSrcInfo = includeNgSrc ? `(activated on an <img> element with the \`ngSrc="${ngSrc}"\`) ` : '';
  return `The NgOptimizedImage directive ${ngSrcInfo}has detected that`;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Asserts that the application is in development mode. Throws an error if the application is in
 * production mode. This assert can be used to make sure that there is no dev-mode code invoked in
 * the prod mode accidentally.
 */
function assertDevMode(checkName) {
  if (!wx.__global.ngDevMode) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2958 /* RuntimeErrorCode.UNEXPECTED_DEV_MODE_CHECK_IN_PROD_MODE */, `Unexpected invocation of the ${checkName} in the prod mode. ` + `Please make sure that the prod mode is enabled for production builds.`);
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
 * Observer that detects whether an image with `NgOptimizedImage`
 * is treated as a Largest Contentful Paint (LCP) element. If so,
 * asserts that the image has the `priority` attribute.
 *
 * Note: this is a dev-mode only class and it does not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 *
 * Based on https://web.dev/lcp/#measure-lcp-in-javascript.
 */
class LCPImageObserver {
  // Map of full image URLs -> original `ngSrc` values.
  images = new Map();
  window = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.DOCUMENT).defaultView;
  observer = null;
  constructor() {
    assertDevMode('LCP checker');
    if ((typeof ngServerMode === 'undefined' || !ngServerMode) && typeof PerformanceObserver !== 'undefined') {
      this.observer = this.initPerformanceObserver();
    }
  }
  /**
   * Inits PerformanceObserver and subscribes to LCP events.
   * Based on https://web.dev/lcp/#measure-lcp-in-javascript
   */
  initPerformanceObserver() {
    const observer = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      if (entries.length === 0) return;
      // We use the latest entry produced by the `PerformanceObserver` as the best
      // signal on which element is actually an LCP one. As an example, the first image to load on
      // a page, by virtue of being the only thing on the page so far, is often a LCP candidate
      // and gets reported by PerformanceObserver, but isn't necessarily the LCP element.
      const lcpElement = entries[entries.length - 1];
      // Cast to `any` due to missing `element` on the `LargestContentfulPaint` type of entry.
      // See https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint
      const imgSrc = lcpElement.element?.src ?? '';
      // Exclude `data:` and `blob:` URLs, since they are not supported by the directive.
      if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) return;
      const img = this.images.get(imgSrc);
      if (!img) return;
      if (!img.priority && !img.alreadyWarnedPriority) {
        img.alreadyWarnedPriority = true;
        logMissingPriorityError(imgSrc);
      }
      if (img.modified && !img.alreadyWarnedModified) {
        img.alreadyWarnedModified = true;
        logModifiedWarning(imgSrc);
      }
    });
    observer.observe({
      type: 'largest-contentful-paint',
      buffered: true
    });
    return observer;
  }
  registerImage(rewrittenSrc, isPriority) {
    if (!this.observer) return;
    const url = getUrl(rewrittenSrc, this.window).href;
    const existingState = this.images.get(url);
    if (existingState) {
      // If any instance has priority, the URL is considered to have priority
      existingState.priority = existingState.priority || isPriority;
      existingState.count++;
    } else {
      const newObservedImageState = {
        priority: isPriority,
        modified: false,
        alreadyWarnedModified: false,
        alreadyWarnedPriority: false,
        count: 1
      };
      this.images.set(url, newObservedImageState);
    }
  }
  unregisterImage(rewrittenSrc) {
    if (!this.observer) return;
    const url = getUrl(rewrittenSrc, this.window).href;
    const existingState = this.images.get(url);
    if (existingState) {
      existingState.count--;
      if (existingState.count <= 0) {
        this.images.delete(url);
      }
    }
  }
  updateImage(originalSrc, newSrc) {
    if (!this.observer) return;
    const originalUrl = getUrl(originalSrc, this.window).href;
    const newUrl = getUrl(newSrc, this.window).href;
    // URL hasn't changed
    if (originalUrl === newUrl) return;
    const originalState = this.images.get(originalUrl);
    if (!originalState) return;
    // Decrement count for original URL
    originalState.count--;
    if (originalState.count <= 0) {
      this.images.delete(originalUrl);
    }
    // Add or update entry for new URL
    const newState = this.images.get(newUrl);
    if (newState) {
      // Merge if original had priority, new should too
      newState.priority = newState.priority || originalState.priority;
      newState.modified = true;
      // Preserve warning flags from the original state to avoid duplicate warnings
      newState.alreadyWarnedPriority = newState.alreadyWarnedPriority || originalState.alreadyWarnedPriority;
      newState.alreadyWarnedModified = newState.alreadyWarnedModified || originalState.alreadyWarnedModified;
      newState.count++;
    } else {
      // Create new entry, preserving state from the image that moved
      this.images.set(newUrl, {
        priority: originalState.priority,
        modified: true,
        alreadyWarnedModified: originalState.alreadyWarnedModified,
        alreadyWarnedPriority: originalState.alreadyWarnedPriority,
        count: 1
      });
    }
  }
  ngOnDestroy() {
    if (!this.observer) return;
    this.observer.disconnect();
    this.images.clear();
  }
  static ɵfac = function LCPImageObserver_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LCPImageObserver)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineService"]({
    token: LCPImageObserver,
    factory: LCPImageObserver.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(LCPImageObserver, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Service
  }], () => [], null);
})();
function logMissingPriorityError(ngSrc) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.error((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2955 /* RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` + `element but was not marked "priority". This image should be marked ` + `"priority" in order to prioritize its loading. ` + `To fix this, add the "priority" attribute.`));
}
function logModifiedWarning(ngSrc) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2964 /* RuntimeErrorCode.LCP_IMG_NGSRC_MODIFIED */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` + `element and has had its "ngSrc" attribute modified. This can cause ` + `slower loading performance. It is recommended not to modify the "ngSrc" ` + `property on any image which could be the LCP element.`));
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Set of origins that are always excluded from the preconnect checks.
const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);
/**
 * Injection token to configure which origins should be excluded
 * from the preconnect checks. It can either be a single string or an array of strings
 * to represent a group of origins, for example:
 *
 * ```ts
 *  {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://your-domain.com'}
 * ```
 *
 * or:
 *
 * ```ts
 *  {provide: PRECONNECT_CHECK_BLOCKLIST,
 *   useValue: ['https://your-domain-1.com', 'https://your-domain-2.com']}
 * ```
 *
 * @publicApi
 */
const PRECONNECT_CHECK_BLOCKLIST = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'PRECONNECT_CHECK_BLOCKLIST' : '');
/**
 * Contains the logic to detect whether an image, marked with the "priority" attribute
 * has a corresponding `<link rel="preconnect">` tag in the `document.head`.
 *
 * Note: this is a dev-mode only class, which should not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 */
class PreconnectLinkChecker {
  document = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.DOCUMENT);
  /**
   * Set of <link rel="preconnect"> tags found on this page.
   * The `null` value indicates that there was no DOM query operation performed.
   */
  preconnectLinks = null;
  /*
   * Keep track of all already seen origin URLs to avoid repeating the same check.
   */
  alreadySeen = new Set();
  window = this.document.defaultView;
  blocklist = new Set(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);
  constructor() {
    assertDevMode('preconnect link checker');
    const blocklist = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(PRECONNECT_CHECK_BLOCKLIST, {
      optional: true
    });
    if (blocklist) {
      this.populateBlocklist(blocklist);
    }
  }
  populateBlocklist(origins) {
    if (Array.isArray(origins)) {
      deepForEach(origins, origin => {
        this.blocklist.add(extractHostname(origin));
      });
    } else {
      this.blocklist.add(extractHostname(origins));
    }
  }
  /**
   * Checks that a preconnect resource hint exists in the head for the
   * given src.
   *
   * @param rewrittenSrc src formatted with loader
   * @param originalNgSrc ngSrc value
   */
  assertPreconnect(rewrittenSrc, originalNgSrc) {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) return;
    const imgUrl = getUrl(rewrittenSrc, this.window);
    if (this.blocklist.has(imgUrl.hostname) || this.alreadySeen.has(imgUrl.origin)) return;
    // Register this origin as seen, so we don't check it again later.
    this.alreadySeen.add(imgUrl.origin);
    // Note: we query for preconnect links only *once* and cache the results
    // for the entire lifespan of an application, since it's unlikely that the
    // list would change frequently. This allows to make sure there are no
    // performance implications of making extra DOM lookups for each image.
    this.preconnectLinks ??= this.queryPreconnectLinks();
    if (!this.preconnectLinks.has(imgUrl.origin)) {
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2956 /* RuntimeErrorCode.PRIORITY_IMG_MISSING_PRECONNECT_TAG */, `${imgDirectiveDetails(originalNgSrc)} there is no preconnect tag present for this ` + `image. Preconnecting to the origin(s) that serve priority images ensures that these ` + `images are delivered as soon as possible. To fix this, please add the following ` + `element into the <head> of the document:\n` + `  <link rel="preconnect" href="${imgUrl.origin}">`));
    }
  }
  queryPreconnectLinks() {
    const preconnectUrls = new Set();
    const links = this.document.querySelectorAll('link[rel=preconnect]');
    for (const link of links) {
      const url = getUrl(link.href, this.window);
      preconnectUrls.add(url.origin);
    }
    return preconnectUrls;
  }
  ngOnDestroy() {
    this.preconnectLinks?.clear();
    this.alreadySeen.clear();
  }
  static ɵfac = function PreconnectLinkChecker_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PreconnectLinkChecker)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineService"]({
    token: PreconnectLinkChecker,
    factory: PreconnectLinkChecker.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(PreconnectLinkChecker, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Service
  }], () => [], null);
})();
/**
 * Invokes a callback for each element in the array. Also invokes a callback
 * recursively for each nested array.
 */
function deepForEach(input, fn) {
  for (let value of input) {
    Array.isArray(value) ? deepForEach(value, fn) : fn(value);
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
 * In SSR scenarios, a preload `<link>` element is generated for priority images.
 * Having a large number of preload tags may negatively affect the performance,
 * so we warn developers (by throwing an error) if the number of preloaded images
 * is above a certain threshold. This const specifies this threshold.
 */
const DEFAULT_PRELOADED_IMAGES_LIMIT = 5;
/**
 * Helps to keep track of priority images that already have a corresponding preload tag. Each key
 * identifies the rewritten image URL and its CORS mode, since preload tags with different CORS
 * modes are not interchangeable.
 */
const PRELOADED_IMAGES = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.InjectionToken(typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode ? 'NG_OPTIMIZED_PRELOADED_IMAGES' : '', {
  factory: () => new Set()
});

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @description Contains the logic needed to track and add preload link tags to the `<head>` tag. It
 * will also track what images have already had preload link tags added so as to not duplicate link
 * tags.
 *
 * In dev mode this service will validate that the number of preloaded images does not exceed the
 * configured default preloaded images limit: {@link DEFAULT_PRELOADED_IMAGES_LIMIT}.
 */
class PreloadLinkCreator {
  preloadedImages = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(PRELOADED_IMAGES);
  document = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.DOCUMENT);
  errorShown = false;
  /**
   * @description Add a preload `<link>` to the `<head>` of the `index.html` that is served from the
   * server while using Angular Universal and SSR to kick off image loads for high priority images.
   *
   * The `sizes` (passed in from the user) and `srcset` (parsed and formatted from `ngSrcset`)
   * properties used to set the corresponding attributes, `imagesizes` and `imagesrcset`
   * respectively, on the preload `<link>` tag so that the correctly sized image is preloaded from
   * the CDN.
   *
   * {@link https://web.dev/preload-responsive-images/#imagesrcset-and-imagesizes}
   *
   * @param renderer The `Renderer2` passed in from the directive
   * @param src The original src of the image that is set on the `ngSrc` input.
   * @param srcset The parsed and formatted srcset created from the `ngSrcset` input
   * @param sizes The value of the `sizes` attribute passed in to the `<img>` tag
   * @param crossOrigin The value of the `crossorigin` attribute passed in to the `<img>` tag
   */
  createPreloadLinkTag(renderer, src, srcset, sizes, crossOrigin) {
    const preloadKey = `${src}:${getCrossOriginMode(crossOrigin)}`;
    if (wx.__global.ngDevMode && !this.errorShown && this.preloadedImages.size >= DEFAULT_PRELOADED_IMAGES_LIMIT) {
      this.errorShown = true;
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2961 /* RuntimeErrorCode.TOO_MANY_PRELOADED_IMAGES */, `The \`NgOptimizedImage\` directive has detected that more than ` + `${DEFAULT_PRELOADED_IMAGES_LIMIT} images were marked as priority. ` + `This might negatively affect an overall performance of the page. ` + `To fix this, remove the "priority" attribute from images with less priority.`));
    }
    if (this.preloadedImages.has(preloadKey)) {
      return;
    }
    this.preloadedImages.add(preloadKey);
    const preload = renderer.createElement('link');
    renderer.setAttribute(preload, 'as', 'image');
    renderer.setAttribute(preload, 'href', src);
    renderer.setAttribute(preload, 'rel', 'preload');
    renderer.setAttribute(preload, 'fetchpriority', 'high');
    if (crossOrigin != null) {
      renderer.setAttribute(preload, 'crossorigin', crossOrigin);
    }
    if (sizes) {
      renderer.setAttribute(preload, 'imageSizes', sizes);
    }
    if (srcset) {
      renderer.setAttribute(preload, 'imageSrcset', srcset);
    }
    renderer.appendChild(this.document.head, preload);
  }
  static ɵfac = function PreloadLinkCreator_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PreloadLinkCreator)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineService"]({
    token: PreloadLinkCreator,
    factory: PreloadLinkCreator.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(PreloadLinkCreator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Service
  }], null, null);
})();
function getCrossOriginMode(crossOrigin) {
  if (crossOrigin == null) {
    return null;
  }
  return crossOrigin.toLowerCase() === 'use-credentials' ? 'use-credentials' : 'anonymous';
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * When a Base64-encoded image is passed as an input to the `NgOptimizedImage` directive,
 * an error is thrown. The image content (as a string) might be very long, thus making
 * it hard to read an error message if the entire string is included. This const defines
 * the number of characters that should be included into the error message. The rest
 * of the content is truncated.
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;
/**
 * RegExpr to determine whether a src in a srcset is using width descriptors.
 * Should match something like: "100w, 200w".
 */
const VALID_WIDTH_DESCRIPTOR_SRCSET = /^((\s*\d+w\s*(,|$)){1,})$/;
/**
 * RegExpr to determine whether a src in a srcset is using density descriptors.
 * Should match something like: "1x, 2x, 50x". Also supports decimals like "1.5x, 1.50x".
 */
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;
/**
 * Srcset values with a density descriptor higher than this value will actively
 * throw an error. Such densities are not permitted as they cause image sizes
 * to be unreasonably large and slow down LCP.
 */
const ABSOLUTE_SRCSET_DENSITY_CAP = 3;
/**
 * Used only in error message text to communicate best practices, as we will
 * only throw based on the slightly more conservative ABSOLUTE_SRCSET_DENSITY_CAP.
 */
const RECOMMENDED_SRCSET_DENSITY_CAP = 2;
/**
 * Used in generating automatic density-based srcsets
 */
const DENSITY_SRCSET_MULTIPLIERS = [1, 2];
/**
 * Used to determine which breakpoints to use on full-width images
 */
const VIEWPORT_BREAKPOINT_CUTOFF = 640;
/**
 * Used to determine whether two aspect ratios are similar in value.
 */
const ASPECT_RATIO_TOLERANCE = 0.1;
/**
 * Used to determine whether the image has been requested at an overly
 * large size compared to the actual rendered image size (after taking
 * into account a typical device pixel ratio). In pixels.
 */
const OVERSIZED_IMAGE_TOLERANCE = 1000;
/**
 * Used to limit automatic srcset generation of very large sources for
 * fixed-size images. In pixels.
 */
const FIXED_SRCSET_WIDTH_LIMIT = 1920;
const FIXED_SRCSET_HEIGHT_LIMIT = 1080;
/**
 * Placeholder dimension (height or width) limit in pixels. Angular produces a warning
 * when this limit is crossed.
 */
const PLACEHOLDER_DIMENSION_LIMIT = 1000;
/**
 * Used to warn or error when the user provides an overly large dataURL for the placeholder
 * attribute.
 * Character count of Base64 images is 1 character per byte, and base64 encoding is approximately
 * 33% larger than base images, so 4000 characters is around 3KB on disk and 10000 characters is
 * around 7.7KB. Experimentally, 4000 characters is about 20x20px in PNG or medium-quality JPEG
 * format, and 10,000 is around 50x50px, but there's quite a bit of variation depending on how the
 * image is saved.
 */
const DATA_URL_WARN_LIMIT = 4000;
const DATA_URL_ERROR_LIMIT = 10000;
/** Info about built-in loaders we can test for. */
const BUILT_IN_LOADERS = [imgixLoaderInfo, imageKitLoaderInfo, cloudinaryLoaderInfo, netlifyLoaderInfo];
/**
 * Threshold for the PRIORITY_TRUE_COUNT
 */
const PRIORITY_COUNT_THRESHOLD = 10;
/**
 * This count is used to log a devMode warning
 * when the count of directive instances with priority=true
 * exceeds the threshold PRIORITY_COUNT_THRESHOLD
 */
let IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
/**
 * This function is for testing purpose.
 */
function resetImagePriorityCount() {
  IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
}
/**
 * Directive that improves image loading performance by enforcing best practices.
 *
 * `NgOptimizedImage` ensures that the loading of the Largest Contentful Paint (LCP) image is
 * prioritized by:
 * - Automatically setting the `fetchpriority` attribute on the `<img>` tag
 * - Lazy loading non-priority images by default
 * - Automatically generating a preconnect link tag in the document head
 *
 * In addition, the directive:
 * - Generates appropriate asset URLs if a corresponding `ImageLoader` function is provided
 * - Automatically generates a srcset
 * - Requires that `width` and `height` are set
 * - Warns if `width` or `height` have been set incorrectly
 * - Warns if the image will be visually distorted when rendered
 *
 * @usageNotes
 *
 * Follow the steps below to enable and use the directive:
 * 1. Import it into a Component.
 * 2. Optionally provide an `ImageLoader` if you use an image hosting service.
 * 3. Update the necessary `<img>` tags in templates and replace `src` attributes with `ngSrc`.
 * Using a `ngSrc` allows the directive to control when the `src` gets set, which triggers an image
 * download.
 *
 * Step 1: import the `NgOptimizedImage` directive.
 *
 * ```ts
 * @Component({
 *   imports: [NgOptimizedImage],
 * })
 * class MyPage {}
 * ```
 *
 * Step 2: configure a loader.
 *
 * To use the **default loader**: no additional code changes are necessary. The URL returned by the
 * generic loader will always match the value of "src". In other words, this loader applies no
 * transformations to the resource URL and the value of the `ngSrc` attribute will be used as is.
 *
 * To use an existing loader for a **third-party image service**: add the provider factory for your
 * chosen service to the `providers` array. In the example below, the Imgix loader is used:
 *
 * ```ts
 * import {provideImgixLoader} from 'angular-miniprogram/common';
 *
 * // Call the function and add the result to the `providers` array:
 * providers: [
 *   provideImgixLoader("https://my.base.url/"),
 * ],
 * ```
 *
 * The `NgOptimizedImage` directive provides the following functions:
 * - `provideCloudflareLoader`
 * - `provideCloudinaryLoader`
 * - `provideImageKitLoader`
 * - `provideImgixLoader`
 *
 * If you use a different image provider, you can create a custom loader function as described
 * below.
 *
 * To use a **custom loader**: provide your loader function as a value for the `IMAGE_LOADER` DI
 * token.
 *
 * ```ts
 * import {IMAGE_LOADER, ImageLoaderConfig} from 'angular-miniprogram/common';
 *
 * // Configure the loader using the `IMAGE_LOADER` token.
 * providers: [
 *   {
 *      provide: IMAGE_LOADER,
 *      useValue: (config: ImageLoaderConfig) => {
 *        return `https://example.com/${config.src}-${config.width}.jpg`;
 *      }
 *   },
 * ],
 * ```
 *
 * Step 3: update `<img>` tags in templates to use `ngSrc` instead of `src`.
 *
 * ```html
 * <img ngSrc="logo.png" width="200" height="100">
 * ```
 *
 * @publicApi
 * @see [Image Optimization Guide](guide/image-optimization)
 */
class NgOptimizedImage {
  imageLoader = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(IMAGE_LOADER);
  config = processConfig((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.IMAGE_CONFIG));
  renderer = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_3__.Renderer2);
  imgElement = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_3__.ElementRef).nativeElement;
  injector = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.Injector);
  destroyRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.DestroyRef);
  // An LCP image observer should be injected only in development mode.
  // Do not assign it to `null` to avoid having a redundant property in the production bundle.
  lcpObserver;
  /**
   * Calculate the rewritten `src` once and store it.
   * This is needed to avoid repetitive calculations and make sure the directive cleanup in the
   * `DestroyRef.onDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
   * instance that might be already destroyed).
   */
  _renderedSrc = null;
  /**
   * Name of the source image.
   * Image name will be processed by the image loader and the final URL will be applied as the `src`
   * property of the image.
   */
  ngSrc;
  /**
   * A comma separated list of width or density descriptors.
   * The image name will be taken from `ngSrc` and combined with the list of width or density
   * descriptors to generate the final `srcset` property of the image.
   *
   * Example:
   * ```html
   * <img ngSrc="hello.jpg" ngSrcset="100w, 200w" />  =>
   * <img src="path/hello.jpg" srcset="path/hello.jpg?w=100 100w, path/hello.jpg?w=200 200w" />
   * ```
   */
  ngSrcset;
  /**
   * The base `sizes` attribute passed through to the `<img>` element.
   * Providing sizes causes the image to create an automatic responsive srcset.
   */
  sizes;
  /**
   * For responsive images: the intrinsic width of the image in pixels.
   * For fixed size images: the desired rendered width of the image in pixels.
   */
  width;
  /**
   * For responsive images: the intrinsic height of the image in pixels.
   * For fixed size images: the desired rendered height of the image in pixels.
   */
  height;
  /**
   * The desired decoding behavior for the image. Defaults to `auto`
   * if not explicitly set, matching native browser behavior.
   *
   * Use `async` to decode the image off the main thread (non-blocking),
   * `sync` for immediate decoding (blocking), or `auto` to let the
   * browser decide the optimal strategy.
   *
   * [Spec](https://html.spec.whatwg.org/multipage/images.html#image-decoding-hint)
   */
  decoding;
  /**
   * The desired loading behavior (lazy, eager, or auto). Defaults to `lazy`,
   * which is recommended for most images.
   *
   * Warning: Setting images as loading="eager" or loading="auto" marks them
   * as non-priority images and can hurt loading performance. For images which
   * may be the LCP element, use the `priority` attribute instead of `loading`.
   */
  loading;
  /**
   * Indicates whether this image should have a high priority.
   */
  priority = false;
  /**
   * Data to pass through to custom loaders.
   */
  loaderParams;
  /**
   * Disables automatic srcset generation for this image.
   */
  disableOptimizedSrcset = false;
  /**
   * Sets the image to "fill mode", which eliminates the height/width requirement and adds
   * styles such that the image fills its containing element.
   */
  fill = false;
  /**
   * A URL or data URL for an image to be used as a placeholder while this image loads.
   */
  placeholder;
  /**
   * Configuration object for placeholder settings. Options:
   *   * blur: Setting this to false disables the automatic CSS blur.
   */
  placeholderConfig;
  /**
   * Value of the `src` attribute if set on the host `<img>` element.
   * This input is exclusively read to assert that `src` is not set in conflict
   * with `ngSrc` and that images don't start to load until a lazy loading strategy is set.
   * @internal
   */
  src;
  /**
   * Value of the `srcset` attribute if set on the host `<img>` element.
   * This input is exclusively read to assert that `srcset` is not set in conflict
   * with `ngSrcset` and that images don't start to load until a lazy loading strategy is set.
   * @internal
   */
  srcset;
  constructor() {
    if (wx.__global.ngDevMode) {
      this.lcpObserver = this.injector.get(LCPImageObserver);
      this.destroyRef.onDestroy(() => {
        if (!this.priority && this._renderedSrc !== null) {
          this.lcpObserver.unregisterImage(this._renderedSrc);
        }
      });
    }
    // Browsers might re-evaluate the image during DOM teardown when using `sizes="auto"`
    // with `loading="lazy"`, potentially triggering an unnecessary image fetch.
    // This is expected behavior per the HTML spec
    // See: https://html.spec.whatwg.org/multipage/images.html#sizes-attributes
    // See also: https://github.com/angular/angular/issues/67055#issuecomment-3898513831
    this.destroyRef.onDestroy(() => {
      this.renderer.removeAttribute(this.imgElement, 'loading');
    });
  }
  /** @docs-private */
  ngOnInit() {
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.performanceMarkFeature)('NgOptimizedImage');
    if (wx.__global.ngDevMode) {
      const ngZone = this.injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_2__.NgZone);
      assertNonEmptyInput(this, 'ngSrc', this.ngSrc);
      assertValidNgSrcset(this, this.ngSrcset);
      assertNoConflictingSrc(this);
      if (this.ngSrcset) {
        assertNoConflictingSrcset(this);
      }
      assertNotBase64Image(this);
      assertNotBlobUrl(this);
      if (this.fill) {
        assertEmptyWidthAndHeight(this);
        // This leaves the Angular zone to avoid triggering unnecessary change detection cycles when
        // `load` tasks are invoked on images.
        ngZone.runOutsideAngular(() => assertNonZeroRenderedHeight(this, this.imgElement, this.renderer, this.destroyRef));
      } else {
        assertNonEmptyWidthAndHeight(this);
        if (this.height !== undefined) {
          assertGreaterThanZero(this, this.height, 'height');
        }
        if (this.width !== undefined) {
          assertGreaterThanZero(this, this.width, 'width');
        }
        // Only check for distorted images when not in fill mode, where
        // images may be intentionally stretched, cropped or letterboxed.
        ngZone.runOutsideAngular(() => assertNoImageDistortion(this, this.imgElement, this.renderer, this.destroyRef));
      }
      assertValidLoadingInput(this);
      assertValidDecodingInput(this);
      if (!this.ngSrcset) {
        assertNoComplexSizes(this);
      }
      assertValidPlaceholder(this, this.imageLoader);
      assertNotMissingBuiltInLoader(this.ngSrc, this.imageLoader);
      assertNoNgSrcsetWithoutLoader(this, this.imageLoader);
      assertNoLoaderParamsWithoutLoader(this, this.imageLoader);
      ngZone.runOutsideAngular(() => {
        this.lcpObserver.registerImage(this.getRewrittenSrc(), this.priority);
      });
      if (this.priority) {
        const checker = this.injector.get(PreconnectLinkChecker);
        checker.assertPreconnect(this.getRewrittenSrc(), this.ngSrc);
        if (typeof ngServerMode !== 'undefined' && !ngServerMode) {
          const applicationRef = this.injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_3__.ApplicationRef);
          assetPriorityCountBelowThreshold(applicationRef);
        }
      }
    }
    if (this.placeholder) {
      this.removePlaceholderOnLoad(this.imgElement);
    }
    this.setHostAttributes();
  }
  setHostAttributes() {
    // Must set width/height explicitly in case they are bound (in which case they will
    // only be reflected and not found by the browser)
    if (this.fill) {
      this.sizes ||= '100vw';
    } else {
      this.setHostAttribute('width', this.width.toString());
      this.setHostAttribute('height', this.height.toString());
    }
    this.setHostAttribute('loading', this.getLoadingBehavior());
    this.setHostAttribute('fetchpriority', this.getFetchPriority());
    this.setHostAttribute('decoding', this.getDecoding());
    // The `data-ng-img` attribute flags an image as using the directive, to allow
    // for analysis of the directive's performance.
    this.setHostAttribute('ng-img', 'true');
    // The `src` and `srcset` attributes should be set last since other attributes
    // could affect the image's loading behavior.
    const rewrittenSrcset = this.updateSrcAndSrcset();
    if (this.sizes) {
      if (this.getLoadingBehavior() === 'lazy') {
        this.setHostAttribute('sizes', 'auto, ' + this.sizes);
      } else {
        this.setHostAttribute('sizes', this.sizes);
      }
    } else {
      if (this.ngSrcset && VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset) && this.getLoadingBehavior() === 'lazy') {
        this.setHostAttribute('sizes', 'auto, 100vw');
      }
    }
    if (typeof ngServerMode !== 'undefined' && ngServerMode && this.priority) {
      const preloadLinkCreator = this.injector.get(PreloadLinkCreator);
      preloadLinkCreator.createPreloadLinkTag(this.renderer, this.getRewrittenSrc(), rewrittenSrcset, this.sizes, this.imgElement.getAttribute('crossorigin'));
    }
  }
  /** @docs-private */
  ngOnChanges(changes) {
    if (wx.__global.ngDevMode) {
      assertNoPostInitInputChange(this, changes, ['ngSrcset', 'width', 'height', 'priority', 'fill', 'loading', 'sizes', 'loaderParams', 'disableOptimizedSrcset']);
    }
    if (changes['ngSrc'] && !changes['ngSrc'].isFirstChange()) {
      const oldSrc = this._renderedSrc;
      this.updateSrcAndSrcset(true);
      if (wx.__global.ngDevMode) {
        const newSrc = this._renderedSrc;
        if (oldSrc && newSrc && oldSrc !== newSrc) {
          const ngZone = this.injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_2__.NgZone);
          ngZone.runOutsideAngular(() => {
            this.lcpObserver.updateImage(oldSrc, newSrc);
          });
        }
      }
    }
    if (wx.__global.ngDevMode && changes['placeholder']?.currentValue && typeof ngServerMode !== 'undefined' && !ngServerMode) {
      assertPlaceholderDimensions(this, this.imgElement);
    }
  }
  /**
   * Calculates the aspect ratio of the image based on width and height.
   * Returns null if the aspect ratio cannot be calculated (missing dimensions or height is 0).
   */
  getAspectRatio() {
    if (this.width && this.height && this.height !== 0) {
      return this.width / this.height;
    }
    return null;
  }
  callImageLoader(configWithoutCustomParams) {
    let augmentedConfig = configWithoutCustomParams;
    if (this.loaderParams) {
      augmentedConfig.loaderParams = this.loaderParams;
    }
    // Calculate height if width is provided and aspect ratio is available
    const ratio = this.getAspectRatio();
    if (ratio !== null && augmentedConfig.width) {
      augmentedConfig.height = Math.round(augmentedConfig.width / ratio);
    }
    return this.imageLoader(augmentedConfig);
  }
  getLoadingBehavior() {
    if (!this.priority && this.loading !== undefined) {
      return this.loading;
    }
    return this.priority ? 'eager' : 'lazy';
  }
  getFetchPriority() {
    return this.priority ? 'high' : 'auto';
  }
  getDecoding() {
    if (this.priority) {
      // `sync` means the image is decoded immediately when it's loaded,
      // reducing the risk of content shifting later (important for LCP).
      // If we're marking an image as priority, we want it decoded and
      // painted as early as possible.
      return 'sync';
    }
    // Returns the value of the `decoding` attribute, defaulting to `auto`
    // if not explicitly provided. This mimics native browser behavior and
    // avoids breaking changes when no decoding strategy is specified.
    return this.decoding ?? 'auto';
  }
  getRewrittenSrc() {
    // ImageLoaderConfig supports setting a width property. However, we're not setting width here
    // because if the developer uses rendered width instead of intrinsic width in the HTML width
    // attribute, the image requested may be too small for 2x+ screens.
    if (!this._renderedSrc) {
      const imgConfig = {
        src: this.ngSrc
      };
      // Cache calculated image src to reuse it later in the code.
      this._renderedSrc = this.callImageLoader(imgConfig);
    }
    return this._renderedSrc;
  }
  getRewrittenSrcset() {
    const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset);
    const finalSrcs = this.ngSrcset.split(',').filter(src => src !== '').map(srcStr => {
      srcStr = srcStr.trim();
      const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
      return `${this.callImageLoader({
        src: this.ngSrc,
        width
      })} ${srcStr}`;
    });
    return finalSrcs.join(', ');
  }
  getAutomaticSrcset() {
    if (this.sizes) {
      return this.getResponsiveSrcset();
    } else {
      return this.getFixedSrcset();
    }
  }
  getResponsiveSrcset() {
    const {
      breakpoints
    } = this.config;
    let filteredBreakpoints = breakpoints;
    if (this.sizes?.trim() === '100vw') {
      // Since this is a full-screen-width image, our srcset only needs to include
      // breakpoints with full viewport widths.
      filteredBreakpoints = breakpoints.filter(bp => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
    }
    const finalSrcs = filteredBreakpoints.map(bp => `${this.callImageLoader({
      src: this.ngSrc,
      width: bp
    })} ${bp}w`);
    return finalSrcs.join(', ');
  }
  updateSrcAndSrcset(forceSrcRecalc = false) {
    if (forceSrcRecalc) {
      // Reset cached value, so that the followup `getRewrittenSrc()` call
      // will recalculate it and update the cache.
      this._renderedSrc = null;
    }
    const rewrittenSrc = this.getRewrittenSrc();
    this.setHostAttribute('src', rewrittenSrc);
    let rewrittenSrcset = undefined;
    if (this.ngSrcset) {
      rewrittenSrcset = this.getRewrittenSrcset();
    } else if (this.shouldGenerateAutomaticSrcset()) {
      rewrittenSrcset = this.getAutomaticSrcset();
    }
    if (rewrittenSrcset) {
      this.setHostAttribute('srcset', rewrittenSrcset);
    }
    return rewrittenSrcset;
  }
  getFixedSrcset() {
    const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map(multiplier => `${this.callImageLoader({
      src: this.ngSrc,
      width: this.width * multiplier
    })} ${multiplier}x`);
    return finalSrcs.join(', ');
  }
  shouldGenerateAutomaticSrcset() {
    let oversizedImage = false;
    if (!this.sizes) {
      oversizedImage = this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT;
    }
    return !this.disableOptimizedSrcset && !this.srcset && this.imageLoader !== noopImageLoader && !oversizedImage;
  }
  /**
   * Returns an image url formatted for use with the CSS background-image property. Expects one of:
   * * A base64 encoded image, which is wrapped and passed through.
   * * A boolean. If true, calls the image loader to generate a small placeholder url.
   */
  generatePlaceholder(placeholderInput) {
    const {
      placeholderResolution
    } = this.config;
    if (placeholderInput === true) {
      return `url("${escapeCssUrl(this.callImageLoader({
        src: this.ngSrc,
        width: placeholderResolution,
        isPlaceholder: true
      }))}")`;
    } else if (typeof placeholderInput === 'string') {
      return `url("${escapeCssUrl(placeholderInput)}")`;
    }
    return null;
  }
  /**
   * Determines if blur should be applied, based on an optional boolean
   * property `blur` within the optional configuration object `placeholderConfig`.
   */
  shouldBlurPlaceholder(placeholderConfig) {
    if (!placeholderConfig || !Object.hasOwn(placeholderConfig, 'blur')) {
      return true;
    }
    return Boolean(placeholderConfig.blur);
  }
  removePlaceholderOnLoad(img) {
    const callback = () => {
      const changeDetectorRef = this.injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ChangeDetectorRef);
      removeLoadListenerFn();
      removeErrorListenerFn();
      this.placeholder = false;
      changeDetectorRef.markForCheck();
    };
    const removeLoadListenerFn = this.renderer.listen(img, 'load', callback);
    const removeErrorListenerFn = this.renderer.listen(img, 'error', callback);
    // Clean up listeners once the view is destroyed, before the image
    // loads or fails to load, to avoid element from being captured
    // in memory and redundant change detection.
    this.destroyRef.onDestroy(() => {
      removeLoadListenerFn();
      removeErrorListenerFn();
    });
    callOnLoadIfImageIsLoaded(img, callback);
  }
  setHostAttribute(name, value) {
    this.renderer.setAttribute(this.imgElement, name, value);
  }
  static ɵfac = function NgOptimizedImage_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NgOptimizedImage)();
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineDirective"]({
    type: NgOptimizedImage,
    selectors: [["img", "ngSrc", ""]],
    hostVars: 18,
    hostBindings: function NgOptimizedImage_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("position", ctx.fill ? "absolute" : null)("width", ctx.fill ? "100%" : null)("height", ctx.fill ? "100%" : null)("inset", ctx.fill ? "0" : null)("background-size", ctx.placeholder ? "cover" : null)("background-position", ctx.placeholder ? "50% 50%" : null)("background-repeat", ctx.placeholder ? "no-repeat" : null)("background-image", ctx.placeholder ? ctx.generatePlaceholder(ctx.placeholder) : null)("filter", ctx.placeholder && ctx.shouldBlurPlaceholder(ctx.placeholderConfig) ? "blur(15px)" : null);
      }
    },
    inputs: {
      ngSrc: [2, "ngSrc", "ngSrc", unwrapSafeUrl],
      ngSrcset: "ngSrcset",
      sizes: "sizes",
      width: [2, "width", "width", _angular_core__WEBPACK_IMPORTED_MODULE_1__.numberAttribute],
      height: [2, "height", "height", _angular_core__WEBPACK_IMPORTED_MODULE_1__.numberAttribute],
      decoding: "decoding",
      loading: "loading",
      priority: [2, "priority", "priority", _angular_core__WEBPACK_IMPORTED_MODULE_1__.booleanAttribute],
      loaderParams: "loaderParams",
      disableOptimizedSrcset: [2, "disableOptimizedSrcset", "disableOptimizedSrcset", _angular_core__WEBPACK_IMPORTED_MODULE_1__.booleanAttribute],
      fill: [2, "fill", "fill", _angular_core__WEBPACK_IMPORTED_MODULE_1__.booleanAttribute],
      placeholder: [2, "placeholder", "placeholder", booleanOrUrlAttribute],
      placeholderConfig: "placeholderConfig",
      src: "src",
      srcset: "srcset"
    },
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵNgOnChangesFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__.setClassMetadata(NgOptimizedImage, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Directive,
    args: [{
      selector: 'img[ngSrc]',
      host: {
        '[style.position]': 'fill ? "absolute" : null',
        '[style.width]': 'fill ? "100%" : null',
        '[style.height]': 'fill ? "100%" : null',
        '[style.inset]': 'fill ? "0" : null',
        '[style.background-size]': 'placeholder ? "cover" : null',
        '[style.background-position]': 'placeholder ? "50% 50%" : null',
        '[style.background-repeat]': 'placeholder ? "no-repeat" : null',
        '[style.background-image]': 'placeholder ? generatePlaceholder(placeholder) : null',
        '[style.filter]': 'placeholder && shouldBlurPlaceholder(placeholderConfig) ? "blur(15px)" : null'
      }
    }]
  }], () => [], {
    ngSrc: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: [{
        required: true,
        transform: unwrapSafeUrl
      }]
    }],
    ngSrcset: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    sizes: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    width: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: [{
        transform: _angular_core__WEBPACK_IMPORTED_MODULE_1__.numberAttribute
      }]
    }],
    height: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: [{
        transform: _angular_core__WEBPACK_IMPORTED_MODULE_1__.numberAttribute
      }]
    }],
    decoding: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    loading: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    priority: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: [{
        transform: _angular_core__WEBPACK_IMPORTED_MODULE_1__.booleanAttribute
      }]
    }],
    loaderParams: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    disableOptimizedSrcset: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: [{
        transform: _angular_core__WEBPACK_IMPORTED_MODULE_1__.booleanAttribute
      }]
    }],
    fill: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: [{
        transform: _angular_core__WEBPACK_IMPORTED_MODULE_1__.booleanAttribute
      }]
    }],
    placeholder: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input,
      args: [{
        transform: booleanOrUrlAttribute
      }]
    }],
    placeholderConfig: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    src: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }],
    srcset: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_3__.Input
    }]
  });
})();
/***** Helpers *****/
/**
 * Sorts provided config breakpoints and uses defaults.
 */
function processConfig(config) {
  let sortedBreakpoints = {};
  if (config.breakpoints) {
    sortedBreakpoints.breakpoints = config.breakpoints.sort((a, b) => a - b);
  }
  return Object.assign({}, _angular_core__WEBPACK_IMPORTED_MODULE_2__.IMAGE_CONFIG_DEFAULTS, config, sortedBreakpoints);
}
/***** Assert functions *****/
/**
 * Verifies that there is no `src` set on a host element.
 */
function assertNoConflictingSrc(dir) {
  if (dir.src) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir.ngSrc)} both \`src\` and \`ngSrc\` have been set. ` + `Supplying both of these attributes breaks lazy loading. ` + `The NgOptimizedImage directive sets \`src\` itself based on the value of \`ngSrc\`. ` + `To fix this, please remove the \`src\` attribute.`);
  }
}
/**
 * Verifies that there is no `srcset` set on a host element.
 */
function assertNoConflictingSrcset(dir) {
  if (dir.srcset) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2951 /* RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR */, `${imgDirectiveDetails(dir.ngSrc)} both \`srcset\` and \`ngSrcset\` have been set. ` + `Supplying both of these attributes breaks lazy loading. ` + `The NgOptimizedImage directive sets \`srcset\` itself based on the value of ` + `\`ngSrcset\`. To fix this, please remove the \`srcset\` attribute.`);
  }
}
/**
 * Verifies that the `ngSrc` is not a Base64-encoded image.
 */
function assertNotBase64Image(dir) {
  let ngSrc = dir.ngSrc.trim();
  if (ngSrc.startsWith('data:')) {
    if (ngSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
      ngSrc = ngSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
    }
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`ngSrc\` is a Base64-encoded string ` + `(${ngSrc}). NgOptimizedImage does not support Base64-encoded strings. ` + `To fix this, disable the NgOptimizedImage directive for this element ` + `by removing \`ngSrc\` and using a standard \`src\` attribute instead.`);
  }
}
/**
 * Verifies that the 'sizes' only includes responsive values.
 */
function assertNoComplexSizes(dir) {
  let sizes = dir.sizes;
  if (sizes?.match(/((\)|,)\s|^)\d+px/)) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`sizes\` was set to a string including ` + `pixel values. For automatic \`srcset\` generation, \`sizes\` must only include responsive ` + `values, such as \`sizes="50vw"\` or \`sizes="(min-width: 768px) 50vw, 100vw"\`. ` + `To fix this, modify the \`sizes\` attribute, or provide your own \`ngSrcset\` value directly.`);
  }
}
function assertValidPlaceholder(dir, imageLoader) {
  assertNoPlaceholderConfigWithoutPlaceholder(dir);
  assertNoRelativePlaceholderWithoutLoader(dir, imageLoader);
  assertNoOversizedDataUrl(dir);
}
/**
 * Verifies that placeholderConfig isn't being used without placeholder
 */
function assertNoPlaceholderConfigWithoutPlaceholder(dir) {
  if (dir.placeholderConfig && !dir.placeholder) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`placeholderConfig\` options were provided for an ` + `image that does not use the \`placeholder\` attribute, and will have no effect.`);
  }
}
/**
 * Warns if a relative URL placeholder is specified, but no loader is present to provide the small
 * image.
 */
function assertNoRelativePlaceholderWithoutLoader(dir, imageLoader) {
  if (dir.placeholder === true && imageLoader === noopImageLoader) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to true but ` + `no image loader is configured (i.e. the default one is being used), ` + `which would result in the same image being used for the primary image and its placeholder. ` + `To fix this, provide a loader or remove the \`placeholder\` attribute from the image.`);
  }
}
/**
 * Warns or throws an error if an oversized dataURL placeholder is provided.
 */
function assertNoOversizedDataUrl(dir) {
  if (dir.placeholder && typeof dir.placeholder === 'string' && dir.placeholder.startsWith('data:')) {
    if (dir.placeholder.length > DATA_URL_ERROR_LIMIT) {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` + `than ${DATA_URL_ERROR_LIMIT} characters. This is strongly discouraged, as large inline placeholders ` + `directly increase the bundle size of Angular and hurt page load performance. To fix this, generate ` + `a smaller data URL placeholder.`);
    }
    if (dir.placeholder.length > DATA_URL_WARN_LIMIT) {
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` + `than ${DATA_URL_WARN_LIMIT} characters. This is discouraged, as large inline placeholders ` + `directly increase the bundle size of Angular and hurt page load performance. For better loading performance, ` + `generate a smaller data URL placeholder.`));
    }
  }
}
/**
 * Verifies that the `ngSrc` is not a Blob URL.
 */
function assertNotBlobUrl(dir) {
  const ngSrc = dir.ngSrc.trim();
  if (ngSrc.startsWith('blob:')) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrc\` was set to a blob URL (${ngSrc}). ` + `Blob URLs are not supported by the NgOptimizedImage directive. ` + `To fix this, disable the NgOptimizedImage directive for this element ` + `by removing \`ngSrc\` and using a regular \`src\` attribute instead.`);
  }
}
/**
 * Verifies that the input is set to a non-empty string.
 */
function assertNonEmptyInput(dir, name, value) {
  const isString = typeof value === 'string';
  const isEmptyString = isString && value.trim() === '';
  if (!isString || isEmptyString) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${name}\` has an invalid value ` + `(\`${value}\`). To fix this, change the value to a non-empty string.`);
  }
}
/**
 * Verifies that the `ngSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x".
 */
function assertValidNgSrcset(dir, value) {
  if (value == null) return;
  assertNonEmptyInput(dir, 'ngSrcset', value);
  const stringVal = value;
  const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
  const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
  if (isValidDensityDescriptor) {
    assertUnderDensityCap(dir, stringVal);
  }
  const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
  if (!isValidSrcset) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrcset\` has an invalid value (\`${value}\`). ` + `To fix this, supply \`ngSrcset\` using a comma-separated list of one or more width ` + `descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`);
  }
}
function assertUnderDensityCap(dir, value) {
  const underDensityCap = value.split(',').every(num => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
  if (!underDensityCap) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` contains an unsupported image density:` + `\`${value}\`. NgOptimizedImage generally recommends a max image density of ` + `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` + `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` + `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` + `most use cases. Images that will be pinch-zoomed are typically the primary use case for ` + `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`);
  }
}
/**
 * Creates a `RuntimeError` instance to represent a situation when an input is set after
 * the directive has initialized.
 */
function postInitInputChangeError(dir, inputName) {
  let reason;
  if (inputName === 'width' || inputName === 'height') {
    reason = `Changing \`${inputName}\` may result in different attribute value ` + `applied to the underlying image element and cause layout shifts on a page.`;
  } else {
    reason = `Changing the \`${inputName}\` would have no effect on the underlying ` + `image element, because the resource loading has already occurred.`;
  }
  return new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` was updated after initialization. ` + `The NgOptimizedImage directive will not react to this input change. ${reason} ` + `To fix this, either switch \`${inputName}\` to a static value ` + `or wrap the image element in an @if that is gated on the necessary value.`);
}
/**
 * Verify that none of the listed inputs has changed.
 */
function assertNoPostInitInputChange(dir, changes, inputs) {
  inputs.forEach(input => {
    const isUpdated = Object.hasOwn(changes, input);
    if (isUpdated && !changes[input].isFirstChange()) {
      if (input === 'ngSrc') {
        // When the `ngSrc` input changes, we detect that only in the
        // `ngOnChanges` hook, thus the `ngSrc` is already set. We use
        // `ngSrc` in the error message, so we use a previous value, but
        // not the updated one in it.
        dir = {
          ngSrc: changes[input].previousValue
        };
      }
      throw postInitInputChangeError(dir, input);
    }
  });
}
/**
 * Verifies that a specified input is a number greater than 0.
 */
function assertGreaterThanZero(dir, inputValue, inputName) {
  const validNumber = typeof inputValue === 'number' && inputValue > 0;
  const validString = typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
  if (!validNumber && !validString) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` has an invalid value. ` + `To fix this, provide \`${inputName}\` as a number greater than 0.`);
  }
}
/**
 * Verifies that the rendered image is not visually distorted. Effectively this is checking:
 * - Whether the "width" and "height" attributes reflect the actual dimensions of the image.
 * - Whether image styling is "correct" (see below for a longer explanation).
 */
function assertNoImageDistortion(dir, img, renderer, destroyRef) {
  const callback = () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
    const computedStyle = wx.__window.getComputedStyle(img);
    let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
    let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
    const boxSizing = computedStyle.getPropertyValue('box-sizing');
    if (boxSizing === 'border-box') {
      const paddingTop = computedStyle.getPropertyValue('padding-top');
      const paddingRight = computedStyle.getPropertyValue('padding-right');
      const paddingBottom = computedStyle.getPropertyValue('padding-bottom');
      const paddingLeft = computedStyle.getPropertyValue('padding-left');
      renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
      renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
    }
    const renderedAspectRatio = renderedWidth / renderedHeight;
    const nonZeroRenderedDimensions = renderedWidth !== 0 && renderedHeight !== 0;
    const intrinsicWidth = img.naturalWidth;
    const intrinsicHeight = img.naturalHeight;
    const intrinsicAspectRatio = intrinsicWidth / intrinsicHeight;
    const suppliedWidth = dir.width;
    const suppliedHeight = dir.height;
    const suppliedAspectRatio = suppliedWidth / suppliedHeight;
    // Tolerance is used to account for the impact of subpixel rendering.
    // Due to subpixel rendering, the rendered, intrinsic, and supplied
    // aspect ratios of a correctly configured image may not exactly match.
    // For example, a `width=4030 height=3020` image might have a rendered
    // size of "1062w, 796.48h". (An aspect ratio of 1.334... vs. 1.333...)
    const inaccurateDimensions = Math.abs(suppliedAspectRatio - intrinsicAspectRatio) > ASPECT_RATIO_TOLERANCE;
    const stylingDistortion = nonZeroRenderedDimensions && Math.abs(intrinsicAspectRatio - renderedAspectRatio) > ASPECT_RATIO_TOLERANCE;
    if (inaccurateDimensions) {
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the image does not match ` + `the aspect ratio indicated by the width and height attributes. ` + `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` + `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nSupplied width and height attributes: ` + `${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${round(suppliedAspectRatio)}). ` + `\nTo fix this, update the width and height attributes.`));
    } else if (stylingDistortion) {
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the rendered image ` + `does not match the image's intrinsic aspect ratio. ` + `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` + `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nRendered image size: ` + `${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ` + `${round(renderedAspectRatio)}). \nThis issue can occur if "width" and "height" ` + `attributes are added to an image without updating the corresponding ` + `image styling. To fix this, adjust image styling. In most cases, ` + `adding "height: auto" or "width: auto" to the image styling will fix ` + `this issue.`));
    } else if (!dir.ngSrcset && nonZeroRenderedDimensions) {
      // If `ngSrcset` hasn't been set, sanity check the intrinsic size.
      const recommendedWidth = RECOMMENDED_SRCSET_DENSITY_CAP * renderedWidth;
      const recommendedHeight = RECOMMENDED_SRCSET_DENSITY_CAP * renderedHeight;
      const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
      const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
      if (oversizedWidth || oversizedHeight) {
        console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2960 /* RuntimeErrorCode.OVERSIZED_IMAGE */, `${imgDirectiveDetails(dir.ngSrc)} the intrinsic image is significantly ` + `larger than necessary. ` + `\nRendered image size: ${renderedWidth}w x ${renderedHeight}h. ` + `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h. ` + `\nRecommended intrinsic image size: ${recommendedWidth}w x ${recommendedHeight}h. ` + `\nNote: Recommended intrinsic image size is calculated assuming a maximum DPR of ` + `${RECOMMENDED_SRCSET_DENSITY_CAP}. To improve loading time, resize the image ` + `or consider using the "ngSrcset" and "sizes" attributes.`));
      }
    }
  };
  const removeLoadListenerFn = renderer.listen(img, 'load', callback);
  // We only listen to the `error` event to remove the `load` event listener because it will not be
  // fired if the image fails to load. This is done to prevent memory leaks in development mode
  // because image elements aren't garbage-collected properly. It happens because zone.js stores the
  // event listener directly on the element and closures capture `dir`.
  const removeErrorListenerFn = renderer.listen(img, 'error', () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
  });
  // Clean up listeners once the view is destroyed, before the image
  // loads or fails to load, to avoid element from being captured
  // in memory and redundant change detection.
  destroyRef.onDestroy(() => {
    removeLoadListenerFn();
    removeErrorListenerFn();
  });
  callOnLoadIfImageIsLoaded(img, callback);
}
/**
 * Verifies that a specified input is set.
 */
function assertNonEmptyWidthAndHeight(dir) {
  let missingAttributes = [];
  if (dir.width === undefined) missingAttributes.push('width');
  if (dir.height === undefined) missingAttributes.push('height');
  if (missingAttributes.length > 0) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2954 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir.ngSrc)} these required attributes ` + `are missing: ${missingAttributes.map(attr => `"${attr}"`).join(', ')}. ` + `Including "width" and "height" attributes will prevent image-related layout shifts. ` + `To fix this, include "width" and "height" attributes on the image tag or turn on ` + `"fill" mode with the \`fill\` attribute.`);
  }
}
/**
 * Verifies that width and height are not set. Used in fill mode, where those attributes don't make
 * sense.
 */
function assertEmptyWidthAndHeight(dir) {
  if (dir.width || dir.height) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the attributes \`height\` and/or \`width\` are present ` + `along with the \`fill\` attribute. Because \`fill\` mode causes an image to fill its containing ` + `element, the size attributes have no effect and should be removed.`);
  }
}
/**
 * Verifies that the rendered image has a nonzero height. If the image is in fill mode, provides
 * guidance that this can be caused by the containing element's CSS position property.
 */
function assertNonZeroRenderedHeight(dir, img, renderer, destroyRef) {
  const callback = () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
    const renderedHeight = img.clientHeight;
    if (dir.fill && renderedHeight === 0) {
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. ` + `This is likely because the containing element does not have the CSS 'position' ` + `property set to one of the following: "relative", "fixed", or "absolute". ` + `To fix this problem, make sure the container element has the CSS 'position' ` + `property defined and the height of the element is not zero.`));
    }
  };
  const removeLoadListenerFn = renderer.listen(img, 'load', callback);
  // See comments in the `assertNoImageDistortion`.
  const removeErrorListenerFn = renderer.listen(img, 'error', () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
  });
  // Clean up listeners once the view is destroyed, before the image
  // loads or fails to load, to avoid element from being captured
  // in memory and redundant change detection.
  destroyRef.onDestroy(() => {
    removeLoadListenerFn();
    removeErrorListenerFn();
  });
  callOnLoadIfImageIsLoaded(img, callback);
}
/**
 * Verifies that the `loading` attribute is set to a valid input &
 * is not used on priority images.
 */
function assertValidLoadingInput(dir) {
  if (dir.loading && dir.priority) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` + `was used on an image that was marked "priority". ` + `Setting \`loading\` on priority images is not allowed ` + `because these images will always be eagerly loaded. ` + `To fix this, remove the “loading” attribute from the priority image.`);
  }
  const validInputs = ['auto', 'eager', 'lazy'];
  if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` + `has an invalid value (\`${dir.loading}\`). ` + `To fix this, provide a valid value ("lazy", "eager", or "auto").`);
  }
}
/**
 * Verifies that the `decoding` attribute is set to a valid input.
 */
function assertValidDecodingInput(dir) {
  const validInputs = ['sync', 'async', 'auto'];
  if (typeof dir.decoding === 'string' && !validInputs.includes(dir.decoding)) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_2__.RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`decoding\` attribute ` + `has an invalid value (\`${dir.decoding}\`). ` + `To fix this, provide a valid value ("sync", "async", or "auto").`);
  }
}
/**
 * Warns if NOT using a loader (falling back to the generic loader) and
 * the image appears to be hosted on one of the image CDNs for which
 * we do have a built-in image loader. Suggests switching to the
 * built-in loader.
 *
 * @param ngSrc Value of the ngSrc attribute
 * @param imageLoader ImageLoader provided
 */
function assertNotMissingBuiltInLoader(ngSrc, imageLoader) {
  if (imageLoader === noopImageLoader) {
    let builtInLoaderName = '';
    for (const loader of BUILT_IN_LOADERS) {
      if (loader.testUrl(ngSrc)) {
        builtInLoaderName = loader.name;
        break;
      }
    }
    if (builtInLoaderName) {
      console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2962 /* RuntimeErrorCode.MISSING_BUILTIN_LOADER */, `NgOptimizedImage: It looks like your images may be hosted on the ` + `${builtInLoaderName} CDN, but your app is not using Angular's ` + `built-in loader for that CDN. We recommend switching to use ` + `the built-in by calling \`provide${builtInLoaderName}Loader()\` ` + `in your \`providers\` and passing it your instance's base URL. ` + `If you don't want to use the built-in loader, define a custom ` + `loader function using IMAGE_LOADER to silence this warning.`));
    }
  }
}
/**
 * Warns if ngSrcset is present and no loader is configured (i.e. the default one is being used).
 */
function assertNoNgSrcsetWithoutLoader(dir, imageLoader) {
  if (dir.ngSrcset && imageLoader === noopImageLoader) {
    console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` attribute is present but ` + `no image loader is configured (i.e. the default one is being used), ` + `which would result in the same image being used for all configured sizes. ` + `To fix this, provide a loader or remove the \`ngSrcset\` attribute from the image.`));
  }
}
/**
 * Warns if loaderParams is present and no loader is configured (i.e. the default one is being
 * used).
 */
function assertNoLoaderParamsWithoutLoader(dir, imageLoader) {
  if (dir.loaderParams && imageLoader === noopImageLoader) {
    console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`loaderParams\` attribute is present but ` + `no image loader is configured (i.e. the default one is being used), ` + `which means that the loaderParams data will not be consumed and will not affect the URL. ` + `To fix this, provide a custom loader or remove the \`loaderParams\` attribute from the image.`));
  }
}
/**
 * Warns if the priority attribute is used too often on page load
 */
function assetPriorityCountBelowThreshold(_x) {
  return _assetPriorityCountBelowThreshold.apply(this, arguments);
}
/**
 * Warns if placeholder's dimension are over a threshold.
 *
 * This assert function is meant to only run on the browser.
 */
function _assetPriorityCountBelowThreshold() {
  _assetPriorityCountBelowThreshold = _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* (appRef) {
    if (IMGS_WITH_PRIORITY_ATTR_COUNT === 0) {
      IMGS_WITH_PRIORITY_ATTR_COUNT++;
      yield appRef.whenStable();
      if (IMGS_WITH_PRIORITY_ATTR_COUNT > PRIORITY_COUNT_THRESHOLD) {
        console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2966 /* RuntimeErrorCode.TOO_MANY_PRIORITY_ATTRIBUTES */, `NgOptimizedImage: The "priority" attribute is set to true more than ${PRIORITY_COUNT_THRESHOLD} times (${IMGS_WITH_PRIORITY_ATTR_COUNT} times). ` + `Marking too many images as "high" priority can hurt your application's LCP (https://web.dev/lcp). ` + `"Priority" should only be set on the image expected to be the page's LCP element.`));
      }
    } else {
      IMGS_WITH_PRIORITY_ATTR_COUNT++;
    }
  });
  return _assetPriorityCountBelowThreshold.apply(this, arguments);
}
function assertPlaceholderDimensions(dir, imgElement) {
  const computedStyle = wx.__window.getComputedStyle(imgElement);
  let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
  let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
  if (renderedWidth > PLACEHOLDER_DIMENSION_LIMIT || renderedHeight > PLACEHOLDER_DIMENSION_LIMIT) {
    console.warn((0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.formatRuntimeError)(2967 /* RuntimeErrorCode.PLACEHOLDER_DIMENSION_LIMIT_EXCEEDED */, `${imgDirectiveDetails(dir.ngSrc)} it uses a placeholder image, but at least one ` + `of the dimensions attribute (height or width) exceeds the limit of ${PLACEHOLDER_DIMENSION_LIMIT}px. ` + `To fix this, use a smaller image as a placeholder.`));
  }
}
function callOnLoadIfImageIsLoaded(img, callback) {
  // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-img-complete
  // The spec defines that `complete` is truthy once its request state is fully available.
  // The image may already be available if it’s loaded from the browser cache.
  // In that case, the `load` event will not fire at all, meaning that all setup
  // callbacks listening for the `load` event will not be invoked.
  // In Safari, there is a known behavior where the `complete` property of an
  // `HTMLImageElement` may sometimes return `true` even when the image is not fully loaded.
  // Checking both `img.complete` and `img.naturalWidth` is the most reliable way to
  // determine if an image has been fully loaded, especially in browsers where the
  // `complete` property may return `true` prematurely.
  if (img.complete && img.naturalWidth) {
    callback();
  }
}
function round(input) {
  return Number.isInteger(input) ? input : input.toFixed(2);
}
// Transform function to handle SafeValue input for ngSrc. This doesn't do any sanitization,
// as that is not needed for img.src and img.srcset. This transform is purely for compatibility.
function unwrapSafeUrl(value) {
  if (typeof value === 'string') {
    return value;
  }
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.unwrapSafeValue)(value);
}
// Transform function to handle inputs which may be booleans, strings, or string representations
// of boolean values. Used for the placeholder attribute.
function booleanOrUrlAttribute(value) {
  if (typeof value === 'string' && value !== 'true' && value !== 'false' && value !== '') {
    return value;
  }
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.booleanAttribute)(value);
}

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
/**
 * @module
 * @description
 * Entry point for all public APIs of the common package.
 */

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
 * Entry point for all public APIs of this package.
 */
// This file only reexports content of the `src` folder. Keep it that way.

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// This file is not used to build this module. It is only used during editing
// by the TypeScript language service and during build for verification. `ngc`
// replaces this file with production index.ts when it rewrites private symbol
// names.

/**
 * Generated bundle index. Do not edit.
 */
;

//# sourceMappingURL=angular-miniprogram-common.mjs.map

/***/ },

/***/ 7645
/*!*********************************************************!*\
  !*** ../../dist/fesm2022/angular-miniprogram-forms.mjs ***!
  \*********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractControl: () => (/* binding */ AbstractControl),
/* harmony export */   AbstractControlDirective: () => (/* binding */ AbstractControlDirective),
/* harmony export */   AbstractFormGroupDirective: () => (/* binding */ AbstractFormGroupDirective),
/* harmony export */   COMPOSITION_BUFFER_MODE: () => (/* binding */ COMPOSITION_BUFFER_MODE),
/* harmony export */   CheckBoxGroupValueAccessor: () => (/* binding */ CheckBoxGroupValueAccessor),
/* harmony export */   CheckboxControl: () => (/* binding */ CheckboxControl),
/* harmony export */   CheckboxRequiredValidator: () => (/* binding */ CheckboxRequiredValidator),
/* harmony export */   ControlContainer: () => (/* binding */ ControlContainer),
/* harmony export */   DefaultValueAccessor: () => (/* binding */ DefaultValueAccessor),
/* harmony export */   EmailValidator: () => (/* binding */ EmailValidator),
/* harmony export */   FormArray: () => (/* binding */ FormArray),
/* harmony export */   FormArrayName: () => (/* binding */ FormArrayName),
/* harmony export */   FormBuilder: () => (/* binding */ FormBuilder),
/* harmony export */   FormControl: () => (/* binding */ FormControl),
/* harmony export */   FormControlDirective: () => (/* binding */ FormControlDirective),
/* harmony export */   FormControlName: () => (/* binding */ FormControlName),
/* harmony export */   FormGroup: () => (/* binding */ FormGroup),
/* harmony export */   FormGroupDirective: () => (/* binding */ FormGroupDirective),
/* harmony export */   FormGroupName: () => (/* binding */ FormGroupName),
/* harmony export */   FormRecord: () => (/* binding */ FormRecord),
/* harmony export */   FormsModule: () => (/* binding */ FormsModule),
/* harmony export */   MaxLengthValidator: () => (/* binding */ MaxLengthValidator),
/* harmony export */   MaxValidator: () => (/* binding */ MaxValidator),
/* harmony export */   MinLengthValidator: () => (/* binding */ MinLengthValidator),
/* harmony export */   MinValidator: () => (/* binding */ MinValidator),
/* harmony export */   NG_ASYNC_VALIDATORS: () => (/* binding */ NG_ASYNC_VALIDATORS),
/* harmony export */   NG_VALIDATORS: () => (/* binding */ NG_VALIDATORS),
/* harmony export */   NG_VALUE_ACCESSOR: () => (/* binding */ NG_VALUE_ACCESSOR),
/* harmony export */   NgControl: () => (/* binding */ NgControl),
/* harmony export */   NgControlStatus: () => (/* binding */ NgControlStatus),
/* harmony export */   NgControlStatusGroup: () => (/* binding */ NgControlStatusGroup),
/* harmony export */   NgForm: () => (/* binding */ NgForm),
/* harmony export */   NgModel: () => (/* binding */ NgModel),
/* harmony export */   NgModelGroup: () => (/* binding */ NgModelGroup),
/* harmony export */   NgSelectOption: () => (/* binding */ NgSelectOption),
/* harmony export */   NonNullableFormBuilder: () => (/* binding */ NonNullableFormBuilder),
/* harmony export */   NumberValueAccessor: () => (/* binding */ NumberValueAccessor),
/* harmony export */   PatternValidator: () => (/* binding */ PatternValidator),
/* harmony export */   PickerValueAccessor: () => (/* binding */ PickerValueAccessor),
/* harmony export */   PickerViewValueAccessor: () => (/* binding */ PickerViewValueAccessor),
/* harmony export */   RadioControl: () => (/* binding */ RadioControl),
/* harmony export */   RadioGroupValueAccessor: () => (/* binding */ RadioGroupValueAccessor),
/* harmony export */   RangeValueAccessor: () => (/* binding */ RangeValueAccessor),
/* harmony export */   ReactiveFormsModule: () => (/* binding */ ReactiveFormsModule),
/* harmony export */   RequiredValidator: () => (/* binding */ RequiredValidator),
/* harmony export */   SelectControlValueAccessor: () => (/* binding */ SelectControlValueAccessor),
/* harmony export */   SelectMultipleControlValueAccessor: () => (/* binding */ SelectMultipleControlValueAccessor),
/* harmony export */   SliderValueAccessor: () => (/* binding */ SliderValueAccessor),
/* harmony export */   SwitchValueAccessor: () => (/* binding */ SwitchValueAccessor),
/* harmony export */   UntypedFormArray: () => (/* binding */ UntypedFormArray),
/* harmony export */   UntypedFormBuilder: () => (/* binding */ UntypedFormBuilder),
/* harmony export */   UntypedFormControl: () => (/* binding */ UntypedFormControl),
/* harmony export */   UntypedFormGroup: () => (/* binding */ UntypedFormGroup),
/* harmony export */   VERSION: () => (/* binding */ VERSION),
/* harmony export */   Validators: () => (/* binding */ Validators),
/* harmony export */   "ɵInternalFormsSharedModule": () => (/* binding */ ɵInternalFormsSharedModule),
/* harmony export */   "ɵNgNoValidate": () => (/* binding */ ɵNgNoValidate),
/* harmony export */   "ɵNgSelectMultipleOption": () => (/* binding */ ɵNgSelectMultipleOption)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 9733);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 9631);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 6631);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 8841);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 1580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 4887);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 5187);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs/operators */ 2525);





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
class BaseControlValueAccessor {
  _renderer;
  _elementRef;
  /**
   * The registered callback function called when a change or input event occurs on the input
   * element.
   * @docs-private
   */
  onChange = _ => {};
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
    this.setProperty('disabled', isDisabled);
  }
  static ɵfac = function BaseControlValueAccessor_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || BaseControlValueAccessor)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: BaseControlValueAccessor
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(BaseControlValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef
  }], null);
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
class BuiltInControlValueAccessor extends BaseControlValueAccessor {
  static ɵfac = /*@__PURE__*/(() => {
    let ɵBuiltInControlValueAccessor_BaseFactory;
    return function BuiltInControlValueAccessor_Factory(__ngFactoryType__) {
      return (ɵBuiltInControlValueAccessor_BaseFactory || (ɵBuiltInControlValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](BuiltInControlValueAccessor)))(__ngFactoryType__ || BuiltInControlValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: BuiltInControlValueAccessor,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(BuiltInControlValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive
  }], null, null);
})();
/**
 * Used to provide a `ControlValueAccessor` for form controls.
 *
 * See `DefaultValueAccessor` for how to implement one.
 *
 * @publicApi
 */
const NG_VALUE_ACCESSOR = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'NgValueAccessor' : '');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => CheckBoxGroupValueAccessor),
  multi: true
};
class CheckBoxGroupValueAccessor extends BuiltInControlValueAccessor {
  children;
  valueChange(list) {
    if (this.children) {
      this.children.forEach(item => {
        item.updateChecked(list.some(value => value === item.value));
      });
    }
    this.onChange(list);
  }
  writeValue(list) {
    if (this.children) {
      this.children.forEach(item => {
        item.updateChecked(list.some(value => value === item.value));
      });
    }
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵCheckBoxGroupValueAccessor_BaseFactory;
    return function CheckBoxGroupValueAccessor_Factory(__ngFactoryType__) {
      return (ɵCheckBoxGroupValueAccessor_BaseFactory || (ɵCheckBoxGroupValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](CheckBoxGroupValueAccessor)))(__ngFactoryType__ || CheckBoxGroupValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: CheckBoxGroupValueAccessor,
    selectors: [["checkbox-group", "formControlName", ""], ["checkbox-group", "formControl", ""], ["checkbox-group", "ngModel", ""]],
    contentQueries: function CheckBoxGroupValueAccessor_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵcontentQuery"](dirIndex, CheckboxControl, 5);
      }
      if (rf & 2) {
        let _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵloadQuery"]()) && (ctx.children = _t);
      }
    },
    hostBindings: function CheckBoxGroupValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("bindchange", function CheckBoxGroupValueAccessor_bindchange_HostBindingHandler($event) {
          return ctx.valueChange($event.detail.value);
        });
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([CHECKBOX_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(CheckBoxGroupValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'checkbox-group[formControlName],checkbox-group[formControl],checkbox-group[ngModel]',
      host: {
        '(bindchange)': 'valueChange($event.detail.value)'
      },
      providers: [CHECKBOX_VALUE_ACCESSOR]
    }]
  }], null, {
    children: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_0__.ContentChildren,
      args: [(0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => CheckboxControl), {
        descendants: true
      }]
    }]
  });
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
class CheckboxControl {
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
    this.renderer.setProperty(this.elementRef.nativeElement, 'checked', value);
  }
  static ɵfac = function CheckboxControl_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || CheckboxControl)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: CheckboxControl,
    selectors: [["checkbox"]],
    hostVars: 2,
    hostBindings: function CheckboxControl_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdomProperty"]("value", ctx.value)("checked", ctx.checked);
      }
    },
    inputs: {
      value: "value"
    },
    standalone: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(CheckboxControl, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'checkbox',
      host: {}
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2
  }], {
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['value']
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }],
    checked: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['checked']
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
const DEFAULT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => DefaultValueAccessor),
  multi: true
};
/**
 * @description
 * Provide this token to control if form directives buffer IME input until
 * the "compositionend" event occurs.
 * @publicApi
 */
const COMPOSITION_BUFFER_MODE = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken('CompositionEventMode');
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
class DefaultValueAccessor extends BaseControlValueAccessor {
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
    const normalizedValue = value == null ? undefined : value;
    if (typeof normalizedValue !== 'undefined') {
      this.setProperty('value', normalizedValue);
    }
  }
  valueChange(value) {
    this.onChange(value);
  }
  static ɵfac = function DefaultValueAccessor_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || DefaultValueAccessor)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: DefaultValueAccessor,
    selectors: [["input", "formControlName", ""], ["textarea", "formControlName", ""], ["input", "formControl", ""], ["textarea", "formControl", ""], ["input", "ngModel", ""], ["textarea", "ngModel", ""], ["", "ngDefaultControl", ""]],
    hostVars: 2,
    hostBindings: function DefaultValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("bindinput", function DefaultValueAccessor_bindinput_HostBindingHandler($event) {
          return ctx.valueChange($event.detail.value);
        })("bindblur", function DefaultValueAccessor_bindblur_HostBindingHandler() {
          return ctx.onTouched();
        });
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdomProperty"]("value", ctx.value)("disabled", ctx.disabled);
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([DEFAULT_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(DefaultValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'input[formControlName],textarea[formControlName],input[formControl],textarea[formControl],input[ngModel],textarea[ngModel],[ngDefaultControl]',
      // TODO: vsavkin replace the above selector with the one below it once
      // https://github.com/angular/angular/issues/3011 is implemented
      // selector: '[ngModel],[formControl],[formControlName]',
      host: {
        '(bindinput)': 'valueChange($event.detail.value)',
        '(bindblur)': 'onTouched()'
      },
      providers: [DEFAULT_VALUE_ACCESSOR]
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef
  }], {
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['value']
    }],
    disabled: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['disabled']
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
const formControlNameExample = `
  <div [formGroup]="myGroup">
    <input formControlName="firstName">
  </div>

  In your class:

  this.myGroup = new FormGroup({
      firstName: new FormControl()
  });`;
const formGroupNameExample = `
  <div [formGroup]="myGroup">
      <div formGroupName="person">
        <input formControlName="firstName">
      </div>
  </div>

  In your class:

  this.myGroup = new FormGroup({
      person: new FormGroup({ firstName: new FormControl() })
  });`;
const formArrayNameExample = `
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
const ngModelGroupExample = `
  <form>
      <div ngModelGroup="person">
        <input [(ngModel)]="person.name" name="firstName">
      </div>
  </form>`;
const ngModelWithFormGroupExample = `
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
const VERSION = /* @__PURE__ */new _angular_core__WEBPACK_IMPORTED_MODULE_1__.Version('0.0.0-PLACEHOLDER');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
function controlParentException(nameOrIndex) {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1050 /* RuntimeErrorCode.FORM_CONTROL_NAME_MISSING_PARENT */, `formControlName must be used with a parent formGroup or formArray directive. You'll want to add a formGroup/formArray
      directive and pass it an existing FormGroup/FormArray instance (you can create one in your class).

      ${describeFormControl(nameOrIndex)}

    Example:

    ${formControlNameExample}`);
}
function describeFormControl(nameOrIndex) {
  if (nameOrIndex == null || nameOrIndex === '') {
    return '';
  }
  const valueType = typeof nameOrIndex === 'string' ? 'name' : 'index';
  return `Affected Form Control ${valueType}: "${nameOrIndex}"`;
}
function ngModelGroupException() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1051 /* RuntimeErrorCode.FORM_CONTROL_NAME_INSIDE_MODEL_GROUP */, `formControlName cannot be used with an ngModelGroup parent. It is only compatible with parents
      that also have a "form" prefix: formGroupName, formArrayName, or formGroup.

      Option 1:  Update the parent to be formGroupName (reactive form strategy)

      ${formGroupNameExample}

      Option 2: Use ngModel instead of formControlName (template-driven strategy)

      ${ngModelGroupExample}`);
}
function missingFormException() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1052 /* RuntimeErrorCode.FORM_GROUP_MISSING_INSTANCE */, `formGroup expects a FormGroup instance. Please pass one in.

      Example:

      ${formControlNameExample}`);
}
function groupParentException() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1053 /* RuntimeErrorCode.FORM_GROUP_NAME_MISSING_PARENT */, `formGroupName must be used with a parent formGroup directive.  You'll want to add a formGroup
    directive and pass it an existing FormGroup instance (you can create one in your class).

    Example:

    ${formGroupNameExample}`);
}
function arrayParentException() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1054 /* RuntimeErrorCode.FORM_ARRAY_NAME_MISSING_PARENT */, `formArrayName must be used with a parent formGroup directive.  You'll want to add a formGroup
      directive and pass it an existing FormGroup instance (you can create one in your class).

      Example:

      ${formArrayNameExample}`);
}
const disabledAttrWarning = `
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
const asyncValidatorsDroppedWithOptsWarning = `
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
  const versionSubDomain = VERSION.major !== '0' ? `v${VERSION.major}.` : '';
  return `
  It looks like you're using ngModel on the same form field as ${directiveName}.
  Support for using the ngModel input property and ngModelChange event with
  reactive form directives has been deprecated in Angular v6 and will be removed
  in a future version of Angular.

  For more information on this, see our API docs here:
  https://${versionSubDomain}angular.dev/api/forms/${directiveName === 'formControl' ? 'FormControlDirective' : 'FormControlName'}
  `;
}
function describeKey(isFormGroup, key) {
  return isFormGroup ? `with name: '${key}'` : `at index: ${key}`;
}
function noControlsError(isFormGroup) {
  return `
    There are no form controls registered with this ${isFormGroup ? 'group' : 'array'} yet. If you're using ngModel,
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
  // non-strict comparison is intentional, to check for both `null` and `undefined` values
  if (value == null) {
    return null;
  } else if (Array.isArray(value) || typeof value === 'string') {
    return value.length;
  } else if (value instanceof Set) {
    return value.size;
  }
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
const NG_VALIDATORS = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'NgValidators' : '');
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
const NG_ASYNC_VALIDATORS = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'NgAsyncValidators' : '');
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
const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
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
class Validators {
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
}
/**
 * Validator that requires the control's value to be greater than or equal to the provided number.
 * See `Validators.min` for additional information.
 */
function minValidator(min) {
  return control => {
    if (control.value == null || min == null) {
      return null; // don't validate empty values to allow optional controls
    }
    const value = parseFloat(control.value);
    // Controls with NaN values after parsing should be treated as not having a
    // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
    return !isNaN(value) && value < min ? {
      'min': {
        'min': min,
        'actual': control.value
      }
    } : null;
  };
}
/**
 * Validator that requires the control's value to be less than or equal to the provided number.
 * See `Validators.max` for additional information.
 */
function maxValidator(max) {
  return control => {
    if (control.value == null || max == null) {
      return null; // don't validate empty values to allow optional controls
    }
    const value = parseFloat(control.value);
    // Controls with NaN values after parsing should be treated as not having a
    // maximum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-max
    return !isNaN(value) && value > max ? {
      'max': {
        'max': max,
        'actual': control.value
      }
    } : null;
  };
}
/**
 * Validator that requires the control have a non-empty value.
 * See `Validators.required` for additional information.
 */
function requiredValidator(control) {
  return isEmptyInputValue(control.value) ? {
    'required': true
  } : null;
}
/**
 * Validator that requires the control's value be true. This validator is commonly
 * used for required checkboxes.
 * See `Validators.requiredTrue` for additional information.
 */
function requiredTrueValidator(control) {
  return control.value === true ? null : {
    'required': true
  };
}
/**
 * Validator that requires the control's value pass an email validation test.
 * See `Validators.email` for additional information.
 */
function emailValidator(control) {
  if (isEmptyInputValue(control.value)) {
    return null; // don't validate empty values to allow optional controls
  }
  return EMAIL_REGEXP.test(control.value) ? null : {
    'email': true
  };
}
/**
 * Validator that requires the number of items in the control's value to be greater than or equal
 * to the provided minimum length. See `Validators.minLength` for additional information.
 *
 * The minLengthValidator respects every length property in an object, regardless of whether it's an array.
 * For example, the object {id: 1, length: 0, width: 0} should be validated.
 */
function minLengthValidator(minLength) {
  return control => {
    const length = control.value?.length ?? lengthOrSize(control.value);
    if (length === null || length === 0) {
      // don't validate empty values to allow optional controls
      // don't validate values without `length` or `size` property
      return null;
    }
    return length < minLength ? {
      'minlength': {
        'requiredLength': minLength,
        'actualLength': length
      }
    } : null;
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
  return control => {
    const length = control.value?.length ?? lengthOrSize(control.value);
    if (length !== null && length > maxLength) {
      return {
        'maxlength': {
          'requiredLength': maxLength,
          'actualLength': length
        }
      };
    }
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
  if (typeof pattern === 'string') {
    regexStr = '';
    if (pattern.charAt(0) !== '^') regexStr += '^';
    regexStr += pattern;
    if (pattern.charAt(pattern.length - 1) !== '$') regexStr += '$';
    regex = new RegExp(regexStr);
  } else {
    regexStr = pattern.toString();
    regex = pattern;
  }
  return control => {
    if (isEmptyInputValue(control.value)) {
      return null; // don't validate empty values to allow optional controls
    }
    const value = control.value;
    return regex.test(value) ? null : {
      'pattern': {
        'requiredPattern': regexStr,
        'actualValue': value
      }
    };
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
  const obs = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.isPromise)(value) ? (0,rxjs__WEBPACK_IMPORTED_MODULE_7__.from)(value) : value;
  if ((typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && !(0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.isSubscribable)(obs)) {
    let errorMessage = `Expected async validator to return Promise or Observable.`;
    // A synchronous validator will return object or null.
    if (typeof value === 'object') {
      errorMessage += ' Are you using a synchronous validator where an async validator is expected?';
    }
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(-1101 /* RuntimeErrorCode.WRONG_VALIDATOR_RETURN_TYPE */, errorMessage);
  }
  return obs;
}
function mergeErrors(arrayOfErrors) {
  let res = {};
  arrayOfErrors.forEach(errors => {
    res = errors != null ? {
      ...res,
      ...errors
    } : res;
  });
  return Object.keys(res).length === 0 ? null : res;
}
function executeValidators(control, validators) {
  return validators.map(validator => validator(control));
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
  return validators.map(validator => {
    return isValidatorFn(validator) ? validator : c => validator.validate(c);
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
  return function (control) {
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
  return function (control) {
    const observables = executeValidators(control, presentValidators).map(toObservable);
    return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.forkJoin)(observables).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_8__.map)(mergeErrors));
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
  const validatorsToAdd = makeValidatorsArray(validators);
  validatorsToAdd.forEach(v => {
    // Note: if there are duplicate entries in the new validators array,
    // only the first one would be added to the current list of validators.
    // Duplicate ones would be ignored since `hasValidator` would detect
    // the presence of a validator function and we update the current list in place.
    if (!hasValidator(current, v)) {
      current.push(v);
    }
  });
  return current;
}
function removeValidators(validators, currentValidators) {
  return makeValidatorsArray(currentValidators).filter(v => !hasValidator(validators, v));
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
const VALID = 'VALID';
/**
 * Reports that a control is invalid, meaning that an error exists in the input value.
 *
 * @see {@link status}
 */
const INVALID = 'INVALID';
/**
 * Reports that a control is pending, meaning that async validation is occurring and
 * errors are not yet available for the input value.
 *
 * @see {@link markAsPending}
 * @see {@link status}
 */
const PENDING = 'PENDING';
/**
 * Reports that a control is disabled, meaning that the control is exempt from ancestor
 * calculations of validity or value.
 *
 * @see {@link markAsDisabled}
 * @see {@link status}
 */
const DISABLED = 'DISABLED';
/**
 * Base class for every event sent by `AbstractControl.events()`
 *
 * @publicApi
 */
class ControlEvent {}
/**
 * Event fired when the value of a control changes.
 *
 * @see {@link AbstractControl.events}
 *
 * @publicApi
 */
class ValueChangeEvent extends ControlEvent {
  value;
  source;
  constructor(value, source) {
    super();
    this.value = value;
    this.source = source;
  }
}
/**
 * Event fired when the control's pristine state changes (pristine <=> dirty).
 *
 * @see {@link AbstractControl.events}
 *
 * @publicApi */
class PristineChangeEvent extends ControlEvent {
  pristine;
  source;
  constructor(pristine, source) {
    super();
    this.pristine = pristine;
    this.source = source;
  }
}
/**
 * Event fired when the control's touched status changes (touched <=> untouched).
 *
 * @see {@link AbstractControl.events}
 *
 * @publicApi
 */
class TouchedChangeEvent extends ControlEvent {
  touched;
  source;
  constructor(touched, source) {
    super();
    this.touched = touched;
    this.source = source;
  }
}
/**
 * Event fired when the control's status changes.
 *
 * @see {@link AbstractControl.events}
 *
 * @publicApi
 */
class StatusChangeEvent extends ControlEvent {
  status;
  source;
  constructor(status, source) {
    super();
    this.status = status;
    this.source = source;
  }
}
/**
 * Event fired when a form is submitted
 *
 * @see {@link AbstractControl.events}
 *
 * @publicApi
 */
class FormSubmittedEvent extends ControlEvent {
  source;
  constructor(source) {
    super();
    this.source = source;
  }
}
/**
 * Event fired when a form is reset.
 *
 * @see {@link AbstractControl.events}
 *
 * @publicApi
 */
class FormResetEvent extends ControlEvent {
  source;
  constructor(source) {
    super();
    this.source = source;
  }
}
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
  if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
    if (isOptionsObj(validatorOrOpts) && asyncValidator) {
      console.warn(asyncValidatorsDroppedWithOptsWarning);
    }
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
  return validatorOrOpts != null && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === 'object';
}
function assertControlPresent(parent, isGroup, key) {
  const controls = parent.controls;
  const collection = isGroup ? Object.keys(controls) : controls;
  if (!collection.length) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1000 /* RuntimeErrorCode.NO_CONTROLS */, typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode ? noControlsError(isGroup) : '');
  }
  if (!hasOwnControl(controls, key)) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1001 /* RuntimeErrorCode.MISSING_CONTROL */, typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode ? missingControlError(isGroup, key) : '');
  }
}
function assertAllValuesPresent(control, isGroup, value) {
  control._forEachChild((_, key) => {
    if (value[key] === undefined) {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(-1002 /* RuntimeErrorCode.MISSING_CONTROL_VALUE */, typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode ? missingControlValueError(isGroup, key) : '');
    }
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
class AbstractControl {
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
  _hasRequired = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(false, /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "_hasRequired"
  }] : /* istanbul ignore next */[]));
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
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(this.statusReactive);
  }
  set status(v) {
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => this.statusReactive.set(v));
  }
  /** @internal */
  _status = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.statusReactive(), /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "_status"
  }] : /* istanbul ignore next */[]));
  statusReactive = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(undefined, /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "statusReactive"
  }] : /* istanbul ignore next */[]));
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
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(this.pristineReactive);
  }
  set pristine(v) {
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => this.pristineReactive.set(v));
  }
  /** @internal */
  _pristine = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.pristineReactive(), /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "_pristine"
  }] : /* istanbul ignore next */[]));
  pristineReactive = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(true, /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "pristineReactive"
  }] : /* istanbul ignore next */[]));
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
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(this.touchedReactive);
  }
  set touched(v) {
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => this.touchedReactive.set(v));
  }
  /** @internal */
  _touched = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.touchedReactive(), /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "_touched"
  }] : /* istanbul ignore next */[]));
  touchedReactive = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(false, /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "touchedReactive"
  }] : /* istanbul ignore next */[]));
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
  _events = new rxjs__WEBPACK_IMPORTED_MODULE_4__.Subject();
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
    return this._updateOn ? this._updateOn : this.parent ? this.parent.updateOn : 'change';
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
    if (!opts.onlySelf) {
      this._parent?.markAsTouched({
        ...opts,
        sourceControl
      });
    }
    if (changed && opts.emitEvent !== false) {
      this._events.next(new TouchedChangeEvent(true, sourceControl));
    }
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
    this._forEachChild(control => control.markAllAsDirty(opts));
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
    this._forEachChild(control => control.markAllAsTouched(opts));
  }
  markAsUntouched(opts = {}) {
    const changed = this.touched === true;
    this.touched = false;
    this._pendingTouched = false;
    const sourceControl = opts.sourceControl ?? this;
    this._forEachChild(control => {
      control.markAsUntouched({
        onlySelf: true,
        emitEvent: opts.emitEvent,
        sourceControl
      });
    });
    if (!opts.onlySelf) {
      this._parent?._updateTouched(opts, sourceControl);
    }
    if (changed && opts.emitEvent !== false) {
      this._events.next(new TouchedChangeEvent(false, sourceControl));
    }
  }
  markAsDirty(opts = {}) {
    const changed = this.pristine === true;
    this.pristine = false;
    const sourceControl = opts.sourceControl ?? this;
    if (!opts.onlySelf) {
      this._parent?.markAsDirty({
        ...opts,
        sourceControl
      });
    }
    if (changed && opts.emitEvent !== false) {
      this._events.next(new PristineChangeEvent(false, sourceControl));
    }
  }
  markAsPristine(opts = {}) {
    const changed = this.pristine === false;
    this.pristine = true;
    this._pendingDirty = false;
    const sourceControl = opts.sourceControl ?? this;
    this._forEachChild(control => {
      /** We don't propagate the source control downwards */
      control.markAsPristine({
        onlySelf: true,
        emitEvent: opts.emitEvent
      });
    });
    if (!opts.onlySelf) {
      this._parent?._updatePristine(opts, sourceControl);
    }
    if (changed && opts.emitEvent !== false) {
      this._events.next(new PristineChangeEvent(true, sourceControl));
    }
  }
  markAsPending(opts = {}) {
    this.status = PENDING;
    const sourceControl = opts.sourceControl ?? this;
    if (opts.emitEvent !== false) {
      this._events.next(new StatusChangeEvent(this.status, sourceControl));
      this.statusChanges.emit(this.status);
    }
    if (!opts.onlySelf) {
      this._parent?.markAsPending({
        ...opts,
        sourceControl
      });
    }
  }
  disable(opts = {}) {
    // If parent has been marked artificially dirty we don't want to re-calculate the
    // parent's dirtiness based on the children.
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
    this.status = DISABLED;
    this.errors = null;
    this._forEachChild(control => {
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
    this._onDisabledChange.forEach(changeFn => changeFn(true));
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
    // If parent has been marked artificially dirty we don't want to re-calculate the
    // parent's dirtiness based on the children.
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
    this.status = VALID;
    this._forEachChild(control => {
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
    this._onDisabledChange.forEach(changeFn => changeFn(false));
  }
  _updateAncestors(opts, sourceControl) {
    if (!opts.onlySelf) {
      this._parent?.updateValueAndValidity(opts);
      if (!opts.skipPristineCheck) {
        this._parent?._updatePristine({}, sourceControl);
      }
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
      if (this.status === VALID || this.status === PENDING) {
        // If the canceled subscription should have emitted
        // we make sure the async validator emits the status change on completion
        this._runAsyncValidator(shouldHaveEmitted, opts.emitEvent);
      }
    }
    const sourceControl = opts.sourceControl ?? this;
    if (opts.emitEvent !== false) {
      this._events.next(new ValueChangeEvent(this.value, sourceControl));
      this._events.next(new StatusChangeEvent(this.status, sourceControl));
      this.valueChanges.emit(this.value);
      this.statusChanges.emit(this.status);
    }
    if (!opts.onlySelf) {
      this._parent?.updateValueAndValidity({
        ...opts,
        sourceControl
      });
    }
  }
  /** @internal */
  _updateTreeValidity(opts = {
    emitEvent: true
  }) {
    this._forEachChild(ctrl => ctrl._updateTreeValidity(opts));
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
      this._asyncValidationSubscription = obs.subscribe(errors => {
        this._hasOwnPendingAsyncValidator = null;
        // This will trigger the recalculation of the validation status, which depends on
        // the state of the asynchronous validation (whether it is in progress or not). So, it is
        // necessary that we have updated the `_hasOwnPendingAsyncValidator` boolean flag first.
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
      // we're cancelling the validator subscription, we keep if it should have emitted
      // because we want to emit eventually if it was required at least once.
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
    if (!Array.isArray(currPath)) currPath = currPath.split('.');
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
    while (x._parent) {
      x = x._parent;
    }
    return x;
  }
  /** @internal */
  _updateControlsErrors(emitEvent, changedControl, shouldHaveEmitted) {
    this.status = this._calculateStatus();
    if (emitEvent) {
      this.statusChanges.emit(this.status);
    }
    // The Events Observable expose a slight different bevahior than the statusChanges obs
    // An async validator will still emit a StatusChangeEvent is a previously cancelled
    // async validator has emitEvent set to true
    if (emitEvent || shouldHaveEmitted) {
      this._events.next(new StatusChangeEvent(this.status, changedControl));
    }
    if (this._parent) {
      this._parent._updateControlsErrors(emitEvent, changedControl, shouldHaveEmitted);
    }
  }
  /** @internal */
  _initObservables() {
    // TODO: this should be piped from events() but is breaking in G3
    this.valueChanges = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
    this.statusChanges = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
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
    return this._anyControls(control => control.status === status);
  }
  /** @internal */
  _anyControlsDirty() {
    return this._anyControls(control => control.dirty);
  }
  /** @internal */
  _anyControlsTouched() {
    return this._anyControls(control => control.touched);
  }
  /** @internal */
  _updatePristine(opts, changedControl) {
    const newPristine = !this._anyControlsDirty();
    const changed = this.pristine !== newPristine;
    this.pristine = newPristine;
    if (!opts.onlySelf) {
      this._parent?._updatePristine(opts, changedControl);
    }
    if (changed) {
      this._events.next(new PristineChangeEvent(this.pristine, changedControl));
    }
  }
  /** @internal */
  _updateTouched(opts = {}, changedControl) {
    this.touched = this._anyControlsTouched();
    this._events.next(new TouchedChangeEvent(this.touched, changedControl));
    if (!opts.onlySelf) {
      this._parent?._updateTouched(opts, changedControl);
    }
  }
  /** @internal */
  _onDisabledChange = [];
  /** @internal */
  _registerOnCollectionChange(fn) {
    this._onCollectionChange = fn;
  }
  /** @internal */
  _setUpdateStrategy(opts) {
    if (isOptionsObj(opts) && opts.updateOn != null) {
      this._updateOn = opts.updateOn;
    }
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
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => this._hasRequired.set(this.hasValidator(Validators.required)));
  }
}
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
class AbstractControlDirective {
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
  /*
   * The set of callbacks to be invoked when directive instance is being destroyed.
   */
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
    this._onDestroyCallbacks.forEach(fn => fn());
    this._onDestroyCallbacks = [];
  }
  /**
   * @description
   * Resets the control with the provided value if the control is present.
   */
  reset(value = undefined) {
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
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
function isNativeFormElement(element) {
  return element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA';
}
function elementAcceptsMinMax(element) {
  if (element.tagName !== 'INPUT') {
    return false;
  }
  const type = element.type;
  return type === 'number' || type === 'range' || type === 'date' || type === 'month';
}
function isTextualFormElement(element) {
  return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
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
    case 'name':
      renderer.setAttribute(element, name, value);
      break;
    case 'disabled':
    case 'readonly':
    case 'required':
      if (value) {
        renderer.setAttribute(element, name, '');
      } else {
        renderer.removeAttribute(element, name);
      }
      break;
    case 'max':
    case 'min':
    case 'minLength':
    case 'maxLength':
      if (value !== undefined) {
        renderer.setAttribute(element, name, value.toString());
      } else {
        renderer.removeAttribute(element, name);
      }
      break;
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
class ReactiveValidationError {
  kind;
  context;
  control;
  message;
  constructor({
    kind,
    context,
    control
  }) {
    this.kind = kind;
    this.context = context;
    this.control = control;
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
 * Method that updates string to integer if not already a number
 *
 * @param value The value to convert to integer.
 * @returns value of parameter converted to number or integer.
 */
function toInteger(value) {
  return typeof value === 'number' ? value : parseInt(value, 10);
}
/**
 * Method that ensures that provided value is a float (and converts it to float if needed).
 *
 * @param value The value to convert to float.
 * @returns value of parameter converted to number or float.
 */
function toFloat(value) {
  return typeof value === 'number' ? value : parseFloat(value);
}
/**
 * A base class for Validator-based Directives. The class contains common logic shared across such
 * Directives.
 *
 * For internal use only, this class is not intended for use outside of the Forms package.
 */
class AbstractValidatorDirective {
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
    return input != null /* both `null` and `undefined` */;
  }
  static ɵfac = function AbstractValidatorDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AbstractValidatorDirective)();
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: AbstractValidatorDirective,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵNgOnChangesFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(AbstractValidatorDirective, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive
  }], null, null);
})();
/**
 * @description
 * Provider which adds `MaxValidator` to the `NG_VALIDATORS` multi-provider list.
 */
const MAX_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => MaxValidator),
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
class MaxValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the max bound to this directive.
   */
  max;
  /** @internal */
  inputName = 'max';
  /** @internal */
  normalizeInput = input => toFloat(input);
  /** @internal */
  createValidator = max => maxValidator(max);
  static ɵfac = /*@__PURE__*/(() => {
    let ɵMaxValidator_BaseFactory;
    return function MaxValidator_Factory(__ngFactoryType__) {
      return (ɵMaxValidator_BaseFactory || (ɵMaxValidator_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](MaxValidator)))(__ngFactoryType__ || MaxValidator);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: MaxValidator,
    selectors: [["input", "type", "number", "max", "", "formControlName", ""], ["input", "type", "number", "max", "", "formControl", ""], ["input", "type", "number", "max", "", "ngModel", ""]],
    hostVars: 1,
    hostBindings: function MaxValidator_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵattribute"]("max", ctx._enabled ? ctx.max : null);
      }
    },
    inputs: {
      max: "max"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([MAX_VALIDATOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(MaxValidator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]',
      providers: [MAX_VALIDATOR],
      host: {
        '[attr.max]': '_enabled ? max : null'
      },
      standalone: false
    }]
  }], null, {
    max: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }]
  });
})();
/**
 * @description
 * Provider which adds `MinValidator` to the `NG_VALIDATORS` multi-provider list.
 */
const MIN_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => MinValidator),
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
class MinValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the min bound to this directive.
   */
  min;
  /** @internal */
  inputName = 'min';
  /** @internal */
  normalizeInput = input => toFloat(input);
  /** @internal */
  createValidator = min => minValidator(min);
  static ɵfac = /*@__PURE__*/(() => {
    let ɵMinValidator_BaseFactory;
    return function MinValidator_Factory(__ngFactoryType__) {
      return (ɵMinValidator_BaseFactory || (ɵMinValidator_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](MinValidator)))(__ngFactoryType__ || MinValidator);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: MinValidator,
    selectors: [["input", "type", "number", "min", "", "formControlName", ""], ["input", "type", "number", "min", "", "formControl", ""], ["input", "type", "number", "min", "", "ngModel", ""]],
    hostVars: 1,
    hostBindings: function MinValidator_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵattribute"]("min", ctx._enabled ? ctx.min : null);
      }
    },
    inputs: {
      min: "min"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([MIN_VALIDATOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(MinValidator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]',
      providers: [MIN_VALIDATOR],
      host: {
        '[attr.min]': '_enabled ? min : null'
      },
      standalone: false
    }]
  }], null, {
    min: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }]
  });
})();
/**
 * @description
 * Provider which adds `RequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
const REQUIRED_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => RequiredValidator),
  multi: true
};
/**
 * @description
 * Provider which adds `CheckboxRequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
const CHECKBOX_REQUIRED_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => CheckboxRequiredValidator),
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
class RequiredValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the required attribute bound to this directive.
   */
  required;
  /** @internal */
  inputName = 'required';
  /** @internal */
  normalizeInput = _angular_core__WEBPACK_IMPORTED_MODULE_0__.booleanAttribute;
  /** @internal */
  createValidator = input => requiredValidator;
  /** @docs-private */
  enabled(input) {
    return input;
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵRequiredValidator_BaseFactory;
    return function RequiredValidator_Factory(__ngFactoryType__) {
      return (ɵRequiredValidator_BaseFactory || (ɵRequiredValidator_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](RequiredValidator)))(__ngFactoryType__ || RequiredValidator);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: RequiredValidator,
    selectors: [["", "required", "", "formControlName", "", 3, "type", "checkbox"], ["", "required", "", "formControl", "", 3, "type", "checkbox"], ["", "required", "", "ngModel", "", 3, "type", "checkbox"]],
    hostVars: 1,
    hostBindings: function RequiredValidator_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵattribute"]("required", ctx._enabled ? "" : null);
      }
    },
    inputs: {
      required: "required"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([REQUIRED_VALIDATOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(RequiredValidator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: ':not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]',
      providers: [REQUIRED_VALIDATOR],
      host: {
        '[attr.required]': '_enabled ? "" : null'
      },
      standalone: false
    }]
  }], null, {
    required: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }]
  });
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
class CheckboxRequiredValidator extends RequiredValidator {
  /** @internal */
  createValidator = input => requiredTrueValidator;
  static ɵfac = /*@__PURE__*/(() => {
    let ɵCheckboxRequiredValidator_BaseFactory;
    return function CheckboxRequiredValidator_Factory(__ngFactoryType__) {
      return (ɵCheckboxRequiredValidator_BaseFactory || (ɵCheckboxRequiredValidator_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](CheckboxRequiredValidator)))(__ngFactoryType__ || CheckboxRequiredValidator);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: CheckboxRequiredValidator,
    selectors: [["input", "type", "checkbox", "required", "", "formControlName", ""], ["input", "type", "checkbox", "required", "", "formControl", ""], ["input", "type", "checkbox", "required", "", "ngModel", ""]],
    hostVars: 1,
    hostBindings: function CheckboxRequiredValidator_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵattribute"]("required", ctx._enabled ? "" : null);
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([CHECKBOX_REQUIRED_VALIDATOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(CheckboxRequiredValidator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]',
      providers: [CHECKBOX_REQUIRED_VALIDATOR],
      host: {
        '[attr.required]': '_enabled ? "" : null'
      },
      standalone: false
    }]
  }], null, null);
})();
/**
 * @description
 * Provider which adds `EmailValidator` to the `NG_VALIDATORS` multi-provider list.
 */
const EMAIL_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => EmailValidator),
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
class EmailValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the email attribute bound to this directive.
   */
  email;
  /** @internal */
  inputName = 'email';
  /** @internal */
  normalizeInput = _angular_core__WEBPACK_IMPORTED_MODULE_0__.booleanAttribute;
  /** @internal */
  createValidator = input => emailValidator;
  /** @docs-private */
  enabled(input) {
    return input;
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵEmailValidator_BaseFactory;
    return function EmailValidator_Factory(__ngFactoryType__) {
      return (ɵEmailValidator_BaseFactory || (ɵEmailValidator_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](EmailValidator)))(__ngFactoryType__ || EmailValidator);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: EmailValidator,
    selectors: [["", "email", "", "formControlName", ""], ["", "email", "", "formControl", ""], ["", "email", "", "ngModel", ""]],
    inputs: {
      email: "email"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([EMAIL_VALIDATOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(EmailValidator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[email][formControlName],[email][formControl],[email][ngModel]',
      providers: [EMAIL_VALIDATOR],
      standalone: false
    }]
  }], null, {
    email: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }]
  });
})();
/**
 * @description
 * Provider which adds `MinLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
const MIN_LENGTH_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => MinLengthValidator),
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
class MinLengthValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the minimum length bound to this directive.
   */
  minlength;
  /** @internal */
  inputName = 'minlength';
  /** @internal */
  normalizeInput = input => toInteger(input);
  /** @internal */
  createValidator = minlength => minLengthValidator(minlength);
  static ɵfac = /*@__PURE__*/(() => {
    let ɵMinLengthValidator_BaseFactory;
    return function MinLengthValidator_Factory(__ngFactoryType__) {
      return (ɵMinLengthValidator_BaseFactory || (ɵMinLengthValidator_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](MinLengthValidator)))(__ngFactoryType__ || MinLengthValidator);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: MinLengthValidator,
    selectors: [["", "minlength", "", "formControlName", ""], ["", "minlength", "", "formControl", ""], ["", "minlength", "", "ngModel", ""]],
    hostVars: 1,
    hostBindings: function MinLengthValidator_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵattribute"]("minlength", ctx._enabled ? ctx.minlength : null);
      }
    },
    inputs: {
      minlength: "minlength"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([MIN_LENGTH_VALIDATOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(MinLengthValidator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[minlength][formControlName],[minlength][formControl],[minlength][ngModel]',
      providers: [MIN_LENGTH_VALIDATOR],
      host: {
        '[attr.minlength]': '_enabled ? minlength : null'
      },
      standalone: false
    }]
  }], null, {
    minlength: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }]
  });
})();
/**
 * @description
 * Provider which adds `MaxLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
const MAX_LENGTH_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => MaxLengthValidator),
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
class MaxLengthValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the maximum length bound to this directive.
   */
  maxlength;
  /** @internal */
  inputName = 'maxlength';
  /** @internal */
  normalizeInput = input => toInteger(input);
  /** @internal */
  createValidator = maxlength => maxLengthValidator(maxlength);
  static ɵfac = /*@__PURE__*/(() => {
    let ɵMaxLengthValidator_BaseFactory;
    return function MaxLengthValidator_Factory(__ngFactoryType__) {
      return (ɵMaxLengthValidator_BaseFactory || (ɵMaxLengthValidator_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](MaxLengthValidator)))(__ngFactoryType__ || MaxLengthValidator);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: MaxLengthValidator,
    selectors: [["", "maxlength", "", "formControlName", ""], ["", "maxlength", "", "formControl", ""], ["", "maxlength", "", "ngModel", ""]],
    hostVars: 1,
    hostBindings: function MaxLengthValidator_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵattribute"]("maxlength", ctx._enabled ? ctx.maxlength : null);
      }
    },
    inputs: {
      maxlength: "maxlength"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([MAX_LENGTH_VALIDATOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(MaxLengthValidator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]',
      providers: [MAX_LENGTH_VALIDATOR],
      host: {
        '[attr.maxlength]': '_enabled ? maxlength : null'
      },
      standalone: false
    }]
  }], null, {
    maxlength: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }]
  });
})();
/**
 * @description
 * Provider which adds `PatternValidator` to the `NG_VALIDATORS` multi-provider list.
 */
const PATTERN_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => PatternValidator),
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
class PatternValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the pattern bound to this directive.
   */
  pattern; // This input is always defined, since the name matches selector.
  /** @internal */
  inputName = 'pattern';
  /** @internal */
  normalizeInput = input => input;
  /** @internal */
  createValidator = input => patternValidator(input);
  static ɵfac = /*@__PURE__*/(() => {
    let ɵPatternValidator_BaseFactory;
    return function PatternValidator_Factory(__ngFactoryType__) {
      return (ɵPatternValidator_BaseFactory || (ɵPatternValidator_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](PatternValidator)))(__ngFactoryType__ || PatternValidator);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: PatternValidator,
    selectors: [["", "pattern", "", "formControlName", ""], ["", "pattern", "", "formControl", ""], ["", "pattern", "", "ngModel", ""]],
    hostVars: 1,
    hostBindings: function PatternValidator_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵattribute"]("pattern", ctx._enabled ? ctx.pattern : null);
      }
    },
    inputs: {
      pattern: "pattern"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([PATTERN_VALIDATOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(PatternValidator, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[pattern][formControlName],[pattern][formControl],[pattern][ngModel]',
      providers: [PATTERN_VALIDATOR],
      host: {
        '[attr.pattern]': '_enabled ? pattern : null'
      },
      standalone: false
    }]
  }], null, {
    pattern: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
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
/**
 * DI token that provides the ɵFormControlIntegration context for FVC/UI controls.
 */
const ɵFORM_CONTROL_INTEGRATION = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'FORM_CONTROL_INTEGRATION' : '');
/**
 * Token to provide to allow SetDisabledState to always be called when a CVA is added, regardless of
 * whether the control is disabled or enabled.
 *
 * @see {@link FormsModule#withConfig}
 */
const CALL_SET_DISABLED_STATE = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode ? 'CallSetDisabledState' : '', {
  factory: () => setDisabledStateDefault
});
/**
 * Whether to use the fixed setDisabledState behavior by default.
 */
// g3-only export const setDisabledStateDefault: SetDisabledStateOption = 'whenDisabledForLegacyCode';
const setDisabledStateDefault = 'always'; // 3p-only
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
  if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
    if (!control) _throwError(dir, 'Cannot find control with');
    if (!dir.valueAccessor) _throwMissingValueAccessorError(dir);
  }
  setUpValidators(control, dir);
  dir.valueAccessor.writeValue(control.value);
  // The legacy behavior only calls the CVA's `setDisabledState` if the control is disabled.
  // If the `callSetDisabledState` option is set to `always`, then this bug is fixed and
  // the method is always called.
  if (control.disabled || callSetDisabledState === 'always') {
    dir.valueAccessor.setDisabledState?.(control.disabled);
  }
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
    if (validateControlPresenceOnChange && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) {
      _noControlError(dir);
    }
  };
  // The `valueAccessor` field is typically defined on FromControl and FormControlName directive
  // instances and there is a logic in `selectValueAccessor` function that throws if it's not the
  // case. We still check the presence of `valueAccessor` before invoking its methods to make sure
  // that cleanup works correctly if app code or tests are setup to ignore the error thrown from
  // `selectValueAccessor`. See https://github.com/angular/angular/issues/40521.
  dir?.valueAccessor?.registerOnChange(noop);
  dir?.valueAccessor?.registerOnTouched(noop);
  cleanUpValidators(control, dir);
  if (control) {
    dir._invokeOnDestroyCallbacks();
    control._registerOnCollectionChange(() => {});
  }
}
function registerOnValidatorChange(validators, onChange) {
  validators.forEach(validator => {
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
    const onDisabledChange = isDisabled => {
      dir.valueAccessor.setDisabledState(isDisabled);
    };
    control.registerOnDisabledChange(onDisabledChange);
    // Register a callback function to cleanup disabled change handler
    // from a control instance when a directive is destroyed.
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
  if (dir.validator !== null) {
    control.setValidators(mergeValidators(validators, dir.validator));
  } else if (typeof validators === 'function') {
    // If sync validators are represented by a single validator function, we force the
    // `Validators.compose` call to happen by executing the `setValidators` function with
    // an array that contains that function. We need this to avoid possible discrepancies in
    // validators behavior, so sync validators are always processed by the `Validators.compose`.
    // Note: we should consider moving this logic inside the `setValidators` function itself, so we
    // have consistent behavior on AbstractControl API level. The same applies to the async
    // validators logic below.
    control.setValidators([validators]);
  }
  const asyncValidators = getControlAsyncValidators(control);
  if (dir.asyncValidator !== null) {
    control.setAsyncValidators(mergeValidators(asyncValidators, dir.asyncValidator));
  } else if (typeof asyncValidators === 'function') {
    control.setAsyncValidators([asyncValidators]);
  }
  // Re-run validation when validator binding changes, e.g. minlength=3 -> minlength=4
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
        // Filter out directive validator function.
        const updatedValidators = validators.filter(validator => validator !== dir.validator);
        if (updatedValidators.length !== validators.length) {
          isControlUpdated = true;
          control.setValidators(updatedValidators);
        }
      }
    }
    if (dir.asyncValidator !== null) {
      const asyncValidators = getControlAsyncValidators(control);
      if (Array.isArray(asyncValidators) && asyncValidators.length > 0) {
        // Filter out directive async validator function.
        const updatedAsyncValidators = asyncValidators.filter(asyncValidator => asyncValidator !== dir.asyncValidator);
        if (updatedAsyncValidators.length !== asyncValidators.length) {
          isControlUpdated = true;
          control.setAsyncValidators(updatedAsyncValidators);
        }
      }
    }
  }
  // Clear onValidatorChange callbacks by providing a noop function.
  const noop = () => {};
  registerOnValidatorChange(dir._rawValidators, noop);
  registerOnValidatorChange(dir._rawAsyncValidators, noop);
  return isControlUpdated;
}
function setUpViewChangePipeline(control, dir) {
  dir.valueAccessor.registerOnChange(newValue => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;
    if (control.updateOn === 'change') updateControl(control, dir);
  });
}
function setUpBlurPipeline(control, dir) {
  dir.valueAccessor.registerOnTouched(() => {
    control._pendingTouched = true;
    if (control.updateOn === 'blur' && control._pendingChange) updateControl(control, dir);
    if (control.updateOn !== 'submit') control.markAsTouched();
  });
}
function updateControl(control, dir) {
  if (control._pendingDirty) control.markAsDirty();
  control.setValue(control._pendingValue, {
    emitModelToViewChange: false
  });
  dir.viewToModelUpdate(control._pendingValue);
  control._pendingChange = false;
}
function setUpModelChangePipeline(control, dir) {
  const onChange = (newValue, emitModelEvent) => {
    // control -> view
    dir.valueAccessor.writeValue(newValue);
    // control -> ngModel
    if (emitModelEvent) dir.viewToModelUpdate(newValue);
  };
  control.registerOnChange(onChange);
  // Register a callback function to cleanup onChange handler
  // from a control instance when a directive is destroyed.
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
  if (control == null && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) _throwError(dir, 'Cannot find control with');
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
  return _throwError(dir, 'There is no FormControl instance attached to form control element with');
}
function _throwError(dir, message) {
  const messageEnd = _describeControlLocation(dir);
  throw new Error(`${message} ${messageEnd}`);
}
function _describeControlLocation(dir) {
  const path = dir.path;
  if (path && path.length > 1) return `path: '${path.join(' -> ')}'`;
  if (path?.[0]) return `name: '${path}'`;
  return 'unspecified name attribute';
}
function _throwMissingValueAccessorError(dir) {
  const loc = _describeControlLocation(dir);
  throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(-1203 /* RuntimeErrorCode.NG_MISSING_VALUE_ACCESSOR */, `No value accessor for form control ${loc}.`);
}
function _throwInvalidValueAccessorError(dir) {
  const loc = _describeControlLocation(dir);
  throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1200 /* RuntimeErrorCode.NG_VALUE_ACCESSOR_NOT_PROVIDED */, `Value accessor was not provided as an array for form control with ${loc}. ` + `Check that the \`NG_VALUE_ACCESSOR\` token is configured as a \`multi: true\` provider.`);
}
function isPropertyUpdated(changes, viewModel) {
  if (!Object.hasOwn(changes, 'model')) return false;
  const change = changes['model'];
  if (change.isFirstChange()) return true;
  return !Object.is(viewModel, change.currentValue);
}
function isBuiltInAccessor(valueAccessor) {
  // Check if a given value accessor is an instance of a class that directly extends
  // `BuiltInControlValueAccessor` one.
  return Object.getPrototypeOf(valueAccessor.constructor) === BuiltInControlValueAccessor;
}
function syncPendingControls(form, directives) {
  form._syncPendingControls();
  directives.forEach(dir => {
    const control = dir.control;
    if (control.updateOn === 'submit' && control._pendingChange) {
      dir.viewToModelUpdate(control._pendingValue);
      control._pendingChange = false;
    }
  });
}
// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
function selectValueAccessor(dir, valueAccessors) {
  if (!valueAccessors) return null;
  if (!Array.isArray(valueAccessors) && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) _throwInvalidValueAccessorError(dir);
  let defaultAccessor = undefined;
  let builtinAccessor = undefined;
  let customAccessor = undefined;
  valueAccessors.forEach(v => {
    if (v.constructor === DefaultValueAccessor) {
      defaultAccessor = v;
    } else if (isBuiltInAccessor(v)) {
      if (builtinAccessor && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) _throwError(dir, 'More than one built-in value accessor matches form control with');
      builtinAccessor = v;
    } else {
      if (customAccessor && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) _throwError(dir, 'More than one custom value accessor matches form control with');
      customAccessor = v;
    }
  });
  if (customAccessor) return customAccessor;
  if (builtinAccessor) return builtinAccessor;
  if (defaultAccessor) return defaultAccessor;
  if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
    _throwError(dir, 'No valid value accessor for form control with');
  }
  return null;
}
function removeListItem$1(list, el) {
  const index = list.indexOf(el);
  if (index > -1) list.splice(index, 1);
}
// TODO(kara): remove after deprecation period
function _ngModelWarning(name, type, instance, warningConfig) {
  if (warningConfig === 'never') return;
  if ((warningConfig === null || warningConfig === 'once') && !type._ngModelWarningSentOnce || warningConfig === 'always' && !instance._ngModelWarningSent) {
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
const NG_CONTROL_INTEGRATION_PROVIDER = {
  provide: ɵFORM_CONTROL_INTEGRATION,
  useFactory: () => {
    const control = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(NgControl, {
      self: true
    });
    return {
      setParseErrors: source => {
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
class NgControl extends AbstractControlDirective {
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
    this.resetSubscription = undefined;
    if (this.control) {
      this.resetSubscription = this.control.events.subscribe(event => {
        if (event instanceof FormResetEvent && this.control) {
          this.userOnReset?.(this.control.value);
        }
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
    this.injector?.get(_angular_core__WEBPACK_IMPORTED_MODULE_1__.DestroyRef)?.onDestroy(() => {
      this.removeParseErrorsValidator(this.control);
      this.subscription?.unsubscribe();
    });
  }
  setupCustomControl() {
    this.subscription?.unsubscribe();
    const cdr = this.injector?.get(_angular_core__WEBPACK_IMPORTED_MODULE_0__.ChangeDetectorRef);
    if (!this.control || !cdr) {
      return;
    }
    const markForCheck = cdr.markForCheck.bind(cdr);
    this.subscription = new rxjs__WEBPACK_IMPORTED_MODULE_5__.Subscription();
    this.subscription.add(this.control.valueChanges.subscribe(markForCheck));
    this.subscription.add(this.control.statusChanges.subscribe(markForCheck));
    this.resetSubscription?.unsubscribe();
    this.resetSubscription = undefined;
    if (this.userOnReset) {
      this.resetSubscription = this.control.events.subscribe(event => {
        if (event instanceof FormResetEvent && this.control) {
          this.userOnReset?.(this.control.value);
        }
      });
      this.subscription.add(this.resetSubscription);
    }
    // Add parseErrors validator if present
    if (this.parseErrorsValidator) {
      this.control.addValidators(this.parseErrorsValidator);
    }
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
    const hasNgNoCva = host.nativeElement.hasAttribute?.('ngNoCva');
    const hasCva = !hasNgNoCva && (this.rawValueAccessors && this.rawValueAccessors.length > 0 || this.valueAccessor !== null);
    if (hasCva || !host.customControl) {
      // This control is using the CVA pattern, so ngControlCreate is a noop.
      return;
    }
    this.isCustomControlBased = true;
    // Listen to custom control value changes -> update FormControl
    // Note: We access this.control dynamically because it may not be set yet
    // (e.g., FormControlDirective's form input hasn't been bound)
    host.listenToCustomControlModel(value => {
      // TODO: is there a case where this input has not yet been set?
      this.control?.markAsDirty();
      this.control?.setValue(value, {
        emitModelToViewChange: false
      });
      this.viewToModelUpdate(value);
    });
    // Listen to touched changes from FVC
    host.listenToCustomControlOutput('touch', () => {
      this.control?.markAsTouched();
    });
    this.customControlBindings = {};
    this.isNativeFormElement = isNativeFormElement(host.nativeElement);
    this.requiredValidatorViaDi = this._rawValidators.find(v => v instanceof RequiredValidator);
  }
  ngControlUpdate(host, bindRequired) {
    if (!this.isCustomControlBased) {
      return;
    }
    const control = this.control;
    const bindings = this.customControlBindings;
    // Bind FormControl value -> FVC
    if (!Object.is(bindings.value, control.value)) {
      bindings.value = control.value;
      host.setCustomControlModelInput(control.value);
    }
    // Bind all status properties
    this.bindControlProperty(host, bindings, 'touched', control.touched);
    this.bindControlProperty(host, bindings, 'dirty', control.dirty);
    this.bindControlProperty(host, bindings, 'valid', control.valid);
    this.bindControlProperty(host, bindings, 'invalid', control.invalid);
    this.bindControlProperty(host, bindings, 'pending', control.pending);
    this.bindControlProperty(host, bindings, 'disabled', control.disabled);
    // Binding to `required` may be handled by the host element itself.
    if (this.shouldBindRequired) {
      this.bindControlProperty(host, bindings, 'required', this.isRequired);
    }
    // Bind errors - convert Reactive Form errors to Signal Form format
    const errorObject = control.errors;
    if (bindings.errors !== errorObject) {
      bindings.errors = errorObject;
      const errorArray = this._convertErrors(errorObject);
      host.setInputOnDirectives('errors', errorArray);
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
    if (bindings[name] === value) {
      return;
    }
    bindings[name] = value;
    // Try setting on the custom control first.
    const wasSet = host.setInputOnDirectives(name, value);
    // Fall back to native DOM property for 'disabled' and 'required'
    if (this.isNativeFormElement && !wasSet && (name === 'disabled' || name === 'required') && this.renderer) {
      setNativeDomProperty(this.renderer, host.nativeElement, name, value);
    }
  }
  /**
   * Converts Reactive Forms errors to Signal Forms error format.
   */
  _convertErrors(errors) {
    if (errors === null) {
      return [];
    }
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
    if (parseErrors === undefined) {
      return;
    }
    let convertedErrors = null;
    const convertedParseErrors = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => {
      const rawErrors = parseErrors();
      if (rawErrors.length === 0) {
        return null;
      }
      return rawErrors.reduce((acc, err) => {
        acc[err.kind] = err;
        return acc;
      }, {});
    }, /* @ts-ignore */
    ...(wx.__global.ngDevMode ? [{
      debugName: "convertedParseErrors"
    }] : /* istanbul ignore next */[]));
    // Create validator that returns current parse errors
    this.parseErrorsValidator = (() => convertedErrors).bind(this);
    // Setup effect to watch parseErrors and trigger revalidation
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.effect)(() => {
      convertedErrors = convertedParseErrors();
      this.control?.updateValueAndValidity({
        emitEvent: false
      });
    }, {
      injector: this.injector
    });
  }
  removeParseErrorsValidator(control) {
    if (this.parseErrorsValidator) {
      control?.removeValidators(this.parseErrorsValidator);
      control?.updateValueAndValidity({
        emitEvent: false
      });
    }
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
 * @description
 * A base class for directives that contain multiple registered instances of `NgControl`.
 * Only used by the forms module.
 *
 * @publicApi
 */
class ControlContainer extends AbstractControlDirective {
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
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// DO NOT REFACTOR!
// Each status is represented by a separate function to make sure that
// advanced Closure Compiler optimizations related to property renaming
// can work correctly.
class AbstractControlStatus {
  _cd;
  constructor(cd) {
    this._cd = cd;
  }
  get isTouched() {
    // track the touched signal
    this._cd?.control?._touched?.();
    return !!this._cd?.control?.touched;
  }
  get isUntouched() {
    return !!this._cd?.control?.untouched;
  }
  get isPristine() {
    // track the pristine signal
    this._cd?.control?._pristine?.();
    return !!this._cd?.control?.pristine;
  }
  get isDirty() {
    // pristine signal already tracked above
    return !!this._cd?.control?.dirty;
  }
  get isValid() {
    // track the status signal
    this._cd?.control?._status?.();
    return !!this._cd?.control?.valid;
  }
  get isInvalid() {
    // status signal already tracked above
    return !!this._cd?.control?.invalid;
  }
  get isPending() {
    // status signal already tracked above
    return !!this._cd?.control?.pending;
  }
  get isSubmitted() {
    // track the submitted signal
    this._cd?._submitted?.();
    // We check for the `submitted` field from `NgForm` and `FormGroupDirective` classes, but
    // we avoid instanceof checks to prevent non-tree-shakable references to those types.
    return !!this._cd?.submitted;
  }
}
const ngControlStatusHost = {
  '[class.ng-untouched]': 'isUntouched',
  '[class.ng-touched]': 'isTouched',
  '[class.ng-pristine]': 'isPristine',
  '[class.ng-dirty]': 'isDirty',
  '[class.ng-valid]': 'isValid',
  '[class.ng-invalid]': 'isInvalid',
  '[class.ng-pending]': 'isPending'
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
class NgControlStatus extends AbstractControlStatus {
  constructor(cd) {
    super(cd);
  }
  static ɵfac = function NgControlStatus_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgControlStatus)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NgControl, 2));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: NgControlStatus,
    selectors: [["", "formControlName", ""], ["", "ngModel", ""], ["", "formControl", ""]],
    hostVars: 14,
    hostBindings: function NgControlStatus_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassProp"]("ng-untouched", ctx.isUntouched)("ng-touched", ctx.isTouched)("ng-pristine", ctx.isPristine)("ng-dirty", ctx.isDirty)("ng-valid", ctx.isValid)("ng-invalid", ctx.isInvalid)("ng-pending", ctx.isPending);
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(NgControlStatus, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[formControlName],[ngModel],[formControl]',
      host: ngControlStatusHost,
      standalone: false
    }]
  }], () => [{
    type: NgControl,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }]
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
class NgControlStatusGroup extends AbstractControlStatus {
  constructor(cd) {
    super(cd);
  }
  static ɵfac = function NgControlStatusGroup_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgControlStatusGroup)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ControlContainer, 10));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: NgControlStatusGroup,
    selectors: [["", "formGroupName", ""], ["", "formArrayName", ""], ["", "ngModelGroup", ""], ["", "formGroup", ""], ["", "formArray", ""], ["form", 3, "ngNoForm", ""], ["", "ngForm", ""]],
    hostVars: 16,
    hostBindings: function NgControlStatusGroup_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassProp"]("ng-untouched", ctx.isUntouched)("ng-touched", ctx.isTouched)("ng-pristine", ctx.isPristine)("ng-dirty", ctx.isDirty)("ng-valid", ctx.isValid)("ng-invalid", ctx.isInvalid)("ng-pending", ctx.isPending)("ng-submitted", ctx.isSubmitted);
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(NgControlStatusGroup, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[formGroupName],[formArrayName],[ngModelGroup],[formGroup],[formArray],form:not([ngNoForm]),[ngForm]',
      // Note: having this object here to ensure that the spread assignment is not considered
      // a side-effect, ending up preserving `ngControlStatusHost` and `ngGroupStatusHost`.
      // Do not move it to a separate const (`ngGroupStatusHost`).
      host: {
        ...ngControlStatusHost,
        '[class.ng-submitted]': 'isSubmitted'
      },
      standalone: false
    }]
  }], () => [{
    type: ControlContainer,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }]
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
class FormGroup extends AbstractControl {
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
    (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && validateFormGroupControls(controls);
    this.controls = controls;
    this._initObservables();
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`. The status should be broadcasted via the `statusChanges` observable,
      // so we set `emitEvent` to `true` to allow that during the control creation process.
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
    this.updateValueAndValidity({
      emitEvent: options.emitEvent
    });
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
    this.updateValueAndValidity({
      emitEvent: options.emitEvent
    });
    this._onCollectionChange();
  }
  setControl(name, control, options = {}) {
    const existingControl = this._find(name);
    if (existingControl) existingControl._registerOnCollectionChange(() => {});
    delete this.controls[name];
    if (control) this.registerControl(name, control);
    this.updateValueAndValidity({
      emitEvent: options.emitEvent
    });
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
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => {
      assertAllValuesPresent(this, true, value);
      Object.keys(value).forEach(name => {
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
    // Even though the `value` argument type doesn't allow `null` and `undefined` values, the
    // `patchValue` can be called recursively and inner data structures might have these values, so
    // we just ignore such cases when a field containing FormGroup instance receives `null` or
    // `undefined` as a value.
    if (value == null /* both `null` and `undefined` */) return;
    Object.keys(value).forEach(name => {
      const existingControl = this._find(name);
      if (existingControl) {
        existingControl.patchValue(/* Guaranteed to be present, due to the outer forEach. */value[name], {
          onlySelf: true,
          emitEvent: options.emitEvent
        });
      }
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
    if (options?.emitEvent !== false) {
      this._events.next(new FormResetEvent(this));
    }
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
    if (subtreeUpdated) this.updateValueAndValidity({
      onlySelf: true
    });
    return subtreeUpdated;
  }
  /** @internal */
  _forEachChild(cb) {
    Object.keys(this.controls).forEach(key => {
      // The list of controls can change (for ex. controls might be removed) while the loop
      // is running (as a result of invoking Forms API in `valueChanges` subscription), so we
      // have to null check before invoking the callback.
      const control = this.controls[key];
      control && cb(control, key);
    });
  }
  /** @internal */
  _setUpControls() {
    this._forEachChild(control => {
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
    for (const [controlName, control] of Object.entries(this.controls)) {
      if (this.contains(controlName) && condition(control)) {
        return true;
      }
    }
    return false;
  }
  /** @internal */
  _reduceValue() {
    let acc = {};
    return this._reduceChildren(acc, (acc, control, name) => {
      if (control.enabled || this.disabled) {
        acc[name] = control.value;
      }
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
    for (const controlName of Object.keys(this.controls)) {
      if (this.controls[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(this.controls).length > 0 || this.disabled;
  }
  /** @internal */
  _find(name) {
    return hasOwnControl(this.controls, name) ? this.controls[name] : null;
  }
}
/**
 * Will validate that none of the controls has a key with a dot
 * Throws other wise
 */
function validateFormGroupControls(controls) {
  const invalidKeys = Object.keys(controls).filter(key => key.includes('.'));
  if (invalidKeys.length > 0) {
    // TODO: make this an error once there are no more uses in G3
    console.warn(`FormGroup keys cannot include \`.\`, please replace the keys for: ${invalidKeys.join(',')}.`);
  }
}
const UntypedFormGroup = FormGroup;
/**
 * @description
 * Asserts that the given control is an instance of `FormGroup`
 *
 * @see [Utility functions for narrowing form control types](guide/forms/reactive-forms#utility-functions-for-narrowing-form-control-types)
 *
 * @publicApi
 */
const isFormGroup = control => control instanceof FormGroup;
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
class FormRecord extends FormGroup {}
/**
 * @description
 * Asserts that the given control is an instance of `FormRecord`
 *
 * @see [Utility functions for narrowing form control types](guide/forms/reactive-forms#utility-functions-for-narrowing-form-control-types)
 *
 * @publicApi
 */
const isFormRecord = control => control instanceof FormRecord;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const formDirectiveProvider$1 = {
  provide: ControlContainer,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => NgForm)
};
const resolvedPromise$1 = (() => wx.__window.Promise.resolve())();
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
class NgForm extends ControlContainer {
  callSetDisabledState;
  /**
   * @description
   * Returns whether the form submission has been triggered.
   */
  get submitted() {
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(this.submittedReactive);
  }
  /** @internal */
  _submitted = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.submittedReactive(), /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "_submitted"
  }] : /* istanbul ignore next */[]));
  submittedReactive = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(false, /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "submittedReactive"
  }] : /* istanbul ignore next */[]));
  _directives = new Set();
  /**
   * @description
   * The `FormGroup` instance created for this form.
   */
  form;
  /**
   * @description
   * Event emitter for the "ngSubmit" event
   */
  ngSubmit = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
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
      const container = this._findContainer(dir.path);
      dir.control = container.registerControl(dir.name, dir.control);
      dir._setupWithForm(this.callSetDisabledState);
      dir.control.updateValueAndValidity({
        emitEvent: false
      });
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
      const container = this._findContainer(dir.path);
      container?.removeControl(dir.name);
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
      group.updateValueAndValidity({
        emitEvent: false
      });
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
      const container = this._findContainer(dir.path);
      container?.removeControl?.(dir.name);
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
      const ctrl = this.form.get(dir.path);
      ctrl.setValue(value);
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
    // Forms with `method="dialog"` have some special behavior
    // that won't reload the page and that shouldn't be prevented.
    return $event?.target?.method === 'dialog';
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
  resetForm(value = undefined) {
    this.form.reset(value);
    this.submittedReactive.set(false);
  }
  _setUpdateStrategy() {
    if (this.options && this.options.updateOn != null) {
      this.form._updateOn = this.options.updateOn;
    }
  }
  _findContainer(path) {
    path.pop();
    return path.length ? this.form.get(path) : this.form;
  }
  static ɵfac = function NgForm_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgForm)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_ASYNC_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](CALL_SET_DISABLED_STATE, 8));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: NgForm,
    selectors: [["form", 3, "ngNoForm", "", 3, "formGroup", "", 3, "formArray", ""], ["ng-form"], ["", "ngForm", ""]],
    hostBindings: function NgForm_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("submit", function NgForm_submit_HostBindingHandler($event) {
          return ctx.onSubmit($event);
        })("reset", function NgForm_reset_HostBindingHandler() {
          return ctx.onReset();
        });
      }
    },
    inputs: {
      options: [0, "ngFormOptions", "options"]
    },
    outputs: {
      ngSubmit: "ngSubmit"
    },
    exportAs: ["ngForm"],
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([formDirectiveProvider$1]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(NgForm, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'form:not([ngNoForm]):not([formGroup]):not([formArray]),ng-form,[ngForm]',
      providers: [formDirectiveProvider$1],
      host: {
        '(submit)': 'onSubmit($event)',
        '(reset)': 'onReset()'
      },
      outputs: ['ngSubmit'],
      exportAs: 'ngForm',
      standalone: false
    }]
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_ASYNC_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [CALL_SET_DISABLED_STATE]
    }]
  }], {
    options: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['ngFormOptions']
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
  return typeof formState === 'object' && formState !== null && Object.keys(formState).length === 2 && 'value' in formState && 'disabled' in formState;
}
const FormControl = class FormControl extends AbstractControl {
  /** @publicApi */
  defaultValue = null;
  /** @internal */
  _onChange = [];
  /** @internal */
  _pendingValue;
  /** @internal */
  _pendingChange = false;
  constructor(
  // formState and defaultValue will only be null if T is nullable
  formState = null, validatorOrOpts, asyncValidator) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this._applyFormState(formState);
    this._setUpdateStrategy(validatorOrOpts);
    this._initObservables();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`.
      // The status should be broadcasted via the `statusChanges` observable, so we set
      // `emitEvent` to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator
    });
    if (isOptionsObj(validatorOrOpts) && (validatorOrOpts.nonNullable || validatorOrOpts.initialValueIsDefault)) {
      if (isFormControlState(formState)) {
        this.defaultValue = formState.value;
      } else {
        this.defaultValue = formState;
      }
    }
  }
  setValue(value, options = {}) {
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => {
      this.value = this._pendingValue = value;
      if (this._onChange.length && options.emitModelToViewChange !== false) {
        this._onChange.forEach(changeFn => changeFn(this.value, options.emitViewToModelChange !== false));
      }
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
    if (options.overwriteDefaultValue) {
      this.defaultValue = this.value;
    }
    this._pendingChange = false;
    if (options?.emitEvent !== false) {
      this._events.next(new FormResetEvent(this));
    }
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
    if (this.updateOn === 'submit') {
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
    } else {
      this.value = this._pendingValue = formState;
    }
  }
};
const UntypedFormControl = FormControl;
/**
 * @description
 * Asserts that the given control is an instance of `FormControl`
 *
 * @see [Utility functions for narrowing form control types](guide/forms/reactive-forms#utility-functions-for-narrowing-form-control-types)
 *
 * @publicApi
 */
const isFormControl = control => control instanceof FormControl;

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
class AbstractFormGroupDirective extends ControlContainer {
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
    // Register the group with its parent group.
    this.formDirective.addFormGroup(this);
  }
  /** @docs-private */
  ngOnDestroy() {
    // Remove the group from its parent group.
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
  static ɵfac = /*@__PURE__*/(() => {
    let ɵAbstractFormGroupDirective_BaseFactory;
    return function AbstractFormGroupDirective_Factory(__ngFactoryType__) {
      return (ɵAbstractFormGroupDirective_BaseFactory || (ɵAbstractFormGroupDirective_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](AbstractFormGroupDirective)))(__ngFactoryType__ || AbstractFormGroupDirective);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: AbstractFormGroupDirective,
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(AbstractFormGroupDirective, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
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
function modelParentException() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1350 /* RuntimeErrorCode.NGMODEL_IN_FORM_GROUP */, `
    ngModel cannot be used to register form controls with a parent formGroup directive.  Try using
    formGroup's partner directive "formControlName" instead.  Example:

    ${formControlNameExample}

    Or, if you'd like to avoid registering this form control, indicate that it's standalone in ngModelOptions:

    Example:

    ${ngModelWithFormGroupExample}`);
}
function formGroupNameException() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1351 /* RuntimeErrorCode.NGMODEL_IN_FORM_GROUP_NAME */, `
    ngModel cannot be used to register form controls with a parent formGroupName or formArrayName directive.

    Option 1: Use formControlName instead of ngModel (reactive strategy):

    ${formGroupNameExample}

    Option 2:  Update ngModel's parent be ngModelGroup (template-driven strategy):

    ${ngModelGroupExample}`);
}
function ngModelInChildComponentWarning(containerTypeName) {
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.formatRuntimeError)(-1354 /* RuntimeErrorCode.NGMODEL_IN_CHILD_COMPONENT */, `ngModel on a form control inside a child component cannot register with the ${containerTypeName} in the ` + `parent component because @Host() stops injection at the component boundary. ` + `To register this control with the parent form, add viewProviders to the child component: ` + `@Component({ ..., viewProviders: [{ provide: ControlContainer, useExisting: ${containerTypeName} }] }). ` + `Or, to opt out of form registration, use [ngModelOptions]="{standalone: true}".`);
}
function missingNameException() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1352 /* RuntimeErrorCode.NGMODEL_WITHOUT_NAME */, `If ngModel is used within a form tag, either the name attribute must be set or the form
    control must be defined as 'standalone' in ngModelOptions.

    Example 1: <input [(ngModel)]="person.firstName" name="first">
    Example 2: <input [(ngModel)]="person.firstName" [ngModelOptions]="{standalone: true}">`);
}
function modelGroupParentException() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1353 /* RuntimeErrorCode.NGMODELGROUP_IN_FORM_GROUP */, `
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
const modelGroupProvider = {
  provide: ControlContainer,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => NgModelGroup)
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
class NgModelGroup extends AbstractFormGroupDirective {
  /**
   * @description
   * Tracks the name of the `NgModelGroup` bound to the directive. The name corresponds
   * to a key in the parent `NgForm`.
   */
  name = '';
  constructor(parent, validators, asyncValidators) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }
  /** @internal */
  _checkParentType() {
    if (!(this._parent instanceof NgModelGroup) && !(this._parent instanceof NgForm) && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) {
      throw modelGroupParentException();
    }
  }
  static ɵfac = function NgModelGroup_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgModelGroup)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ControlContainer, 5), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_ASYNC_VALIDATORS, 10));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: NgModelGroup,
    selectors: [["", "ngModelGroup", ""]],
    inputs: {
      name: [0, "ngModelGroup", "name"]
    },
    exportAs: ["ngModelGroup"],
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([modelGroupProvider]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(NgModelGroup, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[ngModelGroup]',
      providers: [modelGroupProvider],
      exportAs: 'ngModelGroup',
      standalone: false
    }]
  }], () => [{
    type: ControlContainer,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Host
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.SkipSelf
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_ASYNC_VALIDATORS]
    }]
  }], {
    name: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['ngModelGroup']
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
/**
 * @description
 *
 * Abstract class for top-level form directives (FormArrayDirective, FormGroupDirective) who bind an
 * existing `Form` to a DOM element.
 *
 * @publicApi
 */
class AbstractFormDirective extends ControlContainer {
  callSetDisabledState;
  /**
   * @description
   * Reports whether the form submission has been triggered.
   */
  get submitted() {
    return (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(this._submittedReactive);
  }
  // TODO(atscott): Remove once invalid API usage is cleaned up internally
  set submitted(value) {
    this._submittedReactive.set(value);
  }
  /** @internal */
  _submitted = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this._submittedReactive(), /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "_submitted"
  }] : /* istanbul ignore next */[]));
  _submittedReactive = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(false, /* @ts-ignore */
  ...(wx.__global.ngDevMode ? [{
    debugName: "_submittedReactive"
  }] : /* istanbul ignore next */[]));
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
    if (Object.hasOwn(changes, 'form')) {
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
      // Currently the `onCollectionChange` callback is rewritten each time the
      // `_registerOnCollectionChange` function is invoked. The implication is that cleanup should
      // happen *only* when the `onCollectionChange` callback was set by this directive instance.
      // Otherwise it might cause overriding a callback of some other directive instances. We should
      // consider updating this logic later to make it similar to how `onChange` callbacks are
      // handled, see https://github.com/angular/angular/issues/39732 for additional info.
      if (this.form._onCollectionChange === this._onCollectionChange) {
        this.form._registerOnCollectionChange(() => {});
      }
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
    ctrl.updateValueAndValidity({
      emitEvent: false
    });
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
    cleanUpControl(dir.control || null, dir, /* validateControlPresenceOnChange */false);
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
    const ctrl = this.form.get(dir.path);
    ctrl.setValue(value);
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
  resetForm(value = undefined, options = {}) {
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
    // Forms with `method="dialog"` have some special behavior that won't reload the page and that
    // shouldn't be prevented. Note that we need to null check the `event` and the `target`, because
    // some internal apps call this method directly with the wrong arguments.
    return $event?.target?.method === 'dialog';
  }
  /** @internal */
  _updateDomValue() {
    this.directives.forEach(dir => {
      const oldCtrl = dir.control;
      const newCtrl = this.form.get(dir.path);
      if (oldCtrl !== newCtrl) {
        // Note: the value of the `dir.control` may not be defined, for example when it's a first
        // `FormControl` that is added to a `FormGroup`/`FormArray` instance (via `addControl` call).
        cleanUpControl(oldCtrl || null, dir);
        // Check whether new control at the same location inside the corresponding `FormGroup`/`FormArray` is an
        // instance of `FormControl` and perform control setup only if that's the case.
        // Note: we don't need to clear the list of directives (`this.directives`) here, it would be
        // taken care of in the `removeControl` method invoked when corresponding `formControlName`
        // directive instance is being removed (invoked from `FormControlName.ngOnDestroy`).
        if (isFormControl(newCtrl)) {
          dir._setupWithForm(newCtrl, this.callSetDisabledState);
        }
      }
    });
    this.form._updateTreeValidity({
      emitEvent: false
    });
  }
  _setUpFormContainer(dir) {
    const ctrl = this.form.get(dir.path);
    setUpFormContainer(ctrl, dir);
    // NOTE: this operation looks unnecessary in case no new validators were added in
    // `setUpFormContainer` call. Consider updating this code to match the logic in
    // `_cleanUpFormContainer` function.
    ctrl.updateValueAndValidity({
      emitEvent: false
    });
  }
  _cleanUpFormContainer(dir) {
    const ctrl = this.form?.get(dir.path);
    if (ctrl) {
      const isControlUpdated = cleanUpFormContainer(ctrl, dir);
      if (isControlUpdated) {
        // Run validity check only in case a control was updated (i.e. view validators were
        // removed) as removing view validators might cause validity to change.
        ctrl.updateValueAndValidity({
          emitEvent: false
        });
      }
    }
  }
  _updateRegistrations() {
    this.form._registerOnCollectionChange(this._onCollectionChange);
    this._oldForm?._registerOnCollectionChange(() => {});
  }
  _updateValidators() {
    setUpValidators(this.form, this);
    if (this._oldForm) {
      cleanUpValidators(this._oldForm, this);
    }
  }
  _checkFormPresent() {
    if (!this.form && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) {
      throw missingFormException();
    }
  }
  static ɵfac = function AbstractFormDirective_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || AbstractFormDirective)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_ASYNC_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](CALL_SET_DISABLED_STATE, 8));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: AbstractFormDirective,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵNgOnChangesFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(AbstractFormDirective, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_ASYNC_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [CALL_SET_DISABLED_STATE]
    }]
  }], null);
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const formDirectiveProvider = {
  provide: ControlContainer,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => FormGroupDirective)
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
class FormGroupDirective extends AbstractFormDirective {
  /**
   * @description
   * Tracks the `FormGroup` bound to this directive.
   */
  form = null;
  /**
   * @description
   * Emits an event when the form submission has been triggered.
   */
  ngSubmit = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
  /**
   * @description
   * Returns the `FormGroup` bound to this directive.
   */
  get control() {
    return this.form;
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵFormGroupDirective_BaseFactory;
    return function FormGroupDirective_Factory(__ngFactoryType__) {
      return (ɵFormGroupDirective_BaseFactory || (ɵFormGroupDirective_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](FormGroupDirective)))(__ngFactoryType__ || FormGroupDirective);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: FormGroupDirective,
    selectors: [["", "formGroup", ""]],
    hostBindings: function FormGroupDirective_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("submit", function FormGroupDirective_submit_HostBindingHandler($event) {
          return ctx.onSubmit($event);
        })("reset", function FormGroupDirective_reset_HostBindingHandler() {
          return ctx.onReset();
        });
      }
    },
    inputs: {
      form: [0, "formGroup", "form"]
    },
    outputs: {
      ngSubmit: "ngSubmit"
    },
    exportAs: ["ngForm"],
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([formDirectiveProvider]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(FormGroupDirective, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[formGroup]',
      providers: [formDirectiveProvider],
      host: {
        '(submit)': 'onSubmit($event)',
        '(reset)': 'onReset()'
      },
      exportAs: 'ngForm',
      standalone: false
    }]
  }], null, {
    form: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['formGroup']
    }],
    ngSubmit: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Output
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
const formControlBinding$1 = {
  provide: NgControl,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => NgModel)
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
const resolvedPromise = (() => wx.__window.Promise.resolve())();
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
class NgModel extends NgControl {
  _changeDetectorRef;
  callSetDisabledState;
  control = new FormControl();
  // At runtime we coerce arbitrary values assigned to the "disabled" input to a "boolean".
  // This is not reflected in the type of the property because outside of templates, consumers
  // should only deal with booleans. In templates, a string is allowed for convenience and to
  // match the native "disabled attribute" semantics which can be observed on input elements.
  // This static member tells the compiler that values of type "string" can also be assigned
  // to the input in a template.
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
  name = '';
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
  update = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
  constructor(parent, validators, asyncValidators, valueAccessors, _changeDetectorRef, callSetDisabledState, injector, renderer) {
    super(injector, renderer, valueAccessors);
    this._changeDetectorRef = _changeDetectorRef;
    this.callSetDisabledState = callSetDisabledState;
    this._parent = parent;
    if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
      this._ngModelInjector = injector;
    }
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }
  /** @docs-private */
  ngOnChanges(changes) {
    if (!this._registered && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && this._parent === null && !this.options?.standalone) {
      const parentContainer = this._ngModelInjector?.get(ControlContainer, null);
      if (parentContainer != null) {
        const typeName = parentContainer instanceof NgForm ? 'NgForm' : parentContainer instanceof FormGroupDirective ? 'FormGroupDirective' : parentContainer instanceof NgModelGroup ? 'NgModelGroup' : parentContainer.constructor.name || 'ControlContainer';
        console.warn(ngModelInChildComponentWarning(typeName));
      }
    }
    this._checkForErrors();
    if (!this._registered || 'name' in changes) {
      if (this._registered) {
        this._checkName();
        if (this.formDirective) {
          // We can't call `formDirective.removeControl(this)`, because the `name` has already been
          // changed. We also can't reset the name temporarily since the logic in `removeControl`
          // is inside a promise and it won't run immediately. We work around it by giving it an
          // object with the same shape instead.
          const oldName = changes['name'].previousValue;
          this.formDirective.removeControl({
            name: oldName,
            path: this._getPath(oldName)
          });
        }
      }
      this._setUpControl();
    }
    if ('isDisabled' in changes) {
      this._updateDisabled(changes);
    }
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
    if (this.options && this.options.updateOn != null) {
      this.control._updateOn = this.options.updateOn;
    }
  }
  _isStandalone() {
    return !this._parent || !!(this.options && this.options.standalone);
  }
  _setUpStandalone() {
    if (!this.isCustomControlBased) {
      this.valueAccessor ??= this.selectedValueAccessor;
      setUpControlValueAccessor(this.control, this, this.callSetDisabledState);
    } else {
      // FVC path - set up subscriptions for value/status sync
      this.setupCustomControl();
    }
    this.control.updateValueAndValidity({
      emitEvent: false
    });
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
    } else {
      this.setupCustomControl();
    }
  }
  _checkForErrors() {
    if ((typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) && !this._isStandalone()) {
      checkParentType$1(this._parent);
    }
    this._checkName();
  }
  _checkName() {
    if (this.options && this.options.name) this.name = this.options.name;
    if (!this._isStandalone() && !this.name && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) {
      throw missingNameException();
    }
  }
  _updateValue(value) {
    resolvedPromise.then(() => {
      this.control.setValue(value, {
        emitViewToModelChange: false
      });
      this._changeDetectorRef?.markForCheck();
    });
  }
  _updateDisabled(changes) {
    const disabledValue = changes['isDisabled'].currentValue;
    // checking for 0 to avoid breaking change
    const isDisabled = disabledValue !== 0 && (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.booleanAttribute)(disabledValue);
    resolvedPromise.then(() => {
      if (isDisabled && !this.control.disabled) {
        this.control.disable();
      } else if (!isDisabled && this.control.disabled) {
        this.control.enable();
      }
      this._changeDetectorRef?.markForCheck();
    });
  }
  _getPath(controlName) {
    return this._parent ? controlPath(controlName, this._parent) : [controlName];
  }
  static ɵfac = function NgModel_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgModel)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ControlContainer, 9), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_ASYNC_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALUE_ACCESSOR, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.ChangeDetectorRef, 8), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](CALL_SET_DISABLED_STATE, 8), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector, 8), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2, 8));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: NgModel,
    selectors: [["", "ngModel", "", 3, "formControlName", "", 3, "formControl", ""]],
    inputs: {
      name: "name",
      isDisabled: [0, "disabled", "isDisabled"],
      model: [0, "ngModel", "model"],
      options: [0, "ngModelOptions", "options"]
    },
    outputs: {
      update: "ngModelChange"
    },
    exportAs: ["ngModel"],
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([formControlBinding$1, NG_CONTROL_INTEGRATION_PROVIDER]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵNgOnChangesFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵControlFeature"](null)]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(NgModel, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[ngModel]:not([formControlName]):not([formControl])',
      providers: [formControlBinding$1, NG_CONTROL_INTEGRATION_PROVIDER],
      exportAs: 'ngModel',
      standalone: false
    }]
  }], () => [{
    type: ControlContainer,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Host
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_ASYNC_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALUE_ACCESSOR]
    }]
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_0__.ChangeDetectorRef,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [_angular_core__WEBPACK_IMPORTED_MODULE_0__.ChangeDetectorRef]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [CALL_SET_DISABLED_STATE]
    }]
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }]
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }]
  }], {
    name: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }],
    isDisabled: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['disabled']
    }],
    model: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['ngModel']
    }],
    options: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['ngModelOptions']
    }],
    update: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Output,
      args: ['ngModelChange']
    }]
  });
})();
function checkParentType$1(parent) {
  if (!(parent instanceof NgModelGroup) && parent instanceof AbstractFormGroupDirective) {
    throw formGroupNameException();
  } else if (!(parent instanceof NgModelGroup) && !(parent instanceof NgForm)) {
    throw modelParentException();
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
class ɵNgNoValidate {
  static ɵfac = function ɵNgNoValidate_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ɵNgNoValidate)();
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: ɵNgNoValidate,
    selectors: [["form", 3, "ngNoForm", "", 3, "ngNativeValidate", ""]],
    hostAttrs: ["novalidate", ""],
    standalone: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(ɵNgNoValidate, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'form:not([ngNoForm]):not([ngNativeValidate])',
      host: {
        'novalidate': ''
      },
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
const SWITCH_VALUE_ACCESSOR$1 = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => PickerValueAccessor),
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
class PickerValueAccessor extends BuiltInControlValueAccessor {
  value;
  disabled;
  /**
   * Sets the "value" property on the input element.
   * @nodoc
   */
  writeValue(value) {
    const normalizedValue = value == null ? undefined : value;
    if (typeof normalizedValue !== 'undefined') {
      this.setProperty('value', normalizedValue);
    }
  }
  valueChange(value) {
    this.setProperty('value', value);
    this.onChange(value);
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵPickerValueAccessor_BaseFactory;
    return function PickerValueAccessor_Factory(__ngFactoryType__) {
      return (ɵPickerValueAccessor_BaseFactory || (ɵPickerValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](PickerValueAccessor)))(__ngFactoryType__ || PickerValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: PickerValueAccessor,
    selectors: [["picker", "formControlName", ""], ["picker", "formControl", ""], ["picker", "ngModel", ""]],
    hostVars: 2,
    hostBindings: function PickerValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("bindchange", function PickerValueAccessor_bindchange_HostBindingHandler($event) {
          return ctx.valueChange($event.detail.value);
        });
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdomProperty"]("value", ctx.value)("disabled", ctx.disabled);
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([SWITCH_VALUE_ACCESSOR$1]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(PickerValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'picker[formControlName],picker[formControl],picker[ngModel]',
      host: {
        '(bindchange)': 'valueChange($event.detail.value)'
      },
      providers: [SWITCH_VALUE_ACCESSOR$1]
    }]
  }], null, {
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['value']
    }],
    disabled: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['disabled']
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
const PICKER_VIEW_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => PickerViewValueAccessor),
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
class PickerViewValueAccessor extends BuiltInControlValueAccessor {
  value;
  /**
   * Sets the "value" property on the input element.
   * @nodoc
   */
  writeValue(value) {
    const normalizedValue = value == null ? undefined : value;
    if (typeof normalizedValue !== 'undefined') {
      this.setProperty('value', normalizedValue);
    }
  }
  setDisabledState() {}
  valueChange(value) {
    this.setProperty('value', value);
    this.onChange(value);
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵPickerViewValueAccessor_BaseFactory;
    return function PickerViewValueAccessor_Factory(__ngFactoryType__) {
      return (ɵPickerViewValueAccessor_BaseFactory || (ɵPickerViewValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](PickerViewValueAccessor)))(__ngFactoryType__ || PickerViewValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: PickerViewValueAccessor,
    selectors: [["picker-view", "formControlName", ""], ["picker-view", "formControl", ""], ["picker-view", "ngModel", ""]],
    hostVars: 1,
    hostBindings: function PickerViewValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("bindchange", function PickerViewValueAccessor_bindchange_HostBindingHandler($event) {
          return ctx.valueChange($event.detail.value);
        });
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdomProperty"]("value", ctx.value);
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([PICKER_VIEW_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(PickerViewValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'picker-view[formControlName],picker-view[formControl],picker-view[ngModel]',
      host: {
        '(bindchange)': 'valueChange($event.detail.value)'
      },
      providers: [PICKER_VIEW_VALUE_ACCESSOR]
    }]
  }], null, {
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['value']
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
const RADIO_GROUP_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => RadioGroupValueAccessor),
  multi: true
};
function throwNameError() {
  throw new Error(`
      If you define both a name and a formControlName attribute on your radio button, their values
      must match. Ex: <input type="radio" formControlName="food" name="food">
    `);
}
/**
 * Internal-only NgModule that works as a host for the `RadioControlRegistry` tree-shakable
 * provider. Note: the `InternalFormsSharedModule` can not be used here directly, since it's
 * declared *after* the `RadioControlRegistry` class and the `providedIn` doesn't support
 * `forwardRef` logic.
 */
class RadioControlRegistryModule {
  static ɵfac = function RadioControlRegistryModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || RadioControlRegistryModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({
    type: RadioControlRegistryModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({});
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(RadioControlRegistryModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule
  }], null, null);
})();
/**
 * @description
 * Class used by Angular to track radio buttons. For internal use only.
 */
class RadioControlRegistry {
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
    for (let i = this._accessors.length - 1; i >= 0; --i) {
      if (this._accessors[i][1] === accessor) {
        this._accessors.splice(i, 1);
        return;
      }
    }
  }
  /**
   * @description
   * Selects a radio button. For internal use only.
   */
  select(accessor) {
    this._accessors.forEach(c => {
      if (this._isSameGroup(c, accessor) && c[1] !== accessor) {
        c[1].fireUncheck(accessor.value);
      }
    });
  }
  _isSameGroup(controlPair, accessor) {
    if (!controlPair[0].control) {
      return false;
    }
    // todo 这个服务不一定保留
    return false;
    // return (
    //   controlPair[0]._parent === accessor._control._parent &&
    //   controlPair[1].name === accessor.name
    // );
  }
  static ɵfac = function RadioControlRegistry_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || RadioControlRegistry)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: RadioControlRegistry,
    factory: RadioControlRegistry.ɵfac,
    providedIn: RadioControlRegistryModule
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(RadioControlRegistry, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable,
    args: [{
      providedIn: RadioControlRegistryModule
    }]
  }], null, null);
})();
class RadioGroupValueAccessor extends BuiltInControlValueAccessor {
  children;
  valueChange(value) {
    if (this.children) {
      this.children.forEach(item => {
        item.updateChecked(item.value === value);
      });
    }
    this.onChange(value);
  }
  writeValue(value) {
    if (this.children) {
      this.children.forEach(item => {
        item.updateChecked(item.value === value);
      });
    }
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵRadioGroupValueAccessor_BaseFactory;
    return function RadioGroupValueAccessor_Factory(__ngFactoryType__) {
      return (ɵRadioGroupValueAccessor_BaseFactory || (ɵRadioGroupValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](RadioGroupValueAccessor)))(__ngFactoryType__ || RadioGroupValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: RadioGroupValueAccessor,
    selectors: [["radio-group", "formControlName", ""], ["radio-group", "formControl", ""], ["radio-group", "ngModel", ""]],
    contentQueries: function RadioGroupValueAccessor_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵcontentQuery"](dirIndex, RadioControl, 5);
      }
      if (rf & 2) {
        let _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵloadQuery"]()) && (ctx.children = _t);
      }
    },
    hostBindings: function RadioGroupValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("bindchange", function RadioGroupValueAccessor_bindchange_HostBindingHandler($event) {
          return ctx.valueChange($event.detail.value);
        });
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([RADIO_GROUP_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(RadioGroupValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'radio-group[formControlName],radio-group[formControl],radio-group[ngModel]',
      host: {
        '(bindchange)': 'valueChange($event.detail.value)'
      },
      providers: [RADIO_GROUP_VALUE_ACCESSOR]
    }]
  }], null, {
    children: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_0__.ContentChildren,
      args: [(0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => RadioControl), {
        descendants: true
      }]
    }]
  });
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
class RadioControl {
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
    this.renderer.setProperty(this.elementRef.nativeElement, 'checked', value);
  }
  static ɵfac = function RadioControl_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || RadioControl)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](RadioControlRegistry), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: RadioControl,
    selectors: [["radio"]],
    hostVars: 2,
    hostBindings: function RadioControl_HostBindings(rf, ctx) {
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdomProperty"]("value", ctx.value)("checked", ctx.checked);
      }
    },
    inputs: {
      value: "value"
    },
    standalone: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(RadioControl, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'radio',
      host: {}
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef
  }, {
    type: RadioControlRegistry
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector
  }], {
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['value']
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }],
    checked: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['checked']
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
const RANGE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => RangeValueAccessor),
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
class RangeValueAccessor extends BuiltInControlValueAccessor {
  /**
   * Sets the "value" property on the input element.
   * @docs-private
   */
  writeValue(value) {
    this.setProperty('value', parseFloat(value));
  }
  /**
   * Registers a function called when the control value changes.
   * @docs-private
   */
  registerOnChange(fn) {
    this.onChange = value => {
      fn(value == '' ? null : parseFloat(value));
    };
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵRangeValueAccessor_BaseFactory;
    return function RangeValueAccessor_Factory(__ngFactoryType__) {
      return (ɵRangeValueAccessor_BaseFactory || (ɵRangeValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](RangeValueAccessor)))(__ngFactoryType__ || RangeValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: RangeValueAccessor,
    selectors: [["input", "type", "range", "formControlName", "", 3, "ngNoCva", ""], ["input", "type", "range", "formControl", "", 3, "ngNoCva", ""], ["input", "type", "range", "ngModel", "", 3, "ngNoCva", ""]],
    hostBindings: function RangeValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("change", function RangeValueAccessor_change_HostBindingHandler($event) {
          return ctx.onChange($event.target.value);
        })("input", function RangeValueAccessor_input_HostBindingHandler($event) {
          return ctx.onChange($event.target.value);
        })("blur", function RangeValueAccessor_blur_HostBindingHandler() {
          return ctx.onTouched();
        });
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([RANGE_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(RangeValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'input[type=range]:not([ngNoCva])[formControlName],input[type=range]:not([ngNoCva])[formControl],input[type=range]:not([ngNoCva])[ngModel]',
      host: {
        '(change)': 'onChange($any($event.target).value)',
        '(input)': 'onChange($any($event.target).value)',
        '(blur)': 'onTouched()'
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
const NG_MODEL_WITH_FORM_CONTROL_WARNING = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken(typeof wx.__global.ngDevMode !== 'undefined' && wx.__global.ngDevMode ? 'NgModelWithFormControlWarning' : '');
const formControlBinding = {
  provide: NgControl,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => FormControlDirective)
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
class FormControlDirective extends NgControl {
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
    if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
      console.warn(disabledAttrWarning);
    }
  }
  // TODO(kara): remove next 4 properties once deprecation period is over
  /** @deprecated as of v6 */
  model;
  /** @deprecated as of v6 */
  update = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
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
      const previousForm = changes['form'].previousValue;
      if (previousForm) {
        cleanUpControl(previousForm, this, /* validateControlPresenceOnChange */false);
        this.removeParseErrorsValidator(previousForm);
      }
      // Only set up CVA if not using FVC
      if (!this.isCustomControlBased) {
        // Now that we know we're not using FVC, select the value accessor
        this.valueAccessor ??= this.selectedValueAccessor;
        setUpControlValueAccessor(this.form, this, this.callSetDisabledState);
      } else {
        // Set up FVC subscriptions when form changes - mark for check so
        // ɵngControlUpdate runs and syncs values/status to the FVC
        this.setupCustomControl();
      }
      this.form.updateValueAndValidity({
        emitEvent: false
      });
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
        _ngModelWarning('formControl', FormControlDirective, this, this._ngModelWarningConfig);
      }
      this.form.setValue(this.model);
      this.viewModel = this.model;
    }
  }
  /** @docs-private */
  ngOnDestroy() {
    if (this.form) {
      cleanUpControl(this.form, this, /* validateControlPresenceOnChange */false);
    }
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
    return Object.hasOwn(changes, 'form');
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
    /* @ts-ignore */
    return new (__ngFactoryType__ || FormControlDirective)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_ASYNC_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALUE_ACCESSOR, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_MODEL_WITH_FORM_CONTROL_WARNING, 8), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](CALL_SET_DISABLED_STATE, 8), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2, 8), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector, 8));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: FormControlDirective,
    selectors: [["", "formControl", ""]],
    inputs: {
      form: [0, "formControl", "form"],
      isDisabled: [0, "disabled", "isDisabled"],
      model: [0, "ngModel", "model"]
    },
    outputs: {
      update: "ngModelChange"
    },
    exportAs: ["ngForm"],
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([formControlBinding, NG_CONTROL_INTEGRATION_PROVIDER]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵNgOnChangesFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵControlFeature"](null)]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(FormControlDirective, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[formControl]',
      providers: [formControlBinding, NG_CONTROL_INTEGRATION_PROVIDER],
      exportAs: 'ngForm',
      standalone: false
    }]
  }], () => [{
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_ASYNC_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALUE_ACCESSOR]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_MODEL_WITH_FORM_CONTROL_WARNING]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [CALL_SET_DISABLED_STATE]
    }]
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }]
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }]
  }], {
    form: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['formControl']
    }],
    isDisabled: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['disabled']
    }],
    model: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['ngModel']
    }],
    update: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Output,
      args: ['ngModelChange']
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
const formGroupNameProvider = {
  provide: ControlContainer,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => FormGroupName)
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
class FormGroupName extends AbstractFormGroupDirective {
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
    if (hasInvalidParent(this._parent) && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) {
      throw groupParentException();
    }
  }
  static ɵfac = function FormGroupName_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || FormGroupName)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ControlContainer, 13), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_ASYNC_VALIDATORS, 10));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: FormGroupName,
    selectors: [["", "formGroupName", ""]],
    inputs: {
      name: [0, "formGroupName", "name"]
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([formGroupNameProvider]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(FormGroupName, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[formGroupName]',
      providers: [formGroupNameProvider],
      standalone: false
    }]
  }], () => [{
    type: ControlContainer,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Host
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.SkipSelf
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_ASYNC_VALIDATORS]
    }]
  }], {
    name: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['formGroupName']
    }]
  });
})();
const formArrayNameProvider = {
  provide: ControlContainer,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => FormArrayName)
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
class FormArrayName extends ControlContainer {
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
    if (hasInvalidParent(this._parent) && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) {
      throw arrayParentException();
    }
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
    /* @ts-ignore */
    return new (__ngFactoryType__ || FormArrayName)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ControlContainer, 13), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_ASYNC_VALIDATORS, 10));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: FormArrayName,
    selectors: [["", "formArrayName", ""]],
    inputs: {
      name: [0, "formArrayName", "name"]
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([formArrayNameProvider]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(FormArrayName, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[formArrayName]',
      providers: [formArrayNameProvider],
      standalone: false
    }]
  }], () => [{
    type: ControlContainer,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Host
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.SkipSelf
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_ASYNC_VALIDATORS]
    }]
  }], {
    name: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['formArrayName']
    }]
  });
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
const controlNameBinding = {
  provide: NgControl,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => FormControlName)
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
class FormControlName extends NgControl {
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
    if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
      console.warn(disabledAttrWarning);
    }
  }
  // TODO(kara): remove next 4 properties once deprecation period is over
  /** @deprecated as of v6 */
  model;
  /** @deprecated as of v6 */
  update = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
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
    } else {
      this.setupCustomControl();
    }
  }
  /** @docs-private */
  ngOnChanges(changes) {
    if (!this._added) this._setUpControl();
    if (isPropertyUpdated(changes, this.viewModel)) {
      if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
        _ngModelWarning('formControlName', FormControlName, this, this._ngModelWarningConfig);
      }
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
    if (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode) {
      checkParentType(this._parent, this.name);
    }
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
    // Ensure behavior is the same if we're not using the custom control codepath.
    if (!this.isCustomControlBased) {
      return;
    }
    // this.control is typically initialized by `ngOnChanges`, however `ɵngControlUpdate` fires
    // first. So, we're responsible for initializing it here.
    if (!this._added) this._setUpControl();
    super.ngControlUpdate(host, true);
  }
  static ɵfac = function FormControlName_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || FormControlName)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ControlContainer, 13), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_ASYNC_VALIDATORS, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_VALUE_ACCESSOR, 10), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](NG_MODEL_WITH_FORM_CONTROL_WARNING, 8), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2, 8), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector, 8));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: FormControlName,
    selectors: [["", "formControlName", ""]],
    inputs: {
      name: [0, "formControlName", "name"],
      isDisabled: [0, "disabled", "isDisabled"],
      model: [0, "ngModel", "model"]
    },
    outputs: {
      update: "ngModelChange"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([controlNameBinding, NG_CONTROL_INTEGRATION_PROVIDER]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵNgOnChangesFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵControlFeature"](null)]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(FormControlName, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: '[formControlName]',
      providers: [controlNameBinding, NG_CONTROL_INTEGRATION_PROVIDER],
      standalone: false
    }]
  }], () => [{
    type: ControlContainer,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Host
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.SkipSelf
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_ASYNC_VALIDATORS]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Self
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_VALUE_ACCESSOR]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Inject,
      args: [NG_MODEL_WITH_FORM_CONTROL_WARNING]
    }]
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }]
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.Injector,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }]
  }], {
    name: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['formControlName']
    }],
    isDisabled: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['disabled']
    }],
    model: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['ngModel']
    }],
    update: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Output,
      args: ['ngModelChange']
    }]
  });
})();
function checkParentType(parent, name) {
  if (!(parent instanceof FormGroupName) && parent instanceof AbstractFormGroupDirective) {
    throw ngModelGroupException();
  } else if (!(parent instanceof FormGroupName) && !(parent instanceof AbstractFormDirective) && !(parent instanceof FormArrayName)) {
    throw controlParentException(name);
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const SELECT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => SelectControlValueAccessor),
  multi: true
};
function _buildValueString$1(id, value) {
  if (id == null) return `${value}`;
  if (value && typeof value === 'object') value = 'Object';
  return `${id}: ${value}`.slice(0, 50);
}
function _extractId$1(valueString) {
  return valueString.split(':')[0];
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
class SelectControlValueAccessor extends BuiltInControlValueAccessor {
  /** @docs-private */
  value;
  /** @internal */
  _optionMap = new Map();
  /** @internal */
  _idCounter = 0;
  /**
   * @description
   * Tracks the option comparison algorithm for tracking identities when
   * checking for changes.
   */
  set compareWith(fn) {
    if (typeof fn !== 'function' && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1201 /* RuntimeErrorCode.COMPAREWITH_NOT_A_FN */, `compareWith must be a function, but received ${JSON.stringify(fn)}`);
    }
    this._compareWith = fn;
  }
  _compareWith = Object.is;
  // We need this because we might be in the process of destroying the root
  // injector, which is marked as destroyed before running destroy hooks.
  // Attempting to use afterNextRender with the node injector would evntually
  // run into that already destroyed injector.
  appRefInjector = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationRef).injector;
  destroyRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.DestroyRef);
  cdr = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_0__.ChangeDetectorRef);
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
    if (this._queuedWrite || this.appRefInjector.destroyed) {
      return;
    }
    this._queuedWrite = true;
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.afterNextRender)({
      write: () => {
        if (this.destroyRef.destroyed) {
          return;
        }
        this._queuedWrite = false;
        this.writeValue(this.value);
      }
    }, {
      injector: this.appRefInjector
    });
  }
  /**
   * Sets the "value" property on the select element.
   * @docs-private
   */
  writeValue(value) {
    // TODO(atscott): This could likely be optimized more by only marking for check if the value is changed
    // note that this needs to include both the internal value and the value in the DOM.
    this.cdr.markForCheck();
    this.value = value;
    const id = this._getOptionId(value);
    const valueString = _buildValueString$1(id, value);
    this.setProperty('value', valueString);
  }
  /**
   * Registers a function called when the control value changes.
   * @docs-private
   */
  registerOnChange(fn) {
    this.onChange = valueString => {
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
    for (const id of this._optionMap.keys()) {
      if (this._compareWith(this._optionMap.get(id), value)) return id;
    }
    return null;
  }
  /** @internal */
  _getOptionValue(valueString) {
    const id = _extractId$1(valueString);
    return this._optionMap.has(id) ? this._optionMap.get(id) : valueString;
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵSelectControlValueAccessor_BaseFactory;
    return function SelectControlValueAccessor_Factory(__ngFactoryType__) {
      return (ɵSelectControlValueAccessor_BaseFactory || (ɵSelectControlValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](SelectControlValueAccessor)))(__ngFactoryType__ || SelectControlValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: SelectControlValueAccessor,
    selectors: [["select", "formControlName", "", 3, "multiple", "", 3, "ngNoCva", ""], ["select", "formControl", "", 3, "multiple", "", 3, "ngNoCva", ""], ["select", "ngModel", "", 3, "multiple", "", 3, "ngNoCva", ""]],
    hostBindings: function SelectControlValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("change", function SelectControlValueAccessor_change_HostBindingHandler($event) {
          return ctx.onChange($event.target.value);
        })("blur", function SelectControlValueAccessor_blur_HostBindingHandler() {
          return ctx.onTouched();
        });
      }
    },
    inputs: {
      compareWith: "compareWith"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([SELECT_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(SelectControlValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'select:not([multiple]):not([ngNoCva])[formControlName],select:not([multiple]):not([ngNoCva])[formControl],select:not([multiple]):not([ngNoCva])[ngModel]',
      host: {
        '(change)': 'onChange($any($event.target).value)',
        '(blur)': 'onTouched()'
      },
      providers: [SELECT_VALUE_ACCESSOR],
      standalone: false
    }]
  }], null, {
    compareWith: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }]
  });
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
class NgSelectOption {
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
    this._renderer.setProperty(this._element.nativeElement, 'value', value);
  }
  /** @docs-private */
  ngOnDestroy() {
    this._select?._optionMap.delete(this.id);
    this._select?._writeValueAfterRender();
  }
  static ɵfac = function NgSelectOption_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NgSelectOption)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](SelectControlValueAccessor, 9));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: NgSelectOption,
    selectors: [["option"]],
    inputs: {
      ngValue: "ngValue",
      value: "value"
    },
    standalone: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(NgSelectOption, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'option',
      standalone: false
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2
  }, {
    type: SelectControlValueAccessor,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Host
    }]
  }], {
    ngValue: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['ngValue']
    }],
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['value']
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
const SELECT_MULTIPLE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => SelectMultipleControlValueAccessor),
  multi: true
};
function _buildValueString(id, value) {
  if (id == null) return `${value}`;
  if (typeof value === 'string') value = `'${value}'`;
  if (value && typeof value === 'object') value = 'Object';
  return `${id}: ${value}`.slice(0, 50);
}
function _extractId(valueString) {
  return valueString.split(':')[0];
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
class SelectMultipleControlValueAccessor extends BuiltInControlValueAccessor {
  /**
   * The current value.
   * @docs-private
   */
  value;
  /** @internal */
  _optionMap = new Map();
  /** @internal */
  _idCounter = 0;
  /**
   * @description
   * Tracks the option comparison algorithm for tracking identities when
   * checking for changes.
   */
  set compareWith(fn) {
    if (typeof fn !== 'function' && (typeof wx.__global.ngDevMode === 'undefined' || wx.__global.ngDevMode)) {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_1__.RuntimeError(1201 /* RuntimeErrorCode.COMPAREWITH_NOT_A_FN */, `compareWith must be a function, but received ${JSON.stringify(fn)}`);
    }
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
      // convert values to ids
      const ids = value.map(v => this._getOptionId(v));
      optionSelectedStateSetter = (opt, id) => {
        opt._setSelected(ids.indexOf(id) > -1);
      };
    } else {
      optionSelectedStateSetter = opt => {
        opt._setSelected(false);
      };
    }
    this._optionMap.forEach(optionSelectedStateSetter);
  }
  /**
   * Registers a function called when the control value changes
   * and writes an array of the selected options.
   * @docs-private
   */
  registerOnChange(fn) {
    this.onChange = element => {
      const selected = [];
      const selectedOptions = element.selectedOptions;
      if (selectedOptions !== undefined) {
        const options = selectedOptions;
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          const val = this._getOptionValue(opt.value);
          selected.push(val);
        }
      }
      // Degrade to use `options` when `selectedOptions` property is not available.
      // Note: the `selectedOptions` is available in all supported browsers, but the Domino lib
      // doesn't have it currently, see https://github.com/fgnass/domino/issues/177.
      else {
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
    for (const id of this._optionMap.keys()) {
      if (this._compareWith(this._optionMap.get(id)._value, value)) return id;
    }
    return null;
  }
  /** @internal */
  _getOptionValue(valueString) {
    const id = _extractId(valueString);
    return this._optionMap.has(id) ? this._optionMap.get(id)._value : valueString;
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵSelectMultipleControlValueAccessor_BaseFactory;
    return function SelectMultipleControlValueAccessor_Factory(__ngFactoryType__) {
      return (ɵSelectMultipleControlValueAccessor_BaseFactory || (ɵSelectMultipleControlValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](SelectMultipleControlValueAccessor)))(__ngFactoryType__ || SelectMultipleControlValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: SelectMultipleControlValueAccessor,
    selectors: [["select", "multiple", "", "formControlName", "", 3, "ngNoCva", ""], ["select", "multiple", "", "formControl", "", 3, "ngNoCva", ""], ["select", "multiple", "", "ngModel", "", 3, "ngNoCva", ""]],
    hostBindings: function SelectMultipleControlValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("change", function SelectMultipleControlValueAccessor_change_HostBindingHandler($event) {
          return ctx.onChange($event.target);
        })("blur", function SelectMultipleControlValueAccessor_blur_HostBindingHandler() {
          return ctx.onTouched();
        });
      }
    },
    inputs: {
      compareWith: "compareWith"
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([SELECT_MULTIPLE_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(SelectMultipleControlValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'select[multiple]:not([ngNoCva])[formControlName],select[multiple]:not([ngNoCva])[formControl],select[multiple]:not([ngNoCva])[ngModel]',
      host: {
        '(change)': 'onChange($event.target)',
        '(blur)': 'onTouched()'
      },
      providers: [SELECT_MULTIPLE_VALUE_ACCESSOR],
      standalone: false
    }]
  }], null, {
    compareWith: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input
    }]
  });
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
class ɵNgSelectMultipleOption {
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
    if (this._select) {
      this.id = this._select._registerOption(this);
    }
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
    } else {
      this._setElementValue(value);
    }
  }
  /** @internal */
  _setElementValue(value) {
    this._renderer.setProperty(this._element.nativeElement, 'value', value);
  }
  /** @internal */
  _setSelected(selected) {
    this._renderer.setProperty(this._element.nativeElement, 'selected', selected);
  }
  /** @docs-private */
  ngOnDestroy() {
    if (this._select) {
      this._select._optionMap.delete(this.id);
      this._select.writeValue(this._select.value);
    }
  }
  static ɵfac = function ɵNgSelectMultipleOption_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ɵNgSelectMultipleOption)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](SelectMultipleControlValueAccessor, 9));
  };
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: ɵNgSelectMultipleOption,
    selectors: [["option"]],
    inputs: {
      ngValue: "ngValue",
      value: "value"
    },
    standalone: false
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(ɵNgSelectMultipleOption, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'option',
      standalone: false
    }]
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.ElementRef
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Renderer2
  }, {
    type: SelectMultipleControlValueAccessor,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Optional
    }, {
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Host
    }]
  }], {
    ngValue: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['ngValue']
    }],
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Input,
      args: ['value']
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
const NUMBER_VALUE_ACCESSOR$1 = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => SliderValueAccessor),
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
class SliderValueAccessor extends BuiltInControlValueAccessor {
  value;
  disabled;
  /**
   * Sets the "value" property on the input element.
   * @nodoc
   */
  writeValue(value) {
    const normalizedValue = value == null ? undefined : value;
    if (typeof normalizedValue !== 'undefined') {
      this.setProperty('value', normalizedValue);
    }
  }
  valueChange(value) {
    this.setProperty('value', value);
    this.onChange(value);
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵSliderValueAccessor_BaseFactory;
    return function SliderValueAccessor_Factory(__ngFactoryType__) {
      return (ɵSliderValueAccessor_BaseFactory || (ɵSliderValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](SliderValueAccessor)))(__ngFactoryType__ || SliderValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: SliderValueAccessor,
    selectors: [["slider", "formControlName", ""], ["slider", "formControl", ""], ["slider", "ngModel", ""]],
    hostVars: 2,
    hostBindings: function SliderValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("bindchange", function SliderValueAccessor_bindchange_HostBindingHandler($event) {
          return ctx.valueChange($event.detail.value);
        });
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdomProperty"]("value", ctx.value)("disabled", ctx.disabled);
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([NUMBER_VALUE_ACCESSOR$1]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(SliderValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'slider[formControlName],slider[formControl],slider[ngModel]',
      host: {
        '(bindchange)': 'valueChange($event.detail.value)'
      },
      providers: [NUMBER_VALUE_ACCESSOR$1]
    }]
  }], null, {
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['value']
    }],
    disabled: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['disabled']
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
const SWITCH_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => SwitchValueAccessor),
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
class SwitchValueAccessor extends BuiltInControlValueAccessor {
  value;
  disabled;
  /**
   * Sets the "value" property on the input element.
   * @nodoc
   */
  writeValue(value) {
    const normalizedValue = value == null ? undefined : value;
    if (typeof normalizedValue !== 'undefined') {
      this.setProperty('value', normalizedValue);
    }
  }
  valueChange(value) {
    this.setProperty('value', value);
    this.onChange(value);
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵSwitchValueAccessor_BaseFactory;
    return function SwitchValueAccessor_Factory(__ngFactoryType__) {
      return (ɵSwitchValueAccessor_BaseFactory || (ɵSwitchValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](SwitchValueAccessor)))(__ngFactoryType__ || SwitchValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: SwitchValueAccessor,
    selectors: [["switch", "formControlName", ""], ["switch", "formControl", ""], ["switch", "ngModel", ""]],
    hostVars: 2,
    hostBindings: function SwitchValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("bindchange", function SwitchValueAccessor_bindchange_HostBindingHandler($event) {
          return ctx.valueChange($event.detail.value);
        });
      }
      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdomProperty"]("checked", ctx.value)("disabled", ctx.disabled);
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([SWITCH_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(SwitchValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      standalone: false,
      selector: 'switch[formControlName],switch[formControl],switch[ngModel]',
      host: {
        '(bindchange)': 'valueChange($event.detail.value)'
      },
      providers: [SWITCH_VALUE_ACCESSOR]
    }]
  }], null, {
    value: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['checked']
    }],
    disabled: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.HostBinding,
      args: ['disabled']
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
const SHARED_FORM_DIRECTIVES = [ɵNgNoValidate, NgSelectOption, ɵNgSelectMultipleOption, DefaultValueAccessor, SliderValueAccessor, RangeValueAccessor, CheckboxControl, SelectControlValueAccessor, SelectMultipleControlValueAccessor, RadioControl, NgControlStatus, NgControlStatusGroup, RequiredValidator, MinLengthValidator, MaxLengthValidator, PatternValidator, CheckboxRequiredValidator, EmailValidator, MinValidator, MaxValidator, SwitchValueAccessor, PickerViewValueAccessor, PickerValueAccessor, RadioGroupValueAccessor, CheckBoxGroupValueAccessor];
const TEMPLATE_DRIVEN_DIRECTIVES = [NgModel, NgModelGroup, NgForm];
const REACTIVE_DRIVEN_DIRECTIVES = [FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName];
/**
 * Internal module used for sharing directives between FormsModule and ReactiveFormsModule
 */
class ɵInternalFormsSharedModule {
  static ɵfac = function ɵInternalFormsSharedModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ɵInternalFormsSharedModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({
    type: ɵInternalFormsSharedModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({
    imports: [RadioControlRegistryModule]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(ɵInternalFormsSharedModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule,
    args: [{
      declarations: SHARED_FORM_DIRECTIVES,
      imports: [RadioControlRegistryModule],
      exports: SHARED_FORM_DIRECTIVES
    }]
  }], null, null);
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsetNgModuleScope"](ɵInternalFormsSharedModule, {
    declarations: [ɵNgNoValidate, NgSelectOption, ɵNgSelectMultipleOption, DefaultValueAccessor, SliderValueAccessor, RangeValueAccessor, CheckboxControl, SelectControlValueAccessor, SelectMultipleControlValueAccessor, RadioControl, NgControlStatus, NgControlStatusGroup, RequiredValidator, MinLengthValidator, MaxLengthValidator, PatternValidator, CheckboxRequiredValidator, EmailValidator, MinValidator, MaxValidator, SwitchValueAccessor, PickerViewValueAccessor, PickerValueAccessor, RadioGroupValueAccessor, CheckBoxGroupValueAccessor],
    imports: [RadioControlRegistryModule],
    exports: [ɵNgNoValidate, NgSelectOption, ɵNgSelectMultipleOption, DefaultValueAccessor, SliderValueAccessor, RangeValueAccessor, CheckboxControl, SelectControlValueAccessor, SelectMultipleControlValueAccessor, RadioControl, NgControlStatus, NgControlStatusGroup, RequiredValidator, MinLengthValidator, MaxLengthValidator, PatternValidator, CheckboxRequiredValidator, EmailValidator, MinValidator, MaxValidator, SwitchValueAccessor, PickerViewValueAccessor, PickerValueAccessor, RadioGroupValueAccessor, CheckBoxGroupValueAccessor]
  });
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const NUMBER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(() => NumberValueAccessor),
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
class NumberValueAccessor extends BuiltInControlValueAccessor {
  /**
   * Sets the "value" property on the input element.
   * @docs-private
   */
  writeValue(value) {
    // The value needs to be normalized for IE9, otherwise it is set to 'null' when null
    const normalizedValue = value == null ? '' : value;
    this.setProperty('value', normalizedValue);
  }
  /**
   * Registers a function called when the control value changes.
   * @docs-private
   */
  registerOnChange(fn) {
    this.onChange = value => {
      fn(value == '' ? null : parseFloat(value));
    };
  }
  static ɵfac = /*@__PURE__*/(() => {
    let ɵNumberValueAccessor_BaseFactory;
    return function NumberValueAccessor_Factory(__ngFactoryType__) {
      return (ɵNumberValueAccessor_BaseFactory || (ɵNumberValueAccessor_BaseFactory = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetInheritedFactory"](NumberValueAccessor)))(__ngFactoryType__ || NumberValueAccessor);
    };
  })();
  static ɵdir = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineDirective"]({
    type: NumberValueAccessor,
    selectors: [["input", "type", "number", "formControlName", "", 3, "ngNoCva", ""], ["input", "type", "number", "formControl", "", 3, "ngNoCva", ""], ["input", "type", "number", "ngModel", "", 3, "ngNoCva", ""]],
    hostBindings: function NumberValueAccessor_HostBindings(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("input", function NumberValueAccessor_input_HostBindingHandler($event) {
          return ctx.onChange($event.target.value);
        })("blur", function NumberValueAccessor_blur_HostBindingHandler() {
          return ctx.onTouched();
        });
      }
    },
    standalone: false,
    features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵProvidersFeature"]([NUMBER_VALUE_ACCESSOR]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵInheritDefinitionFeature"]]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(NumberValueAccessor, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Directive,
    args: [{
      selector: 'input[type=number]:not([ngNoCva])[formControlName],input[type=number]:not([ngNoCva])[formControl],input[type=number]:not([ngNoCva])[ngModel]',
      host: {
        '(input)': 'onChange($any($event.target).value)',
        '(blur)': 'onTouched()'
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
class FormArray extends AbstractControl {
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
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`.
      // The status should be broadcasted via the `statusChanges` observable, so we set `emitEvent`
      // to `true` to allow that during the control creation process.
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
    if (Array.isArray(control)) {
      control.forEach(ctrl => {
        this.controls.push(ctrl);
        this._registerControl(ctrl);
      });
    } else {
      this.controls.push(control);
      this._registerControl(control);
    }
    this.updateValueAndValidity({
      emitEvent: options.emitEvent
    });
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
    this.updateValueAndValidity({
      emitEvent: options.emitEvent
    });
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
    // Adjust the index, then clamp it at no less than 0 to prevent undesired underflows.
    let adjustedIndex = this._adjustIndex(index);
    if (adjustedIndex < 0) adjustedIndex = 0;
    if (this.controls[adjustedIndex]) this.controls[adjustedIndex]._registerOnCollectionChange(() => {});
    this.controls.splice(adjustedIndex, 1);
    this.updateValueAndValidity({
      emitEvent: options.emitEvent
    });
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
    // Adjust the index, then clamp it at no less than 0 to prevent undesired underflows.
    let adjustedIndex = this._adjustIndex(index);
    if (adjustedIndex < 0) adjustedIndex = 0;
    if (this.controls[adjustedIndex]) this.controls[adjustedIndex]._registerOnCollectionChange(() => {});
    this.controls.splice(adjustedIndex, 1);
    if (control) {
      this.controls.splice(adjustedIndex, 0, control);
      this._registerControl(control);
    }
    this.updateValueAndValidity({
      emitEvent: options.emitEvent
    });
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
    ;(0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.untracked)(() => {
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
    // Even though the `value` argument type doesn't allow `null` and `undefined` values, the
    // `patchValue` can be called recursively and inner data structures might have these values,
    // so we just ignore such cases when a field containing FormArray instance receives `null` or
    // `undefined` as a value.
    if (value == null /* both `null` and `undefined` */) return;
    value.forEach((newValue, index) => {
      if (this.at(index)) {
        this.at(index).patchValue(newValue, {
          onlySelf: true,
          emitEvent: options.emitEvent
        });
      }
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
    if (options?.emitEvent !== false) {
      this._events.next(new FormResetEvent(this));
    }
  }
  /**
   * The aggregate value of the array, including any disabled controls.
   *
   * Reports all values regardless of disabled status.
   */
  getRawValue() {
    return this.controls.map(control => control.getRawValue());
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
    this._forEachChild(control => control._registerOnCollectionChange(() => {}));
    this.controls.splice(0);
    this.updateValueAndValidity({
      emitEvent: options.emitEvent
    });
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
    if (subtreeUpdated) this.updateValueAndValidity({
      onlySelf: true
    });
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
    this.value = this.controls.filter(control => control.enabled || this.disabled).map(control => control.value);
  }
  /** @internal */
  _anyControls(condition) {
    return this.controls.some(control => control.enabled && condition(control));
  }
  /** @internal */
  _setUpControls() {
    this._forEachChild(control => this._registerControl(control));
  }
  /** @internal */
  _allControlsDisabled() {
    for (const control of this.controls) {
      if (control.enabled) return false;
    }
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
}
const UntypedFormArray = FormArray;
/**
 * @description
 * Asserts that the given control is an instance of `FormArray`
 *
 * @see [Utility functions for narrowing form control types](guide/forms/reactive-forms#utility-functions-for-narrowing-form-control-types)
 *
 * @publicApi
 */
const isFormArray = control => control instanceof FormArray;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
function isAbstractControlOptions(options) {
  return !!options && (options.asyncValidators !== undefined || options.validators !== undefined || options.updateOn !== undefined);
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
class FormBuilder {
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
    if (isAbstractControlOptions(options)) {
      // `options` are `AbstractControlOptions`
      newOptions = options;
    } else if (options !== null) {
      // `options` are legacy form group options
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
    const reducedControls = this._reduceControls(controls);
    // Cast to `any` because the inferred types are not as specific as Element.
    return new FormRecord(reducedControls, options);
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
    if (!this.useNonNullable) {
      return new FormControl(formState, validatorOrOpts, asyncValidator);
    }
    if (isAbstractControlOptions(validatorOrOpts)) {
      // If the second argument is options, then they are copied.
      newOptions = validatorOrOpts;
    } else {
      // If the other arguments are validators, they are copied into an options object.
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
    const createdControls = controls.map(c => this._createControl(c));
    // Cast to `any` because the inferred types are not as specific as Element.
    return new FormArray(createdControls, validatorOrOpts, asyncValidator);
  }
  /** @internal */
  _reduceControls(controls) {
    const createdControls = {};
    Object.keys(controls).forEach(controlName => {
      createdControls[controlName] = this._createControl(controls[controlName]);
    });
    return createdControls;
  }
  /** @internal */
  _createControl(controls) {
    if (controls instanceof FormControl) {
      return controls;
    } else if (controls instanceof AbstractControl) {
      // A control; just return it
      return controls;
    } else if (Array.isArray(controls)) {
      // ControlConfig Tuple
      const value = controls[0];
      const validator = controls.length > 1 ? controls[1] : null;
      const asyncValidator = controls.length > 2 ? controls[2] : null;
      return this.control(value, validator, asyncValidator);
    } else {
      // T or FormControlState<T>
      return this.control(controls);
    }
  }
  static ɵfac = function FormBuilder_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FormBuilder)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineService"]({
    token: FormBuilder,
    factory: FormBuilder.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(FormBuilder, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Service
  }], null, null);
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
class NonNullableFormBuilder {
  static ɵfac = function NonNullableFormBuilder_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NonNullableFormBuilder)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineService"]({
    token: NonNullableFormBuilder,
    factory: () => (() => (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(FormBuilder).nonNullable)()
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(NonNullableFormBuilder, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Service,
    args: [{
      factory: () => (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(FormBuilder).nonNullable
    }]
  }], null, null);
})();
/**
 * UntypedFormBuilder is the same as `FormBuilder`, but it provides untyped controls.
 */
class UntypedFormBuilder extends FormBuilder {
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
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineService"]({
    token: UntypedFormBuilder,
    factory: UntypedFormBuilder.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(UntypedFormBuilder, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Service
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
 * Exports the required providers and directives for template-driven forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](guide/forms)
 * @see [Template-driven Forms Guide](guide/forms)
 *
 * @publicApi
 */
class FormsModule {
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
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({
    type: FormsModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({
    imports: [ɵInternalFormsSharedModule]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(FormsModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule,
    args: [{
      declarations: TEMPLATE_DRIVEN_DIRECTIVES,
      exports: [ɵInternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
    }]
  }], null, null);
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsetNgModuleScope"](FormsModule, {
    declarations: [NgModel, NgModelGroup, NgForm],
    exports: [ɵInternalFormsSharedModule, NgModel, NgModelGroup, NgForm]
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
class ReactiveFormsModule {
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
        useValue: opts.warnOnNgModelWithFormControl ?? 'always'
      }, {
        provide: CALL_SET_DISABLED_STATE,
        useValue: opts.callSetDisabledState ?? setDisabledStateDefault
      }]
    };
  }
  static ɵfac = function ReactiveFormsModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ReactiveFormsModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({
    type: ReactiveFormsModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({
    imports: [ɵInternalFormsSharedModule]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(ReactiveFormsModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule,
    args: [{
      declarations: [REACTIVE_DRIVEN_DIRECTIVES],
      exports: [ɵInternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
    }]
  }], null, null);
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsetNgModuleScope"](ReactiveFormsModule, {
    declarations: [FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName],
    exports: [ɵInternalFormsSharedModule, FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName]
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
 * @module
 * @description
 * This module is used for handling user input, by defining and building a `FormGroup` that
 * consists of `FormControl` objects, and mapping them onto the DOM. `FormControl`
 * objects can then be used to read information from the form DOM elements.
 *
 * Forms providers are not included in default providers; you must import these providers
 * explicitly.
 */

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
 * Entry point for all public APIs of this package.
 */
// This file only reexports content of the `src` folder. Keep it that way.

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// This file is not used to build this module. It is only used during editing
// by the TypeScript language service and during build for verification. `ngc`
// replaces this file with production index.ts when it rewrites private symbol
// names.

/**
 * Generated bundle index. Do not edit.
 */
;

//# sourceMappingURL=angular-miniprogram-forms.mjs.map

/***/ },

/***/ 241
/*!********************************************************************!*\
  !*** ../../dist/fesm2022/angular-miniprogram-platform-default.mjs ***!
  \********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ComponentFinderService: () => (/* binding */ ComponentFinderService),
/* harmony export */   MiniProgramCore: () => (/* binding */ MiniProgramCore),
/* harmony export */   MiniProgramCoreFactory: () => (/* binding */ MiniProgramCoreFactory),
/* harmony export */   MiniProgramRenderer: () => (/* binding */ MiniProgramRenderer),
/* harmony export */   MiniProgramRendererFactory: () => (/* binding */ MiniProgramRendererFactory),
/* harmony export */   PAGE_TOKEN: () => (/* binding */ PAGE_TOKEN),
/* harmony export */   propertyChange: () => (/* binding */ propertyChange)
/* harmony export */ });
/* harmony import */ var _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/@babel/runtime/helpers/asyncToGenerator.js */ 9436);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 9631);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 263);



class AgentNode {
  type;
  selector;
  name;
  parent;
  nextSibling;
  attribute = {};
  style = {};
  property = {};
  classList = new Set();
  value;
  children = [];
  listener = {};
  constructor(type) {
    this.type = type;
  }
  appendChild(child) {
    const lastChildIndex = this.children.length - 1;
    this.children.push(child);
    child.parent = this;
    if (lastChildIndex > -1) {
      this.children[lastChildIndex].nextSibling = child;
    }
  }
  setParent(parent) {
    const oldParent = this.parent;
    if (oldParent) {
      const index = oldParent.children.findIndex(item => item === this);
      if (index === -1) {
        throw new Error('没有在之前的父级上找到该节点' + this);
      }
      oldParent.children.splice(index, 1);
    }
    parent.appendChild(this);
  }
  insertBefore(newChild, refChild) {
    const refIndex = this.children.findIndex(item => item === refChild);
    if (refIndex === -1) {
      throw new Error('未找到引用子节点' + refChild);
    }
    if (refIndex === 0) {
      newChild.nextSibling = refChild;
    } else {
      this.children[refIndex - 1].nextSibling = newChild;
      newChild.nextSibling = refChild;
    }
    this.children.splice(refIndex, 0, newChild);
  }
  removeChild(child) {
    const index = this.children.findIndex(item => item === child);
    if (index === 0) {
      this.children.shift();
    } else if (index + 1 === this.children.length) {
      this.children[index - 1].nextSibling = undefined;
      this.children.pop();
    } else {
      this.children[index - 1].nextSibling = this.children[index + 1];
      this.children.splice(index, 1);
    }
    child.nextSibling = undefined;
    child.parent = undefined;
  }
  toView() {
    if (this.type === 'text') {
      return {
        value: this.value
      };
    } else {
      return {
        class: Array.from(this.classList).join(' ') + (this.attribute.class ? ' ' + this.attribute.class : ''),
        style: Object.entries(this.style).map(([style, value]) => `${style}:${value}`).join(';') + (this.attribute.style ? ';' + this.attribute.style : ''),
        property: {
          ...this.property
        }
      };
    }
  }
}
class ComponentFinderService {
  map = new Map();
  mapPromise = new Map();
  get(component) {
    var _this2 = this;
    return _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
      if (_this2.map.has(component)) {
        return _this2.map.get(component);
      }
      let fn;
      const promise = new wx.__window.Promise(res => {
        fn = res;
      });
      _this2.mapPromise.set(component, fn);
      return promise.then(result => {
        _this2.mapPromise.delete(component);
        return result;
      });
    })();
  }
  /** @internal */
  set(component, instance) {
    if (this.mapPromise.has(component)) {
      this.mapPromise.get(component)();
    }
    this.map.set(component, instance);
  }
  /** @internal */
  remove(component) {
    return this.map.delete(component);
  }
  static ɵfac = function ComponentFinderService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ComponentFinderService)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: ComponentFinderService,
    factory: ComponentFinderService.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(ComponentFinderService, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable
  }], null, null);
})();
function _arrayOrObjectItemDiff(count, prefix, fromItem, toItem, changeObject) {
  if (fromItem instanceof Array && toItem instanceof Array) {
    const result = diffDataArray(fromItem, toItem, prefix);
    if (result.allChange || result.object) {
      if (result.allChange) {
        count++;
        changeObject[prefix] = toItem;
      } else {
        changeObject = {
          ...changeObject,
          ...result.object
        };
      }
    }
    return {
      count: count,
      changeObject
    };
  } else if (typeof fromItem === 'object' && fromItem !== null && typeof toItem === 'object' && toItem !== null) {
    const result = diffDataObject(fromItem, toItem, prefix);
    if (result.allChange || result.object) {
      if (result.allChange) {
        count++;
        changeObject[prefix] = toItem;
      } else {
        changeObject = {
          ...changeObject,
          ...result.object
        };
      }
    }
    return {
      count: count,
      changeObject
    };
  } else if (fromItem !== toItem) {
    changeObject[prefix] = toItem;
    count++;
    return {
      count: count,
      changeObject
    };
  }
  return {
    count: count,
    changeObject
  };
}
function diffDataObject(from, to, prefix) {
  const toKeyList = Object.keys(to);
  let changeObject = {};
  const point = prefix ? '.' : '';
  let count = 0;
  if (Object.keys(from).length !== toKeyList.length) {
    return {
      allChange: true
    };
  }
  for (let index = 0; index < toKeyList.length; index++) {
    const key = toKeyList[index];
    const fromItem = from[key];
    const toItem = to[key];
    const currentPrefix = `${prefix}${point}${key}`;
    const result = _arrayOrObjectItemDiff(count, currentPrefix, fromItem, toItem, changeObject);
    count = result.count;
    changeObject = result.changeObject;
  }
  if (count === toKeyList.length && toKeyList.length !== 0) {
    return {
      allChange: true
    };
  }
  return {
    allChange: false,
    object: changeObject
  };
}
function diffDataArray(from, to, prefix) {
  let changeObject = {};
  if (from.length !== to.length) {
    return {
      allChange: true
    };
  }
  let count = 0;
  for (let i = 0; i < to.length; i++) {
    const fromItem = from[i];
    const toItem = to[i];
    const currentPrefix = `${prefix}[${i}]`;
    const result = _arrayOrObjectItemDiff(count, currentPrefix, fromItem, toItem, changeObject);
    count = result.count;
    changeObject = result.changeObject;
  }
  if (count === to.length && to.length !== 0) {
    return {
      allChange: true
    };
  }
  return {
    allChange: false,
    object: changeObject
  };
}
function diffNodeData(from, to) {
  const result = diffDataObject(from, to, '');
  if (result.allChange) {
    return to;
  }
  return result.object;
}

/**
 * Angular lView / LContainer 的 header 下标。
 *
 * ## 为什么需要这个模块
 *
 * 这些常量在 `@angular/core` 源码里都是 `export const`，但**既没有进公开
 * API，也没有 `ɵ` 导出**（已核对 v22 的 `core.mjs` 导出面与
 * `goldens/public-api/core/index.api.md`，均无）。我们做小程序渲染要读
 * lView 的头部结构，只能自己持有这些下标。
 *
 * ## 风险实证：它们真的会变
 *
 * 跨版本核对（`packages/core/src/render3/interfaces/view.ts`）：
 *
 *   v19.2.25   HEADER_OFFSET = 26
 *   v20.3.31   HEADER_OFFSET = 27   ← 变了
 *   v21.2.9    HEADER_OFFSET = 27
 *   v22.1.7    HEADER_OFFSET = 27
 *
 * 如果硬编码 26 然后升级到 v20，`nodeList[index - HEADER_OFFSET]` 会整体
 * 错位一位——**渲染结果错乱但不抛任何错误**，是最难查的一类 bug。
 *
 * ## 因此本模块的设计约束
 *
 * 1. 全项目只有这里定义这些下标，其他地方一律用 `LVIEW.*`，
 *    不允许再出现裸数字或本地重复常量。
 * 2. 配套 `lview-layout.spec.ts` 做两层校验：
 *    - 从**已安装的** `@angular/core` fesm 里读出实际值做比对
 *    - 运行时结构自检，确认下标指向的东西语义正确
 *    升级 Angular 后若布局变化，校验会失败并指出是哪个下标不对，
 *    而不是等到页面上出现错位才发现。
 *
 * ## 升级 Angular 时的操作
 *
 * 直接跑 `npm run test:jasmine lview-layout`。
 * 失败信息会给出「我们的值」vs「已安装 Angular 的值」，按后者更新本文件。
 */
const LVIEW = {
  /**
   * `lView[CLEANUP]`：清理回调数组（`destroy` 时逐个执行）。
   * 来源：`packages/core/src/render3/interfaces/view.ts`
   */
  CLEANUP: 7,
  /**
   * `lView[CONTEXT]`：组件实例 / 模板上下文。
   *
   * 注意 Angular 里就叫 `CONTEXT`，本项目历史上叫 `LVIEW_CONTEXT`，
   * 是同一个东西（值都是 8）。
   * 来源：`packages/core/src/render3/interfaces/view.ts`
   */
  CONTEXT: 8,
  /**
   * `lView[INJECTOR]`：该视图的 NodeInjector。
   * 来源：`packages/core/src/render3/interfaces/view.ts`
   */
  INJECTOR: 9,
  /**
   * 第一个用户节点在 lView 里的起始下标。
   *
   * ⚠️ 这个值变过（v19=26 → v20=27），是本模块存在的主要原因。
   * 来源：`packages/core/src/render3/interfaces/view.ts`
   */
  HEADER_OFFSET: 27,
  /**
   * `LContainer[VIEW_REFS]`：容器内嵌入视图的 ComponentRef 数组。
   *
   * 注意这是 **LContainer** 的下标，不是 LView 的。
   * 与 `LVIEW.CONTEXT`（也是 8）数值相同但语义无关，别混用。
   * 来源：`packages/core/src/render3/interfaces/container.ts`
   */
  CONTAINER_VIEW_REFS: 8
};

// 这些下标统一由 util/lview-layout 提供（单一真源），
// 不在本文件重复定义——它们会随 Angular 版本变化，
// 集中一处才配得上配套的交叉校验。
//
// 历史上本文件曾 re-export LVIEW_CONTEXT / INJECTOR 两个裸常量，
// 现已收归 LVIEW.CONTEXT / LVIEW.INJECTOR。
const linkMap = new Map();
const nodePathMap = new Map();
let index = 0;
const pageRegistryMap = new Map();
const lViewLastDataMap = new Map();
let waitingRefreshLViewList = [];
/** @internal */
function propertyChange(lView) {
  if (linkMap.has(lView)) {
    waitingRefreshLViewList.push(() => {
      const instance = linkMap.get(lView);
      if (!instance) {
        return;
      }
      const currentData = getPageRefreshContext(lView);
      const diffData = getDiffData(lView, currentData);
      if (Object.keys(diffData).length) {
        instance.setData(diffData);
      }
    });
  }
}
function endRender() {
  for (const fn of waitingRefreshLViewList) {
    fn();
  }
  waitingRefreshLViewList = [];
}
function getPageRefreshContext(lView) {
  const lviewPath = getLViewPath(lView);
  const nodeList = lViewToWXView(lView, lviewPath);
  const ctx = {
    nodeList: nodeList,
    nodePath: lviewPath || [],
    hasLoad: true
  };
  return ctx;
}
function lViewToWXView(lView, parentNodePath = []) {
  const tView = lView[1];
  const end = tView.bindingStartIndex;
  const nodeList = [];
  for (let index = LVIEW.HEADER_OFFSET; index < end; index++) {
    const item = lView[index];
    if (item instanceof AgentNode) {
      nodeList[index - LVIEW.HEADER_OFFSET] = item.toView();
    } else if (item && item[1] === true) {
      const lContainerList = [];
      const viewRefList = item[LVIEW.CONTAINER_VIEW_REFS] || [];
      viewRefList.forEach((item, itemIndex) => {
        const nodePath = [...parentNodePath, 'directive', index - LVIEW.HEADER_OFFSET, itemIndex];
        lContainerList.push({
          __templateName: item._lView[LVIEW.CONTEXT] ? item._lView[LVIEW.CONTEXT].__templateName : undefined,
          nodeList: lViewToWXView(item._lView, nodePath),
          nodePath: nodePath,
          index: lContainerList.length
        });
      });
      nodeList[index - LVIEW.HEADER_OFFSET] = lContainerList;
    } else {
      // todo
      nodeList[index - LVIEW.HEADER_OFFSET] = {};
    }
  }
  return nodeList;
}
function setLViewPath(lView, nodePath) {
  nodePath = nodePath.slice();
  nodePathMap.set(lView, nodePath);
}
function getLViewPath(lView) {
  return nodePathMap.get(lView);
}
function updatePath(context, nodePath) {
  nodePath = nodePath.slice();
  context.nodePath = nodePath;
  const list = [...context.nodeList];
  while (list.length) {
    const item = list.pop();
    if (item instanceof Array) {
      list.push(...item);
    }
    if (item.nodeList && item.nodeList.length) {
      list.push(...item.nodeList);
    }
    if (item.nodePath) {
      item.nodePath.unshift(...nodePath);
    }
  }
  return context;
}
function resolveNodePath(list) {
  list = list.slice();
  let lView = pageRegistryMap.get(list.shift());
  while (list.length) {
    const item = list.shift();
    if (item === 'directive') {
      const index = list.shift();
      const lContainer = lView[index + LVIEW.HEADER_OFFSET];
      const child = list.shift();
      const viewRef = lContainer[LVIEW.CONTAINER_VIEW_REFS][child];
      lView = viewRef['_lView'];
    } else {
      lView = lView[LVIEW.HEADER_OFFSET + item];
    }
  }
  return lView;
}
function findCurrentElement(lView, list = []) {
  list = [...list];
  while (list.length) {
    const item = list.shift();
    if (item === 'directive') {
      const index = list.shift();
      const lContainer = lView[index + LVIEW.HEADER_OFFSET];
      const child = list.shift();
      const viewRef = lContainer[LVIEW.CONTAINER_VIEW_REFS][child];
      lView = viewRef['_lView'];
    } else {
      lView = lView[item + LVIEW.HEADER_OFFSET];
    }
  }
  return lView;
}
function lViewLinkToMPComponentRef(ref, lView) {
  linkMap.set(lView, ref);
}
function cleanWhenDestroy(lView, fn) {
  const list = lView[LVIEW.CLEANUP] = lView[LVIEW.CLEANUP] || [];
  list.push(() => cleanAll(lView));
  list.push(fn);
}
function cleanAll(lView) {
  linkMap.delete(lView);
  nodePathMap.delete(lView);
  lViewLastDataMap.delete(lView);
}
function findPageLView(componentRef) {
  const lView = componentRef._rootLView[LVIEW.HEADER_OFFSET];
  index++;
  pageRegistryMap.set(index, lView);
  return {
    lView: lView,
    id: index
  };
}
function removePageLViewLink(id) {
  const lView = pageRegistryMap.get(id);
  lViewLastDataMap.delete(lView);
  pageRegistryMap.delete(id);
}
function getDiffData(lView, currentData) {
  const lastData = lViewLastDataMap.get(lView);
  if (!lastData) {
    lViewLastDataMap.set(lView, currentData);
    return currentData;
  }
  const diff = diffNodeData(lastData, currentData);
  lViewLastDataMap.set(lView, currentData);
  return diff;
}

/// <reference types="miniprogram-api-typings"/>
class MiniProgramCoreFactory {
  MINIPROGRAM_GLOBAL = wx;
  loadApp = app => {
    App(app || {});
    const appInstance = getApp();
    appInstance.__ngStartPagePromise = new wx.__window.Promise(resolve => {
      appInstance.__ngStartPageResolve = resolve;
    });
    return appInstance;
  };
  eventPrefixList = [{
    listener: 'bind',
    prefix: 'bind'
  }, {
    listener: 'catch',
    prefix: 'catch'
  }, {
    listener: 'mutBind',
    prefix: 'mut-bind'
  }, {
    listener: 'captureBind',
    prefix: 'capture-bind'
  }, {
    listener: 'captureCatch',
    prefix: 'capture-catch'
  }];
  getListenerEventMapping(prefix, name) {
    return [name, prefix + name];
  }
  linkNgComponentWithPath(mpComponentInstance, list) {
    mpComponentInstance.__isLink = true;
    const lView = resolveNodePath(list);
    const injector = lView[LVIEW.INJECTOR];
    mpComponentInstance.__lView = lView;
    mpComponentInstance.__ngComponentInstance = lView[LVIEW.CONTEXT];
    mpComponentInstance.__ngComponentInjector = injector;
    const scheduler = injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ChangeDetectionScheduler);
    mpComponentInstance.__ngChangeDetectionScheduler = scheduler;
    const componentFinderService = injector.get(ComponentFinderService);
    componentFinderService.set(mpComponentInstance.__ngComponentInstance, mpComponentInstance);
    cleanWhenDestroy(lView, () => {
      componentFinderService.remove(mpComponentInstance.__ngComponentInstance);
    });
    setLViewPath(lView, list);
    lViewLinkToMPComponentRef(mpComponentInstance, lView);
    mpComponentInstance.__waitLinkResolve();
    const initValue = getPageRefreshContext(lView);
    const diffData = getDiffData(lView, initValue);
    if (Object.keys(diffData).length) {
      mpComponentInstance.setData(diffData);
    }
  }
  /** 监听事件 */
  listenerEvent() {
    const _this = this;
    return this.eventPrefixList.reduce((pre, cur) => {
      pre[cur.listener + 'Event'] = function (event) {
        if (this.__lView) {
          const dataset = event.currentTarget?.dataset || event.target.dataset;
          const currentPath = [...(dataset.nodePath || []), dataset.nodeIndex];
          const nodePath = this.__completePath || [];
          const relativePath = currentPath.slice(nodePath.length);
          let el = findCurrentElement(this.__lView, relativePath);
          if (!(el instanceof AgentNode)) {
            el = el[0];
            if (!(el instanceof AgentNode)) {
              throw new Error('查询代理节点失败');
            }
          }
          const eventName = event.type;
          _this.getListenerEventMapping(cur.prefix, eventName).forEach(name => {
            try {
              if (el.listener[name]) {
                el.listener[name](event);
              }
            } finally {
              // zoneless：回调可能修改了应用状态，显式调度一次变更检测
              this.__ngChangeDetectionScheduler?.notify(5 /* NotificationSource.Listener */);
            }
          });
        } else {
          throw new Error('未绑定lView');
        }
      };
      return pre;
    }, {});
  }
  pageStatus = {
    destroy: function () {
      if (this.__ngDestroy) {
        this.__ngDestroy();
      }
    },
    attachView: function () {
      if (this.__ngComponentInjector && this.__isDetachView) {
        const applicationRef = this.__ngComponentInjector.get(_angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationRef);
        applicationRef.attachView(this.__ngComponentHostView);
        this.__isDetachView = false;
      }
    },
    detachView: function () {
      if (this.__ngComponentInjector) {
        this.__isDetachView = true;
        const applicationRef = this.__ngComponentInjector.get(_angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationRef);
        applicationRef.detachView(this.__ngComponentHostView);
      }
    }
  };
  linkNgComponentWithPage(mpComponentInstance, componentRef, /** standalone 页面没有 NgModule */
  ngModuleRef) {
    mpComponentInstance.__isLink = true;
    mpComponentInstance.__ngComponentHostView = componentRef.hostView;
    mpComponentInstance.__ngComponentInstance = componentRef.instance;
    mpComponentInstance.__ngComponentInjector = componentRef.injector;
    const scheduler = componentRef.injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ChangeDetectionScheduler);
    mpComponentInstance.__ngChangeDetectionScheduler = scheduler;
    const {
      lView,
      id
    } = findPageLView(componentRef);
    setLViewPath(lView, [id]);
    mpComponentInstance.__completePath = [id];
    const initValue = getPageRefreshContext(lView);
    const diffData = getDiffData(lView, initValue);
    if (Object.keys(diffData).length) {
      mpComponentInstance.setData(diffData);
    }
    lViewLinkToMPComponentRef(mpComponentInstance, lView);
    mpComponentInstance.__lView = lView;
    mpComponentInstance.__ngDestroy = () => {
      ngModuleRef?.destroy();
      componentRef.destroy();
      removePageLViewLink(id);
      cleanAll(lView);
    };
  }
  /**
   * 页面启动的公共实现。
   *
   * @param component 页面组件
   * @param startPage 真正创建组件的方式（standalone / NgModule）
   */
  createPageBootstrap = (component, startPage, pageOptions) => {
    const _this = this;
    if (pageOptions?.useComponent) {
      const options = this.getComponentOptions(component) || {};
      const config = {
        ...options,
        data: {
          hasLoad: false
        },
        options: {
          ...options?.options,
          multipleSlots: true
        },
        methods: {
          ...options.methods,
          ...this.listenerEvent(),
          onHide: function () {
            var _onHide = _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
              if (options.methods?.onHide) {
                yield options.methods.onHide.bind(this)();
              }
              _this.pageStatus.detachView.bind(this)();
            });
            function onHide() {
              return _onHide.apply(this, arguments);
            }
            return onHide;
          }(),
          onUnload: function () {
            var _onUnload = _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
              if (options.methods?.onUnload) {
                yield options.methods.onUnload.bind(this)();
              }
              _this.pageStatus.destroy.bind(this)();
            });
            function onUnload() {
              return _onUnload.apply(this, arguments);
            }
            return onUnload;
          }(),
          onShow: function () {
            var _onShow = _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
              if (options.methods?.onShow) {
                yield options.methods.onShow.bind(this)();
              }
              return _this.pageStatus.attachView.bind(this)();
            });
            function onShow() {
              return _onShow.apply(this, arguments);
            }
            return onShow;
          }()
        }
      };
      config.lifetimes = config.lifetimes || {};
      const oldCreated = config.lifetimes.created;
      let componentRef, ngModuleRef;
      config.lifetimes.created = function () {
        const app = getApp();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.__lifeTimePromiseObject = {};
        return this.__lifeTimePromiseObject['created'] = app.__ngStartPagePromise.then(() => {
          const result = startPage(this);
          componentRef = result.componentRef;
          ngModuleRef = result.ngModuleRef;
          if (oldCreated) {
            oldCreated.bind(this)();
          }
        });
      };
      const oldAttached = config.lifetimes.attached;
      config.lifetimes.attached = function () {
        return this.__lifeTimePromiseObject['created'].then(() => {
          _this.linkNgComponentWithPage(this, componentRef, ngModuleRef);
          if (oldAttached) {
            oldAttached.bind(this)();
          }
        });
      };
      return Component(config);
    }
    const options = this.getPageOptions(component) || {};
    return Page({
      ...options,
      ...this.listenerEvent(),
      data: {
        hasLoad: false
      },
      onHide: function () {
        var _onHide2 = _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
          if (options.onHide) {
            yield options.onHide.bind(this)();
          }
          _this.pageStatus.detachView.bind(this)();
        });
        function onHide() {
          return _onHide2.apply(this, arguments);
        }
        return onHide;
      }(),
      onUnload: function () {
        var _onUnload2 = _workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
          if (options.onUnload) {
            yield options.onUnload.bind(this)();
          }
          _this.pageStatus.destroy.bind(this)();
        });
        function onUnload() {
          return _onUnload2.apply(this, arguments);
        }
        return onUnload;
      }(),
      onLoad: function (query) {
        const app = getApp();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.__lifeTimePromiseObject = {};
        return this.__lifeTimePromiseObject['onLoad'] = app.__ngStartPagePromise.then(() => {
          const {
            componentRef,
            ngModuleRef
          } = startPage(this);
          _this.linkNgComponentWithPage(this, componentRef, ngModuleRef);
          if (options.onLoad) {
            return options.onLoad.bind(this)(query);
          }
        });
      },
      onShow: function () {
        var _this3 = this;
        return this.__lifeTimePromiseObject['onShow'] = this.__lifeTimePromiseObject['onLoad'].then(/*#__PURE__*/_workspace_miniprogram_angular_miniprogram_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__(function* () {
          if (options.onShow) {
            yield options.onShow.bind(_this3)();
          }
          return _this.pageStatus.attachView.bind(_this3)();
        }));
      },
      onReady: function () {
        return this.__lifeTimePromiseObject.onShow.then(() => {
          if (options.onReady) {
            return options.onReady.bind(this)();
          }
        });
      }
    });
  };
  /**
   * 启动一个 standalone 组件作为小程序页面，不需要 NgModule。
   *
   * ```ts
   * // foo.entry.ts
   * import { bootstrapPage } from 'angular-miniprogram';
   * import { FooComponent } from './foo.component';
   * bootstrapPage(FooComponent);
   * ```
   */
  bootstrapPage = (component, pageOptions) => {
    return this.createPageBootstrap(component, instance => getApp().__ngStartPage(component, instance), pageOptions);
  };
  /**
   * @deprecated 请改用 `bootstrapPage(StandaloneComponent)`，
   * 页面组件直接用 `standalone: true`，不再需要 NgModule。
   */
  pageStartup = (module, component, pageOptions) => {
    return this.createPageBootstrap(component, instance => getApp().__ngStartPageWithModule(module, component, instance), pageOptions);
  };
  addNgComponentLinkLogic(config) {
    config.lifetimes = config.lifetimes || {};
    const oldCreate = config.lifetimes.created;
    config.lifetimes.created = function () {
      this.__waitLinkPromise = new wx.__window.Promise(resolve => {
        this.__waitLinkResolve = resolve;
      });
      if (oldCreate) {
        oldCreate.bind(this)();
      }
    };
    const _this = this;
    config.properties = {
      nodePath: {
        type: null,
        observer: function (list) {
          if (this.__isLink) {
            return;
          }
          if (typeof list === 'string') {
            list = JSON.parse(list);
          }
          this.__nodePath = list || [];
          if (typeof this.__nodeIndex !== 'undefined') {
            this.__completePath = [...this.__nodePath, this.__nodeIndex];
            _this.linkNgComponentWithPath(this, this.__completePath);
          }
        }
      },
      nodeIndex: {
        type: null,
        observer: function (index) {
          if (this.__isLink) {
            return;
          }
          if (typeof index === 'string') {
            index = parseInt(index, 10);
          }
          this.__nodeIndex = index;
          if (typeof this.__nodePath !== 'undefined') {
            this.__completePath = [...this.__nodePath, this.__nodeIndex];
            _this.linkNgComponentWithPath(this, this.__completePath);
          }
        }
      }
    };
    return config;
  }
  componentRegistry = component => {
    const options = this.getComponentOptions(component) || {};
    let config = {
      ...options,
      data: {
        hasLoad: false
      },
      options: {
        ...options?.options,
        multipleSlots: true
      },
      methods: {
        ...this.listenerEvent()
      }
    };
    config = this.addNgComponentLinkLogic(config);
    return Component(config);
  };
  getPageOptions(component) {
    return component.mpPageOptions;
  }
  getComponentOptions(component) {
    return component.mpComponentOptions;
  }
}
const MiniProgramCore = new MiniProgramCoreFactory();
const PAGE_TOKEN = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.InjectionToken('PAGE_TOKEN');
class MiniProgramRenderer {
  root;
  constructor() {}
  data = Object.create(null);
  destroy() {}
  createElement(name, namespace) {
    const element = new AgentNode('element');
    element.name = name;
    element.classList.add(`tag-name-${name}`);
    return element;
  }
  createComment(value) {
    const comment = new AgentNode('comment');
    comment.value = value;
    return comment;
  }
  createText(value) {
    const text = new AgentNode('text');
    text.value = value;
    return text;
  }
  destroyNode() {}
  appendChild(parent, newChild) {
    parent.appendChild(newChild);
  }
  insertBefore(parent, newChild, refChild, isMove) {
    if (isMove) {
      // todo 应该没用
    }
    if (parent) {
      parent.insertBefore(newChild, refChild);
    }
  }
  removeChild(parent, oldChild, isHostElement) {
    if (isHostElement) {
      // todo 应该没用
    }
    if (parent) {
      parent.removeChild(oldChild);
    }
  }
  selectRootElement(selectorOrNode, preserveContent) {
    const root = new AgentNode('element');
    root.selector = selectorOrNode;
    this.root = root;
    return root;
  }
  parentNode(node) {
    return node.parent;
  }
  nextSibling(node) {
    return node.nextSibling;
  }
  setAttribute(el, name, value, namespace) {
    el.attribute[name] = value;
  }
  removeAttribute(el, name, namespace) {
    delete el.attribute[name];
  }
  addClass(el, name) {
    el.classList.add(name);
  }
  removeClass(el, name) {
    el.classList.delete(name);
  }
  setStyle(el, style, value, flags) {
    el.style[style] = value;
  }
  removeStyle(el, style, flags) {
    delete el.style[style];
  }
  setProperty(el, name, value) {
    el.property[name] = value;
  }
  setValue(node, value) {
    node.value = value;
  }
  listen(target, eventName, callback) {
    if (!(target instanceof AgentNode)) {
      throw new Error('不支持其他类型监听');
    }
    target.listener[eventName] = callback;
    return () => {};
  }
}
class MiniProgramRendererFactory {
  defaultRenderer;
  constructor() {
    this.defaultRenderer = new MiniProgramRenderer();
  }
  createRenderer(element, type) {
    return this.defaultRenderer;
  }
  begin() {}
  end() {
    endRender();
  }
  static ɵfac = function MiniProgramRendererFactory_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MiniProgramRendererFactory)();
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
    token: MiniProgramRendererFactory,
    factory: MiniProgramRendererFactory.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__.setClassMetadata(MiniProgramRendererFactory, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_2__.Injectable
  }], () => [], null);
})();

/**
 * Generated bundle index. Do not edit.
 */
;

//# sourceMappingURL=angular-miniprogram-platform-default.mjs.map

/***/ },

/***/ 1403
/*!***************************************************!*\
  !*** ../../dist/fesm2022/angular-miniprogram.mjs ***!
  \***************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APP_TOKEN: () => (/* binding */ APP_TOKEN),
/* harmony export */   ComponentFinderService: () => (/* reexport safe */ angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.ComponentFinderService),
/* harmony export */   DOWNLOAD_FILE_TOKEN: () => (/* binding */ DOWNLOAD_FILE_TOKEN),
/* harmony export */   HttpClientModule: () => (/* binding */ HttpClientModule),
/* harmony export */   MINIPROGRAM_GLOBAL_TOKEN: () => (/* binding */ MINIPROGRAM_GLOBAL_TOKEN),
/* harmony export */   MiniProgramHttpDownloadResponse: () => (/* binding */ MiniProgramHttpDownloadResponse),
/* harmony export */   MiniProgramHttpResponse: () => (/* binding */ MiniProgramHttpResponse),
/* harmony export */   MiniProgramModule: () => (/* binding */ MiniProgramModule),
/* harmony export */   MiniprogramHttpBackend: () => (/* binding */ MiniprogramHttpBackend),
/* harmony export */   PAGE_TOKEN: () => (/* reexport safe */ angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.PAGE_TOKEN),
/* harmony export */   REQUSET_TOKEN: () => (/* binding */ REQUSET_TOKEN),
/* harmony export */   UPLOAD_FILE_TOKEN: () => (/* binding */ UPLOAD_FILE_TOKEN),
/* harmony export */   bootstrapPage: () => (/* binding */ bootstrapPage),
/* harmony export */   componentRegistry: () => (/* binding */ componentRegistry),
/* harmony export */   pageStartup: () => (/* binding */ pageStartup),
/* harmony export */   platformMiniProgram: () => (/* binding */ platformMiniProgram),
/* harmony export */   propertyChange: () => (/* reexport safe */ angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.propertyChange),
/* harmony export */   provideHttpClient: () => (/* binding */ provideHttpClient)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 9631);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 263);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 9733);
/* harmony import */ var angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! angular-miniprogram/platform/wx */ 241);
/* harmony import */ var angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! angular-miniprogram/common/http */ 5596);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 9904);
/* harmony import */ var angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! angular-miniprogram/common */ 9859);








/**
 * 小程序环境下的 Document 占位物。
 *
 * ## 为什么需要
 *
 * Angular 22 起（commit cdda51a3b2 "support bootstrapping Angular
 * applications underneath shadow roots"），`createComponentRef` 会
 * **无条件**调用 `getStyleHost()`：
 *
 * ```ts
 * const styleHost = getStyleHost(
 *   hostElement,
 *   () => rootViewInjector.get(DOCUMENT, null) ?? getDocument(),
 * );
 * ```
 *
 * 而 `getStyleHost` 的分支是：
 *
 * ```ts
 * const rootNode = node.getRootNode?.();
 * if (documentSupported && rootNode instanceof Document) return rootNode.head; // 不调 doc()
 * else if (!rootNode)                          return doc().head;  // ← 小程序走这条
 * else if (shadowRootSupported && …)           return rootNode;    // 不调 doc()
 * else                                         return doc().head;  // 或这条
 * ```
 *
 * 小程序里宿主是 `AgentNode`，既不是 `Document` 也不是 `ShadowRoot`，
 * `getRootNode()` 拿不到真根节点，必然落到需要真 `Document` 的分支，
 * 于是 `getDocument()` 抛 NG0210：
 *
 *   "The document object is not available in this context.
 *    Make sure the DOCUMENT injection token is provided."
 *
 * 注意 ng17~ng21 都没有这段代码，所以这个报错是 21→22 升级带进来的，
 * 不是配置改动导致的。
 *
 * ## 为什么占位物可以这么空
 *
 * `getStyleHost` 的返回值只喂给 `sharedStylesHost.addHost(styleHost)`，
 * 而 `SHARED_STYLES_HOST` 本项目并未提供（组件样式走 wxml/wxss，
 * 不用 DOM 注入），所以 `sharedStylesHost` 为 null，返回值直接被丢弃。
 *
 * 唯一硬要求是 `doc().head` 这个属性访问不能抛，所以给个 `head` 占位。
 *
 * ## 为什么用 ɵsetDocument 而不是只 provider DOCUMENT
 *
 * `getDocument()` 的实现是：
 *
 * ```ts
 * if (DOCUMENT !== undefined) return DOCUMENT;
 * else if (typeof document !== 'undefined') return document;
 * throw new RuntimeError(MISSING_DOCUMENT, ...);
 * ```
 *
 * `ɵsetDocument` 设的是这个**模块级** DOCUMENT，因此覆盖所有调用点，
 * 不只是 injector 那一条路。两者都上，避免哪天又冒出个直接调
 * `getDocument()` 的新代码路径。
 */
const MINI_PROGRAM_FAKE_DOCUMENT = {
  head: {}
};
/**
 * 在平台初始化时调用，把 Angular 的 document 指向占位物。
 *
 * 必须在任何组件创建之前执行（platform 建立阶段即可）。
 */
function installFakeDocument() {
  (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.setDocument)(MINI_PROGRAM_FAKE_DOCUMENT);
}
/**
 * 作为 provider 用，覆盖 `rootViewInjector.get(DOCUMENT, null)` 那条路。
 */
const FAKE_DOCUMENT_PROVIDER = {
  provide: _angular_core__WEBPACK_IMPORTED_MODULE_0__.DOCUMENT,
  useValue: MINI_PROGRAM_FAKE_DOCUMENT
};
/**
 * 模块加载即安装。
 *
 * 只靠 platformMiniProgram() 里调用是不够的：那条路依赖调用方在
 * page bootstrap 之前正确建立了 platform。一旦调用方的 main.ts 走了
 * 别的引导方式、或者用的是旧产物，就会漏装，微信里直接 NG0210。
 *
 * 放在模块顶层，只要有人 import 到本模块（platform 的 index 会带进来），
 * 就立刻装好——早于任何 createComponent 的可能时机。
 * installFakeDocument() 是幂等的（重复 setDocument 同一个对象），
 * 所以顶层调一次 + platformMiniProgram 再调一次没有副作用。
 */
installFakeDocument();
class MiniProgramHttpResponse extends angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpResponse {
  /**
   * 开发者服务器返回的 cookies，格式为字符串数组
   */
  cookies;
  /**
   * 网络请求过程中一些调试信息，[查看详细说明](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/network.html)
   */
  profile;
  /**
   * Construct a new `WxHttpResponse`.
   */
  constructor(init = {}) {
    super(init);
    this.cookies = init.cookies ?? null;
    this.profile = init.profile ?? null;
  }
  clone(update = {}) {
    return new MiniProgramHttpResponse({
      body: update.body !== undefined ? update.body : this.body,
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined,
      cookies: update.cookies || this.cookies || undefined,
      profile: update.profile || this.profile || undefined
    });
  }
}
class MiniProgramHttpDownloadResponse extends angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpResponse {
  /** 用户文件路径 (本地路径)。传入 filePath 时会返回，跟传入的 filePath 一致 */
  filePath;
  /** 临时文件路径 (本地路径)。没传入 filePath 指定文件存储路径时会返回，下载后的文件会存储到一个临时文件 */
  tempFilePath;
  /**
   * 网络请求过程中一些调试信息，[查看详细说明](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/network.html)
   */
  profile;
  /**
   * Construct a new `WxHttpDownloadResponse`.
   */
  constructor(init = {}) {
    super(init);
    this.filePath = init.filePath ?? null;
    this.tempFilePath = init.tempFilePath ?? null;
    this.profile = init.profile ?? null;
  }
  clone(update = {}) {
    return new MiniProgramHttpDownloadResponse({
      body: update.body !== undefined ? update.body : this.body,
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined,
      filePath: update.filePath || this.filePath || undefined,
      tempFilePath: update.tempFilePath || this.tempFilePath || undefined,
      profile: update.profile || this.profile || undefined
    });
  }
}

/** Use this token to pass additional `wx.uploadFile()` parameter */
const UPLOAD_FILE_TOKEN = new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpContextToken(() => ({}));
/** Use this token to pass additional `wx.downloadFile()` parameter */
const DOWNLOAD_FILE_TOKEN = new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpContextToken(() => ({}));
/** Use this token to pass additional `wx.request()` parameter */
const REQUSET_TOKEN = new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpContextToken(() => ({}));
class MiniprogramHttpBackend {
  changeDetectionScheduler;
  constructor(changeDetectionScheduler) {
    this.changeDetectionScheduler = changeDetectionScheduler;
  }
  /**
   * 小程序回调里执行 Angular 逻辑，并在结束后调度一次变更检测。
   * 取代原来依赖 zone.js 的 `Zone.current.run(...)`。
   */
  runInAngular(fn) {
    try {
      fn();
    } finally {
      this.changeDetectionScheduler.notify(5 /* NotificationSource.Listener */);
    }
  }
  handle(request) {
    if (request.method === 'POST' && request.context.has(UPLOAD_FILE_TOKEN)) {
      return this.upload(request);
    }
    if (request.method === 'GET' && request.context.has(DOWNLOAD_FILE_TOKEN)) {
      return this.download(request);
    }
    return this.request(request);
  }
  /**
   * wx upload file
   * @param request
   */
  upload(request) {
    return new rxjs__WEBPACK_IMPORTED_MODULE_5__.Observable(observer => {
      // The response header event handler
      const onHeadersReceived = ({
        header
      }) => {
        this.runInAngular(() => {
          observer.next(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpHeaderResponse({
            url: request.url,
            headers: new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpHeaders(header)
          }));
        });
      };
      // The upload progress event handler
      const onUpProgressUpdate = ({
        totalBytesSent,
        totalBytesExpectedToSend
      }) => {
        this.runInAngular(() => {
          observer.next({
            type: angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpEventType.UploadProgress,
            loaded: totalBytesSent,
            total: totalBytesExpectedToSend
          });
        });
      };
      const {
        filePath,
        name,
        timeout
      } = request.context.get(UPLOAD_FILE_TOKEN);
      const task = angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramCore.MINIPROGRAM_GLOBAL.uploadFile({
        url: request.urlWithParams,
        filePath: filePath,
        name: name,
        header: this.buildHeaders(request),
        formData: request.body,
        timeout: timeout,
        success: ({
          data,
          statusCode: status,
          errMsg: statusText
        }) => {
          this.runInAngular(() => {
            let ok = status >= 200 && status < 300;
            let body = null;
            if (request.responseType === 'json' && typeof data === 'string' && data !== '') {
              try {
                body = JSON.parse(data);
              } catch (error) {
                if (ok) {
                  ok = false;
                  body = {
                    error,
                    text: body
                  };
                }
              }
            }
            if (ok) {
              observer.next(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpResponse({
                url: request.url,
                body,
                status,
                statusText
              }));
              observer.complete();
            } else {
              observer.error(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpErrorResponse({
                url: request.url,
                error: body,
                status,
                statusText
              }));
            }
          });
        },
        fail: ({
          errMsg
        }) => {
          this.runInAngular(() => {
            observer.error(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpErrorResponse({
              url: request.url,
              statusText: errMsg
            }));
          });
        }
      });
      observer.next({
        type: angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpEventType.Sent
      });
      if (request.reportProgress) {
        task.onHeadersReceived(onHeadersReceived);
        task.onProgressUpdate(onUpProgressUpdate);
      }
      return () => {
        if (request.reportProgress) {
          task.offHeadersReceived(onHeadersReceived);
          task.offProgressUpdate(onUpProgressUpdate);
        }
        task.abort();
      };
    });
  }
  /**
   * wx download file
   * @param request
   */
  download(request) {
    return new rxjs__WEBPACK_IMPORTED_MODULE_5__.Observable(observer => {
      // The response header event handler
      const onHeadersReceived = ({
        header
      }) => {
        this.runInAngular(() => {
          observer.next(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpHeaderResponse({
            url: request.url,
            headers: new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpHeaders(header)
          }));
        });
      };
      // The download progress event handler
      const onDownProgressUpdate = ({
        totalBytesWritten,
        totalBytesExpectedToWrite
      }) => {
        this.runInAngular(() => {
          observer.next({
            type: angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpEventType.DownloadProgress,
            loaded: totalBytesWritten,
            total: totalBytesExpectedToWrite
          });
        });
      };
      const {
        filePath,
        timeout
      } = request.context.get(DOWNLOAD_FILE_TOKEN);
      const task = angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramCore.MINIPROGRAM_GLOBAL.downloadFile({
        url: request.urlWithParams,
        filePath: filePath,
        header: this.buildHeaders(request),
        timeout: timeout,
        success: ({
          statusCode: status,
          errMsg: statusText,
          filePath,
          tempFilePath,
          profile
        }) => {
          this.runInAngular(() => {
            const ok = status >= 200 && status < 300;
            if (ok) {
              observer.next(new MiniProgramHttpDownloadResponse({
                url: request.url,
                status,
                statusText,
                filePath,
                tempFilePath,
                profile
              }));
              observer.complete();
            } else {
              observer.error(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpErrorResponse({
                url: request.url,
                status,
                statusText
              }));
            }
          });
        },
        fail: ({
          errMsg
        }) => {
          this.runInAngular(() => {
            observer.error(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpErrorResponse({
              url: request.url,
              statusText: errMsg
            }));
          });
        }
      });
      observer.next({
        type: angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpEventType.Sent
      });
      if (request.reportProgress) {
        task.onHeadersReceived(onHeadersReceived);
        task.onProgressUpdate(onDownProgressUpdate);
      }
      return () => {
        if (request.reportProgress) {
          task.offHeadersReceived(onHeadersReceived);
          task.offProgressUpdate(onDownProgressUpdate);
        }
        task.abort();
      };
    });
  }
  /**
   * wx http request
   * @param request
   */
  request(request) {
    if (['PATCH', 'JSONP'].includes(request.method)) {
      throw Error('WeChat MiniProgram does not support http method as ' + request.method);
    }
    return new rxjs__WEBPACK_IMPORTED_MODULE_5__.Observable(observer => {
      // The response header event handler
      const onHeadersReceived = ({
        header
      }) => {
        this.runInAngular(() => {
          observer.next(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpHeaderResponse({
            url: request.url,
            headers: new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpHeaders(header)
          }));
        });
      };
      const task = angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramCore.MINIPROGRAM_GLOBAL.request({
        url: request.urlWithParams,
        method: request.method,
        data: request.body,
        header: this.buildHeaders(request),
        // wx 从 responseType 中拆分出 dataType，这里需要处理一下
        responseType: request.responseType === 'arraybuffer' ? request.responseType : 'text',
        dataType: request.responseType === 'json' ? request.responseType : '其他',
        success: ({
          data,
          header,
          statusCode: status,
          errMsg: statusText,
          cookies,
          profile
        }) => {
          this.runInAngular(() => {
            const ok = status >= 200 && status < 300;
            const headers = new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpHeaders(header);
            if (ok) {
              observer.next(new MiniProgramHttpResponse({
                url: request.url,
                body: data,
                status,
                statusText,
                headers,
                cookies,
                profile
              }));
              observer.complete();
            } else {
              observer.error(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpErrorResponse({
                url: request.url,
                error: data,
                status,
                statusText,
                headers
              }));
            }
          });
        },
        fail: ({
          errMsg
        }) => {
          this.runInAngular(() => {
            observer.error(new angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpErrorResponse({
              url: request.url,
              statusText: errMsg
            }));
          });
        },
        ...request.context.get(REQUSET_TOKEN)
      });
      observer.next({
        type: angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpEventType.Sent
      });
      if (request.reportProgress) {
        task.onHeadersReceived(onHeadersReceived);
      }
      return () => {
        if (request.reportProgress) {
          task.offHeadersReceived(onHeadersReceived);
        }
        task.abort();
      };
    });
  }
  buildHeaders(request) {
    return request.headers.keys().reduce((headers, name) => {
      headers[name] = request.headers.getAll(name).join(',');
      return headers;
    }, {});
  }
}
function provideHttpClient(...features) {
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.makeEnvironmentProviders)([(0,angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.provideHttpClient)(...features), MiniprogramHttpBackend, {
    provide: angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpBackend,
    useExisting: MiniprogramHttpBackend
  }]);
}
class HttpClientModule {
  static ɵfac = function HttpClientModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HttpClientModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({
    type: HttpClientModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({
    providers: [provideHttpClient((0,angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.withInterceptorsFromDi)())]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__.setClassMetadata(HttpClientModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.NgModule,
    args: [{
      providers: [provideHttpClient((0,angular_miniprogram_common_http__WEBPACK_IMPORTED_MODULE_4__.withInterceptorsFromDi)())]
    }]
  }], null, null);
})();
const APP_TOKEN = new _angular_core__WEBPACK_IMPORTED_MODULE_0__.InjectionToken('APP_TOKEN');
const MINIPROGRAM_GLOBAL_TOKEN = new _angular_core__WEBPACK_IMPORTED_MODULE_0__.InjectionToken('MINIPROGRAM_GLOBAL_TOKEN');

/**
 * zoneless 变更检测辅助方法。
 *
 * 迁移前：所有由小程序侧（事件回调、http 回调、启动流程）进入 Angular 的代码
 * 都必须包在 `NgZone.run()` 里，由 zone.js 负责触发变更检测。
 *
 * 迁移后：不再依赖 zone.js，回调执行完毕后显式通知
 * `ChangeDetectionScheduler`，由调度器安排一次 tick。
 */
/** 通知调度器需要跑一次变更检测 */
function scheduleChangeDetection(injector, source = 5 /* NotificationSource.Listener */) {
  injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_0__.ChangeDetectionScheduler).notify(source);
}
/**
 * 执行回调并通知调度器执行变更检测。
 * 回调抛错时依然会通知（与 zone 行为保持一致），错误继续向外抛出。
 */
function runInAngular(injector, fn) {
  try {
    return fn();
  } finally {
    scheduleChangeDetection(injector);
  }
}
class PageService {
  injector;
  environmentInjector;
  applicationRef;
  app;
  constructor(injector, environmentInjector, applicationRef, app) {
    this.injector = injector;
    this.environmentInjector = environmentInjector;
    this.applicationRef = applicationRef;
    this.app = app;
  }
  /** 给页面组件建一个带 PAGE_TOKEN 的子注入器 */
  createPageInjector(miniProgramComponentInstance) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__.Injector.create({
      providers: [{
        provide: angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.PAGE_TOKEN,
        useValue: miniProgramComponentInstance
      }],
      parent: this.injector
    });
  }
  register() {
    // standalone 组件启动，不需要 NgModule
    this.app.__ngStartPage = (component, miniProgramComponentInstance) => {
      return runInAngular(this.injector, () => {
        const injector = this.createPageInjector(miniProgramComponentInstance);
        const componentRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.createComponent)(component, {
          environmentInjector: this.environmentInjector,
          elementInjector: injector
        });
        this.applicationRef.attachView(componentRef.hostView);
        return {
          componentRef
        };
      });
    };
    /**
     * @deprecated NgModule 启动方式，仅为兼容 `pageStartup(module, component)` 保留。
     */
    this.app.__ngStartPageWithModule = (module, component, miniProgramComponentInstance) => {
      return runInAngular(this.injector, () => {
        const injector = this.createPageInjector(miniProgramComponentInstance);
        const ngModuleRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.createNgModule)(module, injector);
        // Angular 22 删掉了 ComponentFactoryResolver / NgModuleRef.componentFactoryResolver。
        // 非 standalone 组件的作用域在编译时已经通过模块的编译挂到组件 def 上，
        // 这里用模块的 injector 当 environmentInjector 走 createComponent 即可。
        const componentRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.createComponent)(component, {
          environmentInjector: ngModuleRef.injector,
          elementInjector: injector
        });
        this.applicationRef.attachView(componentRef.hostView);
        return {
          componentRef,
          ngModuleRef
        };
      });
    };
    this.app.__ngStartPageResolve();
  }
  static ɵfac = function PageService_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || PageService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.Injector), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__.EnvironmentInjector), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_1__.ApplicationRef), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](APP_TOKEN));
  };
  static ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({
    token: PageService,
    factory: PageService.ɵfac
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__.setClassMetadata(PageService, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.Injectable
  }], () => [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_0__.Injector
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_0__.EnvironmentInjector
  }, {
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.ApplicationRef
  }, {
    type: undefined,
    decorators: [{
      type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.Inject,
      args: [APP_TOKEN]
    }]
  }], null);
})();
function errorHandler() {
  return new _angular_core__WEBPACK_IMPORTED_MODULE_0__.ErrorHandler();
}
class MiniProgramModule {
  constructor(pageService) {
    pageService.register();
  }
  static ɵfac = function MiniProgramModule_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MiniProgramModule)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](PageService));
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({
    type: MiniProgramModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({
    providers: [{
      provide: _angular_core__WEBPACK_IMPORTED_MODULE_0__.INJECTOR_SCOPE,
      useValue: 'root'
    }, {
      provide: _angular_core__WEBPACK_IMPORTED_MODULE_0__.ErrorHandler,
      useFactory: errorHandler,
      deps: []
    }, angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramRendererFactory, {
      provide: _angular_core__WEBPACK_IMPORTED_MODULE_1__.RendererFactory2,
      useExisting: angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramRendererFactory
    }, PageService, angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.ComponentFinderService],
    imports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationModule, angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationModule]
  });
}
(() => {
  (typeof wx.__global.ngDevMode === "undefined" || wx.__global.ngDevMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__.setClassMetadata(MiniProgramModule, [{
    type: _angular_core__WEBPACK_IMPORTED_MODULE_1__.NgModule,
    args: [{
      declarations: [],
      imports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationModule],
      providers: [{
        provide: _angular_core__WEBPACK_IMPORTED_MODULE_0__.INJECTOR_SCOPE,
        useValue: 'root'
      }, {
        provide: _angular_core__WEBPACK_IMPORTED_MODULE_0__.ErrorHandler,
        useFactory: errorHandler,
        deps: []
      }, angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramRendererFactory, {
        provide: _angular_core__WEBPACK_IMPORTED_MODULE_1__.RendererFactory2,
        useExisting: angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramRendererFactory
      }, PageService, angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.ComponentFinderService],
      exports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationModule]
    }]
  }], () => [{
    type: PageService
  }], null);
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](MiniProgramModule, {
    imports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationModule],
    exports: [angular_miniprogram_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_core__WEBPACK_IMPORTED_MODULE_2__.ApplicationModule]
  });
})();
function platformMiniProgram(extraProviders = [], app) {
  // Angular 22 的 createComponentRef 会无条件要一个真 Document，
  // 小程序没有，先装占位物，否则 NG0210。详见 fake-document.ts。
  installFakeDocument();
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.createPlatformFactory)(_angular_core__WEBPACK_IMPORTED_MODULE_2__.platformCore, 'miniProgram', [{
    provide: APP_TOKEN,
    useValue: angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramCore.loadApp(app || {})
  }, {
    provide: MINIPROGRAM_GLOBAL_TOKEN,
    useValue: angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramCore.MINIPROGRAM_GLOBAL
  }, FAKE_DOCUMENT_PROVIDER])(extraProviders);
}

// eslint-disable-next-line import/no-unassigned-import
const pageStartup = angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramCore.pageStartup;
const bootstrapPage = angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramCore.bootstrapPage;
const componentRegistry = angular_miniprogram_platform_wx__WEBPACK_IMPORTED_MODULE_3__.MiniProgramCore.componentRegistry;

/**
 * Generated bundle index. Do not edit.
 */
;

//# sourceMappingURL=angular-miniprogram.mjs.map

/***/ }

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__(1382)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);