export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const body = await request.json();

    if (!Array.isArray(body.locations)) {
      return new Response("Invalid payload", { status: 400 });
    }

    const db = env.DB;

    await db.exec(`DELETE FROM locations`);

    const stmt = db.prepare(`
      INSERT INTO locations (name, address, lat, lng, category)
      VALUES (?, ?, ?, ?, ?)
    `);

    const tx = db.transaction();

    for (const l of body.locations) {
      tx.execute(stmt, [
        l.name,
        l.address,
        l.lat,
        l.lng,
        l.category
      ]);
    }

    await tx.commit();

    return Response.json({
      ok: true,
      inserted: body.locations.length
    });
  }
};