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

type Restaurant = inferRouterOutputs<AppRouter>["restaurant"]["getAll"][number];

interface RestaurantContextValue {
  restaurants: Restaurant[];
  activeRestaurant: Restaurant | null;
  setActiveRestaurant: (r: Restaurant) => void;
  loading: boolean;
}

const RestaurantContext = createContext<RestaurantContextValue | undefined>(
  undefined,
);

export const RestaurantProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { data, isLoading } = useQuery(trpc.restaurant.getAll.queryOptions());
  const [activeRestaurant, setActiveRestaurantState] =
    useState<Restaurant | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const savedId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeRestaurantId")
        : null;
    const found = data.find((r) => r.id === savedId) ?? data[0];
    setActiveRestaurantState(found);
  }, [data]);

  const setActiveRestaurant = useCallback((r: Restaurant) => {
    setActiveRestaurantState(r);
    localStorage.setItem("activeRestaurantId", r.id);
  }, []);

  const value: RestaurantContextValue = {
    restaurants: data ?? [],
    activeRestaurant,
    setActiveRestaurant,
    loading: isLoading,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export function useRestaurantContext() {
  const ctx = useContext(RestaurantContext);
  if (!ctx)
    throw new Error(
      "useRestaurantContext must be used within RestaurantProvider",
    );
  return ctx;
}
