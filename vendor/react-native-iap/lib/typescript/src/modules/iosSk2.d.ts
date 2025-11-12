import type { Product, ProductPurchase, Sku } from '../types';
import type { PaymentDiscountSk2, ProductSk2, ProductStatus, RefundRequestStatus, TransactionSk2 } from '../types/appleSk2';
import type { NativeModuleProps } from './common';
type getItems = (skus: Sku[]) => Promise<ProductSk2[]>;
type getAvailableItems = (alsoPublishToEventListener?: boolean, onlyIncludeActiveItems?: boolean) => Promise<TransactionSk2[]>;
export type BuyProduct = (sku: Sku, andDangerouslyFinishTransactionAutomaticallyIOS: boolean, applicationUsername: string | undefined, quantity: number, withOffer: Record<keyof PaymentDiscountSk2, string> | undefined) => Promise<TransactionSk2>;
type clearTransaction = () => Promise<void>;
type clearProducts = () => Promise<void>;
type promotedProduct = () => Promise<Product | null>;
type buyPromotedProduct = () => Promise<void>;
type finishTransaction = (transactionIdentifier: string) => Promise<boolean>;
type getPendingTransactions = () => Promise<ProductPurchase[]>;
type presentCodeRedemptionSheet = () => Promise<null>;
type showManageSubscriptions = () => Promise<null>;
type getStorefront = () => Promise<string>;
type getAppTransaction = () => Promise<{
    appTransactionID: string;
    originalAppVersion: string;
    originalPurchaseDate: number;
    deviceVerification: string;
    deviceVerificationNonce: string;
    appVersion: string;
    signedDate: number;
    environment: string;
}>;
export interface IosModulePropsSk2 extends NativeModuleProps {
    isAvailable(): number;
    latestTransaction(sku: string): Promise<TransactionSk2>;
    currentEntitlement(sku: string): Promise<TransactionSk2>;
    subscriptionStatus(sku: string): Promise<ProductStatus[]>;
    isEligibleForIntroOffer(groupID: string): Promise<Boolean>;
    sync(): Promise<null>;
    getItems: getItems;
    getAvailableItems: getAvailableItems;
    buyProduct: BuyProduct;
    clearTransaction: clearTransaction;
    clearProducts: clearProducts;
    promotedProduct: promotedProduct;
    buyPromotedProduct: buyPromotedProduct;
    finishTransaction: finishTransaction;
    getPendingTransactions: getPendingTransactions;
    presentCodeRedemptionSheet: presentCodeRedemptionSheet;
    showManageSubscriptions: showManageSubscriptions;
    disable: () => Promise<null>;
    beginRefundRequest: (sku: string) => Promise<RefundRequestStatus>;
    getStorefront: getStorefront;
    getAppTransaction: getAppTransaction;
    getReceiptData: () => Promise<string>;
    isTransactionVerified: (sku: string) => Promise<boolean>;
    getTransactionJws: (sku: string) => Promise<string>;
    validateReceiptIos: (sku: string) => Promise<{
        isValid: boolean;
        receiptData: string;
        jwsRepresentation: string;
        latestTransaction?: TransactionSk2;
    }>;
}
/**
 * Sync state with Appstore (iOS only)
 * https://developer.apple.com/documentation/storekit/appstore/3791906-sync
 */
export declare const sync: () => Promise<null>;
/**
 *
 */
export declare const isEligibleForIntroOffer: (groupID: string) => Promise<Boolean>;
/**
 *
 */
export declare const subscriptionStatus: (sku: string) => Promise<ProductStatus[]>;
/**
 *
 */
export declare const currentEntitlement: (sku: string) => Promise<TransactionSk2>;
/**
 *
 */
export declare const latestTransaction: (sku: string) => Promise<TransactionSk2>;
/**
 *
 */
export declare const beginRefundRequest: (sku: string) => Promise<RefundRequestStatus>;
/**
 *
 */
export declare const showManageSubscriptions: () => Promise<null>;
/**
 *
 */
export declare const finishTransaction: (transactionIdentifier: string) => Promise<Boolean>;
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
export declare const getReceiptIos: () => Promise<string>;
/**
 * Check if a transaction is verified through StoreKit 2.
 * StoreKit 2 performs local verification of transaction JWS signatures.
 *
 * @param {string} sku The product's SKU (on iOS)
 * @returns {Promise<boolean>} True if the transaction is verified
 */
export declare const isTransactionVerified: (sku: string) => Promise<boolean>;
/**
 * Get the JWS representation of a purchase for server-side verification.
 * The JWS (JSON Web Signature) can be verified on your server using Apple's public keys.
 *
 * @param {string} sku The product's SKU (on iOS)
 * @returns {Promise<string>} JWS representation of the transaction
 */
export declare const getTransactionJws: (sku: string) => Promise<string>;
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
export declare const validateReceiptIos: (sku: string) => Promise<{
    isValid: boolean;
    receiptData: string;
    jwsRepresentation: string;
    latestTransaction?: TransactionSk2;
}>;
export {};
//# sourceMappingURL=iosSk2.d.ts.map