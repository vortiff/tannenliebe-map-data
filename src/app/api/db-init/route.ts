import type { NextRequest } from "next/server";
import getWebflowBinding from "../../../../webflow-loader";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type LocationPayload = {
  name: string;
  address: string;
  category?: string;
  place_id?: string;
  photo?: string;
  latitude?: number | string;
  longitude?: number | string;
  website?: string;
  rating?: number | string;
  opening_hours?: string | string[];
};

type BodyPayload = {
  updatedAt?: string;
  locations: LocationPayload[];
};

export async function POST(req: NextRequest, context: any) {
  // ✅ CARICA I BINDING (incluso DB)
  const env = getWebflowBinding(context);
  const db = env.DB;

  let body: BodyPayload;

  try {
    body = (await req.json()) as BodyPayload;
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.locations || !Array.isArray(body.locations)) {
    return new Response(JSON.stringify({ ok: false, error: "Missing locations" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  let successCount = 0;

  for (const loc of body.locations) {
    if (!loc.name || !loc.address) continue;

    const latitude = Number(loc.latitude ?? (loc as any).lat) || null;
    const longitude = Number(loc.longitude ?? (loc as any).lng) || null;

    const opening_hours = Array.isArray(loc.opening_hours)
      ? JSON.stringify(loc.opening_hours)
      : loc.opening_hours ?? null;

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
      console.error("DB insert error:", e);
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      writtenCount: successCount,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}