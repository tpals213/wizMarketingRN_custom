import type { AmazonModuleProps, AndroidModuleProps, IosModuleProps } from '../modules';
import type { IosModulePropsSk2 } from '../modules/iosSk2';
import type * as Apple from './apple';
export type Sku = string;
export type IosPlatform = {
    platform: 'ios';
};
export type AndroidPlatform = {
    platform: 'android';
};
export type AmazonPlatform = {
    platform: 'amazon';
};
export type ProrationModesAmazon = '' | 'DEFERRED' | 'IMMEDIATE';
export declare enum ReplacementModesAndroid {
    UNKNOWN_REPLACEMENT_MODE = 0,
    WITH_TIME_PRORATION = 1,
    CHARGE_PRORATED_PRICE = 2,
    WITHOUT_PRORATION = 3,
    CHARGE_FULL_PRICE = 5,
    DEFERRED = 6
}
export declare enum PurchaseStateAndroid {
    UNSPECIFIED_STATE = 0,
    PURCHASED = 1,
    PENDING = 2
}
export declare const PROMOTED_PRODUCT = "iap-promoted-product";
export declare enum InstallSourceAndroid {
    NOT_SET = 0,
    GOOGLE_PLAY = 1,
    AMAZON = 2
}
export declare enum ProductType {
    /** Subscription */
    subs = "subs",
    /** Subscription */
    sub = "sub",
    /** Consumable */
    inapp = "inapp",
    /** Consumable */
    iap = "iap"
}
export declare enum TransactionReason {
    PURCHASE = "PURCHASE",
    RENEWAL = "RENEWAL"
}
export interface ProductCommon {
    type: 'subs' | 'sub' | 'inapp' | 'iap';
    productId: string;
    id?: string;
    productIds?: string[];
    title: string;
    description: string;
    price: string;
    currency: string;
    localizedPrice: string;
    displayPrice?: string;
    originalPrice?: string;
    countryCode?: string;
}
export interface ProductPurchase {
    productId: string;
    id?: string;
    ids?: string[];
    transactionId?: string;
    transactionDate: number;
    transactionReceipt: string;
    purchaseToken?: string;
    quantityIOS?: number;
    originalTransactionDateIOS?: number;
    originalTransactionIdentifierIOS?: string;
    verificationResultIOS?: string;
    appAccountToken?: string;
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
    expirationDateIos?: number;
    webOrderLineItemIdIos?: number;
    appBundleIdIos?: string;
    productTypeIos?: string;
    subscriptionGroupIdIos?: string;
    isUpgradedIos?: boolean;
    ownershipTypeIos?: string;
    reasonStringRepresentationIos?: string;
    transactionReasonIOS?: TransactionReason | string;
    revocationDateIos?: number;
    revocationReasonIos?: string;
    productIds?: string[];
    dataAndroid?: string;
    signatureAndroid?: string;
    autoRenewingAndroid?: boolean;
    purchaseStateAndroid?: PurchaseStateAndroid;
    isAcknowledgedAndroid?: boolean;
    packageNameAndroid?: string;
    developerPayloadAndroid?: string;
    obfuscatedAccountIdAndroid?: string;
    obfuscatedProfileIdAndroid?: string;
    userIdAmazon?: string;
    userMarketplaceAmazon?: string;
    userJsonAmazon?: string;
    isCanceledAmazon?: boolean;
}
export type AppTransaction = {
    appTransactionID?: string;
    originalPlatform?: string;
    originalAppVersion: string;
    originalPurchaseDate: number;
    deviceVerification: string;
    deviceVerificationNonce: string;
    appVersion: string;
    signedDate: number;
    environment: string;
};
export interface PurchaseResult {
    responseCode?: number;
    debugMessage?: string;
    code?: string;
    message?: string;
    purchaseToken?: string;
}
export interface SubscriptionPurchase extends ProductPurchase {
    autoRenewingAndroid?: boolean;
    originalTransactionDateIOS?: number;
    originalTransactionIdentifierIOS?: string;
    verificationResultIOS?: string;
    transactionReasonIOS?: TransactionReason | string;
}
export type PurchaseWithPlatform = ((ProductPurchase & {
    productIds?: string[];
}) & AndroidPlatform) | ((ProductPurchase & {
    quantityIOS?: number;
}) & IosPlatform) | ((ProductPurchase & {
    userIdAmazon?: string;
}) & AmazonPlatform) | SubscriptionPurchase;
export type Purchase = ProductPurchase | SubscriptionPurchase;
export interface Discount {
    identifier: string;
    type: string;
    numberOfPeriods: string;
    price: string;
    localizedPrice: string;
    paymentMode: '' | 'FREETRIAL' | 'PAYASYOUGO' | 'PAYUPFRONT';
    subscriptionPeriod: string;
}
export interface ProductAndroid extends ProductCommon {
    type: 'inapp' | 'iap';
    name?: string;
    oneTimePurchaseOfferDetails?: {
        priceCurrencyCode: string;
        formattedPrice: string;
        priceAmountMicros: string;
    };
}
export interface ProductIOS extends ProductCommon {
    type: 'inapp' | 'iap';
    displayName?: string;
    isFamilyShareable?: boolean;
    jsonRepresentation?: string;
    subscription?: any;
}
export type ProductLegacy = ProductAndroid & ProductIOS;
export type ProductWithPlatform = (ProductAndroid & AndroidPlatform) | (ProductIOS & IosPlatform);
export type Product = ProductAndroid & ProductIOS;
/**
 * Can be used to distinguish the different platforms' subscription information
 */
