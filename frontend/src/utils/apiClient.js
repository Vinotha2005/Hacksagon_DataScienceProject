import axios from "axios";

const BACKEND_URL = "https://hacksagon-datascienceproject.onrender.com";
const LOCAL_BACKEND = "http://localhost:8000";
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds
const TIMEOUT = 30000; // 30 seconds

// ── Offline Demo Cache ──────────────────────────────────────────────────────
// Caches the last successful API response per endpoint+payload key.
// Serves stale data during demo WiFi failures instead of crashing the UI.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = "fraudshield_cache_";

function _cacheKey(url, data) {
  try { return CACHE_PREFIX + url + "_" + JSON.stringify(data); }
  catch { return CACHE_PREFIX + url; }
}

function _saveCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage full — silently ignore */ }
}

function _loadCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch { return null; }
}
// ────────────────────────────────────────────────────────────────────────────

// Determine backend URL
const getBackendURL = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return LOCAL_BACKEND;
  }
  return BACKEND_URL;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: getBackendURL(),
  timeout: TIMEOUT,
});

/**
 * Retry wrapper for API calls
 * Automatically retries 3 times with 5 second delays
 */
export const apiCallWithRetry = async (
  fn,
  attempt = 1,
  onRetry = null
) => {
  try {
    return await fn();
  } catch (error) {
    if (attempt < RETRY_ATTEMPTS) {
      // Call the onRetry callback if provided
      if (onRetry) {
        onRetry({
          attempt,
          maxAttempts: RETRY_ATTEMPTS,
          nextRetryIn: RETRY_DELAY
        });
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

      // Recursive retry
      return apiCallWithRetry(fn, attempt + 1, onRetry);
    } else {
      // All retries exhausted
      throw new Error(
        "Connecting to servers... This may take up to 30 seconds on first load. Please wait."
      );
    }
  }
};

/**
 * Wrapped GET request with retry logic
 */
export const get = async (url, config = {}, onRetry = null) => {
  return apiCallWithRetry(
    () => axiosInstance.get(url, config),
    1,
    onRetry
  );
};

/**
 * Wrapped POST request with retry logic
 */
export const post = async (url, data = {}, config = {}, onRetry = null) => {
  return apiCallWithRetry(
    () => axiosInstance.post(url, data, config),
    1,
    onRetry
  );
};

/**
 * Wrapped PUT request with retry logic
 */
export const put = async (url, data = {}, config = {}, onRetry = null) => {
  return apiCallWithRetry(
    () => axiosInstance.put(url, data, config),
    1,
    onRetry
  );
};

/**
 * Wrapped DELETE request with retry logic
 */
export const del = async (url, config = {}, onRetry = null) => {
  return apiCallWithRetry(
    () => axiosInstance.delete(url, config),
    1,
    onRetry
  );
};

/**
 * Cache-aware POST — saves successful responses to localStorage.
 * Falls back to cache if backend is unreachable (demo WiFi protection).
 */
export const postCached = async (url, data = {}, config = {}, onRetry = null) => {
  const key = _cacheKey(url, data);
  try {
    const res = await apiCallWithRetry(
      () => axiosInstance.post(url, data, config),
      1,
      onRetry
    );
    // Save fresh result to cache
    _saveCache(key, res.data);
    return res;
  } catch (err) {
    // Network failure — try to serve cached result
    const cached = _loadCache(key);
    if (cached) {
      console.warn("[FraudShield] Backend unreachable — serving cached result for demo.");
      return { data: { ...cached, is_cached: true, cache_note: "Result from last successful check (demo offline mode)" } };
    }
    throw err;
  }
};

/**
 * Keep-alive ping to prevent backend from sleeping
 * Should be called every 14 minutes
 * This function is NON-BLOCKING and fails silently - never awaited
 */
export const keepAlive = () => {
  // Fire-and-forget - never block the app, no await
  axiosInstance
    .get("/", { timeout: 8000 })
    .then(() => {
      console.log("[KeepAlive] Backend pinged successfully");
    })
    .catch(() => {
      // Silently fail - this is just a background maintenance ping
    });
};

export default axiosInstance;
