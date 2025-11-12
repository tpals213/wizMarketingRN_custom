import * as IapAmazon from './modules/amazon';
import * as IapAndroid from './modules/android';
import * as IapIos from './modules/ios';
import * as IapIosSk2 from './modules/iosSk2';
import { isIosStorekit2 } from './internal';
import { Product, ProductPurchase, Purchase, PurchaseResult, RequestPurchase, RequestSubscription, Subscription, SubscriptionPurchase } from './types';
export { IapAndroid, IapAmazon, IapIos, IapIosSk2, isIosStorekit2 };
/**
 * STOREKIT1_MODE: Will not enable Storekit 2 even if the device supports it. Thigs will work as before,
 * minimum changes required in the migration guide (default)
 * HYBRID_MODE: Will enable Storekit 2 for iOS devices > 15.0 but will fallback to Sk1 on older devices
 * There are some edge cases that you need to handle in this case (described in migration guide). This mode
 * is for developers that are migrating to Storekit 2 but want to keep supporting older versions.
 * STOREKIT2_MODE: Will *only* enable Storekit 2. This disables Storekit 1. This is for apps that
 * have already targeted a min version of 15 for their app.
 */
export type STOREKIT_OPTIONS = 'STOREKIT1_MODE' | 'STOREKIT_HYBRID_MODE' | 'STOREKIT2_MODE';
export declare const setup: ({ storekitMode, }?: {
    storekitMode?: STOREKIT_OPTIONS | undefined;
}) => void;
/**
 * Init module for purchase flow. Required on Android. In ios it will check whether user canMakePayment.
 * ## Usage

```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {initConnection} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    void initConnection();
  }, []);

  return <View />;
};
```
 */
export declare const initConnection: () => Promise<boolean>;
/**
 * Disconnects from native SDK
 * Usage
 * ```tsx
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {endConnection} from 'react-native-iap';

const App = () => {
  useEffect(() => {
    return () => {
      void endConnection();
    };
  }, []);

  return <View />;
};
```
 * @returns {Promise<void>}
 */
export declare const endConnection: () => Promise<boolean>;
/**
 * Consume all 'ghost' purchases (that is, pending payment that already failed but is still marked as pending in Play Store cache). Android only.
 * @returns {Promise<boolean>}
 */
export declare const flushFailedPurchasesCachedAsPendingAndroid: () => Promise<boolean>;
/**
 * Get a list of products (consumable and non-consumable items, but not subscriptions)
 ## Usage

```ts
import React, {useState} from 'react';
import {Platform} from 'react-native';
import {getProducts, Product} from 'react-native-iap';

const skus = Platform.select({
  ios: ['com.example.consumableIos'],
  android: ['com.example.consumableAndroid'],
});

const App = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const handleProducts = async () => {
    const items = await getProducts({skus});

    setProducts(items);
  };

  useEffect(() => {
    void handleProducts();
  }, []);

  return (
    <>
      {products.map((product) => (
        <Text key={product.productId}>{product.productId}</Text>
      ))}
    </>
  );
};
```

Just a few things to keep in mind:

- You can get your products in `componentDidMount`, `useEffect` or another appropriate area of your app.
- Since a user may start your app with a bad or no internet connection, preparing/getting the items more than once may be a good idea.
- If the user has no IAPs available when the app starts first, you may want to check again when the user enters your IAP store.

 */
export declare const getProducts: ({ skus, }: {
    skus: string[];
}) => Promise<Array<Product>>;
/**
 * Get a list of subscriptions
 * ## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getSubscriptions} from 'react-native-iap';

const App = () => {
  const subscriptions = useCallback(
    async () =>
      await getSubscriptions({skus:['com.example.product1', 'com.example.product2']}),
    [],
  );

  return <View />;
};
```

 */
export declare const getSubscriptions: ({ skus, }: {
    skus: string[];
}) => Promise<Subscription[]>;
/**
 * Gets an inventory of purchases made by the user regardless of consumption status
 * ## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getPurchaseHistory} from 'react-native-iap';

const App = () => {
  const history = useCallback(
    async () =>
      await getPurchaseHistory([
        'com.example.product1',
        'com.example.product2',
      ]),
    [],
  );

  return <View />;
};
```
@param {alsoPublishToEventListener}:boolean. (IOS Sk2 only) When `true`, every element will also be pushed to the purchaseUpdated listener.
Note that this is only for backaward compatiblity. It won't publish to transactionUpdated (Storekit2) Defaults to `false`
@param {automaticallyFinishRestoredTransactions}:boolean. (IOS Sk1 only) When `true`, all the transactions that are returned are automatically
finished. This means that if you call this method again you won't get the same result on the same device. On the other hand, if `false` you'd
have to manually finish the returned transaction once you have delivered the content to your user.
@param {onlyIncludeActiveItems}:boolean. (IOS Sk2 only). Defaults to false, meaning that it will return one transaction per item purchased.
@See https://developer.apple.com/documentation/storekit/transaction/3851204-currententitlements for details
 */
