"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _useIAP = require("./useIAP");
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
//# sourceMappingURL=index.js.map