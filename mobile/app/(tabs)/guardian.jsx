import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../constants/theme';

const DEFAULT_MEMBERS = [
  { id: '1', name: 'Priya', relation: 'Mother', mobile: '9876543210', lastCheck: '2 hrs ago', avatar: '👩' },
  { id: '2', name: 'Rajesh', relation: 'Father', mobile: '9812345678', lastCheck: '1 day ago', avatar: '👴' },
];

export default function GuardianScreen() {
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [alertModal, setAlertModal] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const showAlert = (member) => {
    setAlertModal({
      ...member,
      amount: '50,000',
      riskScore: 87,
      scamType: 'Electricity Bill Scam',
    });
  };

  const handleBlock = () => {
    Alert.alert('🚫 Blocked!', `Payment blocked for ${alertModal?.name}. They have been notified.`);
    setAlertModal(null);
  };

  const handleApprove = () => {
    Alert.alert('✅ Approved!', `Payment approved for ${alertModal?.name}. Proceed with caution.`);
    setAlertModal(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>👨‍👩‍👧 Family Guardian</Text>
            <Text style={styles.subtitle}>Protect your loved ones from scams</Text>
          </View>
          <TouchableOpacity onPress={() => setAddModal(true)} style={styles.addBtn}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.addGrad}>
              <Ionicons name="add" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Protection Status */}
        <View style={styles.statusCard}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.safe} />
          <Text style={styles.statusText}>
            <Text style={styles.statusBold}>{members.length} members</Text> are protected by FraudShield Guardian
          </Text>
        </View>

        {/* Member Cards */}
        {members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <Text style={styles.memberAvatar}>{member.avatar}</Text>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRelation}>{member.relation}</Text>
                <Text style={styles.memberMobile}>+91-{member.mobile.slice(0, 5)}-XXXXX</Text>
              </View>
              <View style={styles.memberStatus}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.safe} />
                <Text style={styles.memberStatusText}>Protected</Text>
              </View>
            </View>

            <Text style={styles.lastCheck}>Last checked: {member.lastCheck}</Text>

            <View style={styles.memberActions}>
              <TouchableOpacity
                onPress={() => showAlert(member)}
                style={styles.alertBtn}
              >
                <LinearGradient colors={['#EF4444', '#DC2626']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.alertGrad}>
                  <Ionicons name="warning" size={15} color="white" />
                  <Text style={styles.alertBtnText}>Simulate Alert</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>View History</Text>
                <Ionicons name="chevron-forward" size={15} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Member Prompt */}
        <TouchableOpacity onPress={() => setAddModal(true)} style={styles.addMemberCard}>
          <Ionicons name="person-add" size={24} color={theme.colors.primary} />
          <Text style={styles.addMemberText}>Add Family Member</Text>
        </TouchableOpacity>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🛡️ Guardian Tips</Text>
          {[
            'Enable alerts for elderly family members',
            'Educate seniors about OTP & KYC scams',
            'Never share OTPs or passwords with anyone',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Guardian Alert Modal */}
      <Modal visible={!!alertModal} transparent animationType="slide" onRequestClose={() => setAlertModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalCard}>
            <LinearGradient colors={['#EF444420', '#0A0F1E']} style={styles.alertModalGrad}>
              <Text style={styles.alertModalTitle}>🚨 GUARDIAN ALERT</Text>
              <View style={styles.alertDivider} />

              <Text style={styles.alertModalMember}>
                <Text style={styles.alertBold}>{alertModal?.name}</Text>
                {' '}(your {alertModal?.relation}) is attempting to send
              </Text>
              <Text style={styles.alertAmount}>₹{alertModal?.amount}</Text>
              <Text style={styles.alertModalMember}>to an unknown number</Text>

              <View style={styles.alertRiskBadge}>
                <Text style={styles.alertRiskText}>
                  Risk Score: {alertModal?.riskScore}/100 — HIGH RISK
                </Text>
                <Text style={styles.alertScamType}>
                  "{alertModal?.scamType} pattern detected"
                </Text>
              </View>

              <View style={styles.alertActions}>
                <TouchableOpacity onPress={handleApprove} style={styles.approveBtn}>
                  <Text style={styles.approveBtnText}>✅ APPROVE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBlock} style={styles.blockBtn}>
                  <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.blockGrad}>
                    <Text style={styles.blockBtnText}>🚫 BLOCK</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal visible={addModal} transparent animationType="fade" onRequestClose={() => setAddModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddModal(false)}>
          <View style={styles.addModalCard}>
            <Text style={styles.addModalTitle}>Add Family Member</Text>
            <Text style={styles.addModalSubtitle}>This feature uses phone contacts to protect your family.</Text>
            <TouchableOpacity
              style={styles.addModalBtn}
              onPress={() => {
                setAddModal(false);
                Alert.alert('Feature Coming Soon', 'Contact integration will be available in v2.0');
              }}
            >
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.addModalGrad}>
                <Text style={styles.addModalBtnText}>Open Contacts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  subtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  addBtn: { borderRadius: 20, overflow: 'hidden' },
  addGrad: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.safeGlow, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.safe + '40' },
  statusText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  statusBold: { color: theme.colors.safe, fontWeight: '700' },
  memberCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16, marginBottom: 14 },
  memberHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  memberAvatar: { fontSize: 36 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 17, fontWeight: '700', color: theme.colors.textPrimary },
  memberRelation: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  memberMobile: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  memberStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.safeGlow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  memberStatusText: { fontSize: 11, color: theme.colors.safe, fontWeight: '600' },
  lastCheck: { fontSize: 11, color: theme.colors.textMuted, marginBottom: 12 },
  memberActions: { flexDirection: 'row', gap: 10 },
  alertBtn: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  alertGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  alertBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
  viewBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: theme.colors.primaryGlow, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.primary + '40', paddingVertical: 10 },
  viewBtnText: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
  addMemberCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: theme.colors.primary + '40', borderStyle: 'dashed', borderRadius: 16, padding: 20, marginBottom: 16 },
  addMemberText: { color: theme.colors.primary, fontSize: 15, fontWeight: '600' },
  tipsCard: { backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16 },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary, marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  alertModalCard: { borderRadius: 24, overflow: 'hidden', marginHorizontal: 0 },
  alertModalGrad: { padding: 28, paddingBottom: 40 },
  alertModalTitle: { fontSize: 22, fontWeight: '900', color: theme.colors.danger, textAlign: 'center', marginBottom: 12 },
  alertDivider: { height: 1, backgroundColor: theme.colors.cardBorder, marginBottom: 20 },
  alertModalMember: { textAlign: 'center', fontSize: 15, color: theme.colors.textSecondary, lineHeight: 22 },
  alertBold: { color: theme.colors.textPrimary, fontWeight: '700' },
  alertAmount: { fontSize: 40, fontWeight: '900', color: theme.colors.danger, textAlign: 'center', marginVertical: 8 },
  alertRiskBadge: { backgroundColor: theme.colors.dangerGlow, borderRadius: 12, padding: 12, marginVertical: 16, borderWidth: 1, borderColor: theme.colors.danger + '40' },
  alertRiskText: { fontSize: 14, fontWeight: '700', color: theme.colors.danger, textAlign: 'center' },
  alertScamType: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
  alertActions: { flexDirection: 'row', gap: 12 },
  approveBtn: { flex: 1, backgroundColor: theme.colors.safeGlow, borderRadius: theme.borderRadius.full, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.safe + '40' },
  approveBtnText: { color: theme.colors.safe, fontSize: 15, fontWeight: '700' },
  blockBtn: { flex: 1, borderRadius: theme.borderRadius.full, overflow: 'hidden' },
  blockGrad: { paddingVertical: 14, alignItems: 'center' },
  blockBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  addModalCard: { margin: 20, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 24 },
  addModalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  addModalSubtitle: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  addModalBtn: { borderRadius: theme.borderRadius.full, overflow: 'hidden' },
  addModalGrad: { paddingVertical: 14, alignItems: 'center' },
  addModalBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
});
