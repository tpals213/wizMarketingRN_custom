/**
 * Payment discount interface @see https://developer.apple.com/documentation/storekit/skpaymentdiscount?language=objc
 */

export const offerToRecord = offer => {
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
//# sourceMappingURL=apple.js.map