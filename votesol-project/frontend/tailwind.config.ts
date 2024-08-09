import type { Config } from "tailwindcss";
import daisyui from "daisyui"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  daisyui: {
    themes: [
      {
        web3theme: {
          "primary": "#6366f1",      // Indigo: for primary actions and highlights
          "secondary": "#8b5cf6",    // Purple: for secondary actions
          "accent": "#14b8a6",       // Teal: for accents and highlights
          "neutral": "#1f2937",      // Dark gray: for neutral elements
          "base-100": "#111827",     // Very dark gray: main background
          "info": "#3b82f6",         // Blue: for informational elements
          "success": "#10b981",      // Green: for success messages
          "warning": "#f59e0b",      // Amber: for warnings
          "error": "#ef4444",        // Red: for errors

          "--rounded-box": "0.25rem",        // Border radius for cards and larger elements
          "--rounded-btn": "0.25rem",        // Border radius for buttons
          "--rounded-badge": "1.9rem",       // Border radius for badges
          "--animation-btn": "0.25s",        // Button click animation time
          "--animation-input": "0.2s",       // Input focus animation time
          "--btn-text-case": "uppercase",    // Button text transform
          "--btn-focus-scale": "0.95",       // Button focus scale
          "--border-btn": "1px",             // Button border width
          "--tab-border": "1px",             // Tab border width
          "--tab-radius": "0.5rem",          // Tab border radius
        },
      },
    ],
  },

  plugins: [
    daisyui,
  ],
};
export default config;
