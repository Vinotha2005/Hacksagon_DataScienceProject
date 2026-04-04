import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import useFraudCheck from '../../hooks/useFraudCheck';

// Inline map using colored circles on a grid (no native maps needed for Expo Go)
const CITIES = [
  { name: 'Delhi', lat: 28.6, lng: 77.2, x: '47%', y: '20%', count: 1245 },
  { name: 'Jaipur', lat: 26.9, lng: 75.8, x: '38%', y: '27%', count: 378 },
  { name: 'Lucknow', lat: 26.8, lng: 80.9, x: '55%', y: '28%', count: 312 },
  { name: 'Ahmedabad', lat: 23.0, lng: 72.6, x: '30%', y: '37%', count: 421 },
  { name: 'Mumbai', lat: 19.1, lng: 72.9, x: '28%', y: '50%', count: 1123 },
  { name: 'Pune', lat: 18.5, lng: 73.9, x: '32%', y: '53%', count: 489 },
  { name: 'Hyderabad', lat: 17.4, lng: 78.5, x: '48%', y: '55%', count: 743 },
  { name: 'Kolkata', lat: 22.6, lng: 88.4, x: '72%', y: '38%', count: 612 },
  { name: 'Bangalore', lat: 13.0, lng: 77.6, x: '46%', y: '65%', count: 876 },
  { name: 'Chennai', lat: 13.1, lng: 80.3, x: '52%', y: '65%', count: 534 },
];

const MAX_COUNT = 1245;

function getBubbleSize(count) {
  return 10 + (count / MAX_COUNT) * 40;
}

export default function HeatmapScreen() {
  const [selectedCity, setSelectedCity] = useState(null);
  const { getHeatmap } = useFraudCheck();
  const [cityData, setCityData] = useState({});

  useEffect(() => {
    getHeatmap().then((data) => {
      const map = {};
      (data?.cities || []).forEach((c) => { map[c.name] = c; });
      setCityData(map);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ India Fraud Heatmap</Text>
        <Text style={styles.subtitle}>Tap a hotspot to see details</Text>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        {/* India outline approximation background */}
        <View style={styles.mapBg}>
          <Text style={styles.mapLabel}>India</Text>
        </View>

        {/* Bubble markers */}
        {CITIES.map((city) => {
          const size = getBubbleSize(city.count);
          const isSelected = selectedCity?.name === city.name;
          return (
            <TouchableOpacity
              key={city.name}
              onPress={() => setSelectedCity(city)}
              style={[
                styles.bubble,
                {
                  left: city.x,
                  top: city.y,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  backgroundColor: isSelected
                    ? theme.colors.warning + 'CC'
                    : theme.colors.danger + '66',
                  borderColor: isSelected ? theme.colors.warning : theme.colors.danger,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              {size > 28 && (
                <Text style={styles.bubbleLabel} numberOfLines={1}>
                  {city.name.slice(0, 3)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Higher = More Scams</Text>
        </View>
      </View>

      {/* City Detail Card */}
      {selectedCity ? (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View>
              <Text style={styles.cityName}>{selectedCity.name}</Text>
              <Text style={styles.cityCount}>
                {selectedCity.count.toLocaleString('en-IN')} reports
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedCity(null)}>
              <Ionicons name="close-circle" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsRow}>
            {(cityData[selectedCity.name]?.top_scams || [{ type: 'OTP Fraud' }, { type: 'KYC Scam' }]).map((s, idx) => {
              const typeName = typeof s === 'string' ? s : s.type;
              return (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{typeName}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        /* City List */
        <ScrollView contentContainerStyle={styles.cityList}>
          {CITIES.sort((a, b) => b.count - a.count).map((city) => (
            <TouchableOpacity key={city.name} style={styles.cityItem} onPress={() => setSelectedCity(city)}>
              <View style={[styles.cityBar, { width: `${(city.count / MAX_COUNT) * 100}%` }]} />
              <Text style={styles.cityItemName}>{city.name}</Text>
              <Text style={styles.cityItemCount}>{city.count.toLocaleString('en-IN')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  subtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  mapContainer: { height: 300, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', position: 'relative', backgroundColor: '#0D1526', borderWidth: 1, borderColor: theme.colors.cardBorder, marginBottom: 12 },
  mapBg: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  mapLabel: { fontSize: 48, color: '#1a2540', fontWeight: '900' },
  bubble: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  bubbleLabel: { color: 'white', fontSize: 9, fontWeight: '700' },
  legend: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.card + 'CC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.danger + '80' },
  legendText: { fontSize: 10, color: theme.colors.textSecondary },
  detailCard: { marginHorizontal: 16, backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cityName: { fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary },
  cityCount: { fontSize: 13, color: theme.colors.danger, fontWeight: '600', marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: theme.colors.dangerGlow, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.danger + '40' },
  tagText: { fontSize: 12, color: theme.colors.danger, fontWeight: '600' },
  cityList: { paddingHorizontal: 16, gap: 8, paddingBottom: 20 },
  cityItem: { position: 'relative', backgroundColor: theme.colors.card, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 12, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  cityBar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: theme.colors.danger + '18' },
  cityItemName: { flex: 1, fontSize: 14, color: theme.colors.textPrimary, fontWeight: '600' },
  cityItemCount: { fontSize: 13, color: theme.colors.danger, fontWeight: '700' },
});