export declare enum SubscriptionPlatform {
    android = "android",
    amazon = "amazon",
    ios = "ios"
}
/** Android Billing v5 type */
export interface SubscriptionAndroid {
    platform: SubscriptionPlatform.android;
    productType: 'subs';
    name: string;
    title: string;
    description: string;
    productId: string;
    subscriptionOfferDetails: SubscriptionOfferAndroid[];
}
export interface SubscriptionOfferAndroid {
    basePlanId: string;
    offerId: string | null;
    offerToken: string;
    pricingPhases: {
        pricingPhaseList: PricingPhaseAndroid[];
    };
    offerTags: string[];
}
export interface PricingPhaseAndroid {
    formattedPrice: string;
    priceCurrencyCode: string;
    /**
     * P1W, P1M, P1Y
     */
    billingPeriod: string;
    billingCycleCount: number;
    priceAmountMicros: string;
    recurrenceMode: number;
}
/**
 * TODO: As of 2022-10-10, this typing is not verified against the real
 * Amazon API. Please update this if you have a more accurate type.
 */
export interface SubscriptionAmazon extends ProductCommon {
    platform: SubscriptionPlatform.amazon;
    type: 'subs';
    productType?: string;
    name?: string;
}
export type SubscriptionIosPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | '';
export interface SubscriptionIOS extends ProductCommon {
    platform: SubscriptionPlatform.ios;
    type: 'subs';
    discounts?: Discount[];
    introductoryPrice?: string;
    introductoryPriceAsAmountIOS?: string;
    introductoryPricePaymentModeIOS?: '' | 'FREETRIAL' | 'PAYASYOUGO' | 'PAYUPFRONT';
    introductoryPriceNumberOfPeriodsIOS?: string;
    introductoryPriceSubscriptionPeriodIOS?: SubscriptionIosPeriod;
    subscriptionPeriodNumberIOS?: string;
    subscriptionPeriodUnitIOS?: SubscriptionIosPeriod;
}
export type Subscription = SubscriptionAndroid | SubscriptionAmazon | SubscriptionIOS;
export interface RequestPurchaseBaseAndroid {
    obfuscatedAccountIdAndroid?: string;
    obfuscatedProfileIdAndroid?: string;
    isOfferPersonalized?: boolean;
}
export interface RequestPurchaseAndroid extends RequestPurchaseBaseAndroid {
    skus: Sku[];
}
export interface RequestPurchaseIOS {
    sku: Sku;
    andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
    /**
     * UUID representing user account
     */
    appAccountToken?: string;
    quantity?: number;
    withOffer?: Apple.PaymentDiscount;
}
/** As of 2022-10-12, we only use the `sku` field for Amazon purchases */
export type RequestPurchaseAmazon = RequestPurchaseIOS;
export type RequestPurchase = RequestPurchaseAndroid | RequestPurchaseAmazon | RequestPurchaseIOS;
/**
 * In order to purchase a new subscription, every sku must have a selected offerToken
 * @see SubscriptionAndroid.subscriptionOfferDetails.offerToken
 */
export interface SubscriptionOffer {
    sku: Sku;
    offerToken: string;
}
export interface RequestSubscriptionAndroid extends RequestPurchaseBaseAndroid {
    purchaseTokenAndroid?: string;
    replacementModeAndroid?: ReplacementModesAndroid;
    subscriptionOffers: SubscriptionOffer[];
}
export type RequestSubscriptionIOS = RequestPurchaseIOS;
/** As of 2022-10-12, we only use the `sku` field for Amazon subscriptions */
export interface RequestSubscriptionAmazon extends RequestSubscriptionIOS {
    prorationModeAmazon?: ProrationModesAmazon;
}
export type RequestSubscription = RequestSubscriptionAndroid | RequestSubscriptionAmazon | RequestSubscriptionIOS;
export interface UnifiedRequestPurchaseProps {
    readonly sku?: string;
    readonly skus?: string[];
    readonly andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
    readonly appAccountToken?: string;
    readonly quantity?: number;
    readonly withOffer?: Apple.PaymentDiscount;
    readonly obfuscatedAccountIdAndroid?: string;
    readonly obfuscatedProfileIdAndroid?: string;
    readonly isOfferPersonalized?: boolean;
}
export interface UnifiedRequestSubscriptionProps extends UnifiedRequestPurchaseProps {
    readonly purchaseTokenAndroid?: string;
    readonly replacementModeAndroid?: number;
    readonly subscriptionOffers?: {
        sku: string;
        offerToken: string;
    }[];
}
declare module 'react-native' {
    interface NativeModulesStatic {
        RNIapIos: IosModuleProps;
        RNIapIosSk2: IosModulePropsSk2;
        RNIapModule: AndroidModuleProps;
        RNIapAmazonModule: AmazonModuleProps;
    }
}
//# sourceMappingURL=index.d.ts.map