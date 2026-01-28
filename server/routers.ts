import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { portfolioRouter } from "./routers/portfolio";
import { analysisRouter } from "./routers/analysis";
import { chartAnalysisRouter } from "./routers/chartAnalysis";
import { marketDataRouter } from "./routers/marketData";
import { demoModeRouter } from "./routers/demoMode";
import { subscriptionRouter } from "./routers/subscription";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  subscription: subscriptionRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  portfolio: portfolioRouter,
  analysis: analysisRouter,
  chartAnalysis: chartAnalysisRouter,
  marketData: marketDataRouter,
  demoMode: demoModeRouter,
});

export type AppRouter = typeof appRouter;
