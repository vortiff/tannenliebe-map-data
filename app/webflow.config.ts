import { defineConfig } from "@webflow/api";

export default defineConfig({
  projects: {
    "tannenliebe-map-backend": {
      path: "/app",
      type: "web-app",
    }
  }
});