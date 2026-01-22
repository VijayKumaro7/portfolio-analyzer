import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  users,
  portfolios,
  holdings,
  priceHistory,
} from "../drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    // Demo user data
    const demoUsers = [
      {
        openId: "demo-user-1",
        name: "Alice Johnson",
        email: "alice@demo.com",
        loginMethod: "demo",
        role: "user",
      },
      {
        openId: "demo-user-2",
        name: "Bob Smith",
        email: "bob@demo.com",
        loginMethod: "demo",
        role: "user",
      },
      {
        openId: "demo-user-3",
        name: "Carol Williams",
        email: "carol@demo.com",
        loginMethod: "demo",
        role: "user",
      },
    ];

    // Insert demo users
    console.log("📝 Creating demo users...");
    const insertedUsers = [];
    for (const user of demoUsers) {
      try {
        const result = await db.insert(users).values(user);
        insertedUsers.push({ ...user, id: result[0].insertId });
      } catch (error) {
        // User already exists, fetch it
        if (error.cause?.code === "ER_DUP_ENTRY") {
          console.log(`⚠️  User ${user.openId} already exists, skipping...`);
          const [rows] = await connection.execute(
            "SELECT * FROM users WHERE openId = ?",
            [user.openId]
          );
          if (rows.length > 0) {
            insertedUsers.push({ ...user, id: rows[0].id });
          }
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Created/Found ${insertedUsers.length} demo users`);

    // Demo portfolios
    const portfolioData = [
      {
        userId: insertedUsers[0].id,
        name: "Tech Growth Portfolio",
        description: "Focused on high-growth technology stocks",
      },
      {
        userId: insertedUsers[0].id,
        name: "Dividend Income Portfolio",
        description: "Stable dividend-paying stocks and ETFs",
      },
      {
        userId: insertedUsers[1].id,
        name: "Crypto & Digital Assets",
        description: "Cryptocurrency and blockchain investments",
      },
      {
        userId: insertedUsers[1].id,
        name: "Balanced Portfolio",
        description: "Mix of stocks, bonds, and real estate",
      },
      {
        userId: insertedUsers[2].id,
        name: "Index Fund Portfolio",
        description: "Low-cost index fund diversification",
      },
    ];

    console.log("📊 Creating demo portfolios...");
    const insertedPortfolios = [];
    for (const portfolio of portfolioData) {
      const result = await db.insert(portfolios).values(portfolio);
      insertedPortfolios.push({ ...portfolio, id: result[0].insertId });
    }
    console.log(`✅ Created ${insertedPortfolios.length} demo portfolios`);

    // Demo holdings
    const holdingsData = [
      // Alice's Tech Growth Portfolio
      {
        portfolioId: insertedPortfolios[0].id,
        symbol: "AAPL",
        name: "Apple Inc.",
        assetType: "stock",
        quantity: "50",
        purchasePrice: "150.00",
        purchaseDate: new Date("2023-01-15"),
        notes: "Core tech holding",
      },
      {
        portfolioId: insertedPortfolios[0].id,
        symbol: "MSFT",
        name: "Microsoft Corporation",
        assetType: "stock",
        quantity: "30",
        purchasePrice: "300.00",
        purchaseDate: new Date("2023-03-20"),
        notes: "Cloud computing exposure",
      },
      {
        portfolioId: insertedPortfolios[0].id,
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        assetType: "stock",
        quantity: "20",
        purchasePrice: "400.00",
        purchaseDate: new Date("2023-06-10"),
        notes: "AI and GPU leader",
      },
      {
        portfolioId: insertedPortfolios[0].id,
        symbol: "TSLA",
        name: "Tesla Inc.",
        assetType: "stock",
        quantity: "15",
        purchasePrice: "250.00",
        purchaseDate: new Date("2023-09-05"),
        notes: "EV and energy",
      },

      // Alice's Dividend Income Portfolio
      {
        portfolioId: insertedPortfolios[1].id,
        symbol: "JNJ",
        name: "Johnson & Johnson",
        assetType: "stock",
        quantity: "100",
        purchasePrice: "160.00",
        purchaseDate: new Date("2022-06-01"),
        notes: "Healthcare dividend",
      },
      {
        portfolioId: insertedPortfolios[1].id,
        symbol: "PG",
        name: "Procter & Gamble",
        assetType: "stock",
        quantity: "75",
        purchasePrice: "140.00",
        purchaseDate: new Date("2022-08-15"),
        notes: "Consumer staples",
      },
      {
        portfolioId: insertedPortfolios[1].id,
        symbol: "VYM",
        name: "Vanguard High Dividend Yield ETF",
        assetType: "fund",
        quantity: "200",
        purchasePrice: "110.00",
        purchaseDate: new Date("2022-10-01"),
        notes: "Dividend ETF",
      },

      // Bob's Crypto Portfolio
      {
        portfolioId: insertedPortfolios[2].id,
        symbol: "BTC",
        name: "Bitcoin",
        assetType: "crypto",
        quantity: "0.5",
        purchasePrice: "45000.00",
        purchaseDate: new Date("2023-02-01"),
        notes: "Digital gold",
      },
      {
        portfolioId: insertedPortfolios[2].id,
        symbol: "ETH",
        name: "Ethereum",
        assetType: "crypto",
        quantity: "5",
        purchasePrice: "2500.00",
        purchaseDate: new Date("2023-03-15"),
        notes: "Smart contract platform",
      },
      {
        portfolioId: insertedPortfolios[2].id,
        symbol: "SOL",
        name: "Solana",
        assetType: "crypto",
        quantity: "100",
        purchasePrice: "150.00",
        purchaseDate: new Date("2023-05-20"),
        notes: "High-speed blockchain",
      },

      // Bob's Balanced Portfolio
      {
        portfolioId: insertedPortfolios[3].id,
        symbol: "VOO",
        name: "Vanguard S&P 500 ETF",
        assetType: "fund",
        quantity: "100",
        purchasePrice: "420.00",
        purchaseDate: new Date("2022-01-01"),
        notes: "S&P 500 index",
      },
      {
        portfolioId: insertedPortfolios[3].id,
        symbol: "BND",
        name: "Vanguard Total Bond Market ETF",
        assetType: "fund",
        quantity: "150",
        purchasePrice: "80.00",
        purchaseDate: new Date("2022-02-01"),
        notes: "Bond diversification",
      },
      {
        portfolioId: insertedPortfolios[3].id,
        symbol: "VNQ",
        name: "Vanguard Real Estate ETF",
        assetType: "fund",
        quantity: "50",
        purchasePrice: "95.00",
        purchaseDate: new Date("2022-03-01"),
        notes: "Real estate exposure",
      },

      // Carol's Index Fund Portfolio
      {
        portfolioId: insertedPortfolios[4].id,
        symbol: "VTI",
        name: "Vanguard Total Stock Market ETF",
        assetType: "fund",
        quantity: "500",
        purchasePrice: "200.00",
        purchaseDate: new Date("2021-01-01"),
        notes: "Total US market",
      },
      {
        portfolioId: insertedPortfolios[4].id,
        symbol: "VXUS",
        name: "Vanguard Total International Stock ETF",
        assetType: "fund",
        quantity: "300",
        purchasePrice: "65.00",
        purchaseDate: new Date("2021-02-01"),
        notes: "International exposure",
      },
      {
        portfolioId: insertedPortfolios[4].id,
        symbol: "BND",
        name: "Vanguard Total Bond Market ETF",
        assetType: "fund",
        quantity: "200",
        purchasePrice: "80.00",
        purchaseDate: new Date("2021-03-01"),
        notes: "Bond allocation",
      },
    ];

    console.log("💼 Creating demo holdings...");
    const insertedHoldings = [];
    for (const holding of holdingsData) {
      const result = await db.insert(holdings).values(holding);
      insertedHoldings.push({ ...holding, id: result[0].insertId });
    }
    console.log(`✅ Created ${insertedHoldings.length} demo holdings`);

    // Generate price history for the past 30 days
    console.log("📈 Generating price history...");
    const priceHistoryData = [];
    const basePrices = {
      AAPL: 190,
      MSFT: 380,
      NVDA: 875,
      TSLA: 242,
      JNJ: 160,
      PG: 165,
      VYM: 115,
      VOO: 480,
      BND: 82,
      VNQ: 98,
      VTI: 240,
      VXUS: 68,
    };

    for (const holding of insertedHoldings) {
      let price = basePrices[holding.symbol] || parseFloat(holding.purchasePrice);
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Add random fluctuation
        const change = (Math.random() - 0.5) * 4; // ±2% daily
        price = Math.max(price + change, price * 0.8);

        priceHistoryData.push({
          holdingId: holding.id,
          symbol: holding.symbol,
          price: parseFloat(price.toFixed(2)),
          date,
        });
      }
    }

    // Insert price history in batches
    for (let i = 0; i < priceHistoryData.length; i += 100) {
      const batch = priceHistoryData.slice(i, i + 100);
      await db.insert(priceHistory).values(batch);
    }
    console.log(`✅ Created ${priceHistoryData.length} price history records`);

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📋 Demo Accounts Created:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    insertedUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   OpenID: ${user.openId}`);
      const userPortfolios = insertedPortfolios.filter(
        (p) => p.userId === user.id
      );
      console.log(`   Portfolios: ${userPortfolios.length}`);
      userPortfolios.forEach((p) => {
        console.log(`   - ${p.name}`);
      });
    });
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

seedDatabase();
