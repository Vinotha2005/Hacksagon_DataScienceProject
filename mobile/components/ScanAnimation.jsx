import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const STEPS = [
  '✓ Checking database',
  '✓ Analyzing patterns',
  '⟳ Consulting AI...',
];

export default function ScanAnimation() {
  return (
    <View style={styles.container}>
      {/* Pulsing rings */}
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{
            type: 'timing',
            duration: 1800,
            delay: i * 600,
            loop: true,
          }}
          style={styles.ring}
        />
      ))}

      {/* Shield Icon */}
      <MotiView
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{ type: 'timing', duration: 4000, loop: true }}
        style={styles.shieldWrap}
      >
        <View style={styles.shieldInner}>
          <Ionicons name="shield-checkmark" size={44} color={theme.colors.primary} />
        </View>
      </MotiView>

      <Text style={styles.title}>Analyzing payment...</Text>
      <Text style={styles.subtitle}>AI fraud detection in progress</Text>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ type: 'timing', duration: 2400 }}
          style={styles.progressFill}
        />
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <MotiView
            key={step}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: i * 700 + 300 }}
          >
            <Text style={styles.stepText}>{step}</Text>
          </MotiView>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: theme.colors.background,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  ring: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: theme.colors.primary,
  },
  shieldWrap: { marginBottom: 32 },
  shieldInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: theme.colors.primary + '60',
  },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 28 },
  progressTrack: {
    width: '100%', height: 8, backgroundColor: theme.colors.card,
    borderRadius: 4, overflow: 'hidden', marginBottom: 28,
  },
  progressFill: {
    height: '100%', borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  steps: { gap: 10, alignSelf: 'flex-start' },
  stepText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
});
