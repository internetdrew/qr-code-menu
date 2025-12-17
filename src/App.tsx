import { Link, Outlet } from "react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Separator } from "./components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "./components/ui/breadcrumb";
import { Toaster } from "./components/ui/sonner";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { useState } from "react";
import { Spinner } from "./components/ui/spinner";
import FormDialog from "./components/dialogs/FormDialog";
import { CreateBusinessForm } from "./components/forms/CreateBusinessForm";
import { UserFeedbackTrigger } from "./components/UserFeedbackTrigger";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "./utils/trpc";

function App() {
  const { data: business, isLoading } = useQuery(
    trpc.business.getForUser.queryOptions(),
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger />
            {business && (
              <>
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/dashboard">{business?.name}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </>
            )}
            <UserFeedbackTrigger />
          </div>
        </header>
        <div className="p-4 pt-0">
          {isLoading ? (
            <Spinner className="mx-auto mt-36 size-6 text-pink-600" />
          ) : business ? (
            <Outlet />
          ) : (
            <CreateBusinessPrompt />
          )}
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;

const CreateBusinessPrompt = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card className="mx-auto mt-28 max-w-sm text-center">
        <CardHeader className="text-center">
          <CardTitle>No Business Found</CardTitle>
          <CardDescription>
            Add your business to start managing your menus.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
            Create Business
          </Button>
        </CardFooter>
      </Card>
      <FormDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        title="Create Business"
        description="Fill out the form below to create your business."
        formComponent={
          <CreateBusinessForm onSuccess={() => setIsDialogOpen(false)} />
        }
      />
    </>
  );
};
