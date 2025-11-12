import type { PurchaseError } from '../purchaseError';
import type { ProductIOS, Purchase, SubscriptionIOS } from '.';
import type * as Apple from './apple';
export type SubscriptionPeriod = {
    unit: 'day' | 'week' | 'month' | 'year';
    value: number;
};
export type PaymentMode = 'freeTrial' | 'payAsYouGo' | 'payUpFront';
export type SubscriptionOffer = {
    displayPrice: string;
    id: string;
    paymentMode: PaymentMode;
    period: SubscriptionPeriod;
    periodCount: number;
    price: number;
    type: 'introductory' | 'promotional';
};
export type SubscriptionInfo = {
    introductoryOffer?: SubscriptionOffer;
    promotionalOffers?: SubscriptionOffer[];
    subscriptionGroupID: string;
    subscriptionPeriod: SubscriptionPeriod;
};
export type RefundRequestStatus = 'success' | 'userCancelled';
export type ProductSk2 = {
    currency: string;
    description: string;
    displayName: string;
    displayPrice: string;
    id: number;
    isFamilyShareable: boolean;
    jsonRepresentation: string;
    price: number;
    subscription: SubscriptionInfo;
    type: 'autoRenewable' | 'consumable' | 'nonConsumable' | 'nonRenewable';
};
export declare const productSk2Map: ({ id, description, displayName, price, currency, displayPrice, }: ProductSk2) => ProductIOS;
export declare const subscriptionSk2Map: ({ id, description, displayName, price, currency, displayPrice, subscription, }: ProductSk2) => SubscriptionIOS;
export type TransactionSk2 = {
    appAccountToken: string;
    appBundleID: string;
    debugDescription: string;
    deviceVerification: string;
    deviceVerificationNonce: string;
    expirationDate: number;
    environment?: 'Production' | 'Sandbox' | 'Xcode';
    id: number;
    isUpgraded: boolean;
    jsonRepresentation: string;
    offerID: string;
    offerType: string;
    originalID: string;
    originalPurchaseDate: number;
    ownershipType: string;
    productID: string;
    productType: string;
    purchaseDate: number;
    purchasedQuantity: number;
    revocationDate: number;
    revocationReason: string;
    signedDate: number;
    subscriptionGroupID: number;
    webOrderLineItemID: number;
    verificationResult?: string;
    jwsRepresentationIos?: string;
    environmentIos?: string;
    storefrontCountryCodeIos?: string;
    reasonIos?: string;
    offerIos?: {
        id: string;
        type: string;
        paymentMode: string;
    };
    priceIos?: number;
    currencyIos?: string;
};
export type TransactionError = PurchaseError;
/**
 * Only one of `transaction` and `error` is not undefined at the time
 */
export type TransactionEvent = {
    transaction?: TransactionSk2;
    error?: TransactionError;
};
export type SubscriptionStatus = 'expired' | 'inBillingRetryPeriod' | 'inGracePeriod' | 'revoked' | 'subscribed';
/**
 * Renewal info for whole subscription group.
 * see: https://developer.apple.com/documentation/storekit/product/subscriptioninfo/status/3822294-renewalinfo
 * WARN:
 * - autoRenewPreference is serialised as autoRenewProductId in jsonRepresentation
 * - renewalDate is available in jsonRepresentation (will change with Xcode 15 https://developer.apple.com/forums/thread/738833)
 */
export type RenewalInfo = {
    jsonRepresentation?: string;
    willAutoRenew: boolean;
    autoRenewPreference?: string;
};
export type ProductStatus = {
    state: SubscriptionStatus;
    renewalInfo?: RenewalInfo;
};
export declare const transactionSk2ToPurchaseMap: ({ id, originalPurchaseDate, productID, purchaseDate, purchasedQuantity, originalID, verificationResult, appAccountToken, jsonRepresentation, jwsRepresentationIos, environmentIos, storefrontCountryCodeIos, reasonIos, offerIos, priceIos, currencyIos, }: TransactionSk2) => Purchase;
/**
 * Payment discount interface @see https://developer.apple.com/documentation/storekit/skpaymentdiscount?language=objc
 */
export interface PaymentDiscountSk2 {
    /**
     * A string used to uniquely identify a discount offer for a product.
     */
    offerID: string;
    /**
     * A string that identifies the key used to generate the signature.
     */
    keyID: string;
    /**
     * A universally unique ID (UUID) value that you define.
     */
    nonce: string;
    /**
     * A UTF-8 string representing the properties of a specific discount offer, cryptographically signed.
     */
    signature: string;
    /**
     * The date and time of the signature's creation in milliseconds, formatted in Unix epoch time.
     */
    timestamp: number;
}
export declare const offerSk2Map: (offer: Apple.PaymentDiscount | undefined) => Record<keyof PaymentDiscountSk2, string> | undefined;
//# sourceMappingURL=appleSk2.d.ts.map