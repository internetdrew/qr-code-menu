import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
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
import type { StoreCategoryRecord } from "@/types/store";

const DeleteCategoryAlertDialog = ({
  category,
  open,
  onOpenChange,
}: {
  category: Pick<StoreCategoryRecord, "id" | "name"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const deleteCategoryMutation = useMutation(
    trpc.storeCategory.delete.mutationOptions(),
  );

  const deleteCategory = async () => {
    if (category) {
      await deleteCategoryMutation.mutateAsync(
        { categoryId: category.id },
        {
          onSuccess: () => {
            toast.success(
              `The ${category.name} category has been deleted from your food page.`,
            );
            queryClient.invalidateQueries({
              queryKey: trpc.storeCategory.getAllSortedByIndex.queryKey(),
            });
            queryClient.invalidateQueries({
              queryKey: trpc.store.getPreview.queryKey(),
            });
            onOpenChange(false);
          },
          onError: (error) => {
            console.error("Failed to delete category:", error);
            toast.error(
              `Failed to delete the ${category.name} category. Please try again.`,
            );
          },
        },
      );
    }
  };

  const title = (
    <>
      Are you sure you want to delete the{" "}
      <span className="text-pink-600">{category?.name}</span> category?
    </>
  );
  const description = (
    <>
      This will permanently delete{" "}
      <span className="font-semibold">{category?.name}</span> and all of its
      associated items from your food page. If you just want to change the name,
      cancel this operation use the <span className="font-semibold">Edit</span>{" "}
      option instead.
    </>
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCategory}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeleteCategoryAlertDialog;
