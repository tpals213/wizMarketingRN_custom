"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fillProductsWithAdditionalData = void 0;
var _reactNative = require("react-native");
const {
  RNIapAmazonModule
} = _reactNative.NativeModules;

/**
 * For Amazon products, we add the currency code from the user's information
 * since it isn't included in the product information.
 */
const fillProductsWithAdditionalData = async items => {
  if (RNIapAmazonModule) {
    // On amazon we must get the user marketplace to detect the currency
    const user = await RNIapAmazonModule.getUser();
    const currencies = {
      CA: 'CAD',
      ES: 'EUR',
      AU: 'AUD',
      DE: 'EUR',
      IN: 'INR',
      US: 'USD',
      JP: 'JPY',
      GB: 'GBP',
      IT: 'EUR',
      BR: 'BRL',
      FR: 'EUR'
    };
    const currency = currencies[user.userMarketplaceAmazon];

    // Add currency to items
    items.forEach(item => {
      if (currency) {
        const {
          originalPrice
        } = item;
        item.currency = currency;
        item.price = originalPrice ?? '0.0';
        item.localizedPrice = originalPrice ?? '0.0';
      }
    });
  }
  return items;
};
exports.fillProductsWithAdditionalData = fillProductsWithAdditionalData;
//# sourceMappingURL=fillProductsWithAdditionalData.js.map