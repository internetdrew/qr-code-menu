import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlaceContext } from "@/contexts/ActivePlaceContext";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";

const CategoriesCard = () => {
  const { activePlace } = usePlaceContext();

  const { data: count, isLoading } = useQuery(
    trpc.category.getCountByPlaceId.queryOptions(
      {
        placeId: activePlace?.id ?? "",
      },
      {
        enabled: !!activePlace,
      },
    ),
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm">Categories</CardTitle>
        {/* <Icon className="text-muted-foreground size-3" /> */}
      </CardHeader>
      <CardContent className="mt-auto">
        {isLoading ? (
          <Skeleton className="h-8 w-8" />
        ) : (
          <p className="text-2xl font-semibold">{count}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesCard;
