import { describe, it, expect, beforeAll } from "vitest";
import { blogRouter } from "./blog";
import type { TrpcContext } from "../_core/context";

describe("Blog Router", () => {
  const adminContext = {
    user: {
      id: 1,
      role: "admin",
      openId: "admin-user",
      email: "admin@test.com",
      name: "Admin User",
      loginMethod: "manus",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  } as TrpcContext;

  const userContext = {
    user: {
      id: 2,
      role: "user",
      openId: "regular-user",
      email: "user@test.com",
      name: "Regular User",
      loginMethod: "manus",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  } as TrpcContext;

  it("should list blog articles", async () => {
    const caller = blogRouter.createCaller(userContext);
    const result = await caller.list({ limit: 10, offset: 0 });

    expect(result).toHaveProperty("articles");
    expect(Array.isArray(result.articles)).toBe(true);
  });

  it("should get featured articles", async () => {
    const caller = blogRouter.createCaller(userContext);
    const result = await caller.featured({ limit: 3 });

    expect(result).toHaveProperty("articles");
    expect(Array.isArray(result.articles)).toBe(true);
  });

  it("should search blog articles", async () => {
    const caller = blogRouter.createCaller(userContext);
    const result = await caller.search({ query: "portfolio" });

    expect(result).toHaveProperty("articles");
    expect(Array.isArray(result.articles)).toBe(true);
  });

  it("should get articles by category", async () => {
    const caller = blogRouter.createCaller(userContext);
    const result = await caller.getByCategory({ category: "Portfolio Management" });

    expect(result).toHaveProperty("articles");
    expect(Array.isArray(result.articles)).toBe(true);
  });

  it("should allow admin to create articles", async () => {
    const caller = blogRouter.createCaller(adminContext);
    const result = await caller.create({
      title: "Test Article",
      slug: "test-article-" + Date.now(),
      excerpt: "This is a test article",
      content: "# Test Article\n\nThis is the content of the test article.",
      category: "Portfolio Management",
      tags: "test, portfolio",
      author: "Test Author",
      featured: false,
      published: false,
    });

    expect(result).toHaveProperty("article");
    expect(result.article.title).toBe("Test Article");
  });

  it("should prevent non-admin from creating articles", async () => {
    const caller = blogRouter.createCaller(userContext);
    
    try {
      await caller.create({
        title: "Unauthorized Article",
        slug: "unauthorized-article",
        excerpt: "This should fail",
        content: "This should fail",
        category: "Test",
        published: false,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to update articles", async () => {
    const caller = blogRouter.createCaller(adminContext);
    
    // Create an article first
    const created = await caller.create({
      title: "Original Title",
      slug: "update-test-" + Date.now(),
      excerpt: "Original excerpt",
      content: "Original content",
      category: "Test",
      published: false,
    });

    // Update it
    const updated = await caller.update({
      id: created.article.id,
      title: "Updated Title",
    });

    expect(updated.article.title).toBe("Updated Title");
  });

  it("should allow admin to delete articles", async () => {
    const caller = blogRouter.createCaller(adminContext);
    
    // Create an article first
    const created = await caller.create({
      title: "Article to Delete",
      slug: "delete-test-" + Date.now(),
      excerpt: "Will be deleted",
      content: "Will be deleted",
      category: "Test",
      published: false,
    });

    // Delete it
    const result = await caller.delete({ id: created.article.id });
    expect(result.success).toBe(true);
  });
});
