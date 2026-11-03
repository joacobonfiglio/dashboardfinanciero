import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Guías en Markdown. Para sumar una, agregá un .md en src/content/guias/. */
const guias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guias' }),
  schema: z.object({
    title: z.string().max(60, 'El title no puede pasar de 60 caracteres'),
    description: z.string().max(158, 'La description no puede pasar de 158 caracteres'),
    h1: z.string(),
    kicker: z.string(),
    resumen: z.string(),
    fecha: z.coerce.date(),
    actualizada: z.coerce.date().optional(),
    lectura: z.number(),
    servicio: z.enum(['web', 'google', 'medida']).optional(),
    destacada: z.boolean().default(false),
  }),
});

export const collections = { guias };
