import type { UserRole } from "@/types";

export type AdminPermission =
  | "admin:create"
  | "admin:update"
  | "admin:delete"
  | "admin:validate"
  | "admin:reset";

const ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  administrador: ["admin:create", "admin:update", "admin:delete", "admin:validate", "admin:reset"],
  operador: ["admin:create", "admin:update", "admin:validate"],
  conductor: [],
};

export function hasAdminPermission(role: UserRole | undefined, permission: AdminPermission) {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionLabel(permission: AdminPermission) {
  switch (permission) {
    case "admin:create":
      return "crear registros";
    case "admin:update":
      return "editar registros";
    case "admin:delete":
      return "eliminar registros";
    case "admin:validate":
      return "validar registros";
    case "admin:reset":
      return "restablecer el DEMO";
  }
}

export function rolePermissionSummary(role: UserRole | undefined) {
  if (!role) return "Sin permisos administrativos";
  if (role === "administrador") return "Puede crear, editar, eliminar y restablecer datos.";
  if (role === "operador") return "Puede crear, editar y validar. No elimina datos.";
  return "Acceso operativo de conductor. Sin gestión administrativa.";
}
