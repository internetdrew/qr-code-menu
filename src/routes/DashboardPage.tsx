import { Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/auth";
import { trpc } from "../utils/trpc";
import { Spinner } from "../components/ui/spinner";
import EmptyStatePrompt from "../components/EmptyStatePrompt";
import { CreateBusinessForm } from "../components/forms/CreateBusinessForm";
import { CreateMenuForm } from "../components/forms/CreateMenuForm";
import { useState } from "react";

export function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  const { data: business, isLoading: businessLoading } = useQuery(
    trpc.business.getForUser.queryOptions(undefined, {
      enabled: !!user && !authLoading,
    }),
  );

  const { data: menus, isLoading: menusLoading } = useQuery(
    trpc.menu.getAllForBusiness.queryOptions(
      {
        businessId: business?.id || "",
      },
      { enabled: !!business && !!user && !authLoading },
    ),
  );

  if (authLoading || businessLoading || menusLoading) {
    return <Spinner className="mx-auto mt-36 size-6 text-pink-600" />;
  }

  if (!business) {
    return (
      <EmptyStatePrompt
        cardTitle="No Business Found"
        cardDescription="Add your business to start managing your menus."
        buttonText="Create Business"
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        formComponent={CreateBusinessForm}
        formDialogTitle="Create Business"
        formDialogDescription="Add your business to start managing your menus."
      />
    );
  }

  if (menus?.length === 0) {
    return (
      <EmptyStatePrompt
        cardTitle="No Menus Found"
        cardDescription="Add your first menu to get started."
        buttonText="Create Menu"
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        formComponent={CreateMenuForm}
        formDialogTitle="Create Menu"
        formDialogDescription="Add your first menu to get started."
      />
    );
  }

  return <Outlet />;
}
