import { useTheme } from "../context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-pressed={isDark}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="rounded-lg border px-3 py-1.5
                 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100
                 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700"
    >
      {isDark ? "☀️ Modo claro" : "🌙 Modo oscuro"}
    </button>
  );
}
