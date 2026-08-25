import { AnimatePresence, motion } from "motion/react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { ScrollText } from "lucide-react";
import ShareQRButtonDialog from "./ShareQRButtonDialog";
import OwnerAccountMenu from "./AccountMenu";
import type { StoreRecord } from "@/types/store";

interface StoreViewerOptionsProps {
  store: StoreRecord;
}

const StoreViewerOptions = ({ store }: StoreViewerOptionsProps) => {
  return (
    <div className="flex shrink-0 items-center justify-end">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={store.is_published ? "share-button" : "preview-link"}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          {store.is_published ? (
            <ShareQRButtonDialog
              storeId={store.id}
              storeSlug={store.menu_slug}
              storeName={store.name}
            />
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              // className="hover:bg-stone-200 focus-visible:bg-stone-200"
            >
              <Link to="/preview/store">
                <ScrollText />
                Preview
              </Link>
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
      <OwnerAccountMenu store={store} />
    </div>
  );
};

export default StoreViewerOptions;
