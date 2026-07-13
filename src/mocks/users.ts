import type { DemoUser } from "@/types";

// Usuarios simulados. NO son credenciales reales: solo permiten cambiar de
// experiencia dentro del DEMO. No hay contraseñas ni autenticación.
export const MOCK_USERS: DemoUser[] = [
  {
    id: "usr-admin",
    name: "Laura Martínez",
    role: "administrador",
    email: "laura.martinez@greengo.demo",
    avatarColor: "#2563eb",
  },
  {
    id: "usr-operador",
    name: "Carlos Méndez",
    role: "operador",
    email: "carlos.mendez@greengo.demo",
    avatarColor: "#7c3aed",
  },
  {
    id: "usr-conductor",
    name: "José Ramírez",
    role: "conductor",
    email: "jose.ramirez@greengo.demo",
    avatarColor: "#16a34a",
    driverId: "drv-01",
  },
];

export const DEFAULT_DRIVER_ID = "drv-01";
