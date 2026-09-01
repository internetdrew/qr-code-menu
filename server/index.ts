import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import cors from "cors";
import { router, createContext } from "./trpc.js";
import dotenv from "dotenv";
import path from "path";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createExpressRateLimitMiddleware } from "./rateLimit.js";
import { createServerSupabaseClient } from "./supabase.js";
import { storeRouter } from "./routers/storeRouter.js";
import { storeQRCodeRouter } from "./routers/storeQRCodeRouter.js";
import { storeCategoryRouter } from "./routers/storeCategoryRouter.js";
import { storeCategoryItemRouter } from "./routers/storeCategoryItemRouter.js";
import { userFeedbackRouter } from "./routers/userFeedbackRouter.js";
import { stripeRouter } from "./routers/stripeRouter.js";
import { entitlementRouter } from "./routers/entitlementRouter.js";
import { stripeWebhookHandler } from "./utils/stripe.js";
import { fileURLToPath } from "url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(serverDir, "../.env"), quiet: true });

export const appRouter = router({
  store: storeRouter,
  storeQRCode: storeQRCodeRouter,
  storeCategory: storeCategoryRouter,
  storeCategoryItem: storeCategoryItemRouter,
  stripe: stripeRouter,
  entitlement: entitlementRouter,
  userFeedback: userFeedbackRouter,
});

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

const app = express();

app.use(compression());
app.use(helmet());
app.use(cors(corsOptions));
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());

app.post("/api/stripe/webhook", stripeWebhookHandler);

app.get(
  "/auth/callback",
  createExpressRateLimitMiddleware("authCallback"),
  async function (req, res) {
    const code = req.query.code;
    const next = req.query.next ?? "/";

    if (code) {
      const supabase = createServerSupabaseClient(req, res);
      await supabase.auth.exchangeCodeForSession(code as string);
    }
    res.redirect(303, `/${(next as string)?.slice(1)}`);
  },
);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

export type AppRouter = typeof appRouter;
