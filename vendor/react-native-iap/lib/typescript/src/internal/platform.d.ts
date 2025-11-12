declare const RNIapIos: import("..").IosModuleProps, RNIapIosSk2: import("../modules/iosSk2").IosModulePropsSk2, RNIapModule: import("..").AndroidModuleProps, RNIapAmazonModule: import("..").AmazonModuleProps;
export declare const isIos: boolean;
export declare const isAndroid: boolean;
export declare const isAmazon: boolean;
export declare const isPlay: boolean;
export declare const setAndroidNativeModule: (nativeModule: typeof RNIapModule) => void;
export declare const checkNativeAndroidAvailable: () => void;
/**
 * If changing the typings of `getAndroidModule` to accommodate extra modules,
 * make sure to update `getAndroidModuleType`.
 */
export declare const getAndroidModule: () => typeof RNIapModule | typeof RNIapAmazonModule;
/**
 * Returns whether the Android in-app-purchase code is using the Android,
 * Amazon, or another store.
 */
export declare const getAndroidModuleType: () => 'android' | 'amazon' | null;
export declare const getNativeModule: () => typeof RNIapModule | typeof RNIapAmazonModule | typeof RNIapIos | typeof RNIapIosSk2;
export declare const isStorekit2Available: () => boolean;
export declare const isIosStorekit2: () => boolean;
export declare const setIosNativeModule: (nativeModule: typeof RNIapIos | typeof RNIapIosSk2) => void;
export declare const storekit2Mode: () => boolean;
export declare const storekit1Mode: () => boolean;
export declare const storekitHybridMode: () => boolean;
export declare const getIosModule: () => typeof RNIapIos | typeof RNIapIosSk2;
export {};
//# sourceMappingURL=platform.d.ts.map