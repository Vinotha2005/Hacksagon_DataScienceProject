import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 180;
const RADIUS = 75;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RiskMeter({ score = 0, color = theme.colors.primary, label = '' }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const textValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    Animated.timing(textValue, { toValue: score, duration: 1200, useNativeDriver: false }).start();
  }, [score]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, CIRCUMFERENCE * (1 - score / 100)],
  });

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          stroke={color + '25'} strokeWidth={14} fill="transparent"
        />
        {/* Animated arc */}
        <AnimatedCircle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          stroke={color} strokeWidth={14} fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={SIZE / 2}
          originY={SIZE / 2}
        />
      </Svg>

      {/* Center Text */}
      <View style={styles.center}>
        <Text style={[styles.score, { color }]}>{score}</Text>
        <Text style={styles.outOf}>/100</Text>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>

      {/* Glow */}
      <View style={[styles.glow, { backgroundColor: color + '15', shadowColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', position: 'relative', width: SIZE, height: SIZE, alignSelf: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  score: { fontSize: 40, fontWeight: '900' },
  outOf: { fontSize: 14, color: theme.colors.textMuted, marginTop: -4 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  glow: { position: 'absolute', width: SIZE * 0.7, height: SIZE * 0.7, borderRadius: SIZE, zIndex: -1, elevation: 0 },
});
