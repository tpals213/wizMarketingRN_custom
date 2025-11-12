"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _enhancedFetch = require("./enhancedFetch");
Object.keys(_enhancedFetch).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _enhancedFetch[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _enhancedFetch[key];
    }
  });
});
var _fillProductsWithAdditionalData = require("./fillProductsWithAdditionalData");
Object.keys(_fillProductsWithAdditionalData).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _fillProductsWithAdditionalData[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _fillProductsWithAdditionalData[key];
    }
  });
});
var _platform = require("./platform");
Object.keys(_platform).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _platform[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _platform[key];
    }
  });
});
//# sourceMappingURL=index.js.map