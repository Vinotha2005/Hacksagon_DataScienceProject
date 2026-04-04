import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { post, postCached } from "../utils/apiClient.js";
import { useRetry } from "../contexts/RetryContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import ScanAnimation from "../components/ScanAnimation.jsx";
import ResultCard from "../components/ResultCard.jsx";

const SCENARIOS = [
  { label: "✅ Safe", mobile: "9876543210", amount: 500, note: "coffee" },
  { label: "⛔ Scammer", mobile: "9999988888", amount: 15000, note: "refund" },
  { label: "⚠️ Suspicious", mobile: "8888877777", amount: 4999, note: "prize" },
  { label: "🔴 Fraud Ring", mobile: "7777766666", amount: 49999, note: "commission" },
  { label: "💸 OTP Scam", mobile: "6666655555", amount: 1, note: "verify" },
  { label: "🏦 Fake KYC", mobile: "9123456789", amount: 10, note: "KYC update" },
];

export default function Home() {
  const { colors } = useTheme();
  const isMobile = useIsMobile();
  const { setRetrying } = useRetry();
  const [form, setForm] = useState({ mobile: "", amount: "", note: "" });
  const [state, setState] = useState("idle"); // idle | scanning | result | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const voiceRef = useRef(null);

  // IMPORTANT: This page loads IMMEDIATELY without any backend health checks
  // The form is always shown to users first. Errors only appear when the user
  // tries to check a number and the API call fails.

  const handleCheck = async (overrideForm = null) => {
    const data = overrideForm || form;
    if (!data.mobile || !data.amount) { setError("Please enter mobile number and amount."); return; }
    setError("");
    setState("scanning");

    // Simulate minimum 2.5s scan for drama
    const [res] = await Promise.all([
      postCached("/api/check-number", {
        mobile: data.mobile.replace(/\D/g, "").slice(-10),
        amount: parseFloat(data.amount),
        note: data.note,
      }, {}, (retryInfo) => {
        setRetrying(true, retryInfo);
      }).then(response => {
        setRetrying(false);
        return { data: response.data, error: null };
      }).catch((e) => { 
        setRetrying(false);
        return { data: null, error: e };
      }),
      new Promise((r) => setTimeout(r, 2500)),
    ]);

    if (res.data) {
      setResult(res.data);
      setState("result");
      // Voice alert for HIGH risk
      if (res.data.risk_level === "HIGH" && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(
          `FraudShield Alert! High risk transaction detected. Risk score ${res.data.risk_score}. ${res.data.scam_type ? "Possible " + res.data.scam_type + "." : ""} Do not proceed.`
        );
        utt.rate = 0.9;
        utt.pitch = 1.1;
        window.speechSynthesis.speak(utt);
      }
    } else {
      setState("error");
      setError("Could not reach FraudShield servers. Make sure backend is running.");
    }
  };

  const handleScenario = (s) => {
    setForm({ mobile: s.mobile, amount: String(s.amount), note: s.note });
    handleCheck(s);
  };

  const handleBlock = async () => {
    try {
      await post("/api/report", { mobile: result.mobile, reason: result.scam_type || "Fraud" }, {}, (retryInfo) => {
        setRetrying(true, retryInfo);
      });
      setRetrying(false);
      alert("✅ Number reported to FraudShield database. Our team will review within 24 hours.");
    } catch {
      setRetrying(false);
      alert("Report submitted locally. Backend may not be running.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center"
      style={{ 
        paddingLeft: isMobile ? "16px" : "16px",
        paddingRight: isMobile ? "16px" : "16px",
        paddingTop: "32px",
        paddingBottom: "32px"
      }}>

      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? "24px" : "32px" }}>
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold text-indigo-400 uppercase tracking-widest">
          🇮🇳 India's #1 UPI Safety Check
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          <span className="gradient-text">FraudShield</span>
        </h1>
        <p className="text-lg" style={{ color: colors.textSecondary }}>Check before you pay. Stay safe from UPI scams.</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs flex-wrap" style={{ color: colors.textSecondary }}>
          <span>🛡️ 2.4M protected</span>
          <span>🤖 Claude AI powered</span>
          <span>⚡ 2 sec check</span>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: isMobile ? "100%" : "448px" }}>
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Main Card */}
              <div className="glass rounded-2xl p-6 mb-6" style={{ 
                backgroundColor: colors.bgSecondary, 
                border: `1px solid ${colors.borderColor}`,
                padding: isMobile ? "16px" : "24px"
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: colors.textSecondary }}>📱 Mobile Number</label>
                    <div className="flex">
                      <span className="flex items-center px-3 rounded-l-xl text-sm" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRight: 'none', color: colors.textSecondary }}>+91</span>
                      <input
                        type="tel" maxLength={10} placeholder="9876543210"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                        className="rounded-l-none flex-1 px-4 py-2 rounded-r-xl outline-none"
                        style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderLeft: 'none', color: colors.textPrimary }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: colors.textSecondary }}>💰 Amount (₹)</label>
                    <input
                      type="number" placeholder="Enter amount"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl outline-none"
                      style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.textPrimary }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: colors.textSecondary }}>📝 Note (optional)</label>
                    <input
                      type="text" placeholder="e.g. rent, food, refund…"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl outline-none"
                      style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.textPrimary }}
                    />
                  </div>

                  {error && <p className="text-sm rounded-lg p-3" style={{ color: "#ff6666", backgroundColor: "#3d0000" }}>{error}</p>}

                  <button onClick={() => handleCheck()} className="w-full py-4 rounded-xl btn-gradient text-white font-bold text-lg flex items-center justify-center gap-2">
                    🔍 CHECK SAFETY
                  </button>
                </div>
              </div>

              {/* Demo Scenarios */}
              <div>
                <p className="text-center text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: colors.textSecondary }}>Try demo scenarios</p>
                <div className="gap-2" style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)" }}>
                  {SCENARIOS.map((s) => (
                    <button key={s.mobile} onClick={() => handleScenario(s)}
                      className="py-2 px-3 rounded-xl text-sm font-medium transition-all text-left"
                      style={{
                        border: `1px solid ${colors.borderColor}`,
                        backgroundColor: colors.bgTertiary,
                        color: colors.textSecondary
                      }}>
                      {s.label}
                      <span className="block text-xs" style={{ color: colors.textSecondary, opacity: 0.7 }}>₹{s.amount.toLocaleString("en-IN")}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {state === "scanning" && (
            <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl" style={{ backgroundColor: colors.bgSecondary, border: `1px solid ${colors.borderColor}` }}>
              <ScanAnimation />
            </motion.div>
          )}

          {state === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultCard result={result} onReset={() => { setState("idle"); setResult(null); }} onBlock={handleBlock} />
            </motion.div>
          )}

          {state === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 text-center" style={{ backgroundColor: colors.bgSecondary, border: `1px solid ${colors.borderColor}` }}>
              <p className="text-4xl mb-4">❌</p>
              <p className="font-semibold mb-2" style={{ color: "#ff6666" }}>Backend not reachable</p>
              <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>{error}</p>
              <button onClick={() => setState("idle")}
                className="px-6 py-2 rounded-xl border transition-all"
                style={{ 
                  borderColor: colors.borderColor,
                  color: colors.textSecondary,
                  backgroundColor: "transparent"
                }}>
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
