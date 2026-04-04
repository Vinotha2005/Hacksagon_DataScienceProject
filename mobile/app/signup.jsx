import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { theme } from '../constants/theme';
import useAuth from '../hooks/useAuth';

const getPasswordStrength = (pass) => {
  if (pass.length < 6) return { level: 'Weak', color: theme.colors.danger, pct: 0.25 };
  if (pass.length < 8) return { level: 'Fair', color: theme.colors.warning, pct: 0.5 };
  if (pass.length >= 8 && /[0-9]/.test(pass)) return { level: 'Medium', color: '#EAB308', pct: 0.75 };
  if (pass.length >= 8 && /[0-9]/.test(pass) && /[A-Z]/.test(pass)) return { level: 'Strong', color: theme.colors.safe, pct: 1 };
  return { level: 'Fair', color: theme.colors.warning, pct: 0.5 };
};

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');
  const { signup } = useAuth();

  const strength = getPasswordStrength(password);

  const validate = () => {
    const errs = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.includes('@') || !email.includes('.')) errs.email = 'Enter a valid email';
    if (!/^\d{10}$/.test(mobile)) errs.mobile = 'Enter exactly 10 digits';
    if (password.length < 8 || !/[0-9]/.test(password) || !/[A-Z]/.test(password)) {
      errs.password = 'Min 8 chars, 1 number, 1 uppercase';
    }
    if (password !== confirmPass) errs.confirmPass = 'Passwords do not match';
    if (!agreed) errs.agreed = 'You must accept the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await signup(name.trim(), email, mobile, password);
    setLoading(false);
    if (result.success) {
      Toast.show({ type: 'success', text1: 'Account created! 🎉', text2: 'Welcome to FraudShield' });
      setTimeout(() => router.replace('/(tabs)'), 500);
    } else {
      Toast.show({ type: 'error', text1: 'Signup Failed', text2: 'Please try again' });
    }
  };

  const Field = ({ icon, placeholder, value, onChangeText, error, fieldKey, secureTextEntry, onToggle, toggleValue, keyboardType, maxLength }) => (
    <View style={styles.inputWrapper}>
      <View style={[styles.inputContainer, focused === fieldKey && styles.inputFocused]}>
        <Ionicons name={icon} size={20} color={focused === fieldKey ? theme.colors.primary : theme.colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(fieldKey)}
          onBlur={() => setFocused('')}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : fieldKey === 'name' ? 'words' : 'none'}
          maxLength={maxLength}
        />
        {onToggle && (
          <TouchableOpacity onPress={onToggle}>
            <Ionicons name={toggleValue ? 'eye' : 'eye-off'} size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join 1.2M Indians staying scam-free 🇮🇳</Text>

        <Field icon="person" placeholder="Full Name" value={name} onChangeText={setName} error={errors.name} fieldKey="name" />
        <Field icon="mail" placeholder="Email Address" value={email} onChangeText={setEmail} error={errors.email} fieldKey="email" keyboardType="email-address" />
        <Field icon="phone-portrait" placeholder="Mobile (+91)" value={mobile} onChangeText={setMobile} error={errors.mobile} fieldKey="mobile" keyboardType="phone-pad" maxLength={10} />
        <Field icon="lock-closed" placeholder="Password" value={password} onChangeText={setPassword} error={errors.password} fieldKey="password" secureTextEntry={!showPass} onToggle={() => setShowPass(!showPass)} toggleValue={showPass} />

        {/* Password Strength */}
        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthTrack}>
              <View style={[styles.strengthBar, { width: `${strength.pct * 100}%`, backgroundColor: strength.color }]} />
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.level}</Text>
          </View>
        )}

        <Field icon="lock-closed" placeholder="Confirm Password" value={confirmPass} onChangeText={setConfirmPass} error={errors.confirmPass} fieldKey="confirmPass" secureTextEntry={!showConfirm} onToggle={() => setShowConfirm(!showConfirm)} toggleValue={showConfirm} />

        {/* Terms */}
        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text style={styles.termsText}>I agree to <Text style={styles.termsLink}>Terms & Privacy Policy</Text></Text>
        </TouchableOpacity>
        {errors.agreed ? <Text style={styles.errorText}>{errors.agreed}</Text> : null}

        {/* Create Button */}
        <TouchableOpacity onPress={handleSignup} disabled={loading} style={styles.createBtn}>
          <LinearGradient colors={['#6366F1', '#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createGradient}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.createText}>CREATE ACCOUNT</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 28 },
  inputWrapper: { marginBottom: 14 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.lg, paddingHorizontal: 16, paddingVertical: 14,
  },
  inputFocused: { borderColor: theme.colors.primary },
  input: { flex: 1, color: theme.colors.textPrimary, fontSize: 15 },
  errorText: { color: theme.colors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: -6 },
  strengthTrack: { flex: 1, height: 6, backgroundColor: theme.colors.cardBorder, borderRadius: 3, overflow: 'hidden' },
  strengthBar: { height: '100%', borderRadius: 3 },
  strengthLabel: { fontSize: 12, fontWeight: '700', width: 50 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: theme.colors.primary },
  termsText: { flex: 1, color: theme.colors.textSecondary, fontSize: 13 },
  termsLink: { color: theme.colors.primary, fontWeight: '600' },
  createBtn: { borderRadius: theme.borderRadius.full, overflow: 'hidden', marginTop: 16, marginBottom: 20 },
  createGradient: { paddingVertical: 18, alignItems: 'center' },
  createText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginPrompt: { color: theme.colors.textSecondary, fontSize: 14 },
  loginLink: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
});
