import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const root = document.documentElement;

    // Set data-theme for our CSS variables
    root.dataset.theme = theme;

    // ✅ Tell the browser to render native controls in the right mode
    // (date pickers, select dropdowns, scrollbars, autofill, etc.)
    root.style.colorScheme = theme; // "light" | "dark"

    // ✅ Also on <body> for safety
    document.body.style.colorScheme = theme;

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);