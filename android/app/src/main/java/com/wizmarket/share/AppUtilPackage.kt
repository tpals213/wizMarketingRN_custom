// android/app/src/main/java/com/wizmarket/share/AppUtilPackage.kt
package com.wizmarket.share

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AppUtilPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        // 우리가 만든 모듈 등록
        return listOf(AppUtilModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        // UI 컴포넌트 없음
        return emptyList()
    }
}
