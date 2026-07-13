import {
  LayoutDashboard,
  Route,
  MapPinned,
  Car,
  Users,
  Fuel,
  Wrench,
  Bell,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/trips", label: "Servicios", icon: Route },
  { href: "/admin/monitoring", label: "Monitoreo", icon: MapPinned },
  { href: "/admin/vehicles", label: "Vehículos", icon: Car },
  { href: "/admin/drivers", label: "Conductores", icon: Users },
  { href: "/admin/fuel", label: "Combustible", icon: Fuel },
  { href: "/admin/maintenance", label: "Mantenimiento", icon: Wrench },
  { href: "/admin/alerts", label: "Alertas", icon: Bell },
  { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
];
