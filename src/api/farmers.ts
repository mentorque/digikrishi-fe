import { api } from "@/lib/axios";
import type { Farmer, FarmerCreatePayload, PaginationState } from "@/types";

export interface FarmersListResponse {
  farmers: Farmer[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchFarmers(params: PaginationState): Promise<FarmersListResponse> {
  const { data } = await api.get<FarmersListResponse>("/farmers", {
    params: { page: params.page, limit: params.limit },
  });
  return data;
}

export async function fetchFarmer(id: string): Promise<Farmer> {
  const { data } = await api.get<Farmer>(`/farmers/${id}`);
  return data;
}

export async function createFarmer(payload: FarmerCreatePayload): Promise<Farmer> {
  const { data } = await api.post<Farmer>("/farmers", payload);
  return data;
}

export async function updateFarmer(id: string, payload: Partial<FarmerCreatePayload>): Promise<Farmer> {
  const { data } = await api.put<Farmer>(`/farmers/${id}`, payload);
  return data;
}

export async function deleteFarmer(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/farmers/${id}`);
  return data;
}

export async function assignFarmerToAgent(farmerId: string, agentId: string | null): Promise<Farmer> {
  const { data } = await api.patch<Farmer>(`/farmers/${farmerId}/agent`, { agent_id: agentId });
  return data;
}
