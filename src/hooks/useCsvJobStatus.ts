import { useQuery } from "@tanstack/react-query";
import { fetchCsvJobStatus } from "@/api/csv";

const POLL_INTERVAL_MS = 3000;

export function useCsvJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["csv-job", jobId],
    queryFn: () => fetchCsvJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "COMPLETED" || status === "FAILED") return false;
      return POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: true,
  });
}
