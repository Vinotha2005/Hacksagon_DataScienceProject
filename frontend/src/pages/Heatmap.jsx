import { useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

const CITIES = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, scams: 487, risk: 'HIGH', trending: 147, topScams: ['OTP Fraud', 'Fake KYC', 'UPI Phishing'] },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, scams: 423, risk: 'HIGH', trending: 132, topScams: ['Fake IRCTC Refund', 'Investment Fraud', 'OTP Fraud'] },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, scams: 356, risk: 'HIGH', trending: 118, topScams: ['Job Offer Fraud', 'Loan App Scams', 'Fake KYC'] },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, scams: 298, risk: 'HIGH', trending: 95, topScams: ['Investment Fraud', 'OTP Fraud', 'Fake KYC'] },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, scams: 187, risk: 'MEDIUM', trending: 67, topScams: ['UPI Phishing', 'Fake KYC', 'Job Offer Fraud'] },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, scams: 234, risk: 'HIGH', trending: 89, topScams: ['Fake IRCTC Refund', 'OTP Fraud', 'Prize Scam'] },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, scams: 198, risk: 'HIGH', trending: 76, topScams: ['Investment Fraud', 'Loan App Scams', 'OTP Fraud'] },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, scams: 167, risk: 'HIGH', trending: 54, topScams: ['Fake KYC', 'OTP Fraud', 'Prize Scam'] },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, scams: 134, risk: 'MEDIUM', trending: 43, topScams: ['OTP Fraud', 'Fake KYC', 'Investment Fraud'] },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, scams: 112, risk: 'MEDIUM', trending: 38, topScams: ['Fake KYC', 'Prize Scam', 'OTP Fraud'] },
  { name: 'Surat', lat: 21.1702, lng: 72.8311, scams: 98, risk: 'MEDIUM', trending: 31, topScams: ['Investment Fraud', 'OTP Fraud', 'Fake KYC'] },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, scams: 76, risk: 'LOW', trending: 22, topScams: ['OTP Fraud', 'Fake KYC', 'Job Offer Fraud'] },
];

