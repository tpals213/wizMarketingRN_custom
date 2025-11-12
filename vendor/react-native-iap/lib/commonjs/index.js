"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _iap = require("./iap");
Object.keys(_iap).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _iap[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _iap[key];
    }
  });
});
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
var _eventEmitter = require("./eventEmitter");
Object.keys(_eventEmitter).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _eventEmitter[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _eventEmitter[key];
    }
  });
});
var _useIAP = require("./hooks/useIAP");
Object.keys(_useIAP).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _useIAP[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useIAP[key];
    }
  });
});
var _withIAPContext = require("./hooks/withIAPContext");
Object.keys(_withIAPContext).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _withIAPContext[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _withIAPContext[key];
    }
  });
});
var _purchaseError = require("./purchaseError");
Object.keys(_purchaseError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _purchaseError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _purchaseError[key];
    }
  });
});
var _modules = require("./modules");
Object.keys(_modules).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _modules[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _modules[key];
    }
  });
});
var _errorMapping = require("./utils/errorMapping");
Object.keys(_errorMapping).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _errorMapping[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _errorMapping[key];
    }
  });
});
var _typeGuards = require("./utils/typeGuards");
Object.keys(_typeGuards).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _typeGuards[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _typeGuards[key];
    }
  });
});
//# sourceMappingURL=index.js.map