import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// @modules agrupa los dominios de negocio (machinery, rentals, users, providers, fields...),
// @core la infraestructura transversal (Supabase, UI kit, utils), @app el shell de la SPA.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": fileURLToPath(new URL("./src/app", import.meta.url)),
      "@core": fileURLToPath(new URL("./src/core", import.meta.url)),
      "@modules": fileURLToPath(new URL("./src/modules", import.meta.url)),
      "@store": fileURLToPath(new URL("./src/store", import.meta.url)),
    },
  },
});
