// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Static output: Render serves the built `dist/` folder as a static site.
  output: "static",
  // `/projects/` style URLs work on every static host without rewrites.
  trailingSlash: "always",
  integrations: [react()],
});
