import { defineConfig } from "@webflow/api";

export default defineConfig({
  name: "tannenliebe-map-backend",
  type: "web-app",

  // Qui diciamo a Webflow Cloud che vogliamo un DB
  bindings: {
    DB: {
      type: "database",
      name: "tannenliebe_locations_db"
    }
  }
});