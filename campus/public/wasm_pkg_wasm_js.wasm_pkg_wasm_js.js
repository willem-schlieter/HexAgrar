"use strict";
(self["webpackChunksvelte_app"] = self["webpackChunksvelte_app"] || []).push([["wasm_pkg_wasm_js"],{

/***/ "../wasm/pkg/wasm.js":
/*!***************************!*\
  !*** ../wasm/pkg/wasm.js ***!
  \***************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__wbg_alert_e63a4c41bbd7a3e9": () => (/* reexport safe */ _wasm_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_alert_e63a4c41bbd7a3e9),
/* harmony export */   "greet": () => (/* reexport safe */ _wasm_bg_js__WEBPACK_IMPORTED_MODULE_0__.greet)
/* harmony export */ });
/* harmony import */ var _wasm_bg_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./wasm_bg.js */ "../wasm/pkg/wasm_bg.js");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_wasm_bg_js__WEBPACK_IMPORTED_MODULE_0__]);
_wasm_bg_js__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ "../wasm/pkg/wasm_bg.js":
/*!******************************!*\
  !*** ../wasm/pkg/wasm_bg.js ***!
  \******************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__wbg_alert_e63a4c41bbd7a3e9": () => (/* binding */ __wbg_alert_e63a4c41bbd7a3e9),
/* harmony export */   "greet": () => (/* binding */ greet)
/* harmony export */ });
/* harmony import */ var _wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./wasm_bg.wasm */ "../wasm/pkg/wasm_bg.wasm");
/* module decorator */ module = __webpack_require__.hmd(module);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__]);
_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(_wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
*/
function greet() {
    _wasm_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.greet();
}

function __wbg_alert_e63a4c41bbd7a3e9(arg0, arg1) {
    alert(getStringFromWasm0(arg0, arg1));
};


__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ "../wasm/pkg/wasm_bg.wasm":
/*!********************************!*\
  !*** ../wasm/pkg/wasm_bg.wasm ***!
  \********************************/
/***/ ((module, exports, __webpack_require__) => {

var __webpack_instantiate__ = ([WEBPACK_IMPORTED_MODULE_0]) => {
	return __webpack_require__.v(exports, module.id, "28a15838499d88a4dfc0", {
		"./wasm_bg.js": {
			"__wbg_alert_e63a4c41bbd7a3e9": WEBPACK_IMPORTED_MODULE_0.__wbg_alert_e63a4c41bbd7a3e9
		}
	});
}
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => {
	try {
	/* harmony import */ var WEBPACK_IMPORTED_MODULE_0 = __webpack_require__(/*! ./wasm_bg.js */ "../wasm/pkg/wasm_bg.js");
	var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([WEBPACK_IMPORTED_MODULE_0]);
	var [WEBPACK_IMPORTED_MODULE_0] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__;
	await __webpack_require__.v(exports, module.id, "28a15838499d88a4dfc0", {
		"./wasm_bg.js": {
			"__wbg_alert_e63a4c41bbd7a3e9": WEBPACK_IMPORTED_MODULE_0.__wbg_alert_e63a4c41bbd7a3e9
		}
	});
	__webpack_async_result__();
	} catch(e) { __webpack_async_result__(e); }
}, 1);

/***/ })

}]);
//# sourceMappingURL=wasm_pkg_wasm_js.wasm_pkg_wasm_js.js.map