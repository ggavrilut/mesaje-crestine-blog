// Schema of content/ (docs/content-model.md). Imported posts (with `legacyUrl`) may lack a
// cover, and wait for the post writer's pass for description, cover alt text and related
// posts (docs/specs/wordpress-import.md); new posts need all of them.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { youtubeId } from './lib/youtube.ts';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase ASCII words joined by hyphens');

const posts = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './content/posts',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        slug,
        seoTitle: z.string().optional(),
        description: z.string().default(''),
        date: z.coerce.date(),
        updated: z.coerce.date().optional(),
        author: z.union([reference('authors'), z.array(reference('authors'))]).transform((a) => (Array.isArray(a) ? a : [a])),
        cover: image().optional(),
        coverAlt: z.string().default(''),
        video: z.url().refine((u) => youtubeId(u), 'a YouTube link').optional(),
        source: z.string().optional(),
        pdf: z.string().regex(/^\.\/[a-z0-9]+(-[a-z0-9]+)*\.pdf$/, './<lowercase-name>.pdf, in the post folder').optional(),
        sourceDoc: z.url().optional(),
        related: z.array(reference('posts')).max(4).default([]),
        legacyUrl: z.url().optional(),
        draft: z.boolean().default(false),
      })
      .superRefine((post, ctx) => {
        const need = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
        if (!post.draft && post.author.length === 0) need('author', 'at least one author');
        if (post.description && (post.description.length < 120 || post.description.length > 155)) {
          need('description', `120-155 characters, got ${post.description.length}`);
        }
        if (post.legacyUrl) return;
        if (!post.cover) need('cover', 'required');
        if (!post.coverAlt) need('coverAlt', 'required');
        if (!post.description) need('description', 'required');
        if (post.related.length < 2) need('related', '2-4 posts');
      }),
});

const authors = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      slug,
      bio: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Crop of the round portrait: sharp's gravity (`top`, `left top`…) or strategy (`attention`). */
      imagePosition: z.string().default('attention'),
    }),
});

export const collections = { posts, authors };
