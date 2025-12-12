// android/app/src/main/java/com/wizmarket/share/InstagramStorySharePackage.kt
package com.wizmarket.share

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class InstagramFeedSharePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> =
        mutableListOf(InstagramFeedShareModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> =
        mutableListOf()
}
