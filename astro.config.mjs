import sitemap from "@astrojs/sitemap";
import { defineConfig, envField } from "astro/config";
import { remarkCustomDirectives } from "./lib/remarkCustomDirectives";
import { deltaTheme } from "./lib/delta-theme";

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
    remarkPlugins: [...remarkCustomDirectives],
  },
  image: {
    domains: [],
    formats: ["png", "jpg", "jpeg", "webp", "gif", "svg"],
  },
  integrations: [sitemap(), deltaTheme({ name: "Delta Lake" })],
});
