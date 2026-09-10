// Dados de contato. Troque aqui e o site inteiro acompanha.
export const site = {
  name: 'Henrique Araújo',
  // Formato internacional, só dígitos. Ex.: 5531999999999
  whatsapp: '5531971274639',
  email: 'henriquepinharaujo@gmail.com',
  city: 'Belo Horizonte',
  timezone: 'America/Sao_Paulo',
};

// Prefixa caminhos absolutos com a base do site (ex.: /portifolio/ no GitHub Pages).
export function url(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + path;
}

export function whatsappUrl(text: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
