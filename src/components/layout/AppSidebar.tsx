import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Upload,
  BarChart3,
  UserCog,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/farmers", label: "Farmers", icon: Users },
  { to: "/csv-upload", label: "CSV Upload", icon: Upload },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/users", label: "Field Officers", icon: UserCog },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const role = useAuthStore((s) => s.role);

  const filteredNav =
    role === "TENANT"
      ? navItems
      : navItems.filter(
          (item) =>
            item.to !== "/csv-upload" &&
            item.to !== "/users"
        );

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        sidebarOpen ? "w-56" : "w-16"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <img src="/digi-prishi-logo.webp" alt="" className="h-12 w-12 shrink-0 rounded-xl object-contain" aria-hidden />
        {sidebarOpen && (
          <span className="truncate font-semibold text-sidebar-foreground">
            Kheti Buddy
          </span>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !sidebarOpen && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
