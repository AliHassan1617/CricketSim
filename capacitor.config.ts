import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.myukijarret.cricketmanager",
  appName: "Cricket Manager",
  webDir: "dist",
  android: {
    backgroundColor: "#09090b",
    allowMixedContent: true,
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#09090b",
      overlaysWebView: true,
    },
    EdgeToEdge: {
      backgroundColor: "#09090b",
    },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
