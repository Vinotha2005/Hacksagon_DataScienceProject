import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext.jsx";
import ResultCard from "../components/ResultCard.jsx";
import { postCached } from "../utils/apiClient.js";

const API_BASE = import.meta.env.VITE_API_URL || "https://hacksagon-datascienceproject.onrender.com";

const SCENARIOS = [
  {
    key: "safe",
    icon: "✅",
    label: "Safe Transaction",
    description: "Routine P2P rent payment to a verified contact during business hours. Baseline for a clean, low-risk UPI transaction.",
    expected: "LOW",
    details: ["Amount: ₹1,250", "Hour: 11 AM", "Note: Monthly rent payment"],
    behavioral: ["Repeat txns: 1", "Receivers: 1", "Reports: 0"],
    govtNote: null,
    accentColor: "#10b981",
  },
  {
    key: "otp_scam",
    icon: "🎭",
    label: "OTP Scam (Account Takeover)",
    description: "Rs.1 test payment with 'verify otp bank' — hallmark of account-takeover. OTP phishing = 18.9% of all UPI fraud (cybercrime.gov.in).",
    expected: "HIGH",
    details: ["Amount: ₹1", "Note: verify otp bank", "Known fraud number"],
    behavioral: ["Repeat txns: 12", "Receivers: 8", "Reports: 7"],
    govtNote: "cybercrime.gov.in · NCRB 2023",
    accentColor: "#ef4444",
  },
  {
    key: "fraud_ring",
    icon: "🕸️",
    label: "Fraud Ring Pattern (Commission Scam)",
    description: "Rs.49,999 at midnight with urgent commission note. TRAI 14C: 15+ user reports. Fan-out of 15 unique victims.",
    expected: "HIGH",
    details: ["Amount: ₹49,999", "Hour: 12 AM (midnight)", "Note: commission payment urgent"],
    behavioral: ["Repeat txns: 18", "Receivers: 15", "Reports: 15"],
    govtNote: "TRAI 14C · Sanchar Saathi",
    accentColor: "#ef4444",
  },
  {
    key: "micro_fraud",
    icon: "🌙",
    label: "Late-Night Micro-Amount Fraud",
    description: "Rs.9,999 at 3 AM with prize/reward keywords. Evades Rs.10,000 bank alert threshold. NCRB 2023: 41% of UPI fraud in 11 PM–5 AM window.",
    expected: "HIGH",
    details: ["Amount: ₹9,999", "Hour: 3 AM", "Note: prize claim reward"],
    behavioral: ["Repeat txns: 6", "Receivers: 4", "Reports: 5"],
    govtNote: "NCRB 2023 Annual Report",
    accentColor: "#f59e0b",
  },
];

