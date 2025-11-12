import type { ResponseBody as ReceiptValidationResponse } from '@jeremybarbet/apple-api-types';
import type { ProductIOS, ProductPurchase, Purchase, Sku, SubscriptionIOS } from '../types';
import type { PaymentDiscount } from '../types/apple';
import type { NativeModuleProps } from './common';
type getItems = (skus: Sku[]) => Promise<ProductIOS[] | SubscriptionIOS[]>;
type getAvailableItems = (automaticallyFinishRestoredTransactions: boolean) => Promise<Purchase[]>;
export type BuyProduct = (sku: Sku, andDangerouslyFinishTransactionAutomaticallyIOS: boolean, applicationUsername: string | undefined, quantity: number, withOffer: Record<keyof PaymentDiscount, string> | undefined) => Promise<Purchase>;
type clearTransaction = () => Promise<void>;
type clearProducts = () => Promise<void>;
type promotedProduct = () => Promise<ProductIOS | null>;
type buyPromotedProduct = () => Promise<void>;
type requestReceipt = (refresh: boolean) => Promise<string | undefined | null>;
type finishTransaction = (transactionIdentifier: string) => Promise<boolean>;
type getPendingTransactions = () => Promise<ProductPurchase[]>;
type presentCodeRedemptionSheet = () => Promise<null>;
export interface IosModuleProps extends NativeModuleProps {
    getItems: getItems;
    getAvailableItems: getAvailableItems;
    buyProduct: BuyProduct;
    clearTransaction: clearTransaction;
    clearProducts: clearProducts;
    promotedProduct: promotedProduct;
    buyPromotedProduct: buyPromotedProduct;
    requestReceipt: requestReceipt;
    finishTransaction: finishTransaction;
    getPendingTransactions: getPendingTransactions;
    presentCodeRedemptionSheet: presentCodeRedemptionSheet;
    disable: () => Promise<null>;
}
/**
 * Get the current receipt base64 encoded in IOS.
 * @returns {Promise<ProductPurchase[]>}
 */
export declare const getPendingPurchasesIOS: () => Promise<ProductPurchase[]>;
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
export declare const getReceiptIOS: ({ forceRefresh, }: {
    forceRefresh?: boolean | undefined;
}) => Promise<string | undefined | null>;
/**
 * Launches a modal to register the redeem offer code in IOS.
 * @returns {Promise<null>}
 */
export declare const presentCodeRedemptionSheetIOS: () => Promise<null>;
/**
 * Should Add Store Payment (iOS only)
 *   Indicates the the App Store purchase should continue from the app instead of the App Store.
 * @returns {Promise<Product | null>} promoted product
 */
export declare const getPromotedProductIOS: () => Promise<ProductIOS | null>;
/**
 * Buy the currently selected promoted product (iOS only)
 *   Initiates the payment process for a promoted product. Should only be called in response to the `iap-promoted-product` event.
 * @returns {Promise<void>}
 */
export declare const buyPromotedProductIOS: () => Promise<void>;
/**
 * Validate receipt for iOS.
 * @param {object} receiptBody the receipt body to send to apple server.
 * @param {boolean} isTest whether this is in test environment which is sandbox.
 * @returns {Promise<Apple.ReceiptValidationResponse | false>}
 */
export declare const validateReceiptIos: ({ receiptBody, isTest, }: {
    receiptBody: Record<string, unknown>;
    isTest?: boolean | undefined;
}) => Promise<ReceiptValidationResponse | false>;
/**
 * Clear Transaction (iOS only)
 *   Finish remaining transactions. Related to issue #257 and #801
 *     link : https://github.com/hyochan/react-native-iap/issues/257
 *            https://github.com/hyochan/react-native-iap/issues/801
 * @returns {Promise<void>}
 */
export declare const clearTransactionIOS: () => Promise<void>;
/**
 * Clear valid Products (iOS only)
 *   Remove all products which are validated by Apple server.
 * @returns {void}
 */
export declare const clearProductsIOS: () => Promise<void>;
export declare const deepLinkToSubscriptionsIos: () => Promise<void>;
export {};
//# sourceMappingURL=ios.d.ts.map