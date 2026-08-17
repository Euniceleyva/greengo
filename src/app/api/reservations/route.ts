import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { reservationSubmissionSchema } from "@/lib/schemas";
import { createReservation } from "@/lib/reservations/create-reservation";

export async function POST(request: Request) {
  try {
    const payload = reservationSubmissionSchema.parse(await request.json());
    const reservation = await createReservation(payload);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Revisa los datos de la reservación.", fields: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Unable to create reservation", error);
    const message =
      error instanceof Error && error.message.includes("no está disponible")
        ? error.message
        : "No pudimos registrar la reservación. Inténtalo nuevamente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
