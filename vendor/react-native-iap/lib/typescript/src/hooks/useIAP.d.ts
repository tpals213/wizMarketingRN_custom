import { requestPurchase as iapRequestPurchase, requestSubscription as iapRequestSubscription } from '../iap';
import type { PurchaseError } from '../purchaseError';
import type { Product, Purchase, PurchaseResult, Subscription } from '../types';
export interface UseIAPOptions {
    onPurchaseSuccess?: (purchase: Purchase) => void;
    onPurchaseError?: (error: PurchaseError) => void;
    onSyncError?: (error: Error) => void;
    shouldAutoSyncPurchases?: boolean;
}
type IAP_STATUS = {
    connected: boolean;
    products: Product[];
    promotedProductsIOS: Product[];
    subscriptions: Subscription[];
    purchaseHistory: Purchase[];
    availablePurchases: Purchase[];
    currentPurchase?: Purchase;
    currentPurchaseError?: PurchaseError;
    initConnectionError?: Error;
    clearCurrentPurchase: () => void;
    clearCurrentPurchaseError: () => void;
    finishTransaction: ({ purchase, isConsumable, developerPayloadAndroid, }: {
        purchase: Purchase;
        isConsumable?: boolean;
        developerPayloadAndroid?: string;
    }) => Promise<string | boolean | PurchaseResult | void>;
    getAvailablePurchases: () => Promise<void>;
    getPurchaseHistory: () => Promise<void>;
    getProducts: ({ skus }: {
        skus: string[];
    }) => Promise<void>;
    getSubscriptions: ({ skus }: {
        skus: string[];
    }) => Promise<void>;
    requestPurchase: typeof iapRequestPurchase;
    requestSubscription: typeof iapRequestSubscription;
    restorePurchases: () => Promise<void>;
    validateReceipt: (sku: string, androidOptions?: {
        packageName: string;
        productToken: string;
        accessToken: string;
        isSub?: boolean;
    }) => Promise<any>;
};
export declare const useIAP: (options?: UseIAPOptions) => IAP_STATUS;
export {};
//# sourceMappingURL=useIAP.d.ts.map