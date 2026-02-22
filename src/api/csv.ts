import { api } from "@/lib/axios";
import type { CsvUploadJob } from "@/types";

export interface CsvUploadResponse {
  message: string;
  jobId: string;
}

export async function uploadCsv(file: File): Promise<CsvUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<CsvUploadResponse>("/csv/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchCsvJobStatus(jobId: string): Promise<CsvUploadJob> {
  const { data } = await api.get<CsvUploadJob>(`/csv/status/${jobId}`);
  return data;
}
