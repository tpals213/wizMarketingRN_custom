"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _amazon = require("./amazon");
Object.keys(_amazon).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _amazon[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _amazon[key];
    }
  });
});
var _android = require("./android");
Object.keys(_android).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _android[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _android[key];
    }
  });
});
var _ios = require("./ios");
Object.keys(_ios).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ios[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ios[key];
    }
  });
});
var _common = require("./common");
Object.keys(_common).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _common[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _common[key];
    }
  });
});
//# sourceMappingURL=index.js.map