# delta-site

Code for the official delta.io site.

## Developer guide

### Getting started

Install dependencies and start the local development server:

```ts
pnpm i
YOUTUBE_API_KEY=<string> pnpm dev
```

### Helpful resources

- [Astro documentation](https://docs.astro.build/en/getting-started/) — guides, API reference, and more.
- [Tailwind v3 documentation](https://v3.tailwindcss.com/docs/) — for understanding the various classnames for styling.
- [YouTube Data API](https://developers.google.com/youtube/v3/docs) - for working with the YouTube API.
  — [Netlify documentation](https://docs.netlify.com/)

### Project structure

We mostly follow Astro's [standard project structure](https://docs.astro.build/en/basics/project-structure/). The most notable directory is the `src` folder, which includes the following folders:

- `src/components` - Contains various shared components. The "standard" component library is located directly in this folder, while page layouts are located in `src/components/layouts` and page-specific components are located in `src/components/pages`.
- `src/config` - Site configuration, which are "globals" for various things such as menus, site title, etc.
- `src/content` - Content collections. See below for how to use them.
- `src/pages` - Page routes. Astro uses this directory to generate the page routing structure.
- `src/utils` - Various utility functions used by different pages, including fetching data from the YouTube Data API.

### Content collections

We use Astro's [Content Collections API](https://docs.astro.build/en/guides/content-collections/) for managing dynamic data such as blog posts, profiles, user stories, etc. All of the different collections are defined in `src/content.config.ts`, and the related content data lives in `src/content`. Each collection definition has a [zod schema](https://zod.dev/) to make sure that the collections have the required properties needed to build the pages.

This section summarizes a few key points about Astro Content Collections. To learn more, read the [Content Collections API reference](https://docs.astro.build/en/reference/modules/astro-content/).

#### Working with collections

The Content Collections API provides a number of functions we can use to retrieve collections. You can use the [getCollection()](https://docs.astro.build/en/reference/modules/astro-content/#getcollection) function to retrieve a list of collection items.

```ts
import { getCollection } from "astro:content";

// Get all `src/content/blog/` entries
const posts = await getCollection("blog");
```

#### Generating static pages

You can dynamically generate static pages based off of a content collection when combined with a dynamic page template:

```astro
---
// src/pages/blog/[id].astro

import { getCollection, render } from "astro:content";

// 1. Generate a new path for every collection entry
export async function getStaticPaths() {
	const posts = await getCollection("blog");

	return posts.map((post) => ({
		params: { id: post.id },
		props: { post },
	}));
}

// 2. For your template, you can get the entry directly from the prop
const { post } = Astro.props;
const { Content } = await render(post);
---

<h1>{post.data.title}</h1>
<Content />
```

This will create a page at `/blog/hello-world` for a `blog` content item with `{ id: "hello-world" }`.
