import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 min-h-dvh bg-black/50 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Popup>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className="fixed inset-0 z-50 flex items-end justify-center"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "group/drawer-popup bg-background fixed z-50 flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden border shadow-lg transition-transform duration-300 outline-none data-swiping:duration-0",
            "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:[transform:translateY(var(--drawer-swipe-movement-y))] data-[swipe-direction=down]:rounded-t-lg data-[swipe-direction=down]:border-t data-[swipe-direction=down]:data-ending-style:translate-y-full data-[swipe-direction=down]:data-starting-style:translate-y-full",
            "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:[transform:translateY(var(--drawer-swipe-movement-y))] data-[swipe-direction=up]:rounded-b-lg data-[swipe-direction=up]:border-b data-[swipe-direction=up]:data-ending-style:-translate-y-full data-[swipe-direction=up]:data-starting-style:-translate-y-full",
            "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:h-full data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:[transform:translateX(var(--drawer-swipe-movement-x))] data-[swipe-direction=right]:border-l data-[swipe-direction=right]:data-ending-style:translate-x-full data-[swipe-direction=right]:data-starting-style:translate-x-full data-[swipe-direction=right]:sm:max-w-sm",
            "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:h-full data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:[transform:translateX(var(--drawer-swipe-movement-x))] data-[swipe-direction=left]:border-r data-[swipe-direction=left]:data-ending-style:-translate-x-full data-[swipe-direction=left]:data-starting-style:-translate-x-full data-[swipe-direction=left]:sm:max-w-sm",
            className,
          )}
          {...props}
        >
          <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[swipe-axis=y]/drawer-popup:block" />
          <DrawerPrimitive.Content data-slot="drawer-content-inner">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 text-center md:gap-1.5 md:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function DrawerSwipeHandle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-swipe-handle"
      className={cn(
        "bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerSwipeHandle,
};
