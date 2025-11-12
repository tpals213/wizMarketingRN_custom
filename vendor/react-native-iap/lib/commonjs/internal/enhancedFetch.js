"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enhancedFetch = void 0;
const enhancedFetch = async (url, init) => {
  const response = await fetch(url, {
    method: (init === null || init === void 0 ? void 0 : init.method) ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    ...(init !== null && init !== void 0 && init.body ? {
      body: JSON.stringify(init.body)
    } : {})
  });
  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status
    });
  }
  return response.json();
};
exports.enhancedFetch = enhancedFetch;
//# sourceMappingURL=enhancedFetch.js.map