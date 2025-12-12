// android/app/src/main/java/com/wizmarket/share/AppUtilModule.kt
package com.wizmarket.share

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppUtilModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    // JS에서 NativeModules.AppUtilModule 로 부를 이름
    override fun getName(): String = "AppUtilModule"

    /**
     * 1) 우리 앱의 "알림 설정" 화면 열기
     *    설정 → 애플리케이션 → 우리 앱 → 알림
     */
    @ReactMethod
    fun openAppNotificationSettings() {
        val context = reactContext

        val intent: Intent = when {
            // Android 8.0 이상
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O -> {
                Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                    putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                }
            }
            // Lollipop ~ Nougat
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP -> {
                Intent("android.settings.APP_NOTIFICATION_SETTINGS").apply {
                    putExtra("app_package", context.packageName)
                    putExtra("app_uid", context.applicationInfo.uid)
                }
            }
            // 그 이하: 앱 상세 정보 화면
            else -> {
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.parse("package:${context.packageName}")
                }
            }
        }

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    /**
     * 2) 특정 패키지명이 설치되어 있는지 확인
     *    JS에서는:
     *    const installed = await AppUtilModule.isAppInstalled("com.instagram.android");
     */
    @ReactMethod
    fun isAppInstalled(packageName: String, promise: Promise) {
        try {
            val pm: PackageManager = reactContext.packageManager
            pm.getPackageInfo(packageName, 0)   // 있으면 예외 안 남
            promise.resolve(true)
        } catch (e: PackageManager.NameNotFoundException) {
            promise.resolve(false)             // 설치 안 됨
        } catch (e: Exception) {
            promise.reject(
                "E_CHECK_APP",
                "Failed to check package: $packageName",
                e
            )
        }
    }
}
