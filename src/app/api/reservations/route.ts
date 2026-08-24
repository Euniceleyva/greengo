import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { reservationSubmissionSchema } from "@/lib/schemas";
import { createReservation } from "@/lib/reservations/create-reservation";
import { PayloadTooLargeError, rateLimitResponse, readJsonBody } from "@/lib/http-guards";

const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "reservations:create", 8, 300);
  if (limited) return limited;

  try {
    const body = await readJsonBody(request, MAX_BODY_BYTES);
    const payload = reservationSubmissionSchema.parse(body);
    const reservation = await createReservation(payload);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: error.message }, { status: 413 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Revisa los datos de la reservación.", fields: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Unable to create reservation", error instanceof Error ? error.message : error);
    const message =
      error instanceof Error && error.message.includes("no está disponible")
        ? error.message
        : "No pudimos registrar la reservación. Inténtalo nuevamente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
