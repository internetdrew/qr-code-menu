import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { trpc } from "@/utils/trpc";
import {
  USER_FEEDBACK_LIMIT,
  USER_FEEDBACK_WARNING_THRESHOLD,
  userFeedbackFieldsSchema,
} from "../../../shared/userFeedback";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { AnimatedSubmitButton } from "./AnimatedSubmitButton";
import RemainingCharacters from "./RemainingCharacters";

const formSchema = userFeedbackFieldsSchema;

interface UserFeedbackFormProps {
  onSuccess: () => void;
}

const UserFeedbackForm = ({ onSuccess }: UserFeedbackFormProps) => {
  const submitFeedback = useMutation(trpc.userFeedback.submit.mutationOptions());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: "",
    },
  });

  const feedbackValue = form.watch("feedback");
  const hasFeedback = feedbackValue.trim().length > 0;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await submitFeedback.mutateAsync(
      {
        feedback: values.feedback.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Feedback sent. Thank you.");
          form.reset();
          onSuccess();
        },
        onError: (error) => {
          console.error("Failed to submit feedback:", error);
          toast.error("Failed to send feedback. Please try again.");
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feedback</FormLabel>
                <FormControl>
                  <Textarea
                    maxLength={USER_FEEDBACK_LIMIT}
                    className="min-h-36 resize-none placeholder:text-[13px]"
                    placeholder="Tell us what was confusing, broken, or could be better."
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between gap-4">
                  <FormDescription>
                    Share anything that would make MenuNook easier to use.
                  </FormDescription>
                  <RemainingCharacters
                    value={feedbackValue}
                    limit={USER_FEEDBACK_LIMIT}
                    warningThreshold={USER_FEEDBACK_WARNING_THRESHOLD}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <AnimatedSubmitButton
              isSubmitting={form.formState.isSubmitting}
              disabled={!form.formState.isDirty || !hasFeedback}
              idleLabel="Send"
            />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default UserFeedbackForm;
