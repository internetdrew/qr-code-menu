import { trpc } from "@/utils/trpc";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteItemAlertDialogProps {
  item: {
    id: number;
    name: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteItemAlertDialog = ({
  item,
  open,
  onOpenChange,
}: DeleteItemAlertDialogProps) => {
  const queryClient = useQueryClient();
  const deleteItem = useMutation(
    trpc.storeCategoryItem.delete.mutationOptions(),
  );

  if (!item) return null;

  const onDelete = async () => {
    await deleteItem.mutateAsync(
      {
        id: item.id,
      },
      {
        onSuccess: () => {
          toast.success(`${item.name} has been deleted.`);
          queryClient.invalidateQueries({
            queryKey: trpc.storeCategoryItem.getSortedForCategory.queryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.store.getPreview.queryKey(),
          });
          onOpenChange(false);
        },
        onError: () => {
          toast.error(`Failed to delete ${item.name}. Please try again.`);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete <span className="text-destructive">{item.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-semibold">{item.name}</span> from your menu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteItemAlertDialog;
