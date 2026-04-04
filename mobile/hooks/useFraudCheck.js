import { useState } from 'react';
import { Platform } from 'react-native';

// Use correct base URL depending on platform
const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000'
  : 'http://localhost:8000';

const useFraudCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkNumber = async (mobile, amount, note = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/check-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, amount: parseFloat(amount) || 0, note }),
      });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      return data;
    } catch (err) {
      // Return fallback mock data if backend not available
      console.warn('Backend unavailable, using mock data');
      return getMockResult(mobile, amount);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/stats`);
      if (!response.ok) throw new Error('Server error');
      return await response.json();
    } catch {
      return getMockStats();
    }
  };

  const getPredictions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/predictions`);
      if (!response.ok) throw new Error('Server error');
      return await response.json();
    } catch {
      return getMockPredictions();
    }
  };

  const getHeatmap = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/heatmap`);
      if (!response.ok) throw new Error('Server error');
      return await response.json();
    } catch {
      return getMockHeatmap();
    }
  };

  return { checkNumber, getStats, getPredictions, getHeatmap, loading, error };
};

// Mock data fallbacks
function getMockResult(mobile, amount) {
  const scenarios = {
    '9876543210': { risk_score: 12, risk_level: 'LOW', safe_to_pay: true, explanation: 'This number has no fraud reports on record. It appears to be a legitimate contact with a clean transaction history.', scam_type: null, reports_count: 0, last_seen_cities: [], recommendation: 'Safe to proceed' },
    '9999988888': { risk_score: 91, risk_level: 'HIGH', safe_to_pay: false, explanation: 'WARNING: This number has 17 confirmed fraud reports across Delhi and Mumbai. Associated with OTP fraud schemes.', scam_type: 'OTP Fraud', reports_count: 17, last_seen_cities: ['Delhi', 'Mumbai'], recommendation: 'Block immediately' },
    '8888877777': { risk_score: 54, risk_level: 'MEDIUM', safe_to_pay: false, explanation: 'Suspicious pattern detected. Amount matches prize scam thresholds.', scam_type: 'Prize Scam', reports_count: 4, last_seen_cities: ['Jaipur', 'Lucknow'], recommendation: 'Verify identity first' },
    '7777766666': { risk_score: 96, risk_level: 'HIGH', safe_to_pay: false, explanation: 'CRITICAL: Linked to organized fraud ring. File complaint immediately.', scam_type: 'Fraud Ring', reports_count: 34, last_seen_cities: ['Delhi', 'Hyderabad', 'Pune'], recommendation: 'Do not pay' },
    '6666655555': { risk_score: 88, risk_level: 'HIGH', safe_to_pay: false, explanation: 'OTP verification scam. Never send money for verification purposes.', scam_type: 'OTP Scam', reports_count: 12, last_seen_cities: ['Mumbai', 'Bangalore'], recommendation: 'Block and report' },
    '9123456789': { risk_score: 82, risk_level: 'HIGH', safe_to_pay: false, explanation: 'Fake KYC scam. Real KYC is always free.', scam_type: 'Fake KYC', reports_count: 8, last_seen_cities: ['Chennai', 'Kolkata'], recommendation: 'Report to your bank' },
  };
  const clean = mobile.replace('+91', '').replace(/-/g, '').replace(/ /g, '').trim();
  const result = scenarios[clean] || { risk_score: 25, risk_level: 'LOW', safe_to_pay: true, explanation: 'No reports found for this number. Transaction appears safe but always verify the recipient.', scam_type: null, reports_count: 0, last_seen_cities: [], recommendation: 'Proceed with caution' };
  return { ...result, mobile: clean, amount: parseFloat(amount) || 0 };
}

function getMockStats() {
  return {
    scams_blocked_today: 2847,
    users_protected: '1.2M',
    amount_saved_cr: '₹4.7Cr',
    active_patterns: 127,
    recent_activity: [
      { mobile: '+91-98XXX-XXXXX', amount: 5000, risk_level: 'HIGH', timestamp: new Date(Date.now() - 120000).toISOString() },
      { mobile: '+91-87XXX-XXXXX', amount: 500, risk_level: 'LOW', timestamp: new Date(Date.now() - 300000).toISOString() },
      { mobile: '+91-99XXX-XXXXX', amount: 49999, risk_level: 'HIGH', timestamp: new Date(Date.now() - 600000).toISOString() },
      { mobile: '+91-76XXX-XXXXX', amount: 1200, risk_level: 'MEDIUM', timestamp: new Date(Date.now() - 900000).toISOString() },
    ],
    scam_types_weekly: [
      { type: 'OTP Fraud', count: 845 },
      { type: 'KYC Scam', count: 634 },
      { type: 'Prize Scam', count: 521 },
      { type: 'Job Fraud', count: 398 },
      { type: 'Loan Scam', count: 287 },
    ],
    safe_today: 1847,
    caution_today: 634,
    blocked_today: 366,
  };
}

function getMockPredictions() {
  return {
    predictions: [
      { city: 'Mumbai', scam_type: 'Fake IRCTC Refund', reports_24h: 127, trend: '+340% this week', alert_message: 'Scammers posing as IRCTC agents offering fake refunds via UPI', common_pattern: 'Victim receives call about cancelled ticket refund, asked to share OTP.' },
      { city: 'Delhi', scam_type: 'Electricity Bill Scam', reports_24h: 89, trend: '+210% this week', alert_message: 'Fake electricity department threatening disconnection', common_pattern: 'Automated call about overdue bill, provides UPI ID to pay penalty.' },
      { city: 'Bangalore', scam_type: 'Job Offer Fraud', reports_24h: 67, trend: '+180% this week', alert_message: 'Fake job offers requiring registration fees via UPI', common_pattern: 'WhatsApp message with offer letter, asks for security deposit.' },
      { city: 'Hyderabad', scam_type: 'Investment Fraud', reports_24h: 54, trend: '+155% this week', alert_message: 'Fake stock trading groups promising 300% returns', common_pattern: 'WhatsApp group shows fake profits, victims invest more.' },
      { city: 'Ahmedabad', scam_type: 'Loan App Scam', reports_24h: 43, trend: '+120% this week', alert_message: 'Predatory loan apps accessing contacts to blackmail', common_pattern: 'App requests contact access, uses them to harass borrower family.' },
    ],
    updated_at: new Date().toISOString(),
  };
}

function getMockHeatmap() {
  return {
    cities: [
      { name: 'Delhi', latitude: 28.6139, longitude: 77.209, scam_count: 1245, top_scams: ['OTP Fraud', 'KYC Scam', 'Job Fraud'] },
      { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, scam_count: 1123, top_scams: ['IRCTC Refund', 'Investment Fraud', 'Loan Scam'] },
      { name: 'Bangalore', latitude: 12.9716, longitude: 77.5946, scam_count: 876, top_scams: ['Job Fraud', 'Tech Support', 'Prize Scam'] },
      { name: 'Hyderabad', latitude: 17.385, longitude: 78.4867, scam_count: 743, top_scams: ['Investment Fraud', 'Matrimonial Scam'] },
      { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, scam_count: 612, top_scams: ['OTP Fraud', 'Fake KYC'] },
      { name: 'Chennai', latitude: 13.0827, longitude: 80.2707, scam_count: 534, top_scams: ['KYC Scam', 'Electricity Bill'] },
      { name: 'Pune', latitude: 18.5204, longitude: 73.8567, scam_count: 489, top_scams: ['Job Fraud', 'Investment Fraud'] },
      { name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, scam_count: 421, top_scams: ['Loan App Scam', 'Prize Scam'] },
      { name: 'Jaipur', latitude: 26.9124, longitude: 75.7873, scam_count: 378, top_scams: ['Prize Scam', 'OTP Fraud'] },
      { name: 'Lucknow', latitude: 26.8467, longitude: 80.9462, scam_count: 312, top_scams: ['Electricity Bill', 'Job Fraud'] },
    ],
  };
}

export default useFraudCheck;
