import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("fraudshield-theme");
    return saved ? JSON.parse(saved) : true; // Default: dark mode
  });

  useEffect(() => {
    localStorage.setItem("fraudshield-theme", JSON.stringify(isDark));
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      bgPrimary: "#0d0d1a",
      bgSecondary: "#1a1a2e",
      bgTertiary: "#111827",
      textPrimary: "#ffffff",
      textSecondary: "#9ca3af",
      navBg: "#0d0d1a",
      navBorder: "#1F2937",
      statCardBg: "#1a1a2e",
      statCardShadow: "0 4px 6px rgba(0,0,0,0.3)",
      chartBg: "#111827",
      inputBg: "#111827",
      inputBorder: "#374151",
      borderColor: "#1F2937",
    } : {
      bgPrimary: "#f5f5f5",
      bgSecondary: "#ffffff",
      bgTertiary: "#fafafa",
      textPrimary: "#1a1a2e",
      textSecondary: "#555555",
      navBg: "#ffffff",
      navBorder: "#e0e0e0",
      statCardBg: "#ffffff",
      statCardShadow: "0 2px 8px rgba(0,0,0,0.08)",
      chartBg: "#ffffff",
      inputBg: "#f0f0f0",
      inputBorder: "#d0d0d0",
      borderColor: "#e0e0e0",
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
