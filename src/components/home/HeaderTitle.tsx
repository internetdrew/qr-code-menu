import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { StoreRecord } from "@/types/store";
import { cn } from "@/lib/utils";

interface HeaderTitleProps {
  store: StoreRecord | null;
}

const HeaderTitle = ({ store }: HeaderTitleProps) => {
  const shouldReduceMotion = useReducedMotion();
  const appTitle = store?.name ?? "MenuNook";
  const statusLabel = store
    ? store.is_published
      ? "Live"
      : "Hidden"
    : null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${appTitle}-${statusLabel ?? "no-store"}`}
        className="flex min-w-0 items-center gap-2"
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 5, filter: "blur(4px)" }
        }
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -5, filter: "blur(4px)" }
        }
        transition={{
          duration: 0.18,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        style={{ willChange: "transform, filter, opacity" }}
      >
        <h1 className="title menu-header truncate font-[560]">{appTitle}</h1>
        {statusLabel ? (
          <span
            aria-label={`Menu status: ${statusLabel}`}
            className={cn(
              "text-muted-foreground ml-1 inline-flex shrink-0 items-center gap-1 text-[11px] leading-4 font-medium",
              store?.is_published
                ? "[&>span]:bg-emerald-500"
                : "[&>span]:bg-amber-500",
            )}
          >
            <span className="size-1.5 rounded-full" aria-hidden="true" />
            {statusLabel}
          </span>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
};

export default HeaderTitle;
