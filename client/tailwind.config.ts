/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{jsx,tsx}", "./*.html"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#7C3AED",
                    hover: "#6D28D9",
                    light: "#A78BFA",
                },
                secondary: {
                    DEFAULT: "#10B981",
                    hover: "#059669",
                    light: "#34D399",
                },
                background: {
                    DEFAULT: "#0F172A",
                    light: "#1E293B",
                    dark: "#020617",
                },
                surface: {
                    DEFAULT: "#1E293B",
                    light: "#334155",
                    dark: "#0F172A",
                },
                text: {
                    DEFAULT: "#F8FAFC",
                    secondary: "#94A3B8",
                    muted: "#64748B",
                },
                border: {
                    DEFAULT: "#334155",
                    light: "#475569",
                },
                success: "#10B981",
                error: "#EF4444",
                warning: "#F59E0B",
                info: "#3B82F6",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out forwards",
                "slide-up": "slideUp 0.4s ease-out forwards",
                "slide-down": "slideDown 0.4s ease-out forwards",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                slideDown: {
                    "0%": { transform: "translateY(-20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
            boxShadow: {
                "glow-sm": "0 0 10px rgba(124, 58, 237, 0.3)",
                "glow-md": "0 0 20px rgba(124, 58, 237, 0.4)",
                "glow-lg": "0 0 30px rgba(124, 58, 237, 0.5)",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
}
