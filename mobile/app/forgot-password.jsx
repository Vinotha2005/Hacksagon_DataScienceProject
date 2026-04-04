import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.envelopeIcon}>
            <Text style={styles.envelopeEmoji}>📧</Text>
          </View>
          <Text style={styles.successTitle}>Check your email!</Text>
          <Text style={styles.successSubtitle}>Reset link sent to</Text>
          <Text style={styles.emailDisplay}>{email}</Text>
          <Text style={styles.successNote}>
            Didn't receive it? Check your spam folder or try again.
          </Text>
          <TouchableOpacity style={styles.backToLogin} onPress={() => router.back()}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.backGradient}>
              <Ionicons name="arrow-back" size={18} color="white" />
              <Text style={styles.backText}>Back to Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.lockIcon}>
          <Ionicons name="lock-open" size={48} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a reset link
        </Text>

        <View style={[styles.inputContainer, focused && styles.inputFocused]}>
          <Ionicons name="mail" size={20} color={focused ? theme.colors.primary : theme.colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity onPress={handleSend} disabled={loading} style={styles.sendBtn}>
          <LinearGradient colors={['#6366F1', '#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendGradient}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.sendText}>SEND RESET LINK</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backLinkBtn}>
          <Text style={styles.backLinkText}>← Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 32 },
  lockIcon: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.lg, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8,
  },
  inputFocused: { borderColor: theme.colors.primary },
  input: { flex: 1, color: theme.colors.textPrimary, fontSize: 15 },
  errorText: { color: theme.colors.danger, fontSize: 12, marginBottom: 8, marginLeft: 4 },
  sendBtn: { borderRadius: theme.borderRadius.full, overflow: 'hidden', marginTop: 16, marginBottom: 16 },
  sendGradient: { paddingVertical: 18, alignItems: 'center' },
  sendText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  backLinkBtn: { alignItems: 'center', paddingVertical: 10 },
  backLinkText: { color: theme.colors.primary, fontSize: 14, fontWeight: '500' },
  // Success state
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  envelopeIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  envelopeEmoji: { fontSize: 48 },
  successTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4 },
  emailDisplay: { fontSize: 16, fontWeight: '600', color: theme.colors.primary, marginBottom: 16 },
  successNote: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  backToLogin: { width: '100%', borderRadius: theme.borderRadius.full, overflow: 'hidden' },
  backGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  backText: { color: 'white', fontSize: 15, fontWeight: '700' },
});
