import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Linking, Alert, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { theme } from '../constants/theme';
import RiskMeter from '../components/RiskMeter';

const PAYMENT_APPS = [
  { name: 'GPay', icon: '💳', color: '#4285F4', getUrl: (m, a) => `tez://upi/pay?pa=${m}@upi&pn=Recipient&am=${a}&cu=INR` },
  { name: 'PhonePe', icon: '📱', color: '#5F259F', getUrl: (m, a) => `phonepe://pay?transactionId=FraudShield&amount=${a}` },
  { name: 'Paytm', icon: '💰', color: '#00B9F1', getUrl: (m, a) => `paytmmp://pay?pa=${m}@paytm&am=${a}` },
  { name: 'BHIM', icon: '🏦', color: '#00876C', getUrl: (m, a) => `upi://pay?pa=${m}@upi&am=${a}&cu=INR` },
];

// ── Confetti particle (LOW risk) ──────────────────────────────────────────
function ConfettiParticle({ delay, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  const xAnim = useRef(new Animated.Value(0)).current;
  const rotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1, duration: 1800 + Math.random() * 600,
        delay, easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(xAnim, {
        toValue: (Math.random() - 0.5) * 200, duration: 1600 + Math.random() * 400,
        delay, useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotAnim, {
          toValue: 1, duration: 600 + Math.random() * 400,
          delay, easing: Easing.linear, useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-10, 420] });
  const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
  const rotate = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const size = 6 + Math.random() * 8;

  return (
    <Animated.View style={{
      position: 'absolute', top: 0, left: '50%',
      transform: [{ translateX: xAnim }, { translateY }, { rotate }],
      opacity,
    }}>
      <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
    </Animated.View>
  );
}

function ConfettiOverlay() {
  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#84CC16', '#F97316'];
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    delay: i * 50,
    color: COLORS[i % COLORS.length],
  }));
  return (
    <View pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420, overflow: 'hidden', zIndex: 99 }}>
      {particles.map(p => <ConfettiParticle key={p.id} delay={p.delay} color={p.color} />)}
    </View>
  );
}

