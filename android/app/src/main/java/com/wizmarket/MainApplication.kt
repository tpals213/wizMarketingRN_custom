package com.wizmarket

// ✅ CameraRoll 모듈 import
import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.kakao.sdk.common.KakaoSdk
// import com.reactnativecommunity.cameraroll.CameraRollPackage
import com.wizmarket.kakao.KakaoLoginPackage
import com.wizmarket.share.KakaoSharePackage
import com.wizmarket.share.BandSharePackage
import com.wizmarket.share.AppUtilPackage
class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
          object : DefaultReactNativeHost(this) {

            override fun getPackages(): List<ReactPackage> {
              val packages = PackageList(this).packages

              // ✅ 수동 추가
              packages.add(KakaoLoginPackage())
              // packages.add(CameraRollPackage())
                packages.add(KakaoSharePackage())
                packages.add(BandSharePackage())
                packages.add(AppUtilPackage())
                return packages
            }

            override fun getJSMainModuleName(): String = "index"
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
          }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    android.util.Log.i("KAKAO", "AppKey=" + BuildConfig.KAKAO_NATIVE_APP_KEY)

    android.util.Log.i(
        "KAKAO",
        "AppId=" +
                BuildConfig.APPLICATION_ID +
                ", BuildType=" +
                BuildConfig.BUILD_TYPE +
                ", KakaoKey=" +
                BuildConfig.KAKAO_NATIVE_APP_KEY
)


    KakaoSdk.init(this, BuildConfig.KAKAO_NATIVE_APP_KEY)

    loadReactNative(this)
  }
}
