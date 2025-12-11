import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type LocationPayload = {
  name: string;
  address: string;
  category?: string;
  place_id?: string;
  photo?: string;
  latitude?: number | null;
  longitude?: number | null;
  website?: string;
  rating?: number;
  opening_hours?: string | null;
};

type BodyPayload = {
  updatedAt?: string;
  locations: LocationPayload[];
};

/**
 * GET — test endpoint
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, message: "db-init API online 🚀" },
    { status: 200 }
  );
}

/**
 * POST — salva nel DB
 */
export async function POST(req: NextRequest, context: any) {
  const env = context.env; // QUI C'È IL DATABASE BINDING
  let body: BodyPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.locations || !Array.isArray(body.locations)) {
    return NextResponse.json(
      { ok: false, error: "Missing locations array" },
      { status: 400 }
    );
  }

  // 👇 NON tipizziamo env.DB come D1Database (NON ESISTE in Next.js)
  const db = env.DB;
  const updatedAt = body.updatedAt ?? new Date().toISOString();

  const insert = db.prepare(`
      INSERT INTO locations (
        name, address, category, place_id, photo,
        latitude, longitude, website, rating, opening_hours, updatedAt
      )
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
      ON CONFLICT(place_id) DO UPDATE SET
        name = excluded.name,
        address = excluded.address,
        category = excluded.category,
        photo = excluded.photo,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        website = excluded.website,
        rating = excluded.rating,
        opening_hours = excluded.opening_hours,
        updatedAt = excluded.updatedAt
    `);

  let written = 0;

  for (const loc of body.locations) {
    if (!loc.name || !loc.address) continue;

    const latitude = loc.latitude ?? null;
    const longitude = loc.longitude ?? null;
    const hours = loc.opening_hours ?? null;

    try {
      await insert
        .bind(
          loc.name,
          loc.address,
          loc.category ?? null,
          loc.place_id ?? null,
          loc.photo ?? null,
          latitude,
          longitude,
          loc.website ?? null,
          loc.rating ?? null,
          hours,
          updatedAt
        )
        .run();

      written++;
    } catch (err) {
      console.error("❌ Insert error for:", loc.place_id, err);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      received: body.locations.length,
      written,
    },
    { status: 200 }
  );
}