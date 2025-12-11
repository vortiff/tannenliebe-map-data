// src/app/api/db-init/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /tannenliebe-map/api/db-init
 * Solo per test: ti dice se la route è viva.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "db-init API è online 🚀",
    },
    { status: 200 }
  );
}

/**
 * POST /tannenliebe-map/api/db-init
 * Qui in futuro riceveremo il JSON da Google Sheet e
 * lo salveremo nel database Webflow Cloud.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Per ora facciamo solo logging. Più avanti:
    // - validiamo il payload
    // - lo salviamo nel DB (D1 + Drizzle)
    console.log("📥 Payload ricevuto da Google Sheet:", body);

    return NextResponse.json(
      {
        ok: true,
        receivedCount: Array.isArray(body?.locations)
          ? body.locations.length
          : undefined,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Errore nel POST /api/db-init:", err);
    return NextResponse.json(
      { ok: false, error: "Payload non valido" },
      { status: 400 }
    );
  }
}