package com.wizmarket.share

import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class XShareModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "XShareModule"

    @ReactMethod
    fun shareImageWithText(fileUrl: String, text: String?, promise: Promise) {
        try {
            val xPackage = "com.twitter.android"

            // 1) file://... -> Uri
            val uri = Uri.parse(fileUrl)

            // 2) contentUri 만들기 (FileProvider)
            val contentUri: Uri = if (uri.scheme == "content") {
                uri
            } else {
                val path = uri.path
                if (path.isNullOrBlank()) {
                    promise.reject("x_share_failed", "invalid_file_url")
                    return
                }

                val file = File(path)
                if (!file.exists() || file.length() <= 0) {
                    promise.reject("x_share_failed", "file_not_found_or_empty")
                    return
                }

                FileProvider.getUriForFile(
                    reactContext,
                    reactContext.packageName + ".fileprovider",
                    file
                )
            }

            // 3) 기본 공유 인텐트 (X로만 좁힘)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                if (!text.isNullOrBlank()) putExtra(Intent.EXTRA_TEXT, text)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                `package` = xPackage
            }

            val pm = reactContext.packageManager

            // 4) X 내부에서 "Post(Composer)" 쪽을 최대한 찾아서 component로 고정
            val candidates = pm.queryIntentActivities(intent, 0)
            val preferred = candidates.firstOrNull { it.activityInfo.name == "com.twitter.android.composer.ComposerActivity" }
                ?: candidates.firstOrNull { it.activityInfo.name.contains("composer", ignoreCase = true) }

            if (preferred != null) {
                intent.component = ComponentName(preferred.activityInfo.packageName, preferred.activityInfo.name)
            }

            if (intent.resolveActivity(pm) == null) {
                promise.reject("x_app_not_installed", "x_app_not_installed")
                return
            }

            reactContext.startActivity(intent)
            promise.resolve(true)

        } catch (e: Exception) {
            promise.reject("x_share_failed", e.message, e)
        }
    }
}
