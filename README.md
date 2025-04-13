# delta-site

Code for the official delta.io site.

## Developer guide

### Getting started

Install dependencies and start the local development server:

```ts
pnpm i
YOUTUBE_API_KEY=<string> pnpm --filter delta-site dev
```

### Helpful resources

- [Astro documentation](https://docs.astro.build/en/getting-started/) — guides, API reference, and more.
- [Tailwind v3 documentation](https://v3.tailwindcss.com/docs/) — for understanding the various classnames for styling.
- [YouTube Data API](https://developers.google.com/youtube/v3/docs) - for working with the YouTube API.
  — [Netlify documentation](https://docs.netlify.com/)

### Project structure

We use a monorepo pattern to separate individual packages. We currently have two packages:

- delta-site - The delta.io website source code
- delta-theme - The underlying theme used by delta-site

#### delta-site

We mostly follow Astro's [standard project structure](https://docs.astro.build/en/basics/project-structure/). The most notable directory is the `src` folder, which includes the following folders:

- `src/components` - Contains various shared components. The "standard" component library is located directly in this folder, while page layouts are located in `src/components/layouts` and page-specific components are located in `src/components/pages`.
- `src/config` - Site configuration, which are "globals" for various things such as menus, site title, etc.
- `src/content` - Content collections. See below for how to use them.
- `src/pages` - Page routes. Astro uses this directory to generate the page routing structure.
- `src/utils` - Various utility functions used by different pages, including fetching data from the YouTube Data API.
