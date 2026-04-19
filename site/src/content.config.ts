import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const docsDir = path.resolve(fileURLToPath(import.meta.url), '../../../docs');

export const collections = {
  source: defineCollection({
    loader: glob({ pattern: '**/*.md', base: docsDir }),
    schema: z.object({
      title: z.string().optional(),
    }),
  }),
};
