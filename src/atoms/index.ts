import { atom } from "jotai";
import type { PaginationState, FarmerFilters } from "@/types";

export const searchQueryAtom = atom("");
export const paginationAtom = atom<PaginationState>({ page: 1, limit: 20 });
export const farmerFiltersAtom = atom<FarmerFilters>({});
export const rowSelectionAtom = atom<Set<string>>(new Set<string>());
