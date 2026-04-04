import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext.jsx";
import RiskMeter from "./RiskMeter.jsx";

const UPI_LINKS = {
  gpay:    (mobile, amount) => `tez://upi/pay?pa=${mobile}@upi&am=${amount}&cu=INR`,
  phonepe: (mobile, amount) => `phonepe://pay?pa=${mobile}@upi&am=${amount}&cu=INR`,
  paytm:   (mobile, amount) => `paytmmp://pay?pa=${mobile}@upi&am=${amount}`,
  bhim:    (mobile, amount) => `upi://pay?pa=${mobile}@upi&am=${amount}&cu=INR`,
};

// ── Mini bar chart for ensemble breakdown ─────────────────────────────────
function EnsembleBar({ label, score, weight, color }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", color: color }}>{label}</span>
        <span style={{ fontSize: "11px", color: "#888" }}>
          {score?.toFixed(1) ?? "–"}% <span style={{ opacity: 0.6 }}>× {weight}</span>
        </span>
      </div>
      <div style={{ height: "6px", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score ?? 0, 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: "9999px", background: color }}
        />
      </div>
    </div>
  );
}

// ── SHAP feature chip ─────────────────────────────────────────────────────
function ShapChip({ text, impact }) {
  const isRisk = impact > 0;
  return (
    <div style={{
      padding: "8px 12px",
      borderRadius: "8px",
      background: isRisk ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
      border: `1px solid ${isRisk ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
      fontSize: "12px",
      lineHeight: "1.5",
      color: isRisk ? "#f87171" : "#6ee7b7",
      display: "flex",
      gap: "8px",
      alignItems: "flex-start",
    }}>
      <span style={{ flexShrink: 0, fontSize: "13px" }}>{isRisk ? "⬆" : "⬇"}</span>
      <span>{text}</span>
    </div>
  );
}

export default function ResultCard({ result, onReset, onBlock }) {
  const { colors, isDark } = useTheme();
  const [showEnsemble, setShowEnsemble] = useState(false);

  const {
    risk_score, risk_level, explanation, scam_type,
    reports_count, last_seen_cities, recommendation, red_flags,
    source, mobile, amount,
    // ML fields (v2 — 4-layer ensemble)
    model_confidence, confidence,
    xgb_score, isolation_score, graph_score, behavioral_score,
    explanations, shap_features, behavioral_reasons,
    ensemble_weights, graph_note, dataset_note, govt_data_note,
    // Simulator fields
    is_simulated, scenario_label, behavioral_context,
  } = result;
  // Use confidence or model_confidence (backward compat)
  const confPct = confidence ?? model_confidence;

  const isSafe    = risk_level === "LOW";
  const isDanger  = risk_level === "HIGH";
  const isCaution = risk_level === "MEDIUM";

  const configs = {
    LOW:    { bg: "from-emerald-900/30 to-emerald-800/10", border: "border-emerald-500/30", icon: "✅", title: "SAFE TO PAY",           titleColor: "text-emerald-400", glow: "safe-glow" },
    HIGH:   { bg: "from-red-900/40 to-red-800/10",         border: "border-red-500/40",     icon: "🚨", title: "DANGER — DO NOT PAY",   titleColor: "text-red-400",     glow: "danger-pulse" },
    MEDIUM: { bg: "from-amber-900/30 to-amber-800/10",     border: "border-amber-500/30",   icon: "⚠️", title: "PROCEED WITH CAUTION",  titleColor: "text-amber-400",   glow: "" },
  };

  const cfg = configs[risk_level] || configs.MEDIUM;
  const handleUPIOpen = (app) => { const url = UPI_LINKS[app]?.(mobile, amount); if (url) window.open(url, "_blank"); };

  const hasEnsembleData = xgb_score !== undefined || isolation_score !== undefined
                        || graph_score !== undefined || behavioral_score !== undefined;
  const hasShap = explanations && explanations.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className={`rounded-2xl border bg-gradient-to-b ${cfg.bg} ${cfg.border} p-6 ${cfg.glow}`}
    >
      {/* ── Header ── */}
      <div className="text-center mb-6">
        <span className="text-4xl">{cfg.icon}</span>
        <h2 className={`text-2xl font-black mt-2 tracking-wide ${cfg.titleColor}`}>{cfg.title}</h2>

        {/* Simulator badge */}
        {is_simulated && (
          <div style={{ marginTop: "8px" }}>
            <span style={{
              padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600",
              background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.5)", color: "#a78bfa"
            }}>
              🧪 Simulated · {scenario_label}
            </span>
          </div>
        )}

        {/* Model Confidence Badge */}
        {confPct !== undefined && (
          <div style={{ marginTop: "8px" }}>
            <span style={{
              padding: "4px 14px", borderRadius: "9999px", fontSize: "12px", fontWeight: "700",
              background: confPct >= 80 ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
              border: `1px solid ${confPct >= 80 ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)"}`,
              color: confPct >= 80 ? "#6ee7b7" : "#fbbf24"
            }}>
              🧠 Model Confidence: {confPct?.toFixed(1)}%
            </span>
          </div>
        )}

        {scam_type && (
          <div className="text-center">
            <span style={{
              display: "inline-block", marginTop: "8px", padding: "6px 12px", borderRadius: "9999px",
              backgroundColor: isCaution ? "#b45000" : "#cc0000",
              color: "#ffffff", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em"
            }}>
              {scam_type}
            </span>
            {red_flags && red_flags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
                {red_flags.map((flag, idx) => (
                  <span key={idx} style={{
                    display: "inline-block", padding: "4px 10px", borderRadius: "6px",
                    backgroundColor: "#3d0000", border: "1px solid #ff4444", color: "#ff6666", fontSize: "11px", fontWeight: "500"
                  }}>🚩 {flag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Risk Meter ── */}
      <div className="flex justify-center mb-6">
        <RiskMeter score={risk_score} size={180} />
      </div>

      {/* ── Details ── */}
      <div className="space-y-4 mb-6">

        {/* Explanation */}
        <div style={{ backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: "12px", padding: "16px" }}>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-2">🤖 Analysis</p>
          <p style={{ color: colors.isDark ? "#cccccc" : "#333333" }} className="text-sm leading-relaxed">{explanation}</p>
        </div>

        {/* ── SHAP Explanations ── */}
        {hasShap && (
          <div style={{ backgroundColor: colors.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a78bfa", marginBottom: "10px" }}>
              🔍 SHAP Explainability — Top Contributing Factors
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {explanations.map((text, i) => (
                <ShapChip key={i} text={text} impact={(shap_features?.[i]?.impact ?? 0)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Ensemble Breakdown (collapsible) ── */}
        {hasEnsembleData && (
          <div style={{
            backgroundColor: colors.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            borderRadius: "12px", padding: "16px"
          }}>
            <button
              onClick={() => setShowEnsemble(!showEnsemble)}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "none", border: "none", cursor: "pointer", padding: "0",
                color: isDark ? "#e0e0e0" : "#333"
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#06b6d4" }}>
                📊 Ensemble Breakdown
              </span>
              <span style={{ fontSize: "12px", color: "#888" }}>{showEnsemble ? "▲ hide" : "▼ show"}</span>
            </button>

            <AnimatePresence>
              {showEnsemble && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: "12px", overflow: "hidden" }}
                >
                  <EnsembleBar label="XGBoost Classifier"       score={xgb_score}       weight="0.50" color="#7c3aed" />
                  <EnsembleBar label="Isolation Forest"          score={isolation_score}  weight="0.20" color="#06b6d4" />
                  <EnsembleBar label="Graph Risk (GNN-inspired)" score={graph_score}      weight="0.15" color="#10b981" />
                  <EnsembleBar label="Behavioral Rules (Govt-calibrated)" score={behavioral_score} weight="0.15" color="#f59e0b" />
                  {behavioral_context && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                      <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "600" }}>⚡</span>
                      {Object.entries(behavioral_context)
                        .filter(([k]) => k !== "source")
                        .map(([k, v]) => (
                          <span key={k} style={{
                            padding: "1px 7px", borderRadius: "4px", fontSize: "10px",
                            background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                            border: "1px solid rgba(245,158,11,0.25)"
                          }}>{k.replace(/_/g, " ")}: {v}</span>
                        ))
                      }
                    </div>
                  )}
                  <p style={{ fontSize: "10px", color: "#666", marginTop: "8px", fontStyle: "italic" }}>
                    {govt_data_note || graph_note}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Source Badge */}
        {source?.includes("fraud_database") && risk_level !== "LOW" && (
          <div style={{
            backgroundColor: colors.isDark ? "rgba(255,68,68,0.15)" : "rgba(180,0,0,0.08)",
            border: `1px solid ${colors.isDark ? "#ff4444" : "#cc0000"}`,
            borderRadius: "8px", padding: "10px 12px", textAlign: "center"
          }}>
            <p style={{ fontSize: "13px", fontWeight: "500", color: colors.isDark ? "#ff6666" : "#990000", margin: "0" }}>
              ⚠️ Found in verified fraud database
            </p>
          </div>
        )}

        {/* No reports / clean */}
        {(source === "transaction_analysis" || risk_level === "LOW") && (
          <div style={{
            backgroundColor: colors.isDark ? "rgba(0,255,136,0.15)" : "rgba(0,180,80,0.12)",
            border: `1px solid ${colors.isDark ? "#00ff88" : "#00a050"}`,
            borderRadius: "8px", padding: "10px 12px", textAlign: "center"
          }}>
            <p style={{ fontSize: "13px", fontWeight: "500", color: colors.isDark ? "#00ff88" : "#006830", margin: "0" }}>
              ✅ No reports found — Transaction analyzed by ML
            </p>
          </div>
        )}

        {/* Legacy stat grid */}
        {(reports_count > 0 || (last_seen_cities && last_seen_cities.length > 0)) && (
          <div className="grid grid-cols-2 gap-3">
            {reports_count > 0 && (
              <div style={{ backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <p className="text-2xl font-black text-red-400">{reports_count}</p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Fraud Reports</p>
              </div>
            )}
            {last_seen_cities && last_seen_cities.length > 0 && (
              <div style={{ backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                <p className="text-sm font-bold text-orange-400">{last_seen_cities.join(", ")}</p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Last seen</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        <div style={{
          backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          borderLeft: isSafe ? "4px solid #00aa55" : (isCaution ? "4px solid #f5a623" : "4px solid #cc0000"),
          borderRadius: "8px", padding: "12px 16px"
        }}>
          <p style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: colors.isDark ? "#999999" : "#666666", margin: "0 0 4px" }}>
            ML RECOMMENDATION
          </p>
          <p style={{ fontSize: "14px", color: colors.isDark ? "#ffffff" : "#1a1a2e", margin: "0" }}>
            ✅ {recommendation}
          </p>
        </div>

        {/* Dataset note */}
        {dataset_note && (
          <p style={{ fontSize: "10px", color: "#555", textAlign: "center", fontStyle: "italic", margin: "0" }}>
            📊 {dataset_note}
          </p>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="space-y-3">
        {isSafe && (
          <>
            <p style={{ color: colors.isDark ? "#aaaaaa" : "#555555", textAlign: "center", fontSize: "14px", fontWeight: 500, margin: 0 }}>Choose payment app:</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {[
                { key: "gpay",    label: "GPay",    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" },
                { key: "phonepe", label: "PhonePe", logo: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" },
                { key: "paytm",   label: "Paytm",   logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png" },
                { key: "bhim",    label: "BHIM",    logo: null },
              ].map((app) => (
                <button key={app.key} onClick={() => handleUPIOpen(app.key)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                    padding: "12px 8px", borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)",
                    transition: "all 0.2s ease", cursor: "pointer"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}
                >
                  <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                    {app.key === "bhim" ? (
                      <span style={{ fontSize: "11px", fontWeight: "bold", background: "linear-gradient(135deg,#00b9f1,#0066cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>BHIM</span>
                    ) : (
                      <img src={app.logo} alt={app.label} style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                    )}
                  </div>
                  <span style={{ fontSize: "12px", color: colors.isDark ? "#aaaaaa" : "#333", fontWeight: "500" }}>{app.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {isCaution && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleUPIOpen("gpay")}
              style={{
                padding: "12px 16px", borderRadius: "12px", border: "1px solid #f5a623",
                backgroundColor: colors.isDark ? "rgba(255,165,0,0.2)" : "#f5a623",
                color: colors.isDark ? "#ffaa00" : "#ffffff", fontWeight: "600", fontSize: "14px", cursor: "pointer"
              }}>
              Proceed Anyway →
            </button>
          </div>
        )}

        {isDanger && (
          <button onClick={onBlock} className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            🚫 BLOCK &amp; REPORT
          </button>
        )}

        <button onClick={onReset}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: "12px",
            border: `1px solid ${colors.isDark ? "rgba(255,255,255,0.1)" : "#cccccc"}`,
            backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "#f0f0f0",
            color: colors.isDark ? "#ffffff" : "#1a1a2e", fontSize: "14px", fontWeight: 500, cursor: "pointer"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.isDark ? "rgba(255,255,255,0.08)" : "#e6e6e6"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.isDark ? "rgba(255,255,255,0.05)" : "#f0f0f0"; }}
        >
          ← Check Another Number
        </button>
      </div>
    </motion.div>
  );
}
