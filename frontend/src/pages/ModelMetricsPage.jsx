/**
 * ModelMetricsPage.jsx
 * "Judge-ready" ML metrics dashboard.
 * Shows: AUC, PR-AUC, Precision, Recall, F1, Confusion Matrix,
 * ₹ saved estimate (NCRB 2023 calibrated), and the 3-dataset strategy.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { get } from "../utils/apiClient.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Stat tile ─────────────────────────────────────────────────────────────
function StatTile({ label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        padding: "20px", borderRadius: "14px",
        background: `${color}11`,
        border: `1px solid ${color}33`,
        textAlign: "center", flex: "1 1 130px",
      }}
    >
      <div style={{ fontSize: "28px", fontWeight: "900", color }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: "700", color, marginTop: "4px", opacity: 0.85 }}>{label}</div>
      {sub && <div style={{ fontSize: "10px", marginTop: "3px", opacity: 0.55, color: "#aaa" }}>{sub}</div>}
    </motion.div>
  );
}

// ── Confusion matrix cell ────────────────────────────────────────────────
function CMCell({ label, val, color, note }) {
  return (
    <div style={{
      padding: "18px 12px", borderRadius: "10px",
      background: `${color}15`, border: `1px solid ${color}40`,
      textAlign: "center", flex: 1,
    }}>
      <div style={{ fontSize: "24px", fontWeight: "900", color }}>{val?.toLocaleString()}</div>
      <div style={{ fontSize: "12px", fontWeight: "700", color, marginTop: "4px" }}>{label}</div>
      <div style={{ fontSize: "10px", opacity: 0.55, marginTop: "2px", color: "#aaa" }}>{note}</div>
    </div>
  );
}

export default function ModelMetricsPage() {
  const { colors, isDark } = useTheme();
  const [info, setInfo]   = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    get("/api/model-info")
      .then(r => setInfo(r.data))
      .catch(() => setError("Could not reach backend. Start the server and refresh."));
  }, []);

  const m   = info?.metrics ?? {};
  const cm  = m.confusion_matrix ?? {};
  const ds  = info?.dataset_strategy ?? {};

  // Rupees saved (from confusion matrix TP × NCRB avg loss)
  const rupeesSaved  = (cm.TP ?? 0) * 34000;
  const rupeesCrores = (rupeesSaved / 1e7).toFixed(2);

  const card = (children, delay = 0) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        borderRadius: "16px", padding: "20px 22px",
        background: isDark ? "rgba(255,255,255,0.03)" : "#f9f9ff",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e0e0e0",
        marginBottom: "20px",
      }}
    >
      {children}
    </motion.div>
  );

  const sectionTitle = (icon, text, color = "#7c3aed") => (
    <h2 style={{
      fontSize: "13px", fontWeight: "700", textTransform: "uppercase",
      letterSpacing: "0.06em", color, marginBottom: "14px", display: "flex",
      alignItems: "center", gap: "8px",
    }}>
      <span>{icon}</span>{text}
    </h2>
  );

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: "32px" }}
      >
        <span style={{ fontSize: "44px" }}>📊</span>
        <h1 style={{
          fontSize: "26px", fontWeight: "900", margin: "12px 0 8px",
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          ML Model Metrics
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: "14px", maxWidth: "520px", margin: "0 auto" }}>
          Offline evaluation on 50,000-sample synthetic proxy dataset.
          Threshold = 0.40 (tuned for <strong>high recall</strong> — catch more fraud, reduce victims).
        </p>
      </motion.div>

      {error && (
        <div style={{
          background: "#3d0000", border: "1px solid #ff4444", borderRadius: "12px",
          padding: "12px 16px", marginBottom: "20px", color: "#ff8888", fontSize: "14px",
        }}>⚠️ {error}</div>
      )}

      {!info && !error && (
        <div style={{ textAlign: "center", padding: "60px", color: colors.textSecondary }}>
          Loading metrics...
        </div>
      )}

      {info && (
        <>
          {/* ── Key metrics row */}
          {card(
            <>
              {sectionTitle("🎯", "Classification Performance (XGBoost, threshold=0.40)")}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <StatTile label="ROC-AUC"   value={m.xgb_auc ?? "–"}   sub="Area under ROC curve" color="#7c3aed" delay={0.05} />
                <StatTile label="PR-AUC"    value={m.pr_auc ?? "–"}    sub="Precision-Recall AUC" color="#06b6d4" delay={0.10} />
                <StatTile label="Precision" value={m.precision != null ? (m.precision * 100).toFixed(1) + "%" : "–"} sub="Of flagged txns, % truly fraud" color="#10b981" delay={0.15} />
                <StatTile label="Recall"    value={m.recall != null ? (m.recall * 100).toFixed(1) + "%" : "–"} sub="% of frauds caught" color="#f59e0b" delay={0.20} />
                <StatTile label="F1 Score"  value={m.f1_score != null ? (m.f1_score * 100).toFixed(2) + "%" : "–"}  sub="Harmonic mean P+R" color="#ef4444" delay={0.25} />
                <StatTile label="Accuracy*" value={m.accuracy != null ? (m.accuracy * 100).toFixed(2) + "%" : "–"} sub="(TP+TN) / Total" color="#64748b" delay={0.30} />
              </div>
              <p style={{ fontSize: "11px", color: "#888", marginTop: "14px", fontStyle: "italic" }}>
                ⚠️ Threshold 0.40 chosen to minimise false negatives — in fraud detection,
                missing a fraud (FN) is more costly than a false alarm (FP).
              </p>
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontStyle: "italic" }}>
                * Accuracy is intentionally de-emphasised: on imbalanced data (0.17% fraud rate),
                a model predicting <em>always safe</em> scores 99.83% accuracy —
                making it a misleading metric. <strong>Precision + Recall</strong> are the operationally meaningful measures.
              </p>
            </>,
            0.05
          )}

          {/* ── Confusion matrix */}
          {card(
            <>
              {sectionTitle("🧮", "Confusion Matrix (Test Set)", "#06b6d4")}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
                <CMCell label="True Positive"  val={cm.TP} color="#10b981" note="Fraud correctly flagged ✅" />
                <CMCell label="False Positive" val={cm.FP} color="#f59e0b" note="Legit incorrectly flagged ⚠️" />
                <CMCell label="False Negative" val={cm.FN} color="#ef4444" note="Fraud missed 🚨 (worst case)" />
                <CMCell label="True Negative"  val={cm.TN} color="#7c3aed" note="Legit correctly passed ✅" />
              </div>
              <div style={{
                padding: "12px 16px", borderRadius: "10px",
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#10b981" }}>
                  💰 Estimated Fraud Value Protected (Test Set)
                </span>
                <div style={{ fontSize: "22px", fontWeight: "900", color: "#10b981", marginTop: "4px" }}>
                  ₹{rupeesSaved.toLocaleString("en-IN")}
                  <span style={{ fontSize: "14px", fontWeight: "500", opacity: 0.7 }}> ({rupeesCrores} Cr)</span>
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                  {cm.TP?.toLocaleString()} frauds caught × ₹34,000 avg OTP fraud loss
                  <br />Source: <em>NCRB Annual Report 2023 (avg UPI fraud loss per victim)</em>
                </div>
              </div>
            </>,
            0.15
          )}

          {/* ── Dataset strategy */}
          {card(
            <>
              {sectionTitle("📁", "3-Dataset Strategy", "#f59e0b")}
              {[
                {
                  num: "①", color: "#7c3aed",
                  title: "CCF/Kaggle Proxy — ML Training",
                  body: `${ds.layer_1_proxy_training?.name ?? "Credit Card Fraud Detection (ULB/Kaggle)"} — ${ds.layer_1_proxy_training?.transactions?.toLocaleString() ?? "284,807"} transactions, ${ds.layer_1_proxy_training?.fraud_rate ?? "0.172%"} fraud rate.`,
                  note: ds.layer_1_proxy_training?.why_proxy,
                },
                {
                  num: "②", color: "#06b6d4",
                  title: "Government Data — Feature Design & Rule Calibration",
                  body: (ds.layer_2_government_data?.sources ?? []).join(" · "),
                  note: "NOT used for transaction-level ML training. Informs feature engineering and behavioral rules only.",
                  stats: ds.layer_2_government_data?.key_statistics_used,
                },
                {
                  num: "③", color: "#10b981",
                  title: "Synthetic UPI Dataset — Training Samples",
                  body: `${(m.n_train + m.n_test)?.toLocaleString() ?? "50,000"} seeded samples mirroring UPI P2P/P2M transaction patterns.`,
                  note: ds.layer_3_synthetic_upi?.generator,
                },
              ].map((d, i) => (
                <div key={i} style={{
                  display: "flex", gap: "14px", marginBottom: "14px",
                  paddingBottom: "14px",
                  borderBottom: i < 2 ? `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#eee"}` : "none",
                  alignItems: "flex-start",
                }}>
                  <span style={{
                    fontSize: "20px", fontWeight: "900", color: d.color,
                    flexShrink: 0, width: "28px",
                  }}>{d.num}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: d.color, marginBottom: "4px" }}>{d.title}</div>
                    <div style={{ fontSize: "12px", color: colors.textSecondary, marginBottom: "4px" }}>{d.body}</div>
                    {d.note && <div style={{ fontSize: "11px", color: "#888", fontStyle: "italic" }}>{d.note}</div>}
                    {d.stats && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                        {d.stats.map((s, j) => (
                          <span key={j} style={{
                            padding: "2px 8px", borderRadius: "5px", fontSize: "10px",
                            background: "rgba(6,182,212,0.1)", color: "#06b6d4",
                            border: "1px solid rgba(6,182,212,0.25)",
                          }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>,
            0.25
          )}

          {/* ── Disclaimers */}
          {card(
            <>
              {sectionTitle("⚖️", "Ethical Disclaimers", "#ef4444")}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(info.disclaimers ?? []).map((d, i) => (
                  <div key={i} style={{
                    padding: "8px 12px", borderRadius: "8px", fontSize: "12px",
                    background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                    color: isDark ? "#fca5a5" : "#991b1b", display: "flex", gap: "8px",
                  }}>
                    <span>⚠️</span><span>{d}</span>
                  </div>
                ))}
              </div>
            </>,
            0.35
          )}
        </>
      )}
    </div>
  );
}
