import { useRef, useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadCsv } from "@/api/csv";
import { useCsvStore } from "@/stores/csvStore";
import { useCsvJobStatus } from "@/hooks/useCsvJobStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loader";
import { CsvValidationModal } from "@/components/CsvValidationModal";
import { getErrorMessage } from "@/lib/utils";
import { Upload, FileSpreadsheet, X } from "lucide-react";

function parseCsvHeaders(file: File): Promise<{ headers: string[]; rowCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return resolve({ headers: [], rowCount: 0 });
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return resolve({ headers: [], rowCount: 0 });
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      resolve({ headers, rowCount: Math.max(0, lines.length - 1) });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file.slice(0, 8192));
  });
}

/**
 * Read the full CSV, drop rejected columns, and return a new File.
 * A column is identified by its original header string (case-sensitive, matching detectedAs).
 */
function stripColumnsFromCsv(file: File, rejectedHeaders: Set<string>): Promise<File> {
  return new Promise((resolve, reject) => {
    if (rejectedHeaders.size === 0) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return resolve(file);
      const lines = text.split(/\r?\n/);
      if (lines.length === 0) return resolve(file);

      // Parse header row to find indices to drop
      const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const dropIndices = new Set<number>();
      rawHeaders.forEach((h, i) => {
        if (rejectedHeaders.has(h)) dropIndices.add(i);
      });

      if (dropIndices.size === 0) return resolve(file);

      const filteredLines = lines.map((line) => {
        if (!line.trim()) return "";
        const cells = line.split(",");
        return cells.filter((_, i) => !dropIndices.has(i)).join(",");
      }).filter((l) => l !== "");

      const blob = new Blob([filteredLines.join("\n")], { type: "text/csv" });
      resolve(new File([blob], file.name, { type: "text/csv" }));
    };
    reader.onerror = () => reject(new Error("Failed to read file for column stripping"));
    reader.readAsText(file);
  });
}

export function CsvUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRowCount, setCsvRowCount] = useState<number | null>(null);
  const [validationOpen, setValidationOpen] = useState(false);
  const { currentJobId, setJobId, setJobStatus, jobStatus } = useCsvStore();

  const uploadMutation = useMutation({
    mutationFn: uploadCsv,
    onSuccess: (res) => {
      setJobId(res.jobId);
      setFile(null);
      setCsvHeaders([]);
      setCsvRowCount(null);
      setValidationOpen(false);
      toast.success(res?.message ?? "CSV upload started. Processing in background.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { data: job, isLoading: jobLoading } = useCsvJobStatus(currentJobId);
  useEffect(() => {
    if (job) {
      setJobStatus(job);
      if (job.status === "COMPLETED" || job.status === "FAILED") {
        useCsvStore.getState().setPolling(false);
      }
    }
  }, [job, setJobStatus]);

  useEffect(() => {
    if (currentJobId) useCsvStore.getState().setPolling(true);
  }, [currentJobId]);

  const status = job?.status ?? jobStatus?.status;
  const isTerminal = status === "COMPLETED" || status === "FAILED";

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (currentJobId && isTerminal) {
      setJobId(null);
      setJobStatus(null);
    }
    try {
      const { headers, rowCount } = await parseCsvHeaders(f);
      setCsvHeaders(headers);
      setCsvRowCount(rowCount);
    } catch {
      setCsvHeaders([]);
      setCsvRowCount(null);
    }
  }, [currentJobId, isTerminal, setJobId, setJobStatus]);

  function openValidation() {
    if (!file) return;
    setValidationOpen(true);
  }

  async function handleUpload(rejectedHeaders: Set<string>) {
    if (!file) return;
    const uploadFile = await stripColumnsFromCsv(file, rejectedHeaders);
    uploadMutation.mutate(uploadFile);
  }

  function resetJob() {
    setJobId(null);
    setJobStatus(null);
    setFile(null);
    setCsvHeaders([]);
    setCsvRowCount(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">CSV Upload</h2>
        <p className="text-muted-foreground">Upload a CSV file to bulk import farmers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload file</CardTitle>
          <CardDescription>
            Only tenant accounts can upload CSV. File will be processed in the background.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 transition-colors hover:border-primary/40 hover:bg-muted/40 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
            {file ? (
              <>
                <p className="mb-1 text-sm font-semibold text-foreground">{file.name}</p>
                {csvRowCount !== null && (
                  <p className="text-xs text-muted-foreground mb-1">{csvRowCount.toLocaleString()} data rows · {csvHeaders.length} columns detected</p>
                )}
                <p className="text-xs text-primary underline underline-offset-2">Click to change file</p>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm font-medium text-foreground">Click or drop CSV here</p>
                <p className="text-xs text-muted-foreground">.csv only</p>
              </>
            )}
          </div>

          {file && (
            <div className="flex flex-wrap gap-2 items-center">
              <Button onClick={openValidation} variant="default">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Review & Upload
              </Button>
              <Button variant="ghost" size="icon" onClick={resetJob} title="Remove file">
                <X className="h-4 w-4" />
              </Button>
              {currentJobId && isTerminal && (
                <Button variant="outline" onClick={resetJob}>
                  New upload
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {currentJobId && (
        <Card>
          <CardHeader>
            <CardTitle>Job status</CardTitle>
            <CardDescription>Job ID: {currentJobId}</CardDescription>
          </CardHeader>
          <CardContent>
            {jobLoading && !job ? (
              <PageLoader message="Loading status…" />
            ) : job ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    className={
                      job.status === "COMPLETED"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : job.status === "FAILED"
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-amber-500 bg-amber-100 text-amber-900"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "File", value: job.file_name },
                    { label: "Total rows", value: job.total_rows?.toLocaleString() ?? "—" },
                    { label: "Success", value: job.success_rows?.toLocaleString() ?? "—" },
                    { label: "Failed", value: job.failed_rows?.toLocaleString() ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold truncate mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {file && (
        <CsvValidationModal
          open={validationOpen}
          onOpenChange={setValidationOpen}
          fileName={file.name}
          rowCount={csvRowCount}
          csvHeaders={csvHeaders}
          onConfirm={(rejected) => handleUpload(rejected)}
          isUploading={uploadMutation.isPending}
        />
      )}
    </div>
  );
}
