// SplashScreenRN.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

// 이미지랑 같은 경로의 json 사용 (SplashScreenRN.js 기준 경로)
const splashAnimation = require('./assets/images/splash_1118.json');

export default function SplashScreenRN({
  brandBg = '#6A0DAD',
  onFirstCycleEnd,   // ✅ 새 콜백
  onDone,           // ✅ 이전 onDone도 남겨두고, 없으면 무시
}) {
  const handleFinish = () => {
    // 1순위: 새 프로토콜
    if (typeof onFirstCycleEnd === 'function') {
      onFirstCycleEnd();
    }
    // 2순위: 혹시 옛 코드에서 onDone만 쓰고 있다면
    else if (typeof onDone === 'function') {
      onDone();
    }
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: brandBg },
      ]}
      accessible
      accessibilityRole="alert"
    >
      <LottieView
        source={splashAnimation}
        autoPlay
        loop={false}          // ✅ 한 사이클만 재생
        style={styles.lottie}
        onAnimationFinish={handleFinish}   // ✅ 한 번 끝나면 RN(App.js)에 알려줌
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
