import { initTRPC, TRPCError } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { enforceTrpcRateLimit } from "./rateLimit.js";
import { createServerSupabaseClient } from "./supabase.js";

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  const supabase = createServerSupabaseClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    req,
    res,
    user,
    supabase,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      supabase: ctx.supabase,
    },
  });
});

const createProtectedRateLimitMiddleware = (
  name: "feedback" | "protectedMutation" | "qr",
) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    await enforceTrpcRateLimit(name, ctx.user.id);

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        supabase: ctx.supabase,
      },
    });
  });

export const protectedProcedure = t.procedure.use(requireUser);

export const protectedMutationLimitedProcedure = t.procedure
  .use(requireUser)
  .use(createProtectedRateLimitMiddleware("protectedMutation"));

export const feedbackLimitedProcedure = t.procedure
  .use(requireUser)
  .use(createProtectedRateLimitMiddleware("feedback"));

export const qrLimitedProcedure = t.procedure
  .use(requireUser)
  .use(createProtectedRateLimitMiddleware("qr"));
