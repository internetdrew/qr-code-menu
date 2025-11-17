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
import { useEffect, useState } from "react";
import type { AppRouter } from "../../server";
import type { inferRouterOutputs } from "@trpc/server";
import { toast } from "sonner";
import FormDialog from "./dialogs/FormDialog";
import CategoryForm from "./forms/CategoryForm";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
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
  const updateCategoryOrderMutation = useMutation(
    trpc.category.updateOrder.mutationOptions(),
  );

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategoryIndexes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        updateCategoryOrderMutation.mutateAsync(
          {
            placeId: activePlace!.id,
            newCategoryOrder: newOrder.map((catIndex) => ({
              indexId: catIndex.id,
              categoryId: catIndex.category.id,
            })),
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: trpc.category.getAllSortedByIndex.queryKey(),
              });
              toast.success("Category order updated.");
            },
            onError: (error) => {
              console.error("Failed to update category order:", error);
              toast.error("Failed to update category order. Please try again.");
            },
          },
        );

        return newOrder;
      });
    }
  };

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categoryIndexes.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <DropdownMenuGroup>
                {categoryIndexes?.map((index) => (
                  <SortableCategoryItem
                    key={index.id}
                    categoryIndex={index}
                    onEdit={handleEdit}
                    onDelete={promptCategoryDelete}
                  />
                ))}
              </DropdownMenuGroup>
            </SortableContext>
          </DndContext>
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

const SortableCategoryItem = ({
  categoryIndex,
  onEdit,
  onDelete,
}: {
  categoryIndex: CategoryIndex;
  onEdit: (category: CategoryIndex["category"]) => void;
  onDelete: (category: CategoryIndex["category"]) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoryIndex.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <button
        className="cursor-grab px-1 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="text-muted-foreground h-4 w-4" />
      </button>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex-1">
          {categoryIndex.category.name}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onEdit(categoryIndex.category)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(categoryIndex.category)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </div>
  );
};
