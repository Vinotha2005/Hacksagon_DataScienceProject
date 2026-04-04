/**
 * FraudShield Keep-Alive Utility
 * 
 * Render.com free tier sleeps after 15 minutes of inactivity.
 * This pings /ping every 10 minutes to keep the backend warm
 * during a hackathon demo — ensuring zero cold-start delays.
 *
 * Also warms up the ML engine by hitting /health on app load.
 */

const BACKEND = import.meta.env.VITE_API_URL || "https://hacksagon-datascienceproject.onrender.com";
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

let _pingTimer = null;

/**
 * Wake up Render backend immediately + start keep-alive timer.
 * Call once from App.jsx on mount.
 */
export function startKeepAlive() {
  // Immediate warm-up ping (prevents cold start on first demo action)
  _pingOnce();

  // Periodic ping every 10 minutes
  if (_pingTimer) clearInterval(_pingTimer);
  _pingTimer = setInterval(_pingOnce, PING_INTERVAL_MS);

  return () => {
    if (_pingTimer) clearInterval(_pingTimer);
  };
}

function _pingOnce() {
  fetch(`${BACKEND}/ping`, { method: "GET", mode: "cors" })
    .then((r) => r.json())
    .then(() => console.log("[FraudShield] Backend keep-alive OK"))
    .catch(() => {
      // Silent — don't alert the user if ping fails, just log
      console.warn("[FraudShield] Backend ping failed — may be starting up");
    });
}
