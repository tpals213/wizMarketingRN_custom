import React, { useContext, useEffect, useMemo, useState } from 'react';
import { promotedProductListener, purchaseErrorListener, purchaseUpdatedListener, transactionListener } from '../eventEmitter';
import { IapIos, initConnection } from '../iap';
// @ts-ignore
const IAPContext = /*#__PURE__*/React.createContext(null);
export function useIAPContext() {
  const ctx = useContext(IAPContext);
  if (!ctx) {
    throw new Error('You need wrap your app with withIAPContext HOC');
  }
  return ctx;
}
export function withIAPContext(Component) {
  return function WrapperComponent(props) {
    const [connected, setConnected] = useState(false);
    const [products, setProducts] = useState([]);
    const [promotedProductsIOS, setPromotedProductsIOS] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [availablePurchases, setAvailablePurchases] = useState([]);
    const [currentPurchase, setCurrentPurchase] = useState();
    const [currentTransaction, setCurrentTransaction] = useState();
    const [currentPurchaseError, setCurrentPurchaseError] = useState();
    const [initConnectionError, setInitConnectionError] = useState();
    const context = useMemo(() => ({
      connected,
      products,
      subscriptions,
      promotedProductsIOS,
      purchaseHistory,
      availablePurchases,
      currentPurchase,
      currentTransaction,
      currentPurchaseError,
      initConnectionError,
      setConnected,
      setProducts,
      setSubscriptions,
      setPurchaseHistory,
      setAvailablePurchases,
      setCurrentPurchase,
      setCurrentPurchaseError
    }), [connected, products, subscriptions, promotedProductsIOS, purchaseHistory, availablePurchases, currentPurchase, currentTransaction, currentPurchaseError, initConnectionError, setConnected, setProducts, setSubscriptions, setPurchaseHistory, setAvailablePurchases, setCurrentPurchase, setCurrentPurchaseError]);
    useEffect(() => {
      initConnection().then(value => {
        setInitConnectionError(undefined);
        setConnected(value);
      }).catch(setInitConnectionError);
    }, []);
    useEffect(() => {
      if (!connected) {
        return;
      }
      const purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {
        setCurrentPurchaseError(undefined);
        setCurrentPurchase(purchase);
      });
      const transactionUpdateSubscription = transactionListener(async transactionOrError => {
        setCurrentPurchaseError(transactionOrError === null || transactionOrError === void 0 ? void 0 : transactionOrError.error);
        setCurrentTransaction(transactionOrError === null || transactionOrError === void 0 ? void 0 : transactionOrError.transaction);
      });
      const purchaseErrorSubscription = purchaseErrorListener(error => {
        setCurrentPurchase(undefined);
        setCurrentPurchaseError(error);
      });
      const promotedProductSubscription = promotedProductListener(async () => {
        const product = await IapIos.getPromotedProductIOS();
        setPromotedProductsIOS(prevProducts => [...prevProducts, ...(product ? [product] : [])]);
      });
      return () => {
        purchaseUpdateSubscription.remove();
        purchaseErrorSubscription.remove();
        promotedProductSubscription === null || promotedProductSubscription === void 0 || promotedProductSubscription.remove();
        transactionUpdateSubscription === null || transactionUpdateSubscription === void 0 || transactionUpdateSubscription.remove();
      };
    }, [connected]);
    return (
      /*#__PURE__*/
      // @ts-ignore
      React.createElement(IAPContext.Provider, {
        value: context
      }, /*#__PURE__*/React.createElement(Component, props))
    );
  };
}
//# sourceMappingURL=withIAPContext.js.map