/** @type {import('tailwindcss').Config} */
module.exports = {
  // IMPORTANT: preflight is disabled to avoid resetting the styles used by the
  // existing Bootstrap / Reactstrap / MUI / mdbreact pages. New components in
  // src/components/ui/ rely only on explicit utility classes, not on the reset.
  corePlugins: {
    preflight: false,
  },

  // Scope Tailwind to the new component locations only. We do NOT want Tailwind
  // to scan the legacy pages because their existing class names are not Tailwind.
  content: [
    "./src/components/ui/**/*.{js,jsx}",
    "./src/components/PatientLayout/PatientAppLayout.jsx",
    "./src/pages/DoctorLogin/**/*.{js,jsx}",
    "./src/pages/PatientHome/**/*.{js,jsx}",
    "./src/pages/PatientLogin/**/*.{js,jsx}",
    "./src/pages/PatientHistoryPage/**/*.{js,jsx}",
  ],

  // Add `dadh-` prefix optional? No — kept simple. Conflicts with Bootstrap class
  // names should be rare given we scope content above.
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      // DADH "Modern Healthcare" teal palette — Option B
      // To change the palette: update hex values here AND the --dadh-* vars in tailwind.css
      colors: {
        border:     "#D1E8E8",
        input:      "#D1E8E8",
        ring:       "#0D7377",
        background: "#FAFFFE",
        foreground: "#111E1F",
        primary: {
          DEFAULT:    "#0D7377",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT:    "#E6F4F4",
          foreground: "#0D4F52",
        },
        destructive: {
          DEFAULT:    "#EF4444",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT:    "#22C55E",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT:    "#E6F4F4",
          foreground: "#4B7172",
        },
        accent: {
          DEFAULT:    "#14B8A6",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT:    "#FFFFFF",
          foreground: "#111E1F",
        },
      },
      borderRadius: {
        lg: "var(--dadh-radius)",
        md: "calc(var(--dadh-radius) - 2px)",
        sm: "calc(var(--dadh-radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
