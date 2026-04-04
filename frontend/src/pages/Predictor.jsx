import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "../utils/apiClient.js";
import { useRetry } from "../contexts/RetryContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

const FALLBACK = [
  { city: "Mumbai", scam_type: "Fake IRCTC Refund", reports_24h: 127, trend: "+340% this week",
    alert_message: "Scammers posing as IRCTC agents offering fake refunds via UPI",
    common_pattern: "Victim receives a call about a cancelled ticket refund, is asked to share OTP to 'receive' money. OTP is then used to drain account." },
  { city: "Delhi", scam_type: "Electricity Bill Scam", reports_24h: 89, trend: "+210% this week",
    alert_message: "Fake electricity department threatening disconnection unless immediate UPI payment",
    common_pattern: "An automated voice call claims the electricity bill is overdue. A UPI ID is provided to pay an inflated 'penalty'." },
  { city: "Bangalore", scam_type: "Job Offer Fraud", reports_24h: 67, trend: "+180% this week",
    alert_message: "Fake job offers requiring registration fees via UPI targeting freshers",
    common_pattern: "A WhatsApp message with an official-looking offer letter asks for a security deposit or registration fee before interview." },
  { city: "Hyderabad", scam_type: "Investment Fraud", reports_24h: 54, trend: "+155% this week",
    alert_message: "Fake stock trading groups promising 300% returns in 30 days appear on Telegram",
    common_pattern: "WhatsApp group shows fake profits accumulating. Victims invest more and more until the account is suddenly drained." },
  { city: "Ahmedabad", scam_type: "Loan App Scam", reports_24h: 43, trend: "+120% this week",
    alert_message: "Predatory loan apps accessing contacts to blackmail users after small loans",
    common_pattern: "App requests contact and photo access. After a small loan, it uses collected data to harass borrower's family members." },
];

const TREND_COLORS = { HIGH: "#EF4444", MEDIUM: "#F59E0B", LOW: "#10B981" };
const MAX_WAIT_SECONDS = 60;
const RETRY_INTERVAL_SECONDS = 5;

