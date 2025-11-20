import CategoriesCard from "@/components/home/CategoriesCard";
import ItemsCard from "@/components/home/ItemsCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceContext } from "@/contexts/ActivePlaceContext";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Copy, Download, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const HomePage = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { activePlace } = usePlaceContext();

  const { data, isLoading } = useQuery(
    trpc.qr.getPublicUrlByPlace.queryOptions(
      { placeId: activePlace?.id ?? "" },
      { enabled: !!activePlace },
    ),
  );

  const handleDownload = async () => {
    if (!data?.public_url) return;

    setIsDownloading(true);
    try {
      const response = await fetch(data.public_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${activePlace?.name || "menu"}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("QR code downloaded");
    } catch (error) {
      console.error("Failed to download QR code:", error);
      toast.error("Download failed", {
        description: "Unable to download the QR code. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!data?.public_url) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/menu/${activePlace?.id}`,
      );
      toast.success(
        "Your menu link has been copied to your device's clipboard",
      );
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Copy failed", {
        description: "Unable to copy the link. Please try again.",
      });
    }
  };

  return (
    <div>
      <main>
        <div className="my-4 flex items-center">
          {isLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <>
              <h1 className="font-medium">Home</h1>
              <Popover>
                <PopoverTrigger>
                  <Info className="ml-1 size-3" />
                </PopoverTrigger>
                <PopoverContent className="text-sm">
                  What you're managing, at a glance.
                </PopoverContent>
              </Popover>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="ml-auto">Share Menu</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Your QR Code</DialogTitle>
                    <DialogDescription>
                      Put your camera over the QR code to open your menu.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="my-4 flex justify-center">
                    {data?.public_url ? (
                      <img
                        src={data.public_url}
                        alt="QR Code"
                        className="scale-80"
                      />
                    ) : (
                      <p className="text-muted-foreground text-center text-sm">
                        Unable to generate QR code.
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-4">
                      <Button
                        className="flex-1"
                        onClick={handleDownload}
                        disabled={isDownloading}
                      >
                        <Download /> Download
                      </Button>
                      <Button
                        variant={"outline"}
                        className="flex-1"
                        onClick={handleCopyLink}
                      >
                        <Copy /> Copy Link
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        <div className="my-4 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3">
          <CategoriesCard />
          <ItemsCard />
        </div>
      </main>
    </div>
  );
};
