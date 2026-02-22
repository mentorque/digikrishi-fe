import { api } from "@/lib/axios";
import type { Farmer } from "@/types";

export interface SearchResponse {
  results: Farmer[];
  total: number;
  page: number;
  limit: number;
}

export async function searchFarmers(
  query: string,
  page: number,
  limit: number
): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>("/search", {
    params: { query, page, limit },
  });
  return data;
}
