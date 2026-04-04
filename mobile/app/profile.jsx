import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import useAuth from '../hooks/useAuth';

export default function ProfileScreen() {
  const { checkSession, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    checkSession().then(setUser);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Toast.show({ type: 'success', text1: 'Logged out successfully', text2: 'See you soon! 👋' });
          setTimeout(() => router.replace('/login'), 300);
        },
      },
    ]);
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const memberDate = user?.memberSince || new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <LinearGradient colors={['#6366F1', '#8B5CF6', '#EC4899']} style={styles.avatar}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <TouchableOpacity style={styles.editPhotoBtn}
            onPress={() => Toast.show({ type: 'info', text1: 'Photo Upload', text2: 'Coming soon in v2.0' })}
          >
            <Ionicons name="camera" size={14} color={theme.colors.primary} />
            <Text style={styles.editPhotoText}>Edit Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Account Details */}
        <SectionHeader title="Account Details" />
        <View style={styles.card}>
          <DetailRow icon="person" label="Name" value={user?.name || '—'} />
          <Divider />
          <DetailRow icon="mail" label="Email" value={user?.email || '—'} />
          <Divider />
          <DetailRow icon="phone-portrait" label="Mobile" value={user?.mobile ? `+91-${user.mobile}` : '+91-XXXXXXXXXX'} />
          <Divider />
          <DetailRow icon="calendar" label="Member Since" value={memberDate} />
        </View>

        {/* Security */}
        <SectionHeader title="Security" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.securityRow}
            onPress={() => Toast.show({ type: 'info', text1: 'Change Password', text2: 'Coming soon in v2.0' })}
          >
            <View style={styles.securityLeft}>
              <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
              <Text style={styles.securityLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <Divider />
          <View style={styles.securityRow}>
            <View style={styles.securityLeft}>
              <Ionicons name="finger-print" size={20} color={theme.colors.primary} />
              <Text style={styles.securityLabel}>Biometric Login</Text>
            </View>
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              trackColor={{ false: theme.colors.cardBorder, true: theme.colors.primary }}
              thumbColor="white"
            />
          </View>
          <Divider />
          <View style={styles.securityRow}>
            <View style={styles.securityLeft}>
              <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
              <Text style={styles.securityLabel}>Two Factor Auth</Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: theme.colors.cardBorder, true: theme.colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Stats */}
        <SectionHeader title="Your Stats" />
        <View style={styles.statsGrid}>
          <StatCard icon="search" value={user?.checksCount || 23} label="Checks Done" color={theme.colors.primary} />
          <StatCard icon="shield" value={user?.scamsBlocked || 4} label="Scams Blocked" color={theme.colors.danger} />
          <StatCard icon="cash" value="₹12K" label="Saved" color={theme.colors.safe} />
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LinearGradient colors={['#EF4444', '#DC2626']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.logoutGradient}>
            <Ionicons name="log-out" size={20} color="white" />
            <Text style={styles.logoutText}>LOGOUT</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.version}>FraudShield v1.0.0 • Made in India 🇮🇳</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={18} color={theme.colors.primary} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const StatCard = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderColor: color + '44' }]}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
  avatarCard: { alignItems: 'center', paddingVertical: 24, marginHorizontal: 16, marginBottom: 8, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.cardBorder },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 32, fontWeight: '800', color: 'white' },
  userName: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 },
  editPhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.primaryGlow, borderRadius: theme.borderRadius.full },
  editPhotoText: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, marginLeft: 20, marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  card: { marginHorizontal: 16, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.cardBorder, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  detailLabel: { flex: 1, color: theme.colors.textSecondary, fontSize: 14 },
  detailValue: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600', maxWidth: '55%' },
  divider: { height: 1, backgroundColor: theme.colors.cardBorder, marginLeft: 16 },
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  securityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  securityLabel: { color: theme.colors.textPrimary, fontSize: 14 },
  statsGrid: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 8 },
  statCard: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, borderWidth: 1, gap: 6 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: theme.colors.textSecondary, fontSize: 11, textAlign: 'center' },
  logoutBtn: { marginHorizontal: 16, marginTop: 20, borderRadius: theme.borderRadius.full, overflow: 'hidden' },
  logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  version: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, marginTop: 16, marginBottom: 32 },
});
