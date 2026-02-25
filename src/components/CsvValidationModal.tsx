import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Upload, FileSpreadsheet, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Expected columns ─────────────────────────────────────────────────────────
export const EXPECTED_COLUMNS: {
  key: string;
  label: string;
  aliases: string[];
  required: boolean;
  group: string;
}[] = [
  { key: "farmer_code",    label: "Farmer Code",    aliases: ["farmer_code", "farmerCode", "Farmer Code"], required: true,  group: "Core" },
  { key: "name",           label: "Name",           aliases: ["name", "Name"],                             required: true,  group: "Core" },
  { key: "gender",         label: "Gender",         aliases: ["gender", "Gender"],                         required: false, group: "Core" },
  { key: "dob",            label: "Date of Birth",  aliases: ["dob", "DOB"],                               required: false, group: "Core" },
  { key: "education",      label: "Education",      aliases: ["education", "Education"],                   required: false, group: "Core" },
  { key: "kyc_status",     label: "KYC Status",     aliases: ["kyc_status", "kycStatus"],                  required: false, group: "Core" },
  { key: "profile_pic_url", label: "Profile Pic URL", aliases: ["profile_pic_url", "profilePicUrl", "Profile Pic URL"], required: false, group: "Core" },
  { key: "village",        label: "Village",        aliases: ["village", "Village"],                       required: false, group: "Address" },
  { key: "taluka",         label: "Taluka",         aliases: ["taluka", "Taluka"],                         required: false, group: "Address" },
  { key: "district",       label: "District",       aliases: ["district", "District"],                     required: false, group: "Address" },
  { key: "state",          label: "State",          aliases: ["state", "State"],                           required: false, group: "Address" },
  { key: "pincode",        label: "Pincode",        aliases: ["pincode", "Pincode"],                       required: false, group: "Address" },
  { key: "landmark",       label: "Landmark",       aliases: ["landmark", "Landmark"],                     required: false, group: "Address" },
  { key: "fpc",            label: "FPC",            aliases: ["fpc", "FPC"],                               required: false, group: "Profile" },
  { key: "shg",            label: "SHG",            aliases: ["shg", "SHG"],                               required: false, group: "Profile" },
  { key: "caste",          label: "Caste",          aliases: ["caste", "Caste"],                           required: false, group: "Profile" },
  { key: "social_category", label: "Social Category", aliases: ["social_category", "socialCategory", "Social Category"], required: false, group: "Profile" },
  { key: "ration_card",    label: "Ration Card",    aliases: ["ration_card", "rationCard", "Ration Card"], required: false, group: "Profile" },
  { key: "pan_url",        label: "PAN URL",        aliases: ["pan_url", "panUrl", "PAN URL"],             required: false, group: "Documents" },
  { key: "aadhaar_url",    label: "Aadhaar URL",    aliases: ["aadhaar_url", "aadhaarUrl", "Aadhaar URL"], required: false, group: "Documents" },
];

const GROUPS = ["Core", "Address", "Profile", "Documents"] as const;

export interface ColumnMatch {
  key: string;
  label: string;
  group: string;
  required: boolean;
  detected: boolean;
  detectedAs: string | null;
}

export function analyzeColumns(csvHeaders: string[]) {
  const matches: ColumnMatch[] = EXPECTED_COLUMNS.map((col) => {
    const hit = csvHeaders.find((h) =>
      col.aliases.map((a) => a.toLowerCase()).includes(h.trim().toLowerCase())
    );
    return { key: col.key, label: col.label, group: col.group, required: col.required, detected: !!hit, detectedAs: hit ?? null };
  });

  const allAliasesLower = EXPECTED_COLUMNS.flatMap((c) => c.aliases.map((a) => a.toLowerCase()));
  const unknowns = csvHeaders
    .map((h) => h.trim())
    .filter((h) => !allAliasesLower.includes(h.toLowerCase()));

  const missingRequired = matches.filter((m) => m.required && !m.detected).map((m) => m.label);
  const matchedCount = matches.filter((m) => m.detected).length;
  return { matches, unknowns, missingRequired, matchedCount };
}

export interface CsvValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  rowCount: number | null;
  csvHeaders: string[];
  /** Called with the set of CSV header strings to exclude from the upload */
  onConfirm: (rejectedHeaders: Set<string>) => void;
  isUploading: boolean;
}

