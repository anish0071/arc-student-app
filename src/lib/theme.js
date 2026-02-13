import React, { createContext, useState, useEffect } from "react";

let AsyncStorage;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (_e) {
  AsyncStorage = null;
}

export const ThemeContext = createContext();

// PWA-aligned design tokens
export const lightTheme = {
  primary: "#7c3aed", // violet-600
  primaryDark: "#6d28d9", // violet-700
  secondary: "#6366f1", // indigo-500
  accent: "#f97316", // orange-500 (for highlights)
  background: "#fcfaff", // near-white with violet tint
  surface: "#ffffff",
  surfaceAlt: "#f8fafc", // slate-50
  text: "#1e293b", // slate-800
  textSecondary: "#64748b", // slate-500
  border: "#e2e8f0", // slate-200
  shadow: "#7c3aed",
  error: "#ef4444",
  success: "#22c55e",
};

export const darkTheme = {
  primary: "#8b5cf6", // violet-500
  primaryDark: "#7c3aed",
  secondary: "#a78bfa", // violet-400
  accent: "#fb923c", // orange-400
  background: "#0f0a1f",
  surface: "#1a1233",
  surfaceAlt: "#241a4a",
  text: "#f0e9ff",
  textSecondary: "#c4b5fd",
  border: "#3730a3",
  shadow: "#000",
  error: "#f87171",
  success: "#4ade80",
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    if (AsyncStorage) {
      try {
        const saved = await AsyncStorage.getItem("@arc_theme");
        if (saved) {
          setIsDark(saved === "dark");
        }
      } catch (_e) {
        // ignore
      }
    }
    setLoaded(true);
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem("@arc_theme", newValue ? "dark" : "light");
      } catch (_e) {
        // ignore
      }
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}
