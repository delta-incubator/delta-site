import type { AstroIntegration } from "astro";
import type { ConfigOptions } from "./configSchema";
import { makeViteVirtualImportPlugin } from "./utils/makeViteVirtualImportPlugin";

export const themePlugin = (config: ConfigOptions): AstroIntegration => {
  return {
    name: "delta-theme",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        /*
         * Prevent dependencies from being externalized. This avoids having to
         * re-import the dependencies inside the astro site.
         */
        updateConfig({
          vite: {
            ssr: {
              noExternal: [
                "@fontsource-variable/source-code-pro",
                "@fontsource/source-sans-pro",
                "astro-favicons",
              ],
            },
          },
        });

        /*
         * Expose theme config as a virtual import via vite plugin - this can
         * be used to import the theme's config within config files.
         */
        updateConfig({
          vite: {
            plugins: [
              makeViteVirtualImportPlugin(
                "delta-theme-config",
                "virtual:delta-theme/config",
                `export const config = ${JSON.stringify(config)}`,
              ),
            ],
          },
        });
      },
    },
  };
};
