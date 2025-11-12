"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyLicense = exports.validateReceiptAmazon = exports.deepLinkToSubscriptionsAmazon = exports.AmazonModule = void 0;
var _reactNative = require("react-native");
var _internal = require("../internal");
// ----------

const AmazonModule = exports.AmazonModule = _reactNative.NativeModules.RNIapAmazonModule;

/**
 * Validate receipt for Amazon. NOTE: This method is here for debugging purposes only. Including
 * your developer secret in the binary you ship to users is potentially dangerous.
 * Use server side validation instead for your production builds
 * @param {string} developerSecret: from the Amazon developer console.
 * @param {string} userId who purchased the item.
 * @param {string} receiptId long obfuscated string returned when purchasing the item
 * @param {boolean} useSandbox Defaults to true, use sandbox environment or production.
 * @returns {Promise<object>}
 */
const validateReceiptAmazon = async ({
  developerSecret,
  userId,
  receiptId,
  useSandbox = true
}) => {
  const sandBoxUrl = useSandbox ? 'sandbox/' : '';
  const url = `https://appstore-sdk.amazon.com/${sandBoxUrl}version/1.0/verifyReceiptId/developer/${developerSecret}/user/${userId}/receiptId/${receiptId}`;
  return await (0, _internal.enhancedFetch)(url);
};

/**
 * Returns the status of verifying app's license @see AmazonLicensingStatus
 */
exports.validateReceiptAmazon = validateReceiptAmazon;
const verifyLicense = async () => AmazonModule.verifyLicense();

/**
 * Deep link to subscriptions screen on Android.
 * @param {string} sku The product's SKU (on Android)
 * @returns {Promise<void>}
 */
exports.verifyLicense = verifyLicense;
const deepLinkToSubscriptionsAmazon = async ({
  isAmazonDevice
}) => AmazonModule.deepLinkToSubscriptions(isAmazonDevice);
exports.deepLinkToSubscriptionsAmazon = deepLinkToSubscriptionsAmazon;
//# sourceMappingURL=amazon.js.map