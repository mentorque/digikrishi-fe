import { create } from "zustand";
import type { CsvUploadJob } from "@/types";

interface CsvState {
  currentJobId: string | null;
  jobStatus: CsvUploadJob | null;
  setJobId: (jobId: string | null) => void;
  setJobStatus: (status: CsvUploadJob | null) => void;
  isPolling: boolean;
  setPolling: (polling: boolean) => void;
  isTerminal: () => boolean;
}

export const useCsvStore = create<CsvState>((set, get) => ({
  currentJobId: null,
  jobStatus: null,
  setJobId: (jobId) => set({ currentJobId: jobId }),
  setJobStatus: (jobStatus) => set({ jobStatus }),
  isPolling: false,
  setPolling: (polling) => set({ isPolling: polling }),
  isTerminal: () => {
    const s = get().jobStatus?.status;
    return s === "COMPLETED" || s === "FAILED";
  },
}));
