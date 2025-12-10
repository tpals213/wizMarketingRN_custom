// SplashScreenRN.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native'; // ✅ 추가

// 이미지랑 같은 경로의 json 사용 (SplashScreenRN.js 기준 경로)
const splashAnimation = require('./assets/images/splash_1118.json'); // ✅ 추가

export default function SplashScreenRN({
  onDone,
  minDuration = 2000,
  brandBg = '#6A0DAD',
}) {
  const [visible, setVisible] = useState(true);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const start = Date.now();

    // fade-in
    Animated.timing(fade, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 최소 표시시간 보장 후 onDone
    const finish = () => {
      const elapsed = Date.now() - start;
      const remain = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        // fade-out
        Animated.timing(fade, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          onDone?.();
        });
      }, remain);
    };

    finish();
  }, [minDuration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        { backgroundColor: brandBg, opacity: fade },
      ]}
      accessible
      accessibilityRole="alert"
    >
      {/* 🔹 가운데 Lottie 애니메이션만 표시 */}
      <LottieView
        source={splashAnimation}
        autoPlay
        loop
        style={styles.lottie}
      />
    </Animated.View>
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
