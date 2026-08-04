import {
  Gauge,
  Route,
  Radar,
  BusFront,
  UserRoundCheck,
  Fuel,
  Wrench,
  ShieldAlert,
  ChartNoAxesCombined,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/admin/trips", label: "Servicios", icon: Route },
  { href: "/admin/monitoring", label: "Monitoreo", icon: Radar },
  { href: "/admin/vehicles", label: "Vehículos", icon: BusFront },
  { href: "/admin/drivers", label: "Conductores", icon: UserRoundCheck },
  { href: "/admin/fuel", label: "Combustible", icon: Fuel },
  { href: "/admin/maintenance", label: "Mantenimiento", icon: Wrench },
  { href: "/admin/alerts", label: "Alertas", icon: ShieldAlert },
  { href: "/admin/reports", label: "Reportes", icon: ChartNoAxesCombined },
];

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Operación",
    items: [ADMIN_NAV[0], ADMIN_NAV[1], ADMIN_NAV[2]],
  },
  {
    label: "Flota",
    items: [ADMIN_NAV[3], ADMIN_NAV[4], ADMIN_NAV[5], ADMIN_NAV[6]],
  },
  {
    label: "Gestión",
    items: [ADMIN_NAV[7], ADMIN_NAV[8]],
  },
];
