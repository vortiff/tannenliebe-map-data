export async function GET(request: Request, { env }) {
  try {
    // Create table if not exists
    const sql = `
      CREATE TABLE IF NOT EXISTS locations (
        place_id TEXT PRIMARY KEY,
        name TEXT,
        address TEXT,
        category TEXT,
        photo TEXT,
        lat REAL,
        lng REAL,
        website TEXT,
        rating REAL,
        hours TEXT,
        updated_at TEXT
      );
    `;

    await env.DB.exec(sql);

    return new Response("Database initialized!", { status: 200 });
  } catch (err) {
    return new Response("Error: " + String(err), { status: 500 });
  }
}