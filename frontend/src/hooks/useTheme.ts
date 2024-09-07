import { useState } from "react";

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState("dark");
  const toggleTheme = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.toggle('light');
      rootElement.classList.toggle('dark');
      setCurrentTheme(currentTheme === "dark" ? "light" : "dark");
    }
  };

  return {
    toggleTheme,
    currentTheme
  };
}