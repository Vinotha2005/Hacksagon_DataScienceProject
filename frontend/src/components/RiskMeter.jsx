import { useEffect, useState } from "react";

export default function RiskMeter({ score, size = 200 }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  const r = (size / 2) * 0.75;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const startAngle = -225;
  const totalAngle = 270;
  const offset = circumference * (1 - (displayScore / 100) * (totalAngle / 360));

  const getColor = (s) => {
    if (s <= 30) return "#10B981";
    if (s <= 70) return "#F59E0B";
    return "#EF4444";
  };

  const getLabel = (s) => {
    if (s <= 30) return { text: "LOW RISK", color: "#10B981" };
    if (s <= 70) return { text: "MEDIUM RISK", color: "#F59E0B" };
    return { text: "HIGH RISK", color: "#EF4444" };
  };

  const color = getColor(displayScore);
  const label = getLabel(displayScore);

  const polarToCartesian = (angle) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (startDeg, endDeg) => {
    const s = polarToCartesian(startDeg);
    const e = polarToCartesian(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const bgPath = describeArc(-135, 135);
  const fgPath = describeArc(-135, -135 + (displayScore / 100) * 270);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="#1F2937" strokeWidth="12" strokeLinecap="round" />
        {/* Foreground arc */}
        <path d={fgPath} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "all 0.05s ease" }} />
        {/* Glow */}
        <path d={fgPath} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          style={{ opacity: 0.3, transition: "all 0.05s ease" }} />
        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill={color}
          fontSize={size * 0.22} fontWeight="800" fontFamily="Inter">
          {displayScore}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#6B7280"
          fontSize={size * 0.07} fontFamily="Inter">
          / 100
        </text>
      </svg>
      <span className="text-sm font-bold tracking-widest" style={{ color: label.color }}>
        {label.text}
      </span>
    </div>
  );
}
