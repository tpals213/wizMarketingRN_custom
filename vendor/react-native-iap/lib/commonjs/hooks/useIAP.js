"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIAP = void 0;
var _react = require("react");
var _reactNative = require("react-native");
var _iap = require("../iap");
var _iosSk = require("../modules/iosSk2");
var _withIAPContext = require("./withIAPContext");
const useIAP = options => {
  const {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistory,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    setConnected,
    setProducts,
    setSubscriptions,
    setAvailablePurchases,
    setPurchaseHistory,
    setCurrentPurchase,
    setCurrentPurchaseError
  } = (0, _withIAPContext.useIAPContext)();
  const optionsRef = (0, _react.useRef)(options);
  (0, _react.useEffect)(() => {
    optionsRef.current = options;
  }, [options]);

  // Helper function to merge arrays with duplicate checking
  const mergeWithDuplicateCheck = (0, _react.useCallback)((existingItems, newItems, getKey) => {
    const merged = [...existingItems];
    newItems.forEach(newItem => {
      const isDuplicate = merged.some(existingItem => getKey(existingItem) === getKey(newItem));
      if (!isDuplicate) {
        merged.push(newItem);
      }
    });
    return merged;
  }, []);
  const clearCurrentPurchase = (0, _react.useCallback)(() => {
    setCurrentPurchase(undefined);
  }, [setCurrentPurchase]);
  const clearCurrentPurchaseError = (0, _react.useCallback)(() => {
    setCurrentPurchaseError(undefined);
  }, [setCurrentPurchaseError]);
  const getProducts = (0, _react.useCallback)(async ({
    skus
  }) => {
    try {
      const result = await (0, _iap.getProducts)({
        skus
      });
      setProducts(mergeWithDuplicateCheck(products, result, product => product.productId || ''));
    } catch (error) {
      console.error('Error getting products:', error);
    }
  }, [setProducts, mergeWithDuplicateCheck, products]);
  const getSubscriptions = (0, _react.useCallback)(async ({
    skus
  }) => {
    try {
      const result = await (0, _iap.getSubscriptions)({
        skus
      });
      setSubscriptions(mergeWithDuplicateCheck(subscriptions, result, subscription => subscription.productId || ''));
    } catch (error) {
      console.error('Error getting subscriptions:', error);
    }
  }, [setSubscriptions, mergeWithDuplicateCheck, subscriptions]);
  const getAvailablePurchases = (0, _react.useCallback)(async () => {
    try {
      const result = await (0, _iap.getAvailablePurchases)();
      setAvailablePurchases(result);
    } catch (error) {
      console.error('Error getting available purchases:', error);
    }
  }, [setAvailablePurchases]);
  const getPurchaseHistory = (0, _react.useCallback)(async () => {
    try {
      const result = await (0, _iap.getPurchaseHistory)();
      setPurchaseHistory(result);
    } catch (error) {
      console.error('Error getting purchase history:', error);
    }
  }, [setPurchaseHistory]);
  const finishTransaction = (0, _react.useCallback)(async ({
    purchase,
    isConsumable,
    developerPayloadAndroid
  }) => {
    try {
      return await (0, _iap.finishTransaction)({
        purchase,
        isConsumable,
        developerPayloadAndroid
      });
    } catch (err) {
      throw err;
    } finally {
      if (purchase.productId === (currentPurchase === null || currentPurchase === void 0 ? void 0 : currentPurchase.productId)) {
        setCurrentPurchase(undefined);
      }
      if (purchase.productId === (currentPurchaseError === null || currentPurchaseError === void 0 ? void 0 : currentPurchaseError.productId)) {
        setCurrentPurchaseError(undefined);
      }
    }
  }, [currentPurchase === null || currentPurchase === void 0 ? void 0 : currentPurchase.productId, currentPurchaseError === null || currentPurchaseError === void 0 ? void 0 : currentPurchaseError.productId, setCurrentPurchase, setCurrentPurchaseError]);
  const restorePurchases = (0, _react.useCallback)(async () => {
    try {
      var _optionsRef$current;
      // Try to sync with store on iOS
      if (_reactNative.Platform.OS === 'ios' && ((_optionsRef$current = optionsRef.current) === null || _optionsRef$current === void 0 ? void 0 : _optionsRef$current.shouldAutoSyncPurchases) !== false) {
        try {
          await (0, _iosSk.sync)();
        } catch (syncError) {
          var _optionsRef$current2, _optionsRef$current2$;
          console.error('Sync error:', syncError);
          (_optionsRef$current2 = optionsRef.current) === null || _optionsRef$current2 === void 0 || (_optionsRef$current2$ = _optionsRef$current2.onSyncError) === null || _optionsRef$current2$ === void 0 || _optionsRef$current2$.call(_optionsRef$current2, syncError);
        }
      }

      // Get available purchases
      await getAvailablePurchases();
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  }, [getAvailablePurchases]);
  const validateReceipt = (0, _react.useCallback)(async (sku, androidOptions) => {
    try {
      if (_reactNative.Platform.OS === 'ios') {
        // For iOS, use the new validateReceiptIos function
        const result = await (0, _iosSk.validateReceiptIos)(sku);
        return result;
      } else if (_reactNative.Platform.OS === 'android' && androidOptions) {
        // For Android, you would need to implement server-side validation
        // This is a placeholder - Android validation should be done server-side
        console.warn('Android receipt validation should be performed server-side');
        return {
          isValid: false,
          message: 'Android receipt validation should be performed server-side'
        };
      }
      throw new Error('Invalid platform or missing options for receipt validation');
    } catch (error) {
      console.error('Error validating receipt:', error);
      throw error;
    }
  }, []);

  // Listen for purchase events and trigger callbacks
  (0, _react.useEffect)(() => {
    var _optionsRef$current3;
    if (currentPurchase && (_optionsRef$current3 = optionsRef.current) !== null && _optionsRef$current3 !== void 0 && _optionsRef$current3.onPurchaseSuccess) {
      optionsRef.current.onPurchaseSuccess(currentPurchase);
    }
  }, [currentPurchase]);
  (0, _react.useEffect)(() => {
    var _optionsRef$current4;
    if (currentPurchaseError && (_optionsRef$current4 = optionsRef.current) !== null && _optionsRef$current4 !== void 0 && _optionsRef$current4.onPurchaseError) {
      optionsRef.current.onPurchaseError(currentPurchaseError);
    }
  }, [currentPurchaseError]);
  (0, _react.useEffect)(() => {
    setConnected(true);
    return () => {
      setConnected(false);
      setCurrentPurchaseError(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistory,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    clearCurrentPurchase,
    clearCurrentPurchaseError,
    finishTransaction,
    getProducts,
    getSubscriptions,
    getAvailablePurchases,
    getPurchaseHistory,
    requestPurchase: _iap.requestPurchase,
    requestSubscription: _iap.requestSubscription,
    restorePurchases,
    validateReceipt
  };
};
exports.useIAP = useIAP;
//# sourceMappingURL=useIAP.js.map