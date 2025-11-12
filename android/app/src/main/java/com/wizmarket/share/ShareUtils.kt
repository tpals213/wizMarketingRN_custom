package com.wizmarket.share

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File

object ShareUtils {
    private const val KAKAO_TALK = "com.kakao.talk"

    fun shareImageFileToKakao(context: Context, filePathOrUrl: String, text: String?) {
        // "file://..." → 실제 경로로 정리
        val path = filePathOrUrl.removePrefix("file://")
        val file = File(path)
        require(file.exists() && file.isFile) { "file not found: $path" }

        // FileProvider content:// 생성 (authorities = ${applicationId}.fileprovider)
        val uri: Uri = FileProvider.getUriForFile(
            context,
            context.packageName + ".fileprovider",
            file
        )

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "image/*"
            putExtra(Intent.EXTRA_STREAM, uri)
            if (!text.isNullOrBlank()) putExtra(Intent.EXTRA_TEXT, text)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            setPackage(KAKAO_TALK) // ✅ 카카오톡만
        }
        context.startActivity(intent)
    }
}
