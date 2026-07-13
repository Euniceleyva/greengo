"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fuel } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { useActiveDriverId } from "@/lib/use-active-driver";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { PhotoInput } from "@/components/driver/photo-input";
import { toast } from "@/components/ui/toast";
import { fuelSchema, type FuelFormValues } from "@/lib/schemas";
import { formatMXN } from "@/lib/utils";
import { formatDate } from "@/lib/format";

export default function DriverFuelPage() {
  const hydrated = useHydrated();
  const driverId = useActiveDriverId();
  const { vehicles, drivers, fuel, addFuelRecord } = useDemoStore();

  const driver = drivers.find((d) => d.id === driverId);
  const defaultVehicle = driver?.assignedVehicleId ?? "";

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FuelFormValues>({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      vehicleId: defaultVehicle,
      liters: 0,
      pricePerLiter: 24,
      odometerKm: 0,
      station: "",
      paymentMethod: "tarjeta_flota",
      comments: "",
    },
  });

  const liters = Number(watch("liters")) || 0;
  const price = Number(watch("pricePerLiter")) || 0;
  const total = liters * price;

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const myRecords = fuel.filter((f) => f.driverId === driverId).slice(0, 4);

  const onSubmit = (values: FuelFormValues) => {
    addFuelRecord({
      vehicleId: values.vehicleId,
      driverId,
      date: new Date().toISOString(),
      liters: values.liters,
      pricePerLiter: values.pricePerLiter,
      total: values.liters * values.pricePerLiter,
      odometerKm: values.odometerKm,
      station: values.station,
      paymentMethod: values.paymentMethod,
      performanceKmL: null,
      validation: "pendiente",
      hasTicket: true,
    });
    toast.success("Carga de gasolina registrada.");
    reset({ ...values, liters: 0, station: "", comments: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Fuel className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Registrar gasolina</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label className="mb-1 block">Unidad</Label>
              <Select {...register("vehicleId")}>
                <option value="">Selecciona…</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.code} · {v.plates}</option>
                ))}
              </Select>
              {errors.vehicleId && <p className="mt-1 text-xs text-destructive">{errors.vehicleId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Litros</Label>
                <Input type="number" step="0.1" inputMode="decimal" {...register("liters")} />
                {errors.liters && <p className="mt-1 text-xs text-destructive">{errors.liters.message}</p>}
              </div>
              <div>
                <Label className="mb-1 block">Precio por litro</Label>
                <Input type="number" step="0.1" inputMode="decimal" {...register("pricePerLiter")} />
                {errors.pricePerLiter && <p className="mt-1 text-xs text-destructive">{errors.pricePerLiter.message}</p>}
              </div>
            </div>

            <div className="rounded-md bg-secondary p-3 text-center">
              <p className="text-xs text-muted-foreground">Total estimado</p>
              <p className="text-xl font-bold">{formatMXN(total)}</p>
            </div>

            <div>
              <Label className="mb-1 block">Kilometraje</Label>
              <Input type="number" inputMode="numeric" {...register("odometerKm")} />
              {errors.odometerKm && <p className="mt-1 text-xs text-destructive">{errors.odometerKm.message}</p>}
            </div>

            <div>
              <Label className="mb-1 block">Estación</Label>
              <Input {...register("station")} placeholder="Pemex Av. Tulum" />
              {errors.station && <p className="mt-1 text-xs text-destructive">{errors.station.message}</p>}
            </div>

            <div>
              <Label className="mb-1 block">Método de pago</Label>
              <Select {...register("paymentMethod")}>
                <option value="tarjeta_flota">Tarjeta de flota</option>
                <option value="efectivo">Efectivo</option>
                <option value="vale">Vale</option>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block">Imagen del ticket</Label>
              <PhotoInput label="Adjuntar ticket" />
            </div>

            <div>
              <Label className="mb-1 block">Comentarios</Label>
              <Textarea {...register("comments")} placeholder="Opcional" />
            </div>

            <Button type="submit" className="h-11 w-full">Registrar carga</Button>
          </form>
        </CardContent>
      </Card>

      {myRecords.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Mis cargas recientes</h2>
          <div className="space-y-2">
            {myRecords.map((f) => (
              <Card key={f.id}>
                <CardContent className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p className="font-medium">{vehicles.find((v) => v.id === f.vehicleId)?.code}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(f.date, "dd MMM · HH:mm")} · {f.station}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{f.liters} L</p>
                    <p className="text-xs text-muted-foreground">{formatMXN(f.total)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
