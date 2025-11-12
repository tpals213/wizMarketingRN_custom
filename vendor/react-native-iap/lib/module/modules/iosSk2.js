import { NativeModules } from 'react-native';
const {
  RNIapIosSk2
} = NativeModules;
/**
 * Sync state with Appstore (iOS only)
 * https://developer.apple.com/documentation/storekit/appstore/3791906-sync
 */
export const sync = () => RNIapIosSk2.sync();

/**
 *
 */
export const isEligibleForIntroOffer = groupID => RNIapIosSk2.isEligibleForIntroOffer(groupID);

/**
 *
 */

export const subscriptionStatus = sku => RNIapIosSk2.subscriptionStatus(sku);

/**
 *
 */
export const currentEntitlement = sku => RNIapIosSk2.currentEntitlement(sku);

/**
 *
 */
export const latestTransaction = sku => RNIapIosSk2.latestTransaction(sku);

/**
 *
 */
export const beginRefundRequest = sku => RNIapIosSk2.beginRefundRequest(sku);

/**
 *
 */
export const showManageSubscriptions = () => RNIapIosSk2.showManageSubscriptions();

/**
 *
 */
export const finishTransaction = transactionIdentifier => RNIapIosSk2.finishTransaction(transactionIdentifier);

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
export const getReceiptIos = () => RNIapIosSk2.getReceiptData();

/**
 * Check if a transaction is verified through StoreKit 2.
 * StoreKit 2 performs local verification of transaction JWS signatures.
 *
 * @param {string} sku The product's SKU (on iOS)
 * @returns {Promise<boolean>} True if the transaction is verified
 */
export const isTransactionVerified = sku => RNIapIosSk2.isTransactionVerified(sku);

/**
 * Get the JWS representation of a purchase for server-side verification.
 * The JWS (JSON Web Signature) can be verified on your server using Apple's public keys.
 *
 * @param {string} sku The product's SKU (on iOS)
 * @returns {Promise<string>} JWS representation of the transaction
 */
export const getTransactionJws = sku => RNIapIosSk2.getTransactionJws(sku);

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
export const validateReceiptIos = async sku => {
  const result = await RNIapIosSk2.validateReceiptIos(sku);
  return result;
};
//# sourceMappingURL=iosSk2.js.map