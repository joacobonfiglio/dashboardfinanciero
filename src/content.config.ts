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
    /** Tres o cuatro ideas en una línea: salen arriba, en el bloque "En resumen". */
    clave: z.array(z.string()).min(2).max(5),
    /** Preguntas al final de la guía. Van también como FAQPage en el JSON-LD. */
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /** Temas de la guía, para articleSection y keywords. */
    temas: z.array(z.string()).default([]),
    servicio: z.enum(['web', 'google', 'medida']).optional(),
    destacada: z.boolean().default(false),
  }),
});

export const collections = { guias };
