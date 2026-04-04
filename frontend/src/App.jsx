import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.jsx";
import { RetryProvider, useRetry } from "./contexts/RetryContext.jsx";
import Navbar, { LangProvider } from "./components/Navbar.jsx";
import RetryLoader from "./components/RetryLoader.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Heatmap from "./pages/Heatmap.jsx";
import Guardian from "./pages/Guardian.jsx";
import Predictor from "./pages/Predictor.jsx";
import SimulatorPage from "./pages/SimulatorPage.jsx";
import ModelMetricsPage from "./pages/ModelMetricsPage.jsx";
import { startKeepAlive } from "./utils/keepAlive.js";

function AppContent() {
  const { isDark, colors } = useTheme();
  const { retryState } = useRetry();
  const location = useLocation();

  useEffect(() => {
    // Wake up Render backend on load + keep alive every 10 min
    // Uses /ping endpoint — lightweight, no ML computation
    const stopKeepAlive = startKeepAlive();
    return stopKeepAlive;
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
      <RetryLoader isRetrying={retryState.isRetrying} retryInfo={retryState.retryInfo} />
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/guardian" element={<Guardian />} />
            <Route path="/predictor" element={<Predictor />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/metrics"   element={<ModelMetricsPage />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RetryProvider>
        <LangProvider>
          <AppContent />
        </LangProvider>
      </RetryProvider>
    </ThemeProvider>
  );
}