"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateReceiptIos = exports.presentCodeRedemptionSheetIOS = exports.getReceiptIOS = exports.getPromotedProductIOS = exports.getPendingPurchasesIOS = exports.deepLinkToSubscriptionsIos = exports.clearTransactionIOS = exports.clearProductsIOS = exports.buyPromotedProductIOS = void 0;
var _reactNative = require("react-native");
var _internal = require("../internal");
const {
  RNIapIos
} = _reactNative.NativeModules;
/**
 * Get the current receipt base64 encoded in IOS.
 * @returns {Promise<ProductPurchase[]>}
 */
const getPendingPurchasesIOS = async () => (0, _internal.getIosModule)().getPendingTransactions();

/**
 * Get the current receipt base64 encoded in IOS.
 * 
 * The sequence should be as follows: 
 * Call getReceiptIOS({forceRefresh: false}). That will return the cached receipt that is available on TestFlight and Production. 
 * In the case of Sandbox the receipt might not be cached, causing it to return nil. 
 * In that case you might want to let the user that they will to be prompted for credentials. 
 * If they accept, call it again with `getReceiptIOS({forceRefresh:true}) If it fails or the user declines, assume they haven't purchased any items. 
 * Reference: https://developer.apple.com/forums/thread/662350 
 * 
 * From: https://apphud.com/blog/app-store-receipt-validation#what-is-app-store-receipt
 > Q: Does a receipt always exist in the app?
 > A: If a user downloaded the app from the App Store – yes. However, in sandbox if your app was installed via Xcode or Testflight, then there won't be a receipt until you make a purchase or restore.
 * 
 ## Usage 
 ```tsx
import {getReceiptIOS} from 'react-native-iap';
try{
  let receipt = await getReceiptIOS({forceRefresh: false});
  if(!receipt){
    // Let user know that they might get prompted for credentials
    const shouldShowPrompt = // Display UI with details, Did user agree?. this only for Sandbox testing
    if(shouldShowPrompt){
      receipt = await getReceiptIOS({forceRefresh: true});
    }
  }
}catch(error:Error){
  // error while getting the receipt, it might indicate an invalid receipt of a connection error while trying to get it
}
// If !receipt assume user doesn't own the items
```
 * @param {forceRefresh?:boolean} Requests the receipt from Bundle.main.appStoreReceiptURL. 
Based on the note above, looks like forceRefresh only makes sense when testing an app not downloaded from the Appstore.
And only afer a direct user action.
 * @returns {Promise<string | undefined | null>} The receipt data
 */
exports.getPendingPurchasesIOS = getPendingPurchasesIOS;
const getReceiptIOS = async ({
  forceRefresh
}) => {
  if (!(0, _internal.isIosStorekit2)()) {
    return RNIapIos.requestReceipt(forceRefresh ?? false);
  } else {
    return Promise.reject('Only available on Sk1');
  }
};
/**
 * Launches a modal to register the redeem offer code in IOS.
 * @returns {Promise<null>}
 */
exports.getReceiptIOS = getReceiptIOS;
const presentCodeRedemptionSheetIOS = async () => (0, _internal.getIosModule)().presentCodeRedemptionSheet();

/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product | null>} promoted product
 */
exports.presentCodeRedemptionSheetIOS = presentCodeRedemptionSheetIOS;
const getPromotedProductIOS = () => {
  if (!(0, _internal.isIosStorekit2)()) {
    return RNIapIos.promotedProduct();
  } else {
    return Promise.reject('Only available on Sk1');
  }
};

/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
exports.getPromotedProductIOS = getPromotedProductIOS;
const buyPromotedProductIOS = () => (0, _internal.getIosModule)().buyPromotedProduct();
exports.buyPromotedProductIOS = buyPromotedProductIOS;
const fetchJsonOrThrow = async (url, receiptBody) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(receiptBody)
  });
  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status
    });
  }
  return response.json();
};
const TEST_RECEIPT = 21007;
const requestAgnosticReceiptValidationIos = async receiptBody => {
  const response = await fetchJsonOrThrow('https://buy.itunes.apple.com/verifyReceipt', receiptBody);

  // Best practice is to check for test receipt and check sandbox instead
  // https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
  if (response && response.status === TEST_RECEIPT) {
    const testResponse = await fetchJsonOrThrow('https://sandbox.itunes.apple.com/verifyReceipt', receiptBody);
    return testResponse;
  }
  return response;
};

/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
const validateReceiptIos = async ({
  receiptBody,
  isTest
}) => {
  if (isTest == null) {
    return await requestAgnosticReceiptValidationIos(receiptBody);
  }
  const url = isTest ? 'https://sandbox.itunes.apple.com/verifyReceipt' : 'https://buy.itunes.apple.com/verifyReceipt';
  const response = await fetchJsonOrThrow(url, receiptBody);
  return response;
};

/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257 and #801
 *     link : https://github.com/hyochan/react-native-iap/issues/257
 *            https://github.com/hyochan/react-native-iap/issues/801
 * @returns {Promise<void>}
 */
exports.validateReceiptIos = validateReceiptIos;
const clearTransactionIOS = () => (0, _internal.getIosModule)().clearTransaction();

/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {void}
 */
exports.clearTransactionIOS = clearTransactionIOS;
const clearProductsIOS = () => (0, _internal.getIosModule)().clearProducts();
exports.clearProductsIOS = clearProductsIOS;
const deepLinkToSubscriptionsIos = () => _reactNative.Linking.openURL('https://apps.apple.com/account/subscriptions');
exports.deepLinkToSubscriptionsIos = deepLinkToSubscriptionsIos;
//# sourceMappingURL=ios.js.map