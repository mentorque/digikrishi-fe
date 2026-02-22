import { useRef, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadCsv } from "@/api/csv";
import { useCsvStore } from "@/stores/csvStore";
import { useCsvJobStatus } from "@/hooks/useCsvJobStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet } from "lucide-react";

export function CsvUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { currentJobId, setJobId, setJobStatus, jobStatus } = useCsvStore();

  const uploadMutation = useMutation({
    mutationFn: uploadCsv,
    onSuccess: (res) => {
      setJobId(res.jobId);
      setFile(null);
    },
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (currentJobId && isTerminal) {
        setJobId(null);
        setJobStatus(null);
      }
    }
  }

  function handleUpload() {
    if (!file) return;
    uploadMutation.mutate(file);
  }

  function resetJob() {
    setJobId(null);
    setJobStatus(null);
    setFile(null);
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
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 transition-colors hover:border-muted-foreground/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-sm font-medium text-foreground">
              {file ? file.name : "Click or drop CSV here"}
            </p>
            <p className="text-xs text-muted-foreground">.csv only</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </Button>
            {currentJobId && isTerminal && (
              <Button variant="outline" onClick={resetJob}>
                New upload
              </Button>
            )}
          </div>
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
              <p className="text-muted-foreground">Loading status…</p>
            ) : job ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    variant={
                      job.status === "COMPLETED"
                        ? "default"
                        : job.status === "FAILED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="grid gap-1 text-sm text-muted-foreground">
                  <p>File: {job.file_name}</p>
                  <p>Total rows: {job.total_rows}</p>
                  <p>Success: {job.success_rows}</p>
                  <p>Failed: {job.failed_rows}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
