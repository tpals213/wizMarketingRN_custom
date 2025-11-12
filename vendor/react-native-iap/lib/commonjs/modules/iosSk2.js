"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateReceiptIos = exports.sync = exports.subscriptionStatus = exports.showManageSubscriptions = exports.latestTransaction = exports.isTransactionVerified = exports.isEligibleForIntroOffer = exports.getTransactionJws = exports.getReceiptIos = exports.finishTransaction = exports.currentEntitlement = exports.beginRefundRequest = void 0;
var _reactNative = require("react-native");
const {
  RNIapIosSk2
} = _reactNative.NativeModules;
/**
 * Sync state with Appstore (iOS only)
 * https://developer.apple.com/documentation/storekit/appstore/3791906-sync
 */
const sync = () => RNIapIosSk2.sync();

/**
 *
 */
exports.sync = sync;
const isEligibleForIntroOffer = groupID => RNIapIosSk2.isEligibleForIntroOffer(groupID);

/**
 *
 */
exports.isEligibleForIntroOffer = isEligibleForIntroOffer;
const subscriptionStatus = sku => RNIapIosSk2.subscriptionStatus(sku);

/**
 *
 */
exports.subscriptionStatus = subscriptionStatus;
const currentEntitlement = sku => RNIapIosSk2.currentEntitlement(sku);

/**
 *
 */
exports.currentEntitlement = currentEntitlement;
const latestTransaction = sku => RNIapIosSk2.latestTransaction(sku);

/**
 *
 */
exports.latestTransaction = latestTransaction;
const beginRefundRequest = sku => RNIapIosSk2.beginRefundRequest(sku);

/**
 *
 */
exports.beginRefundRequest = beginRefundRequest;
const showManageSubscriptions = () => RNIapIosSk2.showManageSubscriptions();

/**
 *
 */
exports.showManageSubscriptions = showManageSubscriptions;
const finishTransaction = transactionIdentifier => RNIapIosSk2.finishTransaction(transactionIdentifier);

/**
 * Get the receipt data from the iOS device.
 * This returns the base64 encoded receipt data which can be sent to your server
 * for verification with Apple's server.
 *
 * NOTE: For proper security, always verify receipts on your server using
 * Apple's verifyReceipt endpoint, not directly from the app.
 *
 * @returns {Promise<string>} Base64 encoded receipt data
 */
exports.finishTransaction = finishTransaction;
const getReceiptIos = () => RNIapIosSk2.getReceiptData();

/**
 * Check if a transaction is verified through StoreKit 2.
 * StoreKit 2 performs local verification of transaction JWS signatures.
 *
 * @param {string} sku The product's SKU (on iOS)
 * @returns {Promise<boolean>} True if the transaction is verified
 */
exports.getReceiptIos = getReceiptIos;
const isTransactionVerified = sku => RNIapIosSk2.isTransactionVerified(sku);

/**
 * Get the JWS representation of a purchase for server-side verification.
 * The JWS (JSON Web Signature) can be verified on your server using Apple's public keys.
 *
 * @param {string} sku The product's SKU (on iOS)
 * @returns {Promise<string>} JWS representation of the transaction
 */
exports.isTransactionVerified = isTransactionVerified;
const getTransactionJws = sku => RNIapIosSk2.getTransactionJws(sku);

/**
 * Validate receipt for iOS using StoreKit 2's built-in verification.
 * Returns receipt data and verification information to help with server-side validation.
 *
 * NOTE: For proper security, Apple recommends verifying receipts on your server using
 * the verifyReceipt endpoint rather than relying solely on client-side verification.
 *
 * @param {string} sku The product's SKU (on iOS)
 * @returns {Promise<{
 *   isValid: boolean;
 *   receiptData: string;
 *   jwsRepresentation: string;
 *   latestTransaction?: TransactionSk2;
 * }>}
 */
exports.getTransactionJws = getTransactionJws;
const validateReceiptIos = async sku => {
  const result = await RNIapIosSk2.validateReceiptIos(sku);
  return result;
};
exports.validateReceiptIos = validateReceiptIos;
//# sourceMappingURL=iosSk2.js.map