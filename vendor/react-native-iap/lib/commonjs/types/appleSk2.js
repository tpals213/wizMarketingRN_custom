"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transactionSk2ToPurchaseMap = exports.subscriptionSk2Map = exports.productSk2Map = exports.offerSk2Map = void 0;
var _ = require("./");
const productSk2Map = ({
  id,
  description,
  displayName,
  price,
  currency,
  displayPrice
}) => {
  const prod = {
    title: displayName,
    productId: String(id),
    description,
    type: 'iap',
    price: String(price),
    localizedPrice: displayPrice,
    currency
  };
  return prod;
};
exports.productSk2Map = productSk2Map;
const subscriptionSk2Map = ({
  id,
  description,
  displayName,
  price,
  currency,
  displayPrice,
  subscription
}) => {
  var _subscription$subscri, _subscription$subscri2, _subscription$introdu, _subscription$introdu2, _subscription$introdu3, _subscription$introdu4;
  const prod = {
    platform: _.SubscriptionPlatform.ios,
    title: displayName,
    productId: String(id),
    description,
    type: 'subs',
    price: String(price),
    localizedPrice: displayPrice,
    currency,
    subscriptionPeriodNumberIOS: `${subscription === null || subscription === void 0 || (_subscription$subscri = subscription.subscriptionPeriod) === null || _subscription$subscri === void 0 ? void 0 : _subscription$subscri.value}`,
    subscriptionPeriodUnitIOS: subscription === null || subscription === void 0 || (_subscription$subscri2 = subscription.subscriptionPeriod) === null || _subscription$subscri2 === void 0 ? void 0 : _subscription$subscri2.unit.toUpperCase(),
    introductoryPriceAsAmountIOS: subscription === null || subscription === void 0 || (_subscription$introdu = subscription.introductoryOffer) === null || _subscription$introdu === void 0 ? void 0 : _subscription$introdu.displayPrice,
    introductoryPricePaymentModeIOS: subscription === null || subscription === void 0 || (_subscription$introdu2 = subscription.introductoryOffer) === null || _subscription$introdu2 === void 0 ? void 0 : _subscription$introdu2.paymentMode.toUpperCase(),
    introductoryPriceNumberOfPeriodsIOS: subscription === null || subscription === void 0 || (_subscription$introdu3 = subscription.introductoryOffer) === null || _subscription$introdu3 === void 0 || (_subscription$introdu3 = _subscription$introdu3.period) === null || _subscription$introdu3 === void 0 || (_subscription$introdu3 = _subscription$introdu3.value) === null || _subscription$introdu3 === void 0 ? void 0 : _subscription$introdu3.toString(),
    introductoryPriceSubscriptionPeriodIOS: subscription === null || subscription === void 0 || (_subscription$introdu4 = subscription.introductoryOffer) === null || _subscription$introdu4 === void 0 || (_subscription$introdu4 = _subscription$introdu4.period) === null || _subscription$introdu4 === void 0 ? void 0 : _subscription$introdu4.unit
  };
  return prod;
};

/**
 * Only one of `transaction` and `error` is not undefined at the time
 */

/**
 * Renewal info for whole subscription group.
 * see: https://developer.apple.com/documentation/storekit/product/subscriptioninfo/status/3822294-renewalinfo
 * WARN:
 * - autoRenewPreference is serialised as autoRenewProductId in jsonRepresentation
 * - renewalDate is available in jsonRepresentation (will change with Xcode 15 https://developer.apple.com/forums/thread/738833)
 */
exports.subscriptionSk2Map = subscriptionSk2Map;
const transactionSk2ToPurchaseMap = ({
  id,
  originalPurchaseDate,
  productID,
  purchaseDate,
  purchasedQuantity,
  originalID,
  verificationResult,
  appAccountToken,
  jsonRepresentation,
  jwsRepresentationIos,
  environmentIos,
  storefrontCountryCodeIos,
  reasonIos,
  offerIos,
  priceIos,
  currencyIos
}) => {
  let transactionReasonIOS;
  try {
    const transactionData = JSON.parse(jsonRepresentation);
    transactionReasonIOS = transactionData.transactionReason;
  } catch (e) {
    console.log('AppleSK2.ts react-native-iap: Error parsing jsonRepresentation', e);
  }
  const purchase = {
    productId: productID,
    transactionId: String(id),
    transactionDate: purchaseDate,
    //??
    transactionReceipt: '',
    // Not available
    purchaseToken: '',
    //Not available
    quantityIOS: purchasedQuantity,
    originalTransactionDateIOS: originalPurchaseDate,
    originalTransactionIdentifierIOS: originalID,
    verificationResultIOS: verificationResult ?? '',
    appAccountToken: appAccountToken ?? '',
    transactionReasonIOS: transactionReasonIOS ?? '',
    jwsRepresentationIos,
    environmentIos,
    storefrontCountryCodeIos,
    reasonIos,
    offerIos,
    priceIos,
    currencyIos
  };
  return purchase;
};

/**
 * Payment discount interface @see https://developer.apple.com/documentation/storekit/skpaymentdiscount?language=objc
 */
exports.transactionSk2ToPurchaseMap = transactionSk2ToPurchaseMap;
const offerSk2Map = offer => {
  if (!offer) {
    return undefined;
  }
  return {
    offerID: offer.identifier,
    keyID: offer.keyIdentifier,
    nonce: offer.nonce,
    signature: offer.signature,
    timestamp: offer.timestamp.toString()
  };
};
exports.offerSk2Map = offerSk2Map;
//# sourceMappingURL=appleSk2.js.map