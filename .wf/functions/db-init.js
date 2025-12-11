// .wf/functions/db-init.js

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB; // binding D1 configurato da Webflow

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body || !Array.isArray(body.locations)) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing locations array" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const updatedAt = body.updatedAt || new Date().toISOString();

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
    if (!loc || !loc.name || !loc.address) continue;

    const latitude =
      loc.latitude ?? loc.lat ?? null;
    const longitude =
      loc.longitude ?? loc.lng ?? null;
    const opening_hours =
      loc.opening_hours ?? loc.hours ?? null;

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