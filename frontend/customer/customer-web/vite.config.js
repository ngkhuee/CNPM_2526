import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../../shared"),
      "@api": path.resolve(__dirname, "../../shared/api"),
      "@utils": path.resolve(__dirname, "../../shared/utils"),
      "@styles": path.resolve(__dirname, "../../shared/styles"),
    },
  },
  server: {
    port: 3002,
  },
});
