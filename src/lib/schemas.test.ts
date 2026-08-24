import { describe, expect, it } from "vitest";
import { reservationSubmissionSchema, paymentCheckoutSchema } from "./schemas";

function validSubmission(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    submissionKey: "5b1f2a4a-6a5b-4b8a-9d1c-1a2b3c4d5e6f",
    serviceType: "hotel_hotel",
    originLocationId: "cun-airport",
    destinationLocationId: "zona-hotelera",
    originHotelId: "",
    originHotelName: "",
    destinationHotelId: "",
    destinationHotelName: "",
    direction: "sencillo",
    date: "2026-09-01",
    time: "14:30",
    returnDate: "",
    returnTime: "",
    passengers: 2,
    bags: 2,
    flightNumber: "",
    notes: "",
    contactName: "Jane Doe",
    contactEmail: "jane@example.com",
    contactPhone: "+52 998 123 4567",
    hotel: "",
    ...overrides,
  };
}

describe("reservationSubmissionSchema", () => {
  it("accepts a well-formed one-way submission", () => {
    const result = reservationSubmissionSchema.safeParse(validSubmission());
    expect(result.success).toBe(true);
  });

  it("rejects when origin and destination are the same", () => {
    const result = reservationSubmissionSchema.safeParse(
      validSubmission({ destinationLocationId: "cun-airport" }),
    );
    expect(result.success).toBe(false);
  });

  it("requires a return date and time for round trips", () => {
    const result = reservationSubmissionSchema.safeParse(
      validSubmission({ direction: "redondo", returnDate: "", returnTime: "" }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts a round trip with a valid return after the departure date", () => {
    const result = reservationSubmissionSchema.safeParse(
      validSubmission({ direction: "redondo", returnDate: "2026-09-03", returnTime: "10:00" }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects a return date earlier than the departure date", () => {
    const result = reservationSubmissionSchema.safeParse(
      validSubmission({ direction: "redondo", returnDate: "2026-08-30", returnTime: "10:00" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = reservationSubmissionSchema.safeParse(validSubmission({ contactEmail: "not-an-email" }));
    expect(result.success).toBe(false);
  });

  it("rejects a phone with letters", () => {
    const result = reservationSubmissionSchema.safeParse(validSubmission({ contactPhone: "abc123" }));
    expect(result.success).toBe(false);
  });

  it("rejects more than 60 passengers", () => {
    const result = reservationSubmissionSchema.safeParse(validSubmission({ passengers: 61 }));
    expect(result.success).toBe(false);
  });

  it("rejects a malformed date", () => {
    const result = reservationSubmissionSchema.safeParse(validSubmission({ date: "01-09-2026" }));
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid submissionKey (idempotency key)", () => {
    const result = reservationSubmissionSchema.safeParse(validSubmission({ submissionKey: "not-a-uuid" }));
    expect(result.success).toBe(false);
  });
});

describe("paymentCheckoutSchema", () => {
  it("accepts a valid uuid reference", () => {
    expect(
      paymentCheckoutSchema.safeParse({ reservationReference: "5b1f2a4a-6a5b-4b8a-9d1c-1a2b3c4d5e6f" }).success,
    ).toBe(true);
  });

  it("rejects a non-uuid reference", () => {
    expect(paymentCheckoutSchema.safeParse({ reservationReference: "abc" }).success).toBe(false);
  });
});
