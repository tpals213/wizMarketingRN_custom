import { NativeModules, Platform } from 'react-native';
import { ErrorCode } from '../purchaseError';
const {
  RNIapIos,
  RNIapIosSk2,
  RNIapModule,
  RNIapAmazonModule
} = NativeModules;
export const isIos = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isAmazon = isAndroid && !!RNIapAmazonModule;
export const isPlay = isAndroid && !!RNIapModule;

// Android

let androidNativeModule = RNIapModule;
export const setAndroidNativeModule = nativeModule => {
  androidNativeModule = nativeModule;
};
export const checkNativeAndroidAvailable = () => {
  if (!RNIapModule && !RNIapAmazonModule) {
    throw new Error(ErrorCode.E_IAP_NOT_AVAILABLE);
  }
};

/**
 * If changing the typings of `getAndroidModule` to accommodate extra modules,
 * make sure to update `getAndroidModuleType`.
 */
export const getAndroidModule = () => {
  checkNativeAndroidAvailable();
  return androidNativeModule ? androidNativeModule : RNIapModule ? RNIapModule : RNIapAmazonModule;
};

/**
 * Returns whether the Android in-app-purchase code is using the Android,
 * Amazon, or another store.
 */
export const getAndroidModuleType = () => {
  const module = getAndroidModule();
  switch (module) {
    case RNIapModule:
      return 'android';
    case RNIapAmazonModule:
      return 'amazon';
    default:
      return null;
  }
};
export const getNativeModule = () => {
  return isAndroid ? getAndroidModule() : getIosModule();
};

// iOS

let iosNativeModule = RNIapIos;
export const isStorekit2Available = () => isIos && (RNIapIosSk2 === null || RNIapIosSk2 === void 0 ? void 0 : RNIapIosSk2.isAvailable()) === 1;
export const isIosStorekit2 = () => isIos && !!iosNativeModule && iosNativeModule === RNIapIosSk2 && isStorekit2Available();
export const setIosNativeModule = nativeModule => {
  iosNativeModule = nativeModule;
};
export const storekit2Mode = () => {
  iosNativeModule = RNIapIosSk2;
  if (isStorekit2Available()) {
    RNIapIos.disable();
    return true;
  }
  if (isIos) {
    console.warn('Storekit 2 is not available on this device');
    return false;
  }
  return true;
};
export const storekit1Mode = () => {
  iosNativeModule = RNIapIos;
  if (isStorekit2Available()) {
    RNIapIosSk2.disable();
    return true;
  }
  return false;
};
export const storekitHybridMode = () => {
  if (isStorekit2Available()) {
    iosNativeModule = RNIapIosSk2;
    console.info('Using Storekit 2');
    return true;
  } else {
    iosNativeModule = RNIapIos;
    console.info('Using Storekit 1');
    return true;
  }
};
const checkNativeIOSAvailable = () => {
  if (!RNIapIos && !isStorekit2Available()) {
    throw new Error(ErrorCode.E_IAP_NOT_AVAILABLE);
  }
};
export const getIosModule = () => {
  checkNativeIOSAvailable();
  return iosNativeModule ? iosNativeModule : RNIapIosSk2 ? RNIapIosSk2 : RNIapIos;
};
//# sourceMappingURL=platform.js.map