import { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext(null);

function applyTheme(next) {
  const root = document.documentElement;
  if (next === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    localStorage.setItem("theme_v1", next);
  } catch {}
  // Log útil para verificar
  console.log("[Theme] aplicado:", next, "| html.classList:", root.className);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme_v1") || "light";
    } catch {
      return "light";
    }
  });

  // Aplica SIEMPRE en cada render (antes que useEffect)
  if (typeof document !== "undefined") {
    applyTheme(theme);
  }

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      applyTheme(next); // aplica y persiste inmediatamente
      return next;
    });
  };

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider/>");
  return ctx;
}