// ── Pulsing red border (HIGH risk) ───────────────────────────────────────
export default function ResultScreen() {
  const params = useLocalSearchParams();
  const result = params.data ? JSON.parse(params.data) : {};
  const mobile = params.mobile || '';
  const amount = params.amount || '';

  const borderAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  const risk = result.risk_score || 0;
  const isHigh = risk >= 71;
  const isMedium = risk >= 31 && risk < 71;
  const isLow = risk < 31;

  const riskColor = isHigh ? theme.colors.danger : isMedium ? theme.colors.warning : theme.colors.safe;
  const riskLabel = isHigh ? 'HIGH RISK' : isMedium ? 'MEDIUM RISK' : 'LOW RISK';
  const headline = isHigh ? '🚨 DANGER! DO NOT PAY' : isMedium ? '⚠️ CAUTION' : '✅ SAFE TO PAY';

  useEffect(() => {
    // Entry scale
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }).start();

    if (isHigh) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Speech.speak('FraudShield Alert! High risk transaction detected. Do not proceed.', {
        language: 'en-IN', rate: 0.9,
      });
      // Pulsing red border
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.timing(borderAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
        ])
      ).start();
      // Pulsing glow halo
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 700, useNativeDriver: false }),
        ])
      ).start();
    }

    if (isLow) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2600);
    }
  }, []);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background, theme.colors.danger],
  });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] });

  const openApp = async (app) => {
    const url = app.getUrl(mobile, amount);
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('App not installed', `${app.name} is not installed on your device.`);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Number Reported',
      `+91-${mobile} has been reported to FraudShield database.\nReport ID: FS${Math.floor(Math.random() * 900000) + 100000}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Animated.View style={[
      styles.outerContainer,
      isHigh && { borderWidth: 4, borderColor },
      { transform: [{ scale: scaleAnim }] }
    ]}>
      {/* Confetti overlay for LOW risk */}
      {showConfetti && <ConfettiOverlay />}

      {/* Pulsing red glow halo for HIGH risk */}
      {isHigh && (
        <Animated.View pointerEvents="none"
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 200,
            backgroundColor: theme.colors.danger,
            opacity: glowOpacity,
            zIndex: 1,
          }}
        />
      )}

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Headline */}
          <LinearGradient
            colors={isHigh ? ['#EF444430', '#0A0F1E'] : isMedium ? ['#F59E0B20', '#0A0F1E'] : ['#10B98125', '#0A0F1E']}
            style={styles.headlineGrad}
          >
            <Text style={[styles.headline, { color: riskColor }]}>{headline}</Text>
            <View style={styles.divider} />
            <RiskMeter score={risk} color={riskColor} label={riskLabel} />

            {result.reports_count > 0 && (
              <View style={styles.statsRow}>
                <StatBadge icon="warning" label={`${result.reports_count} fraud reports`} color={theme.colors.danger} />
                {result.last_seen_cities?.length > 0 && (
                  <StatBadge icon="location" label={result.last_seen_cities.slice(0, 2).join(', ')} color={theme.colors.warning} />
                )}
                {result.scam_type && (
                  <StatBadge icon="alert-circle" label={result.scam_type} color={theme.colors.danger} />
                )}
              </View>
            )}

            {/* ML Score badge */}
            {result.ml_score !== undefined && (
              <View style={styles.mlBadge}>
                <Ionicons name="analytics" size={13} color="#8B5CF6" />
                <Text style={styles.mlText}>ML Model Score: {result.ml_score}% · Source: {result.source || 'analysis'}</Text>
              </View>
            )}
          </LinearGradient>

          {/* AI Explanation */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
              <Text style={styles.aiTitle}>Claude AI Analysis</Text>
            </View>
            <Text style={styles.aiText}>{result.explanation || 'Analysis complete.'}</Text>
            {result.recommendation && (
              <View style={[styles.recommendBadge, { borderColor: riskColor + '50', backgroundColor: riskColor + '15' }]}>
                <Ionicons name="checkmark-circle" size={16} color={riskColor} />
                <Text style={[styles.recommendText, { color: riskColor }]}>{result.recommendation}</Text>
              </View>
            )}
            {result.red_flags?.length > 0 && (
              <View style={styles.redFlagsList}>
                {result.red_flags.map((flag, i) => (
                  <View key={i} style={styles.redFlagItem}>
                    <Text style={styles.redFlagDot}>🚩</Text>
                    <Text style={styles.redFlagText}>{flag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* SAFE: Payment Apps + success message */}
          {isLow && (
            <View style={styles.section}>
              <View style={styles.successBanner}>
                <Text style={styles.successText}>🎉 This transaction looks safe!</Text>
              </View>
              <Text style={styles.sectionTitle}>Pay safely with:</Text>
              <View style={styles.appsGrid}>
                {PAYMENT_APPS.map((app) => (
                  <TouchableOpacity key={app.name} onPress={() => openApp(app)} style={[styles.appBtn, { borderColor: app.color + '60' }]}>
                    <Text style={styles.appIcon}>{app.icon}</Text>
                    <Text style={[styles.appName, { color: app.color }]}>{app.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* MEDIUM: Conditional Pay Buttons */}
          {isMedium && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proceed with caution:</Text>
              {PAYMENT_APPS.slice(0, 2).map((app) => (
                <TouchableOpacity key={app.name} onPress={() => openApp(app)} style={styles.cautionPayBtn}>
                  <View style={styles.cautionPayLeft}>
                    <Text style={styles.appIcon}>{app.icon}</Text>
                    <Text style={styles.cautionPayText}>Proceed via {app.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* HIGH: Block & Report */}
          {isHigh && (
            <TouchableOpacity onPress={handleReport} style={styles.reportBtn}>
              <LinearGradient colors={['#EF4444', '#DC2626']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.reportGradient}>
                <Ionicons name="ban" size={20} color="white" />
                <Text style={styles.reportText}>BLOCK &amp; REPORT</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.backText}>{isHigh ? 'Go Back — Stay Safe' : 'Check Another'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const StatBadge = ({ icon, label, color }) => (
  <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
    <Ionicons name={icon} size={13} color={color} />
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingBottom: 40 },
  headlineGrad: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 24, position: 'relative' },
  headline: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  divider: { height: 1, backgroundColor: theme.colors.cardBorder, marginBottom: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  mlBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)' },
  mlText: { fontSize: 11, color: '#8B5CF6', fontWeight: '600', flex: 1 },
  aiCard: { margin: 16, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  aiText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },
  recommendBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1 },
  recommendText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  redFlagsList: { marginTop: 12, gap: 6 },
  redFlagItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  redFlagDot: { fontSize: 12 },
  redFlagText: { fontSize: 13, color: '#EF4444', flex: 1, lineHeight: 20 },
  section: { marginHorizontal: 16, marginBottom: 16 },
  successBanner: { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 12, padding: 12, marginBottom: 14, alignItems: 'center' },
  successText: { color: '#10B981', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 12 },
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  appBtn: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.card, borderWidth: 1, borderRadius: theme.borderRadius.lg, padding: 14 },
  appIcon: { fontSize: 22 },
  appName: { fontSize: 14, fontWeight: '700' },
  cautionPayBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.borderRadius.lg, padding: 14, marginBottom: 10 },
  cautionPayLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cautionPayText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  reportBtn: { marginHorizontal: 16, borderRadius: theme.borderRadius.full, overflow: 'hidden', marginBottom: 14 },
  reportGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  reportText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  backText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
