import type { APIRoute } from 'astro';

// robots.txt gerado no build, pra apontar o sitemap no domínio certo (SITE_URL).
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
