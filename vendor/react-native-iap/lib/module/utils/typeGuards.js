/**
 * Type guard functions for react-native-iap
 */

import { Platform } from 'react-native';
/**
 * Type guard to check if a product is from iOS
 */
export function isProductIos(product) {
  return Platform.OS === 'ios' || product.platform === 'ios';
}

/**
 * Type guard to check if a product is from Android
 */
export function isProductAndroid(product) {
  return Platform.OS === 'android' || product.platform === 'android';
}

/**
 * Type guard to check if a purchase is from iOS
 */
export function isPurchaseIos(purchase) {
  return Platform.OS === 'ios' || purchase.platform === 'ios';
}

/**
 * Type guard to check if a purchase is from Android
 */
export function isPurchaseAndroid(purchase) {
  return Platform.OS === 'android' || purchase.platform === 'android';
}

/**
 * Type guard to check if a purchase is from Amazon
 */
export function isPurchaseAmazon(purchase) {
  return purchase.platform === 'amazon' || !!purchase.userIdAmazon;
}

/**
 * Type guard to check if an item is a ProductPurchase
 */
export function isProductPurchase(item) {
  return item != null && typeof item === 'object' && 'productId' in item && 'transactionDate' in item && 'transactionReceipt' in item;
}

/**
 * Helper to get the product ID from either field name
 */
export function getProductId(item) {
  return item.productId || item.id || '';
}

/**
 * Helper to get the display price from either field name
 */
export function getDisplayPrice(item) {
  return item.displayPrice || item.localizedPrice || '';
}
//# sourceMappingURL=typeGuards.js.map