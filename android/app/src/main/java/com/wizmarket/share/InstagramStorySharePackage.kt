// android/app/src/main/java/com/wizmarket/share/InstagramStorySharePackage.kt
package com.wizmarket.share

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class InstagramStorySharePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> =
        mutableListOf(InstagramStoryShareModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> =
        mutableListOf()
}
