import { TRPCError } from "@trpc/server";
import { feedbackLimitedProcedure, router } from "../trpc.js";
import { userFeedbackFieldsSchema } from "../../shared/userFeedback.js";

export const userFeedbackRouter = router({
  submit: feedbackLimitedProcedure
    .input(userFeedbackFieldsSchema)
    .mutation(async ({ input, ctx }) => {
      const feedback = input.feedback.trim();
      const email = ctx.user.email;

      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A signed-in email address is required to submit feedback.",
        });
      }

      const { data: newFeedback, error: feedbackError } = await ctx.supabase
        .from("user_feedback")
        .insert({
          user_id: ctx.user.id,
          email,
          feedback,
        })
        .select()
        .single();

      if (feedbackError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to submit feedback: ${feedbackError.message}`,
        });
      }

      return newFeedback;
    }),
});
