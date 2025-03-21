import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import favicons from "astro-favicons";
import { defineConfig, envField } from "astro/config";
import { remarkCustomDirectives } from "./lib/remarkCustomDirectives";
import { search } from "./lib/search";

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
  integrations: [
    tailwind(),
    search(),
    sitemap(),
    favicons({
      name: "Delta Lake",
      short_name: "Delta Lake",
      start_url: "/",
      background_color: "#042436",
      theme_color: "#00ADD4",
      icon_options: {
        purpose: "maskable",
      },
    }),
  ],
});
