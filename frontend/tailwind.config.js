/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./constants/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            start: "#7A5FFF",
            end: "#01C4FF",
          },
          secondary: "#FF7E67",
          accent: "#45B6FE",
          muted: {
            bg: "#F9FAFB",
            text: "#6B7280",
          },
          dark: {
            DEFAULT: "#111827",
            navy: "#0F172A",
          },
          border: "#E5E7EB",
          lightBlue: "#E0E7FF",
          lime: "#B2F5EA",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
          light: "var(--success-light)",
          dark: "var(--success-dark)",
        },
        emerald: {
          DEFAULT: "var(--emerald)",
          light: "var(--emerald-light)",
          dark: "var(--emerald-dark)",
        },
        teal: {
          light: "var(--teal-light)",
          medium: "var(--teal-medium)",
          dark: "var(--teal-dark)",
        },
        "ai-blue": {
          DEFAULT: "var(--ai-blue)",
          light: "var(--ai-blue-light)",
          dark: "var(--ai-blue-dark)",
          accent: "var(--ai-blue-accent)",
          hover: "var(--ai-blue-hover)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        heading: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
} 