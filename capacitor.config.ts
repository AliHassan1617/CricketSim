import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cricketsim.app",
  appName: "CricketSim",
  webDir: "dist",
  android: {
    backgroundColor: "#09090b",
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
