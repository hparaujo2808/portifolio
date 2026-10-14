import { defineConfig } from 'astro/config';

// SITE_URL vem do Cloudflare Pages; BASE_PATH só se o site for servido numa subpasta.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://obliqueweb.pages.dev',
  base,
  output: 'static',
  trailingSlash: 'always',
});
