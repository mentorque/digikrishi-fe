import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useFieldOfficers, useCreateFieldOfficer } from "@/hooks/useFieldOfficers";
import { useAssignFarmerToAgent } from "@/hooks/useFarmers";
import { searchFarmers } from "@/api/search";
import { UserPlus, UserCog, Search } from "lucide-react";
import type { Farmer } from "@/types";

export function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const isTenant = user?.role === "TENANT";

  const { data: officers = [], isLoading: officersLoading } = useFieldOfficers();
  const createMutation = useCreateFieldOfficer();
  const assignMutation = useAssignFarmerToAgent();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSearchQuery, setAssignSearchQuery] = useState("");
  const [assignSelectedIds, setAssignSelectedIds] = useState<Set<string>>(new Set());
  const [assignAgentId, setAssignAgentId] = useState<string>("__none__");

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["search", "assign-modal", assignSearchQuery],
    queryFn: () => searchFarmers(assignSearchQuery.trim(), 1, 30),
    enabled: assignModalOpen && assignSearchQuery.trim().length > 0,
  });
  const searchResults = searchData?.results ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword) return;
    createMutation.mutate(
      { email: newEmail.trim(), password: newPassword },
      {
        onSuccess: () => {
          setNewEmail("");
          setNewPassword("");
        },
      }
    );
  };

  const toggleAssignSelected = (id: string) => {
    setAssignSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignSelectedIds.size === 0) return;
    const agentId = assignAgentId && assignAgentId !== "__none__" ? assignAgentId : null;
    try {
      for (const farmerId of assignSelectedIds) {
        await assignMutation.mutateAsync({ farmerId, agentId });
      }
      setAssignSelectedIds(new Set());
      setAssignModalOpen(false);
      setAssignSearchQuery("");
    } catch {
      // Error already shown by mutation
    }
  };

  const openAssignModal = () => {
    setAssignModalOpen(true);
    setAssignSelectedIds(new Set());
    setAssignSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Field officers</h2>
        <p className="text-muted-foreground">
          Tenant: <span className="font-medium text-foreground">{user?.Tenant?.name ?? "—"}</span>. Manage field officers and assign farmers to them.
        </p>
      </div>

      {/* List field officers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Field officers
          </CardTitle>
          <CardDescription>
            Agents linked to your tenant. Only tenants can add new officers and assign farmers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {officersLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading…</p>
          ) : officers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No field officers yet. Add one below (tenant only).
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.email ?? "—"}</TableCell>
                    <TableCell>{o.mobile ?? "—"}</TableCell>
                    <TableCell>
                      <span className={o.is_active ? "text-green-600" : "text-muted-foreground"}>
                        {o.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create field officer (tenant only) */}
      {isTenant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add field officer
            </CardTitle>
            <CardDescription>Create a new field officer (agent) for your tenant.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="fo-email">Email</Label>
                <Input
                  id="fo-email"
                  type="email"
                  placeholder="agent@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fo-password">Password</Label>
                <Input
                  id="fo-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create field officer"}
              </Button>
              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as Error).message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assign farmers to field officer (tenant only) */}
      {isTenant && (
        <Card>
          <CardHeader>
            <CardTitle>Assign farmers to field officer</CardTitle>
            <CardDescription>
              Open the modal to search for farmers and assign them to a field officer. Leave officer empty to unassign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openAssignModal}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign farmers
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Assign farmers to field officer</DialogTitle>
            <DialogDescription>
              Search for farmers, select one or more, then choose the field officer to assign (or None to unassign).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="grid gap-2 px-4">
              <Label htmlFor="assign-search">Search farmers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="assign-search"
                  type="search"
                  placeholder="Name, code, village…"
                  value={assignSearchQuery}
                  onChange={(e) => setAssignSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
            <div className="grid gap-2 px-4 flex-1 min-h-0 overflow-hidden flex flex-col">
              <Label>Select farmers</Label>
              <div className="border border-border rounded-md overflow-auto max-h-48 bg-muted/30">
                {assignSearchQuery.trim().length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Type above to search for farmers.</p>
                ) : searchLoading ? (
                  <p className="p-4 text-sm text-muted-foreground">Searching…</p>
                ) : searchResults.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No farmers found.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {searchResults.map((f: Farmer) => (
                      <li key={f.id} className="flex items-center gap-2 p-2 hover:bg-muted/50">
                        <input
                          type="checkbox"
                          id={`assign-${f.id}`}
                          checked={assignSelectedIds.has(f.id)}
                          onChange={() => toggleAssignSelected(f.id)}
                          className="rounded border-input"
                        />
                        <label htmlFor={`assign-${f.id}`} className="flex-1 cursor-pointer text-sm">
                          {f.farmer_code} — {f.name}
                          {f.FarmerAddress?.village ? ` (${f.FarmerAddress.village})` : ""}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="grid gap-2 px-4">
              <Label>Assign to field officer</Label>
              <Select value={assignAgentId} onValueChange={setAssignAgentId}>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignMutation.isPending || assignSelectedIds.size === 0}>
                {assignMutation.isPending ? "Assigning…" : `Assign ${assignSelectedIds.size} farmer(s)`}
              </Button>
            </DialogFooter>
          </form>
          {assignMutation.isError && (
            <p className="text-sm text-destructive px-4 pb-2">
              {(assignMutation.error as Error).message}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
