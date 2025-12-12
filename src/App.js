// App.js — WizMarketing WebView Bridge
// (push + auth: Google live / Kakao native + SafeArea + Channel Share + Image Download→Gallery)

import React, { useCallback, useEffect, useRef, useState } from 'react';
import '@react-native-firebase/app';
import {
  BackHandler, StyleSheet, Platform, Alert,
  Linking, LogBox, Animated, Easing, StatusBar,
  PermissionsAndroid, PixelRatio,
  AppState
} from 'react-native';
import { WebView } from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import Share from 'react-native-share';
import * as RNIAP from 'react-native-iap'; // IAP

import Clipboard from '@react-native-clipboard/clipboard';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SplashScreenRN from './SplashScreenRN';
import ImageResizer from 'react-native-image-resizer';
import { NativeModules } from 'react-native';
const { KakaoLoginModule } = NativeModules;
const { AppUtilModule } = NativeModules;
const { InstagramStoryShareModule } = NativeModules;
const { InstagramFeedShareModule } = NativeModules;
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

// App.js 상단 import들 사이에 추가
import { Modal, View, Text, Pressable, TouchableWithoutFeedback } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';


const APP_VERSION = '1.0.0';
const BOOT_TIMEOUT_MS = 8000;
const MIN_SPLASH_MS = 1200;
const TAG = '[WizApp]';
const NAVER_AUTH_URL = 'https://nid.naver.com/oauth2.0/authorize';
const NAVER_CLIENT_ID = 'YSd2iMy0gj8Da9MZ4Unf';



// ─────────── IAP SKU ───────────
// 구독(Subs)
const ANDROID_SKUS = [
  'wm_basic_m',               // (구독형 베이직이 있을 때만 사용됨 — 베이직 단건은 아래 INAPP 사용)
  'wm_standard_m', 'wm_standard_y',
  'wm_premium_m', 'wm_premium_y',
  'wm_concierge_m',
];
// 단건(Consumable) — 외주 요청: 베이직을 인앱 단건으로 운영
// const ANDROID_INAPP_BASIC = 'wm_basic_n';
const ANDROID_INAPP_BASIC = ['wm_basic_n', 'wm_standard_n', 'wm_premium_n'];

let purchaseUpdateSub = null;
let purchaseErrorSub = null;



// ─────────── DEBUG helpers ───────────
const DBG = {
  tag: '[IAPDBG]',
  log(...args) { try { console.log(this.tag, ...args); } catch { } },
  chunk(tag, obj, size = 2000) {
    try {
      const s = JSON.stringify(obj, (k, v) => (v instanceof Error ? { name: v.name, message: v.message, stack: v.stack } : v), 2);
      for (let i = 0; i < s.length; i += size) console.log(`${this.tag} ${tag}[${1 + (i / size | 0)}]`, s.slice(i, i + size));
    } catch (e) { console.log(this.tag, tag, '<unserializable>', String(e?.message || e)); }
  },
  toast(msg) { try { Alert.alert('IAP Debug', String(msg)); } catch { } },
};

// ─────────── IAP offer_token 캐시(앱 내부 전용) ───────────
const IAP_OFFER_CACHE_KEY = 'iap_offer_cache_v1';
let offerCacheMem = {}; // { [sku]: { token: string|null, at: number } }

async function loadOfferCache() {
  try { offerCacheMem = JSON.parse(await AsyncStorage.getItem(IAP_OFFER_CACHE_KEY)) || {}; }
  catch { offerCacheMem = {}; }
}
async function saveOfferCache() {
  try { await AsyncStorage.setItem(IAP_OFFER_CACHE_KEY, JSON.stringify(offerCacheMem)); } catch { }
}
// Play에서 특정 SKU의 첫 오퍼 토큰 반환
async function fetchOfferTokenFromPlay(sku) {
  try {
    const items = await RNIAP.getSubscriptions({ skus: [sku] });
    const d = items?.find(p => p.productId === sku);
    const token = d?.subscriptionOfferDetails?.[0]?.offerToken || null;
    DBG.log('fetchOfferTokenFromPlay', sku, token ? 'got_token' : 'no_token');
    return token;
  } catch (e) {
    DBG.chunk('fetchOfferTokenFromPlay.CATCH', { raw: e });
    return null;
  }
}
// 캐시에서 토큰 확보(없으면 조회→캐시)
async function ensureOfferToken(sku) {
  if (offerCacheMem[sku]?.token !== undefined) return offerCacheMem[sku].token;
  await loadOfferCache();
  if (offerCacheMem[sku]?.token !== undefined) return offerCacheMem[sku].token;
  const token = await fetchOfferTokenFromPlay(sku);
  offerCacheMem[sku] = { token, at: Date.now() };
  await saveOfferCache();
  return token;
}
// 여러 SKU 선적재(앱 시작 후 1회)
async function preloadOfferTokens(skus = []) {
  await loadOfferCache();
  for (const sku of skus) {
    if (offerCacheMem[sku]?.token === undefined) {
      const t = await fetchOfferTokenFromPlay(sku);
      offerCacheMem[sku] = { token: t, at: Date.now() };
    }
  }
  await saveOfferCache();
}

