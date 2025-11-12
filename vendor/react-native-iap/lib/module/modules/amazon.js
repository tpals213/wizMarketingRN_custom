import { NativeModules } from 'react-native';
import { enhancedFetch } from '../internal';

// ----------

export const AmazonModule = NativeModules.RNIapAmazonModule;

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
export const validateReceiptAmazon = async ({
  developerSecret,
  userId,
  receiptId,
  useSandbox = true
}) => {
  const sandBoxUrl = useSandbox ? 'sandbox/' : '';
  const url = `https://appstore-sdk.amazon.com/${sandBoxUrl}version/1.0/verifyReceiptId/developer/${developerSecret}/user/${userId}/receiptId/${receiptId}`;
  return await enhancedFetch(url);
};

/**
 * Returns the status of verifying app's license @see AmazonLicensingStatus
 */
export const verifyLicense = async () => AmazonModule.verifyLicense();

/**
 * Deep link to subscriptions screen on Android.
 * @param {string} sku The product's SKU (on Android)
 * @returns {Promise<void>}
 */
export const deepLinkToSubscriptionsAmazon = async ({
  isAmazonDevice
}) => AmazonModule.deepLinkToSubscriptions(isAmazonDevice);
//# sourceMappingURL=amazon.js.map