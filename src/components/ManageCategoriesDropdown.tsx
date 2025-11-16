import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlaceContext } from "@/contexts/ActivePlaceContext";
import { queryClient, trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import type { AppRouter } from "../../server";
import type { inferRouterOutputs } from "@trpc/server";
import { toast } from "sonner";
import FormDialog from "./dialogs/FormDialog";
import CategoryForm from "./forms/CreateCategoryForm";

export type Category =
  inferRouterOutputs<AppRouter>["category"]["getAllByPlace"][number];

const ManageCategoriesDropdown = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [renderCategoryDialog, setRenderCategoryDialog] = useState(false);
  const [categoryForEdit, setCategoryForEdit] = useState<Category | null>(null);

  const { activePlace } = usePlaceContext();

  const { data: categories } = useQuery(
    trpc.category.getAllByPlace.queryOptions(
      {
        placeId: activePlace?.id ?? "",
      },
      {
        enabled: !!activePlace,
      },
    ),
  );

  const promptCategoryDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button className="ml-auto">Manage Categories</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {categories?.map((category) => (
              <DropdownMenuSub key={category.id}>
                <DropdownMenuSubTrigger>{category.name}</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setCategoryForEdit(category);
                        setRenderCategoryDialog(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => promptCategoryDelete(category)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setCategoryForEdit(null);
              setRenderCategoryDialog(true);
            }}
          >
            + Add New Category
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>

      <FormDialog
        title={
          categoryForEdit ? `Edit ${categoryForEdit.name}` : "Add Category"
        }
        description={
          categoryForEdit
            ? `Edit your ${categoryForEdit.name} category. You can update the name and other details.`
            : "Add a new category to your menu. You can add items to this category afterward."
        }
        isDialogOpen={renderCategoryDialog}
        setIsDialogOpen={setRenderCategoryDialog}
        formComponent={
          <CategoryForm
            category={categoryForEdit}
            onSuccess={() => setRenderCategoryDialog(false)}
          />
        }
      />

      <DeleteCategoryAlertDialog
        category={categoryToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};

export default ManageCategoriesDropdown;

const DeleteCategoryAlertDialog = ({
  category,
  open,
  onOpenChange,
}: {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const deleteCategoryMutation = useMutation(
    trpc.category.delete.mutationOptions(),
  );

  const deleteCategory = async () => {
    if (category) {
      await deleteCategoryMutation.mutateAsync(
        { categoryId: category.id },
        {
          onSuccess: () => {
            toast.success(`${category.name} has been deleted.`);
            queryClient.invalidateQueries({
              queryKey: trpc.category.getAllByPlace.queryKey(),
            });
            onOpenChange(false);
          },
          onError: (error) => {
            console.error("Failed to delete category:", error);
            toast.error(`Failed to delete ${category.name}. Please try again.`);
          },
        },
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete the{" "}
            <span className="text-pink-600">{category?.name}</span> category?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold">{category?.name}</span> and all of
            its associated items. If you just want to change the name, please
            use the <span className="font-semibold">Edit</span> option instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCategory}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
