import { z } from "zod";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "../_core/trpc";
import {
  getBlogArticles,
  getFeaturedArticles,
  getBlogArticleBySlug,
  searchBlogArticles,
  getArticlesByCategory,
  createBlogArticle,
  updateBlogArticle,
  deleteBlogArticle,
} from "../db/blog";

export const blogRouter = router({
  // Public procedures
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const articles = await getBlogArticles(input.limit, input.offset);
      return { articles };
    }),

  featured: publicProcedure
    .input(z.object({ limit: z.number().default(3) }))
    .query(async ({ input }) => {
      const articles = await getFeaturedArticles(input.limit);
      return { articles };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const article = await getBlogArticleBySlug(input.slug);
      if (!article) {
        throw new Error("Article not found");
      }
      return { article };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const articles = await searchBlogArticles(input.query);
      return { articles };
    }),

  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const articles = await getArticlesByCategory(input.category);
      return { articles };
    }),

  // Admin procedures
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        category: z.string().min(1),
        tags: z.string().optional(),
        author: z.string().optional(),
        featured: z.boolean().default(false),
        published: z.boolean().default(false),
        publishedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const article = await createBlogArticle({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        category: input.category,
        tags: input.tags,
        author: input.author,
        featured: input.featured ? 1 : 0,
        published: input.published ? 1 : 0,
        publishedAt: input.publishedAt,
      });
      return { article };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        author: z.string().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        publishedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const article = await updateBlogArticle(id, {
        ...updates,
        featured: updates.featured !== undefined ? (updates.featured ? 1 : 0) : undefined,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : undefined,
      });
      return { article };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const success = await deleteBlogArticle(input.id);
      return { success };
    }),
});
