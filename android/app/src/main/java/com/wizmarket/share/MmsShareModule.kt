package com.wizmarket.share

import android.content.Intent
import android.content.ClipData
import android.net.Uri
import android.provider.Telephony
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class MmsShareModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MmsShare"  // ✅ JS에서 NativeModules.MmsShare

    @ReactMethod
    fun shareImageOnly(fileUrl: String, promise: Promise) {
        try {
            val uri = Uri.parse(fileUrl)

            // file:// -> content:// (FileProvider)
            val contentUri: Uri = if (uri.scheme == "content") {
                uri
            } else {
                val path = uri.path
                if (path.isNullOrBlank()) {
                    promise.reject("mms_share_failed", "invalid_file_url")
                    return
                }
                val file = File(path)
                if (!file.exists() || file.length() <= 0) {
                    promise.reject("mms_share_failed", "file_not_found_or_empty")
                    return
                }
                FileProvider.getUriForFile(
                    reactContext,
                    reactContext.packageName + ".fileprovider",
                    file
                )
            }

            // ✅ 기본 메시지 앱 패키지 (선택창 최소화 핵심)
            val defaultSmsPackage = Telephony.Sms.getDefaultSmsPackage(reactContext)

            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_STREAM, contentUri)

                // 텍스트 없음(내용 비움)
                // putExtra(Intent.EXTRA_TEXT, ...)  // ❌ 안 넣음

                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

                // 일부 앱은 ClipData가 있어야 첨부를 안정적으로 인식함
                clipData = ClipData.newRawUri("shared_image", contentUri)

                if (!defaultSmsPackage.isNullOrBlank()) {
                    `package` = defaultSmsPackage
                }
            }

            // 기본앱이 없거나 막힌 경우에만 선택창(최후 수단)
            val pm = reactContext.packageManager
            if (intent.resolveActivity(pm) == null) {
                val chooser = Intent.createChooser(intent, "메시지 앱 선택").apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(chooser)
            } else {
                reactContext.startActivity(intent)
            }

            promise.resolve(true)

        } catch (e: Exception) {
            promise.reject("mms_share_failed", e.message, e)
        }
    }
}
