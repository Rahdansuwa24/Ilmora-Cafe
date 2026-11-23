export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        espresso: "#6F4E37",
        espressodark: "#5A3E2B",
        deepbrown: "#5C3D28",
        darkbar: "#3E2718",
        iceblue: "#DCE6F7",
        mist: "#EEF2FA",
        peri: "#2B92C4",
        peridark: "#2279A3",
        charcoal: "#1E2432",
        mutedslate: "#64748B"
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 8px 30px rgba(30,36,50,0.08)",
        card: "0 4px 20px rgba(30,36,50,0.06)"
      }
    }
  },
  plugins: []
};