export declare const getPurchaseHistory: ({ alsoPublishToEventListener, automaticallyFinishRestoredTransactions, onlyIncludeActiveItems, }?: {
    alsoPublishToEventListener?: boolean | undefined;
    automaticallyFinishRestoredTransactions?: boolean | undefined;
    onlyIncludeActiveItems?: boolean | undefined;
}) => Promise<Purchase[]>;
/**
 * Get all purchases made by the user (either non-consumable, or haven't been consumed yet)
 * ## Usage

```tsx
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {getAvailablePurchases} from 'react-native-iap';

const App = () => {
  const availablePurchases = useCallback(
    async () => await getAvailablePurchases(),
    [],
  );

  return <View />;
};
```

## Restoring purchases

You can use `getAvailablePurchases()` to do what's commonly understood as "restoring" purchases.

:::note
For debugging you may want to consume all items, you have then to iterate over the purchases returned by `getAvailablePurchases()`.
:::

:::warning
Beware that if you consume an item without having recorded the purchase in your database the user may have paid for something without getting it delivered and you will have no way to recover the receipt to validate and restore their purchase.
:::

```tsx
import React from 'react';
import {Button} from 'react-native';
import {getAvailablePurchases,finishTransaction} from 'react-native-iap';

const App = () => {
  handleRestore = async () => {
    try {
      const purchases = await getAvailablePurchases();
      const newState = {premium: false, ads: true};
      let titles = [];

      await Promise.all(purchases.map(async purchase => {
        switch (purchase.productId) {
          case 'com.example.premium':
            newState.premium = true;
            titles.push('Premium Version');
            break;

          case 'com.example.no_ads':
            newState.ads = false;
            titles.push('No Ads');
            break;

          case 'com.example.coins100':
            await finishTransaction({purchase});
            CoinStore.addCoins(100);
        }
      }));

      Alert.alert(
        'Restore Successful',
        `You successfully restored the following purchases: ${titles.join(', ')}`,
      );
    } catch (error) {
      console.warn(error);
      Alert.alert(error.message);
    }
  };

  return (
    <Button title="Restore purchases" onPress={handleRestore} />
  )
};
```
@param {alsoPublishToEventListener}:boolean When `true`, every element will also be pushed to the purchaseUpdated listener.
Note that this is only for backaward compatiblity. It won't publish to transactionUpdated (Storekit2) Defaults to `false`
@param {onlyIncludeActiveItems}:boolean. (IOS Sk2 only). Defaults to true, meaning that it will return the transaction if suscription has not expired.
@See https://developer.apple.com/documentation/storekit/transaction/3851204-currententitlements for details
 *
 */
export declare const getAvailablePurchases: ({ alsoPublishToEventListener, automaticallyFinishRestoredTransactions, onlyIncludeActiveItems, }?: {
    alsoPublishToEventListener?: boolean | undefined;
    automaticallyFinishRestoredTransactions?: boolean | undefined;
    onlyIncludeActiveItems?: boolean | undefined;
}) => Promise<Purchase[]>;
/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * Request a purchase for a product (consumables or non-consumables).

The response will be received through the `PurchaseUpdatedListener`.

:::note
`andDangerouslyFinishTransactionAutomatically` defaults to false. We recommend
always keeping at false, and verifying the transaction receipts on the server-side.
:::

## Signature

```ts
requestPurchase(
 The product's sku/ID
  sku,


   * You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user.
   * @default false

  andDangerouslyFinishTransactionAutomaticallyIOS = false,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's account in your app.
  obfuscatedAccountIdAndroid,

  Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app.
  obfuscatedProfileIdAndroid,

   The purchaser's user ID
  applicationUsername,
): Promise<ProductPurchase>;
```

## Usage

```tsx
import React, { useState, useEffect } from 'react';
import {Button} from 'react-native';
import {requestPurchase, Product, Sku, getProducts} from 'react-native-iap';

const App = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
        const productList = await getProducts({skus:['com.example.product']});
        setProducts(productList);
    }

    fetchProducts();
  }, []);

  const handlePurchase = async (sku: Sku) => {
    await requestPurchase({sku});
  };

  return (
    <>
      {products.map((product) => (
        <Button
          key={product.productId}
          title="Buy product"
          onPress={() => handlePurchase(product.productId)}
        />
      ))}
    </>
  );
};
```

 */
