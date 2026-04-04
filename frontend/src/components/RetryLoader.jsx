/**
 * Retry Loading Overlay Component
 * Shows while API is retrying with visual feedback
 */
export default function RetryLoader({ isRetrying, retryInfo }) {
  if (!isRetrying) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)"
      }}
    >
      <div
        style={{
          textAlign: "center",
          backgroundColor: "#1a1a2e",
          borderRadius: "16px",
          padding: "48px 32px",
          border: "2px solid rgba(255, 68, 68, 0.3)",
          maxWidth: "400px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.9)"
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 24px",
            position: "relative"
          }}
        >
          {/* Outer ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "4px solid rgba(99, 102, 241, 0.2)",
              animation: "spin 1s linear infinite"
            }}
          />
          {/* Inner animated ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "4px solid transparent",
              borderTopColor: "#6366F1",
              borderRightColor: "#6366F1",
              animation: "spin 0.8s linear infinite"
            }}
          />
          {/* Center dot */}
          <div
            style={{
              position: "absolute",
              inset: "24px",
              borderRadius: "50%",
              backgroundColor: "#6366F1",
              opacity: 0.3
            }}
          />
        </div>

        {/* Text */}
        <h3
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "12px"
          }}
        >
          Connecting to servers...
        </h3>

        <p
          style={{
            color: "#d1d5db",
            fontSize: "14px",
            marginBottom: "20px",
            lineHeight: "1.6"
          }}
        >
          This may take up to 30 seconds on first load. Please wait.
        </p>

        {/* Retry info */}
        {retryInfo && (
          <div
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px"
            }}
          >
            <p
              style={{
                color: "#a5b4fc",
                fontSize: "12px",
                fontWeight: "500",
                margin: "0 0 4px 0"
              }}
            >
              ⟳ Attempt {retryInfo.attempt} of {retryInfo.maxAttempts}
            </p>
            <p
              style={{
                color: "#818cf8",
                fontSize: "12px",
                margin: 0
              }}
            >
              Retrying in {Math.ceil(retryInfo.nextRetryIn / 1000)}s
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            borderRadius: "2px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
              animation: "pulse-progress 2s ease-in-out infinite",
              width: "30%"
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-progress {
          0%, 100% { width: 30%; }
          50% { width: 70%; }
        }
      `}</style>
    </div>
  );
}
