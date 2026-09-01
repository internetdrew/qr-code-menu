import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";
import { supabaseAdminClient } from "../supabase.js";

export const entitlementRouter = router({
  getForStore: publicProcedure
    .input(z.object({ storeId: z.uuid() }))
    .query(async ({ input }) => {
      const { data: entitlement, error } = await supabaseAdminClient
        .from("store_entitlements")
        .select("*")
        .eq("store_id", input.storeId)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return entitlement;
    }),
});
