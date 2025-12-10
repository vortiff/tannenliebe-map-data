import { defineConfig } from "@webflow/api";

export default defineConfig({
  name: "tannenliebe-map-backend",
  type: "web-app",

  // Declare a SQLite database
  bindings: {
    DB: {
      type: "database",
      name: "tannenliebe_locations_db"
    }
  }
});