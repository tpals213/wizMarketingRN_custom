// android/app/src/main/java/com/wizmarket/share/InstagramStoryShareModule.kt
package com.wizmarket.share

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File

class InstagramStoryShareModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "InstagramStoryShareModule"

    /**
     * JS에서 호출:
     * InstagramStoryShareModule.shareImageToStory('/storage/emulated/0/.../image.jpg')
     */
    @ReactMethod
    fun shareImageToStory(path: String, promise: Promise) {
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

            val intent = Intent("com.instagram.share.ADD_TO_STORY").apply {
                setDataAndType(contentUri, "image/*")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                // background 색 지정도 가능 (선택)
                putExtra("top_background_color", "#000000")
                putExtra("bottom_background_color", "#000000")
            }

            // 권한 부여
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
            promise.reject("INSTAGRAM_STORY_ERROR", e.message)
        }
    }
}
