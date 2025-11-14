import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { trpc } from "@/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../server";
import { useQuery } from "@tanstack/react-query";

type Place = inferRouterOutputs<AppRouter>["place"]["getAll"][number];

interface PlaceContextValue {
  places: Place[];
  activePlace: Place | null;
  setActivePlace: (r: Place) => void;
  loading: boolean;
}

const PlaceContext = createContext<PlaceContextValue | undefined>(undefined);

export const PlaceProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { data, isLoading } = useQuery(trpc.place.getAll.queryOptions());
  const [activePlace, setActivePlaceState] = useState<Place | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const savedId =
      typeof window !== "undefined"
        ? localStorage.getItem("activePlaceId")
        : null;
    const found = data.find((r) => r.id === savedId) ?? data[0];
    setActivePlaceState(found);
  }, [data]);

  const setActivePlace = useCallback((r: Place) => {
    setActivePlaceState(r);
    localStorage.setItem("activePlaceId", r.id);
  }, []);

  const value: PlaceContextValue = {
    places: data ?? [],
    activePlace,
    setActivePlace,
    loading: isLoading,
  };

  return (
    <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>
  );
};

export function usePlaceContext() {
  const ctx = useContext(PlaceContext);
  if (!ctx)
    throw new Error("usePlaceContext must be used within PlaceProvider");
  return ctx;
}