export default function Heatmap() {
  const { colors } = useTheme();
  const isMobile = useIsMobile();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Only initialize map once
    if (mapInstanceRef.current) return;

    try {
      // Wait for Leaflet to be loaded from CDN
      const L = window.L;
      if (!L) {
        console.error('Leaflet library not loaded');
        return;
      }

      // Create map
      const map = L.map(mapRef.current, { 
        attributionControl: true,
        zoomControl: true 
      }).setView([20.5937, 78.9629], 5);
      
      mapInstanceRef.current = map;

      // Add colorful OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add advanced CSS for popups and city labels
      if (!document.getElementById("heatmap-advanced-theme")) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "heatmap-advanced-theme";
        styleSheet.textContent = `
          .leaflet-popup-content-wrapper {
            background: #1a1a2e !important;
            color: #ffffff !important;
            border: 2px solid #ff4444 !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.8) !important;
          }
          .leaflet-popup-tip {
            background: #1a1a2e !important;
            border: 2px solid #ff4444 !important;
          }
          .leaflet-popup-close-button {
            color: #ffffff !important;
            font-size: 20px !important;
          }
          .leaflet-popup-content {
            font-family: system-ui, -apple-system, sans-serif !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
          }
          .city-label {
            background: rgba(0, 0, 0, 0.7);
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            pointer-events: none;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
          }
          @keyframes pulse-glow {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.1);
            }
          }
          .pulse-circle {
            animation: pulse-glow 2s ease-in-out infinite !important;
          }
        `;
        document.head.appendChild(styleSheet);
      }

      // Add cities to map with enhanced visuals
      const getRadius = (scams, risk) => {
        if (risk === 'HIGH') return scams * 180;
        if (risk === 'MEDIUM') return scams * 220;
        return scams * 180;
      };

      CITIES.forEach(city => {
        // Circle colors based on risk level
        const circleColors = city.risk === 'HIGH'
          ? { fill: '#ff2222', stroke: '#cc0000', fillOpacity: 0.55, weight: 2 }
          : city.risk === 'MEDIUM'
          ? { fill: '#ff8800', stroke: '#cc6600', fillOpacity: 0.55, weight: 2 }
          : { fill: '#00cc44', stroke: '#009933', fillOpacity: 0.55, weight: 2 };

        // Create solid circle with new radius calculation
        const circle = L.circle([city.lat, city.lng], {
          color: circleColors.stroke,
          fillColor: circleColors.fill,
          fillOpacity: circleColors.fillOpacity,
          weight: circleColors.weight,
          radius: getRadius(city.scams, city.risk)
        }).addTo(map);

        // Build popup content
        const popupContent = `
          <div style="min-width: 240px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">🏙️ ${city.name}</h3>
            <div style="border-bottom: 2px solid #444444; margin-bottom: 8px;"></div>
            <div style="color: #d1d5db; margin-bottom: 4px;">🚨 <strong>Scam Reports:</strong> ${city.scams}</div>
            <div style="color: #d1d5db; margin-bottom: 4px;">📈 <strong>Trending:</strong> ↑${city.trending}% this week</div>
            <div style="color: ${circleColors.fill}; margin-bottom: 12px; font-weight: 600;">⚠️ <strong>Risk Level:</strong> ${city.risk}</div>
            <div style="border-bottom: 1px solid #444444; margin-bottom: 8px;"></div>
            <div style="color: #fbbf24; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Top Scams This Week:</div>
            <div>
              ${city.topScams.map((scam, idx) => `
                <div style="color: #e5e7eb; font-size: 12px; padding-bottom: 4px; margin-bottom: 4px; border-bottom: ${idx < city.topScams.length - 1 ? '1px solid #333333' : 'none'};">
                  <strong>${idx + 1}. ${scam}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        circle.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'leaflet-popup-dark'
        });
      });

      // Force resize
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Cleanup function
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Get high alert cities and calculate stats
  const highAlert = CITIES.filter(c => c.risk === 'HIGH');
  const mediumAlert = CITIES.filter(c => c.risk === 'MEDIUM');
  const lowAlert = CITIES.filter(c => c.risk === 'LOW');
  const totalScams = CITIES.reduce((sum, c) => sum + c.scams, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="flex flex-col h-[calc(100vh-64px)]"
    >
      {/* Map Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        height: isMobile ? '400px' : '600px',
        width: '100%',
        backgroundColor: '#1a1a2e'
      }}>
        <div 
          ref={mapRef} 
          style={{
            height: '100%',
            width: '100%',
            borderRadius: '0'
          }}
        />

        {/* Stats Overlay - Top Right */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '12px 16px',
          zIndex: 1000,
          minWidth: '220px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 12px 0'
          }}>
            Risk Statistics
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff0000', boxShadow: '0 0 8px #ff6b6b' }} />
              <span style={{ color: '#1f2937', fontSize: '13px', fontWeight: '600' }}>
                HIGH: <span style={{ color: '#ff0000', fontWeight: '700' }}>{highAlert.length}</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff8c00', boxShadow: '0 0 8px #ffd700' }} />
              <span style={{ color: '#1f2937', fontSize: '13px', fontWeight: '600' }}>
                MEDIUM: <span style={{ color: '#ff8c00', fontWeight: '700' }}>{mediumAlert.length}</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00cc44', boxShadow: '0 0 8px #90ee90' }} />
              <span style={{ color: '#1f2937', fontSize: '13px', fontWeight: '600' }}>
                LOW: <span style={{ color: '#00cc44', fontWeight: '700' }}>{lowAlert.length}</span>
              </span>
            </div>
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #e0e0e0',
              color: '#ff8c00',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              🇮🇳 {totalScams.toLocaleString()} active scams
            </div>
          </div>
        </div>
      </div>

      {/* Legend - Upgraded */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '2px solid #e0e0e0',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: '24px',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', flex: 1 }}>
          {[
            { level: 'HIGH', color: '#ff0000', glow: '#ff6b6b' },
            { level: 'MEDIUM', color: '#ff8c00', glow: '#ffd700' },
            { level: 'LOW', color: '#00cc44', glow: '#90ee90' }
          ].map(({ level, color, glow }) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 12px ${glow}`,
                border: '2px solid rgba(255, 255, 255, 0.5)'
              }} />
              <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{level}</span>
            </div>
          ))}
          <span style={{ fontSize: '12px', color: '#666666' }}>• Circle size = scam volume</span>
        </div>


      </div>

      <style>{`
        @keyframes smooth-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes blink {
          0%, 49%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .city-label-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </motion.div>
  );
}
