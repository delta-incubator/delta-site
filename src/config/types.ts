import type { ComponentProps } from "astro/types";
import Icon from "@theme/components/Icon.astro";

/*
 * Collections
 */
import type { CollectionEntry } from "astro:content";

/** Collection types which qualify as "post" collections. */
export type Post = CollectionEntry<"blog" | "userStories">;

/** Collection types which have permalinks to static pages. */
export type PermalinkedCollection = CollectionEntry<
  "blog" | "userStories" | "profiles"
>;

/*
 * Compnoents
 */
type IconType = ComponentProps<typeof Icon>["icon"];

/*
 * Menus
 */
interface SingleMenuItem {
  label: string;
  url: string;
  icon?: IconType;
}

interface GroupMenuItem {
  label: string;
  items: SingleMenuItem[];
  icon?: IconType;
}

export type MenuItem = SingleMenuItem | GroupMenuItem;
