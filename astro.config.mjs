import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import { stripTrailingSlash } from "./src/lib/url-format.js";

const SITEMAP_EXCLUDED_PATHS = new Set([
  "/cart",
  "/thank-you",
  "/contact-success",
  "/ops-notifications",
]);

export default defineConfig({
  site: "https://greatgusproductions.com",
  trailingSlash: "always",
  output: "server",
  adapter: netlify(),
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = stripTrailingSlash(new URL(page, "https://greatgusproductions.com").pathname);
        return !SITEMAP_EXCLUDED_PATHS.has(pathname);
      },
    }),
  ],
});

// Keep server output + Netlify adapter.
// This site uses API routes for Stripe checkout/webhooks and will break if switched to static.