import {
  Download,
  Ellipsis,
  Eye,
  EyeOff,
  LogOut,
  MessageSquare,
  Search,
  Store,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FormDialog from "../dialogs/FormDialog";
import { StoreDetailsForm } from "../forms/StoreDetailsForm";
import { StoreDiscoveryForm } from "../forms/StoreDiscoveryForm";
import UserFeedbackForm from "../forms/UserFeedbackForm";
import InstallAppDialog from "./InstallAppDrawer";
import PublishingDialog from "./PublishingDialog";
import type { StoreRecord } from "@/types/store";
import { Button } from "../ui/button";

type AccountMenuDialog =
  | "publishing"
  | "store"
  | "search"
  | "feedback"
  | "install";

interface OwnerAccountMenuProps {
  store: StoreRecord;
}

const OwnerAccountMenu = ({ store }: OwnerAccountMenuProps) => {
  const { canShowInstallAction, hasNativePrompt, promptInstall } =
    usePwaInstall();
  const isMobile = useIsMobile();
  const shouldShowInstallAction =
    canShowInstallAction && (isMobile || hasNativePrompt);
  const [activeDialog, setActiveDialog] = useState<AccountMenuDialog | null>(
    null,
  );
  const VisibilityIcon = store.is_published ? Eye : EyeOff;

  const openDialog = (dialog: AccountMenuDialog) => {
    setActiveDialog(dialog);
  };

  const handleInstallApp = async () => {
    const prompted = await promptInstall();

    if (!prompted) {
      openDialog("install");
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Open account menu"
          >
            <Ellipsis className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-sm font-[420]">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => openDialog("publishing")}>
              <VisibilityIcon />
              Menu Visibility
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openDialog("search")}>
              <Search />
              Search Appearance
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openDialog("store")}>
              <Store />
              Store profile
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuGroup>
            {shouldShowInstallAction ? (
              <DropdownMenuItem onSelect={handleInstallApp}>
                <Download />
                Install app
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onSelect={() => openDialog("feedback")}>
              <MessageSquare />
              Send feedback
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogOut}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PublishingDialog
        isOpen={activeDialog === "publishing"}
        onOpenChange={(open) => setActiveDialog(open ? "publishing" : null)}
        isPublished={store.is_published}
        storeId={store.id}
        storeMenuSlug={store.menu_slug}
        storeName={store.name}
      />
      <FormDialog
        title="Search Appearance"
        description="Tune how your store appears in search results."
        isDialogOpen={activeDialog === "search"}
        setIsDialogOpen={(open) => setActiveDialog(open ? "search" : null)}
        formComponent={
          <StoreDiscoveryForm
            store={store}
            onSuccess={() => setActiveDialog(null)}
          />
        }
      />
      <FormDialog
        title="Store profile"
        description="Update the store name, link, and logo customers see."
        isDialogOpen={activeDialog === "store"}
        setIsDialogOpen={(open) => setActiveDialog(open ? "store" : null)}
        formComponent={
          <StoreDetailsForm
            store={store}
            onSuccess={() => setActiveDialog(null)}
          />
        }
      />
      <FormDialog
        title="Send feedback"
        description="Tell us what is confusing, broken, or could be better."
        isDialogOpen={activeDialog === "feedback"}
        setIsDialogOpen={(open) => setActiveDialog(open ? "feedback" : null)}
        formComponent={
          <UserFeedbackForm onSuccess={() => setActiveDialog(null)} />
        }
      />
      <InstallAppDialog
        isOpen={activeDialog === "install"}
        onOpenChange={(open) => setActiveDialog(open ? "install" : null)}
        hasNativePrompt={hasNativePrompt}
      />
    </>
  );
};

export default OwnerAccountMenu;
