import { defineConfig } from "@webflow/api";

export default defineConfig({
  name: "tannenliebe-map-backend",
  type: "web-app",

  bindings: {
    DB: {
      type: "database",
      name: "tannenliebe_locations_db"
    }
  }
});