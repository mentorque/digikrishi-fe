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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useFieldOfficers, useCreateFieldOfficer } from "@/hooks/useFieldOfficers";
import { useAssignFarmerToAgent } from "@/hooks/useFarmers";
import { searchFarmers } from "@/api/search";
import { PageLoader } from "@/components/ui/loader";
import { AssignFarmersModal } from "@/components/AssignFarmersModal";
import { UserPlus, UserCog, Link2 } from "lucide-react";

export function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const isTenant = user?.role === "TENANT";

  const { data: officers = [], isLoading: officersLoading } = useFieldOfficers();
  const createMutation = useCreateFieldOfficer();
  const assignMutation = useAssignFarmerToAgent();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addOfficerModalOpen, setAddOfficerModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSearchQuery, setAssignSearchQuery] = useState("");
  const [assignSelectedIds, setAssignSelectedIds] = useState<Set<string>>(new Set());
  const [assignAgentId, setAssignAgentId] = useState<string>("__none__");

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["search", "assign-modal", assignSearchQuery],
    queryFn: () => searchFarmers(assignSearchQuery.trim(), 1, 80),
    enabled: assignModalOpen && assignSearchQuery.trim().length > 0,
  });
  const searchResults = searchData?.results ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword) return;
    createMutation.mutate(
      { email: newEmail.trim(), password: newPassword },
      {
        onSuccess: (data: { message?: string }) => {
          setNewEmail("");
          setNewPassword("");
          setAddOfficerModalOpen(false);
          toast.success(data?.message ?? "Field officer created");
        },
        onError: (err) => toast.error(getErrorMessage(err)),
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
      toast.success(`Assigned ${assignSelectedIds.size} farmer(s)`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openAssignModal = () => {
    setAssignModalOpen(true);
    setAssignSelectedIds(new Set());
    setAssignSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Field officers</h2>
          <p className="text-muted-foreground">
            Tenant: <span className="font-medium text-foreground">{user?.Tenant?.name ?? "—"}</span>. Manage field officers and assign farmers to them.
          </p>
        </div>
        {isTenant && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button onClick={() => setAddOfficerModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add field officer
            </Button>
            <Button onClick={openAssignModal} variant="outline">
              <Link2 className="mr-2 h-4 w-4" />
              Assign farmers
            </Button>
          </div>
        )}
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
            <PageLoader />
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

      {/* Add field officer modal */}
      <Dialog open={addOfficerModalOpen} onOpenChange={setAddOfficerModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add field officer
            </DialogTitle>
            <DialogDescription>
              Create a new field officer (agent) for your tenant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
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
            {createMutation.isError && (
              <p className="text-sm text-destructive">
                {getErrorMessage(createMutation.error)}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOfficerModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                Create field officer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AssignFarmersModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        officers={officers}
        searchQuery={assignSearchQuery}
        onSearchQueryChange={setAssignSearchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        selectedIds={assignSelectedIds}
        onToggleSelected={toggleAssignSelected}
        agentId={assignAgentId}
        onAgentIdChange={setAssignAgentId}
        onSubmit={handleAssignSubmit}
        isSubmitting={assignMutation.isPending}
        submitError={assignMutation.isError ? (assignMutation.error as Error) : null}
      />
    </div>
  );
}
