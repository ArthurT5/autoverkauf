// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://autoverkauf.ch",

  // Swiss market — German is the default (unprefixed); French & Italian are
  // URL-prefixed (/fr, /it) for clean, indexable, SEO-friendly routes.
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de", "fr", "it"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});
