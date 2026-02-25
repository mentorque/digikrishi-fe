import { useQuery } from "@tanstack/react-query";
import { fetchFarmerDocuments } from "@/api/farmers";

export function useFarmerDocuments(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["farmer", id, "documents"],
    queryFn: () => fetchFarmerDocuments(id!),
    enabled: !!id && enabled,
  });
}
