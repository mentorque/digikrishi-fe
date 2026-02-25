import { api } from "@/lib/axios";
import type { Farmer, FarmerDoc, FarmerCreatePayload, PaginationState } from "@/types";

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

export async function fetchFarmerDocuments(id: string): Promise<FarmerDoc | null> {
  const { data } = await api.get<FarmerDoc | null>(`/farmers/${id}/documents`);
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

// Profile & document (S3) – download URL, delete
export async function getProfileDownloadUrl(farmerId: string): Promise<{ url: string }> {
  const { data } = await api.get<{ url: string }>(`/farmers/${farmerId}/profile/download-url`);
  return data;
}

export async function getDocumentDownloadUrl(farmerId: string, docType: string): Promise<{ url: string }> {
  const { data } = await api.get<{ url: string }>(`/farmers/${farmerId}/documents/download-url`, {
    params: { docType },
  });
  return data;
}

export async function deleteProfile(farmerId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/farmers/${farmerId}/profile`);
  return data;
}

export async function deleteDocument(farmerId: string, docType: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/farmers/${farmerId}/documents/${docType}`);
  return data;
}

export async function uploadProfileImage(
  farmerId: string,
  file: File,
  overwrite = false
): Promise<{ message: string; profile_pic_url: string }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ message: string; profile_pic_url: string }>(
    `/farmers/${farmerId}/profile/upload`,
    form,
    { params: overwrite ? { overwrite: "true" } : undefined }
  );
  return data;
}

// Legacy presign flow (kept for documents); profile now uses uploadProfileImage
export async function getProfilePresignUrl(farmerId: string, overwrite = false): Promise<{ uploadUrl: string; key: string }> {
  const { data } = await api.post<{ uploadUrl: string; key: string }>(
    `/farmers/${farmerId}/profile/presign`,
    {},
    { params: overwrite ? { overwrite: "true" } : undefined }
  );
  return data;
}

export async function registerProfileUpload(farmerId: string, key: string, overwrite = false): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/farmers/${farmerId}/profile/register`, {
    key,
    overwrite,
  });
  return data;
}

// Document upload: one call (file → backend → S3 → register)
export async function uploadDocument(
  farmerId: string,
  file: File,
  docType: string
): Promise<{ message: string; docType: string; key: string }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ message: string; docType: string; key: string }>(
    `/farmers/${farmerId}/documents/upload`,
    form,
    { params: { docType } }
  );
  return data;
}

export async function getDocumentPresignUrl(farmerId: string, docType: string): Promise<{ uploadUrl: string; key: string }> {
  const { data } = await api.post<{ uploadUrl: string; key: string }>(
    `/farmers/${farmerId}/documents/presign`,
    {},
    { params: { docType } }
  );
  return data;
}

export async function registerDocumentUpload(
  farmerId: string,
  key: string,
  docType: string
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/farmers/${farmerId}/documents/register`, {
    key,
    docType,
  });
  return data;
}
