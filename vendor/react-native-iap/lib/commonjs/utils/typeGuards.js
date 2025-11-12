"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDisplayPrice = getDisplayPrice;
exports.getProductId = getProductId;
exports.isProductAndroid = isProductAndroid;
exports.isProductIos = isProductIos;
exports.isProductPurchase = isProductPurchase;
exports.isPurchaseAmazon = isPurchaseAmazon;
exports.isPurchaseAndroid = isPurchaseAndroid;
exports.isPurchaseIos = isPurchaseIos;
var _reactNative = require("react-native");
/**
 * Type guard functions for react-native-iap
 */

/**
 * Type guard to check if a product is from iOS
 */
function isProductIos(product) {
  return _reactNative.Platform.OS === 'ios' || product.platform === 'ios';
}

/**
 * Type guard to check if a product is from Android
 */
function isProductAndroid(product) {
  return _reactNative.Platform.OS === 'android' || product.platform === 'android';
}

/**
 * Type guard to check if a purchase is from iOS
 */
function isPurchaseIos(purchase) {
  return _reactNative.Platform.OS === 'ios' || purchase.platform === 'ios';
}

/**
 * Type guard to check if a purchase is from Android
 */
function isPurchaseAndroid(purchase) {
  return _reactNative.Platform.OS === 'android' || purchase.platform === 'android';
}

/**
 * Type guard to check if a purchase is from Amazon
 */
function isPurchaseAmazon(purchase) {
  return purchase.platform === 'amazon' || !!purchase.userIdAmazon;
}

/**
 * Type guard to check if an item is a ProductPurchase
 */
function isProductPurchase(item) {
  return item != null && typeof item === 'object' && 'productId' in item && 'transactionDate' in item && 'transactionReceipt' in item;
}

/**
 * Helper to get the product ID from either field name
 */
function getProductId(item) {
  return item.productId || item.id || '';
}

/**
 * Helper to get the display price from either field name
 */
function getDisplayPrice(item) {
  return item.displayPrice || item.localizedPrice || '';
}
//# sourceMappingURL=typeGuards.js.map