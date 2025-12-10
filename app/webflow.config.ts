import { defineConfig } from "@webflow/api";

export default defineConfig({
  name: "tannenliebe-map-backend",
  type: "web-app",

  // Define database bindings
  bindings: {
    DB: {
      type: "database",
      name: "tannenliebe_locations_db"
    }
  }
});