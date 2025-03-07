import type { MenuItem } from "./types";

interface SiteConfig {
  title: string;
  googleAnalyticsId: string;
  menus: {
    header: MenuItem[];
    footerMain: MenuItem[];
    footerLearn: MenuItem[];
    footerCommunity: MenuItem[];
    social: MenuItem[];
  };
  youtubeChannelId: string;
}

export const site: SiteConfig = {
  title: "Delta Lake",
  googleAnalyticsId: "GTM-P3C8QXQ",
  menus: {
    header: [
      { label: "Sharing", url: "/sharing" },
      { label: "Integrations", url: "/integrations" },
      {
        label: "Learn",
        items: [
          { label: "Getting Started", url: "/learn/getting-started" },
          { label: "Blogs", url: "/blog" },
          { label: "Tutorials", url: "/learn/tutorials" },
          { label: "Videos", url: "/learn/videos" },
          { label: "Case Studies", url: "/user-stories" },
        ],
      },
      { label: "Roadmap", url: "/roadmap" },
      { label: "Community", url: "/community" },
      { label: "Docs", url: "https://delta-docs-staging.netlify.app/latest/" },
    ],
    footerMain: [
      {
        url: "/sharing",
        label: "Sharing",
      },
      {
        url: "/integrations",
        label: "Integrations",
      },
      {
        url: "/roadmap",
        label: "Roadmap",
      },
      {
        url: "/blog",
        label: "Blogs",
      },
    ],
    footerLearn: [
      {
        label: "Getting Started",
        url: "/learn/getting-started",
      },
      {
        label: "Blogs",
        url: "/blog",
      },
      {
        label: "Tutorials",
        url: "/learn/tutorials/",
      },
      {
        label: "Videos",
        url: "/learn/videos/",
      },
      {
        label: "Case Studies",
        url: "/user-stories",
      },
    ],
    footerCommunity: [
      {
        url: "/community",
        label: "Community",
      },
      {
        url: "/resources/getting-help",
        label: "Getting Help",
      },
      {
        url: "/resources/contributing-to-delta",
        label: "Contributing to Delta",
      },
    ],
    social: [
      {
        label: "StackOverflow",
        url: "https://stackoverflow.com/questions/tagged/delta-lake",
        icon: "stackOverflow",
      },
      {
        label: "GitHub",
        url: "https://go.delta.io/github",
        icon: "github",
      },
      {
        label: "Twitter",
        url: "https://go.delta.io/twitter",
        icon: "twitter",
      },
      {
        label: "Slack",
        url: "https://go.delta.io/slack",
        icon: "slack",
      },
      {
        label: "LinkedIn",
        url: "https://go.delta.io/linkedin",
        icon: "linkedin",
      },
    ],
  },
  youtubeChannelId: "UCSKhDO79MNcX4pIIRFD0UVg",
};
