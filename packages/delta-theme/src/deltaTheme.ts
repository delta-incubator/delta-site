import path from "path";
import { fileURLToPath } from "url";
import tailwind from "@astrojs/tailwind";
import favicons from "astro-favicons";
import type { AstroIntegration } from "astro";
import { themePlugin } from "./themePlugin";
import type { ConfigOptions as ThemeConfig } from "./configSchema";
import { searchPlugin } from "./searchPlugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create a virtual module for astro-favicons middleware to prevent loading errors
 */
const createFaviconsVirtualPlugin = () => {
  return {
    name: "virtual-favicons-middleware",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (id === "astro-favicons/middleware") {
        return "\0virtual:favicons-middleware";
      }
    },
    load(id: string) {
      if (id === "\0virtual:favicons-middleware") {
        return `// Virtual favicons middleware
export function localizedHTML(locale) { 
  return ""; 
}
export default function(context, next) {
  return next();
}`;
      }
    },
  };
};

export const deltaTheme = (config: ThemeConfig): AstroIntegration[] => {
  const { title } = config;

  // Create a separate integration for virtual modules
  const virtualModulesIntegration: AstroIntegration = {
    name: "delta-virtual-modules-integration",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [createFaviconsVirtualPlugin()],
            ssr: {
              noExternal: [
                "@fontsource-variable/source-code-pro",
                "@fontsource/source-sans-pro",
                "astro-favicons",
              ],
            },
          },
        });
      },
    },
  };

  return [
    virtualModulesIntegration,
    themePlugin(config),
    tailwind({
      configFile: path.resolve(__dirname, "./tailwind.config.ts"),
    }),
    searchPlugin(),
    favicons({
      name: title,
      short_name: title,
      background: "#042436",
      themes: ["#00ADD4"],
    }),
  ];
};
