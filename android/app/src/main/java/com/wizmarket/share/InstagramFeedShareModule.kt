// android/app/src/main/java/com/wizmarket/share/InstagramFeedShareModule.kt
package com.wizmarket.share

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File

class InstagramFeedShareModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "InstagramFeedShareModule"

    /**
     * JS 사용 예:
     * InstagramFeedShareModule.shareImageToFeed('file:///.../image.jpg', '캡션 텍스트', promise)
     */
    @ReactMethod
    fun shareImageToFeed(path: String, text: String?, promise: Promise) {
        try {
            if (path.isBlank()) {
                promise.reject("NO_PATH", "image path is empty")
                return
            }

            val pm = reactContext.packageManager
            val instaPackage = "com.instagram.android"
            val instaInstalled = try {
                pm.getPackageInfo(instaPackage, 0)
                true
            } catch (e: Exception) {
                false
            }

            if (!instaInstalled) {
                // ❌ 인스타 미설치 → JS에서 스토어 열게만 에러 전달
                promise.reject("INSTAGRAM_NOT_INSTALLED", "Instagram app is not installed")
                return
            }

            // file:///... 또는 /storage/... → File
            val file = if (path.startsWith("file://")) {
                File(Uri.parse(path).path ?: "")
            } else {
                File(path)
            }

            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "File does not exist: $path")
                return
            }

            // File → content:// URI (FileProvider)
            val authority = reactContext.packageName + ".fileprovider"
            val contentUri: Uri = FileProvider.getUriForFile(
                reactContext,
                authority,
                file
            )

            // ✅ 피드 공유 인텐트 (일반 ACTION_SEND)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                if (!text.isNullOrBlank()) {
                    putExtra(Intent.EXTRA_TEXT, text)
                }
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                setPackage(instaPackage)   // 인스타그램만 타겟
            }

            // 권한 부여 (혹시 필요시)
            val resInfoList = pm.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY)
            for (resolveInfo in resInfoList) {
                val packageName = resolveInfo.activityInfo.packageName
                reactContext.grantUriPermission(
                    packageName,
                    contentUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
                )
            }

            val activity = reactContext.currentActivity
            if (activity != null) {
                activity.startActivity(intent)
            } else {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
            }

            promise.resolve(true)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("INSTAGRAM_FEED_ERROR", e.message)
        }
    }
}
