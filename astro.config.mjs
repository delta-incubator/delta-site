import sitemap from "@astrojs/sitemap";
import { defineConfig, envField } from "astro/config";
import { deltaTheme, remarkPlugins } from "./lib/delta-theme";

// https://astro.build/config
export default defineConfig({
  site: "https://delta-io-staging.netlify.app/",
  scopedStyleStrategy: "where",
  env: {
    schema: {
      YOUTUBE_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
    validateSecrets: true,
  },
  markdown: {
    remarkPlugins,
  },
  image: {
    domains: [],
    formats: ["png", "jpg", "jpeg", "webp", "gif", "svg"],
  },
  integrations: [sitemap(), deltaTheme({ name: "Delta Lake" })],
});
