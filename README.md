# Portfolio

Site pessoal de Henrique Araújo para apresentar trabalho e vender sites. Estático, em Astro,
português em `/` e inglês em `/en/`.

## Rodar

```
npm install
npm run dev
```

Abre em `http://localhost:4321`. `npm run build` gera a pasta `dist/` pronta pra Vercel ou
GitHub Pages.

## Onde mexer

| Quero mudar...               | Arquivo                          |
| ---------------------------- | -------------------------------- |
| Número do WhatsApp, e-mail   | `src/config.ts`                  |
| Textos em português          | `src/content/pt.ts`              |
| Textos em inglês             | `src/content/en.ts`              |
| Cores, fontes, animações     | `src/styles/global.css`          |
| Estrutura da página          | `src/components/Home.astro`      |
| Cabeçalho, rodapé, scripts   | `src/layouts/Layout.astro`       |
| Foto                         | `public/henrique.jpg` (4:5)      |

## Estado

- [x] Repositório criado
- [x] Briefing respondido (`docs/briefing.md`)
- [x] Direção de design definida
- [x] Primeira versão navegável
- [ ] Número real do WhatsApp em `src/config.ts`
- [ ] Foto em `public/henrique.jpg`
- [ ] Seção de trabalhos (entra quando os sites de demonstração existirem)
- [ ] Domínio e publicação
