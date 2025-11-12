import React from 'react';
import type { PurchaseError } from '../purchaseError';
import type { Product, Purchase, Subscription } from '../types';
import type { TransactionSk2 } from '../types/appleSk2';
type IAPContextType = {
    connected: boolean;
    products: Product[];
    promotedProductsIOS: Product[];
    subscriptions: Subscription[];
    purchaseHistory: Purchase[];
    availablePurchases: Purchase[];
    currentPurchase?: Purchase;
    currentTransaction?: TransactionSk2;
    currentPurchaseError?: PurchaseError;
    initConnectionError?: Error;
    setConnected: (connected: boolean) => void;
    setProducts: (products: Product[]) => void;
    setSubscriptions: (subscriptions: Subscription[]) => void;
    setPurchaseHistory: (purchaseHistory: Purchase[]) => void;
    setAvailablePurchases: (availablePurchases: Purchase[]) => void;
    setCurrentPurchase: (currentPurchase: Purchase | undefined) => void;
    setCurrentPurchaseError: (currentPurchaseError: PurchaseError | undefined) => void;
};
export declare function useIAPContext(): IAPContextType;
export declare function withIAPContext<T>(Component: React.ComponentType<T>): (props: T) => React.JSX.Element;
export {};
//# sourceMappingURL=withIAPContext.d.ts.map