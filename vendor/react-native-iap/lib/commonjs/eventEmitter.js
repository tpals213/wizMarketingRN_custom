"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transactionListener = exports.purchaseUpdatedListener = exports.purchaseErrorListener = exports.promotedProductListener = void 0;
var _reactNative = require("react-native");
var _appleSk = require("./types/appleSk2");
var _iap = require("./iap");
var _internal = require("./internal");
/**
 * Add IAP purchase event
 * Register a callback that gets called when the store has any updates to purchases that have not yet been finished, consumed or acknowledged. Returns a React Native `EmitterSubscription` on which you can call `.remove()` to stop receiving updates. Register you listener as soon as possible and react to updates at all times.

## Signature

```ts
purchaseUpdatedListener((purchase: Purchase) => {});
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {purchaseUpdatedListener} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    const subscription = purchaseUpdatedListener((purchase: Purchase) => {
      console.log(purchase);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View />;
};
```
 */
const purchaseUpdatedListener = (listener, errorCallback) => {
  const eventEmitter = new _reactNative.NativeEventEmitter((0, _internal.getNativeModule)());
  const proxyListener = (0, _iap.isIosStorekit2)() ? event => {
    listener((0, _appleSk.transactionSk2ToPurchaseMap)(event));
  } : listener;
  const emitterSubscription = eventEmitter.addListener('purchase-updated', proxyListener);
  if (_internal.isAndroid) {
    (0, _internal.getAndroidModule)().startListening().catch(error => {
      if (errorCallback) {
        errorCallback(error);
      } else {
        throw error;
      }
    });
  }
  return emitterSubscription;
};

/**
 * Add IAP purchase error event
 * Register a callback that gets called when there has been an error with a purchase. Returns a React Native `EmitterSubscription` on which you can call `.remove()` to stop receiving updates.

## Signature

```ts
purchaseErrorListener((error: PurchaseError) => {});
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {purchaseErrorListener} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    const subscription = purchaseErrorListener((error: PurchaseError) => {
      console.log(error);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View />;
};
```

 */
exports.purchaseUpdatedListener = purchaseUpdatedListener;
const purchaseErrorListener = listener => {
  const eventEmitter = new _reactNative.NativeEventEmitter((0, _internal.getNativeModule)());
  return eventEmitter.addListener('purchase-error', listener);
};

/**
 * Add IAP promoted subscription event
 * Add IAP promoted subscription event.

## Signature

```ts
promotedProductListener((productId?: string) => {});
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {promotedProductListener} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    const subscription = promotedProductListener((productId) => {
      console.log(productId);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View />;
};
```

 *
 * @platform iOS
 */
exports.purchaseErrorListener = purchaseErrorListener;
const promotedProductListener = listener => {
  if (_internal.isIos && !(0, _iap.isIosStorekit2)()) {
    const eventEmitter = new _reactNative.NativeEventEmitter((0, _internal.getIosModule)());
    return eventEmitter.addListener('iap-promoted-product', listener);
  }
  return null;
};

/**
 * Updated transactions for iOS Sk2
 * Register a callback that gets called when the store has any updates to transactions related to purchases that have not yet been finished, consumed or acknowledged. 
 * Returns a React Native `EmitterSubscription` on which you can call `.remove()` to stop receiving updates. Register you listener as soon as possible and react to updates at all times.

**Warning**
This is only available for iOS 15 and higher and Storekit 2 is activated

## Signature

```ts
purchaseUpdatedListener((transactionOrError: TransactionOrError) => {});
```

## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {purchaseUpdatedListener} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    const subscription = purchaseUpdatedListener((transactionOrError: TransactionOrError) => {
      if(transactionOrError.transaction){
        console.log("There's an update to a transaction", transactionOrError.transaction);
      }else{
        console.log("There's been an error with a received transaction")
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <View />;
};
```
 *
 * @platform iOS (Sk2)
 */
exports.promotedProductListener = promotedProductListener;
const transactionListener = listener => {
  if (_internal.isIos && (0, _iap.isIosStorekit2)()) {
    const eventEmitter = new _reactNative.NativeEventEmitter((0, _internal.getIosModule)());
    return eventEmitter.addListener('iap-transaction-updated', listener);
  }
  return null;
};
exports.transactionListener = transactionListener;
//# sourceMappingURL=eventEmitter.js.map