import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedMutationLimitedProcedure, router } from "../trpc.js";
import { stripe } from "../utils/stripe.js";
import { supabaseAdminClient } from "../supabase.js";

const APP_DOMAIN = process.env.VITE_APP_DOMAIN;
const STORE_ENTITLEMENT_PRICE_ID = process.env.STRIPE_STORE_ENTITLEMENT_PRICE_ID;

if (!APP_DOMAIN) {
  throw new Error("VITE_APP_DOMAIN must be defined");
}

if (!STORE_ENTITLEMENT_PRICE_ID) {
  throw new Error("STRIPE_STORE_ENTITLEMENT_PRICE_ID must be defined");
}

export const stripeRouter = router({
  createCheckoutSession: protectedMutationLimitedProcedure
    .input(z.object({ storeId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: store, error: storeError } = await ctx.supabase
        .from("stores")
        .select("id")
        .eq("id", input.storeId)
        .eq("user_id", ctx.user.id)
        .maybeSingle();

      if (storeError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: storeError.message,
        });
      }

      if (!store) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this store.",
        });
      }

      const { data: entitlement, error: entitlementError } =
        await supabaseAdminClient
          .from("store_entitlements")
          .select("id")
          .eq("store_id", input.storeId)
          .eq("status", "active")
          .maybeSingle();

      if (entitlementError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: entitlementError.message,
        });
      }

      if (entitlement) {
        const { data: updatedStore, error: publishError } = await ctx.supabase
          .from("stores")
          .update({ is_published: true })
          .eq("id", input.storeId)
          .eq("user_id", ctx.user.id)
          .select()
          .single();

        if (publishError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: publishError.message,
          });
        }

        return {
          status: "already_entitled" as const,
          store: updatedStore,
        };
      }

      const session = await stripe.checkout.sessions.create({
        cancel_url: `${APP_DOMAIN}?canceled=true`,
        customer_email: ctx.user.email,
        line_items: [
          {
            price: STORE_ENTITLEMENT_PRICE_ID,
            quantity: 1,
          },
        ],
        metadata: {
          storeId: input.storeId,
        },
        mode: "payment",
        payment_method_types: ["card"],
        success_url: `${APP_DOMAIN}?success=true`,
      });

      if (!session.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe checkout session",
        });
      }

      return {
        status: "checkout_required" as const,
        url: session.url,
      };
    }),
});
