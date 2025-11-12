package com.wizmarket.share

import com.facebook.react.bridge.*

class KakaoShareModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "KakaoShareModule"

    @ReactMethod
    fun shareImageFile(fileUrl: String, text: String?, promise: Promise) {
        try {
            ShareUtils.shareImageFileToKakao(reactContext, fileUrl, text)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("share_error", e)
        }
    }

    @ReactMethod
    fun shareText(text: String, promise: Promise) {
        try {
            val intent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(android.content.Intent.EXTRA_TEXT, text)
                setPackage("com.kakao.talk")
                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("share_error", e)
        }
    }
}
