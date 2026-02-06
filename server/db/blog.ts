import { eq, desc, and, like } from "drizzle-orm";
import { getDb } from "../db";
import { blogArticles } from "../../drizzle/schema";
import type { InsertBlogArticle, BlogArticle } from "../../drizzle/schema";

export async function createBlogArticle(article: InsertBlogArticle): Promise<BlogArticle> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blogArticles).values(article);
  const inserted = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.id, result[0].insertId))
    .limit(1);

  return inserted[0]!;
}

export async function getBlogArticles(limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.published, 1))
    .orderBy(desc(blogArticles.publishedAt)) as any;

  if (limit) {
    query = query.limit(limit);
  }
  if (offset) {
    query = query.offset(offset);
  }

  return query;
}

export async function getFeaturedArticles(limit: number = 3) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(blogArticles)
    .where(and(eq(blogArticles.published, 1), eq(blogArticles.featured, 1)))
    .orderBy(desc(blogArticles.publishedAt))
    .limit(limit);
}

export async function getBlogArticleBySlug(slug: string): Promise<BlogArticle | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(blogArticles)
    .where(and(eq(blogArticles.slug, slug), eq(blogArticles.published, 1)))
    .limit(1);

  return result[0];
}

export async function searchBlogArticles(query: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(blogArticles)
    .where(
      and(
        eq(blogArticles.published, 1),
        like(blogArticles.title, `%${query}%`)
      )
    )
    .orderBy(desc(blogArticles.publishedAt));
}

export async function getArticlesByCategory(category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(blogArticles)
    .where(and(eq(blogArticles.category, category), eq(blogArticles.published, 1)))
    .orderBy(desc(blogArticles.publishedAt));
}

export async function updateBlogArticle(
  id: number,
  updates: Partial<InsertBlogArticle>
): Promise<BlogArticle | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(blogArticles).set(updates).where(eq(blogArticles.id, id));

  const result = await db.select().from(blogArticles).where(eq(blogArticles.id, id)).limit(1);
  return result[0];
}

export async function deleteBlogArticle(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(blogArticles).where(eq(blogArticles.id, id));
  return true;
}
