// Local prod-mode debugging config (node adapter; mirrors SSR behaviour).
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  site: "https://autoverkauf.ch",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de", "fr", "it"],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  output: "static",
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
