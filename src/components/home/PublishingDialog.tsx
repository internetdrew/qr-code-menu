import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, ScrollText } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { toast } from "sonner";
import { AnimatedSubmitButton } from "../forms/AnimatedSubmitButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cn } from "@/lib/utils";

const publicStoreDomain =
  import.meta.env.VITE_PUBLIC_STORE_DOMAIN ||
  import.meta.env.VITE_PUBLIC_MENU_DOMAIN ||
  "https://menunook.com";

interface PublishingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPublished: boolean;
  storeId: string;
  storeMenuSlug: string;
  storeName: string;
}

const PublishingDialog = ({
  isOpen,
  onOpenChange,
  isPublished,
  storeId,
  storeMenuSlug,
  storeName,
}: PublishingDialogProps) => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const updateStore = useMutation(trpc.store.update.mutationOptions());
  const [confirmUnpublishIsOpen, setConfirmUnpublishIsOpen] = useState(false);
  const publicUrl = `${publicStoreDomain}/m/${storeMenuSlug}`;
  const isStorePreviewRoute = pathname === "/preview/store";

  const handlePublishSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updatePublishing(true);
  };

  const updatePublishing = async (nextIsPublished: boolean) => {
    try {
      const updatedStore = await updateStore.mutateAsync({
        id: storeId,
        isPublished: nextIsPublished,
      });
      queryClient.setQueryData(trpc.store.getForUser.queryKey(), updatedStore);
      await queryClient.invalidateQueries({
        queryKey: trpc.store.getForUser.queryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: trpc.store.getPreview.queryKey(),
      });
      toast.success(
        nextIsPublished
          ? `${storeName} is now live.`
          : `${storeName} is now unpublished.`,
        nextIsPublished
          ? {
              action: {
                label: "View live menu",
                onClick: () => window.location.assign(publicUrl),
              },
            }
          : undefined,
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update publishing:", error);
      toast.error("Failed to update publishing. Please try again.");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Menu visibility</DialogTitle>
            <DialogDescription>
              {isPublished
                ? "Customers can view your live menu."
                : "Customers can't view your menu while it's hidden."}
            </DialogDescription>
          </DialogHeader>

          <div
            className={cn(
              "rounded-md border px-4 py-3",
              isPublished
                ? "border-emerald-200/80 bg-emerald-50/40"
                : "border-amber-200/80 bg-amber-50/40",
            )}
          >
            <div className="text-sm font-medium">
              {isPublished ? "Live" : "Hidden"}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {isPublished
                ? "Your menu is available at your public store link."
                : "Publish when this menu is ready for customers."}
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between">
            {isPublished ? (
              <Button asChild variant="outline" size="sm">
                <a href={publicUrl}>
                  <ExternalLink />
                  View live page
                </a>
              </Button>
            ) : isStorePreviewRoute ? null : (
              <Button asChild variant="outline" size="sm">
                <Link to="/preview/store">
                  <ScrollText />
                  Preview
                </Link>
              </Button>
            )}

            {isPublished ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={updateStore.isPending}
                className="ml-auto"
                onClick={() => setConfirmUnpublishIsOpen(true)}
              >
                Unpublish menu
              </Button>
            ) : (
              <div className="ml-auto">
                <form onSubmit={handlePublishSubmit}>
                  <AnimatedSubmitButton
                    isSubmitting={updateStore.isPending}
                    idleLabel="Publish menu"
                    submittingLabel="Publishing..."
                  />
                </form>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmUnpublishIsOpen}
        onOpenChange={setConfirmUnpublishIsOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Customers will no longer be able to view this menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => updatePublishing(false)}
            >
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PublishingDialog;
