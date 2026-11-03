import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://trakadigital.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    icon(),
    // Las páginas legales van con noindex: fuera del sitemap.
    // Sin lastmod: poner la fecha del build en todas las páginas es un dato falso
    // (no cambiaron todas) y Google ignora el lastmod del sitio entero cuando no es fiable.
    sitemap({ filter: (page) => !page.includes('/legales/') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
