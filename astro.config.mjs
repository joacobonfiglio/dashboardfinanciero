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
    sitemap({ filter: (page) => !page.includes('/design') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
