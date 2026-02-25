import { Link } from "react-router-dom";
import { useAnalyticsSummary } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { Users, Upload, BarChart3 } from "lucide-react";

export function DashboardPage() {
  const { data: summary, isLoading, error } = useAnalyticsSummary();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your farmers and activity</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">Failed to load summary. You may need to re-login.</p>
      )}

      {isLoading ? (
        <PageLoader />
      ) : (
      <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.total_farmers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activated %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.activated_percent ?? 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC completion %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.kyc_completion_percent ?? 0}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/farmers">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Farmers</p>
                <p className="text-sm text-muted-foreground">View and manage farmers</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/csv-upload">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">CSV Upload</p>
                <p className="text-sm text-muted-foreground">Bulk upload farmers</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/analytics">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">Charts and reports</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      </>
      )}
    </div>
  );
}
