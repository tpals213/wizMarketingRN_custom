import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { finishTransaction as iapFinishTransaction, getAvailablePurchases as iapGetAvailablePurchases, getProducts as iapGetProducts, getPurchaseHistory as iapGetPurchaseHistory, getSubscriptions as iapGetSubscriptions, requestPurchase as iapRequestPurchase, requestSubscription as iapRequestSubscription } from '../iap';
import { sync, validateReceiptIos } from '../modules/iosSk2';
import { useIAPContext } from './withIAPContext';
export const useIAP = options => {
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
  } = useIAPContext();
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Helper function to merge arrays with duplicate checking
  const mergeWithDuplicateCheck = useCallback((existingItems, newItems, getKey) => {
    const merged = [...existingItems];
    newItems.forEach(newItem => {
      const isDuplicate = merged.some(existingItem => getKey(existingItem) === getKey(newItem));
      if (!isDuplicate) {
        merged.push(newItem);
      }
    });
    return merged;
  }, []);
  const clearCurrentPurchase = useCallback(() => {
    setCurrentPurchase(undefined);
  }, [setCurrentPurchase]);
  const clearCurrentPurchaseError = useCallback(() => {
    setCurrentPurchaseError(undefined);
  }, [setCurrentPurchaseError]);
  const getProducts = useCallback(async ({
    skus
  }) => {
    try {
      const result = await iapGetProducts({
        skus
      });
      setProducts(mergeWithDuplicateCheck(products, result, product => product.productId || ''));
    } catch (error) {
      console.error('Error getting products:', error);
    }
  }, [setProducts, mergeWithDuplicateCheck, products]);
  const getSubscriptions = useCallback(async ({
    skus
  }) => {
    try {
      const result = await iapGetSubscriptions({
        skus
      });
      setSubscriptions(mergeWithDuplicateCheck(subscriptions, result, subscription => subscription.productId || ''));
    } catch (error) {
      console.error('Error getting subscriptions:', error);
    }
  }, [setSubscriptions, mergeWithDuplicateCheck, subscriptions]);
  const getAvailablePurchases = useCallback(async () => {
    try {
      const result = await iapGetAvailablePurchases();
      setAvailablePurchases(result);
    } catch (error) {
      console.error('Error getting available purchases:', error);
    }
  }, [setAvailablePurchases]);
  const getPurchaseHistory = useCallback(async () => {
    try {
      const result = await iapGetPurchaseHistory();
      setPurchaseHistory(result);
    } catch (error) {
      console.error('Error getting purchase history:', error);
    }
  }, [setPurchaseHistory]);
  const finishTransaction = useCallback(async ({
    purchase,
    isConsumable,
    developerPayloadAndroid
  }) => {
    try {
      return await iapFinishTransaction({
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
  const restorePurchases = useCallback(async () => {
    try {
      var _optionsRef$current;
      // Try to sync with store on iOS
      if (Platform.OS === 'ios' && ((_optionsRef$current = optionsRef.current) === null || _optionsRef$current === void 0 ? void 0 : _optionsRef$current.shouldAutoSyncPurchases) !== false) {
        try {
          await sync();
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
  const validateReceipt = useCallback(async (sku, androidOptions) => {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, use the new validateReceiptIos function
        const result = await validateReceiptIos(sku);
        return result;
      } else if (Platform.OS === 'android' && androidOptions) {
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
  useEffect(() => {
    var _optionsRef$current3;
    if (currentPurchase && (_optionsRef$current3 = optionsRef.current) !== null && _optionsRef$current3 !== void 0 && _optionsRef$current3.onPurchaseSuccess) {
      optionsRef.current.onPurchaseSuccess(currentPurchase);
    }
  }, [currentPurchase]);
  useEffect(() => {
    var _optionsRef$current4;
    if (currentPurchaseError && (_optionsRef$current4 = optionsRef.current) !== null && _optionsRef$current4 !== void 0 && _optionsRef$current4.onPurchaseError) {
      optionsRef.current.onPurchaseError(currentPurchaseError);
    }
  }, [currentPurchaseError]);
  useEffect(() => {
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
    requestPurchase: iapRequestPurchase,
    requestSubscription: iapRequestSubscription,
    restorePurchases,
    validateReceipt
  };
};
//# sourceMappingURL=useIAP.js.map