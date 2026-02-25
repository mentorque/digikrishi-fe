import { useQuery } from "@tanstack/react-query";
import { fetchFarmer } from "@/api/farmers";

export function useFarmer(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["farmer", id],
    queryFn: () => fetchFarmer(id!),
    enabled: !!id && enabled,
  });
}
