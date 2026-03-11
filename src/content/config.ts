import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    // slug removed; Astro will use entry slug from filename
    title: z.string(),
    date: z.coerce.date(), // lets you write "2024-06-17" in frontmatter
    author: z.string().default("GGP"),
    readTime: z.string().optional(),
    image: z.string().optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = { blog };