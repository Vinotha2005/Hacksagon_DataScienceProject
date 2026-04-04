import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { post } from "../utils/apiClient.js";
import { useRetry } from "../contexts/RetryContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

const DEMO_MEMBERS = [
  { id: 1, name: "Priya", relation: "Mother", mobile: "9876541230", avatar: "👩", lastSeen: "2 hours ago", status: "protected" },
  { id: 2, name: "Rahul", relation: "Son", mobile: "9988776655", avatar: "👦", lastSeen: "5 hours ago", status: "protected" },
];

const PENDING_TRANSACTION = {
  name: "Priya (Mom)",
  mobile: "98765 43210",
  amount: 4999,
  note: "KYC verification urgent",
  time: "11:47 PM",
  riskLevel: "HIGH",
  riskScore: 89,
  scamType: "Fake KYC Scam"
};

const HISTORY = [
  {
    id: 1,
    name: "Rahul (Brother)",
    recipient: "Zomato",
    amount: 500,
    status: "approved",
    time: "2 hours ago"
  },
  {
    id: 2,
    name: "Dad",
    recipient: "Unknown",
    amount: 15000,
    status: "blocked",
    reason: "Fake lottery scam",
    time: "Yesterday"
  }
];

export default function Guardian() {
  const { colors } = useTheme();
  const isMobile = useIsMobile();
  const { setRetrying } = useRetry();
  const [members, setMembers] = useState(DEMO_MEMBERS);
  const [form, setForm] = useState({ name: "", mobile: "", relation: "Parent" });
  const [alert, setAlert] = useState(null);
  const [notifResult, setNotifResult] = useState(null);
  const [transactionState, setTransactionState] = useState("pending"); // pending | blocked | approved

  const playBlockSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const handleBlock = () => {
    playBlockSound();
    setTransactionState("blocked");
  };

  const handleApprove = () => {
    setTransactionState("approved");
  };

  const handleReset = () => {
    setTransactionState("pending");
  };

  const addMember = () => {
    if (!form.name || !form.mobile) return;
    setMembers([...members, { id: Date.now(), ...form, avatar: "👤", lastSeen: "Just now", status: "protected" }]);
    setForm({ name: "", mobile: "", relation: "Parent" });
  };

  const simulateAlert = async (member) => {
    setAlert(member);
    try {
      const res = await post("/api/guardian/alert", {
        guardian_name: "You",
        member_name: member.name,
        mobile: member.mobile,
        amount: 50000
      }, {}, (retryInfo) => {
        setRetrying(true, retryInfo);
      });
      setNotifResult(res.data);
      setRetrying(false);
    } catch {
      setNotifResult({ success: true, alert_sent: true });
      setRetrying(false);
    }
  };

  const handleAlertApprove = () => { setAlert(null); setNotifResult(null); alert("✅ Transaction approved!"); };
  const handleAlertBlock = () => { setAlert(null); setNotifResult(null); alert("🚫 Transaction blocked and member notified!"); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px", backgroundColor: colors.bgPrimary }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontSize: isMobile ? "24px" : "30px",
          fontWeight: "900",
          marginBottom: "8px",
          color: colors.textPrimary
        }}>👨‍👩‍👧 Family Guardian Mode</h1>
        <p style={{
          color: colors.textSecondary,
          marginTop: "4px"
        }}>Protect your loved ones from UPI scams in real-time</p>
      </div>

      {/* PENDING TRANSACTION CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: transactionState === "blocked" 
            ? "linear-gradient(135deg, rgba(127, 29, 29, 0.3), rgba(220, 38, 38, 0.1))"
            : transactionState === "approved"
            ? "linear-gradient(135deg, rgba(20, 83, 45, 0.3), rgba(34, 197, 94, 0.1))"
            : "linear-gradient(135deg, rgba(120, 53, 15, 0.3), rgba(245, 158, 11, 0.1))",
          border: transactionState === "blocked"
            ? "2px solid rgba(220, 38, 38, 0.5)"
            : transactionState === "approved"
            ? "2px solid rgba(34, 197, 94, 0.5)"
            : "2px solid rgba(245, 158, 11, 0.5)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "32px",
          animation: transactionState === "pending" ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none"
        }}>
        
        {/* Status Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px"
        }}>
          <div style={{
            fontSize: "14px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: transactionState === "blocked"
              ? "#dc2626"
              : transactionState === "approved"
              ? "#22c55e"
              : "#f59e0b"
          }}>
            {transactionState === "pending" && "⚠️ PENDING APPROVAL"}
            {transactionState === "blocked" && "🛡️ PAYMENT BLOCKED"}
            {transactionState === "approved" && "✅ PAYMENT APPROVED"}
          </div>
          <span style={{
            fontSize: "12px",
            color: colors.textSecondary
          }}>
            {PENDING_TRANSACTION.time}
          </span>
        </div>

        {/* Main Message */}
        <div style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: colors.textPrimary,
          marginBottom: "8px"
        }}>
          {PENDING_TRANSACTION.name} wants to send <span style={{ color: "#f59e0b" }}>₹{PENDING_TRANSACTION.amount}</span>
        </div>

        {/* Note */}
        <div style={{
          fontSize: "14px",
          color: colors.isDark ? "#fca5a5" : "#cc0000",
          backgroundColor: colors.isDark ? "rgba(220, 38, 38, 0.1)" : "#fff0f0",
          padding: "8px 12px",
          borderRadius: "8px",
          marginBottom: "16px",
          borderLeft: "3px solid #dc2626"
        }}>
          📝 {PENDING_TRANSACTION.note}
        </div>

        {/* Risk Badge */}
        {transactionState === "pending" && (
          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "9999px",
            backgroundColor: colors.isDark ? "rgba(220, 38, 38, 0.2)" : "#cc0000",
            color: colors.isDark ? "#fca5a5" : "#ffffff",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "20px"
          }}>
            🚨 HIGH RISK — {PENDING_TRANSACTION.scamType}
          </div>
        )}

        {/* Status Message & Savings */}
        {transactionState === "blocked" && (
          <div style={{
            marginBottom: "20px",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: colors.isDark ? 'rgba(0,255,136,0.1)' : 'rgba(0,150,70,0.08)',
            border: `1px solid ${colors.isDark ? '#00ff88' : '#00aa55'}`
          }}>
            <div style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: colors.isDark ? '#00ff88' : '#006830',
              marginBottom: "8px"
            }}>
              🛡️ Payment Blocked! Priya has been notified.
            </div>
            <div style={{
              fontSize: "14px",
              color: colors.isDark ? '#00ff88' : '#006830'
            }}>
              You saved Priya from losing ₹{PENDING_TRANSACTION.amount} to a {PENDING_TRANSACTION.scamType}
            </div>
          </div>
        )}

        {transactionState === "approved" && (
          <div style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: colors.isDark ? '#00ff88' : '#006830',
            marginBottom: "20px",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: colors.isDark ? 'rgba(0,255,136,0.1)' : 'rgba(0,150,70,0.08)',
            border: `1px solid ${colors.isDark ? '#00ff88' : '#00aa55'}`
          }}>
            ✅ Payment Approved. Priya can proceed.
          </div>
        )}

        {/* Action Buttons or Badge */}
        {transactionState === "pending" ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "12px"
          }}>
            <button onClick={handleApprove} style={{
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "#22c55e",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              hover: { backgroundColor: "#16a34a" }
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#16a34a"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#22c55e"}
            >
              ✅ APPROVE
            </button>
            <button onClick={handleBlock} style={{
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "#dc2626",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#b91c1c"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#dc2626"}
            >
              🚫 BLOCK
            </button>
          </div>
        ) : (
          <div style={{
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: transactionState === "blocked" ? (colors.isDark ? 'rgba(255,0,0,0.3)' : '#cc0000') : (colors.isDark ? 'rgba(0,255,136,0.1)' : 'rgba(0,150,70,0.08)'),
            color: transactionState === "blocked" ? "#ffffff" : (colors.isDark ? '#00ff88' : '#006830'),
            fontWeight: "bold",
            fontSize: "14px",
            textAlign: "center",
            border: transactionState === "approved" ? `1px solid ${colors.isDark ? '#00ff88' : '#00aa55'}` : "none"
          }}>
            {transactionState === "blocked" ? "🛡️ Protected" : "✅ Approved"}
          </div>
        )}}

        {/* Reset Demo Button */}
        {transactionState !== "pending" && (
          <button onClick={handleReset} style={{
            width: "100%",
            marginTop: "12px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "transparent",
            color: "#9ca3af",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            e.target.style.color = "#d1d5db";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#9ca3af";
          }}
          >
            ↻ Reset Demo
          </button>
        )}
      </motion.div>

      {/* TRANSACTION HISTORY */}
      <div style={{
        marginBottom: "32px"
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: colors.textPrimary,
          marginBottom: "16px"
        }}>
          Transaction History
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {HISTORY.map((tx) => (
            <div key={tx.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px"
            }}>
              <div>
                <div style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: colors.textPrimary,
                  marginBottom: "4px"
                }}>
                  {tx.name} — ₹{tx.amount}
                </div>
                <div style={{
                  fontSize: "12px",
                  color: colors.textSecondary
                }}>
                  to {tx.recipient} {tx.reason ? `— ${tx.reason}` : ""}
                </div>
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px"
              }}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: tx.status === "approved" ? "#86efac" : "#fca5a5"
                }}>
                  {tx.status === "approved" ? "✅ Approved" : "⚠️ Blocked"}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "#6b7280"
                }}>
                  {tx.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protected Members Section */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: colors.textPrimary,
          marginBottom: "16px"
        }}>Protected Members</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {members.map((m) => (
            <motion.div key={m.id} layout
              style={{
                backgroundColor: colors.bgSecondary,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                border: "1px solid rgba(99, 102, 241, 0.2)"
              }}>
                {m.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "8px"
                }}>
                  <span style={{
                    fontWeight: "bold",
                    color: colors.textPrimary,
                    fontSize: "16px"
                  }}>
                    {m.name}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    color: "#a5b4fc",
                    padding: "2px 8px",
                    borderRadius: "999px"
                  }}>
                    {m.relation}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#86efac",
                    padding: "2px 8px",
                    borderRadius: "999px"
                  }}>
                    ✅ Protected
                  </span>
                </div>
                <p style={{
                  color: colors.textSecondary,
                  fontSize: "13px",
                  marginBottom: "4px"
                }}>
                  +91-{m.mobile.slice(0, 5)}XXXXX
                </p>
                <p style={{
                  color: colors.textSecondary,
                  fontSize: "12px"
                }}>
                  Last activity: {m.lastSeen}
                </p>
              </div>
              <button onClick={() => simulateAlert(m)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  color: "#fbbf24",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(245, 158, 11, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
                }}
              >
                🔔 Simulate Alert
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Member Form */}
      <div style={{
        backgroundColor: colors.bgSecondary,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: "16px",
        padding: "20px"
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: colors.textPrimary
        }}>Add Family Member</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input type="text" placeholder="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              border: `1px solid ${colors.inputBorder}`,
              backgroundColor: colors.inputBg,
              color: colors.textPrimary,
              fontSize: "14px"
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: "12px",
              paddingRight: "12px",
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              borderRight: "none",
              borderRadius: "12px 0 0 12px",
              color: colors.textSecondary,
              fontSize: "14px"
            }}>+91</span>
            <input type="tel" placeholder="Mobile number" value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "0 12px 12px 0",
                border: `1px solid ${colors.inputBorder}`,
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                fontSize: "14px"
              }}
            />
          </div>
          <select value={form.relation}
            onChange={(e) => setForm({ ...form, relation: e.target.value })}
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              border: `1px solid ${colors.inputBorder}`,
              backgroundColor: colors.inputBg,
              color: colors.textPrimary,
              fontSize: "14px",
              cursor: "pointer"
            }}>
            {["Parent", "Spouse", "Child", "Sibling", "Friend"].map((r) => (
              <option key={r} value={r} style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}>
                {r}
              </option>
            ))}
          </select>
          <button onClick={addMember}
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "#6366f1",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#4f46e5"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#6366f1"}
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Alert Modal */}
      <AnimatePresence>
        {alert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)"
            }}>
            <motion.div initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 40 }}
              style={{
                backgroundColor: "rgb(17, 24, 39)",
                border: "2px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "16px",
                padding: "24px",
                maxWidth: "448px",
                width: "100%",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <span style={{ fontSize: "48px", display: "block" }}>🚨</span>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "#f87171",
                  marginTop: "8px"
                }}>GUARDIAN ALERT</h3>
              </div>
              <div style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                textAlign: "center"
              }}>
                <p style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  Your <span style={{ color: "#f87171" }}>{alert.relation}</span> ({alert.name}) is attempting to send
                </p>
                <p style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  color: "white",
                  margin: "8px 0"
                }}>₹50,000</p>
                <p style={{
                  color: "#9ca3af"
                }}>to an <strong style={{ color: "#f87171" }}>unknown number</strong></p>
              </div>
              <div style={{
                backgroundColor: "rgb(10, 15, 30)",
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "24px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  marginBottom: "4px"
                }}>
                  <span style={{ color: "#9ca3af" }}>Risk Score</span>
                  <span style={{ color: "#f87171", fontWeight: "bold" }}>87/100 — HIGH RISK</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  marginTop: "4px"
                }}>
                  <span style={{ color: "#9ca3af" }}>Pattern Detected</span>
                  <span style={{ color: "#fbbf24", fontWeight: "600" }}>Possible OTP Fraud</span>
                </div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px"
              }}>
                <button onClick={handleAlertApprove}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    backgroundColor: "#22c55e",
                    color: "white",
                    fontWeight: "bold",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#16a34a"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#22c55e"}
                >
                  ✅ Approve
                </button>
                <button onClick={handleAlertBlock}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontWeight: "bold",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#b91c1c"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#dc2626"}
                >
                  🚫 Block
                </button>
              </div>
              <button onClick={() => { setAlert(null); setNotifResult(null); }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "transparent",
                  color: "#9ca3af",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  e.target.style.color = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#9ca3af";
                }}
              >
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </motion.div>
  );
}
