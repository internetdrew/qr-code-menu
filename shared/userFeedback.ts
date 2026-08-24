import { z } from "zod";

export const USER_FEEDBACK_LIMIT = 500;
export const USER_FEEDBACK_WARNING_THRESHOLD = 50;

export const userFeedbackFieldsSchema = z.object({
  feedback: z
    .string()
    .trim()
    .min(1, {
      message: "Please add your feedback.",
    })
    .max(USER_FEEDBACK_LIMIT, {
      message: `Feedback must be ${USER_FEEDBACK_LIMIT} characters or fewer.`,
    }),
});