export function CsvValidationModal({
  open,
  onOpenChange,
  fileName,
  rowCount,
  csvHeaders,
  onConfirm,
  isUploading,
}: CsvValidationModalProps) {
  const { matches, unknowns, missingRequired, matchedCount } = analyzeColumns(csvHeaders);

  // Keys of optional matched columns the user wants to reject
  const [rejectedKeys, setRejectedKeys] = useState<Set<string>>(new Set());

  // Reset rejections when file/headers change
  useEffect(() => { setRejectedKeys(new Set()); }, [csvHeaders]);

  function toggleReject(key: string) {
    setRejectedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // Derive which CSV headers to drop (resolved from detectedAs of rejected keys)
  function buildRejectedHeaders(): Set<string> {
    const s = new Set<string>();
    for (const key of rejectedKeys) {
      const col = matches.find((m) => m.key === key);
      if (col?.detectedAs) s.add(col.detectedAs);
    }
    return s;
  }

  // Required columns that the user has explicitly rejected should block upload
  const rejectedRequired = matches.filter((m) => m.required && rejectedKeys.has(m.key));
  const missingRequiredAfterReject = [
    ...missingRequired,
    ...rejectedRequired.map((m) => m.label),
  ];
  const canUpload = missingRequiredAfterReject.length === 0;

  const activeMatched = matches.filter((m) => m.detected && !rejectedKeys.has(m.key)).length;
  const rejectedCount = rejectedKeys.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100vw-2rem),56rem)] max-w-[56rem] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-r from-card to-muted/20">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 shrink-0 mt-0.5">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg">Column validation</DialogTitle>
              <DialogDescription className="mt-0.5 space-y-0.5">
                <span className="font-medium text-foreground block truncate">{fileName}</span>
                {rowCount !== null && (
                  <span className="text-muted-foreground">{rowCount.toLocaleString()} data rows detected</span>
                )}
              </DialogDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatChip icon={<CheckCircle2 className="h-3.5 w-3.5" />} label={`${activeMatched} columns included`}  color="emerald" />
            {rejectedCount > 0 && (
              <StatChip icon={<Ban className="h-3.5 w-3.5" />}         label={`${rejectedCount} rejected`}          color="red" />
            )}
            {unknowns.length > 0 && (
              <StatChip icon={<AlertCircle className="h-3.5 w-3.5" />} label={`${unknowns.length} unrecognised`}    color="amber" />
            )}
            {missingRequired.length > 0 && (
              <StatChip icon={<XCircle className="h-3.5 w-3.5" />}     label={`${missingRequired.length} required missing`} color="red" />
            )}
          </div>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-6">

          {/* Per-group table */}
          {GROUPS.map((group) => {
            const groupCols = matches.filter((m) => m.group === group);
            if (groupCols.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                  {group}
                  <span className="font-normal normal-case tracking-normal">
                    {groupCols.filter((c) => c.detected && !rejectedKeys.has(c.key)).length}/{groupCols.length} active
                  </span>
                </p>
                <div className="rounded-xl border border-border overflow-hidden shadow-xs">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
                        <th className="px-3 py-2.5 text-left font-semibold">Expected column</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Detected as</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Status</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {groupCols.map((col) => {
                        const rejected = rejectedKeys.has(col.key);
                        return (
                          <tr
                            key={col.key}
                            className={cn(
                              "transition-colors",
                              rejected
                                ? "bg-red-50/60 dark:bg-red-950/20 opacity-60"
                                : col.detected
                                  ? "bg-emerald-50/50 dark:bg-emerald-950/15"
                                  : col.required
                                    ? "bg-red-50/60 dark:bg-red-950/20"
                                    : "bg-card hover:bg-muted/20"
                            )}
                          >
                            <td className="px-3 py-2.5 font-medium">
                              <span className={cn(rejected && "line-through text-muted-foreground")}>
                                {col.label}
                              </span>
                              {col.required && (
                                <span className="ml-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">req</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              {col.detectedAs ? (
                                <code className={cn(
                                  "text-xs px-1.5 py-0.5 rounded",
                                  rejected
                                    ? "bg-muted text-muted-foreground line-through"
                                    : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                                )}>
                                  {col.detectedAs}
                                </code>
                              ) : (
                                <span className="text-xs italic text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              {rejected ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                                  <Ban className="h-3.5 w-3.5" /> Rejected
                                </span>
                              ) : col.detected ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Included
                                </span>
                              ) : col.required ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                                  <XCircle className="h-3.5 w-3.5" /> Missing
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <AlertCircle className="h-3.5 w-3.5" /> Optional
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {col.detected ? (
                                <button
                                  type="button"
                                  onClick={() => toggleReject(col.key)}
                                  className={cn(
                                    "text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors",
                                    rejected
                                      ? "border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                      : "border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  )}
                                  title={rejected ? "Include this column" : "Reject this column"}
                                >
                                  {rejected ? "Restore" : "Reject"}
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Unrecognised columns */}
          {unknowns.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                Unrecognised — will be ignored by backend
              </p>
              <div className="flex flex-wrap gap-2">
                {unknowns.map((h) => (
                  <code key={h} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                    {h}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Alias reference */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Accepted header aliases for required fields</p>
            <div className="flex flex-col gap-1">
              {EXPECTED_COLUMNS.filter((c) => c.required).map((c) => (
                <span key={c.key} className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{c.label}:</span>{" "}
                  {c.aliases.join(", ")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/10 flex-wrap gap-2">
          {!canUpload && (
            <p className="text-sm text-destructive flex-1 flex items-center gap-1">
              <XCircle className="h-4 w-4 shrink-0" />
              Required column{missingRequiredAfterReject.length > 1 ? "s" : ""} missing or rejected:{" "}
              <strong>{missingRequiredAfterReject.join(", ")}</strong>
            </p>
          )}
          {canUpload && rejectedCount > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex-1 flex items-center gap-1">
              <Ban className="h-4 w-4 shrink-0" />
              {rejectedCount} column{rejectedCount > 1 ? "s" : ""} will be stripped from the upload.
            </p>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(buildRejectedHeaders())}
            disabled={!canUpload}
            loading={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatChip({ icon, label, color }: { icon: React.ReactNode; label: string; color: "emerald" | "amber" | "red" }) {
  const colors = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    amber:   "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    red:     "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", colors[color])}>
      {icon}{label}
    </span>
  );
}
