import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { supabaseAdminClient } from "../supabase";

export const itemRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(255).optional(),
        placeId: z.uuid(),
        price: z.number().min(0),
        imageUrl: z.url().optional(),
        categoryId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, placeId, description, price, imageUrl, categoryId } = input;

      const { data, error } = await supabaseAdminClient
        .from("place_items")
        .insert({
          place_id: placeId,
          name,
          description,
          category_id: categoryId,
          price,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create category: ${error.message}`,
        });
      }

      return data;
    }),
  getAllByPlace: protectedProcedure
    .input(
      z.object({
        placeId: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const { placeId } = input;

      const { data, error } = await supabaseAdminClient
        .from("place_items")
        .select("*, category:place_categories(id,name)")
        .eq("place_id", placeId)
        .order("created_at", { ascending: true });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch categories: ${error.message}`,
        });
      }

      return data;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100),
        description: z.string().max(255).optional(),
        placeId: z.uuid(),
        price: z.number().min(0),
        imageUrl: z.url().optional(),
        categoryId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, name, placeId, description, price, imageUrl, categoryId } =
        input;

      const { data, error } = await supabaseAdminClient
        .from("place_items")
        .update({
          name,
          description,
          category_id: categoryId,
          price,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("place_id", placeId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update item: ${error.message}`,
        });
      }

      return data;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      const { data, error } = await supabaseAdminClient
        .from("place_items")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete item: ${error.message}`,
        });
      }

      return data;
    }),
});