export declare const requestPurchase: (request: RequestPurchase) => Promise<ProductPurchase | ProductPurchase[] | void>;
/**
 * Request a purchase for product. This will be received in `PurchaseUpdatedListener`.
 * Request a purchase for a subscription.

The response will be received through the `PurchaseUpdatedListener`.

:::note
`andDangerouslyFinishTransactionAutomatically` defaults to false. We recommend
always keeping at false, and verifying the transaction receipts on the server-side.
:::

## Signature

```ts
requestSubscription(
  The product's sku/ID
  sku,


   * You should set this to false and call finishTransaction manually when you have delivered the purchased goods to the user.
   * @default false

  andDangerouslyFinishTransactionAutomaticallyIOS = false,

   purchaseToken that the user is upgrading or downgrading from (Android).
  purchaseTokenAndroid,

  UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY, IMMEDIATE_WITH_TIME_PRORATION, IMMEDIATE_AND_CHARGE_PRORATED_PRICE, IMMEDIATE_WITHOUT_PRORATION, DEFERRED
  prorationModeAndroid = -1,

  /** Specifies an optional obfuscated string that is uniquely associated with the user's account in your app.
  obfuscatedAccountIdAndroid,

  Specifies an optional obfuscated string that is uniquely associated with the user's profile in your app.
  obfuscatedProfileIdAndroid,

  The purchaser's user ID
  applicationUsername,
): Promise<SubscriptionPurchase>
```

## Usage

```tsx
import React, {useCallback} from 'react';
import {Button} from 'react-native';
import {
  requestSubscription,
  Product,
  Sku,
  getSubscriptions,
} from 'react-native-iap';

const App = () => {
  const subscriptions = useCallback(
    async () => getSubscriptions(['com.example.subscription']),
    [],
  );

  const handlePurchase = async (sku: Sku) => {
    await requestSubscription({sku});
  };

  return (
    <>
      {subscriptions.map((subscription) => (
        <Button
          key={subscription.productId}
          title="Buy subscription"
          onPress={() => handlePurchase(subscription.productId)}
        />
      ))}
    </>
  );
};
```
 */
export declare const requestSubscription: (request: RequestSubscription) => Promise<SubscriptionPurchase | SubscriptionPurchase[] | null | void>;
/**
 * Finish Transaction (both platforms)
 *   Abstracts  Finish Transaction
 *   iOS: Tells StoreKit that you have delivered the purchase to the user and StoreKit can now let go of the transaction.
 *   Call this after you have persisted the purchased state to your server or local data in your app.
 *   `react-native-iap` will continue to deliver the purchase updated events with the successful purchase until you finish the transaction. **Even after the app has relaunched.**
 *   Android: it will consume purchase for consumables and acknowledge purchase for non-consumables.
 *
```tsx
import React from 'react';
import {Button} from 'react-native';
import {finishTransaction} from 'react-native-iap';

const App = () => {
  const handlePurchase = async () => {
    // ... handle the purchase request

    const result = finishTransaction({purchase});
  };

  return <Button title="Buy product" onPress={handlePurchase} />;
};
```
 @returns {Promise<PurchaseResult | boolean>} Android: PurchaseResult, iOS: true
 */
export declare const finishTransaction: ({ purchase, isConsumable, developerPayloadAndroid, }: {
    purchase: Purchase;
    isConsumable?: boolean | undefined;
    developerPayloadAndroid?: string | undefined;
}) => Promise<PurchaseResult | boolean>;
/**
 * Deeplinks to native interface that allows users to manage their subscriptions
 *
 */
export declare const deepLinkToSubscriptions: ({ sku, isAmazonDevice, }: {
    sku?: string | undefined;
    isAmazonDevice?: boolean | undefined;
}) => Promise<void>;
/**
 * Get App Store and Google Play device region.
 *
 * App Store: string - ISO 3166-1 Alpha-3 country code representation https://developer.apple.com/documentation/storekit/storefront.
 *
 * Google Play: string - ISO-3166-1 alpha2 country code representation https://developer.android.com/reference/com/android/billingclient/api/BillingConfig#getCountryCode()
 *
 * ```tsx
 * import React from 'react';
 * import {getStorefront} from 'react-native-iap';
 *
 * const App = () => {
 *   React.useEffect(() => {
 *     getStorefront().then((countryCode) => {
 *       // ... handle region
 *     });
 *   }, []);
 * };
 * ```
 */
export declare const getStorefront: () => Promise<string>;
/**
 * Get the app transaction information (iOS only, StoreKit 2).
 * This contains the appTransactionID and other app purchase information.
 *
 * @platform iOS (16.0+)
 * @returns {Promise<AppTransaction>} A promise that resolves to the app transaction information
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import {getAppTransaction} from 'react-native-iap';
 *
 * const App = () => {
 *   React.useEffect(() => {
 *     getAppTransaction().then((appTransaction) => {
 *       console.log('App Transaction ID:', appTransaction.appTransactionID);
 *     }).catch(error => {
 *       console.error('Error getting app transaction:', error);
 *     });
 *   }, []);
 * };
 * ```
 */
export declare const getAppTransaction: () => Promise<{
    appTransactionID: string;
    originalAppVersion: string;
    originalPurchaseDate: number;
    deviceVerification: string;
    deviceVerificationNonce: string;
    appVersion: string;
    signedDate: number;
    environment: string;
}>;
//# sourceMappingURL=iap.d.ts.map