import FormDialog from "@/components/dialogs/FormDialog";
import { Button } from "@/components/ui/button";
import { usePlaceContext } from "@/contexts/ActivePlaceContext";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from "@/components/DataTable";
import {
  getItemColumns,
  type Item as GetItemColumnsItem,
} from "@/components/table-columns/getItemColumns";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ItemForm from "@/components/forms/ItemForm";
import DeleteItemAlertDialog from "@/components/dialogs/DeleteItemAlertDialog";
import ManageCategoriesDropdown from "@/components/ManageCategoriesDropdown";

export const MenuPage = () => {
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemForEdit, setItemForEdit] = useState<GetItemColumnsItem | null>(
    null,
  );
  const [itemForDelete, setItemForDelete] = useState<GetItemColumnsItem | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<string>("all");

  const { activePlace } = usePlaceContext();

  const { data: categoryIndexes } = useQuery(
    trpc.category.getAllSortedByIndex.queryOptions(
      {
        placeId: activePlace?.id ?? "",
      },
      {
        enabled: !!activePlace,
      },
    ),
  );

  const { data: items, isLoading: isLoadingItems } = useQuery(
    trpc.item.getAllByPlace.queryOptions(
      {
        placeId: activePlace?.id ?? "",
      },
      {
        enabled: !!activePlace,
      },
    ),
  );

  const filteredItems =
    activeTab === "all"
      ? items
      : items?.filter((item) => item.category_id === Number(activeTab));

  const handleEditButtonClick = (item: GetItemColumnsItem) => {
    setItemForEdit(item);
    setIsItemDialogOpen(true);
  };
  const handleDeleteButtonClick = (item: GetItemColumnsItem) => {
    setItemForDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleAddItemClick = () => {
    setItemForEdit(null);
    setItemForDelete(null);
    setIsItemDialogOpen(true);
  };

  const itemColumns = getItemColumns(
    handleEditButtonClick,
    handleDeleteButtonClick,
  );

  return (
    <div>
      <div className="flex">
        <ManageCategoriesDropdown />
      </div>
      <div>
        {categoryIndexes?.length === 0 ? (
          <p className="text-accent-foreground mt-48 text-center">
            Create a category to start adding items to your menu.
          </p>
        ) : (
          <>
            <div className="mt-8 mb-4 flex items-center justify-between">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex items-center"
              >
                <Label htmlFor="view-selector" className="sr-only">
                  View
                </Label>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger
                    className="flex w-fit lg:hidden"
                    size="sm"
                    id="view-selector"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {categoryIndexes?.map((indexedCategory) => (
                      <SelectItem
                        key={indexedCategory.category.id}
                        value={indexedCategory.category.id.toString()}
                      >
                        {indexedCategory.category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ScrollArea className="max-w-xl">
                  <TabsList className="mb-2.5 hidden lg:flex">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {categoryIndexes?.map((indexedCategory) => (
                      <TabsTrigger
                        key={indexedCategory.category.id}
                        value={indexedCategory.category.id.toString()}
                      >
                        {indexedCategory.category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </Tabs>
              <Button variant={"outline"} onClick={handleAddItemClick}>
                Add Item
              </Button>
            </div>
            <DataTable
              isLoading={isLoadingItems}
              columns={itemColumns}
              data={filteredItems ?? []}
            />
          </>
        )}
      </div>

      {categoryIndexes && (
        <FormDialog
          title={itemForEdit ? `Edit ${itemForEdit.name}` : "Add an Item"}
          description="Add a new item to your menu and assign it to a category."
          isDialogOpen={isItemDialogOpen}
          setIsDialogOpen={setIsItemDialogOpen}
          formComponent={
            <ItemForm
              item={itemForEdit}
              categories={categoryIndexes?.map((ic) => ic.category) ?? []}
              onSuccess={() => setIsItemDialogOpen(false)}
            />
          }
        />
      )}

      {itemForDelete && (
        <DeleteItemAlertDialog
          item={itemForDelete}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </div>
  );
};
