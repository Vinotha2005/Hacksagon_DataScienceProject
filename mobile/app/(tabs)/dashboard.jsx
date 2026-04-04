import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VictoryBar, VictoryChart, VictoryAxis } from 'victory-native';
import { theme } from '../../constants/theme';
import useFraudCheck from '../../hooks/useFraudCheck';

const STAT_CARDS = [
  { icon: 'shield', valueKey: 'scams_blocked_today', label: 'Blocked Today', color: theme.colors.danger },
  { icon: 'people', valueKey: 'users_protected', label: 'Protected', color: theme.colors.primary },
  { icon: 'cash', valueKey: 'amount_saved_cr', label: 'Saved', color: theme.colors.safe },
  { icon: 'bulb', valueKey: 'active_patterns', label: 'Active Patterns', color: theme.colors.warning },
];

function AnimCounter({ target, color, isString }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(isString ? target : '0');

  useEffect(() => {
    if (isString) {
      setDisplay(target);
      return;
    }
    const numTarget = typeof target === 'number' ? target : parseInt(String(target).replace(/[^0-9]/g, '')) || 0;
    Animated.timing(anim, { toValue: numTarget, duration: 1600, useNativeDriver: false }).start();
    const id = anim.addListener(({ value }) => setDisplay(Math.floor(value).toLocaleString('en-IN')));
    return () => anim.removeListener(id);
  }, [target]);

  return <Text style={[styles.statValue, { color }]}>{display}</Text>;
}

export default function DashboardScreen() {
  const { getStats } = useFraudCheck();
  const [stats, setStats] = useState(null);

  useEffect(() => { getStats().then(setStats); }, []);

  const chartData = stats?.scam_types_weekly?.map((s) => ({
    x: s.type.length > 8 ? s.type.slice(0, 8) + '…' : s.type, y: s.count,
  })) || [];

  const riskColor = (level) => level === 'HIGH' ? theme.colors.danger : level === 'MEDIUM' ? theme.colors.warning : theme.colors.safe;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📊 Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Live threat intelligence</Text>

        {/* Stat Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {STAT_CARDS.map((card) => (
            <View key={card.label} style={[styles.statCard, { borderColor: card.color + '40' }]}>
              <Ionicons name={card.icon} size={22} color={card.color} />
              <AnimCounter
                target={stats?.[card.valueKey] ?? 0}
                color={card.color}
                isString={typeof stats?.[card.valueKey] === 'string'}
              />
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Today's Summary */}
        <View style={styles.todayCard}>
          <Text style={styles.cardTitle}>Today's Summary</Text>
          <View style={styles.todayRow}>
            <TodayBadge label="Safe" value={stats?.safe_today || 0} color={theme.colors.safe} />
            <TodayBadge label="Caution" value={stats?.caution_today || 0} color={theme.colors.warning} />
            <TodayBadge label="Blocked" value={stats?.blocked_today || 0} color={theme.colors.danger} />
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Top Scam Types This Week</Text>
          {chartData.length > 0 ? (
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              padding={{ top: 20, bottom: 60, left: 50, right: 20 }}
              height={240}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: theme.colors.cardBorder },
                  tickLabels: { fill: theme.colors.textMuted, fontSize: 9, angle: -30 },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: theme.colors.cardBorder },
                  tickLabels: { fill: theme.colors.textMuted, fontSize: 10 },
                }}
              />
              <VictoryBar
                data={chartData}
                style={{ data: { fill: theme.colors.primary } }}
                cornerRadius={{ top: 4 }}
              />
            </VictoryChart>
          ) : (
            <View style={styles.chartPlaceholder}>
              <Text style={styles.placeholderText}>Loading chart data...</Text>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {(stats?.recent_activity || []).map((item, i) => (
            <View key={i} style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: riskColor(item.risk_level) }]} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityMobile}>{item.mobile}</Text>
                <Text style={styles.activityTime}>
                  {new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityAmount}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
                <View style={[styles.riskBadge, { backgroundColor: riskColor(item.risk_level) + '25' }]}>
                  <Text style={[styles.riskBadgeText, { color: riskColor(item.risk_level) }]}>{item.risk_level}</Text>
                </View>
              </View>
            </View>
          ))}
          {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
            <Text style={styles.placeholderText}>No recent activity yet. Check a number to see results here.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TodayBadge = ({ label, value, color }) => (
  <View style={[styles.todayBadge, { borderColor: color + '40' }]}>
    <Text style={[styles.todayValue, { color }]}>{value}</Text>
    <Text style={styles.todayLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 20 },
  statsRow: { gap: 12, paddingVertical: 4, marginBottom: 16 },
  statCard: {
    alignItems: 'center', padding: 16, minWidth: 110,
    backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl,
    borderWidth: 1, gap: 6,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center' },
  todayCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 14 },
  todayRow: { flexDirection: 'row', gap: 10 },
  todayBadge: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.lg, borderWidth: 1, gap: 4 },
  todayValue: { fontSize: 22, fontWeight: '800' },
  todayLabel: { fontSize: 11, color: theme.colors.textSecondary },
  chartCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16, marginBottom: 16 },
  chartPlaceholder: { height: 180, alignItems: 'center', justifyContent: 'center' },
  activityCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16 },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
  activityDot: { width: 10, height: 10, borderRadius: 5 },
  activityInfo: { flex: 1 },
  activityMobile: { fontSize: 13, color: theme.colors.textPrimary, fontWeight: '500' },
  activityTime: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  activityRight: { alignItems: 'flex-end', gap: 4 },
  activityAmount: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  riskBadgeText: { fontSize: 10, fontWeight: '700' },
  placeholderText: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 },
});
