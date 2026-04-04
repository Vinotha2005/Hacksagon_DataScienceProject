import { useEffect, useState } from "react";

const messages = [
  "Checking scam database...",
  "Analyzing UPI patterns...",
  "Consulting Claude AI...",
  "Generating risk report...",
];

export default function ScanAnimation() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
    }, 600);

    const progInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        return p + Math.random() * 8;
      });
    }, 150);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 px-6">
      {/* Shield with rings */}
      <div className="relative flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="absolute rounded-full border border-indigo-500/30"
            style={{
              width: 80 + i * 50,
              height: 80 + i * 50,
              animation: `ring-pulse ${1 + i * 0.3}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }} />
        ))}
        {/* Shield icon */}
        <div className="relative z-10 w-20 h-20 rounded-full btn-gradient flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30">
          🛡️
        </div>
      </div>

      {/* Scanning bar */}
      <div className="w-full max-w-sm">
        <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(progress, 95)}%`,
              background: "linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)",
            }} />
        </div>
        <p className="text-center text-indigo-300 font-semibold text-lg animate-pulse">
          {messages[msgIdx]}
        </p>
        <p className="text-center text-gray-500 text-sm mt-2">
          Powered by Claude AI • Takes ~2 seconds
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-indigo-400"
            style={{ animation: `ring-pulse 1s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}