export default function SimulatorPage() {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});
  const [activeResult, setActiveResult] = useState(null);
  const [error, setError] = useState(null);

  const runSimulation = async (scenarioKey) => {
    setLoading(scenarioKey);
    setError(null);
    try {
      const res = await postCached("/api/simulate", { scenario: scenarioKey });
      setResults((prev) => ({ ...prev, [scenarioKey]: res.data }));
      setActiveResult(scenarioKey);
      // Show offline note if served from cache
      if (res.data?.is_cached) {
        setError("⚡ Demo mode: using cached result (backend offline). Results are still accurate.");
      }
    } catch (e) {
      setError(`Failed to run simulation: ${e.message}. Is the backend running at localhost:8000?`);
    } finally {
      setLoading(null);
    }
  };

  const activeResultData = activeResult ? results[activeResult] : null;

  return (
    <div style={{ minHeight: "100vh", padding: "24px 16px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: "32px" }}
      >
        <span style={{ fontSize: "48px" }}>🧪</span>
        <h1 style={{
          fontSize: "28px", fontWeight: "900", margin: "12px 0 8px",
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
        }}>
          Transaction Simulator
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: "15px", maxWidth: "580px", margin: "0 auto" }}>
          Run preset fraud scenarios through the full 4-layer ML ensemble.
          Results are <strong style={{ color: isDark ? "#a78bfa" : "#6d28d9" }}>deterministic</strong> — same output every run.
          Behavioral context calibrated from <strong>NCRB 2023 / TRAI 14C</strong> statistics.
        </p>

        {/* ML Badge Row — v2 weights */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
          {[
            { label: "XGBoost",          color: "#7c3aed", weight: "50%" },
            { label: "Isolation Forest", color: "#06b6d4", weight: "20%" },
            { label: "Graph Risk",       color: "#10b981", weight: "15%" },
            { label: "Behavioral",       color: "#f59e0b", weight: "15%" },
          ].map((m) => (
            <span key={m.label} style={{
              padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: "600",
              background: `${m.color}22`, border: `1px solid ${m.color}55`, color: m.color
            }}>
              {m.label} · {m.weight}
            </span>
          ))}
        </div>
      </motion.div>

      {error && (
        <div style={{
          background: "#3d0000", border: "1px solid #ff4444", borderRadius: "12px",
          padding: "12px 16px", marginBottom: "20px", color: "#ff8888", fontSize: "14px"
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
        {SCENARIOS.map((s, i) => {
          const isLoading = loading === s.key;
          const hasResult = !!results[s.key];
          const isActive = activeResult === s.key;

          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                borderRadius: "16px",
                border: `1px solid ${isActive ? s.accentColor + "66" : (isDark ? "rgba(255,255,255,0.08)" : "#e0e0e0")}`,
                background: isDark
                  ? isActive ? `${s.accentColor}11` : "rgba(255,255,255,0.03)"
                  : isActive ? `${s.accentColor}09` : "#f9f9ff",
                padding: "20px",
                transition: "all 0.2s ease",
              }}
            >
              {/* Scenario header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "32px", flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: colors.text }}>{s.label}</h3>
                    <span style={{
                      padding: "2px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700",
                      background: s.expected === "LOW" ? "#10b98122" : "#ef444422",
                      color: s.expected === "LOW" ? "#10b981" : "#ef4444",
                      border: `1px solid ${s.expected === "LOW" ? "#10b98155" : "#ef444455"}`
                    }}>
                      Expected: {s.expected}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.textSecondary, lineHeight: "1.4" }}>
                    {s.description}
                  </p>
                </div>
              </div>

              {/* Detail chips */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                {s.details.map((d) => (
                  <span key={d} style={{
                    padding: "3px 10px", borderRadius: "6px", fontSize: "11px",
                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                    color: colors.textSecondary, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e0e0e0"}`
                  }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Behavioral context chips */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px", alignItems: "center" }}>
                <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "600", marginRight: "2px" }}>⚡ Behavioral:</span>
                {s.behavioral.map((b) => (
                  <span key={b} style={{
                    padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
                    background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.3)"
                  }}>
                    {b}
                  </span>
                ))}
                {s.govtNote && (
                  <span style={{
                    padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
                    background: "rgba(6,182,212,0.1)", color: "#06b6d4",
                    border: "1px solid rgba(6,182,212,0.3)"
                  }}>
                    📋 {s.govtNote}
                  </span>
                )}
              </div>

              {/* Run button */}
              <button
                onClick={() => runSimulation(s.key)}
                disabled={isLoading}
                style={{
                  width: "100%", padding: "10px 16px", borderRadius: "10px", border: "none",
                  background: isLoading
                    ? (isDark ? "rgba(255,255,255,0.1)" : "#e0e0e0")
                    : `linear-gradient(135deg, ${s.accentColor}, ${s.accentColor}cc)`,
                  color: isLoading ? (isDark ? "#aaa" : "#888") : "#fff",
                  fontWeight: "700", fontSize: "14px", cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚙️</span>
                    Running ML Ensemble…
                  </>
                ) : hasResult ? (
                  <>🔁 Re-run Simulation</>
                ) : (
                  <>▶ Run Simulation</>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Active Result Panel */}
      {activeResultData && (
        <motion.div
          key={activeResult}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: "32px" }}
        >
          <div style={{
            textAlign: "center", marginBottom: "16px",
            fontSize: "13px", color: colors.textSecondary
          }}>
            Result for: <strong style={{ color: isDark ? "#a78bfa" : "#6d28d9" }}>
              {SCENARIOS.find(s => s.key === activeResult)?.label}
            </strong>
            {" "}·{" "}
            <span style={{ color: "#6ee7b7", fontSize: "12px" }}>
              🔒 Deterministic — reproducible result
            </span>
          </div>
          <ResultCard
            result={activeResultData}
            onReset={() => setActiveResult(null)}
            onBlock={() => setActiveResult(null)}
          />
        </motion.div>
      )}

      {/* Dataset disclaimer — 3-layer strategy */}
      <div style={{
        marginTop: "32px", padding: "16px 18px", borderRadius: "12px",
        background: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)",
        border: isDark ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(124,58,237,0.2)",
        fontSize: "12px", color: colors.textSecondary, lineHeight: "1.7"
      }}>
        <strong style={{ color: isDark ? "#a78bfa" : "#6d28d9", display: "block", marginBottom: "6px" }}>📊 3-Dataset Strategy</strong>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", alignItems: "baseline" }}>
          <span style={{ color: "#7c3aed", fontWeight: "700" }}>①</span>
          <span><strong>CCF/Kaggle proxy</strong> — 284,807 European card transactions (0.172% fraud). Used for ML probability training. Public UPI data unavailable (RBI regulations).</span>
          <span style={{ color: "#06b6d4", fontWeight: "700" }}>②</span>
          <span><strong>Government data</strong> — cybercrime.gov.in (NCRB 2023), sancharsaathi.gov.in (TRAI 14C). Used for behavioral rule calibration &amp; feature design only — NOT transaction-level training.</span>
          <span style={{ color: "#10b981", fontWeight: "700" }}>③</span>
          <span><strong>Synthetic UPI-style dataset</strong> — 50,000 seeded transactions mirroring UPI P2P/P2M patterns, calibrated from govt statistics. Fully reproducible.</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
