// src/app/api/db-init/route.ts
import type { NextRequest } from "next/server";

export const runtime = "edge";

type LocationPayload = {
  name: string;
  address: string;
  category?: string;
  place_id?: string;
  photo?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  rating?: number;
  opening_hours?: string;
};

type BodyPayload = {
  updatedAt?: string;
  locations: LocationPayload[];
};

export async function POST(req: NextRequest, { env }: any) {
  let body: BodyPayload;

  try {
    body = (await req.json()) as BodyPayload;
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body.locations || !Array.isArray(body.locations)) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing locations array" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const db = (env as any).DB as D1Database;
  const updatedAt = body.updatedAt ?? new Date().toISOString();

  const insertStmt = db.prepare(`
    INSERT INTO locations (
      name,
      address,
      category,
      place_id,
      photo,
      latitude,
      longitude,
      website,
      rating,
      opening_hours,
      updatedAt
    )
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
    ON CONFLICT(place_id) DO UPDATE SET
      name          = excluded.name,
      address       = excluded.address,
      category      = excluded.category,
      photo         = excluded.photo,
      latitude      = excluded.latitude,
      longitude     = excluded.longitude,
      website       = excluded.website,
      rating        = excluded.rating,
      opening_hours = excluded.opening_hours,
      updatedAt     = excluded.updatedAt
  `);

  let successCount = 0;

  for (const loc of body.locations) {
    if (!loc.name || !loc.address) continue;

    // fallback nel caso in futuro il JSON avesse lat/lng invece che latitude/longitude
    const latitude =
      (loc as any).latitude ?? (loc as any).lat ?? null;
    const longitude =
      (loc as any).longitude ?? (loc as any).lng ?? null;
    const opening_hours =
      (loc as any).opening_hours ?? (loc as any).hours ?? null;

    try {
      await insertStmt
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
          opening_hours,
          updatedAt
        )
        .run();
      successCount++;
    } catch (e) {
      console.error("DB insert error for place_id:", loc.place_id, e);
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      receivedCount: body.locations.length,
      writtenCount: successCount,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}