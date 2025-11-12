package com.wizmarket.share

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*
import androidx.core.content.FileProvider
import java.io.File

class BandShareModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val PKG_BAND = "com.nhn.android.band"
    }

    override fun getName() = "BandShareModule"

    @ReactMethod
    fun shareImageWithText(fileUrl: String, text: String?, promise: Promise) {
        try {
            // file:// → 실제 파일 경로
            val path = fileUrl.removePrefix("file://")
            val file = File(path)
            if (!file.exists() || !file.isFile) {
                promise.reject("file_not_found", "file not found: $path")
                return
            }

            // FileProvider content://
            val contentUri: Uri = FileProvider.getUriForFile(
                reactContext,
                reactContext.packageName + ".fileprovider",
                file
            )

            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                if (!text.isNullOrBlank()) putExtra(Intent.EXTRA_TEXT, text)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                setPackage(PKG_BAND) // ✅ 밴드만!
            }

            try {
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (anf: ActivityNotFoundException) {
                // 밴드 미설치 → 스토어 이동
                try {
                    reactContext.startActivity(
                        Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$PKG_BAND")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    )
                } catch (_: Exception) {}
                promise.reject("band_not_installed", "BAND not installed")
            }
        } catch (e: Exception) {
            promise.reject("share_error", e)
        }
    }
}