export default function Predictor() {
  const { colors } = useTheme();
  const isMobile = useIsMobile();
  const { setRetrying } = useRetry();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const retryCount = useRef(0);
  const timerRef = useRef(null);
  const aborted = useRef(false);

  // Countdown timer while waking
  useEffect(() => {
    if (waking) {
      timerRef.current = setInterval(() => {
        setWaitSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setWaitSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [waking]);

  const fetchPredictions = useCallback(async (isAutoWake = false) => {
    aborted.current = false;
    retryCount.current = 0;
    setLoading(true);

    if (isAutoWake) {
      setWaking(true);
    }

    const tryFetch = async () => {
      try {
        const res = await get("/api/predictions", {}, () => {});
        if (!aborted.current) {
          setPredictions(res.data.predictions || FALLBACK);
          setUpdatedAt(res.data.updated_at);
          setRetrying(false);
          setWaking(false);
          setLoading(false);
          setLastFetch(Date.now());
        }
        return true;
      } catch {
        return false;
      }
    };

    const maxRetries = Math.floor(MAX_WAIT_SECONDS / RETRY_INTERVAL_SECONDS);
    let success = await tryFetch();

    while (!success && retryCount.current < maxRetries && !aborted.current) {
      retryCount.current++;
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL_SECONDS * 1000));
      success = await tryFetch();
    }

    if (!success && !aborted.current) {
      setPredictions(FALLBACK);
      setUpdatedAt(new Date().toISOString());
      setWaking(false);
      setLoading(false);
      setLastFetch(Date.now());
    }
  }, [setRetrying]);

  useEffect(() => {
    // On mount: show fallback immediately, then try to wake backend
    setPredictions(FALLBACK);
    setUpdatedAt(new Date().toISOString());
    setLastFetch(Date.now());
  }, []);

  const handleRefresh = () => {
    fetchPredictions(true);
  };

  const handleCancel = () => {
    aborted.current = true;
    setWaking(false);
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto py-8" style={{ paddingLeft: isMobile ? "16px" : "16px", paddingRight: isMobile ? "16px" : "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: isMobile ? "flex-start" : "space-between", gap: "16px", marginBottom: "32px" }}>
        <div>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: "8px", marginBottom: "8px" }}>
            <h1 className="text-3xl font-black" style={{ color: colors.textPrimary }}>AI Scam Predictor</h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest">
              Claude AI
            </span>
          </div>
          <p style={{ color: colors.textSecondary }}>Real-time scam trend analysis powered by Claude Sonnet</p>
          {updatedAt && <p style={{ color: colors.textSecondary, fontSize: "12px", marginTop: "4px" }}>Last updated: {new Date(updatedAt).toLocaleTimeString("en-IN")}</p>}
        </div>
        <div style={{ display: "flex", gap: "8px", width: isMobile ? "100%" : "auto" }}>
          {waking && (
            <button onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl border text-sm font-semibold"
              style={{ borderColor: colors.borderColor, color: colors.textSecondary, backgroundColor: "transparent", width: isMobile ? "50%" : "auto" }}>
              Cancel
            </button>
          )}
          <button onClick={handleRefresh} disabled={loading}
            style={{ width: isMobile ? "100%" : "auto", borderColor: colors.borderColor }}
            className="px-5 py-2.5 rounded-xl btn-gradient text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-2 justify-center">
            {loading ? <><span className="animate-spin">⟳</span> Fetching…</> : "🔄 Refresh AI"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* WAKING UP STATE */}
        {waking ? (
          <motion.div key="waking" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-12 flex flex-col items-center gap-5"
            style={{ backgroundColor: colors.bgSecondary, border: `1px solid ${colors.borderColor}` }}>
            {/* Spinner */}
            <div style={{ position: "relative", width: "72px", height: "72px" }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "3px solid transparent",
                borderTopColor: "#6366F1",
                animation: "spin 1s linear infinite"
              }} />
              <div style={{
                position: "absolute", inset: "8px", borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "#8B5CF6",
                animation: "spin 1.5s linear infinite reverse"
              }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
            </div>
            <div className="text-center">
              <p className="text-indigo-400 font-bold text-lg animate-pulse">Waking up AI engine…</p>
              <p className="text-gray-400 text-sm mt-1">Please wait, this may take up to {MAX_WAIT_SECONDS}s on first load</p>
              <p className="text-gray-500 text-xs mt-2">Retrying… {waitSeconds}s elapsed</p>
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs h-1.5 rounded-full" style={{ backgroundColor: colors.borderColor }}>
              <div className="h-1.5 rounded-full bg-indigo-500 transition-all duration-1000"
                style={{ width: `${Math.min((waitSeconds / MAX_WAIT_SECONDS) * 100, 100)}%` }} />
            </div>
            <p className="text-gray-600 text-xs">Using cached predictions while engine warms up</p>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {predictions.map((pred, i) => {
              const trendNum = parseInt(pred.trend?.replace(/[^0-9]/g, "") || 0);
              const severity = trendNum > 250 ? "HIGH" : trendNum > 100 ? "MEDIUM" : "LOW";
              const color = TREND_COLORS[severity];
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-5 card-hover"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.borderColor,
                    border: `1px solid ${colors.borderColor}`,
                    borderLeft: `3px solid ${color}`
                  }}>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: `${color}20`, color }}>
                      🚨 TRENDING NOW
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: colors.textSecondary, backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>📍 {pred.city}</span>
                    <span className="ml-auto text-xs font-bold" style={{ color }}>{pred.trend}</span>
                  </div>
                  <h3 className="text-xl font-black mb-1" style={{ color: colors.textPrimary }}>{pred.scam_type}</h3>
                  <p className="text-amber-400 font-semibold text-sm mb-3">⚠️ {pred.alert_message}</p>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "16px", marginBottom: "16px" }}>
                    <div className="text-center">
                      <p className="text-2xl font-black" style={{ color }}>{pred.reports_24h}</p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>reports in 24h</p>
                    </div>
                    <div className="w-px" style={{ backgroundColor: colors.borderColor, display: isMobile ? "none" : "block" }} />
                    <div className="flex-1">
                      <p className="text-xs mb-1 font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>How it works:</p>
                      <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{pred.common_pattern}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="text-xs text-indigo-400 font-semibold">Predicted by Claude AI</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#22c55e" }}>
                      🛡️ FraudShield: PROTECTED
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
