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
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { AppRouter } from "../../server";
import type { inferRouterOutputs } from "@trpc/server";
import FormDialog from "./dialogs/FormDialog";
import CategoryForm from "./forms/CategoryForm";

import DeleteCategoryAlertDialog from "./dialogs/DeleteCategoryAlertDialog";

export type CategoryIndex =
  inferRouterOutputs<AppRouter>["category"]["getAllSortedByIndex"][number];

const ManageCategoriesDropdown = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<
    CategoryIndex["category"] | null
  >(null);
  const [renderCategoryDialog, setRenderCategoryDialog] = useState(false);
  const [categoryForEdit, setCategoryForEdit] = useState<
    CategoryIndex["category"] | null
  >(null);
  const [categoryIndexes, setCategoryIndexes] = useState<CategoryIndex[]>([]);

  const { activePlace } = usePlaceContext();

  const { data: indexedCategories } = useQuery(
    trpc.category.getAllSortedByIndex.queryOptions(
      {
        placeId: activePlace?.id ?? "",
      },
      {
        enabled: !!activePlace,
      },
    ),
  );

  useEffect(() => {
    if (indexedCategories) {
      setCategoryIndexes(indexedCategories);
    }
  }, [indexedCategories]);

  const promptCategoryDelete = (category: CategoryIndex["category"]) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (category: CategoryIndex["category"]) => {
    setCategoryForEdit(category);
    setRenderCategoryDialog(true);
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
            {categoryIndexes?.map((index) => (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex-1">
                  {index.category.name}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => handleEdit(index.category)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => promptCategoryDelete(index.category)}
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
