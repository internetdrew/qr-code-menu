import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type FC } from "react";
import { Button } from "./ui/button";
import PublishingDialog from "./home/PublishingDialog";
import { linkClasses } from "@/constants";

interface StorePreviewBannerProps {
  isPublished: boolean;
  publicStoreDomain: string;
  store: { id: string; menu_slug: string; name: string };
}

const StorePreviewBanner: FC<StorePreviewBannerProps> = ({
  isPublished,
  publicStoreDomain,
  store,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [publishingDialogIsOpen, setPublishingDialogIsOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 bg-neutral-500/5 py-4 text-center text-xs backdrop-blur-sm">
        <div className="space-x-2 text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isPublished ? "live" : "hidden"}
              className="inline-flex items-center gap-2"
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
              {isPublished ? (
                <>
                  <span>This is a preview of your live menu.</span>
                  <a
                    href={`${publicStoreDomain}/m/${store.menu_slug}`}
                    className={linkClasses}
                  >
                    Visit live menu
                  </a>
                </>
              ) : (
                <>
                  <span>Your menu is hidden from customers.</span>
                  <Button
                    size="xs"
                    onClick={() => setPublishingDialogIsOpen(true)}
                  >
                    Publish menu
                  </Button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <PublishingDialog
        isOpen={publishingDialogIsOpen}
        onOpenChange={setPublishingDialogIsOpen}
        isPublished={isPublished}
        storeId={store.id}
        storeMenuSlug={store.menu_slug}
        storeName={store.name}
      />
    </>
  );
};

export default StorePreviewBanner;
