import { Share, SquarePlus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface InstallAppDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hasNativePrompt: boolean;
}

const InstallAppDrawer = ({
  isOpen,
  onOpenChange,
  hasNativePrompt,
}: InstallAppDialogProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="m-4 mx-auto max-w-md rounded-3xl data-[swipe-direction=down]:rounded-t-3xl">
        <DrawerHeader className="mb-2">
          <DrawerTitle>Add MenuNook to your Home Screen</DrawerTitle>
          <DrawerDescription>
            Open your store dashboard from your device with one tap.
          </DrawerDescription>
        </DrawerHeader>
        <InstallAppInstructions hasNativePrompt={hasNativePrompt} />
      </DrawerContent>
    </Drawer>
  );
};

const InstallAppInstructions = ({
  hasNativePrompt,
}: {
  hasNativePrompt: boolean;
}) => {
  if (hasNativePrompt) {
    return (
      <p className="text-muted-foreground px-4 pb-4 text-sm">
        Follow the browser prompt to install MenuNook on this device.
      </p>
    );
  }

  return (
    <div className="grid gap-3 px-4 pb-4 text-sm font-[420]">
      <div className="flex gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-white">
          <Share className="size-4" aria-hidden="true" />
        </span>
        <p>
          On iPhone or iPad, tap Share, choose Add to Home Screen, then tap Add.
        </p>
      </div>
      <div className="flex gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-white">
          <SquarePlus className="size-4" aria-hidden="true" />
        </span>
        <p>
          On Android, open the browser menu and choose Install app or Add to
          Home screen.
        </p>
      </div>
    </div>
  );
};

export default InstallAppDrawer;
