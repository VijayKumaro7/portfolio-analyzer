import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getPortfolioById, getPortfolioHoldings } from "../db";
import { invokeLLM } from "../_core/llm";
import { generatePDF } from "../_core/pdfGenerator";

export const analysisRouter = router({
  /**
   * Get portfolio analysis with AI-powered insights
   */
  getPortfolioAnalysis: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }

      const holdings = await getPortfolioHoldings(input.portfolioId);

      // Calculate basic metrics
      const totalCost = holdings.reduce((sum, h) => {
        const cost = parseFloat(h.purchasePrice) * parseFloat(h.quantity);
        return sum + cost;
      }, 0);

      const assetAllocation = holdings.reduce(
        (acc, h) => {
          const type = h.assetType;
          acc[type] = (acc[type] || 0) + parseFloat(h.quantity) * parseFloat(h.purchasePrice);
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        portfolio,
        holdings,
        metrics: {
          totalCost,
          holdingCount: holdings.length,
          assetAllocation,
        },
      };
    }),

  /**
   * Generate AI-powered investment recommendations
   */
  generateRecommendations: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }

      const holdings = await getPortfolioHoldings(input.portfolioId);

      const holdingsSummary = holdings
        .map((h) => `${h.name} (${h.symbol}): ${h.quantity} units at $${h.purchasePrice}`)
        .join("\n");

      const prompt = `You are an expert investment advisor. Analyze this portfolio and provide personalized recommendations:

Portfolio Holdings:
${holdingsSummary}

Please provide:
1. Risk Assessment - evaluate the overall portfolio risk
2. Diversification Analysis - assess asset allocation
3. Optimization Suggestions - recommend improvements
4. Growth Opportunities - suggest potential additions
5. Risk Mitigation Strategies - recommend risk reduction approaches

Format your response as clear, actionable insights.`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert investment advisor providing personalized portfolio analysis and recommendations.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        return {
          recommendations: response.choices[0]?.message?.content || "",
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new Error("Failed to generate recommendations");
      }
    }),

  /**
   * Generate PDF report of portfolio
   */
  generatePDFReport: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }

      const holdings = await getPortfolioHoldings(input.portfolioId);

      try {
        const pdfBuffer = await generatePDF({
          portfolio,
          holdings,
          generatedAt: new Date(),
        });

        return {
          success: true,
          fileName: `portfolio-${portfolio.id}-${Date.now()}.pdf`,
          size: pdfBuffer.length,
        };
      } catch (error) {
        throw new Error("Failed to generate PDF report");
      }
    }),

  /**
   * Calculate portfolio correlation matrix
   */
  calculateCorrelations: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }

      const holdings = await getPortfolioHoldings(input.portfolioId);

      // Create a correlation matrix (placeholder - would use real price history)
      const correlationMatrix = holdings.map((h1, i) =>
        holdings.map((h2, j) => {
          if (i === j) return 1;
          // Placeholder correlation calculation
          return Math.random() * 0.8 - 0.4;
        })
      );

      return {
        symbols: holdings.map((h) => h.symbol),
        correlationMatrix,
      };
    }),

  /**
   * Calculate risk metrics
   */
  calculateRiskMetrics: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const portfolio = await getPortfolioById(input.portfolioId);
      if (!portfolio || portfolio.userId !== ctx.user.id) {
        throw new Error("Portfolio not found or unauthorized");
      }

      const holdings = await getPortfolioHoldings(input.portfolioId);

      // Calculate portfolio risk metrics (placeholder)
      const volatility = Math.random() * 20 + 5; // 5-25%
      const beta = Math.random() * 1.5 + 0.5; // 0.5-2.0
      const sharpeRatio = Math.random() * 2 + 0.5; // 0.5-2.5

      return {
        volatility: volatility.toFixed(2),
        beta: beta.toFixed(2),
        sharpeRatio: sharpeRatio.toFixed(2),
        riskLevel:
          volatility > 15 ? "High" : volatility > 10 ? "Medium" : "Low",
      };
    }),
});
