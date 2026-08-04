import type { DemoUser } from "@/types";

// Usuarios simulados. NO son credenciales reales: solo permiten cambiar de
// experiencia dentro del DEMO. No hay contraseñas ni autenticación.
export const MOCK_USERS: DemoUser[] = [
  {
    id: "usr-admin",
    name: "Laura Martínez",
    role: "administrador",
    email: "laura.martinez@greengo.demo",
    avatarColor: "#9DC52D",
  },
  {
    id: "usr-operador",
    name: "Carlos Méndez",
    role: "operador",
    email: "carlos.mendez@greengo.demo",
    avatarColor: "#94D9D9",
  },
  {
    id: "usr-conductor",
    name: "José Ramírez",
    role: "conductor",
    email: "jose.ramirez@greengo.demo",
    avatarColor: "#EAA33D",
    driverId: "drv-01",
  },
];

export const DEFAULT_DRIVER_ID = "drv-01";