// ─────────── 설치 ID (installation_id) ───────────
function makeRandomId() {
  return 'wiz-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
async function getOrCreateInstallId() {
  try {
    const key = 'install_id';
    let id = await AsyncStorage.getItem(key);
    if (!id) { id = makeRandomId(); await AsyncStorage.setItem(key, id); }
    return id;
  } catch { return makeRandomId(); }
}

// ─────────── Google Sign-In 초기화 ───────────
GoogleSignin.configure({
  webClientId: '266866879152-kfquq1i6r89tbqeramjjuaa2csmoegej.apps.googleusercontent.com',
  offlineAccess: true,
});

// ─────────── 공유 유틸/매핑 ───────────
const SOCIAL = Share.Social;
const SOCIAL_MAP = {
  INSTAGRAM: SOCIAL.INSTAGRAM,
  INSTAGRAM_STORIES: SOCIAL.INSTAGRAM_STORIES,
  FACEBOOK: SOCIAL.FACEBOOK,
  TWITTER: SOCIAL.TWITTER,
  SMS: SOCIAL.SMS,
  KAKAO: 'KAKAO',
  NAVER: 'NAVER',
  BAND: 'BAND',
  SYSTEM: 'SYSTEM',
};


// 인스타 공유 흐름 제어
const pendingShareRef = { current: null };      // 인스타 공유 진행 상태
const lastSendToWebRef = { current: null };     // 마지막 sendToWeb 함수

// 구조화 로그 유틸
const logJSON = (tag, obj) => console.log(`${tag} ${safeStringify(obj)}`);
const replacer = (_k, v) => (v instanceof Error ? { name: v.name, message: v.message, stack: v.stack } : (typeof v === 'bigint' ? String(v) : v));
const safeStringify = (v, max = 100000) => { try { const s = JSON.stringify(v, replacer, 2); return s.length > max ? s.slice(0, max) + '…(trunc)' : s; } catch (e) { return `<non-serializable: ${String(e?.message || e)}>`; } };
const logChunked = (tag, obj, size = 3000) => { const s = safeStringify(obj); for (let i = 0; i < s.length; i += size) console.log(`${tag}[${1 + (i / size) | 0}] ${s.slice(i, i + size)}`); };

// 텍스트 조립
function buildFinalText({ caption, hashtags = [], couponEnabled = false, link } = {}) {
  const tags = Array.isArray(hashtags) ? hashtags.join(' ') : (hashtags || '');
  return `${caption || ''}${tags ? `\n\n${tags}` : ''}${couponEnabled ? `\n\n✅ 민생회복소비쿠폰` : ''}${link ? `\n${link}` : ''}`.trim();
}

// RNFS 유틸
function downloadTo(fromUrl, toFile) { return RNFS.downloadFile({ fromUrl, toFile }).promise; }
function guessExt(u = '') { u = u.toLowerCase(); if (u.includes('.png')) return 'png'; if (u.includes('.webp')) return 'webp'; if (u.includes('.gif')) return 'gif'; return 'jpg'; }
function extToMime(e) { return e === 'png' ? 'image/png' : e === 'webp' ? 'image/webp' : 'image/jpeg'; }

// ─────────── 이미지 저장 권한/처리 ───────────
async function ensureMediaPermissions() {
  if (Platform.OS !== 'android') return;
  if (Platform.Version >= 33) {
    // const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
    // if (res !== PermissionsAndroid.RESULTS.GRANTED) throw new Error('READ_MEDIA_IMAGES denied');
    return
  } else {
    const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    if (res !== PermissionsAndroid.RESULTS.GRANTED) throw new Error('WRITE_EXTERNAL_STORAGE denied');
  }
}
async function downloadAndSaveToGallery(url, filename = 'image.jpg') {
  if (!url) throw new Error('no_url');
  await ensureMediaPermissions();
  const ext = (url.match(/\.(png|jpg|jpeg|webp|gif)(\?|$)/i)?.[1] || 'jpg').toLowerCase();
  const name = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
  const dest = `${RNFS.CachesDirectoryPath}/${Date.now()}_${name}`;
  const { statusCode } = await RNFS.downloadFile({ fromUrl: url, toFile: dest }).promise;
  if (!(statusCode >= 200 && statusCode < 300)) throw new Error(`download failed: ${statusCode}`);
  await CameraRoll.save(dest, { type: 'photo' });
  RNFS.unlink(dest).catch(() => { });
}


// 파일 다운로드 처리
// 일반 파일 저장 권한
async function ensureFilePermissions() {
  if (Platform.OS !== 'android') return;
  if (Platform.Version >= 33) {
    // Android 13+ 는 SAF/DownloadManager가 더 정석인데
    // 일단 예시는 권한 없이 DownloadDirectoryPath에 시도 (필요하면 추후 보완)
    return;
  } else {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (res !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('WRITE_EXTERNAL_STORAGE denied');
    }
  }
}

// ✅ destDir: /storage/emulated/0/Download
// ✅ safeName: "새 텍스트 문서.txt"
async function getUniqueDownloadPath(destDir, safeName) {
  // 확장자 분리
  const dotIndex = safeName.lastIndexOf('.');
  const hasExt = dotIndex > 0;
  const base = hasExt ? safeName.slice(0, dotIndex) : safeName; // "새 텍스트 문서"
  const ext = hasExt ? safeName.slice(dotIndex) : "";           // ".txt" 또는 ""

  // base가 이미 "새 텍스트 문서(3)" 형태일 수도 있어서 처리
  const m = base.match(/^(.*)\((\d+)\)$/);   // "이름(3)" 패턴
  let baseName = base;
  let n = 1;

  if (m) {
    baseName = m[1];              // "새 텍스트 문서"
    n = parseInt(m[2], 10);       // 3
  }

  // 1) 원본 이름 먼저 시도: "새 텍스트 문서.txt"
  let candidate = `${destDir}/${baseName}${ext}`;
  if (!(await RNFS.exists(candidate))) {
    return candidate; // 아직 없으면 이걸로 저장
  }

  // 2) 이미 있으면 "(2)"부터 증가: "새 텍스트 문서(2).txt", "새 텍스트 문서(3).txt" …
  while (true) {
    n += 1; // 처음이면 2가 됨
    candidate = `${destDir}/${baseName}(${n})${ext}`; // ← 괄호 안 숫자만 증가

    const exists = await RNFS.exists(candidate);
    if (!exists) {
      return candidate;
    }
  }
}


async function downloadFileToDevice(url, filename = 'file.bin') {
  if (!url) throw new Error('no_url');

  console.log(2);
  await ensureFilePermissions();

  const safeName =
    filename.replace(/[\\/:*?"<>|]/g, '_') || 'file.bin';

  const destDir =
    Platform.OS === 'android'
      ? RNFS.DownloadDirectoryPath           // /storage/emulated/0/Download
      : RNFS.DocumentDirectoryPath;         // iOS app document

  // ✅ 윈도우 스타일 중복 처리된 최종 경로 얻기
  const destPath = await getUniqueDownloadPath(destDir, safeName);

  const { statusCode } = await RNFS.downloadFile({
    fromUrl: url,
    toFile: destPath,
  }).promise;

  if (!(statusCode >= 200 && statusCode < 300)) {
    throw new Error(`download failed: ${statusCode}`);
  }

  return destPath;
}






// ─────────── 공유(카카오/인스타 등) ───────────
function safeStr(x) { if (typeof x === 'string') return x; if (x == null) return ''; try { return String(x); } catch { return ''; } }
function stripImageUrlsFromText(text) { const s = safeStr(text); const out = s.replace(/https?:\/\/\S+\.(?:png|jpe?g|webp|gif)(?:\?\S*)?/gi, ''); return out.replace(/[ \t]{2,}/g, ' ').trim(); }

// PNG 보장
async function ensureLocalPng(src) {
  if (!src) throw new Error('no-source');
  if (src.startsWith('file://') || src.startsWith('content://') || src.startsWith('data:')) return { uri: src, cleanup: async () => { } };
  const dlPath = `${RNFS.CachesDirectoryPath}/ig_story_${Date.now()}.png`;
  const r = await RNFS.downloadFile({ fromUrl: src, toFile: dlPath }).promise;
  if (!(r && r.statusCode >= 200 && r.statusCode < 300)) throw new Error(`story-download-fail-${r?.statusCode || 'unknown'}`);
  const st = await RNFS.stat(dlPath);
  if (!st.isFile() || Number(st.size) <= 0) throw new Error('story-downloaded-file-empty');
  return { uri: `file://${dlPath}`, cleanup: async () => { try { await RNFS.unlink(dlPath); } catch { } } };
}

// 로컬 파일 보장
async function ensureLocalFile(src, preferExt = 'jpg') {
  if (!src) throw new Error('no-source');
  if (src.startsWith('file://') || src.startsWith('content://') || src.startsWith('data:')) return { uri: src, cleanup: async () => { } };
  const extRaw = (guessExt(src) || preferExt).toLowerCase();
  const tmpPath = `${RNFS.CachesDirectoryPath}/ig_${Date.now()}.${extRaw}`;
  const r = await RNFS.downloadFile({ fromUrl: src, toFile: tmpPath, headers: { Accept: 'image/jpeg,image/*;q=0.8' } }).promise;
  if (!(r && r.statusCode >= 200 && r.statusCode < 300)) throw new Error(`ig-download-fail-${r?.statusCode || 'unknown'}`);
  const st = await RNFS.stat(tmpPath);
  if (!st.isFile() || Number(st.size) <= 0) throw new Error('ig-downloaded-file-empty');

  if (preferExt.toLowerCase() === 'jpg' || preferExt.toLowerCase() === 'jpeg') {
    try {
      const resized = await ImageResizer.createResizedImage(tmpPath, 1080, 1080, 'JPEG', 90, 0, undefined, false, { mode: 'contain' });
      try { await RNFS.unlink(tmpPath); } catch { }
      const out = resized.path.startsWith('file://') ? resized.path : `file://${resized.path}`;
      return { uri: out, cleanup: async () => { try { await RNFS.unlink(out.replace('file://', '')); } catch { } } };
    } catch {
      const out = tmpPath.startsWith('file://') ? tmpPath : `file://${tmpPath}`;
      return { uri: out, cleanup: async () => { try { await RNFS.unlink(tmpPath); } catch { } } };
    }
  }
  const out = tmpPath.startsWith('file://') ? tmpPath : `file://${tmpPath}`;
  return { uri: out, cleanup: async () => { try { await RNFS.unlink(tmpPath); } catch { } } };
}
const ANDROID_PACKAGE_MAP = {
  INSTAGRAM: 'com.instagram.android',
  INSTAGRAM_STORIES: 'com.instagram.android',
  FACEBOOK: 'com.facebook.katana',
  KAKAO: 'com.kakao.talk',
  BAND: 'com.nhn.android.band',
};

const ANDROID_STORE_URL_MAP = {
  INSTAGRAM: 'https://play.google.com/store/apps/details?id=com.instagram.android',
  INSTAGRAM_STORIES: 'https://play.google.com/store/apps/details?id=com.instagram.android',
  FACEBOOK: 'https://play.google.com/store/apps/details?id=com.facebook.katana',
  KAKAO: 'https://play.google.com/store/apps/details?id=com.kakao.talk',
  BAND: 'https://play.google.com/store/apps/details?id=com.nhn.android.band',
};

async function openStoreForSocial(key: string) {
  if (Platform.OS !== 'android') return;

  const pkg = ANDROID_PACKAGE_MAP[key];
  if (!pkg) return;

  const marketUrl = `market://details?id=${pkg}`;
  const webUrl = ANDROID_STORE_URL_MAP[key];

  try {
    await Linking.openURL(marketUrl);
  } catch {
    if (webUrl) {
      await Linking.openURL(webUrl);
    }
  }
}

// ─────────── "앱이 필요합니다" 공통 Alert 헬퍼 ───────────
function alertAppMissingAndMaybeOpenStore({
  key,          // 'INSTAGRAM' | 'INSTAGRAM_STORIES' | 'KAKAO' | 'BAND' ...
  appName,      // "인스타그램", "카카오톡", "밴드" 등
  sendToWeb,    // sendToWeb 함수
  errorMessage, // 원래 에러 메시지 (선택)
}) {
  Alert.alert(
    `${appName}이 필요합니다`,
    `이 기능을 사용하려면 ${appName} 앱이 설치되어야 합니다.\n스토어로 이동할까요?`,
    [
      {
        text: '취소',
        style: 'cancel',
        onPress: () => {
          // 취소한 경우에도 웹에는 "실패" 전달
          sendToWeb?.('SHARE_RESULT', {
            success: false,
            platform: key,
            error_code: 'app_not_installed',
            cancelled: true,
            message: errorMessage || 'user_cancelled_store',
          });
        },
      },
      {
        text: '이동',
        onPress: async () => {
          try {
            await openStoreForSocial(key);
          } catch (e) {
            console.warn('[SHARE] openStoreForSocial error:', e);
          }

          // 스토어로 이동시킨 뒤에도 상태 전달
          sendToWeb?.('SHARE_RESULT', {
            success: false,
            platform: key,
            error_code: 'app_not_installed',
            openedStore: true,
            message: errorMessage || `${appName}_app_not_installed`,
          });
        },
      },
    ],
    { cancelable: true }
  );
}



// 공유 핸들러(중략 없이 유지)
async function handleShareToChannel(payload, sendToWeb) {
  const key = (payload?.social || '').toUpperCase();
  const data = payload?.data || {};
  const social = SOCIAL_MAP[key] ?? SOCIAL_MAP.SYSTEM;
  const text = buildFinalText(data);
  let file = data.imageUrl || data.url || data.image;

  try {

    // 0) 인스타 / 인스타 스토리는 먼저 "앱 설치 여부" 검사
        if (key === 'INSTAGRAM' || key === 'INSTAGRAM_STORIES') {
          let installed = true;
          try {
            installed = await AppUtilModule.isAppInstalled('com.instagram.android');
          } catch (e) {
            console.warn('[SHARE] isAppInstalled error:', e);
            // 여기서 false로 두면 네이티브 에러 때문에 괜히 스토어로 튈 수 있으니 true 유지
            installed = true;
          }

          if (!installed) {
            alertAppMissingAndMaybeOpenStore({
              key,
              appName: '인스타그램',
              sendToWeb,
              errorMessage: 'instagram_app_not_installed',
            });
            return;
          }
        }

    const needClipboard = [Share.Social.INSTAGRAM, Share.Social.INSTAGRAM_STORIES, Share.Social.FACEBOOK].includes(social);
    if (needClipboard && text) { Clipboard.setString(text); sendToWeb('TOAST', { message: '캡션이 복사되었어요. 업로드 화면에서 붙여넣기 하세요.' }); }
    const ext = guessExt(file) || 'jpg';
    const mime = extToMime(ext) || 'image/*';

    if (key === 'INSTAGRAM') {
      await shareToInstagramFeed(payload, sendToWeb);
    } else if (key === 'INSTAGRAM_STORIES') {
      await shareToInstagramStories(payload, sendToWeb);
    } else if (key === 'KAKAO') {
      const src = data.imageUrl || data.url || data.image;
      const cleanText = safeStr(text);
      const pasteText = stripImageUrlsFromText(cleanText);
      const kExt = guessExt(src) || 'jpg';
      const dlPath = `${RNFS.CachesDirectoryPath}/share_${Date.now()}.${kExt}`;
      const r = await RNFS.downloadFile({ fromUrl: src, toFile: dlPath }).promise;
      if (!(r && r.statusCode >= 200 && r.statusCode < 300)) throw new Error(`download ${r?.statusCode || 'fail'}`);
      const st = await RNFS.stat(dlPath);
      if (!st.isFile() || Number(st.size) <= 0) throw new Error('downloaded-file-empty');
      const fileUrl = `file://${dlPath}`;
      // const kMime = extToMime(kExt) || 'image/*';
      // await Share.open({ title: '카카오톡으로 공유', url: fileUrl, type: kMime, filename: `share.${kExt}`, message: pasteText, failOnCancel: false });
      try {
          const { KakaoShareModule } = NativeModules;
          await KakaoShareModule.shareImageFile(fileUrl, pasteText);

          sendToWeb('SHARE_RESULT', { success: true, platform: key, post_id: null });
        } catch (e) {
          // 🔥 여기서 카카오 미설치 → 플레이스토어 이동
          alertAppMissingAndMaybeOpenStore({
                    key,
                    appName: '카카오톡',
                    sendToWeb,
                    errorMessage: String(e?.message || e),
                  });
        }

        return;
    } else if (key === 'BAND') {
      const src = data.imageUrl || data.url || data.image;
      if (!src) throw new Error('no_image_for_band');

      const { uri } = await ensureLocalFile(src, 'jpg'); // file://...
      const cleanText = buildFinalText(data) || '';

      try {
        // ✅ 네이티브 모듈로 “밴드만” 실행
        const { BandShareModule } = NativeModules;
        await BandShareModule.shareImageWithText(uri, cleanText);
        sendToWeb('SHARE_RESULT', { success: true, platform: key, post_id: null });
      } catch (e) {
        // 미설치면 store로 이동 시도 → 여기로 reject 들어옴
        console.warn('[BAND_SHARE] error:', e);
                alertAppMissingAndMaybeOpenStore({
                  key,
                  appName: '밴드',
                  sendToWeb,
                  errorMessage: String(e?.message || e),
                });
      }
      return;
    }

     else {
      await Share.open({ url: file, message: text, title: '공유', type: mime, filename: `share.${ext}`, failOnCancel: false });
      sendToWeb('SHARE_RESULT', { success: true, platform: key, post_id: null });
    }


  } catch (err) {
    sendToWeb('SHARE_RESULT', { success: false, platform: key, error_code: 'share_failed', message: String(err?.message || err) });
  }
}

// dataURL 저장
async function saveDataUrlToGallery(dataUrl, filename) {
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('invalid_dataurl');
  const base64 = match[2];
  const tmpPath = `${RNFS.CachesDirectoryPath}/${filename}`;
  await RNFS.writeFile(tmpPath, base64, 'base64');
  await CameraRoll.save(tmpPath, { type: 'photo' });
}

async function openManageSubscriptionAndroid({ packageName, sku } = {}) {
  if (Platform.OS !== 'android') return;

  // 패키지+SKU 있으면 해당 구독 상세, 없으면 구독 목록
  const deep = (packageName && sku)
    ? `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(sku)}&package=${encodeURIComponent(packageName)}`
    : 'https://play.google.com/store/account/subscriptions';

  try {
    const ok = await Linking.canOpenURL(deep);
    if (ok) return Linking.openURL(deep);
  } catch (e) { }

  // 폴백 1: 해당 앱 상세 페이지(스토어 앱)
  if (packageName) {
    try { return await Linking.openURL(`market://details?id=${packageName}`); } catch (e) { }
  }
  // 폴백 2: 웹 주소
  return Linking.openURL('https://play.google.com/store/account/subscriptions');
}


async function shareToInstagramFeed(payloadOrData = {}, sendToWeb) {
  try {
    const d = payloadOrData?.data ?? payloadOrData ?? {};
    const src = d.imageUrl || d.url || d.image;
    if (!src) throw new Error('no_image_source');

    const requestId =
      payloadOrData?.requestId ??
      payloadOrData?.data?.requestId ??
      null;

    // 🔹 "인스타 피드 공유 중" 플래그 세팅 (예전 그대로)
    pendingShareRef.current = {
      platform: 'INSTAGRAM',
      requestId,
      wasBackground: false,
      done: false,
    };
    lastSendToWebRef.current = sendToWeb;

    // 🔹 캡션 + 해시태그 → 클립보드
    let caption = '';
    try {
      caption =
        buildFinalText({
          caption: d.caption,
          hashtags: d.hashtags,
        }) || '';
      if (caption) {
        Clipboard.setString(caption);
      }
    } catch {
      // 클립보드 실패는 무시
    }

    // 🔹 로컬 JPG 파일 확보 (file://...)
    const { uri, cleanup } = await ensureLocalFile(src, 'jpg');

    try {
      // 🔹 네이티브 인스타 피드 공유 모듈 호출
      await InstagramFeedShareModule.shareImageToFeed(uri, caption || null);

      // ⬇ 여기서 "성공 가능성 있음" 표시만 하고,
      // 진짜 성공 처리(웹에 SHARE_RESULT success)는 AppState 'active'에서 함
      const cur = pendingShareRef.current;
      if (cur && cur.platform === 'INSTAGRAM' && cur.requestId === requestId) {
        pendingShareRef.current = {
          ...cur,
          done: true, // 네이티브 호출이 에러 없이 끝났다 = 유저가 실제 업로드 했을 가능성 있음
        };
      }

      // ❌ 여기서는 sendToWeb('SHARE_RESULT', success) 보내지 않음!!
    } catch (err) {
      const msg = String(err?.message || err || '');
      const code = String(err?.code || '');

      // 인텐트 창에서 바로 취소/실패한 경우 → 대기 플래그 해제
      pendingShareRef.current = null;

      // 인스타 미설치 케이스 (네이티브에서 INSTAGRAM_NOT_INSTALLED 던짐)
      if (code === 'INSTAGRAM_NOT_INSTALLED') {
        alertAppMissingAndMaybeOpenStore({
          key: 'INSTAGRAM',
          appName: '인스타그램',
          sendToWeb,
          errorMessage: msg || 'Instagram app is not installed',
        });

        sendToWeb?.('SHARE_RESULT', {
          success: false,
          platform: 'INSTAGRAM',
          error_code: 'app_not_installed',
          message: msg,
          requestId,
        });
        return;
      }

      const isCanceled =
        err?.code === 'E_USER_CANCELLED' ||
        err?.code === 'E_SHARE_CANCELED' ||
        msg.toLowerCase().includes('cancel') ||
        msg.toLowerCase().includes('dismiss');

      // 웹에 “실패/취소” 알림
      sendToWeb?.('SHARE_RESULT', {
        success: false,
        platform: 'INSTAGRAM',
        error_code: isCanceled ? 'share_canceled' : 'share_failed',
        message: msg,
        requestId,
      });
    } finally {
      setTimeout(() => {
        cleanup().catch(() => {});
      }, 15000);
    }
  } catch (err) {
    // 준비 단계 에러
    pendingShareRef.current = null;
    sendToWeb?.('SHARE_RESULT', {
      success: false,
      platform: 'INSTAGRAM',
      error_code: 'share_failed',
      message: String(err?.message || err),
    });
  }
}

// 인스타 스토리 공유 (새 네이티브 모듈 사용 버전)
async function shareToInstagramStories(payloadOrData = {}, sendToWeb) {
  try {
    const d = payloadOrData?.data ?? payloadOrData ?? {};
    const src = d.imageUrl || d.url || d.image;
    if (!src) throw new Error('no_image_source');

    const requestId =
      payloadOrData?.requestId ??
      payloadOrData?.data?.requestId ??
      null;

    // 1) 로컬 JPG 파일 확보 (file://... 형태)
    const { uri, cleanup } = await ensureLocalFile(src, 'jpg');

    try {
      // 2) 우리가 만든 네이티브 모듈 호출
      //    JS에서는 file://... 그대로 넘겨주면
      //    Kotlin 쪽에서 File(..)로 바꿔서 FileProvider → Instagram으로 전달
      await InstagramStoryShareModule.shareImageToStory(uri);

      // ✅ 네이티브 모듈이 에러 없이 resolve 되면 "성공"으로 처리
      sendToWeb?.('SHARE_RESULT', {
        success: true,
        platform: 'INSTAGRAM_STORIES',
        error_code: null,
        message: null,
        requestId,
      });
    } catch (e) {
        // ❌ 네이티브 모듈에서 reject 된 경우
        const msg = String(e?.message || e);
        const code = e?.code || 'INSTAGRAM_STORY_ERROR';

        sendToWeb?.('SHARE_RESULT', {
          success: false,
          platform: 'INSTAGRAM_STORIES',
          error_code: code,
          message: msg,
          requestId,
        });
      } finally {
      // 캐시 파일 정리 (조금 여유 두고)
      setTimeout(() => {
        cleanup().catch(() => {});
      }, 15000);
    }
  } catch (err) {
    // 준비 단계 에러 (이미지 없음 등)
    const msg = String(err?.message || err);
    sendToWeb?.('SHARE_RESULT', {
      success: false,
      platform: 'INSTAGRAM_STORIES',
      error_code: 'share_failed',
      message: msg,
    });
  }
}




// ─────────── App 컴포넌트 ───────────
const App = () => {
  const webViewRef = useRef(null);

  // 첫 로딩 제어
  const firstLoadRef = useRef(true);

  // 🔹 상태바 제어용 상태 추가
  const [statusBarBg, setStatusBarBg] = useState('#ffffff');
  const [statusBarStyle, setStatusBarStyle] = useState('dark-content');


  const handledTokensRef = useRef(new Set()); // Set<string>

  const [splashVisible, setSplashVisible] = useState(true);
  const splashStartRef = useRef(0);
  const splashFade = useRef(new Animated.Value(1)).current;

  const bootTORef = useRef(null);
  const [token, setToken] = useState('');
  const lastPushTokenRef = useRef('');
  const lastNavStateRef = useRef({});

  // 스플래시 로딩 제어
  const [webReadyDone, setWebReadyDone] = useState(false);
  const [splashAnimDone, setSplashAnimDone] = useState(false);

  // 두 조건 다 true일 때만 스플래시를 숨기는 함수
  useEffect(() => {
    if (!webReadyDone || !splashAnimDone) return;

    Animated.timing(splashFade, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => setSplashVisible(false));
  }, [webReadyDone, splashAnimDone, splashFade]);


  const [mediaSheetVisible, setMediaSheetVisible] = useState(false);
  const preferRef = useRef(null); // 'camera' 선호 여부 보관

  // ✅ 어떤 용도인지 / 몇 장까지 허용할지 기억용
  const pickerModeRef = useRef({ kind: 'IMAGE_PICKER', max: 1 });


  const injectJS = (js) => {
    try { webViewRef.current?.injectJavaScript(String(js) + '\ntrue;'); } catch {}
  };
  const emitWebCancel = () => {
    // 기존: 예전 화면용 콜백
    injectJS(`try { if (window.onCameraCancelled) window.onCameraCancelled(); } catch(e) {}`);

    // ✅ 신규: AdsInquiryWrite에서 쓰는 메시지 방식
    try {
      sendToWeb('PICK_IMAGE_CANCEL', {
        from: 'android_media_picker',
        reason: 'user_cancel_or_no_image',
      });
    } catch (e) {
      console.log('emitWebCancel sendToWeb error', e);
    }
  };

  // ✅ 여러 장도 보낼 수 있도록 수정된 emitWebImage
  const emitWebImage = (data) => {
    // data: "문자열 하나" 또는 ["문자열", "문자열", ...] 배열

    // 1) 옛날 방식 유지용: window.receiveCameraImage 에는 첫 번째 것만 전달
    const firstUri = Array.isArray(data) ? data[0] : data;

    injectJS(
      `try {
         if (window.receiveCameraImage)
           window.receiveCameraImage(${JSON.stringify(firstUri)});
       } catch(e) {}`
    );

    // 2) WebView로 보내는 payload 만들기
    const payload = Array.isArray(data)
      ? { dataUrls: data, from: 'android_media_picker' }   // 여러 장
      : { dataUrls: [data], from: 'android_media_picker' } // 한 장

    try {
      sendToWeb('PICK_IMAGE_RESULT', payload);
    } catch (e) {
      console.log('emitWebImage sendToWeb error', e);
    }
  };




  // ─────────── 외부앱/새창 처리 헬퍼 ───────────
const isHttpLike = (u = '') => /^https?:\/\//i.test(u);
const isExternalScheme = (u = '') =>
  /^(?:intent|market|passauth|pass|ktauthexternalcall|tauthlink|upluscorporation|kakaolink|naversearchapp|tel|mailto|sms):/i.test(u);

// Android intent:// URI 파서
// 예: intent://requestktauth?appToken=...#Intent;scheme=ktauthexternalcall;package=com.kt.ktauth;end
function parseAndroidIntentUri(url = '') {
  if (!/^intent:\/\//i.test(url)) return null;
  try {
    const withoutPrefix = url.replace(/^intent:\/\//i, '');
    const parts = withoutPrefix.split('#Intent');
    const pathQueryRaw = parts[0] || '';
    const intentPart = parts[1] || '';

    const getVal = (key) => {
      const m = new RegExp(`${key}=([^;]+)`, 'i').exec(intentPart);
      return m ? m[1] : null;
    };

    const scheme = getVal('scheme');
    const pkg = getVal('package');

    // 앞의 슬래시를 모두 제거 (/* 패턴 없이 안전한 정규식 사용)
    const pathQuery = String(pathQueryRaw).replace(/^\/+/, '');

    const asCustomUrl = scheme ? `${scheme}://${pathQuery}` : null;
    return { scheme, pkg, pathQuery, asCustomUrl };
  } catch (e) {
    return null;
  }
}

async function openExternalUrl(url) {
  try {
    // intent:// 처리
    if (/^intent:\/\//i.test(url)) {
      const parsed = parseAndroidIntentUri(url);
        console.log('[PASS] intent→parsed', parsed);
      // 1) 커스텀 스킴 URL로 먼저 시도 (예: ktauthexternalcall://requestktauth?...)
      if (parsed?.asCustomUrl) {
        try {
          const can = await Linking.canOpenURL(parsed.asCustomUrl);
          console.log('[PASS][canOpenURL]', can, parsed.asCustomUrl);
          if (can) {
            await Linking.openURL(parsed.asCustomUrl);
            return true;
          }
        } catch {}
      }

      // 2) 브라우저 폴백
      const fbMatch = /S\.browser_fallback_url=([^;]+)/i.exec(url);
      if (fbMatch && fbMatch[1]) {
        const fb = decodeURIComponent(fbMatch[1]);
        try {
          await Linking.openURL(fb);
          return true;
        } catch {}
      }

      // 3) 패키지 기반 스토어 폴백
      const pkg =
        parsed?.pkg || (/(?:;|^)package=([^;]+)/i.exec(url)?.[1] ?? null);
      if (pkg) {
        try {
          await Linking.openURL(`market://details?id=${pkg}`);
          return true;
        } catch {}
        try {
          await Linking.openURL(
            `https://play.google.com/store/apps/details?id=${pkg}`
          );
          return true;
        } catch {}
      }
      return false;
    }

    // market:// 처리
    if (/^market:\/\//i.test(url)) {
      try {
        await Linking.openURL(url);
        return true;
      } catch {}
      const id = (url.match(/id=([^&]+)/i) || [])[1];
      if (id) {
        try {
          await Linking.openURL(
            `https://play.google.com/store/apps/details?id=${id}`
          );
          return true;
        } catch {}
      }
      return false;
    }

    // 일반 커스텀 스킴 처리 (passauth://, ktauthexternalcall:// 등)
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (e) {
    console.log('[WebView][openExternalUrl][ERR]', url, e?.message || e);
    return false;
  }
}

function shouldAllowWebRequest(req) {
  const url = req?.url || '';
  console.log('[WV][shouldStart]', url); // ← 반드시 찍히는지 확인
  if (isHttpLike(url)) return true;

  if (isExternalScheme(url)) {
    openExternalUrl(url).then((ok) => {
      if (!ok) {
        try {
          Alert.alert(
            '앱 열기 실패',
            '필요한 인증 앱이 없거나 열 수 없습니다. 실제 단말에서 다시 시도해 주세요.'
          );
        } catch {}
      }
    });
    // WebView는 로드 금지
    return false;
  }

  // 알 수 없는 스킴도 보수적으로 외부 시도
  openExternalUrl(url);
  return false;
}


    async function pickFromLibrary() {
      try {
        const mode = pickerModeRef.current || { kind: 'IMAGE_PICKER', max: 1 };
        const rawMax = mode.max && Number.isFinite(mode.max) ? mode.max : 1;
        const max = Math.min(rawMax, 3);   // ✅ 최대 3장

        const res = await launchImageLibrary({
          mediaType: 'photo',
          includeBase64: true,
          selectionLimit: max,
        });

        if (res.didCancel) {
          emitWebCancel();
          return;
        }

        const assets = res?.assets || [];
        if (!assets.length) {
          emitWebCancel();
          return;
        }

        // ✅ 1) 예전 방식: 한 장짜리 IMAGE_PICKER
        if (mode.kind === 'IMAGE_PICKER') {
          const a = assets[0];
          if (!a?.base64) {
            emitWebCancel();
            return;
          }
          const mime = a.type || 'image/jpeg';
          const uri = `data:${mime};base64,${a.base64}`;
          emitWebImage(uri);   // 문자열 하나
          return;
        }

        // ✅ 2) 여러 장 선택용 MEDIA_PICKER
        //    -> base64 있는 것만 골라서 dataURL 배열로 만들기
        const list = assets
          .filter((a) => !!a?.base64)
          .map((a) => {
            const mime = a.type || 'image/jpeg';
            return `data:${mime};base64,${a.base64}`;
          });

        if (!list.length) {
          emitWebCancel();
          return;
        }

        // 🔹 여기서 한 번에 배열로 보내기
        emitWebImage(list);   // ["data:...","data:..."] 이런 형태
      } finally {
        setMediaSheetVisible(false);
      }
    }

  async function takePhoto() {
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        saveToPhotos: false,
      });
      if (res.didCancel) { emitWebCancel(); return; }
      const a = res?.assets?.[0];
      if (!a?.base64) { emitWebCancel(); return; }
      const mime = a.type || 'image/jpeg';
      emitWebImage(`data:${mime};base64,${a.base64}`);
    } finally {
      setMediaSheetVisible(false);
    }
  }

  const [installId, setInstallId] = useState(null);
  const [webTextZoom, setWebTextZoom] = useState(100);
  const [appVersion, setAppVersion] = useState(null);
  // 시스템 폰트 배율(접근성 글자 크기) → 100 단위로 환산
  const getSystemTextZoom = useCallback(() => {
    try {
      return Math.round(PixelRatio.getFontScale() * 100);
    } catch {
      return 100;
    }
  }, []);

  // ─────────── IAP 진행 상태(락) ───────────
  const iapBusyRef = useRef(false);
  const lastIapTsRef = useRef(0);

  function beginIap(tag, extra = {}) {
    const now = Date.now();
    // 0.8초 내 중복 호출 차단 + 이미 진행 중 차단
    if (iapBusyRef.current || (now - lastIapTsRef.current) < 800) {
      DBG.log('IAP busy, ignore', { tag, extra });
      return false;
    }
    lastIapTsRef.current = now;
    iapBusyRef.current = true;
    // 진행 시작 알림(웹은 이걸로 스피너만 표시, 완료 금지)

    return true;
  }
  function endIap() {
    iapBusyRef.current = false;
  }


    // 버전 제어
  useEffect(() => {
    let mounted = true;
    (async () => {
      const id = await getOrCreateInstallId();
      if (mounted) setInstallId(id);
      const version = await DeviceInfo.getVersion();
      console.log('현재 버전:', version);
      if (mounted) setAppVersion(version);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { LogBox.ignoreAllLogs(true); }, []);

  const sendToWeb = useCallback((type, payload = {}) => {
    try {
      const msg = JSON.stringify({ type, payload });
      webViewRef.current?.postMessage(msg);
    } catch (e) { console.log('❌ postMessage error:', e); }
  }, []);

    useEffect(() => {
      lastSendToWebRef.current = sendToWeb;
    }, [sendToWeb]);

    // 인스타 공유 후, 앱으로 복귀했을 때 final로 넘어가게 하는 리스너
    useEffect(() => {
      const sub = AppState.addEventListener('change', (state) => {
        const pending = pendingShareRef.current;
        const sendToWeb = lastSendToWebRef.current;

        // 진행 중 공유가 없거나, 웹쪽으로 보낼 통로가 없으면 무시
        if (!pending || !sendToWeb) return;

        if (state === 'background') {
          // 인스타/공유 인텐트로 나갈 때: background 기록
          pendingShareRef.current = {
            ...pending,
            wasBackground: true,
          };
          return;
        }

        if (state === 'active') {
          // ✨ 여기서 핵심: "진짜 성공" 기준
          // 1) 공유 함수에서 Share.shareSingle 이 성공으로 끝남 → pending.done === true
          // 2) 그 사이에 한번 background 를 거쳤음 → pending.wasBackground === true
          if (pending.wasBackground && pending.done) {
            const { platform, requestId } = pending;

            // 더 이상 대기 상태 아님
            pendingShareRef.current = null;

            // 웹으로 성공 신호
            sendToWeb('SHARE_RESULT', {
              success: true,
              platform,      // 'INSTAGRAM' or 'INSTAGRAM_STORIES'
              requestId,
              source: 'resume', // 디버깅용
            });
          }
        }
      });

      return () => {
        sub.remove();
      };
    }, []);



  // Splash
  const hideSplashRespectingMin = useCallback(() => {
    const elapsed = Date.now() - (splashStartRef.current || Date.now());
    const wait = Math.max(MIN_SPLASH_MS - elapsed, 0);
    setTimeout(() => {
      Animated.timing(splashFade, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true })
        .start(() => setSplashVisible(false));
    }, wait);
  }, [splashFade]);
  const showSplashOnce = useCallback(() => {
    if (!splashVisible) { setSplashVisible(true); splashFade.setValue(1); splashStartRef.current = Date.now(); }
    else if (!splashStartRef.current) { splashStartRef.current = Date.now(); }
  }, [splashFade, splashVisible]);

  // HW Back
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const nav = lastNavStateRef.current || {};
      const isRoot = nav.isRoot === true;
      const webCanHandle = !isRoot || nav.hasBlockingUI === true || nav.needsConfirm === true || nav.canGoBackInWeb === true;
      if (webCanHandle) { sendToWeb('BACK_REQUEST', { nav, at: Date.now() }); return true; }
      Alert.alert('앱 종료', '앱을 종료할까요?', [
        { text: '취소', style: 'cancel' },
        { text: '종료', style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, [sendToWeb]);

  // Web ready/error
  const handleWebReady = useCallback(() => {
    if (bootTORef.current) {
      clearTimeout(bootTORef.current);
      bootTORef.current = null;
    }

    // 웹에서 기다리는 핸드셰이크는 그대로 유지
    sendToWeb('WEB_READY_ACK', {
      at: Date.now(),
      install_id: installId ?? 'unknown',
    });

    // ⛔ 여기서는 스플래시를 내리지 않는다
    // 스플래시 hide는 WEB_LOADING_DONE 기준으로만 처리
  }, [sendToWeb, installId]);


  const handleWebError = useCallback((payload) => {
    if (bootTORef.current) { clearTimeout(bootTORef.current); bootTORef.current = null; }
    sendToWeb('WEB_ERROR_ACK', { ...(payload || {}), at: Date.now() });
    sendToWeb('OFFLINE_FALLBACK', { reason: payload?.reason || 'js_error', at: Date.now() });
  }, [sendToWeb]);

  // Push permission (notifee)
  const ensureNotificationPermission = useCallback(async () => {
    try { const settings = await notifee.requestPermission(); return !!settings?.authorizationStatus; }
    catch { return false; }
  }, []);
  const replyPermissionStatus = useCallback(({ pushGranted }) => {
    sendToWeb('PERMISSION_STATUS', { push: { granted: !!pushGranted, blocked: false }, token, install_id: installId ?? 'unknown' });
  }, [sendToWeb, token, installId]);

  // Push: token + foreground
  useEffect(() => {
    if (!installId) return;
    (async () => {
      try {
        const fcmToken = await messaging().getToken();
        setToken(fcmToken);
        lastPushTokenRef.current = fcmToken;
        sendToWeb('PUSH_TOKEN', { token: fcmToken, platform: Platform.OS, app_version: APP_VERSION, install_id: installId ?? 'unknown', ts: Date.now() });
      } catch (e) { console.log('❌ FCM token error:', e); }
    })();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      sendToWeb('PUSH_EVENT', {
        event: 'received',
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        deeplink: remoteMessage.data?.deeplink,
        messageId: remoteMessage.messageId,
        ts: Date.now(),
      });
    });
    return () => unsubscribe();
  }, [sendToWeb, installId]);

  // ─────────── IAP init & listeners (Android only) ───────────
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      try {
        const ok = await RNIAP.initConnection();
        console.log('[IAP][init]', ok);
        try { await RNIAP.flushFailedPurchasesCachedAsPendingAndroid?.(); } catch { }
      } catch (e) {
        console.log('[IAP][init][ERR]', e?.code, e?.message || String(e));
      }

      // 구독 offerToken 선적재
      try { await preloadOfferTokens(ANDROID_SKUS); } catch { }

      // (디버그) 등록된 단건 상품 조회
      try {
        const prods = await RNIAP.getProducts({ skus: ANDROID_INAPP_BASIC });
        DBG.log('getProducts.len=', prods?.length || 0);
        DBG.chunk('getProducts.items', prods);
      } catch (e) {
        DBG.chunk('getProducts.CATCH', { raw: e });
      }
      // 구매 성공/보류 리스너
      purchaseUpdateSub = RNIAP.purchaseUpdatedListener(async (p) => {
        try {
          const { productId, orderId, purchaseToken, purchaseStateAndroid, isAcknowledgedAndroid, transactionId } = p || {};
          DBG.chunk('purchaseUpdated.payload', p);

          const id = orderId || purchaseToken || transactionId || null;
          const isOneTime = ANDROID_INAPP_BASIC.includes(productId);

          // ====== 동일 토큰 중복 처리 방지 ======
          if (purchaseToken && handledTokensRef.current.has(purchaseToken)) {
            DBG.log('finishTransaction.skip (already handled)', productId, purchaseToken);
            return;
          }

          // ── 단건(Consumable) 처리: 베이직(wm_basic_n)
          if (isOneTime) {
            try {
              // v14 표준: 구매 객체 p 넘기고 consumable=true
              // await RNIAP.finishTransaction(p, true);

              const purchaseToken = p.purchaseToken;
              handledTokensRef.current.add(purchaseToken);
              sendToWeb('PURCHASE_RESULT', {
                success: true,
                platform: Platform.OS,
                one_time: true,
                product_id: productId,
                transaction_id: id,
                purchase_token: purchaseToken, // ★ 이거 추가
              });
              endIap();
              return;
            } catch (fe) {
              const msg = String(fe?.message || fe);
              DBG.log('finishTransaction.ERROR', fe?.code, msg);

              // ====== 우회 시나리오 ======
              // 일부 단말/샌드박스에서 'not suitable' / 'already'가 뜨면
              // 비소모(false)로 마무리 시도 + ack 시도 후 성공으로 처리.
//              if (/not suitable/i.test(msg) || /already/i.test(msg)) {
//                try {
//                  try { await RNIAP.finishTransaction(p, false); } catch { }
//                  try { await RNIAP.acknowledgePurchaseAndroid?.(purchaseToken); } catch { }
//                  DBG.log('finishTransaction.fallback.done', productId);
//
//                  handledTokensRef.current.add(purchaseToken);
//                  sendToWeb('PURCHASE_RESULT', {
//                    success: true, platform: Platform.OS,
//                    one_time: true, product_id: productId, transaction_id: id,
//                  });
//                  endIap();
//                  return;
//                } catch (fe2) {
//                  DBG.log('finishTransaction.fallback.ERROR', fe2?.code, String(fe2?.message || fe2));
//                  sendToWeb('PURCHASE_RESULT', {
//                    success: false, platform: Platform.OS,
//                    error_code: fe2?.code || 'finish_failed',
//                    message: String(fe2?.message || fe2),
//                  });
//                  endIap();
//                  return;
//                }
//              }

              // 일반 실패
              sendToWeb('PURCHASE_RESULT', {
                success: false, platform: Platform.OS,
                error_code: fe?.code || 'finish_failed',
                message: msg,
              });
              endIap();
              return;
            }
          }

          // ── 구독 처리 ──
          // 보류(PENDING)
          if (purchaseStateAndroid === 2) {
            sendToWeb('SUBSCRIPTION_RESULT', {
              success: false, pending: true, platform: 'android',
              product_id: productId || '', transaction_id: id, message: '승인 대기',
            });
            endIap();
            return;
          }

          // 완료 + 미인증 → acknowledge
          if (purchaseStateAndroid === 1 && !isAcknowledgedAndroid && purchaseToken) {
            try { await RNIAP.acknowledgePurchaseAndroid(purchaseToken); }
            catch (e) { DBG.log('[IAP][ack][ERR]', e?.code, e?.message || String(e)); }
          }

          handledTokensRef.current.add(purchaseToken);
          sendToWeb('SUBSCRIPTION_RESULT', {
            success: true, platform: 'android',
            product_id: productId || '',
            transaction_id: id,
            purchase_token: purchaseToken,
            acknowledged: true,
          });
          endIap();
        } catch (e) {
          DBG.log('[IAP][purchaseUpdated][ERR]', e?.code, e?.message || String(e));
          sendToWeb('SUBSCRIPTION_RESULT', {
            success: false, platform: 'android',
            error_code: e?.code || 'purchase_handle_failed',
            message: String(e?.message || e),
          });
          endIap();
        }
      });


      // 구매 에러 리스너
      purchaseErrorSub = RNIAP.purchaseErrorListener((err) => {
        console.log('[IAP][ERR]', err?.code, err?.message);
        const payload = {
          success: false, platform: Platform.OS,
          error_code: err?.code || 'purchase_error',
          message: err?.message || String(err),
        };
        // 단건/구독 공통 에러 콜백
        sendToWeb('PURCHASE_RESULT', payload);
        sendToWeb('SUBSCRIPTION_RESULT', payload);
        endIap();
      });

    })();

    return () => {
      try { purchaseUpdateSub?.remove?.(); } catch { }
      try { purchaseErrorSub?.remove?.(); } catch { }
      try { RNIAP.endConnection(); } catch { }
    };
  }, [sendToWeb]);

  // ─────────── 구매 실행(구독) ───────────
  async function buyAndroidSku(sku) {
    try {
      if (!ANDROID_SKUS.includes(sku)) throw new Error('invalid_sku');
      DBG.log('buyAndroidSku.begin', sku);

      // 최신 offerToken 확보(있으면 붙이고, 없어도 호출 가능)
      let offerToken = await ensureOfferToken(sku);
      try {
        const items = await RNIAP.getSubscriptions({ skus: [sku] });
        const d = items?.find(p => p.productId === sku);
        const alt = d?.subscriptionOfferDetails?.[0]?.offerToken || null;
        if (!offerToken && alt) offerToken = alt;
        DBG.chunk('buyAndroidSku.subItem', d || {});
      } catch (e) {
        DBG.log('buyAndroidSku.getSubs.err', e?.code, e?.message);
      }

      const params = offerToken
        ? { sku, subscriptionOffers: [{ sku, offerToken }] }
        : { sku };
      DBG.chunk('buyAndroidSku.params', params);

      await RNIAP.requestSubscription(params);
      DBG.log('requestSubscription.called');
    } catch (e) {
      const code = e?.code || '';
      const msg = String(e?.message || e);

      if (code === 'E_USER_CANCELLED' || /cancel/i.test(msg)) {
        DBG.log('subscription.user_cancelled');
        sendToWeb('SUBSCRIPTION_RESULT', {
          success: false, platform: 'android',
          error_code: 'E_USER_CANCELLED',
          message: 'Payment is Cancelled.',
          cancelled: true,
        });
        try { endIap(); } catch { }
        return;
      }

      DBG.log('buyAndroidSku.ERROR', code, msg);
      sendToWeb('SUBSCRIPTION_RESULT', {
        success: false, platform: 'android',
        error_code: code || 'request_failed',
        message: msg,
      });
      DBG.toast(`구독요청 실패: ${msg}`);
      try { endIap(); } catch { }
    }
  }




  // ─────────── 구매 실행(단건/Consumable — ANDROID 전용) ───────────
  async function buyAndroidOneTime(sku) {
    try {
      if (!sku) throw new Error('invalid_inapp_sku');
      DBG.log('buyAndroidOneTime.begin', { sku });


      // ✅ v14 안드로이드: { skus: [...] } 한 번만 호출
      const params = { skus: [sku] };
      DBG.chunk('buyAndroidOneTime.params', params);

      await RNIAP.requestPurchase(params);
      DBG.log('requestPurchase.called');
      // 성공/실패/취소는 리스너(purchaseUpdated/purchaseError)에서 처리(endIap 포함)
    } catch (e) {
      const code = e?.code || '';
      const msg = String(e?.message || e);

      // ✅ 사용자가 취소한 경우: 재시도/폴백 금지, 바로 종료
      if (code === 'E_USER_CANCELLED' || /cancel/i.test(msg)) {
        DBG.log('purchase.user_cancelled');
        // 웹에 "취소" 알림(완료 아님)
        sendToWeb('PURCHASE_RESULT', {
          success: false,
          platform: 'android',
          error_code: 'E_USER_CANCELLED',
          message: 'Payment is Cancelled.',
          cancelled: true,
        });
        try { endIap(); } catch { }
        return;
      }

      // 기타 실패
      DBG.chunk('buyAndroidOneTime.ERROR', { raw: e });
      sendToWeb('PURCHASE_RESULT', {
        success: false,
        platform: 'android',
        error_code: code || 'purchase_failed',
        message: msg,
      });
      DBG.toast(`일회성 구매 실패: ${msg}`);
      try { endIap(); } catch { }
    }
  }


  // (iOS용 단건 — 분리 프로젝트라 해도 안전하게 처리)
  async function buyIOSOneTime(sku) {
    try {
      if (!sku) throw new Error('invalid_inapp_sku_ios');
      DBG.log('buyIOSOneTime.begin', sku);
      await RNIAP.requestPurchase({ sku });
      DBG.log('buyIOSOneTime.requestPurchase.called');
    } catch (e) {
      DBG.chunk('buyIOSOneTime.ERROR', { raw: e });
      sendToWeb('PURCHASE_RESULT', {
        success: false, platform: 'ios',
        error_code: e?.code || 'purchase_failed',
        message: String(e?.message || e),
      });
    }
  }

  // 복원(구독 중심; 단건 소비성은 복원 대상 아님)
  async function restoreAndroidSubs() {
    try {
      const items = await RNIAP.getAvailablePurchases();
      sendToWeb('SUBSCRIPTION_RESTORED', {
        success: true, platform: 'android',
        items: (items || []).map(p => ({ product_id: p.productId, transaction_id: p.transactionId || p.orderId || null })),
      });
    } catch (e) {
      sendToWeb('SUBSCRIPTION_RESTORED', {
        success: false, platform: 'android',
        error_code: e?.code || 'restore_failed',
        message: String(e?.message || e),
      });
    }
  }

  // Auth: Google/Kakao (기존 유지)
  const safeSend = (type, payload) => { try { sendToWeb(type, payload); } catch (e) { console.log('[SEND_ERROR]', e); } };
  const handleStartSignin = useCallback(async (payload) => {
    const provider = payload?.provider;
    try {
      if (provider === 'google') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        try { await GoogleSignin.signOut(); } catch { }
        try { await GoogleSignin.revokeAccess(); } catch { }
        const res = await GoogleSignin.signIn();
        let idToken = res?.idToken;
        if (!idToken) { try { const tokens = await GoogleSignin.getTokens(); idToken = tokens?.idToken || null; } catch { } }
        if (!idToken) throw new Error('no_id_token');
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        const userCred = await auth().signInWithCredential(googleCredential);
        safeSend('SIGNIN_RESULT', {
          success: true, provider: 'google',
          user: { uid: userCred.user.uid, email: userCred.user.email, displayName: userCred.user.displayName, photoURL: userCred.user.photoURL },
          expires_at: Date.now() + 6 * 3600 * 1000,
        });
        return;
      }

      if (provider === 'kakao') {
        try {
          const keyHash = await KakaoLoginModule.getKeyHash();
          console.log('[KAKAO] keyHash =', keyHash);
          let res;
          if (typeof KakaoLoginModule.loginWithKakaoTalk === 'function') res = await KakaoLoginModule.loginWithKakaoTalk();
          else if (typeof KakaoLoginModule.login === 'function') res = await KakaoLoginModule.login();
          else throw new Error('kakao_module_missing_methods');

          safeSend('SIGNIN_RESULT', {
            success: true, provider: 'kakao',
            user: { provider_id: String(res.id), email: res.email || '', displayName: res.nickname || '', photoURL: res.photoURL || '' },
            tokens: { access_token: res.accessToken, refresh_token: res.refreshToken || '' },
            expires_at: Date.now() + 6 * 3600 * 1000,
          });
          return;
        } catch (err) {
          console.log('[KAKAO LOGIN ERROR]', err);
          safeSend('SIGNIN_RESULT', { success: false, provider: 'kakao', error_code: err?.code || 'kakao_error', error_message: err?.message || String(err) });
          return;
        }
      }

      if (provider === 'naver') {
        try {
          const { redirectUri, state } = payload || {};
          if (!redirectUri || !state) throw new Error('invalid_payload');
          const ensureSlash = (u) => (u.endsWith('/') ? u : u + '/');
          const ru = ensureSlash(redirectUri);
          const authUrl = `${NAVER_AUTH_URL}?response_type=code`
            + `&client_id=${encodeURIComponent(NAVER_CLIENT_ID)}`
            + `&redirect_uri=${encodeURIComponent(ru)}`
            + `&state=${encodeURIComponent(state)}`;
          console.log('[NAVER_DEBUG] authorizeURL', authUrl);
          const js = `location.href='${authUrl.replace(/'/g, "\\'")}'; true;`;
          webViewRef.current?.injectJavaScript(js);
          safeSend('NAVER_LOGIN_STARTED', { at: Date.now() });
          return;
        } catch (e) {
          safeSend('SIGNIN_RESULT', { success: false, provider: 'naver', error_code: 'naver_start_failed', error_message: String(e?.message || e) });
          return;
        }
      }

      throw new Error('unsupported_provider');
    } catch (err) {
      const code = (err && typeof err === 'object' && 'code' in err) ? err.code :
        (String(err?.message || '').includes('no_id_token') ? 'no_id_token' : 'unknown_error');
      const msg = (err && typeof err === 'object' && 'message' in err && err.message) || (typeof err === 'string' ? err : JSON.stringify(err));
      safeSend('SIGNIN_RESULT', { success: false, provider, error_code: code, error_message: msg });
    }
  }, [sendToWeb]);

  const handleStartSignout = useCallback(async () => {
    try { await auth().signOut(); sendToWeb('SIGNOUT_RESULT', { success: true }); }
    catch (err) { sendToWeb('SIGNOUT_RESULT', { success: false, error_code: 'signout_error', message: String(err?.message || err) }); }
  }, [sendToWeb]);

  // Web → App 라우터
  const handleCheckPermission = useCallback(async () => { const push = await ensureNotificationPermission(); replyPermissionStatus({ pushGranted: push }); }, [ensureNotificationPermission, replyPermissionStatus]);
  const handleRequestPermission = useCallback(async () => { const push = await ensureNotificationPermission(); replyPermissionStatus({ pushGranted: push }); }, [ensureNotificationPermission, replyPermissionStatus]);

  const onMessageFromWeb = useCallback(async (e) => {
    try {
      const raw = e.nativeEvent.data;
      if (typeof raw === 'string' && raw.startsWith('open::')) { const url = raw.replace('open::', ''); try { await Linking.openURL(url); } catch { }; return; }
      const data = JSON.parse(raw);

      switch (data.type) {
        case 'GET_INSTALLATION_ID': { sendToWeb('INSTALLATION_ID', { install_id: installId ?? 'unknown', ts: Date.now() }); break; }
        case 'WEB_READY': await handleWebReady(); break;
        case 'WEB_ERROR': await handleWebError(data.payload); break;
        case 'CHECK_PERMISSION': await handleCheckPermission(); break;
        case 'REQUEST_PERMISSION': await handleRequestPermission(); break;

        case 'OPEN_NOTIFICATION_SETTINGS': {
          if (AppUtilModule?.openAppNotificationSettings) {
            AppUtilModule.openAppNotificationSettings();
          }
          break;
        }

        case 'DOWNLOAD_FILE': {
          console.log('[RN][DOWNLOAD_FILE] start', data);
          try {
            const { url, filename } = data.payload || {};
            console.log('[RN][DOWNLOAD_FILE] payload', url, filename);

            const path = await downloadFileToDevice(url, filename);
            console.log('[RN][DOWNLOAD_FILE] success path=', path);
            sendToWeb('DOWNLOAD_FILE_RESULT', {
                  ok: true,
                  path,       // 기기 내 저장 경로
                  filename,   // 원본 파일명
                });
          } catch (err) {
            console.log('[DOWNLOAD_FILE][error]', err);
            sendToWeb('DOWNLOAD_FILE_RESULT', {
                  ok: false,
                  error: String(err?.message || err),
                });

            // Alert.alert('다운로드 실패', String(err?.message || err));
          }
          break;
        }



        case 'OPEN_APP_STORE': {
          try {
            if (Platform.OS === 'android') {
              Linking.openURL('market://details?id=com.wizmarket')
                .catch(() => {
                  Linking.openURL(
                    'https://play.google.com/store/apps/details?id=com.wizmarket'
                  );
                });
            } else {
              // TODO: iOS 실제 앱스토어 URL로 교체
              Linking.openURL('https://apps.apple.com/kr/app/your-app-id');
            }
          } catch (e) {
            console.log('[OPEN_APP_STORE][ERR]', e);
          }
          break;
        }


        case 'WEB_LOADING_DONE': {
          console.log('[RN] tryHideSplash 호출')
          if (bootTORef.current) {
            clearTimeout(bootTORef.current);
            bootTORef.current = null;
          }

          // 👉 웹은 준비 완료
          setWebReadyDone(true);

          // 👉 애니메이션도 끝났다면 지금 바로 스플래시 내림
          // tryHideSplash();
          break;
        }


        case 'SET_STATUS_BAR': {
                  const bg = data?.payload?.backgroundColor || '#ffffff';
                  const styleKey = data?.payload?.style === 'light' ? 'light-content' : 'dark-content';

                  // console.log('[SET_STATUS_BAR]', bg, styleKey);

                  // 🔹 명령형 호출 대신 상태 업데이트만
                  setStatusBarBg(bg);
                  setStatusBarStyle(styleKey);
                  break;
                }

        case 'GET_APP_VERSION': {
                sendToWeb('APP_VERSION', {
                  app_version: appVersion ?? 'unknown',
                  ts: Date.now(),
                });
                break;
              }
        case 'COPY_TO_CLIPBOARD': {
          const text = data?.payload?.text || '';
          try {
            if (text) {
              Clipboard.setString(text);   // ✅ 네이티브에서 클립보드 복사
              sendToWeb('COPY_TO_CLIPBOARD_RESULT', {
                success: true,
                length: text.length,
              });
            } else {
              sendToWeb('COPY_TO_CLIPBOARD_RESULT', {
                success: false,
                error: 'empty_text',
              });
            }
          } catch (e) {
            sendToWeb('COPY_TO_CLIPBOARD_RESULT', {
              success: false,
              error: String(e?.message || e),
            });
          }
          break;
        }




        case 'OPEN_MEDIA_PICKER': {
                    const prefer = data?.payload?.prefer || null;
                    const max = data?.payload?.max && Number.isFinite(data.payload.max)
                      ? Math.max(1, Math.min(3, data.payload.max))
                      : 3;

                    pickerModeRef.current = { kind: 'MEDIA_PICKER', max };
                    preferRef.current = prefer;
                    setMediaSheetVisible(true);
                    break;
        }
        case 'OPEN_IMAGE_PICKER': {
                  const prefer = data?.payload?.prefer || null;
                  pickerModeRef.current = { kind: 'IMAGE_PICKER', max: 1 };
                  preferRef.current = prefer;
                  setMediaSheetVisible(true);
                  break;
                }

        // 글자 크기대로 반영
        case 'TEXT_ZOOM': {
          if (Platform.OS === 'android') {
            const mode = data?.mode;        // "system" | "fixed" | number
            if (mode === 'system') {
              setWebTextZoom(getSystemTextZoom());   // 접근성 글자크기 반영
            } else if (mode === 'fixed' || mode == null) {
              setWebTextZoom(100);                   // 고정
            } else if (typeof mode === 'number') {
              setWebTextZoom(Math.round(mode));      // 임의 배율(예: 110)
            }
          }
          break;
        }

        // ✅ 구독 결제
        case 'START_SUBSCRIPTION': {
          const sku = data?.payload?.product_id;
          DBG.log('START_SUBSCRIPTION recv sku=', sku);


          // 시작 락
          if (!beginIap('subscription', { sku })) { DBG.log('IAP busy. ignore'); break; }

          // 🔒 세이프가드: 베이직(인앱)이 구독 경로로 들어오면 '단건'으로 재라우팅
          if (ANDROID_INAPP_BASIC.includes(sku)) {
            DBG.log('route_fix', 'in-app SKU on subscription path → buying one-time');
            if (Platform.OS === 'android') await buyAndroidOneTime(sku);
            else await buyIOSOneTime(sku);
            // 결과/락 해제는 리스너에서
            break;
          }

          // ⬇️ 여기부터는 '구독'만 통과
          if (!sku || !ANDROID_SKUS.includes(sku)) {

            sendToWeb('SUBSCRIPTION_RESULT', {
              success: false, platform: Platform.OS,
              error_code: 'bad_sku', message: `unknown sku ${sku}`
            });
            endIap(); // 시작했으므로 해제
            break;
          }

          if (Platform.OS === 'android') {
       
            await buyAndroidSku(sku);
          } else {
            sendToWeb('SUBSCRIPTION_RESULT', { success: false, platform: 'ios', error_code: 'not_supported' });
            endIap();
          }
          break;
        }

        // ✅ 단건(베이직) 결제
        case 'START_ONE_TIME_PURCHASE': {
          const sku = data?.payload?.product_id; // 'wm_basic_n'
          DBG.log('START_ONE_TIME_PURCHASE recv sku=', sku);
 
          if (!beginIap('one_time', { sku })) { DBG.log('IAP busy. ignore'); break; }
          if (!sku || !ANDROID_INAPP_BASIC.includes(sku)) {
              sendToWeb('PURCHASE_RESULT', {
                success: false,
                platform: Platform.OS,
                error_code: 'bad_sku',
                message: `invalid one-time sku: ${sku}`,
              });
              endIap();
              break;
          }

          if (Platform.OS === 'android') {
            await buyAndroidOneTime(sku);
          } else {
            await buyIOSOneTime(sku);
          }
          // 결과/락 해제는 리스너에서
          break;
        }


        case 'RESTORE_SUBSCRIPTIONS': {
          if (Platform.OS === 'android') await restoreAndroidSubs();
          else sendToWeb('SUBSCRIPTION_RESTORED', { success: false, platform: 'ios', error_code: 'not_supported' });
          break;
        }
          
        case 'MANAGE_SUBSCRIPTION': {
          // payload 예: { packageName: 'com.wizmarket.app', sku: 'wm_premium_m' }
          const { packageName, sku } = data?.payload || {};
          await openManageSubscriptionAndroid({ packageName, sku });
          break;
        }

        case 'START_SHARE': {
          try {
            const { image, caption, platform } = data.payload || {};
            await Share.open({ title: '공유', message: caption ? `${caption}\n` : undefined, url: image, failOnCancel: false });
            sendToWeb('SHARE_RESULT', { success: true, platform, post_id: null });
          } catch (err) {
            sendToWeb('SHARE_RESULT', { success: false, platform: data?.payload?.platform, error_code: 'share_failed', message: String(err?.message || err) });
          }
          break;
        }

        case 'share.toChannel': { await handleShareToChannel(data, sendToWeb); break; }

        case 'DOWNLOAD_IMAGE': {
          try {
            const { url, dataUrl, filename } = data.payload || {};
            const safeName = filename && filename.includes('.') ? filename : 'image.jpg';
            if (url) await downloadAndSaveToGallery(url, safeName);
            else if (dataUrl) await saveDataUrlToGallery(dataUrl, safeName);
            else throw new Error('no_url_or_dataUrl');
            sendToWeb('DOWNLOAD_RESULT', { success: true, filename: safeName });
            // Alert.alert('완료', '이미지가 갤러리에 저장되었습니다.');
          } catch (err) {
            console.log('[DOWNLOAD_IMAGE][error]', err);
            sendToWeb('DOWNLOAD_RESULT', { success: false, error_code: 'save_failed', message: String(err?.message || err) });
            Alert.alert('오류', `이미지 저장 실패: ${String(err?.message || err)}`);
          }
          break;
        }

        case 'GET_PUSH_TOKEN': {
          try {
            const t = lastPushTokenRef.current || token || '';
            sendToWeb('PUSH_TOKEN', { token: t, platform: Platform.OS, app_version: APP_VERSION, install_id: installId ?? 'unknown', ts: Date.now() });
          } catch (err) {
            sendToWeb('PUSH_TOKEN', { token: '', platform: Platform.OS, app_version: APP_VERSION, install_id: installId ?? 'unknown', ts: Date.now(), error: String(err?.message || err) });
          }
          break;
        }

        case 'START_SIGNIN': await handleStartSignin(data.payload); break;
        case 'START_SIGNOUT': await handleStartSignout(); break;

        case 'EXIT_APP': BackHandler.exitApp(); break;

        case 'NAV_STATE': {
          const nav = data.payload || {};
          lastNavStateRef.current = {
            isRoot: !!nav.isRoot,
            path: nav.path ?? '',
            canGoBackInWeb: nav.canGoBackInWeb === true || nav.canGoBack === true,
            hasBlockingUI: !!nav.hasBlockingUI,
            needsConfirm: !!nav.needsConfirm,
          };
          sendToWeb('NAV_STATE_ACK', { nav: lastNavStateRef.current, at: Date.now() });
          break;
        }

        case 'BACK_PRESSED': {
          const nav = lastNavStateRef.current || {};
          if (nav.isRoot === true) {
            Alert.alert('앱 종료', '앱을 종료할까요?', [
              { text: '취소', style: 'cancel' },
              { text: '종료', style: 'destructive', onPress: () => BackHandler.exitApp() },
            ], { cancelable: true });
          } else {
            sendToWeb('BACK_REQUEST', { nav, at: Date.now() });
          }
          break;
        }

        case 'NAVER_LOGIN_DONE': {
          const payload = data.payload || {};
          const ok = !!payload.success;
          const err = payload.error || payload.error_code || null;
          console.groupCollapsed(`[NAVER_LOGIN_DONE] success=${ok}${err ? ` error=${err}` : ''}`);
          console.table({ success: ok, error: err || '', uid: payload.uid || '', mock: payload.mock ? 'yes' : 'no', at: new Date().toISOString() });
          logChunked('[NAVER_LOGIN_DONE] payload', payload);
          console.groupEnd();
          sendToWeb('NAVER_LOGIN_ACK', { success: ok, at: Date.now(), error: err || undefined });
          break;
        }

        case 'NAVER_DEBUG': { logChunked('[NAVER_DEBUG data]', data); logChunked('[NAVER_DEBUG payload]', data.payload); break; }

        default: console.log('⚠️ unknown msg:', data.type);
      }
    } catch (err) {
      console.error('❌ onMessage error:', err);
    }
  }, [handleCheckPermission, handleRequestPermission, handleStartSignin, handleStartSignout, handleWebError, handleWebReady, sendToWeb, token, installId]);

  // WebView load
  const onWebViewLoadStart = useCallback(() => {
    // ⭐ 앱 첫 로딩 때만 스플래시 사용
    if (firstLoadRef.current) {
      firstLoadRef.current = false;       // 다음부터는 안 씀
      showSplashOnce();

      if (bootTORef.current) clearTimeout(bootTORef.current);
      bootTORef.current = setTimeout(() => {
        sendToWeb('OFFLINE_FALLBACK', { reason: 'timeout', at: Date.now() });
      }, BOOT_TIMEOUT_MS);
    } else {
      // 두 번째 이후 로딩은 스플래시 안 띄우고,
      // 필요하면 타임아웃만 걸거나 아예 아무것도 안 해도 됨.
      if (bootTORef.current) clearTimeout(bootTORef.current);
      // 뒤 로딩에 대해서는 OFFLINE_FALLBACK도 안 쓰고 싶으면 아래도 빼도 됨.
      // bootTORef.current = setTimeout(...);  // 이 줄 제거 가능
    }
  }, [showSplashOnce, sendToWeb]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
          style={[styles.container, { backgroundColor: statusBarBg }]}
          edges={['top', 'bottom']}
        >
       <StatusBar
                 barStyle={statusBarStyle}
                 backgroundColor={statusBarBg}
                 animated={true}
               />
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://www.wizmarket.ai/ads/start' }}

          originWhitelist={['*']}              // 느슨하게 허용
            onShouldStartLoadWithRequest={shouldAllowWebRequest}
            onNavigationStateChange={(nav) => {  // same-window 백업 가로채기
              const url = nav?.url || '';
              if (!/^https?:\/\//i.test(url)) {
                openExternalUrl(url);
                try { webViewRef.current?.stopLoading(); } catch {}
              }
            }}
            setSupportMultipleWindows={true}
            javaScriptCanOpenWindowsAutomatically={true}
            onCreateWindow={(e) => {
              const url = e?.nativeEvent?.targetUrl || '';
              if (!/^https?:\/\//i.test(url)) { openExternalUrl(url); return false; }
              return false;
            }}

            // ★ 여기 추가: intent:// 던지기 전에 잡아서 RN로 postMessage
            injectedJavaScriptBeforeContentLoaded={`
              (function() {
                var ORIG_OPEN = window.open;
                var ORIG_ASSIGN = window.location.assign;
                var ORIG_SET = Object.getOwnPropertyDescriptor(Location.prototype, 'href')?.set;

                function sendToRN(u){
                  try { window.ReactNativeWebView.postMessage(JSON.stringify({ type:'INTENT_URL', url:String(u||'') })); } catch(e){}
                }
                function isIntent(u){ return /^intent:\\/\\//i.test(String(u||'')); }

                // a[href] 클릭 가로채기
                document.addEventListener('click', function(e){
                  var a = e.target.closest && e.target.closest('a[href]');
                  if (a) {
                    var href = a.getAttribute('href') || '';
                    if (isIntent(href)) { e.preventDefault(); e.stopPropagation(); sendToRN(href); }
                  }
                }, true);

                // window.open 가로채기
                window.open = function(u, n, f){
                  if (isIntent(u)) { sendToRN(u); return null; }
                  return ORIG_OPEN ? ORIG_OPEN.apply(window, arguments) : null;
                };

                // location.assign 가로채기
                window.location.assign = function(u){
                  if (isIntent(u)) { sendToRN(u); return; }
                  return ORIG_ASSIGN.apply(window.location, arguments);
                };

                // location.href = 'intent://...' 가로채기
                try {
                  if (ORIG_SET) {
                    Object.defineProperty(window.location, 'href', {
                      configurable: true,
                      get: function(){ return document.location.href; },
                      set: function(u){
                        if (isIntent(u)) { sendToRN(u); return; }
                        return ORIG_SET.call(window.location, u);
                      }
                    });
                  }
                } catch(e){}
              })();
              true;
            `}

            // RN에서 수신 → openExternalUrl 실행
            onMessage={(e) => {
              try {
                const m = JSON.parse(e.nativeEvent.data);
                if (m?.type === 'INTENT_URL' && m?.url) {
                  openExternalUrl(m.url);
                  return;
                }
              } catch {}
              onMessageFromWeb(e); // 기존 핸들러 유지
            }}

          // onMessage={onMessageFromWeb}
          onLoadStart={onWebViewLoadStart}
          // onLoadProgress={({ nativeEvent }) => { if (nativeEvent.progress >= 0.9) hideSplashRespectingMin(); }}
          // onLoadEnd={() => { hideSplashRespectingMin(); }}
          javaScriptEnabled
          domStorageEnabled
          focusable
          overScrollMode="never"
          containerStyle={{ backgroundColor: 'transparent', flex: 1 }}
          style={{ backgroundColor: 'transparent', flex: 1 }}
          textZoom={Platform.OS === 'android' ? webTextZoom : undefined}
          injectedJavaScript={`
            (function() {
              if (!window.Android) window.Android = {};
              // 갤러리 열기: RN에 메시지로 전달
              window.Android.openGallery = function() {
                try {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'OPEN_MEDIA_PICKER' }));
                } catch (e) {}
              };
              // (옵션) 카메라 열기 훅도 만들어 둘 수 있음
              window.Android.openCamera = function() {
                try {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'OPEN_MEDIA_PICKER', payload: { prefer: 'camera' } }));
                } catch (e) {}
              };
            })();
            true;
          `}
        />
        {splashVisible && (
          <SafeAreaInsetOverlay opacity={splashFade}>
            <SplashScreenRN
                  brandBg="#272930"
                  onFirstCycleEnd={() => {
                      setSplashAnimDone(true);   // ✅ 이것만
                    }}
                />
          </SafeAreaInsetOverlay>
        )}

        {/* 미디어 선택 바텀시트 */}
        <Modal
          visible={mediaSheetVisible}
          transparent
          animationType="fade"
          onRequestClose={() => { setMediaSheetVisible(false); emitWebCancel(); }}
        >
          {/* 바깥 반투명 영역: 탭하면 취소 */}
          <TouchableWithoutFeedback onPress={() => { setMediaSheetVisible(false); emitWebCancel(); }}>
            <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.35)' }} />
          </TouchableWithoutFeedback>

          {/* 시트 */}
          <View style={{
            position:'absolute', left:0, right:0, bottom:0,
            backgroundColor:'#fff', borderTopLeftRadius:16, borderTopRightRadius:16,
            paddingBottom: 16, paddingTop: 8
          }}>
            <View style={{ alignItems:'center', paddingVertical:8 }}>
              <View style={{ width:40, height:4, backgroundColor:'#ccc', borderRadius:2 }} />
            </View>
            <Pressable
              onPress={takePhoto}
              style={{ paddingVertical:14, alignItems:'center' }}
            >
              <Text style={{ fontSize:16, fontWeight:'600', color: '#111827' }}>카메라 촬영</Text>
            </Pressable>
            <View style={{ height:1, backgroundColor:'#eee' }} />
            <Pressable
              onPress={pickFromLibrary}
              style={{ paddingVertical:14, alignItems:'center' }}
            >
              <Text style={{ fontSize:16, fontWeight:'600', color: '#111827' }}>앨범 선택</Text>
            </Pressable>
            {/* 취소 버튼은 안 넣고, 바깥 탭으로만 닫히게 요구하셨으니 이대로 */}
          </View>
        </Modal>



      </SafeAreaView>
    </SafeAreaProvider>
  );
};

function SafeAreaInsetOverlay({ opacity, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { opacity, backgroundColor: 'white', paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default App;
