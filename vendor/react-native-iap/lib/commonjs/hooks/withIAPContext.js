"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIAPContext = useIAPContext;
exports.withIAPContext = withIAPContext;
var _react = _interopRequireWildcard(require("react"));
var _eventEmitter = require("../eventEmitter");
var _iap = require("../iap");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// @ts-ignore
const IAPContext = /*#__PURE__*/_react.default.createContext(null);
function useIAPContext() {
  const ctx = (0, _react.useContext)(IAPContext);
  if (!ctx) {
    throw new Error('You need wrap your app with withIAPContext HOC');
  }
  return ctx;
}
function withIAPContext(Component) {
  return function WrapperComponent(props) {
    const [connected, setConnected] = (0, _react.useState)(false);
    const [products, setProducts] = (0, _react.useState)([]);
    const [promotedProductsIOS, setPromotedProductsIOS] = (0, _react.useState)([]);
    const [subscriptions, setSubscriptions] = (0, _react.useState)([]);
    const [purchaseHistory, setPurchaseHistory] = (0, _react.useState)([]);
    const [availablePurchases, setAvailablePurchases] = (0, _react.useState)([]);
    const [currentPurchase, setCurrentPurchase] = (0, _react.useState)();
    const [currentTransaction, setCurrentTransaction] = (0, _react.useState)();
    const [currentPurchaseError, setCurrentPurchaseError] = (0, _react.useState)();
    const [initConnectionError, setInitConnectionError] = (0, _react.useState)();
    const context = (0, _react.useMemo)(() => ({
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
    (0, _react.useEffect)(() => {
      (0, _iap.initConnection)().then(value => {
        setInitConnectionError(undefined);
        setConnected(value);
      }).catch(setInitConnectionError);
    }, []);
    (0, _react.useEffect)(() => {
      if (!connected) {
        return;
      }
      const purchaseUpdateSubscription = (0, _eventEmitter.purchaseUpdatedListener)(async purchase => {
        setCurrentPurchaseError(undefined);
        setCurrentPurchase(purchase);
      });
      const transactionUpdateSubscription = (0, _eventEmitter.transactionListener)(async transactionOrError => {
        setCurrentPurchaseError(transactionOrError === null || transactionOrError === void 0 ? void 0 : transactionOrError.error);
        setCurrentTransaction(transactionOrError === null || transactionOrError === void 0 ? void 0 : transactionOrError.transaction);
      });
      const purchaseErrorSubscription = (0, _eventEmitter.purchaseErrorListener)(error => {
        setCurrentPurchase(undefined);
        setCurrentPurchaseError(error);
      });
      const promotedProductSubscription = (0, _eventEmitter.promotedProductListener)(async () => {
        const product = await _iap.IapIos.getPromotedProductIOS();
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
      _react.default.createElement(IAPContext.Provider, {
        value: context
      }, /*#__PURE__*/_react.default.createElement(Component, props))
    );
  };
}
//# sourceMappingURL=withIAPContext.js.map