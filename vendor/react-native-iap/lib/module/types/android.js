export let AndroidPurchaseState = /*#__PURE__*/function (AndroidPurchaseState) {
  AndroidPurchaseState[AndroidPurchaseState["purchased"] = 0] = "purchased";
  AndroidPurchaseState[AndroidPurchaseState["canceled"] = 1] = "canceled";
  AndroidPurchaseState[AndroidPurchaseState["pending"] = 2] = "pending";
  return AndroidPurchaseState;
}({});
export let AndroidPurchaseType = /*#__PURE__*/function (AndroidPurchaseType) {
  AndroidPurchaseType[AndroidPurchaseType["test"] = 0] = "test";
  AndroidPurchaseType[AndroidPurchaseType["promo"] = 1] = "promo";
  AndroidPurchaseType[AndroidPurchaseType["rewarded"] = 2] = "rewarded";
  return AndroidPurchaseType;
}({});
export let AndroidConsumptionState = /*#__PURE__*/function (AndroidConsumptionState) {
  AndroidConsumptionState[AndroidConsumptionState["yet"] = 0] = "yet";
  AndroidConsumptionState[AndroidConsumptionState["consumed"] = 1] = "consumed";
  return AndroidConsumptionState;
}({});
export let AndroidAcknowledgementState = /*#__PURE__*/function (AndroidAcknowledgementState) {
  AndroidAcknowledgementState[AndroidAcknowledgementState["yet"] = 0] = "yet";
  AndroidAcknowledgementState[AndroidAcknowledgementState["acknowledged"] = 1] = "acknowledged";
  return AndroidAcknowledgementState;
}({});

/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 * @param {number} startTimeMillis The time the product was purchased, in milliseconds since the epoch (Jan 1, 1970).
 * @param {number} expiryTimeMillis The time the product expires, in milliseconds since the epoch (Jan 1, 1970).
 * @param {boolean} autoRenewing Check if it is a renewable product.
 * @param {string} priceCurrencyCode The price currency.
 * @param {number} priceAmountMicros Price amount int micros.
 * @param {string} countryCode Country code.
 * @param {string} developerPayload Developer payload.
 * @param {string} orderId Order id.
 * @param {AndroidPurchaseType} purchaseType Purchase type.
 * @param {AndroidAcknowledgementState} acknowledgementState Check if product is acknowledged.
 * @param {string} kind
 */

/** Based on
 * https://developer.android.com/reference/com/android/billingclient/api/BillingClient.FeatureType
 */
export let FeatureType = /*#__PURE__*/function (FeatureType) {
  FeatureType["IN_APP_MESSAGING"] = "IN_APP_MESSAGING";
  FeatureType["PRICE_CHANGE_CONFIRMATION"] = "PRICE_CHANGE_CONFIRMATION";
  FeatureType["PRODUCT_DETAILS"] = "PRODUCT_DETAILS";
  FeatureType["SUBSCRIPTIONS"] = "SUBSCRIPTIONS";
  FeatureType["SUBSCRIPTIONS_UPDATE"] = "SUBSCRIPTIONS_UPDATE";
  return FeatureType;
}({});

/** Added to maintain backwards compatibility */
export const singleProductAndroidMap = originalProd => {
  var _originalProd$oneTime, _originalProd$oneTime2, _originalProd$oneTime3;
  const prod = {
    ...originalProd,
    //legacy properties
    price: ((_originalProd$oneTime = originalProd.oneTimePurchaseOfferDetails) === null || _originalProd$oneTime === void 0 ? void 0 : _originalProd$oneTime.formattedPrice) ?? originalProd.price,
    localizedPrice: ((_originalProd$oneTime2 = originalProd.oneTimePurchaseOfferDetails) === null || _originalProd$oneTime2 === void 0 ? void 0 : _originalProd$oneTime2.formattedPrice) ?? originalProd.price,
    currency: ((_originalProd$oneTime3 = originalProd.oneTimePurchaseOfferDetails) === null || _originalProd$oneTime3 === void 0 ? void 0 : _originalProd$oneTime3.priceCurrencyCode) ?? originalProd.currency
  };
  return prod;
};
//# sourceMappingURL=android.js.map