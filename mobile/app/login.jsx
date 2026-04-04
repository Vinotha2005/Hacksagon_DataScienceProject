import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { theme } from '../constants/theme';
import useAuth from '../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const { login } = useAuth();

  const shieldAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(shieldAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const isValid = email.includes('@') && email.includes('.') && password.length >= 6;

  const validateFields = () => {
    let valid = true;
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Enter a valid email address');
      valid = false;
    } else setEmailError('');
    if (password.length < 6) {
      setPassError('Password must be at least 6 characters');
      valid = false;
    } else setPassError('');
    return valid;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      Toast.show({ type: 'success', text1: 'Welcome back! 👋', text2: 'Logged in successfully' });
      setTimeout(() => router.replace('/(tabs)'), 500);
    } else {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: result.error });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Shield Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: shieldAnim }] }]}>
          <View style={styles.shieldContainer}>
            <LinearGradient colors={['#6366F1', '#8B5CF6', '#EC4899']} style={styles.shieldGradient}>
              <Ionicons name="shield-checkmark" size={40} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>FraudShield</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
          <Text style={styles.tagline}>Your payment safety guard 🛡️</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          {/* Email */}
          <View style={styles.inputWrapper}>
            <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
              <Ionicons name="mail" size={20} color={emailFocused ? theme.colors.primary : theme.colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={(v) => { setEmail(v); setEmailError(''); }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <View style={[styles.inputContainer, passFocused && styles.inputFocused]}>
              <Ionicons name="lock-closed" size={20} color={passFocused ? theme.colors.primary : theme.colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={(v) => { setPassword(v); setPassError(''); }}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye' : 'eye-off'} size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            {passError ? <Text style={styles.errorText}>{passError}</Text> : null}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginBtn, !isValid && styles.loginBtnDisabled]}
          >
            <LinearGradient
              colors={isValid && !loading ? ['#6366F1', '#8B5CF6', '#EC4899'] : ['#374151', '#374151']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginText}>{loading ? 'Logging in...' : 'LOGIN'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button (Demo) */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => Toast.show({ type: 'info', text1: 'Google Sign-In', text2: 'Coming soon in v2.0' })}
          >
            <Text style={styles.googleText}>🔵  Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 36 },
  shieldContainer: { marginBottom: 16 },
  shieldGradient: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.textPrimary, letterSpacing: 1 },
  subtitle: { fontSize: 16, color: theme.colors.primary, fontWeight: '600', marginTop: 4 },
  tagline: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
  inputWrapper: { marginBottom: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.lg, paddingHorizontal: 16, paddingVertical: 14,
  },
  inputFocused: { borderColor: theme.colors.primary },
  input: { flex: 1, color: theme.colors.textPrimary, fontSize: 15 },
  errorText: { color: theme.colors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 16, marginTop: -8 },
  forgotText: { color: theme.colors.primary, fontSize: 13, fontWeight: '500' },
  loginBtn: { borderRadius: theme.borderRadius.full, overflow: 'hidden', marginBottom: 20 },
  loginBtnDisabled: { opacity: 0.7 },
  loginGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  loginText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.cardBorder },
  dividerText: { color: theme.colors.textMuted, paddingHorizontal: 12, fontSize: 13 },
  googleBtn: {
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.full, paddingVertical: 14, alignItems: 'center', marginBottom: 24,
  },
  googleText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '500' },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupPrompt: { color: theme.colors.textSecondary, fontSize: 14 },
  signupLink: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
});
