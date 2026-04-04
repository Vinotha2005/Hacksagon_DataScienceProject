import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Keyboard, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { theme } from '../../constants/theme';
import useFraudCheck from '../../hooks/useFraudCheck';
import useAuth from '../../hooks/useAuth';
import ScanAnimation from '../../components/ScanAnimation';

const SCENARIOS = [
  { label: '✅ Safe', number: '9876543210', amount: '500', note: 'payment', color: theme.colors.safe },
  { label: '⛔ Scam', number: '9999988888', amount: '10000', note: 'urgent', color: theme.colors.danger },
  { label: '⚠️ Suspect', number: '8888877777', amount: '4999', note: 'prize', color: theme.colors.warning },
  { label: '🔴 Ring', number: '7777766666', amount: '49999', note: 'commission', color: '#EF4444' },
  { label: '🔴 OTP', number: '6666655555', amount: '1', note: 'verify', color: theme.colors.danger },
  { label: '🪪 KYC', number: '9123456789', amount: '200', note: 'kyc', color: '#8B5CF6' },
];

export default function HomeScreen() {
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [mobileFocused, setMobileFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [userName, setUserName] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { checkNumber } = useFraudCheck();
  const { checkSession } = useAuth();

  useEffect(() => {
    checkSession().then((u) => setUserName(u?.name || ''));
  }, []);

  useEffect(() => {
    if (mobile && amount) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [mobile, amount]);

  const handleCheck = async () => {
    if (!mobile || !amount) {
      Toast.show({ type: 'error', text1: 'Missing Info', text2: 'Enter mobile number and amount' });
      return;
    }
    Keyboard.dismiss();
    setScanning(true);
    const result = await checkNumber(mobile, amount, note);
    setTimeout(() => {
      setScanning(false);
      router.push({ pathname: '/result', params: { data: JSON.stringify(result), mobile, amount } });
    }, 2500);
  };

  const fillScenario = (s) => {
    setMobile(s.number);
    setAmount(s.amount);
    setNote(s.note);
  };

  if (scanning) return <ScanAnimation />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoRow}>
              <Ionicons name="shield-checkmark" size={28} color={theme.colors.primary} />
              <Text style={styles.logoText}>FraudShield</Text>
            </View>
            <Text style={styles.tagline}>Check before you pay 🛡️</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarBtn}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.avatarGrad}>
              <Text style={styles.avatarLetter}>{userName?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Mobile Input */}
        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, mobileFocused && styles.inputFocused]}>
            <Ionicons name="phone-portrait" size={20} color={mobileFocused ? theme.colors.primary : theme.colors.textMuted} />
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor={theme.colors.textMuted}
              value={mobile}
              onChangeText={setMobile}
              onFocus={() => setMobileFocused(true)}
              onBlur={() => setMobileFocused(false)}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, amountFocused && styles.inputFocused]}>
            <Ionicons name="cash" size={20} color={amountFocused ? theme.colors.primary : theme.colors.textMuted} />
            <Text style={styles.prefix}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={theme.colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, noteFocused && styles.inputFocused]}>
            <Ionicons name="document-text" size={20} color={noteFocused ? theme.colors.primary : theme.colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Note (optional)"
              placeholderTextColor={theme.colors.textMuted}
              value={note}
              onChangeText={setNote}
              onFocus={() => setNoteFocused(true)}
              onBlur={() => setNoteFocused(false)}
            />
          </View>
        </View>

        {/* Check Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity onPress={handleCheck} style={styles.checkBtn}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.checkGradient}
            >
              <Ionicons name="search" size={20} color="white" />
              <Text style={styles.checkText}>CHECK SAFETY</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Scenarios */}
        <View style={styles.scenarioSection}>
          <View style={styles.scenarioDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Try a scenario</Text>
            <View style={styles.dividerLine} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarioRow}>
            {SCENARIOS.map((s) => (
              <TouchableOpacity key={s.label} onPress={() => fillScenario(s)} style={[styles.scenarioPill, { borderColor: s.color + '60' }]}>
                <Text style={[styles.scenarioText, { color: s.color }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Powered by Claude AI + 500K+ fraud reports. Always verify before paying.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
  tagline: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  avatarBtn: { borderRadius: 20, overflow: 'hidden' },
  avatarGrad: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: 'white', fontWeight: '800', fontSize: 16 },
  inputWrapper: { marginBottom: 14 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.card, borderWidth: 1,
    borderColor: theme.colors.cardBorder, borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  inputFocused: { borderColor: theme.colors.primary },
  prefix: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600' },
  input: { flex: 1, color: theme.colors.textPrimary, fontSize: 16 },
  checkBtn: { borderRadius: theme.borderRadius.full, overflow: 'hidden', marginBottom: 24 },
  checkGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  checkText: { color: 'white', fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  scenarioSection: { marginBottom: 20 },
  scenarioDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.cardBorder },
  dividerText: { color: theme.colors.textMuted, paddingHorizontal: 10, fontSize: 12 },
  scenarioRow: { gap: 10, paddingHorizontal: 2 },
  scenarioPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card, borderWidth: 1,
  },
  scenarioText: { fontSize: 13, fontWeight: '600' },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: theme.colors.primaryGlow, borderRadius: theme.borderRadius.lg, padding: 14,
    borderWidth: 1, borderColor: theme.colors.primary + '40',
  },
  infoText: { flex: 1, color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 },
});
