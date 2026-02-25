import { api } from "@/lib/axios";
import type { CsvUploadJob } from "@/types";

export interface CsvUploadResponse {
  message: string;
  jobId: string;
}

/** 1) Get presign URL 2) PUT file to S3 3) Register upload with backend. Returns jobId. */
export async function uploadCsv(file: File): Promise<CsvUploadResponse> {
  const { data: presign } = await api.post<{ uploadUrl: string; key: string }>("/csv/presign");
  await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": "text/csv" },
  });
  const { data } = await api.post<CsvUploadResponse>("/csv/upload", {
    key: presign.key,
    fileName: file.name,
  });
  return data;
}

export async function fetchCsvJobStatus(jobId: string): Promise<CsvUploadJob> {
  const { data } = await api.get<CsvUploadJob>(`/csv/status/${jobId}`);
  return data;
}
