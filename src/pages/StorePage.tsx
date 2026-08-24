import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import BackToTopButton from "@/components/store-page/BackToTopButton";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { NotFound } from "./NotFoundPage";
import { LayoutGroup, useReducedMotion } from "motion/react";
import StorePreviewBanner from "@/components/StorePreviewBanner";
import StoreLogo from "@/components/StoreLogo";
import type { Database } from "../../shared/database.types";
import { useAuth } from "@/contexts/auth";
import ItemImageDialog from "@/components/ItemImageDialog";
import StoreCategoriesWithItems from "@/components/store-page/StoreCategoriesWithItems";
import StoreNavigation from "@/components/store-page/StoreNavigation";

const publicStoreDomain =
  import.meta.env.VITE_PUBLIC_STORE_DOMAIN ||
  import.meta.env.VITE_PUBLIC_MENU_DOMAIN ||
  "https://menunook.com";

type StoreRecord = Database["public"]["Tables"]["stores"]["Row"];
export type StoreItem =
  Database["public"]["Tables"]["store_menu_category_items"]["Row"] & {
    order_index: number;
  };
export type StoreCategory =
  Database["public"]["Tables"]["store_menu_categories"]["Row"] & {
    items: StoreItem[];
  };
type StoreData = StoreRecord & {
  store_menu_categories: StoreCategory[];
};

export const Store = () => {
  const { hash, pathname, search } = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  const userStoreQuery = useQuery(
    trpc.store.getForUser.queryOptions(undefined, {
      enabled: !authLoading && !!user,
    }),
  );

  const previewStoreId = userStoreQuery.data?.id;
  const {
    data: store,
    isLoading: storePreviewIsLoading,
    error: storePreviewError,
  } = useQuery(
    trpc.store.getPreview.queryOptions(
      { storeId: previewStoreId ?? "" },
      {
        enabled: !!previewStoreId,
      },
    ),
  );
  const storeData = store as StoreData | null | undefined;
  const storeIsLoading =
    authLoading || userStoreQuery.isLoading || storePreviewIsLoading;
  const error = userStoreQuery.error || storePreviewError;

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        el.scrollIntoView({
          behavior: prefersReducedMotion ? "instant" : "smooth",
          block: "start",
        });
      }
    }
  }, [hash, storeData]);

  const categoriesWithItems = storeData?.store_menu_categories.filter(
    (category) => category.items && category.items.length > 0,
  );

  if (storeIsLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-sm px-4 py-8">
        <Skeleton className="mx-auto mb-6 h-8 w-1/4" />
        <Skeleton className="mx-auto mt-8 h-8 w-1/4" />
        <Skeleton className="mt-16 mb-2 h-8 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    );
  }

  if (!storeData || error) {
    return (
      <NotFound
        title="Store Not Found"
        message="The store you're looking for does not exist."
        href="/"
        hrefText="Go back to Home"
      />
    );
  }

  return (
    <LayoutGroup id="store-item-images">
      <div className="relative flex min-h-dvh flex-col">
        <StorePreviewBanner
          isPublished={storeData.is_published}
          publicStoreDomain={publicStoreDomain}
          store={storeData}
        />

        <div className="mx-auto mt-6 w-full max-w-xl flex-1 px-4">
          <StoreNavigation
            ref={navRef}
            categories={categoriesWithItems}
            prefersReducedMotion={prefersReducedMotion}
            storeName={storeData.name}
          />
          {storeData.image_url && (
            <StoreLogo
              imageUrl={storeData.image_url}
              storeName={storeData.name}
            />
          )}

          <StoreCategoriesWithItems
            categories={categoriesWithItems}
            onSelectItem={setSelectedItem}
            prefersReducedMotion={prefersReducedMotion}
            selectedItemId={selectedItem?.id ?? null}
          />

          <ItemImageDialog
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        </div>
        <footer className="mt-auto pt-12">
          <div className="text-muted-foreground mx-auto my-8 max-w-screen-sm px-4 text-center text-xs">
            <span>
              Powered by{" "}
              <a
                href="https://menunook.com"
                className="text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition duration-200 hover:decoration-neutral-600"
              >
                MenuNook
              </a>
            </span>
          </div>
        </footer>

        <BackToTopButton
          hash={hash}
          navRef={navRef}
          pathname={pathname}
          search={search}
        />
      </div>
    </LayoutGroup>
  );
};
