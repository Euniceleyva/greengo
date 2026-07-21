import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          soft: "hsl(var(--destructive-soft))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          soft: "hsl(var(--info-soft))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          soft: "hsl(var(--success-soft))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          soft: "hsl(var(--warning-soft))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        "surface-soft": "hsl(var(--surface-soft))",
        "primary-soft": "hsl(var(--primary-soft))",
        brand: {
          green: "hsl(var(--brand-green))",
          orange: "hsl(var(--brand-orange))",
          blue: "hsl(var(--brand-blue))",
          lime: "hsl(var(--brand-lime))",
        },
        /* Sistema visual público (Landing / Reservar / Pago / Destinos). No usado en /admin ni /driver. */
        tropical: {
          primary: "hsl(var(--brand-primary))",
          "primary-light": "hsl(var(--brand-primary-light))",
          secondary: "hsl(var(--brand-secondary))",
          "secondary-light": "hsl(var(--brand-secondary-light))",
          accent: "hsl(var(--brand-accent))",
          dark: "hsl(var(--brand-dark))",
          deep: "hsl(var(--brand-deep))",
          surface: "hsl(var(--brand-surface))",
          background: "hsl(var(--brand-background))",
          text: "hsl(var(--brand-text))",
          muted: "hsl(var(--brand-muted))",
          border: "hsl(var(--brand-border))",
          card: "hsl(var(--brand-card))",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        /* Tipografía del sistema público */
        urbanist: ["var(--font-urbanist)", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      backgroundImage: {
        "gradient-tropical": "var(--brand-gradient-tropical)",
        "gradient-caribe": "var(--brand-gradient-caribe)",
        "gradient-deep": "var(--brand-gradient-deep)",
        "gradient-sun": "var(--brand-gradient-sun)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      boxShadow: {
        soft: "0 1px 2px hsl(var(--shadow-color) / 0.04), 0 2px 8px hsl(var(--shadow-color) / 0.06)",
        card: "0 1px 2px hsl(var(--shadow-color) / 0.05), 0 4px 14px hsl(var(--shadow-color) / 0.07)",
        popover: "0 8px 24px hsl(var(--shadow-color) / 0.14)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
