// Platform discrimination types

export let ReplacementModesAndroid = /*#__PURE__*/function (ReplacementModesAndroid) {
  ReplacementModesAndroid[ReplacementModesAndroid["UNKNOWN_REPLACEMENT_MODE"] = 0] = "UNKNOWN_REPLACEMENT_MODE";
  ReplacementModesAndroid[ReplacementModesAndroid["WITH_TIME_PRORATION"] = 1] = "WITH_TIME_PRORATION";
  ReplacementModesAndroid[ReplacementModesAndroid["CHARGE_PRORATED_PRICE"] = 2] = "CHARGE_PRORATED_PRICE";
  ReplacementModesAndroid[ReplacementModesAndroid["WITHOUT_PRORATION"] = 3] = "WITHOUT_PRORATION";
  ReplacementModesAndroid[ReplacementModesAndroid["CHARGE_FULL_PRICE"] = 5] = "CHARGE_FULL_PRICE";
  ReplacementModesAndroid[ReplacementModesAndroid["DEFERRED"] = 6] = "DEFERRED";
  return ReplacementModesAndroid;
}({});
export let PurchaseStateAndroid = /*#__PURE__*/function (PurchaseStateAndroid) {
  PurchaseStateAndroid[PurchaseStateAndroid["UNSPECIFIED_STATE"] = 0] = "UNSPECIFIED_STATE";
  PurchaseStateAndroid[PurchaseStateAndroid["PURCHASED"] = 1] = "PURCHASED";
  PurchaseStateAndroid[PurchaseStateAndroid["PENDING"] = 2] = "PENDING";
  return PurchaseStateAndroid;
}({});
export const PROMOTED_PRODUCT = 'iap-promoted-product';
export let InstallSourceAndroid = /*#__PURE__*/function (InstallSourceAndroid) {
  InstallSourceAndroid[InstallSourceAndroid["NOT_SET"] = 0] = "NOT_SET";
  InstallSourceAndroid[InstallSourceAndroid["GOOGLE_PLAY"] = 1] = "GOOGLE_PLAY";
  InstallSourceAndroid[InstallSourceAndroid["AMAZON"] = 2] = "AMAZON";
  return InstallSourceAndroid;
}({});
export let ProductType = /*#__PURE__*/function (ProductType) {
  ProductType["subs"] = "subs";
  ProductType["sub"] = "sub";
  ProductType["inapp"] = "inapp";
  ProductType["iap"] = "iap";
  return ProductType;
}({});
export let TransactionReason = /*#__PURE__*/function (TransactionReason) {
  TransactionReason["PURCHASE"] = "PURCHASE";
  TransactionReason["RENEWAL"] = "RENEWAL";
  return TransactionReason;
}({});

// New discriminated union type matching expo-iap

// For backward compatibility, keep the original Purchase type

// Legacy type for backward compatibility

// New discriminated union type matching expo-iap

// For backward compatibility, keep the original Product type

/**
 * Can be used to distinguish the different platforms' subscription information
 */
export let SubscriptionPlatform = /*#__PURE__*/function (SubscriptionPlatform) {
  SubscriptionPlatform["android"] = "android";
  SubscriptionPlatform["amazon"] = "amazon";
  SubscriptionPlatform["ios"] = "ios";
  return SubscriptionPlatform;
}({});

/** Android Billing v5 type */

/**
 * TODO: As of 2022-10-10, this typing is not verified against the real
 * Amazon API. Please update this if you have a more accurate type.
 */

/** As of 2022-10-12, we only use the `sku` field for Amazon purchases */

/**
 * In order to purchase a new subscription, every sku must have a selected offerToken
 * @see SubscriptionAndroid.subscriptionOfferDetails.offerToken
 */

/** As of 2022-10-12, we only use the `sku` field for Amazon subscriptions */

// Unified request types (expo-iap compatibility)
//# sourceMappingURL=index.js.map