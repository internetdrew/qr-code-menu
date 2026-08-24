import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const buttonTransition = {
  type: "spring",
  bounce: 0,
  duration: 0.32,
} as const;

const labelTransition = {
  duration: 0.2,
  ease: "easeInOut",
} as const;

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
    <Button asChild size="sm">
      <motion.button
        type="submit"
        layout="size"
        transition={shouldReduceMotion ? { duration: 0 } : buttonTransition}
        disabled={isSubmitting || disabled}
        className="min-w-24 overflow-hidden"
        aria-busy={isSubmitting}
      >
        <motion.span
          layout="size"
          transition={shouldReduceMotion ? { duration: 0 } : buttonTransition}
          className="relative inline-grid overflow-hidden"
        >
          <span
            aria-hidden="true"
            className="invisible col-start-1 row-start-1 whitespace-nowrap"
          >
            {label}
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={state}
              transition={shouldReduceMotion ? { duration: 0 } : labelTransition}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -10, filter: "blur(6px)" }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10, filter: "blur(6px)" }
              }
              className="col-start-1 row-start-1 whitespace-nowrap will-change-[transform,opacity,filter]"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.button>
    </Button>
  );
}
