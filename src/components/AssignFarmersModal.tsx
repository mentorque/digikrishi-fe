import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Farmer } from "@/types";

export interface AssignFarmersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officers: Array<{ id: string; email?: string | null }>;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: Farmer[];
  searchLoading: boolean;
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  agentId: string;
  onAgentIdChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitError: Error | null;
}

export function AssignFarmersModal({
  open,
  onOpenChange,
  officers,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searchLoading,
  selectedIds,
  onToggleSelected,
  agentId,
  onAgentIdChange,
  onSubmit,
  isSubmitting,
  submitError,
}: AssignFarmersModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100vw-2rem),42rem)] max-w-[42rem] max-h-[88vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Assign farmers to field officer</DialogTitle>
          <DialogDescription>
            Search for farmers, select one or more, then choose the field officer to assign (or None to unassign).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden flex">
          <div className="px-6 pb-4 space-y-4 flex-shrink-0">
            <div className="grid gap-2">
              <Label htmlFor="assign-search">Search farmers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="assign-search"
                  type="search"
                  placeholder="Name, code, village…"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 min-h-0 px-6 pb-4">
            <div className="flex items-center justify-between gap-2 flex-shrink-0 mb-2">
              <Label className="text-sm font-medium">Select farmers</Label>
              {searchResults.length > 0 && (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {selectedIds.size} selected · {searchResults.length} shown
                </span>
              )}
            </div>
            <div className="border border-border rounded-lg flex-1 min-h-[240px] max-h-[min(45vh,360px)] overflow-y-auto bg-muted/20 p-2">
              {searchQuery.trim().length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">
                  Type in the search box to find farmers by name, code, or village.
                </p>
              ) : searchLoading ? (
                <p className="p-6 text-sm text-muted-foreground text-center">Searching…</p>
              ) : searchResults.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">No farmers found. Try a different search.</p>
              ) : (
                <ul className="divide-y divide-border space-y-0.5">
                  {searchResults.map((f) => {
                    const isSelected = selectedIds.has(f.id);
                    return (
                      <li key={f.id}>
                        <label
                          htmlFor={`assign-${f.id}`}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors border border-transparent hover:bg-muted/60 ${isSelected ? "bg-primary/15 border-primary/30" : ""}`}
                        >
                          <input
                            type="checkbox"
                            id={`assign-${f.id}`}
                            checked={isSelected}
                            onChange={() => onToggleSelected(f.id)}
                            className="h-4 w-4 rounded border-input shrink-0"
                          />
                          <span className="flex-1 text-sm font-medium min-w-0 truncate">
                            {f.farmer_code} — {f.name}
                          </span>
                          {f.FarmerAddress?.village && (
                            <span className="text-sm text-muted-foreground shrink-0 truncate max-w-[120px]">
                              {f.FarmerAddress.village}
                            </span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <div className="px-6 pb-6 pt-0 space-y-4 flex-shrink-0 border-t border-border pt-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Assign to field officer</Label>
              <Select value={agentId} onValueChange={onAgentIdChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field officer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (unassign)</SelectItem>
                  {officers.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.email ?? o.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {submitError && (
              <p className="text-sm text-destructive">{submitError.message}</p>
            )}
            <DialogFooter className="p-0 justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={selectedIds.size === 0} loading={isSubmitting}>
                Assign {selectedIds.size} farmer(s)
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
