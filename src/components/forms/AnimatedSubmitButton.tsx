import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export function AnimatedSubmitButton({
  isSubmitting,
  disabled = false,
  idleLabel,
  submittingLabel = "Sending...",
}: {
  isSubmitting: boolean;
  disabled?: boolean;
  idleLabel: string;
  submittingLabel?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  const state = isSubmitting ? "submitting" : "idle";
  const label = isSubmitting ? submittingLabel : idleLabel;

  return (
    <Button
      type="submit"
      size="sm"
      disabled={isSubmitting || disabled}
      className="min-w-24 overflow-hidden"
      aria-busy={isSubmitting}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          key={state}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
