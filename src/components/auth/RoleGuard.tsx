import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "@/types";
import { useAuthStore } from "@/stores/authStore";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const location = useLocation();
  const role = useAuthStore((s) => s.role);

  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
