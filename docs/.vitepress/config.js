import { defineConfig } from 'vitepress';

export default defineConfig({
  title: "Apex Engineer Docs",
  description: "Documentation for the Apex Engineer vehicle design & simulation platform",
  base: "/docs/",
  themeConfig: {
    siteTitle: "Apex Engineer",
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started" },
      { text: "Components", link: "/components" }
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/" },
          { text: "Getting Started", link: "/getting-started" }
        ]
      },
      {
        text: "Reference",
        items: [
          { text: "Components", link: "/components" }
        ]
      }
    ],
    footer: {
      message: "Built with VitePress",
      copyright: "© 2026 Apex Engineer"
    }
  }
});
