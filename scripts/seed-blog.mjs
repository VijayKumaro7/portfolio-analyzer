import { drizzle } from "drizzle-orm/mysql2";
import { blogArticles } from "../drizzle/schema.ts";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/portfolio_analyzer";

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const articles = [
  {
    title: "The Complete Guide to Portfolio Diversification",
    slug: "complete-guide-portfolio-diversification",
    excerpt: "Learn how to build a well-diversified investment portfolio that balances risk and returns across different asset classes.",
    content: `# The Complete Guide to Portfolio Diversification

## Introduction

Portfolio diversification is one of the most fundamental principles of investing. The concept is simple: don't put all your eggs in one basket. By spreading your investments across different asset classes, sectors, and geographies, you can reduce risk while maintaining growth potential.

## Why Diversification Matters

### Risk Reduction

The primary benefit of diversification is risk reduction. When you invest in multiple assets that don't move in perfect correlation, the overall volatility of your portfolio decreases. This is because when some investments perform poorly, others may perform well, offsetting the losses.

### Smoother Returns

Diversification helps smooth out returns over time. Instead of experiencing dramatic swings based on a single investment's performance, a diversified portfolio tends to have more stable, predictable returns.

### Opportunity for Growth

By diversifying across different sectors and asset classes, you expose yourself to various growth opportunities. While some sectors may be in decline, others may be experiencing significant growth.

## Asset Classes to Consider

### Stocks
Stocks offer growth potential but come with higher volatility. Consider diversifying across:
- Large-cap stocks (established companies)
- Mid-cap stocks (growing companies)
- Small-cap stocks (high-growth potential)
- International stocks (geographic diversification)

### Bonds
Bonds provide stability and income. Types include:
- Government bonds (low risk)
- Corporate bonds (moderate risk)
- Municipal bonds (tax advantages)
- International bonds (currency diversification)

### Real Estate
Real estate provides inflation protection and income:
- Direct property ownership
- Real Estate Investment Trusts (REITs)
- Real estate crowdfunding

### Commodities
Commodities hedge against inflation:
- Precious metals (gold, silver)
- Energy (oil, natural gas)
- Agricultural products

### Cryptocurrencies
Digital assets offer modern diversification:
- Bitcoin (store of value)
- Ethereum (smart contract platform)
- Stablecoins (reduced volatility)

## The 60/40 Rule

A classic diversification strategy is the 60/40 portfolio:
- 60% stocks for growth
- 40% bonds for stability

This allocation provides a balance between growth and safety, suitable for many investors.

## Rebalancing Your Portfolio

Diversification isn't a one-time task. As markets move, your portfolio allocation will drift from your target. Regular rebalancing—typically annually or semi-annually—helps maintain your desired risk level.

## Conclusion

Diversification is the foundation of sound investing. By spreading your investments across different asset classes and sectors, you can reduce risk, smooth returns, and position yourself for long-term success.`,
    category: "Portfolio Management",
    tags: "diversification, risk-management, asset-allocation, investing-basics",
    author: "Investment Expert",
    featured: 1,
    published: 1,
    publishedAt: new Date("2024-01-15"),
  },
  {
    title: "Understanding Market Volatility and How to Navigate It",
    slug: "understanding-market-volatility",
    excerpt: "Explore the causes of market volatility and learn practical strategies to protect your portfolio during turbulent times.",
    content: `# Understanding Market Volatility and How to Navigate It

## What is Market Volatility?

Market volatility refers to the degree of price fluctuation in financial markets. It's measured by the standard deviation of returns and is often represented by the VIX (Volatility Index) in the stock market.

## Causes of Market Volatility

### Economic Factors
- Interest rate changes
- Inflation rates
- Unemployment data
- GDP growth rates
- Currency fluctuations

### Geopolitical Events
- Political elections
- Trade wars
- Conflicts and tensions
- Policy changes

### Market Sentiment
- Investor fear and greed
- Market speculation
- Herd behavior
- News cycles

### Company-Specific Events
- Earnings announcements
- Management changes
- Product launches
- Regulatory issues

## Types of Volatility

### Historical Volatility
Measures past price movements. It shows how much an asset's price has fluctuated over a specific period.

### Implied Volatility
Reflects market expectations of future volatility. It's derived from option prices and indicates what traders expect.

### Realized Volatility
The actual volatility that occurs during a specific period.

## How to Navigate Volatility

### 1. Stay Invested
Market volatility is temporary. Historically, markets recover from downturns. Panic selling often locks in losses.

### 2. Dollar-Cost Averaging
Invest fixed amounts regularly regardless of market conditions. This reduces the impact of volatility on your average purchase price.

### 3. Diversification
Spread investments across different asset classes to reduce the impact of volatility on your overall portfolio.

### 4. Use Stop-Loss Orders
Set predetermined price levels where you'll exit a position to limit losses.

### 5. Focus on Fundamentals
During volatile periods, focus on the underlying value of investments rather than short-term price movements.

### 6. Maintain an Emergency Fund
Keep 3-6 months of expenses in cash to avoid forced selling during market downturns.

## Volatility as an Opportunity

Experienced investors view volatility as an opportunity. Price drops create buying opportunities for quality assets at discounted prices.

## Conclusion

While market volatility can be unsettling, understanding its causes and having a strategy to navigate it can help you make better investment decisions and achieve long-term financial success.`,
    category: "Market Analysis",
    tags: "volatility, market-dynamics, risk-management, trading-psychology",
    author: "Market Analyst",
    featured: 1,
    published: 1,
    publishedAt: new Date("2024-01-20"),
  },
  {
    title: "Risk Management Strategies for Conservative Investors",
    slug: "risk-management-conservative-investors",
    excerpt: "Discover essential risk management techniques that help conservative investors protect capital while achieving steady growth.",
    content: `# Risk Management Strategies for Conservative Investors

## Introduction

Conservative investors prioritize capital preservation over aggressive growth. This approach requires a disciplined risk management strategy that protects investments while still generating returns.

## Understanding Risk Tolerance

Risk tolerance is your ability and willingness to endure fluctuations in the value of your investments. Conservative investors typically have:
- Low risk tolerance
- Longer time horizons
- Preference for stable income
- Lower volatility expectations

## Core Risk Management Principles

### 1. Asset Allocation
Allocate assets based on your risk tolerance:
- Conservative: 30% stocks, 70% bonds/cash
- Moderate: 60% stocks, 40% bonds/cash
- Aggressive: 80% stocks, 20% bonds/cash

### 2. Quality Over Quantity
Focus on high-quality investments:
- Blue-chip stocks with strong dividends
- Investment-grade bonds
- Established companies with proven track records

### 3. Diversification
Spread investments across:
- Different sectors
- Different geographies
- Different asset classes
- Different company sizes

### 4. Position Sizing
Limit the size of individual positions:
- No single stock should exceed 5% of portfolio
- No single sector should exceed 20% of portfolio
- This prevents catastrophic losses from individual investments

## Conservative Investment Options

### Dividend-Paying Stocks
- Established companies with consistent dividends
- Dividend aristocrats (25+ years of increases)
- Dividend yield of 3-5%

### Bonds
- Government bonds (safest)
- Investment-grade corporate bonds
- Bond ladders for steady income

### Preferred Stocks
- Fixed dividend payments
- Senior to common stocks in bankruptcy
- Lower volatility than common stocks

### Dividend ETFs and Mutual Funds
- Diversified exposure to dividend stocks
- Professional management
- Lower fees than individual stock picking

## Risk Monitoring and Adjustment

### Regular Reviews
Review your portfolio quarterly to ensure it remains aligned with your goals and risk tolerance.

### Rebalancing
Rebalance annually to maintain your target asset allocation. This forces you to sell winners and buy losers—a contrarian approach that works well.

### Stress Testing
Evaluate how your portfolio would perform in various scenarios:
- Market crash
- Recession
- Interest rate spike
- Inflation surge

## Common Mistakes to Avoid

1. **Chasing Yield**: Don't invest in high-yield investments without understanding the risks
2. **Concentration Risk**: Don't put too much in any single investment
3. **Ignoring Inflation**: Conservative portfolios must still beat inflation
4. **Emotional Decisions**: Stick to your plan during market volatility

## Conclusion

Conservative investing doesn't mean avoiding growth. It means managing risk intelligently while pursuing steady, sustainable returns. By following these principles, you can build a portfolio that preserves capital and provides peace of mind.`,
    category: "Risk Management",
    tags: "risk-management, conservative-investing, portfolio-protection, asset-allocation",
    author: "Financial Advisor",
    featured: 1,
    published: 1,
    publishedAt: new Date("2024-01-25"),
  },
  {
    title: "Technical Analysis Fundamentals: Reading Charts Like a Pro",
    slug: "technical-analysis-fundamentals",
    excerpt: "Master the basics of technical analysis and learn how to read price charts to make informed trading decisions.",
    content: `# Technical Analysis Fundamentals: Reading Charts Like a Pro

## What is Technical Analysis?

Technical analysis is the study of historical price and volume data to predict future price movements. Unlike fundamental analysis, which focuses on company financials, technical analysis assumes that all information is already reflected in the price.

## Core Principles

### 1. Price Discounts Everything
All available information—earnings, news, sentiment—is already reflected in the current price.

### 2. Prices Move in Trends
Markets don't move randomly. They move in identifiable trends that can be analyzed and traded.

### 3. History Repeats
Price patterns tend to repeat because human psychology remains constant.

## Key Chart Types

### Candlestick Charts
The most popular chart type showing:
- Open price (where trading started)
- Close price (where trading ended)
- High price (peak during period)
- Low price (lowest point during period)

Green candles indicate price increases; red candles indicate decreases.

### Bar Charts
Similar to candlesticks but displayed as vertical bars with horizontal ticks for open and close prices.

### Line Charts
Simple charts connecting closing prices over time. Good for identifying trends but lacking detail.

## Important Concepts

### Support and Resistance
- **Support**: Price level where buying interest prevents further decline
- **Resistance**: Price level where selling interest prevents further increase

### Trends
- **Uptrend**: Series of higher highs and higher lows
- **Downtrend**: Series of lower highs and lower lows
- **Sideways**: Price moving between support and resistance

### Volume
Higher volume during price moves indicates stronger conviction. Volume confirms trends.

## Common Technical Indicators

### Moving Averages
Smooth out price data to identify trends:
- Simple Moving Average (SMA): Average of closing prices
- Exponential Moving Average (EMA): Gives more weight to recent prices

### Relative Strength Index (RSI)
Measures momentum on a scale of 0-100:
- Above 70: Overbought (potential sell signal)
- Below 30: Oversold (potential buy signal)

### MACD
Shows relationship between two moving averages:
- Bullish when MACD crosses above signal line
- Bearish when MACD crosses below signal line

### Bollinger Bands
Shows volatility and potential reversal points:
- Price near upper band: Potentially overbought
- Price near lower band: Potentially oversold

## Chart Patterns

### Head and Shoulders
Reversal pattern indicating trend change from up to down.

### Double Top/Bottom
Reversal pattern showing resistance or support being tested twice.

### Triangles
Continuation patterns indicating consolidation before breakout.

### Flags and Pennants
Continuation patterns showing brief consolidation in strong trends.

## Risk Management in Technical Trading

1. **Use Stop Losses**: Always set predetermined exit points
2. **Risk/Reward Ratio**: Ensure potential gains exceed potential losses
3. **Position Sizing**: Risk only a small percentage per trade
4. **Avoid Overtrading**: Quality over quantity

## Conclusion

Technical analysis is a powerful tool for identifying trading opportunities. By understanding charts, patterns, and indicators, you can make more informed trading decisions. Remember, no indicator is perfect—combine multiple tools for better accuracy.`,
    category: "Technical Analysis",
    tags: "technical-analysis, charting, indicators, trading-signals",
    author: "Trading Expert",
    featured: 0,
    published: 1,
    publishedAt: new Date("2024-02-01"),
  },
  {
    title: "Cryptocurrency Investment Guide: Bitcoin, Ethereum, and Beyond",
    slug: "cryptocurrency-investment-guide",
    excerpt: "A comprehensive guide to understanding cryptocurrencies and building a balanced crypto portfolio for long-term wealth.",
    content: `# Cryptocurrency Investment Guide: Bitcoin, Ethereum, and Beyond

## Introduction to Cryptocurrency

Cryptocurrency is digital money secured by cryptography. Unlike traditional currencies issued by governments, cryptocurrencies operate on decentralized networks using blockchain technology.

## Major Cryptocurrencies

### Bitcoin (BTC)
- First cryptocurrency (launched 2009)
- Largest by market cap
- Often called "digital gold"
- Limited supply (21 million coins)
- Use case: Store of value

### Ethereum (ETH)
- Second-largest cryptocurrency
- Enables smart contracts
- Platform for decentralized applications
- Unlimited supply
- Use case: Smart contract platform

### Other Notable Cryptocurrencies
- **Stablecoins**: Pegged to fiat currencies (USDC, USDT)
- **Layer 2 Solutions**: Faster, cheaper transactions (Polygon, Arbitrum)
- **DeFi Tokens**: Enable decentralized finance (Uniswap, Aave)
- **Altcoins**: Alternative cryptocurrencies with various use cases

## How Blockchain Works

### 1. Decentralization
No single entity controls the network. Thousands of computers (nodes) validate transactions.

### 2. Transparency
All transactions are recorded on a public ledger visible to everyone.

### 3. Immutability
Once recorded, transactions cannot be altered or deleted.

### 4. Security
Cryptography ensures only authorized parties can move funds.

## Investing in Cryptocurrency

### Getting Started
1. Choose a reputable exchange (Coinbase, Kraken, Binance)
2. Complete identity verification
3. Fund your account
4. Start with small amounts

### Storage Options

**Hot Wallets** (Connected to internet)
- Exchange wallets
- Mobile wallets
- Web wallets
- Convenient but less secure

**Cold Wallets** (Offline)
- Hardware wallets (Ledger, Trezor)
- Paper wallets
- Most secure but less convenient

### Portfolio Allocation

Conservative approach:
- 70% Bitcoin (stability)
- 20% Ethereum (growth)
- 10% Stablecoins (flexibility)

Moderate approach:
- 50% Bitcoin
- 30% Ethereum
- 20% Altcoins

Aggressive approach:
- 30% Bitcoin
- 30% Ethereum
- 40% Altcoins

## Risk Factors

### Volatility
Cryptocurrencies are highly volatile. Prices can swing 20-30% in a single day.

### Regulatory Risk
Government regulations could impact cryptocurrency values.

### Technology Risk
Network failures or security breaches could affect cryptocurrencies.

### Market Risk
Cryptocurrency markets are still developing and can be manipulated.

## Strategies for Crypto Investing

### Dollar-Cost Averaging
Invest fixed amounts regularly to reduce impact of volatility.

### HODL (Hold On for Dear Life)
Long-term strategy of buying and holding despite price fluctuations.

### Diversification
Spread investments across multiple cryptocurrencies and other assets.

### Staking
Earn rewards by holding certain cryptocurrencies in designated wallets.

## Red Flags to Avoid

1. **Pump and Dump Schemes**: Coordinated efforts to inflate then dump prices
2. **Scam Coins**: Worthless tokens with no real use case
3. **Unregistered Exchanges**: Use only regulated platforms
4. **Unrealistic Promises**: No investment guarantees guaranteed returns

## Conclusion

Cryptocurrency offers exciting opportunities but comes with significant risks. Start small, educate yourself, use secure storage, and never invest more than you can afford to lose. As the space matures, cryptocurrencies may play an important role in diversified portfolios.`,
    category: "Cryptocurrency",
    tags: "cryptocurrency, bitcoin, ethereum, blockchain, digital-assets",
    author: "Crypto Analyst",
    featured: 0,
    published: 1,
    publishedAt: new Date("2024-02-05"),
  },
  {
    title: "Investment Strategies for Different Life Stages",
    slug: "investment-strategies-life-stages",
    excerpt: "Tailor your investment approach based on your age and life stage to maximize wealth building throughout your lifetime.",
    content: `# Investment Strategies for Different Life Stages

## Introduction

Your investment strategy should evolve as you progress through different life stages. What works for a 25-year-old won't work for a 55-year-old. This guide outlines strategies for each major life stage.

## Stage 1: Early Career (Ages 20-35)

### Characteristics
- Long time horizon (40+ years)
- Lower income but growing potential
- Few financial obligations
- High risk tolerance

### Recommended Strategy
- **Aggressive Growth**: 80-90% stocks, 10-20% bonds
- Focus on growth stocks and emerging markets
- Maximize retirement contributions
- Take calculated risks
- Invest in education and skills

### Key Actions
1. Start retirement accounts early (401k, IRA)
2. Build emergency fund (3 months expenses)
3. Invest in index funds for diversification
4. Avoid high-interest debt
5. Increase contributions as income grows

## Stage 2: Mid-Career (Ages 35-50)

### Characteristics
- Established income
- Significant financial obligations (mortgage, children)
- Moderate time horizon (15-30 years)
- Moderate risk tolerance

### Recommended Strategy
- **Balanced Growth**: 60-70% stocks, 30-40% bonds
- Mix of growth and value stocks
- Real estate investment
- Diversified portfolio
- Begin tax-efficient strategies

### Key Actions
1. Maximize retirement contributions
2. Invest in real estate (primary home, rental properties)
3. Diversify across asset classes
4. Review and rebalance regularly
5. Plan for children's education
6. Increase insurance coverage

## Stage 3: Pre-Retirement (Ages 50-65)

### Characteristics
- Peak earning years
- Approaching retirement
- Short time horizon (10-20 years)
- Lower risk tolerance

### Recommended Strategy
- **Conservative Growth**: 40-50% stocks, 50-60% bonds
- Focus on dividend-paying stocks
- Increase bond allocation
- Real estate for income
- Minimize volatility

### Key Actions
1. Catch-up contributions to retirement accounts
2. Shift to dividend-focused investments
3. Review retirement projections
4. Plan Social Security strategy
5. Consider long-term care insurance
6. Reduce debt

## Stage 4: Retirement (Ages 65+)

### Characteristics
- Fixed income needs
- Long time horizon (20-40+ years)
- Low risk tolerance
- Focus on income and preservation

### Recommended Strategy
- **Income Focus**: 30-40% stocks, 60-70% bonds
- Dividend stocks for income
- Bond ladder for predictable income
- Real estate for inflation protection
- Conservative allocation

### Key Actions
1. Implement withdrawal strategy (4% rule)
2. Manage tax-efficient withdrawals
3. Maintain some growth for inflation
4. Generate steady income
5. Plan for healthcare costs
6. Consider annuities for guaranteed income

## Special Considerations

### Life Events
- Marriage: Combine finances strategically
- Children: Increase insurance, plan education
- Home Purchase: Balance debt and investments
- Job Change: Review retirement accounts
- Inheritance: Plan tax-efficient deployment

### Market Conditions
- Bull Markets: Don't get overconfident
- Bear Markets: Don't panic sell
- Recessions: Maintain long-term perspective
- Inflation: Adjust allocation accordingly

## Conclusion

Your investment strategy should align with your life stage, goals, and risk tolerance. Regularly review and adjust your portfolio as your circumstances change. Remember, the best investment strategy is one you can stick with through market cycles.`,
    category: "Investment Strategies",
    tags: "life-stages, investment-strategy, retirement-planning, wealth-building",
    author: "Financial Planner",
    featured: 0,
    published: 1,
    publishedAt: new Date("2024-02-10"),
  },
];

async function seedBlog() {
  try {
    // Parse DATABASE_URL
    const url = new URL(DATABASE_URL);
    const connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port ? parseInt(url.port) : 3306,
      ssl: {},
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    const db = drizzle(connection);

    console.log("Seeding blog articles...");

    for (const article of articles) {
      try {
        // Check if article already exists
        const existing = await db.select().from(blogArticles).where(eq(blogArticles.slug, article.slug)).limit(1);
        if (existing.length > 0) {
          console.log(`- Skipped: ${article.title} (already exists)`);
          continue;
        }
        await db.insert(blogArticles).values(article);
        console.log(`✓ Created: ${article.title}`);
      } catch (error) {
        if (error?.code !== 'ER_DUP_ENTRY') {
          console.log(`- Skipped: ${article.title} (error: ${error?.message || String(error)})`);
        } else {
          console.log(`- Skipped: ${article.title} (already exists)`);
        }
      }
    }

    console.log("\n✅ Blog seeding completed!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding blog:", error?.message || String(error));
    process.exit(1);
  }
}

seedBlog();
