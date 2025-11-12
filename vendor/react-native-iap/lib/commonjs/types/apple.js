"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.offerToRecord = void 0;
/**
 * Payment discount interface @see https://developer.apple.com/documentation/storekit/skpaymentdiscount?language=objc
 */

const offerToRecord = offer => {
  if (!offer) {
    return undefined;
  }
  return {
    identifier: offer.identifier,
    keyIdentifier: offer.keyIdentifier,
    nonce: offer.nonce,
    signature: offer.signature,
    timestamp: offer.timestamp.toString()
  };
};
exports.offerToRecord = offerToRecord;
//# sourceMappingURL=apple.js.map