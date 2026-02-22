import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { searchFarmers } from "@/api/search";
import { searchQueryAtom, paginationAtom } from "@/atoms";

export function useSearchFarmers() {
  const query = useAtomValue(searchQueryAtom);
  const pagination = useAtomValue(paginationAtom);
  return useQuery({
    queryKey: ["search", query, pagination.page, pagination.limit],
    queryFn: () => searchFarmers(query.trim(), pagination.page, pagination.limit),
    enabled: query.trim().length > 0,
  });
}
