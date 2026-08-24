import { AnimatePresence, motion } from "motion/react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { ScrollText } from "lucide-react";
import ShareQRButtonDialog from "./ShareQRButtonDialog";

interface StoreViewerOptionsProps {
  isPublished: boolean;
  storeId: string;
  storeMenuSlug: string;
  storeName: string;
}

const StoreViewerOptions = ({
  isPublished,
  storeId,
  storeMenuSlug,
  storeName,
}: StoreViewerOptionsProps) => {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isPublished ? "share-button" : "preview-link"}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          {isPublished ? (
            <ShareQRButtonDialog
              storeId={storeId}
              storeSlug={storeMenuSlug}
              storeName={storeName}
            />
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hover:bg-stone-200 focus-visible:bg-stone-200"
            >
              <Link to="/preview/store">
                <ScrollText />
                Preview
              </Link>
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StoreViewerOptions;
