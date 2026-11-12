import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL vem do Cloudflare Pages; BASE_PATH só se o site for servido numa subpasta.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://obliqueweb.pages.dev',
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'pt', locales: { pt: 'pt-BR', en: 'en' } },
    }),
  ],
});
