import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, portfolios, InsertPortfolio, holdings, InsertHolding, priceHistory, InsertPriceHistory, portfolioMetrics, InsertPortfolioMetrics } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Portfolio queries
 */
export async function getUserPortfolios(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolios).where(eq(portfolios.userId, userId));
}

export async function getPortfolioById(portfolioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(portfolios).where(eq(portfolios.id, portfolioId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPortfolio(portfolio: InsertPortfolio) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(portfolios).values(portfolio);
  return result;
}

export async function updatePortfolio(portfolioId: number, updates: Partial<InsertPortfolio>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(portfolios).set(updates).where(eq(portfolios.id, portfolioId));
}

export async function deletePortfolio(portfolioId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(portfolios).where(eq(portfolios.id, portfolioId));
}

/**
 * Holdings queries
 */
export async function getPortfolioHoldings(portfolioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(holdings).where(eq(holdings.portfolioId, portfolioId));
}

export async function getHoldingById(holdingId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(holdings).where(eq(holdings.id, holdingId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHolding(holding: InsertHolding) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(holdings).values(holding);
  return result;
}

export async function updateHolding(holdingId: number, updates: Partial<InsertHolding>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(holdings).set(updates).where(eq(holdings.id, holdingId));
}

export async function deleteHolding(holdingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(holdings).where(eq(holdings.id, holdingId));
}

/**
 * Price history queries
 */
export async function getPriceHistory(holdingId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(priceHistory).where(eq(priceHistory.holdingId, holdingId)).limit(limit);
}

export async function addPriceHistory(priceData: InsertPriceHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(priceHistory).values(priceData);
}

/**
 * Portfolio metrics queries
 */
export async function getLatestMetrics(portfolioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(portfolioMetrics)
    .where(eq(portfolioMetrics.portfolioId, portfolioId))
    .orderBy((t) => desc(t.date))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function saveMetrics(metrics: InsertPortfolioMetrics) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(portfolioMetrics).values(metrics);
}

// TODO: add additional feature queries here as your schema grows.
