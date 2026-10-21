// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://portfolio-d79q.onrender.com",
  // Static output: Render serves the built `dist/` folder as a static site.
  output: "static",
  // `/projects/` style URLs work on every static host without rewrites.
  trailingSlash: "always",
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
