/**
 * Type guard functions for react-native-iap
 */
import type { Product, ProductPurchase, ProductWithPlatform, Purchase, PurchaseWithPlatform } from '../types';
/**
 * Type guard to check if a product is from iOS
 */
export declare function isProductIos(product: Product | ProductWithPlatform): product is Product & {
    platform?: 'ios';
};
/**
 * Type guard to check if a product is from Android
 */
export declare function isProductAndroid(product: Product | ProductWithPlatform): product is Product & {
    platform?: 'android';
};
/**
 * Type guard to check if a purchase is from iOS
 */
export declare function isPurchaseIos(purchase: Purchase | PurchaseWithPlatform): purchase is Purchase & {
    platform?: 'ios';
};
/**
 * Type guard to check if a purchase is from Android
 */
export declare function isPurchaseAndroid(purchase: Purchase | PurchaseWithPlatform): purchase is Purchase & {
    platform?: 'android';
};
/**
 * Type guard to check if a purchase is from Amazon
 */
export declare function isPurchaseAmazon(purchase: Purchase | PurchaseWithPlatform): purchase is Purchase & {
    platform?: 'amazon';
};
/**
 * Type guard to check if an item is a ProductPurchase
 */
export declare function isProductPurchase(item: unknown): item is ProductPurchase;
/**
 * Helper to get the product ID from either field name
 */
export declare function getProductId(item: {
    productId?: string;
    id?: string;
}): string;
/**
 * Helper to get the display price from either field name
 */
export declare function getDisplayPrice(item: {
    localizedPrice?: string;
    displayPrice?: string;
}): string;
//# sourceMappingURL=typeGuards.d.ts.map