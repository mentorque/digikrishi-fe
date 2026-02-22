import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Account and application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium text-muted-foreground">Email:</span> {user?.email ?? "—"}</p>
          <p><span className="font-medium text-muted-foreground">Mobile:</span> {user?.mobile ?? "—"}</p>
          <p><span className="font-medium text-muted-foreground">Role:</span> {user?.role ?? "—"}</p>
          <p><span className="font-medium text-muted-foreground">Tenant:</span> {user?.Tenant?.name ?? "—"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
