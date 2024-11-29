import { writable } from "svelte/store";
import { ThemeUtils } from "svelte-tweakpane-ui";

export type Theme = "light" | "dark";

// Get initial theme from URL
const url = new URL(window.location.href);
const initialTheme = (url.searchParams.get("theme") as Theme) || "";

// Create the store
export const theme = writable<Theme>(initialTheme);

// Helper function to apply theme
function applyThemeToTweakpaneUI(newTheme: Theme) {
  if (newTheme === "dark") {
    ThemeUtils.setGlobalDefaultTheme(ThemeUtils.presets.jetblack);
  } else {
    ThemeUtils.setGlobalDefaultTheme(ThemeUtils.presets.light);
  }
}

// Helper function to update theme
export function updateTheme(newTheme: Theme) {
  applyThemeToTweakpaneUI(newTheme);
  theme.set(newTheme);
}

// Apply initial theme
applyThemeToTweakpaneUI(initialTheme);
