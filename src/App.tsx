import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageLoader } from "@/components/ui/loader";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { FarmersPage } from "@/pages/FarmersPage";
import { FarmerNewPage } from "@/pages/FarmerNewPage";
import { FarmerDetailPage } from "@/pages/FarmerDetailPage";
import { CsvUploadPage } from "@/pages/CsvUploadPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { UsersPage } from "@/pages/UsersPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Toaster } from "sonner";

function AuthListener() {
  useEffect(() => {
    const handleLogout = () => useAuthStore.getState().logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);
  return null;
}

function ProtectedRoutes() {
  return (
    <RoleGuard allowedRoles={["TENANT", "FIELD_OFFICER"]}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="farmers" element={<FarmersPage />} />
          <Route path="farmers/new" element={<FarmerNewPage />} />
          <Route path="farmers/:id" element={<FarmerDetailPage />} />
          <Route
            path="csv-upload"
            element={
              <RoleGuard allowedRoles={["TENANT"]}>
                <CsvUploadPage />
              </RoleGuard>
            }
          />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </RoleGuard>
  );
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <PageLoader />
    </div>
  );
}

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <AuthListener />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={user ? <ProtectedRoutes /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}
