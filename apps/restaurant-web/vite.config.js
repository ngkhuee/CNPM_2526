import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "shared-services": path.resolve(
        __dirname,
        "../../packages/shared-services/src"
      ),
      "shared-utils": path.resolve(
        __dirname,
        "../../packages/shared-utils/src"
      ),
      "shared-constants": path.resolve(
        __dirname,
        "../../packages/shared-constants/src"
      ),
      "shared-hooks": path.resolve(
        __dirname,
        "../../packages/shared-hooks/src"
      ),
      "shared-ui": path.resolve(__dirname, "../../packages/shared-ui/src"),
      "shared-contexts": path.resolve(
        __dirname,
        "../../packages/shared-contexts/src"
      ),
      "shared-styles": path.resolve(
        __dirname,
        "../../packages/shared-styles/src"
      ),
      "@api": path.resolve(__dirname, "../../packages/shared-services/src"),
      "@api/services": path.resolve(
        __dirname,
        "../../packages/shared-services/src/services"
      ),
      "@utils": path.resolve(__dirname, "../../packages/shared-utils/src"),
      "@utils/imageHelper": path.resolve(
        __dirname,
        "../../packages/shared-utils/src/imageHelper.js"
      ),
    },
  },
  server: {
    port: 3003,
  },
});
