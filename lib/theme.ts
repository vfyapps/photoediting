export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "vfy-theme";

// Inline script, injected before hydration so the theme applies on first
// paint. Runs as a plain string (no imports) because it executes outside
// the React tree, in <head>, before any bundle loads.
export const themeInitScript = `(function(){try{var stored=localStorage.getItem("${THEME_STORAGE_KEY}");var dark=stored==="dark"||(stored!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;

export function applyTheme(preference: ThemePreference) {
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  if (preference === "system") {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }
}

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}
