import type { MaintenanceRecord } from "@/types";

// 8 registros de mantenimiento mock.
export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  { id: "mnt-01", vehicleId: "veh-05", type: "servicio_mayor", currentKm: 98340, limitKm: 100000, scheduledDate: "2026-07-14", status: "en_proceso", estimatedCost: 8500, workshop: "Taller Central GreenGo", notes: "Cambio de banda de distribución y afinación mayor." },
  { id: "mnt-02", vehicleId: "veh-01", type: "preventivo", currentKm: 84250, limitKm: 90000, scheduledDate: "2026-07-20", status: "programado", estimatedCost: 2400, workshop: "Taller Central GreenGo", notes: "Cambio de aceite y filtros." },
  { id: "mnt-03", vehicleId: "veh-04", type: "frenos", currentKm: 156780, limitKm: 158000, scheduledDate: "2026-07-13", status: "programado", estimatedCost: 3200, workshop: "Frenos Express Cancún", notes: "Revisión de balatas y discos delanteros." },
  { id: "mnt-04", vehicleId: "veh-06", type: "correctivo", currentKm: 187650, limitKm: 188000, scheduledDate: "2026-07-10", status: "vencido", estimatedCost: 5600, workshop: "Taller Central GreenGo", notes: "Falla intermitente en sistema eléctrico." },
  { id: "mnt-05", vehicleId: "veh-03", type: "preventivo", currentKm: 45120, limitKm: 50000, scheduledDate: "2026-07-28", status: "programado", estimatedCost: 2600, workshop: "Taller Central GreenGo", notes: "Servicio de 50 mil km." },
  { id: "mnt-06", vehicleId: "veh-08", type: "llantas", currentKm: 76540, limitKm: 78000, scheduledDate: "2026-07-16", status: "programado", estimatedCost: 9800, workshop: "Llantas del Caribe", notes: "Reemplazo de 4 llantas." },
  { id: "mnt-07", vehicleId: "veh-02", type: "preventivo", currentKm: 121400, limitKm: 125000, scheduledDate: "2026-06-30", status: "completado", estimatedCost: 2400, workshop: "Taller Central GreenGo", notes: "Servicio completado sin observaciones." },
  { id: "mnt-08", vehicleId: "veh-07", type: "preventivo", currentKm: 12030, limitKm: 20000, scheduledDate: "2026-08-15", status: "programado", estimatedCost: 1800, workshop: "Taller Central GreenGo", notes: "Primer servicio de la unidad." },
];
