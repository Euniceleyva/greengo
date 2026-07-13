import { Badge } from "@/components/ui/badge";
import {
  TRIP_STATUS_LABELS,
  TRIP_STATUS_TONE,
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_TONE,
  DRIVER_STATUS_LABELS,
  DRIVER_STATUS_TONE,
  ALERT_PRIORITY_LABELS,
  ALERT_PRIORITY_TONE,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_TONE,
  FUEL_VALIDATION_LABELS,
  FUEL_VALIDATION_TONE,
} from "@/constants";
import type {
  AlertPriority,
  DriverStatus,
  FuelValidation,
  MaintenanceStatus,
  TripStatus,
  VehicleStatus,
} from "@/types";

export const TripStatusBadge = ({ status }: { status: TripStatus }) => (
  <Badge tone={TRIP_STATUS_TONE[status]}>{TRIP_STATUS_LABELS[status]}</Badge>
);

export const VehicleStatusBadge = ({ status }: { status: VehicleStatus }) => (
  <Badge tone={VEHICLE_STATUS_TONE[status]}>{VEHICLE_STATUS_LABELS[status]}</Badge>
);

export const DriverStatusBadge = ({ status }: { status: DriverStatus }) => (
  <Badge tone={DRIVER_STATUS_TONE[status]}>{DRIVER_STATUS_LABELS[status]}</Badge>
);

export const AlertPriorityBadge = ({ priority }: { priority: AlertPriority }) => (
  <Badge tone={ALERT_PRIORITY_TONE[priority]}>{ALERT_PRIORITY_LABELS[priority]}</Badge>
);

export const MaintenanceStatusBadge = ({ status }: { status: MaintenanceStatus }) => (
  <Badge tone={MAINTENANCE_STATUS_TONE[status]}>{MAINTENANCE_STATUS_LABELS[status]}</Badge>
);

export const FuelValidationBadge = ({ status }: { status: FuelValidation }) => (
  <Badge tone={FUEL_VALIDATION_TONE[status]}>{FUEL_VALIDATION_LABELS[status]}</Badge>
);
