import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { StoreRecord } from "@/types/store";

interface HeaderTitleProps {
  store: StoreRecord | null;
}

const HeaderTitle = ({ store }: HeaderTitleProps) => {
  const shouldReduceMotion = useReducedMotion();
  const appTitle = store?.name ?? "MenuNook";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.h1
        key={appTitle}
        className="title menu-header truncate font-[560]"
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
        {appTitle}
      </motion.h1>
    </AnimatePresence>
  );
};

export default HeaderTitle;
