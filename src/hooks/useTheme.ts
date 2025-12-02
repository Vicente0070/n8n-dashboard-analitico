import { useState, useEffect } from "react";
import { config } from "@/config";

type Theme = "dark" | "light";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("dashboard-theme");
    return (stored as Theme) || config.DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    
    localStorage.setItem("dashboard-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, setTheme, toggleTheme };
};
