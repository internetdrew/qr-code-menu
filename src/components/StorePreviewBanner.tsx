import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useState, type FC } from "react";
import { Link } from "react-router";
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
      <div className="sticky top-0 z-10 bg-neutral-500/5 py-3 text-xs backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-xl grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-4 sm:grid-cols-[1fr_auto_1fr]">
          <Button
            asChild
            variant="ghost"
            size="xs"
            className="-ml-2 justify-self-start"
          >
            <Link to="/" aria-label="Back to editor">
              <ArrowLeft />
              Back to editor
            </Link>
          </Button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isPublished ? "live" : "hidden"}
              className="col-span-2 row-start-2 justify-self-center text-center sm:col-span-1 sm:col-start-2 sm:row-start-1"
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
              {isPublished
                ? "This is a preview of your live menu."
                : "Your menu is hidden from customers."}
            </motion.div>
          </AnimatePresence>

          <div className="col-start-2 row-start-1 justify-self-end sm:col-start-3">
            {isPublished ? (
              <a
                href={`${publicStoreDomain}/m/${store.menu_slug}`}
                className={linkClasses}
              >
                Visit live menu
              </a>
            ) : (
              <Button size="xs" onClick={() => setPublishingDialogIsOpen(true)}>
                Publish menu
              </Button>
            )}
          </div>
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
