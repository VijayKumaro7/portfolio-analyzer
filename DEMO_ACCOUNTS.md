# Demo Accounts Guide

## Overview

Your Portfolio Analyzer application includes three pre-configured demo accounts with realistic portfolio data for testing and demonstration purposes.

## Demo Account Credentials

### Account 1: Alice Johnson
- **Email:** alice@demo.com
- **Name:** Alice Johnson
- **OpenID:** demo-user-1
- **Portfolios:**
  - Tech Growth Portfolio (4 holdings: AAPL, MSFT, NVDA, TSLA)
  - Dividend Income Portfolio (3 holdings: JNJ, PG, VYM)

### Account 2: Bob Smith
- **Email:** bob@demo.com
- **Name:** Bob Smith
- **OpenID:** demo-user-2
- **Portfolios:**
  - Crypto & Digital Assets (3 holdings: BTC, ETH, SOL)
  - Balanced Portfolio (3 holdings: VOO, BND, VNQ)

### Account 3: Carol Williams
- **Email:** carol@demo.com
- **Name:** Carol Williams
- **OpenID:** demo-user-3
- **Portfolios:**
  - Index Fund Portfolio (3 holdings: VTI, VXUS, BND)

## How to Access Demo Accounts

### Method 1: Using the Dashboard (Recommended)

1. Navigate to your Portfolio Analyzer application
2. Click the **"Go to Dashboard"** button on the home page
3. You will be prompted to log in via Manus OAuth
4. After authentication, the system will automatically create your user account
5. You can then create your own portfolios or view the demo data

### Method 2: Direct Database Access (For Testing)

If you need to directly access demo account data in the database:

```sql
-- View all demo users
SELECT * FROM users WHERE openId LIKE 'demo-%';

-- View demo portfolios
SELECT p.* FROM portfolios p
JOIN users u ON p.userId = u.id
WHERE u.openId LIKE 'demo-%';

-- View demo holdings
SELECT h.* FROM holdings h
JOIN portfolios p ON h.portfolioId = p.id
JOIN users u ON p.userId = u.id
WHERE u.openId LIKE 'demo-%';
```

### Method 3: Using the Seed Script

To regenerate or add more demo data:

```bash
# Run the seed script
pnpm seed

# This will:
# - Create demo users (or skip if they already exist)
# - Create 5 sample portfolios
# - Add 16 sample holdings
# - Generate 496 price history records
```

## Demo Portfolio Details

### Alice's Tech Growth Portfolio
- **Description:** Focused on high-growth technology stocks
- **Holdings:**
  - Apple (AAPL): 50 shares @ $150.00
  - Microsoft (MSFT): 30 shares @ $300.00
  - NVIDIA (NVDA): 20 shares @ $400.00
  - Tesla (TSLA): 15 shares @ $250.00

### Alice's Dividend Income Portfolio
- **Description:** Stable dividend-paying stocks and ETFs
- **Holdings:**
  - Johnson & Johnson (JNJ): 100 shares @ $160.00
  - Procter & Gamble (PG): 75 shares @ $140.00
  - Vanguard High Dividend Yield ETF (VYM): 200 shares @ $110.00

### Bob's Crypto & Digital Assets Portfolio
- **Description:** Cryptocurrency and blockchain investments
- **Holdings:**
  - Bitcoin (BTC): 0.5 BTC @ $45,000.00
  - Ethereum (ETH): 5 ETH @ $2,500.00
  - Solana (SOL): 100 SOL @ $150.00

### Bob's Balanced Portfolio
- **Description:** Mix of stocks, bonds, and real estate
- **Holdings:**
  - Vanguard S&P 500 ETF (VOO): 100 shares @ $420.00
  - Vanguard Total Bond Market ETF (BND): 150 shares @ $80.00
  - Vanguard Real Estate ETF (VNQ): 50 shares @ $95.00

### Carol's Index Fund Portfolio
- **Description:** Low-cost index fund diversification
- **Holdings:**
  - Vanguard Total Stock Market ETF (VTI): 500 shares @ $200.00
  - Vanguard Total International Stock ETF (VXUS): 300 shares @ $65.00
  - Vanguard Total Bond Market ETF (BND): 200 shares @ $80.00

## Features Available with Demo Accounts

✅ **Portfolio Management**
- View all portfolios and holdings
- Add new holdings to existing portfolios
- Edit and delete holdings
- View portfolio metrics and statistics

✅ **Advanced Analytics**
- Interactive performance charts with date range selectors
- Technical indicators (SMA, EMA, MACD, RSI)
- Risk-return scatter plots
- Asset allocation pie charts
- Correlation matrix visualization

✅ **Real-Time Data**
- Live market prices via Alpha Vantage API
- Current price and gain/loss percentage
- Price refresh every 60 seconds

✅ **AI-Powered Insights**
- LLM-generated investment recommendations
- Risk assessment analysis
- Portfolio optimization suggestions
- PDF report generation

## Testing Scenarios

### Scenario 1: Analyze Tech Growth
1. Log in as Alice Johnson
2. Navigate to "Tech Growth Portfolio"
3. View the performance chart with technical indicators
4. Check the correlation matrix between tech stocks
5. Generate a PDF report

### Scenario 2: Compare Crypto vs Traditional
1. Log in as Bob Smith
2. Compare "Crypto & Digital Assets" vs "Balanced Portfolio"
3. Analyze risk-return metrics
4. View asset allocation breakdown
5. Get AI-powered recommendations

### Scenario 3: Index Fund Strategy
1. Log in as Carol Williams
2. View the "Index Fund Portfolio"
3. Analyze diversification across markets
4. Check historical performance
5. Review LLM analysis and suggestions

## Notes

- Demo data includes 30 days of historical price data for all holdings
- Prices fluctuate randomly to simulate realistic market movements
- All demo accounts have the same access level (no admin features)
- Demo data is reset when you run `pnpm seed` again
- Real-time prices are fetched from Alpha Vantage API (requires API key in environment)

## Troubleshooting

**Q: I can't see the demo portfolios**
- A: Make sure you're logged in with a Manus account. The demo data is tied to specific user IDs in the database.

**Q: The prices aren't updating**
- A: Check that the Alpha Vantage API key is configured in your environment variables. Live prices update every 60 seconds.

**Q: I want to test with my own data**
- A: Create a new portfolio from the dashboard. You can add your own holdings and track them in real-time.

## Support

For issues or questions about the demo accounts, please check the project README or contact support.
