# Oblique

Site da Oblique, empresa de sites de Henrique Araújo. No ar em https://obliqueweb.pages.dev. Estático, em Astro,
português em `/` e inglês em `/en/`.

## Rodar

```
npm install
npm run dev
```

Abre em `http://localhost:4321`.

## Publicar

Hospedado no Cloudflare Pages (projeto `obliqueweb`), ligado a este repositório. Todo push na
`main` roda `npm run build` e publica `dist/` sozinho. Cabeçalhos HTTP ficam em `public/_headers`.

## Onde mexer

| Quero mudar...               | Arquivo                          |
| ---------------------------- | -------------------------------- |
| Número do WhatsApp, e-mail   | `src/config.ts`                  |
| Textos em português          | `src/content/pt.ts`              |
| Textos em inglês             | `src/content/en.ts`              |
| Cores, fontes, animações     | `src/styles/global.css`          |
| Estrutura da home            | `src/components/Home.astro`      |
| Página Sobre                 | `src/components/About.astro`     |
| Cabeçalho, rodapé, scripts   | `src/layouts/Layout.astro`       |
| Foto                         | `public/henrique.jpg` (4:5) e `public/henrique-rosto.jpg` |
| Ícone da tela inicial        | `public/apple-touch-icon.png`, `public/icon-*.png` |

## Estado

- [x] Repositório criado
- [x] Briefing respondido (`docs/briefing.md`)
- [x] Direção de design definida
- [x] Primeira versão navegável
- [x] Número da empresa no WhatsApp
- [x] Foto
- [x] Publicação (Cloudflare Pages, com deploy a cada push)
- [ ] Seção de trabalhos (entra quando os sites de demonstração existirem)
- [ ] Domínio próprio
