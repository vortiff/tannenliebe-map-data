export async function onRequest(context) {
  const db = context.env.DB;

  let payload;

  try {
    payload = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const locations = payload.locations || [];
  const updatedAt = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO locations (
      name, address, category, place_id, photo,
      latitude, longitude, website, rating,
      opening_hours, updatedAt
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

  let count = 0;

  for (const loc of locations) {
    await insert
      .bind(
        loc.name,
        loc.address,
        loc.category ?? null,
        loc.place_id ?? null,
        loc.photo ?? null,
        Number(loc.latitude) || null,
        Number(loc.longitude) || null,
        loc.website ?? null,
        loc.rating ?? null,
        Array.isArray(loc.opening_hours)
          ? JSON.stringify(loc.opening_hours)
          : loc.opening_hours ?? null,
        updatedAt
      )
      .run();
    count++;
  }

  return new Response(JSON.stringify({ ok: true, written: count }), {
    headers: { "Content-Type": "application/json" },
  });
}