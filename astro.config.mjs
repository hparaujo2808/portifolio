import { defineConfig } from 'astro/config';

// Em produção o workflow injeta SITE_URL e BASE_PATH (GitHub Pages serve em
// /portifolio/). Com domínio próprio, BASE_PATH volta a ser vazio.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://henrique-araujo.netlify.app',
  base,
  output: 'static',
  trailingSlash: 'always',
});
