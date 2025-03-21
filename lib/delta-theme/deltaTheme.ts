import tailwind from "@astrojs/tailwind";
import favicons from "astro-favicons";
import type { AstroIntegration } from "astro";
import path from "path";
import { searchPlugin } from "./searchPlugin";
import { fileURLToPath } from "url";

interface ThemeConfig {
  /** site name */
  name: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const deltaTheme = (config: ThemeConfig): AstroIntegration[] => {
  const { name } = config;

  return [
    tailwind({
      configFile: path.resolve(__dirname, "./tailwind.config.ts"),
    }),
    searchPlugin(),
    favicons({
      name,
      short_name: name,
      background: "#042436",
      themes: ["#00ADD4"],
    }),
  ];
};
